import { chromium } from 'playwright'
import fs from 'fs'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
const p = await ctx.newPage()
await p.goto('https://www.heidihealth.com/en-gb', { waitUntil: 'domcontentloaded', timeout: 60000 })
await p.waitForTimeout(3500)
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) } scrollTo(0, 0) })
await p.waitForTimeout(800)
await p.addStyleTag({ content: 'header, .download-drawer-shell { visibility: hidden !important }' })
const out = {}
const st = `(e) => { if (!e) return null; const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height), bg: c.backgroundColor, fg: c.color, r: c.borderRadius, pad: c.padding, gap: c.gap, ff: c.fontFamily.split(',')[0], fs: c.fontSize, lh: c.lineHeight, ls: c.letterSpacing, fw: c.fontWeight, fst: c.fontStyle, shadow: c.boxShadow.slice(0, 90), bd: c.borderTopWidth + ' ' + c.borderTopColor } }`

// ---------- hero
out.hero = await p.evaluate((src) => {
  const st = eval(src)
  const h1 = document.querySelector('main h1')
  const em = h1.querySelector('em, i, span[class*=italic]')
  const sec = h1.closest('section')
  const sub = [...sec.querySelectorAll('p')].find((x) => x.innerText.trim() && !x.closest('button'))
  const tabs = [...sec.querySelectorAll('button')].filter((x) => ['Evidence', 'Scribe', 'Dictate'].includes(x.innerText.trim()) && x.getBoundingClientRect().width > 0)
  tabs.forEach((t) => t.setAttribute('data-hero-tab', t.innerText.trim()))
  let panel = tabs[0]; while (panel && panel.getBoundingClientRect().width < 1000) panel = panel.parentElement
  panel.setAttribute('data-hero-panel', '1')
  const tabbar = tabs[0].parentElement; tabbar.setAttribute('data-hero-tabs', '1')
  return { h1: st(h1), h1html: h1.innerHTML.replace(/class="[^"]*"/g, ''), em: st(em), sub: { ...st(sub), t: sub.innerText.trim() }, panel: st(panel), tabbar: st(tabbar), tabActive: st(tabs[0]), tabIdle: st(tabs[1]), tabs: tabs.map((t) => t.innerText.trim()) }
}, st)
for (const name of out.hero.tabs) {
  await p.locator(`[data-hero-tab="${name}"]`).click()
  await p.waitForTimeout(1800)
  await p.evaluate(() => { document.querySelector('[data-hero-tabs]').style.visibility = 'hidden' })
  await p.locator('[data-hero-panel]').screenshot({ path: `public/assets/home/hero-${name.toLowerCase()}.png`, animations: 'disabled' })
  await p.evaluate(() => { document.querySelector('[data-hero-tabs]').style.visibility = '' })
}

// ---------- logo band
out.logos = await p.evaluate((src) => {
  const st = eval(src)
  const lead = [...document.querySelectorAll('main p, main span, main div')].filter((e) => /enabled care for/.test(e.textContent) && /patient visits/.test(e.textContent)).sort((a, b) => a.textContent.length - b.textContent.length)[0]
  const imgs = [...document.querySelectorAll('main img')].filter((i) => /CHCP|modality|Dudley|Hertford|Walsall|WWL|onecare|Portman|Ryder|Swiss/i.test(i.alt))
  const tile = imgs[0].parentElement; let t = tile; while (t && t.getBoundingClientRect().width < 200) t = t.parentElement
  let panel = t; while (panel && getComputedStyle(panel).backgroundColor === 'rgba(0, 0, 0, 0)') panel = panel.parentElement
  const pill = [...lead.querySelectorAll('*')].find((e) => getComputedStyle(e).backgroundColor !== 'rgba(0, 0, 0, 0)')
  return { lead: { ...st(lead), t: lead.textContent.replace(/\s+/g, ' ').slice(0, 200) }, pill: st(pill), tile: st(t), panel: st(panel), grid: st(t.parentElement), img: st(imgs[0]), logos: imgs.map((i) => ({ alt: i.alt, src: i.currentSrc || i.src })) }
}, st)

// ---------- quotes
out.quotes = await p.evaluate((src) => {
  const st = eval(src)
  return [...document.querySelectorAll('main h2')].filter((h) => /^"/.test(h.innerText.trim())).map((h) => { const s = h.closest('section'); const cap = [...s.querySelectorAll('p')].find((x) => x.innerText.trim()); return { q: st(h), t: h.innerText.trim(), cap: { ...st(cap), html: cap.innerHTML.replace(/class="[^"]*"/g, '') } } })
}, st)

