import { chromium } from 'playwright'
const list = process.argv.slice(2)
const b = await chromium.launch()
for (const slug of list) {
  for (const [tag, url] of [['local', `http://localhost:5179/solutions/${slug}`], ['live', `https://www.heidihealth.com/en-gb/solutions/${slug}`]]) {
    const p = await b.newPage({ viewport: { width: Number(process.env.W || 1440), height: 900 } })
    const errs = []
    p.on('pageerror', (e) => errs.push(e.message))
    await p.goto(url, { waitUntil: tag === 'live' ? 'domcontentloaded' : 'networkidle', timeout: 60000 })
    await p.waitForTimeout(tag === 'live' ? 3000 : 800)
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) } scrollTo(0, 0) })
    await p.waitForTimeout(800)
    await p.screenshot({ path: `/tmp/cmp-${slug}-${tag}.png`, fullPage: true })
    console.log(slug, tag, await p.evaluate(() => document.body.scrollHeight), errs.length ? errs : '')
    await p.close()
  }
}
await b.close()
