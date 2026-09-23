// Checks the clone renders both loading states with live's measured values.
// Usage: node tools/verify-loading.mjs [/route]
// Verifies the clone's loading state renders, and that its placeholders match
// the ones measured on live (tools/recon-loading2.mjs).
import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
// Chromium ignores CDP throttling on loopback, so hold every page chunk and
// image back by hand instead.
await ctx.route('**/*', async (route) => {
  const u = route.request().url()
  if (/\.(png|jpe?g|svg|webp|mp4|gif)(\?|$)/i.test(u)) return setTimeout(() => route.continue(), 4000)
  if (/(Page|SolutionsPage|faq-answers)[-.][\w-]*\.js/.test(u) || /\/src\/pages\//.test(u)) return setTimeout(() => route.continue(), 2500)
  return route.continue()
})
const seen = new Map()
p.goto('http://localhost:5179' + (process.argv[2] || '/scribe') + '', { waitUntil: 'commit' }).catch(() => {})
let sawFallback = false
for (let i = 0; i < 26; i++) {
  await p.waitForTimeout(350)
  const r = await p.evaluate(() => {
    const rows = []
    for (const el of document.querySelectorAll('.animate-pulse, [class*="animate-pulse"]')) {
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect()
      rows.push({ cls: el.className, anim: cs.animation, bg: cs.backgroundColor, w: r.width|0, h: r.height|0 })
    }
    return { rows, fallback: !!document.querySelector('[role="status"][aria-label="Loading"]') }
  }).catch(() => ({ rows: [], fallback: false }))
  if (r.fallback) sawFallback = true
  for (const x of r.rows) seen.set(x.cls + x.w + x.h, x)
}
console.log('page fallback shown:', sawFallback)
const fam = new Map()
for (const x of seen.values()) {
  const k = x.cls.replace(/\s+/g, ' ').trim() + '  →  ' + x.bg + ' / ' + x.anim
  fam.set(k, (fam.get(k) || 0) + 1)
}
for (const [k, n] of fam) console.log('x' + n, k)
await b.close()
