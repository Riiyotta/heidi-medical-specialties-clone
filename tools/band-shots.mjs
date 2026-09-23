// Screenshot every band of a live page (desktop), for building against.
// usage: node tools/band-shots.mjs /en-gb/path out-prefix
import { chromium } from 'playwright'
const [url, prefix] = process.argv.slice(2)
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('https://www.heidihealth.com' + url, { waitUntil: 'domcontentloaded', timeout: 60000 })
await p.waitForTimeout(3000)
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) } scrollTo(0, 0) })
await p.waitForTimeout(1000)
// hide fixed chrome so it doesn't overlap band captures
await p.addStyleTag({ content: 'header, [class*="download-drawer"], .download-drawer-shell { visibility: hidden !important }' })
const bands = await p.evaluate(() => {
  const root = document.querySelector('main')
  const first = root.querySelector('section')
  let el = first
  while (el && el.parentElement !== root && el.parentElement.querySelectorAll('section').length === 1) el = el.parentElement
  const kids = [...el.parentElement.children].filter((c) => !['SCRIPT', 'STYLE'].includes(c.tagName) && c.getBoundingClientRect().height > 40)
  return kids.map((k, i) => { k.setAttribute('data-band', i); const h = k.querySelector('h1,h2,h3'); return { i, h: Math.round(k.getBoundingClientRect().height), head: h ? h.innerText.replace(/\n/g, ' ').slice(0, 50) : '-' } })
})
for (const band of bands) {
  const el = p.locator(`[data-band="${band.i}"]`)
  await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(500)
  await el.screenshot({ path: `/tmp/${prefix}-band${band.i}.png`, animations: 'disabled' })
}
console.log(JSON.stringify(bands))
await b.close()
