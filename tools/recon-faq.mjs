// Second recon pass: the live FAQs are Radix accordions that unmount closed
// panels, so the first pass only ever saw the one answer open by default.
// This opens every item (after exhausting "Show more") and records the answer
// text plus any links inside it, keyed by question.
import { chromium } from 'playwright'
import fs from 'fs'

const routes = JSON.parse(fs.readFileSync('tools/routes.json', 'utf8'))
const out = {}
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } })
let style = null

for (const r of routes) {
  const p = await ctx.newPage()
  try {
    await p.goto('https://www.heidihealth.com' + r.url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await p.waitForTimeout(2000)
    // exhaust "Show more"
    for (let i = 0; i < 10; i++) {
      const more = p.getByRole('button', { name: /^show more$/i })
      if (!(await more.count())) break
      try { await more.first().click({ timeout: 2000 }); await p.waitForTimeout(300) } catch { break }
    }
    const triggers = p.locator('button[data-slot="accordion-trigger"]')
    const n = await triggers.count()
    const items = []
    for (let i = 0; i < n; i++) {
      const t = triggers.nth(i)
      try {
        if ((await t.getAttribute('aria-expanded')) !== 'true') {
          await t.scrollIntoViewIfNeeded({ timeout: 2000 })
          await t.click({ timeout: 2000 })
          await p.waitForTimeout(250)
        }
        const data = await t.evaluate((el) => {
          const panel = document.getElementById(el.getAttribute('aria-controls'))
          const q = el.innerText.trim()
          if (!panel) return { q, a: null, links: [] }
          const paras = [...panel.querySelectorAll('p, li')].map((x) => x.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean)
          const a = paras.length ? paras : [panel.innerText.replace(/\s+/g, ' ').trim()].filter(Boolean)
          const links = [...panel.querySelectorAll('a')].map((x) => ({ t: x.innerText.trim(), href: x.getAttribute('href') }))
          return { q, a, links }
        })
        items.push(data)
      } catch {}
    }
    if (!style && n) {
      style = await triggers.first().evaluate((el) => {
        const s = el.querySelector('span'); const cs = getComputedStyle(s)
        const item = el.closest('[data-state]').parentElement
        const ic = getComputedStyle(item)
        return { ff: cs.fontFamily, fs: cs.fontSize, lh: cs.lineHeight, ls: cs.letterSpacing, color: cs.color, pad: getComputedStyle(el).padding, itemBg: ic.backgroundColor, itemRadius: ic.borderRadius }
      })
    }
    if (items.length) out[r.slug] = items
    console.log(r.slug, n, 'questions,', items.filter((x) => x.a && x.a.length).length, 'answered')
  } catch (e) { console.log('FAIL', r.slug, e.message.split('\n')[0]) }
  await p.close()
}
await b.close()
fs.writeFileSync('src/data/faq-answers.json', JSON.stringify(out, null, 1))
console.log('STYLE', JSON.stringify(style))
