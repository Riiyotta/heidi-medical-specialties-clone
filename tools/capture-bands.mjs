// Deep per-band capture for hand-building a page against live.
// usage: node tools/capture-bands.mjs <slug> </en-gb/path>
// Writes src/data/bands/<slug>.json and public/assets/bands/<slug>/v<band>-<n>.png
// For each band: text leaves (with computed type + box relative to band),
// links (painted style), images, lucide icons, and 2x screenshots of "visual"
// regions — big containers holding no heading/paragraph copy of the band
// (client-rendered mockups, device shots) — so copy stays real HTML while
// mockups come across pixel-exact.
import { chromium } from 'playwright'
import fs from 'fs'
const [slug, url] = process.argv.slice(2)
const dir = `public/assets/bands/${slug}`
fs.mkdirSync(dir, { recursive: true })
fs.mkdirSync('src/data/bands', { recursive: true })
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
const p = await ctx.newPage()
await p.goto('https://www.heidihealth.com' + url, { waitUntil: 'domcontentloaded', timeout: 60000 })
await p.waitForTimeout(3000)
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) } scrollTo(0, 0) })
await p.waitForTimeout(1200)
await p.addStyleTag({ content: 'header, .download-drawer-shell { visibility: hidden !important }' })

const bands = await p.evaluate(() => {
  const root = document.querySelector('main')
  let el = root.querySelector('section')
  while (el && el.parentElement !== root && el.parentElement.querySelectorAll('section').length === 1) el = el.parentElement
  const kids = [...el.parentElement.children].filter((c) => !['SCRIPT', 'STYLE'].includes(c.tagName) && c.getBoundingClientRect().height > 40)
  const TEXT = 'h1,h2,h3,h4,h5,h6,p,li,span,a,button,label,strong,em,blockquote,figcaption,dt,dd,td,th'
  return kids.map((band, bi) => {
    band.setAttribute('data-cb', bi)
    const br = band.getBoundingClientRect()
    const rel = (r) => ({ x: Math.round(r.x - br.x), y: Math.round(r.y - br.y), w: Math.round(r.width), h: Math.round(r.height) })
    const sty = (e) => { const c = getComputedStyle(e); return { ff: c.fontFamily.split(',')[0].replace(/"/g, ''), fs: parseFloat(c.fontSize), lh: c.lineHeight, ls: c.letterSpacing, fw: c.fontWeight, fst: c.fontStyle, fg: c.color, ta: c.textAlign } }
    const seen = new Set()
    const texts = [...band.querySelectorAll(TEXT)].filter((e) => {
      const r = e.getBoundingClientRect()
      if (!r.width || getComputedStyle(e).visibility === 'hidden' || +getComputedStyle(e).opacity === 0) return false
      const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
      return own
    }).map((e) => ({ tag: e.tagName.toLowerCase(), t: e.innerText.replace(/\s+/g, ' ').trim(), html: /<(em|i|strong|b|a)\b/.test(e.innerHTML) ? e.innerHTML.replace(/ (class|style|data-[\w-]+)="[^"]*"/g, '') : undefined, ...sty(e), box: rel(e.getBoundingClientRect()) }))
      .filter((x) => x.t && !seen.has(x.t + x.box.y) && seen.add(x.t + x.box.y))
    const links = [...band.querySelectorAll('a,button')].filter((a) => a.innerText.trim() && a.getBoundingClientRect().width).map((a) => {
      const paint = [a, ...a.querySelectorAll('*')].find((e) => { const c = getComputedStyle(e); return c.backgroundColor !== 'rgba(0, 0, 0, 0)' || c.borderTopWidth !== '0px' }) || a
      const c = getComputedStyle(paint); const svg = a.querySelector('svg')
      const icon = svg ? String(svg.className.baseVal || '').split(' ').find((x) => x.startsWith('lucide-')) : null
      return { t: a.innerText.replace(/\s+/g, ' ').trim(), href: a.getAttribute('href'), tag: a.tagName.toLowerCase(), bg: c.backgroundColor, fg: c.color, bd: c.borderTopWidth !== '0px' ? c.borderTopWidth + ' ' + c.borderTopColor : null, r: c.borderRadius, pad: c.padding, icon: icon ? icon.replace('lucide-', '') : svg ? 'svg' : null, iconBefore: svg ? svg.compareDocumentPosition(a.firstChild) & 2 ? false : a.innerText && svg.getBoundingClientRect().x < paint.getBoundingClientRect().x + 30 : null, box: rel(paint.getBoundingClientRect()) }
    })
    const imgs = [...band.querySelectorAll('img')].filter((i) => i.getBoundingClientRect().width > 8).map((i) => ({ src: i.currentSrc || i.src, alt: i.alt, box: rel(i.getBoundingClientRect()) }))
    const icons = [...band.querySelectorAll('svg')].map((s) => ({ name: (String(s.className.baseVal || '').split(' ').find((x) => x.startsWith('lucide-')) || '').replace('lucide-', ''), box: rel(s.getBoundingClientRect()), fg: getComputedStyle(s).color, sw: getComputedStyle(s).strokeWidth })).filter((s) => s.name && s.box.w)
    // panels: painted containers (bg or radius) inside the band
    const panels = [...band.querySelectorAll('div,section,article,li,figure')].filter((d) => { const c = getComputedStyle(d); const r = d.getBoundingClientRect(); return r.width > 120 && r.height > 60 && (c.backgroundColor !== 'rgba(0, 0, 0, 0)' || c.borderTopWidth !== '0px' || c.backgroundImage !== 'none') }).slice(0, 40).map((d) => { const c = getComputedStyle(d); return { bg: c.backgroundColor, bgi: c.backgroundImage !== 'none' ? c.backgroundImage.slice(0, 80) : null, bd: c.borderTopWidth !== '0px' ? c.borderTopWidth + ' ' + c.borderTopColor : null, r: c.borderRadius, pad: c.padding, shadow: c.boxShadow !== 'none' ? c.boxShadow.slice(0, 60) : null, box: rel(d.getBoundingClientRect()) } })
    // visual regions: >= 200x150 elements whose subtree holds no h1-h3 and no copy <p> of >40 chars, outermost only
    const isCopy = (e) => e.querySelector('h1,h2,h3') || [...e.querySelectorAll('p')].some((x) => x.innerText.trim().length > 60 && getComputedStyle(x).fontSize !== '12px')
    const cand = [...band.querySelectorAll('div,img,figure,video,iframe,picture')].filter((d) => { const r = d.getBoundingClientRect(); return r.width >= 200 && r.height >= 150 && r.width < br.width * 0.98 && !isCopy(d) })
    const visuals = cand.filter((d) => !cand.some((o) => o !== d && o.contains(d)))
    visuals.forEach((v, k) => v.setAttribute('data-cbv', `${bi}-${k}`))
    const lc = getComputedStyle(band.querySelector('[class*="-z-10"]')?.querySelector('*') || band)
    const sec = band.tagName === 'SECTION' ? band : band.querySelector('section')
    return { i: bi, box: { w: Math.round(br.width), h: Math.round(br.height) }, secBox: sec ? rel(sec.getBoundingClientRect()) : null, secCls: sec ? String(sec.className) : null, texts, links, imgs, icons, panels, visuals: visuals.map((v, k) => ({ id: `${bi}-${k}`, tag: v.tagName.toLowerCase(), box: rel(v.getBoundingClientRect()), r: getComputedStyle(v).borderRadius, src: v.tagName === 'IFRAME' || v.tagName === 'VIDEO' ? v.getAttribute('src') || v.querySelector('source')?.getAttribute('src') : undefined })) }
  })
})
for (const band of bands) {
  for (const v of band.visuals) {
    if (v.tag === 'iframe') continue
    const el = p.locator(`[data-cbv="${v.id}"]`)
    try { await el.scrollIntoViewIfNeeded({ timeout: 3000 }); await p.waitForTimeout(700); await el.screenshot({ path: `${dir}/v${v.id}.png`, animations: 'disabled', timeout: 8000 }); v.file = `/assets/bands/${slug}/v${v.id}.png` } catch (e) { v.err = e.message.split('\n')[0] }
  }
  const el = p.locator(`[data-cb="${band.i}"]`)
  await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(400)
  await el.screenshot({ path: `/tmp/${slug}-ref${band.i}.png`, animations: 'disabled' })
}
fs.writeFileSync(`src/data/bands/${slug}.json`, JSON.stringify(bands, null, 1))
for (const band of bands) console.log(`#${band.i} ${band.box.w}x${band.box.h} texts=${band.texts.length} links=${band.links.length} imgs=${band.imgs.length} icons=${band.icons.length} visuals=${band.visuals.map((v) => v.box.w + 'x' + v.box.h + (v.err ? '!' : '')).join(',')} | ${(band.texts.find((t) => /^h[1-3]$/.test(t.tag)) || band.texts[0] || { t: '' }).t.slice(0, 50)}`)
await b.close()
