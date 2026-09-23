// Turns a recon'd section (see src/data/pages/*.json — captured from the live
// site with Playwright) into a section type the renderer knows how to draw.
//
// Classification is by CONTENT SIGNATURE, not by the live site's Tailwind class
// strings: those are build-hashed and reorder between deploys, whereas "one h2 +
// a paragraph + one image + one CTA" is a stable description of a feature row.

const QUOTE = /^[“"”']/

const isPercentish = (t) => /\d/.test(t) && t.length < 40

const isPrice = (x) => x?.k === 'h' && /^[£$€]\s?\d/.test(x.t)

export function classifySection(section, index, all) {
  if (section.forceType) return section.forceType
  const b = section.blocks
  const headings = b.filter((x) => x.k === 'h')
  const paras = b.filter((x) => x.k === 'p')
  const links = b.filter((x) => x.k === 'a')
  const imgs = b.filter((x) => x.k === 'img')
  const h1 = headings.find((h) => h.lvl === 1)
  const lead = headings[0]
  const last = index === all.length - 1

  if (h1) return 'hero'

  // Plan tiers: several price headings (£0, £45 …) each under a tier name.
  if (b.filter(isPrice).length >= 2) return 'pricing'

  // The plan comparison matrix: a "Compare" heading over a long feature list.
  if (lead && /compare/i.test(lead.t) && paras.length >= 10) return 'compare'

  // Partner-logo strip: nothing but short, wide wordmark images.
  if (
    imgs.length >= 4 &&
    headings.length === 0 &&
    imgs.every((i) => i.w && i.h && i.w / i.h >= 2)
  )
    return 'logos'

  // FAQ: a "FAQs" heading, or a run of inter-set h3s (questions) under an
  // exposure h2 — the live site renders answers collapsed, so most questions
  // arrive with no paragraph attached.
  const questionish = headings.filter((h) => h.lvl >= 3 && h.ff === 'inter')
  if ((lead && /^FAQ/i.test(lead.t)) || questionish.length >= 3) return 'faq'

  // Stat band: several short numeric h3s, each with a caption underneath.
  const stats = headings.filter((h) => h.lvl >= 3 && h.ff !== 'inter' && isPercentish(h.t))
  if (stats.length >= 2 && !imgs.length) return 'stats'

  // Testimonials: two or more pull quotes.
  if (paras.filter((p) => QUOTE.test(p.t)).length >= 2) return 'quotes'

  // Closing CTA band: last section, centred heading, no imagery.
  if (last && !imgs.length && headings.length === 1 && lead?.ta === 'center') return 'cta'

  // Feature row: one heading, one image, a short body and at most a couple of
  // CTAs. These alternate image-left / image-right down the page.
  if (
    imgs.length === 1 &&
    headings.filter((h) => h.lvl <= 2).length === 1 &&
    headings.length <= 2 &&
    links.length <= 3
  )
    return 'split'

  // Card grid: lots of imagery, or lots of links with an image each.
  if (imgs.length >= 3) return 'cards'

  // A heading with a wrapped row of pills (the "Recommended for" strip) — many
  // short paragraphs, no imagery, nothing linked.
  if (!imgs.length && paras.length >= 4 && paras.every((p) => p.t.length < 60) && links.length === 0)
    return 'pills'

  // Link list / directory (help centre, resources index, careers roles).
  if (links.length >= 4 && imgs.length === 0) return 'links'

  if (!imgs.length && headings.length <= 1) return 'centered'

  return 'prose'
}

// Recon artefacts that are not content: the live site's number-flip counters
// render every digit 0–9 in a reel, which innerText flattens into a run like
// "0 1 2 3 4 5 6 7 8 9 , 0 1 2 …". Caught mid-animation, it reads as copy.
const isDigitReel = (t) => /(\d\s+){8,}/.test(t)

const clean = (section) => ({
  ...section,
  blocks: section.blocks.filter((b) => !(b.k === 'p' && isDigitReel(b.t))),
})

// Some live sections hold several bands in one <section> — e.g. /download puts
// the MacOS hero and the whole "Try Heidi everywhere" platform grid together.
// Rendered as one hero, everything after the first heading was silently lost.
// Split a hero section at each later h2 so each band gets its own template.
// Deliberately limited to sections that open with an h1: elsewhere, runs of
// h2s are a single band (pricing tiers, feature lists, role groups) and
// splitting them shatters the layout.
function splitAtHeadings(section) {
  if (!section.blocks.some((b) => b.k === 'h' && b.lvl === 1)) return [section]
  // /pricing's hero also carries the tier cards; cut once, at the first tier
  // name, so the tiers stay together as one pricing band.
  const firstPrice = section.blocks.findIndex(isPrice)
  if (section.blocks.filter(isPrice).length >= 2) {
    // The tier's name is the last non-price heading above its price.
    let cut = firstPrice - 1
    while (cut > 0 && !(section.blocks[cut].k === 'h' && !isPrice(section.blocks[cut]))) cut--
    return [
      { ...section, blocks: section.blocks.slice(0, cut) },
      { ...section, id: null, i: `${section.i}.1`, forceType: 'pricing', blocks: section.blocks.slice(cut) },
    ]
  }
  const cuts = []
  section.blocks.forEach((b, i) => {
    if (b.k === 'h' && b.lvl === 2 && section.blocks.slice(0, i).some((x) => x.k === 'h')) cuts.push(i)
  })
  if (!cuts.length) return [section]
  // An eyebrow paragraph directly above an h2 belongs to that h2's band.
  const starts = [0, ...cuts.map((c) => (section.blocks[c - 1]?.k === 'p' && section.blocks[c - 1].t.length < 40 ? c - 1 : c))]
  return starts.map((start, n) => ({
    ...section,
    id: n === 0 ? section.id : null,
    i: `${section.i}.${n}`,
    blocks: section.blocks.slice(start, starts[n + 1] ?? section.blocks.length),
  }))
}

export function classifyPage(page) {
  const sections = page.sections.map(clean).flatMap(splitAtHeadings).filter((s) => s.blocks.length)
  return sections.map((s, i, all) => ({ ...s, type: classifySection(s, i, all) }))
}
