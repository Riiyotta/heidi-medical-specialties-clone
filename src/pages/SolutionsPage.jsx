import { Fragment, useEffect, useMemo } from 'react'
import { pages } from './GeneratedPage.jsx'
import { classifyPage } from '../lib/classify.js'
import { renderers } from '../components/sections/index.jsx'
import {
  CtaBand,
  DayWithHeidi,
  Faq,
  FeatureRow,
  Hero,
  SpecialtyStrip,
  StatsBand,
  TemplateGrid,
  TemplatePractice,
  Testimonials,
  VideoBand,
} from '../components/solutions/index.jsx'
import solutions from '../data/solutions.json'
import faqAnswers from '../data/faq-answers.json'
import buttons from '../data/buttons.json'

// The "For" pages (Specialists, Primary Care, Nursing …) all share one band
// structure on the live site. This walks a page's recon'd bands in their live
// order and hands each to the matching measured component, pulling the parts
// the first recon could not see (tab bodies, carousel slides, stat icons,
// visuals, testimonial titles) from src/data/solutions.json.
export const SOLUTION_SLUGS = Object.keys(solutions)

// Give each captured link its painted live style, in document order.
function styleLinks(sections, captured = []) {
  const used = new Set()
  const take = (t) => {
    const j = captured.findIndex((c, k) => !used.has(k) && c.t === t)
    if (j === -1) return null
    used.add(j)
    return captured[j]
  }
  return {
    sections: sections.map((s) => ({
      ...s,
      blocks: s.blocks.map((b) => (b.k === 'a' ? { ...b, style: take(b.t) } : b)),
    })),
    take,
    rest: () => captured.filter((c, k) => !used.has(k) && c.href && !c.href.startsWith('#')),
  }
}

const heading = (s) => s.blocks.find((b) => b.k === 'h' && b.lvl <= 2)?.t || s.blocks.find((b) => b.k === 'h')?.t || ''
const paras = (s) => s.blocks.filter((b) => b.k === 'p').map((b) => b.t)
const links = (s) => s.blocks.filter((b) => b.k === 'a' && b.href)

function buildBands(slug) {
  const page = pages[`solutions-${slug}`]
  const deep = solutions[slug]
  const { sections, rest } = styleLinks(classifyPage(page), buttons[`solutions-${slug}`])
  let featureIndex = 0

  const bands = sections.map((s, i) => {
    const h = heading(s)
    if (i === 0) {
      const ps = s.blocks.filter((b) => b.k === 'p')
      const h1 = s.blocks.findIndex((b) => b.k === 'h')
      return {
        C: Hero,
        props: {
          eyebrow: ps.find((p) => s.blocks.indexOf(p) < h1)?.t,
          heading: s.blocks[h1]?.t,
          body: ps.find((p) => s.blocks.indexOf(p) > h1)?.t,
          cta: links(s)[0],
          visual: deep.heroVisual,
        },
      }
    }
    if (/your day with heidi/i.test(h) && deep.day)
      return { C: DayWithHeidi, props: { heading: h, intro: deep.day.intro, items: deep.day.items } }
    if (deep.templates && h === deep.templates.heading)
      return { C: TemplatePractice, props: deep.templates }
    if (deep.templateGrid && h === deep.templateGrid.heading) {
      const eyebrow = s.blocks.find((b, j) => b.k === 'p' && j < s.blocks.findIndex((x) => x.k === 'h'))?.t
      return { C: TemplateGrid, props: { ...deep.templateGrid, eyebrow, cta: links(s).find((l) => !l.href.includes('/templates/')) } }
    }
    if (deep.video && h === deep.video.heading)
      return { C: VideoBand, props: deep.video }
    if (/^hear from/i.test(h) && deep.testimonials)
      return { C: Testimonials, props: { ...deep.testimonials, link: links(s)[0] || deep.testimonials.link } }
    if (s.type === 'faq')
      return { C: Faq, props: { heading: h, stacked: !/md:grid-cols-2/.test(s.cls), items: (faqAnswers[`solutions-${slug}`] || []).filter((x) => x.a?.length) } }
    if (s.type === 'stats' && deep.stats)
      return { C: StatsBand, props: { heading: deep.stats.heading || (s.blocks.find((b) => b.k === 'h' && b.lvl === 2)?.t ?? null), cards: deep.stats.cards } }
    if (deep.featureVisuals?.[h]) {
      const imageFirst = featureIndex++ % 2 === 0
      return { C: FeatureRow, props: { heading: h, body: paras(s), cta: links(s)[0], visual: deep.featureVisuals[h], imageFirst } }
    }
    const ps = paras(s)
    const label = ps.findIndex((p) => /^recommended for/i.test(p))
    if (label !== -1)
      return { C: SpecialtyStrip, props: { heading: h, sub: ps.slice(0, label)[0], label: ps[label], chips: ps.slice(label + 1), icon: deep.chipIcon } }
    // Closing band: a lone heading (+ at most one link) with no imagery.
    if (!s.blocks.some((b) => b.k === 'img') && s.blocks.filter((b) => b.k === 'h').length === 1 && ps.length === 0 && links(s).length <= 1)
      return { C: CtaBand, props: { heading: h, buttons: links(s) } }
    return { C: renderers[s.type] || renderers.prose, props: { section: s, index: i } }
  })

  // CTA bands whose button sits outside the band's markup on live: use the
  // page's next unused captured button.
  const spare = rest()
  for (const b of bands) {
    if (b.C === CtaBand && !b.props.buttons.length && spare.length)
      b.props.buttons = [{ k: 'a', ...spare.shift() }].map((c) => ({ t: c.t, href: c.href, style: c }))
  }
  return bands
}

export default function SolutionsPage({ slug }) {
  const page = pages[`solutions-${slug}`]
  const bands = useMemo(() => buildBands(slug), [slug])
  useEffect(() => {
    if (page?.meta?.title) document.title = page.meta.title
  }, [page])
  return (
    <>
      {bands.map(({ C, props }, i) => (
        <Fragment key={i}>
          <C {...props} />
        </Fragment>
      ))}
    </>
  )
}
