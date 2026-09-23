// Interactive states + decorative SVGs the band capture cannot see on its own.
// usage: node tools/capture-extras.mjs <slug> </en-gb/path> <spec.json>
// spec: [{ band, kind: 'tabs'|'svg'|'masks', trigger?: css, target?: css }]
import { chromium } from 'playwright'
import fs from 'fs'
const [slug, url, specFile] = process.argv.slice(2)
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'))
const dir = `public/assets/bands/${slug}`
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
const p = await ctx.newPage()
await p.goto('https://www.heidihealth.com' + url, { waitUntil: 'domcontentloaded', timeout: 60000 })
await p.waitForTimeout(3000)
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)) } scrollTo(0, 0) })
await p.addStyleTag({ content: 'header, .download-drawer-shell { visibility: hidden !important }' })
await p.evaluate(() => {
  const root = document.querySelector('main')
  let el = root.querySelector('section')
  while (el && el.parentElement !== root && el.parentElement.querySelectorAll('section').length === 1) el = el.parentElement
  ;[...el.parentElement.children].filter((c) => !['SCRIPT', 'STYLE'].includes(c.tagName) && c.getBoundingClientRect().height > 40).forEach((c, i) => c.setAttribute('data-cb', i))
})
const out = {}
for (const s of spec) {
  const band = p.locator(`[data-cb="${s.band}"]`)
  await band.scrollIntoViewIfNeeded(); await p.waitForTimeout(600)
  if (s.kind === 'tabs') {
    const triggers = band.locator(s.trigger)
    const n = await triggers.count()
    out[s.name] = []
    for (let i = 0; i < n; i++) {
      const t = triggers.nth(i)
      const label = (await t.innerText()).split('\n')[0].trim()
      await t.click({ force: true }); await p.waitForTimeout(s.wait || 900)
      const body = s.body ? await t.evaluate((el, sel) => [...el.querySelectorAll(sel)].map((x) => x.innerText.trim()).filter(Boolean).join(' '), s.body) : null
      const file = `${dir}/${s.name}-${i}.png`
      if (s.clip) {
        // a fixed region of the band (for DOM mocks with no single element)
        const bb = await band.boundingBox()
        await p.screenshot({ path: file, clip: { x: bb.x + s.clip.x, y: bb.y + s.clip.y, width: s.clip.w, height: s.clip.h }, animations: 'disabled' })
      } else {
        const target = band.locator(s.target).filter({ visible: true }).last()
        await target.screenshot({ path: file, animations: 'disabled' })
      }
      out[s.name].push({ label, body, img: '/' + file.replace('public/', '') })
    }
  }
  if (s.kind === 'svg') out[s.name] = await band.evaluate((el, sel) => [...el.querySelectorAll(sel)].map((x) => ({ html: x.outerHTML, w: Math.round(x.getBoundingClientRect().width), h: Math.round(x.getBoundingClientRect().height), x: Math.round(x.getBoundingClientRect().x - el.getBoundingClientRect().x), y: Math.round(x.getBoundingClientRect().y - el.getBoundingClientRect().y) })), s.target)
  if (s.kind === 'masks') out[s.name] = await band.evaluate((el) => [...el.querySelectorAll('*')].filter((d) => getComputedStyle(d).maskImage !== 'none').map((d) => { const r = d.getBoundingClientRect(), br = el.getBoundingClientRect(), c = getComputedStyle(d); return { mask: c.maskImage, size: c.maskSize, pos: c.maskPosition, repeat: c.maskRepeat, bg: c.backgroundColor, x: Math.round(r.x - br.x), y: Math.round(r.y - br.y), w: Math.round(r.width), h: Math.round(r.height), tf: c.transform } }))
  console.log(s.name, JSON.stringify(out[s.name]).slice(0, 400))
}
const f = `src/data/bands/${slug}-extras.json`
const prev = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {}
fs.writeFileSync(f, JSON.stringify({ ...prev, ...out }, null, 1))
await b.close()
