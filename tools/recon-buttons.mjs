// Third recon pass: button styling. On the live site the <a> is a transparent
// wrapper and the painted button is a child, so the first pass recorded every
// CTA as transparent. This records the painted element's fill, text colour,
// border, radius and trailing icon for every link/button, in document order.
import { chromium } from 'playwright'
import fs from 'fs'

const routes = JSON.parse(fs.readFileSync('tools/routes.json', 'utf8'))
const out = {}
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } })
for (const r of routes) {
  const p = await ctx.newPage()
  try {
    await p.goto('https://www.heidihealth.com' + r.url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await p.waitForTimeout(2000)
    out[r.slug] = await p.evaluate(() => {
      const main = document.querySelector('main') || document.body
      return [...main.querySelectorAll('a, button')]
        .filter((a) => a.innerText.trim() && a.getBoundingClientRect().height >= 28)
        .map((a) => {
          const painted = [a, ...a.querySelectorAll('*')].find((e) => {
            const c = getComputedStyle(e)
            return c.backgroundColor !== 'rgba(0, 0, 0, 0)' || c.borderTopWidth !== '0px'
          })
          if (!painted) return null
          const c = getComputedStyle(painted)
          const svg = a.querySelector('svg')
          const rect = painted.getBoundingClientRect()
          return {
            t: a.innerText.replace(/\s+/g, ' ').trim(),
            href: a.getAttribute('href'),
            bg: c.backgroundColor,
            fg: c.color,
            bd: c.borderTopWidth !== '0px' ? c.borderTopColor : null,
            r: c.borderRadius,
            h: Math.round(rect.height),
            icon: svg ? Math.round(svg.getBoundingClientRect().width) : 0,
            iconColor: svg ? getComputedStyle(svg).color : null,
          }
        })
        .filter((x) => x && x.h >= 32 && x.h <= 60)
    })
    console.log(r.slug, out[r.slug].length)
  } catch (e) { console.log('FAIL', r.slug, e.message.split('\n')[0]) }
  await p.close()
}
await b.close()
fs.writeFileSync('src/data/buttons.json', JSON.stringify(out, null, 1))
console.log('DONE')
