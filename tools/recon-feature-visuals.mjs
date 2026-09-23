// Feature-row visuals on the "For" pages: some are plain images, some are a
// live DOM mock (e.g. the Dictate waveform card) that the recon cannot see.
// Screenshot every 600x480 visual next to an h2, keyed by that heading.
import { chromium } from 'playwright'
import fs from 'fs'
const data = JSON.parse(fs.readFileSync('src/data/solutions.json', 'utf8'))
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
const p = await ctx.newPage()
for (const slug of Object.keys(data)) {
  await p.goto('https://www.heidihealth.com/en-gb/solutions/' + slug, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await p.waitForTimeout(2500)
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)) } scrollTo(0, 0) })
  await p.waitForTimeout(800)
  const found = await p.evaluate(() => {
    const out = []
    document.querySelectorAll('main section').forEach((sec, i) => {
      const h2 = sec.querySelector('h2')
      if (!h2 || sec.querySelector('h1') || /your day with heidi/i.test(h2.innerText)) return
      const v = [...sec.querySelectorAll('div, img')].find((e) => {
        const r = e.getBoundingClientRect()
        return r.width >= 560 && r.width <= 640 && r.height >= 440 && r.height <= 520 && !e.contains(h2)
      })
      if (!v) return
      v.setAttribute('data-feature-visual', String(i))
      out.push({ i, heading: h2.innerText.trim() })
    })
    return out
  })
  data[slug].featureVisuals = {}
  for (const f of found) {
    const el = p.locator(`[data-feature-visual="${f.i}"]`)
    await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(700)
    const file = `public/assets/solutions/feature-${slug}-${f.i}.png`
    await el.screenshot({ path: file, animations: 'disabled' })
    data[slug].featureVisuals[f.heading] = '/' + file.replace('public/', '')
  }
  console.log(slug, found.map((f) => f.heading.slice(0, 26)).join(' | '))
}
fs.writeFileSync('src/data/solutions.json', JSON.stringify(data, null, 1))
await b.close()
