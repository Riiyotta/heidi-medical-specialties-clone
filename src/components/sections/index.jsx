import { useState } from 'react'
import { ArrowRight, Check, Minus, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { resolveHref } from '../../lib/links.js'
import { Media } from '../Skeleton.jsx'

/* ------------------------------------------------------------------ atoms */

// Painted fills sampled from the live site (tools/recon-buttons.mjs), mapped
// onto design tokens. The same label is styled differently per placement —
// "Get Heidi free" is forest in a solutions hero, near-black in a CTA band and
// yellow on /scribe — so the style travels with each captured link.
const FILLS = {
  'rgb(25, 75, 34)': 'bg-forest text-drawer-invert hover:bg-forest-700',
  'rgb(40, 3, 15)': 'bg-dark-fill text-drawer-invert hover:bg-text-primary/90',
  'rgb(251, 245, 130)': 'bg-accent-yellow text-text-primary hover:brightness-95',
  'rgb(249, 244, 241)': 'bg-accent text-text-primary hover:bg-border-base',
  'rgb(255, 255, 255)': 'bg-card-white text-text-primary hover:bg-accent',
}
const FALLBACK = {
  primary: 'bg-forest text-drawer-invert hover:bg-forest-700',
  dark: 'bg-dark-fill text-drawer-invert hover:bg-text-primary/90',
  yellow: 'bg-accent-yellow text-text-primary hover:brightness-95',
  outline: 'border border-border-base text-text-primary hover:bg-accent',
}

export function Cta({ link, variant = 'outline' }) {
  const r = resolveHref(link.href)
  const st = link.style
  const base =
    'inline-flex items-center gap-2 rounded-button px-4 py-2.5 text-btn-outline font-medium transition-colors'
  let tone = FALLBACK[variant] || FALLBACK.outline
  let icon = variant !== 'ghost'
  if (st) {
    tone =
      FILLS[st.bg] ||
      (st.bd ? 'border border-border-base text-text-primary hover:bg-accent' : 'text-text-primary hover:bg-accent')
    icon = st.icon > 0
  }
  const styles =
    !st && variant === 'ghost'
      ? 'inline-flex items-center gap-2 rounded-2xl text-btn-outline font-medium text-text-primary hover:underline'
      : `${base} ${tone}`
  const body = (
    <>
      {link.t}
      {icon && <ArrowRight size={22} strokeWidth={1.5} />}
    </>
  )
  if (r?.to) return <Link to={r.to} className={styles}>{body}</Link>
  return (
    <a
      href={r?.href || '#'}
      {...(r?.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={styles}
    >
      {body}
    </a>
  )
}

// Every live band carries a background layer: a full-bleed colour, an inset
// 36px-radius panel, or a photo (captured as `section.layer`). Rendering that
// layer is what makes these pages read like the original rather than a stack
// of text blocks.
const rgb = (c) => (c || '').match(/\d+/g)?.map(Number)
const isDark = (c) => {
  const v = rgb(c)
  if (!v) return false
  return (0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]) / 255 < 0.5
}
// Dark bands invert their copy; the section renderers set primary ink.
const INVERT =
  '[&_h1]:text-drawer-invert [&_h2]:text-drawer-invert [&_h3]:text-drawer-invert [&_h6]:text-drawer-invert [&_p]:text-drawer-invert [&_li]:text-drawer-invert [&_blockquote]:text-drawer-invert [&_figcaption]:text-drawer-invert'

export function layerOf(section) {
  const l = section?.layer
  if (!l) return null
  const panel = l.radius && l.radius !== '0px' && l.inset?.x > 0
  return {
    panel,
    color: l.color,
    image: l.image && l.image.startsWith('/') ? l.image : null,
    dark: isDark(l.color),
  }
}

function Band({ children, bg, className = '', section }) {
  const layer = layerOf(section)
  const tone =
    !layer && bg === 'rgb(249, 244, 241)' ? 'bg-accent' : !layer && bg === 'rgb(251, 245, 130)' ? 'bg-accent-yellow' : ''
  const inner = <div className={`mx-auto ${/\bmax-w-/.test(className) ? '' : 'max-w-container-lg'} ${className}`}>{children}</div>

  if (layer?.panel) {
    return (
      <section className="px-3 py-12 md:px-12 md:py-12">
        <div
          className={`relative overflow-hidden rounded-[36px] px-5 py-16 md:px-20 md:py-24 ${layer.dark ? INVERT : ''}`}
          style={{ backgroundColor: layer.color || undefined, backgroundImage: layer.image ? `url(${layer.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          {inner}
        </div>
      </section>
    )
  }
  return (
    <section
      className={`px-global py-12 md:py-section-md ${tone} ${layer?.dark ? INVERT : ''}`}
      style={layer ? { backgroundColor: layer.image ? undefined : layer.color || undefined, backgroundImage: layer.image ? `url(${layer.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      {inner}
    </section>
  )
}

const headingClass = (lvl, fs) => {
  if (lvl === 1) return 'font-serif text-h1-mobile text-text-primary lg:text-h1-desktop'
  if (fs >= 56) return 'font-serif text-h2-mobile text-text-primary lg:text-h2-lg-desktop'
  if (fs <= 34) return 'font-serif text-h3-desktop text-text-primary'
  return 'font-serif text-h2-mobile text-text-primary lg:text-h2-desktop'
}

export function Heading({ block, className = '' }) {
  const Tag = block.as || `h${Math.min(block.lvl, 6)}`
  return <Tag className={`${headingClass(block.lvl, block.fs)} ${className}`}>{block.t}</Tag>
}

function Img({ block, className = '' }) {
  return (
    <Media
      src={block.src}
      alt={block.alt}
      loading="lazy"
      className={`h-full w-full object-cover ${className}`}
    />
  )
}

// Aspect ratio as rendered on the live page, so portraits stay portraits and
// wordmarks are not cropped into a 16:10 photo box.
const aspectOf = (img, fallback = '16 / 10') => (img?.w && img?.h ? `${img.w} / ${img.h}` : fallback)

/* --------------------------------------------------------------- sections */

export function Hero({ section }) {
  const b = section.blocks
  // Some live heroes split one headline across two h1s for line styling
  // ("This is your" / "safe space"); rejoin them into one heading.
  const h1s = b.filter((x) => x.k === 'h' && x.lvl === 1)
  const h = h1s.length > 1 ? { ...h1s[0], t: h1s.map((x) => x.t).join(' ') } : b.find((x) => x.k === 'h')
  const paras = b.filter((x) => x.k === 'p')
  const eyebrow = paras[0] && paras[0].fs <= 18 && paras[0].t.length < 70 ? paras[0] : null
  const body = paras.filter((p) => p !== eyebrow).slice(0, 2)
  const links = b.filter((x) => x.k === 'a' && x.href).slice(0, 2)
  // Links with no href in a hero are the live page's segmented toggles
  // (/pricing: "For Individuals" / "For Teams and Enterprise"), not CTAs.
  const toggles = b.filter((x) => x.k === 'a' && !x.href && !/[£$€]/.test(x.t))
  const [activeToggle, setActiveToggle] = useState(0)
  const img = b.find((x) => x.k === 'img')

  return (
    <Band bg={section.bg} section={section}>
      <div className={`grid grid-cols-1 items-center gap-12 ${img ? 'lg:grid-cols-2' : ''}`}>
        <div>
          {eyebrow && (
            <p className="mb-4 text-body font-semibold text-text-primary">{eyebrow.t}</p>
          )}
          {h && <Heading block={h} className="mb-6 max-w-xl" />}
          {body.map((p) => (
            <p key={p.t} className="mb-8 max-w-md text-body text-text-primary">
              {p.t}
            </p>
          ))}
          {toggles.length === 2 && (
            <div role="tablist" className="mb-6 inline-flex max-w-full rounded-button bg-accent p-1">
              {toggles.map((t, i) => (
                <button
                  key={t.t}
                  type="button"
                  role="tab"
                  aria-selected={activeToggle === i}
                  onClick={() => setActiveToggle(i)}
                  className={`rounded-lg px-4 py-2 text-nav-small font-medium transition-colors ${
                    activeToggle === i ? 'bg-card-white text-text-primary shadow-xs' : 'text-text-secondary'
                  }`}
                >
                  {t.t}
                </button>
              ))}
            </div>
          )}
          {/* Three or more are the "Ask Heidi" quick-action pills (home,
              /evidence) — sampled live: #FCFAF8 fill, 1px #F4E7DD border, 8px
              radius, 6px 12px padding, secondary text. */}
          {toggles.length > 2 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {toggles.map((t) => (
                <span
                  key={t.t}
                  className="rounded-lg border border-[#F4E7DD] bg-page px-3 py-1.5 text-nav-small text-text-secondary"
                >
                  {t.t}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {links.map((l, i) => (
              <Cta key={l.t + i} link={l} variant={i === 0 ? 'primary' : 'outline'} />
            ))}
          </div>
        </div>
        {img && (
          <div className="relative mx-auto aspect-[536/429] w-full max-w-[536px] overflow-hidden rounded-card">
            <Img block={img} />
          </div>
        )}
      </div>
    </Band>
  )
}

export function Split({ section, index }) {
  const b = section.blocks
  const h = b.find((x) => x.k === 'h')
  const paras = b.filter((x) => x.k === 'p')
  const links = b.filter((x) => x.k === 'a')
  const img = b.find((x) => x.k === 'img')
  // The live page alternates image-left / image-right down the column.
  const imageFirst = index % 2 === 0

  return (
    <Band bg={section.bg} section={section}>
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div className={`relative mx-auto aspect-[536/429] w-full max-w-[536px] overflow-hidden rounded-card ${imageFirst ? '' : 'lg:order-2'}`}>
          <Img block={img} />
        </div>
        <div className={imageFirst ? '' : 'lg:order-1'}>
          {h && <Heading block={h} className="mb-6" />}
          {paras.slice(0, 3).map((p) => (
            <p key={p.t} className="mb-6 max-w-md text-body text-text-primary">
              {p.t}
            </p>
          ))}
          <div className="flex flex-wrap gap-3">
            {links.map((l, i) => (
              <Cta key={l.t + i} link={l} variant="yellow" />
            ))}
          </div>
        </div>
      </div>
    </Band>
  )
}

export function Centered({ section }) {
  const b = section.blocks
  const h = b.find((x) => x.k === 'h')
  const paras = b.filter((x) => x.k === 'p')
  const links = b.filter((x) => x.k === 'a')
  return (
    <Band bg={section.bg} section={section} className="flex flex-col items-center text-center">
      {h && <Heading block={h} className="mb-6 max-w-3xl" />}
      {paras.slice(0, 2).map((p) => (
        <p key={p.t} className="mb-4 max-w-2xl text-body text-text-primary">
          {p.t}
        </p>
      ))}
      {links.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {links.slice(0, 2).map((l, i) => (
            <Cta key={l.t + i} link={l} variant={i === 0 ? 'primary' : 'outline'} />
          ))}
        </div>
      )}
    </Band>
  )
}

export function Pills({ section }) {
  const b = section.blocks
  const h = b.find((x) => x.k === 'h')
  const paras = b.filter((x) => x.k === 'p')
  // The first long paragraph is the section's sub-copy; the short ones after
  // the "Recommended for" label are the specialty chips.
  const labelIdx = paras.findIndex((p) => /^recommended for/i.test(p.t))
  const lead = paras.slice(0, labelIdx === -1 ? 1 : labelIdx)
  const chips = labelIdx === -1 ? paras.slice(1) : paras.slice(labelIdx + 1)
  return (
    <Band bg={section.bg} section={section} className="flex flex-col items-center text-center">
      {h && <Heading block={h} className="mb-6 max-w-3xl" />}
      {lead.map((p) => (
        <p key={p.t} className="mb-8 max-w-2xl text-body text-text-primary">
          {p.t}
        </p>
      ))}
      {labelIdx !== -1 && <p className="mb-4 text-caption text-text-primary">Recommended for</p>}
      <div className="flex flex-wrap justify-center gap-3">
        {chips.map((c) => (
          <span
            key={c.t}
            className="rounded-full border border-text-secondary px-2 py-1 text-nav-small text-text-secondary"
          >
            {c.t}
          </span>
        ))}
      </div>
    </Band>
  )
}

export function Stats({ section }) {
  const b = section.blocks
  const h = b.find((x) => x.k === 'h' && x.lvl <= 2)
  const items = []
  b.forEach((x, i) => {
    if (x.k === 'h' && x.lvl >= 3) {
      const caption = b.slice(i + 1).find((y) => y.k === 'p')
      items.push({ value: x.t, caption: caption?.t })
    }
  })
  return (
    <Band bg={section.bg} section={section} className="flex flex-col items-center text-center">
      {h && <Heading block={h} className="mb-12 max-w-3xl" />}
      <dl className="grid w-full grid-cols-1 gap-8 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.value} className="flex flex-col gap-2">
            <dt className="font-serif text-h3-desktop text-text-primary">{it.value}</dt>
            <dd className="text-body text-text-secondary">{it.caption}</dd>
          </div>
        ))}
      </dl>
    </Band>
  )
}

export function Quotes({ section }) {
  const b = section.blocks
  const h = b.find((x) => x.k === 'h')
  const link = b.find((x) => x.k === 'a' && x.href)
  const paras = b.filter((x) => x.k === 'p')
  const cards = []
  paras.forEach((p, i) => {
    if (!/^[“"”']/.test(p.t)) return
    const after = paras.slice(i + 1, i + 3).filter((x) => !/^[“"”']/.test(x.t))
    cards.push({ quote: p.t, name: after[0]?.t, role: after[1]?.t })
  })
  return (
    <Band bg={section.bg} section={section}>
      <div className="mb-12 grid items-end gap-8 md:grid-cols-2">
        {h && <Heading block={h} />}
        {link && (
          <div className="md:justify-self-end">
            <Cta link={link} />
          </div>
        )}
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <figure
            key={c.quote}
            className="flex h-full flex-col rounded-xl border border-border-base bg-card-white p-6 lg:shadow-testimonial-md"
          >
            <blockquote className="font-serif text-h6-quote text-text-primary">{c.quote}</blockquote>
            <figcaption className="mt-auto pt-6">
              <p className="text-nav-small font-semibold text-text-primary">{c.name}</p>
              {c.role && <p className="text-nav-small text-text-secondary">{c.role}</p>}
            </figcaption>
          </figure>
        ))}
      </div>
    </Band>
  )
}

// FAQ, measured on the live site: two-column grid (heading left, list right in
// a 600px column), 8px between items, each item a 24px-radius card that is
// transparent when closed (hover: accent) and white when open. Questions are
// set in exposure 24/30 — the h3 wrapper is inter, which is what the first
// recon mistakenly sampled. Five questions show, then "Show more".
const FAQ_PAGE = 5

export function FaqList({ items, initialOpen = 0 }) {
  const [open, setOpen] = useState(initialOpen)
  const [shown, setShown] = useState(FAQ_PAGE)
  const visible = items.slice(0, shown)
  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <ul className="flex flex-col gap-2">
        {visible.map((it, i) => {
          const isOpen = open === i
          const panelId = `faq-panel-${i}-${it.q.length}`
          return (
            <li
              key={it.q}
              className={`flex flex-col rounded-card transition-colors ${
                isOpen ? 'bg-card-white' : 'hover:bg-accent'
              }`}
            >
              <h3 className="flex">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex flex-1 items-center justify-between gap-6 rounded-card p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/50"
                >
                  <span className="font-serif text-xl leading-[25px] tracking-[-1px] text-text-primary md:text-h6-quote">{it.q}</span>
                  <span className="relative h-6 w-6 shrink-0" aria-hidden>
                    <Minus size={24} strokeWidth={1.5} className="absolute inset-0 text-text-primary" />
                    <Plus
                      size={24}
                      strokeWidth={1.5}
                      className={`absolute inset-0 text-text-primary transition-transform duration-300 ${
                        isOpen ? 'scale-0' : 'scale-100'
                      }`}
                    />
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                className={`grid transition-all duration-300 ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-3 px-6 pb-6">
                    {[...new Set(it.a || [])].map((para) => (
                      <p key={para} className="text-body text-text-primary">
                        {para}
                      </p>
                    ))}
                    {it.links?.length > 0 && (
                      <p className="flex flex-wrap gap-x-4 gap-y-1">
                        {it.links
                          .filter((l, j, all) => all.findIndex((x) => x.t === l.t && x.href === l.href) === j)
                          .map((l, j) => {
                          const r = resolveHref(l.href)
                          return r?.to ? (
                            <Link key={j} to={r.to} className="text-body text-text-primary underline underline-offset-2">
                              {l.t}
                            </Link>
                          ) : (
                            <a
                              key={j}
                              href={r?.href || l.href}
                              {...(r?.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                              className="text-body text-text-primary underline underline-offset-2"
                            >
                              {l.t}
                            </a>
                          )
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      {items.length > FAQ_PAGE && shown < items.length && (
        <div className="flex justify-center">
          <p className="sr-only" aria-live="polite">
            Showing {visible.length} of {items.length} questions
          </p>
          <button
            type="button"
            onClick={() => setShown((n) => n + FAQ_PAGE)}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-btn-outline text-text-primary transition-colors hover:bg-accent"
          >
            Show more
            <Plus size={16} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  )
}

export function Faq({ section, answers }) {
  const b = section.blocks
  const h = b.find((x) => x.k === 'h' && x.lvl <= 2)
  // Prefer the full answered list from the second recon pass; fall back to
  // whatever questions the first pass saw.
  const items =
    answers?.length > 0
      ? answers.filter((a) => a.a?.length)
      : b
          .map((x, i) => (x.k === 'h' && x.lvl >= 3 ? { q: x.t, a: b[i + 1]?.k === 'p' ? [b[i + 1].t] : [] } : null))
          .filter(Boolean)
  return (
    <Band section={section} className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-section-md">
      {h ? <Heading block={h} /> : <div />}
      <FaqList items={items} />
    </Band>
  )
}

export function Cards({ section }) {
  const [shown, setShown] = useState(0)
  const b = section.blocks
  const firstImg = b.findIndex((x) => x.k === 'img')
  const head = b.slice(0, firstImg)
  const h = head.find((x) => x.k === 'h' && x.lvl <= 2)
  const eyebrow = head.find((x) => x.k === 'p' && x.t.length < 40 && head.indexOf(x) < head.indexOf(h))
  const intro = head.find((x) => x.k === 'p' && x !== eyebrow)

  // A card runs from one image up to the next, so each keeps its own title,
  // copy and links (e.g. /download: Android → "Get it on Google Play").
  const cards = []
  b.forEach((x, i) => {
    if (x.k !== 'img') return
    const next = b.findIndex((y, j) => j > i && y.k === 'img')
    const body = b.slice(i + 1, next === -1 ? b.length : next)
    const titleH = body.find((y) => y.k === 'h')
    const links = body.filter((y) => y.k === 'a')
    const title = titleH || (links.length === 1 ? links[0] : null)
    cards.push({
      img: x,
      title: title?.t,
      href: !titleH && links.length === 1 ? links[0].href : null,
      text: body.filter((y) => y.k === 'p').map((y) => y.t),
      // Cap the trailing run: on index pages the last card would otherwise
      // swallow every remaining link in the band (e.g. /customers' 60+ hidden
      // "load more" entries).
      links: (titleH ? links : links.length > 1 ? links : []).slice(0, 2),
    })
  })
  // Keep the captured proportions when every image in the row shares one;
  // otherwise use each image's own.
  // Live pages show a first page of cards behind a "Load more" control; wide
  // captured images (>=500px) sit two-up rather than three.
  // Bands whose captured images are large are laid out on live as stacked
  // rows (copy beside the illustration), not as a grid of small cards.
  const rows = cards.length > 2 && cards[0]?.img?.w >= 600
  const wide = cards[0]?.img?.w >= 500
  const cols = cards.length === 2 || wide ? 'md:grid-cols-2' : cards.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'
  const PAGE = wide ? 6 : 9
  if (rows)
    return (
      <Band bg={section.bg} section={section}>
        {eyebrow && <p className="mb-4 text-body text-text-secondary">{eyebrow.t}</p>}
        {h && <Heading block={h} className="mb-4" />}
        {intro && <p className="mb-12 max-w-2xl text-body text-text-primary">{intro.t}</p>}
        <div className="flex flex-col gap-16 md:gap-24">
          {cards.map((c, i) => (
            <div key={i} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-20">
              <div className={`order-2 ${i % 2 ? 'lg:order-1' : 'lg:order-2'}`}>
                <Media src={c.img.src} alt={c.img.alt} loading="lazy" className="w-full rounded-card" style={{ aspectRatio: aspectOf(c.img) }} />
              </div>
              <div className={`order-1 ${i % 2 ? 'lg:order-2' : 'lg:order-1'}`}>
                {c.title && <h3 className="mb-4 font-serif text-h3-desktop text-text-primary">{c.title}</h3>}
                {c.text.map((t) => (
                  <p key={t} className="mb-4 max-w-md text-body text-text-primary">
                    {t}
                  </p>
                ))}
                {c.links.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {c.links.map((l, j) => (
                      <Cta key={l.t + j} link={l} variant={j === 0 ? 'primary' : 'outline'} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Band>
    )

  return (
    <Band bg={section.bg} section={section}>
      {eyebrow && <p className="mb-4 text-body text-text-secondary">{eyebrow.t}</p>}
      {h && <Heading block={h} className="mb-4" />}
      {intro && <p className="mb-12 max-w-2xl text-body text-text-primary">{intro.t}</p>}
      {!intro && h && <div className="mb-8" />}
      <div className={`grid grid-cols-1 items-stretch gap-4 ${cols}`}>
        {cards.slice(0, PAGE + shown).map((c, i) => {
          const r = resolveHref(c.href)
          const inner = (
            <>
              {c.img.w && c.img.w <= 80 ? (
                // Icon-sized on live (e.g. /scribe's 24px timeline glyphs) —
                // draw it at that size instead of stretching it to the card.
                <Media src={c.img.src} alt={c.img.alt} loading="lazy" className="mb-4" style={{ width: c.img.w, height: c.img.h }} />
              ) : (
                <div className="mb-4 w-full overflow-hidden rounded-xl" style={{ aspectRatio: aspectOf(c.img) }}>
                  <Img block={c.img} />
                </div>
              )}
              {c.title && <p className="text-card-title font-medium text-text-primary">{c.title}</p>}
              {c.text.map((t) => (
                <p key={t} className="mt-2 text-caption text-text-secondary">
                  {t}
                </p>
              ))}
              {c.links.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  {c.links.map((l, j) => (
                    <Cta key={l.t + j} link={l} variant={j === 0 ? 'primary' : 'outline'} />
                  ))}
                </div>
              )}
            </>
          )
          const cls =
            'group flex h-full flex-col rounded-card border border-border-base bg-card-white p-4 transition-shadow hover:shadow-xs'
          if (r?.to)
            return (
              <Link key={i} to={r.to} className={cls}>
                {inner}
              </Link>
            )
          if (r?.href)
            return (
              <a
                key={i}
                href={r.href}
                {...(r.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={cls}
              >
                {inner}
              </a>
            )
          return (
            <div key={i} className={cls}>
              {inner}
            </div>
          )
        })}
      </div>
      {cards.length > PAGE + shown && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE)}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-btn-outline text-text-primary transition-colors hover:bg-accent"
          >
            Load more
            <Plus size={16} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </Band>
  )
}

// Partner wordmarks. The live site scrolls these as a marquee; here they sit
// as a static, wrapped strip at their captured 154×60 size, never cropped.
export function Logos({ section }) {
  const imgs = section.blocks.filter((x) => x.k === 'img')
  return (
    <Band section={section}>
      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {imgs.map((img) => (
            <li key={img.src} style={{ width: img.w, aspectRatio: aspectOf(img) }}>
              <Media src={img.src} alt={img.alt} loading="lazy" className="h-full w-full object-contain" />
            </li>
        ))}
      </ul>
    </Band>
  )
}

const LINKS_PAGE = 12

// Link directories. When the band interleaves headings with links (e.g.
// /tools: ten categories over 57 tools) the groups are kept and everything is
// shown, as on live; a flat run of links (article indexes) paginates instead.
export function Links({ section }) {
  const [shown, setShown] = useState(0)
  const b = section.blocks
  const lead = b.find((x) => x.k === 'h')
  const intro = b.find((x) => x.k === 'p')
  const groups = []
  let cur = null
  for (const x of b) {
    if (x.k === 'h' && x !== lead) {
      cur = { title: x.t, links: [] }
      groups.push(cur)
    } else if (x.k === 'a' && x.href) {
      if (!cur) {
        cur = { title: null, links: [] }
        groups.push(cur)
      }
      cur.links.push(x)
    }
  }
  const grouped = groups.filter((g) => g.title && g.links.length).length > 1
  const flat = groups.flatMap((g) => g.links)
  const cls =
    'flex h-full items-center justify-between gap-3 rounded-card border border-border-base bg-card-white p-4 text-card-title font-medium text-text-primary transition-shadow hover:shadow-xs'
  const Item = ({ l }) => {
    const r = resolveHref(l.href)
    const inner = (
      <>
        <span>{l.t}</span>
        <ArrowRight size={18} className="shrink-0 text-sage" />
      </>
    )
    return r?.to ? (
      <Link to={r.to} className={cls}>
        {inner}
      </Link>
    ) : (
      <a href={r?.href || '#'} {...(r?.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={cls}>
        {inner}
      </a>
    )
  }
  return (
    <Band section={section} bg={section.bg}>
      {lead && <Heading block={lead} className="mb-4" />}
      {intro && <p className="mb-12 max-w-2xl text-body text-text-primary">{intro.t}</p>}
      {grouped ? (
        <div className="flex flex-col gap-12">
          {groups.filter((g) => g.links.length).map((g, i) => (
            <div key={g.title || i}>
              {g.title && <h3 className="mb-6 font-serif text-h3-desktop text-text-primary">{g.title}</h3>}
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {g.links.map((l, k) => (
                  <li key={l.t + k}>
                    <Item l={l} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flat.slice(0, LINKS_PAGE + shown).map((l, i) => (
              <li key={l.t + i}>
                <Item l={l} />
              </li>
            ))}
          </ul>
          {flat.length > LINKS_PAGE + shown && (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={() => setShown((n) => n + LINKS_PAGE)}
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-btn-outline text-text-primary transition-colors hover:bg-accent"
              >
                Load more
                <Plus size={16} strokeWidth={1.5} />
              </button>
            </div>
          )}
        </>
      )}
    </Band>
  )
}

export function Prose({ section }) {
  const b = section.blocks
  return (
    <Band bg={section.bg} section={section}>
      <div className="flex flex-col gap-6">
        {b.map((x, i) => {
          if (x.k === 'h') return <Heading key={i} block={x} />
          if (x.k === 'p')
            return (
              <p key={i} className="max-w-2xl text-body text-text-primary">
                {x.t}
              </p>
            )
          if (x.k === 'img')
            return (
              <div key={i} className="max-w-[536px] overflow-hidden rounded-card">
                <Img block={x} />
              </div>
            )
          if (x.k === 'a' && x.t)
            return (
              <div key={i}>
                <Cta link={x} />
              </div>
            )
          return null
        })}
      </div>
    </Band>
  )
}

export function CtaBand({ section }) {
  const b = section.blocks
  const h = b.find((x) => x.k === 'h')
  const paras = b.filter((x) => x.k === 'p')
  const links = b.filter((x) => x.k === 'a')
  const layer = layerOf(section) || { panel: true, color: 'rgb(251, 245, 130)' }
  const yellow = layer.color === 'rgb(251, 245, 130)'
  const mask = {
    maskImage: 'url(/assets/icons/pattern-5.svg)',
    WebkitMaskImage: 'url(/assets/icons/pattern-5.svg)',
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
  }
  // Pattern tint per band colour, as measured on the live closers.
  const tint = yellow ? '#FDFAC4' : layer.dark ? '#2B6433' : '#F6ECE4'
  const body = (
    <div className={`relative flex flex-col items-center text-center ${layer.dark ? INVERT : ''}`}>
      {h && <Heading block={h} className="mb-6 max-w-3xl" />}
      {paras.slice(0, 1).map((p) => (
        <p key={p.t} className="mb-8 max-w-xl text-body text-text-primary">
          {p.t}
        </p>
      ))}
      <div className="flex flex-wrap justify-center gap-3">
        {links.slice(0, 2).map((l, i) => (
          <Cta key={l.t + i} link={l} variant={i === 0 ? (layer.dark ? 'outline' : 'dark') : 'outline'} />
        ))}
      </div>
    </div>
  )
  const edges =
    layer.color && !layer.image
      ? ['left-0', 'right-0 -scale-x-100'].map((pos) => (
          <div key={pos} aria-hidden className={`pointer-events-none absolute top-1/2 hidden h-[743px] w-[283px] -translate-y-1/2 md:block ${pos}`} style={{ backgroundColor: tint, ...mask }} />
        ))
      : null

  if (layer.panel !== false)
    return (
      <section className="px-3 py-12 md:px-12">
        <div
          className="relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden rounded-[36px] px-6 py-16 md:min-h-[425px]"
          style={{ backgroundColor: layer.image ? undefined : layer.color, backgroundImage: layer.image ? `url(${layer.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          {edges}
          {body}
        </div>
      </section>
    )
  return (
    <section
      className="relative flex min-h-[380px] items-center justify-center overflow-hidden px-global py-20"
      style={{ backgroundColor: layer.image ? undefined : layer.color, backgroundImage: layer.image ? `url(${layer.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {edges}
      {body}
    </section>
  )
}

export const renderers = {
  logos: Logos,
  hero: Hero,
  split: Split,
  centered: Centered,
  pills: Pills,
  stats: Stats,
  quotes: Quotes,
  faq: Faq,
  cards: Cards,
  links: Links,
  prose: Prose,
  cta: CtaBand,
}
