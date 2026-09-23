// Template-card grids on the "For" pages ("Every … template you need, made
// yours"). Captured card-by-card so repeated values (kind, author) survive —
// the generic extractor de-duplicates repeated text across a band.
import { chromium } from 'playwright'
import fs from 'fs'
const data = JSON.parse(fs.readFileSync('src/data/solutions.json', 'utf8'))
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } })
for (const slug of Object.keys(data)) {
  await p.goto('https://www.heidihealth.com/en-gb/solutions/' + slug, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await p.waitForTimeout(2500)
  data[slug].templateGrid = await p.evaluate(() => {
    const cards = [...document.querySelectorAll('main a[href*="/templates/"]')]
    if (!cards.length) return null
    let band = cards[0]
    while (band.parentElement && band.parentElement.querySelectorAll('a[href*="/templates/"]').length === band.querySelectorAll('a[href*="/templates/"]').length && !band.querySelector('h2')) band = band.parentElement
    band = band.parentElement
    while (!band.querySelector('h2')) band = band.parentElement
    const h2 = band.querySelector('h2')
    const texts = [...band.querySelectorAll('p')].filter((x) => !x.closest('a')).map((x) => x.innerText.trim()).filter(Boolean)
    const explore = [...band.querySelectorAll('a')].find((a) => !a.getAttribute('href').includes('/templates/'))
    const leaf = (el) => [...el.querySelectorAll('p, span, h3, h4')].filter((e) => e.childElementCount === 0).map((e) => ({ t: e.innerText.trim(), fs: parseFloat(getComputedStyle(e).fontSize), fw: getComputedStyle(e).fontWeight })).filter((x) => x.t)
    return {
      heading: h2.innerText.trim(),
      eyebrow: texts.find((t) => t.length < 40) || null,
      body: texts.find((t) => t.length >= 40) || null,
      cta: explore ? { t: explore.innerText.trim(), href: explore.getAttribute('href') } : null,
      cards: cards.map((a) => {
        const l = leaf(a)
        const title = l.find((x) => x.fs >= 18)
        const after = l.slice(l.indexOf(title) + 1)
        const count = [...after].reverse().find((x) => /^\d+$/.test(x.t))
        const people = after.filter((x) => x !== count)
        const flag = a.querySelector('img')
        return { href: a.getAttribute('href'), kind: l[0]?.t, title: title?.t, author: people[0]?.t || null, specialty: people[1]?.t || null, count: count ? +count.t : null, flag: flag ? flag.alt : null }
      }),
    }
  })
  console.log(slug, data[slug].templateGrid?.cards.length, data[slug].templateGrid?.heading)
}
fs.writeFileSync('src/data/solutions.json', JSON.stringify(data, null, 1))
await b.close()
