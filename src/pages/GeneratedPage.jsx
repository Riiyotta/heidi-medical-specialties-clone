import { Fragment, useEffect, useMemo } from 'react'
import { classifyPage } from '../lib/classify.js'
import { renderers } from '../components/sections/index.jsx'
import faqAnswers from '../data/faq-answers.json'
import buttons from '../data/buttons.json'

// In-page anchors the live site puts on inner divs rather than on a section,
// so the recon never saw them as section ids. Keyed by the band's heading.
const HEADING_ANCHORS = {
  // The live heading follows the visitor's OS ("…on MacOS" / "…on Windows").
  'product-dictate': { 'Try Dictate for free on MacOS': 'download-section', 'Try Dictate for free on Windows': 'download-section' },
  careers: { 'Values that set the standard.': 'how-we-work' },
}

// Attach each captured link's live button style (tools/recon-buttons.mjs).
// Both lists are in document order, so walk them together: each link takes
// the next unused captured button with the same label.
function attachButtons(sections, captured = []) {
  const used = new Set()
  const out = sections.map((section) => ({
    ...section,
    blocks: section.blocks.map((b) => {
      if (b.k !== 'a') return b
      const idx = captured.findIndex((c, j) => !used.has(j) && c.t === b.t)
      if (idx === -1) return b
      used.add(idx)
      return { ...b, style: captured[idx] }
    }),
  }))
  // The first recon missed the closing CTA band's buttons on 16 pages (they sit
  // outside the band's <section> on the live DOM). The button pass did see
  // them: they are the unused captures after the last matched one.
  const last = out[out.length - 1]
  if (last?.type === 'cta' && !last.blocks.some((b) => b.k === 'a')) {
    const after = Math.max(-1, ...used)
    const tail = captured
      .map((c, j) => ({ c, j }))
      .filter(({ c, j }) => j > after && c.href && !c.href.startsWith('#'))
      .slice(0, 2)
      .map(({ c }) => ({ k: 'a', t: c.t, href: c.href, style: c }))
    out[out.length - 1] = { ...last, blocks: [...last.blocks, ...tail] }
  }
  return out
}

// Every page gets exactly one h1. A few live pages (/podcast) open on an h2;
// promote that heading's tag without changing how it is drawn.
function ensureH1(sections) {
  if (sections.some((s) => s.blocks.some((b) => b.k === 'h' && b.lvl === 1))) return sections
  let done = false
  return sections.map((s) => ({
    ...s,
    blocks: s.blocks.map((b) => {
      if (done || b.k !== 'h') return b
      done = true
      return { ...b, as: 'h1' }
    }),
  }))
}

const prepare = (page, captured) => ensureH1(attachButtons(classifyPage(page), captured))

// Every route's content is the live page's own copy, headings, links and
// imagery, captured section-by-section with Playwright (see recon.mjs) into
// src/data/pages/*.json. The renderer maps each section to a layout template
// rather than hand-coding 40 bespoke pages.
const files = import.meta.glob('../data/pages/*.json', { eager: true })
export const pages = Object.fromEntries(
  Object.entries(files).map(([path, mod]) => [path.split('/').pop().replace('.json', ''), mod.default]),
)

export default function GeneratedPage({ slug }) {
  const page = pages[slug]

  useEffect(() => {
    if (page?.meta?.title) document.title = page.meta.title
  }, [page])

  const sections = useMemo(() => (page ? prepare(page, buttons[slug]) : []), [page, slug])

  if (!page) return null
  let splitIndex = 0

  return (
    <>
      {sections.map((section, i) => {
        const Renderer = renderers[section.type] || renderers.prose
        const index = section.type === 'split' ? splitIndex++ : i
        const lead = section.blocks.find((b) => b.k === 'h')?.t
        const anchor = section.id || HEADING_ANCHORS[slug]?.[lead]
        const el = (
          <Renderer
            section={section}
            index={index}
            answers={section.type === 'faq' ? faqAnswers[slug] : undefined}
          />
        )
        return anchor ? (
          <div key={i} id={anchor} className="scroll-mt-24">
            {el}
          </div>
        ) : (
          <Fragment key={i}>{el}</Fragment>
        )
      })}
    </>
  )
}
