// Captures the live site's loading state: every placeholder rendered while a
// page is still arriving, per route, with its computed animation, fill and
// box. Run under a throttled connection so the placeholders stay on screen
// long enough to sample. Findings are written up in CLONE_SPEC.md §8.
import { chromium } from 'playwright'
const B = 'https://www.heidihealth.com/en-gb'
const PAGES = ['', '/scribe', '/product/dictate', '/hardware', '/solutions/enterprise', '/pricing', '/customers']
const b = await chromium.launch()
const out = {}
for (const path of PAGES) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
  const p = await ctx.newPage()
  const cdp = await ctx.newCDPSession(p)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 300, downloadThroughput: 80*1024, uploadThroughput: 80*1024 })
  p.goto(B + path, { waitUntil: 'commit' }).catch(() => {})
  const found = new Map()
  for (let i = 0; i < 20; i++) {
    await p.waitForTimeout(400)
    const rows = await p.evaluate(() => {
      const res = []
      for (const el of document.querySelectorAll('[class*="animate-pulse"],[class*="skeleton"],[class*="blur"]')) {
        const cn = typeof el.className === 'string' ? el.className : ''
        const r = el.getBoundingClientRect()
        const cs = getComputedStyle(el)
        const par = el.parentElement
        const pcs = par ? getComputedStyle(par) : null
        res.push({ cls: cn, w: r.width|0, h: r.height|0, y: (r.y + scrollY)|0,
          anim: cs.animation, bg: cs.backgroundColor, radius: cs.borderRadius,
          parent: par ? { tag: par.tagName, cls: (typeof par.className==='string'?par.className:'').slice(0,200), pos: pcs.position, ar: pcs.aspectRatio, ov: pcs.overflow } : null,
          kids: [...el.children].map(k => k.tagName).join(','),
          sib: par ? [...par.children].map(k => k.tagName + ':' + (typeof k.className==='string'? k.className.slice(0,80):'')).join(' | ') : '' })
      }
      return res
    }).catch(() => [])
    for (const r of rows) found.set(r.cls + r.w + r.h + r.y, r)
  }
  out[path || '/'] = [...found.values()]
  await ctx.close()
}
console.log(JSON.stringify(out, null, 1))
await b.close()
