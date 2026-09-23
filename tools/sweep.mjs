import { chromium } from 'playwright'
import fs from 'fs'
const routes = JSON.parse(fs.readFileSync('tools/routes.json', 'utf8'))
const b = await chromium.launch()
const rows = []
for (const w of [1440, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } })
  for (const r of routes) {
    const p = await ctx.newPage()
    const errs = []
    p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 120)))
    p.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message.slice(0, 120)))
    await p.goto('http://localhost:5179' + r.path, { waitUntil: 'networkidle', timeout: 30000 })
    await p.waitForTimeout(400)
    const m = await p.evaluate(() => ({
      h: document.body.scrollHeight,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1: document.querySelectorAll('main h1').length,
      sections: document.querySelectorAll('main section').length,
      brokenImgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
      emptyLinks: [...document.querySelectorAll('main a')].filter((a) => !a.textContent.trim() && !a.querySelector('img')).length,
    }))
    rows.push({ w, path: r.path, ...m, errs: errs.length ? errs.slice(0, 2) : undefined })
    await p.close()
  }
  await ctx.close()
}
await b.close()
const bad = rows.filter((r) => r.errs || r.overflow > 0 || r.brokenImgs || r.sections === 0 || r.h < 700)
console.log('total', rows.length, 'problem rows', bad.length)
for (const r of bad) console.log(JSON.stringify(r))
