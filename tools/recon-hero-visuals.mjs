// The "For" page heroes are a blurred photo with a live DOM mock on top
// (specialty pills, a template card …) that differs per page and is rendered
// client-side, so neither the first recon nor the SSR HTML carries it. Capture
// each hero visual as a 2x element screenshot instead.
import { chromium } from 'playwright'
import fs from 'fs'
const data = JSON.parse(fs.readFileSync('src/data/solutions.json', 'utf8'))
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
const p = await ctx.newPage()
for (const slug of Object.keys(data)) {
  await p.goto('https://www.heidihealth.com/en-gb/solutions/' + slug, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await p.waitForTimeout(3500)
  const box = await p.evaluate(() => {
    const h1 = document.querySelector('main h1')
    const sec = h1.closest('section')
    const img = [...sec.querySelectorAll('img')].sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0]
    if (!img) return null
    let v = img
    while (v.parentElement && v.parentElement !== sec && v.parentElement.getBoundingClientRect().width < 700) v = v.parentElement
    const r = v.getBoundingClientRect()
    v.setAttribute('data-hero-visual', '1')
    return { w: Math.round(r.width), h: Math.round(r.height), radius: getComputedStyle(v).borderRadius }
  })
  if (!box) { console.log(slug, 'no visual'); continue }
  const file = `public/assets/solutions/hero-${slug}.png`
  await p.locator('[data-hero-visual]').screenshot({ path: file, animations: 'disabled' })
  data[slug].heroVisual = { src: '/' + file.replace('public/', ''), ...box }
  console.log(slug, JSON.stringify(box))
}
fs.writeFileSync('src/data/solutions.json', JSON.stringify(data, null, 1))
await b.close()
