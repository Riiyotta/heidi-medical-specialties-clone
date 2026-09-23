// Deep recon for the "For" (solutions) pages that share the Specialists
// structure. The first pass only saw each interactive block's default state;
// this clicks through the day tabs and template carousel, and records stat-card
// icons, the video embed and every testimonial, into src/data/solutions.json.
import { chromium } from 'playwright'
import fs from 'fs'

const SLUGS = ['primary-care', 'medical-specialties', 'nurses', 'mental-health', 'allied-health', 'dentists', 'aged-care', 'veterinarians', 'surgeons', 'emergency-medicine']
const out = {}
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } })
const unwrap = (u) => { try { const x = new URL(u); return x.searchParams.get('url') || u } catch { return u } }

for (const slug of SLUGS) {
  const p = await ctx.newPage()
  await p.goto('https://www.heidihealth.com/en-gb/solutions/' + slug, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await p.waitForTimeout(2500)
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)) } scrollTo(0, 0) })
  const data = {}

  // --- Your day with Heidi: click each tab
  const daySec = p.locator('section', { has: p.locator('h2', { hasText: /your day with heidi/i }) }).first()
  if (await daySec.count()) {
    data.day = { intro: await daySec.evaluate((s) => { const h = s.querySelector('h2'); const n = [...s.querySelectorAll('p')].find((x) => !x.closest('[role=tab]') && x.innerText.trim().length > 30); return n?.innerText.trim() || null }), items: [] }
    const tabs = daySec.locator('[role=tab]')
    for (let i = 0; i < (await tabs.count()); i++) {
      await tabs.nth(i).click(); await p.waitForTimeout(700)
      data.day.items.push(await daySec.evaluate((s, i) => {
        const t = s.querySelectorAll('[role=tab]')[i]
        const title = (t.querySelector('h3,h4,span,p') || t).innerText.trim().split('\n')[0]
        const ps = [...t.querySelectorAll('p')].map((x) => x.innerText.trim()).filter((x) => x && x !== title)
        const img = [...s.querySelectorAll('img')].filter((im) => im.getBoundingClientRect().width > 100 && getComputedStyle(im).opacity !== '0').pop()
        return { title, body: ps.join(' ') || null, img: img ? (img.currentSrc || img.src) : null, alt: img?.alt || '' }
      }, i))
    }
  }

  // --- Stats band: cards with lucide icon names
  data.stats = await p.evaluate(() => {
    const secs = [...document.querySelectorAll('main section')]
    for (const s of secs) {
      const hs = [...s.querySelectorAll('h3')].filter((h) => /\d/.test(h.innerText) && h.innerText.length < 40)
      if (hs.length < 2) continue
      const h2 = s.querySelector('h2')
      return {
        heading: h2?.innerText.trim() || null,
        cards: hs.map((h) => {
          let card = h; while (card.parentElement && card.parentElement.querySelectorAll('h3').length === 1) card = card.parentElement
          const svg = card.querySelector('svg')
          const cls = svg ? String(svg.className.baseVal).split(' ').find((c) => c.startsWith('lucide-')) : null
          const cap = [...card.querySelectorAll('p')].map((x) => x.innerText.trim()).filter(Boolean)
          return { value: h.innerText.trim(), caption: cap.join(' '), icon: cls ? cls.replace('lucide-', '') : null }
        }),
      }
    }
    return null
  })

  // --- "In practice" template carousel
  const tplSec = p.locator('section', { has: p.getByText('In practice', { exact: true }) }).first()
  if (await tplSec.count()) {
    data.templates = await tplSec.evaluate((s) => {
      const h2 = s.querySelector('h2')
      const cta = [...s.querySelectorAll('a')].find((a) => a.getAttribute('href'))
      const para = [...s.querySelectorAll('p')].map((x) => x.innerText.trim()).find((t) => t.length > 60)
      return { eyebrow: 'In practice', heading: h2?.innerText.trim(), cta: cta ? { t: cta.innerText.trim(), href: cta.getAttribute('href') } : null, body: para || null, items: [] }
    })
    const names = await tplSec.evaluate((s) => [...s.querySelectorAll('button')].map((b) => b.innerText.trim()).filter((t) => t && !/slide/i.test(t)))
    for (const name of names) {
      const btn = tplSec.locator('button', { hasText: name }).first()
      try { await btn.click({ timeout: 2000 }); await p.waitForTimeout(600) } catch {}
      const img = await tplSec.evaluate((s) => { const im = [...s.querySelectorAll('img')].filter((i) => i.getBoundingClientRect().width > 200).pop(); return im ? { src: im.currentSrc || im.src, alt: im.alt, w: Math.round(im.getBoundingClientRect().width), h: Math.round(im.getBoundingClientRect().height) } : null })
      data.templates.items.push({ name, img })
    }
  }

  // --- Video band
  data.video = await p.evaluate(() => {
    const f = document.querySelector('main iframe[src*="youtube"], main iframe[src*="vimeo"], main iframe[data-src]')
    if (!f) return null
    const s = f.closest('section')
    return { src: f.getAttribute('src') || f.getAttribute('data-src'), title: f.title, heading: s?.querySelector('h2')?.innerText.trim(), sub: s ? [...s.querySelectorAll('p')].map((x) => x.innerText.trim()).find(Boolean) : null }
  })

  // --- Testimonials
  data.testimonials = await p.evaluate(() => {
    const s = [...document.querySelectorAll('main section')].find((x) => /hear from/i.test(x.querySelector('h2')?.innerText || ''))
    if (!s) return null
    const link = [...s.querySelectorAll('a')].find((a) => a.getAttribute('href') && !/slide/i.test(a.innerText))
    const items = [...s.querySelectorAll('[data-slot="carousel-item"], figure, blockquote')].map((it) => {
      const ps = [...it.querySelectorAll('p, h6, blockquote')].map((x) => x.innerText.trim()).filter(Boolean)
      const q = ps.find((t) => /^[“"]/.test(t)) || ps[0]
      const rest = ps.filter((t) => t !== q)
      return { quote: q, name: rest[0] || null, title: rest[1] || null }
    }).filter((x) => x.quote)
    const seen = new Set()
    return { heading: s.querySelector('h2').innerText.trim(), link: link ? { t: link.innerText.trim(), href: link.getAttribute('href') } : null, items: items.filter((x) => !seen.has(x.quote) && seen.add(x.quote)) }
  })

  out[slug] = data
  console.log(slug, 'day', data.day?.items.length, 'stats', data.stats?.cards.length, 'tpl', data.templates?.items.length, 'video', !!data.video, 'quotes', data.testimonials?.items.length)
  await p.close()
}
await b.close()

// download images referenced by day tabs + template previews
import { execFileSync } from 'child_process'
const local = (u) => {
  const real = new URL(unwrap(u)); real.searchParams.set('w', '1200'); real.searchParams.set('q', '75')
  const name = decodeURIComponent(real.pathname.split('/').pop()).replace(/[^a-zA-Z0-9._-]/g, '-')
  const dest = 'public/assets/pages/' + name
  if (!fs.existsSync(dest)) execFileSync('curl', ['-sSL', '--fail', '--max-time', '60', '-o', dest, real.toString()])
  return '/assets/pages/' + name
}
for (const d of Object.values(out)) {
  for (const it of d.day?.items || []) if (it.img) it.img = local(it.img)
  for (const it of d.templates?.items || []) if (it.img?.src) it.img.src = local(it.img.src)
}
fs.writeFileSync('src/data/solutions.json', JSON.stringify(out, null, 1))
console.log('DONE')