// ---------- bento
out.bento = await p.evaluate((src) => {
  const st = eval(src)
  const h2 = [...document.querySelectorAll('main h2')].find((h) => /From first visit/.test(h.innerText))
  const sec = h2.closest('section')
  const cards = [...sec.querySelectorAll('h3')].map((h3, i) => {
    let card = h3; while (card.parentElement && card.parentElement.querySelectorAll('h3').length === 1) card = card.parentElement
    const vis = [...card.querySelectorAll('div, img')].filter((e) => e.getBoundingClientRect().width > 300 && !e.contains(h3)).sort((a, b) => b.getBoundingClientRect().width * b.getBoundingClientRect().height - a.getBoundingClientRect().width * a.getBoundingClientRect().height)[0]
    vis.setAttribute('data-bento-vis', String(i))
    const a = card.querySelector('a'); const ap = [a, ...a.querySelectorAll('*')].find((e) => getComputedStyle(e).backgroundColor !== 'rgba(0, 0, 0, 0)')
    const p = card.querySelector('p')
    return { card: st(card), h3: { ...st(h3), t: h3.innerText.trim() }, p: { ...st(p), t: p.innerText.trim() }, a: { ...st(ap), t: a.innerText.trim(), href: a.getAttribute('href') }, vis: st(vis) }
  })
  return { h2: { ...st(h2), t: h2.innerText.trim() }, grid: st(sec.querySelector('h3').closest('div').parentElement), cards }
}, st)
for (let i = 0; i < out.bento.cards.length; i++) {
  const el = p.locator(`[data-bento-vis="${i}"]`)
  await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(1200)
  await el.screenshot({ path: `public/assets/home/bento-${i}.png`, animations: 'disabled' })
}

// ---------- dark band: items + roll timing
out.dark = await p.evaluate((src) => {
  const st = eval(src)
  const h = [...document.querySelectorAll('main h2, main h3, main p')].find((x) => /Clinical coding/.test(x.innerText) && x.childElementCount === 0)
  let sec = h.closest('section')
  const items = [...sec.querySelectorAll('h2, h3, p, li')].filter((x) => x.childElementCount === 0 && x.innerText.trim().length > 4).map((x) => ({ t: x.innerText.trim(), fs: getComputedStyle(x).fontSize, ff: getComputedStyle(x).fontFamily.split(',')[0], op: getComputedStyle(x).opacity, fg: getComputedStyle(x).color, y: Math.round(x.getBoundingClientRect().y) }))
  const btn = [...sec.querySelectorAll('a')].map((a) => ({ t: a.innerText.trim(), href: a.getAttribute('href') }))
  let band = sec; while (band.parentElement && getComputedStyle(band).backgroundColor === 'rgba(0, 0, 0, 0)' && !band.querySelector('[class*="-z-10"]')) band = band.parentElement
  return { items, btn, sec: st(sec) }
}, st)
// sample which list item is brightest over 8s
const samples = []
const darkSec = p.locator('section', { hasText: 'Tackles every clinical task' }).first()
await darkSec.scrollIntoViewIfNeeded(); await p.waitForTimeout(500)
for (let t = 0; t < 16; t++) {
  samples.push(await darkSec.evaluate((s) => { const all = [...s.querySelectorAll('*')].filter((x) => x.childElementCount === 0 && x.innerText?.trim().length > 6 && !/Tackles|Explore/.test(x.innerText)); const top = all.map((x) => ({ t: x.innerText.trim().slice(0, 22), c: getComputedStyle(x).color, o: +getComputedStyle(x).opacity, y: Math.round(x.getBoundingClientRect().y) })); return top.filter((x) => x.y > 200 && x.y < 700) }))
  await p.waitForTimeout(500)
}
out.darkSamples = samples.map((s, i) => ({ t: i * 500, rows: s.map((r) => `${r.t}@${r.y}/${r.c.replace('rgb', '')}`).join(' | ') }))

// ---------- CTA band image + pattern colour
out.cta = await p.evaluate((src) => {
  const st = eval(src)
  const h = [...document.querySelectorAll('main h2')].find((x) => /Discover real relief/.test(x.innerText))
  let band = h; while (band && !band.querySelector('[class*="-z-10"]')) band = band.parentElement
  const layer = band.querySelector('[class*="-z-10"]')
  const img = layer.querySelector('img')
  const masks = [...layer.querySelectorAll('div')].filter((d) => getComputedStyle(d).maskImage !== 'none').map((d) => ({ mask: getComputedStyle(d).maskImage, bg: getComputedStyle(d).backgroundColor, w: Math.round(d.getBoundingClientRect().width), h: Math.round(d.getBoundingClientRect().height) }))
  return { h2: st(h), img: img && (img.currentSrc || img.src), masks, panel: st(img?.closest('[class*=rounded]') || layer) }
}, st)
fs.writeFileSync('src/data/home.json', JSON.stringify(out, null, 1))
console.log(JSON.stringify({ hero: out.hero, logos: { ...out.logos, logos: out.logos.logos.length }, quotes: out.quotes, cta: out.cta }, null, 1).slice(0, 6000))
console.log('DARK', JSON.stringify(out.dark.items), JSON.stringify(out.dark.btn))
console.log(out.darkSamples.map((s) => s.t + ': ' + s.rows).join('\n'))
await b.close()
