// Testimonial cards, captured card-by-card: quote, name (the bold line) and
// title (the secondary-colour line). The generic extractor de-duplicates
// repeated text, which dropped repeated titles like "General Practitioner".
import { chromium } from 'playwright'
import fs from 'fs'
const data = JSON.parse(fs.readFileSync('src/data/solutions.json', 'utf8'))
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } })
for (const slug of Object.keys(data)) {
  await p.goto('https://www.heidihealth.com/en-gb/solutions/' + slug, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await p.waitForTimeout(2500)
  const t = await p.evaluate(() => {
    const h2 = [...document.querySelectorAll('main h2')].find((h) => /^hear from/i.test(h.innerText))
    if (!h2) return null
    const sec = h2.closest('section')
    const link = [...sec.querySelectorAll('a')].find((a) => a.getAttribute('href') && a.innerText.trim())
    const items = [...sec.querySelectorAll('[data-slot="carousel-item"]')].map((it) => {
      const leaves = [...it.querySelectorAll('*')].filter((e) => e.childElementCount === 0 && e.innerText?.trim())
      const quote = leaves.find((e) => /^[“"]/.test(e.innerText.trim()))
      const rest = leaves.filter((e) => e !== quote && !quote?.contains(e))
      const name = rest.find((e) => +getComputedStyle(e).fontWeight >= 600)
      const title = rest.find((e) => e !== name && getComputedStyle(e).color === 'rgb(117, 87, 96)')
      return { quote: quote?.innerText.trim(), name: name?.innerText.trim() || null, title: title?.innerText.trim() || null }
    }).filter((x) => x.quote)
    return { heading: h2.innerText.trim(), link: link ? { t: link.innerText.trim(), href: link.getAttribute('href') } : null, items }
  })
  data[slug].testimonials = t
  console.log(slug, t ? t.items.map((x) => x.name + ' / ' + x.title).join(' | ') : 'none')
}
fs.writeFileSync('src/data/solutions.json', JSON.stringify(data, null, 1))
await b.close()
