import { chromium } from 'playwright'
import fs from 'fs'

const routes = JSON.parse(fs.readFileSync('tools/routes.json', 'utf8'))
const ORIGIN = 'https://www.heidihealth.com'

const extract = () => {
  const px = (v) => Math.round(parseFloat(v) || 0)
  const seen = new Set()
  const textOf = (e) => (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim()

  // Bands, not <section>s. Every live page is a flat list of bands: a wrapper
  // holding an absolutely-positioned background layer (colour / pattern /
  // photo) plus, usually, a <section> with the content. Some bands — logo
  // marquees, trust badges, the Specialists template grid — have no <section>
  // at all, so walking <section>s alone silently dropped them.
  const root = document.querySelector('main') || document.body
  const first = root.querySelector('section')
  let bandEl = first
  while (bandEl && bandEl.parentElement !== root && bandEl.parentElement.querySelectorAll('section').length === 1) bandEl = bandEl.parentElement
  const parent = bandEl ? bandEl.parentElement : root
  let sections = [...parent.children].filter((c) => !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(c.tagName) && c.getBoundingClientRect().height > 40)
  if (sections.length < 2) sections = [...root.querySelectorAll('section')].filter((s) => !s.parentElement.closest('section'))

  const bgLayer = (band) => {
    const layer = [...band.querySelectorAll('div')].find((d) => {
      const c = getComputedStyle(d)
      return c.position === 'absolute' && (c.zIndex === '-10' || String(d.className).includes('-z-10')) && d.getBoundingClientRect().height > 100
    })
    if (!layer) return null
    const paint = [layer, ...layer.querySelectorAll('*')].find((e) => {
      const c = getComputedStyle(e)
      return c.backgroundColor !== 'rgba(0, 0, 0, 0)' || c.backgroundImage !== 'none' || e.tagName === 'IMG' || e.tagName === 'svg'
    })
    if (!paint) return null
    const c = getComputedStyle(paint)
    const r = paint.getBoundingClientRect(), br = band.getBoundingClientRect()
    return {
      color: c.backgroundColor !== 'rgba(0, 0, 0, 0)' ? c.backgroundColor : null,
      image: paint.tagName === 'IMG' ? paint.currentSrc || paint.src : (c.backgroundImage.match(/url\("?([^")]+)"?\)/) || [])[1] || null,
      svg: paint.tagName === 'svg' ? paint.outerHTML.slice(0, 20000) : null,
      radius: c.borderRadius,
      inset: { x: Math.round(r.x - br.x), w: Math.round(r.width), h: Math.round(r.height) },
    }
  }

  const blocks = (sec) => {
    const out = []
    const walk = (node) => {
      for (const e of node.children) {
        const r = e.getBoundingClientRect()
        if (!r.width && e.tagName !== 'IMG') continue
        const cs = getComputedStyle(e)
        if (cs.display === 'none') continue
        const t = e.tagName
        if (/^H[1-6]$/.test(t)) {
          const tx = textOf(e)
          if (tx && !seen.has('h' + tx)) { seen.add('h' + tx); out.push({ k: 'h', lvl: +t[1], t: tx, fs: px(cs.fontSize), ff: cs.fontFamily.split(',')[0].replace(/"/g, ''), ta: cs.textAlign }) }
          continue
        }
        if (t === 'P' || t === 'SPAN') {
          if (e.querySelector('p,h1,h2,h3,a,img,button')) { walk(e); continue }
          const tx = textOf(e)
          if (tx && tx.length > 1 && !seen.has('p' + tx)) { seen.add('p' + tx); out.push({ k: 'p', t: tx, fs: px(cs.fontSize), c: cs.color }) }
          continue
        }
        if (t === 'A' || t === 'BUTTON') {
          const tx = textOf(e)
          const href = e.getAttribute('href')
          if (tx && !seen.has('a' + tx + href)) {
            seen.add('a' + tx + href)
            out.push({ k: 'a', t: tx, href, bg: cs.backgroundColor, c: cs.color, r: cs.borderRadius, bd: cs.borderTopWidth !== '0px' ? cs.borderTopColor : null })
          }
          if (e.querySelector('img')) walk(e)
          continue
        }
        if (t === 'IMG') {
          const src = e.currentSrc || e.src
          if (src && !seen.has('i' + src)) { seen.add('i' + src); out.push({ k: 'img', src, alt: e.alt || '', w: Math.round(r.width), h: Math.round(r.height) }) }
          continue
        }
        if (t === 'VIDEO') { out.push({ k: 'video', src: e.currentSrc || e.src || e.querySelector('source')?.src || '' }); continue }
        if (t === 'SVG' || t === 'svg') continue
        walk(e)
      }
    }
    walk(sec)
    return out
  }

  return sections.map((sec, i) => {
    const r = sec.getBoundingClientRect()
    const cs = getComputedStyle(sec)
    const inner = sec.tagName === 'SECTION' ? sec : sec.querySelector('section')
    const ic = inner ? getComputedStyle(inner) : cs
    return {
      i, tag: sec.tagName, id: sec.id || inner?.id || null,
      cls: String((inner || sec).className).slice(0, 120),
      bg: inner && ic.backgroundColor !== 'rgba(0, 0, 0, 0)' ? ic.backgroundColor : cs.backgroundColor,
      layer: bgLayer(sec),
      ink: ic.color,
      h: Math.round(r.height), innerH: inner ? Math.round(inner.getBoundingClientRect().height) : null,
      blocks: blocks(sec),
    }
  }).filter((s) => s.blocks.length)
}

const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } })
for (const route of routes) {
  const out = `${process.env.OUT_DIR || 'src/data/pages'}/${route.slug}.json`
  if (fs.existsSync(out)) { console.log('skip', route.slug); continue }
  const p = await ctx.newPage()
  try {
    const resp = await p.goto(ORIGIN + route.url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await p.waitForTimeout(2500)
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 800) { scrollTo(0, y); await new Promise(r => setTimeout(r, 90)) } scrollTo(0, 0) })
    await p.waitForTimeout(1200)
    const data = await p.evaluate(extract)
    const meta = await p.evaluate(() => ({ title: document.title, desc: document.querySelector('meta[name=description]')?.content || '' }))
    fs.writeFileSync(out, JSON.stringify({ ...route, status: resp.status(), meta, sections: data }, null, 1))
    console.log('OK', route.slug, resp.status(), data.length, 'sections')
  } catch (e) {
    console.log('FAIL', route.slug, e.message.split('\n')[0])
    fs.writeFileSync(out, JSON.stringify({ ...route, status: 0, error: e.message.split('\n')[0], sections: [] }, null, 1))
  }
  await p.close()
}
await b.close()
console.log('DONE')
