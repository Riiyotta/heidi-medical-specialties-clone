import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUp, ArrowLeftRight, MessageSquareText, Pill, Plus, Search, SkipForward, Stethoscope, icons } from 'lucide-react'
import { FaqList } from '../sections/index.jsx'
import { Link } from 'react-router-dom'
import { resolveHref } from '../../lib/links.js'
import mark from '../../data/heidi-mark.json'
import { Media, PulseLayer } from '../Skeleton.jsx'

// Band toolkit for the product pages (Scribe, Evidence, Remote, Dictate,
// Coding …). Every value here was measured on the live pages at 1440px with
// tools/capture-bands.mjs; the per-page files only supply content.

/* ------------------------------------------------------------------ atoms */

export function HeidiMark({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox={mark.viewBox} fill="currentColor" aria-hidden className={`shrink-0 ${className}`}>
      {mark.d.map((d) => (
        <path key={d.slice(0, 16)} d={d} />
      ))}
    </svg>
  )
}

export function Sparkle({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 22 22" fill="currentColor" aria-hidden className={`shrink-0 ${className}`}>
      <path d="M0.25 10.2661H6.28951C8.34771 10.2661 10.0161 8.59771 10.0161 6.53951V0.5H11.4839V6.53951C11.4839 8.59771 13.1523 10.2661 15.2105 10.2661H21.25V11.7339H15.2105C13.1523 11.7339 11.4839 13.4023 11.4839 15.4605V21.5H10.0161V15.4605C10.0161 13.4023 8.34771 11.7339 6.28951 11.7339H0.25V10.2661Z" />
    </svg>
  )
}

const TONES = {
  yellow: 'bg-accent-yellow text-text-primary shadow-btn-primary hover:brightness-95',
  dark: 'bg-dark-fill text-drawer-invert hover:bg-text-primary/90',
  forest: 'bg-forest text-drawer-invert hover:bg-forest-700',
  sand: 'bg-accent text-text-primary hover:bg-border-base',
  white: 'bg-card-white text-text-primary hover:bg-accent',
  ghost: 'text-text-primary hover:underline',
}

// Buttons: 12px radius, 10px × 16px, inter 16/22.4/−0.48 medium.
export function Button({ to, tone = 'yellow', icon, trailing, children, className = '' }) {
  const r = resolveHref(to)
  const pad = tone === 'ghost' ? '' : 'px-4 py-2.5'
  const cls = `inline-flex items-center gap-2 rounded-button ${pad} text-btn-outline font-medium tracking-[-0.48px] transition ${TONES[tone]} ${className}`
  const body = (
    <>
      {icon}
      {children}
      {trailing}
    </>
  )
  if (r?.to)
    return (
      <Link to={r.to} className={cls}>
        {body}
      </Link>
    )
  return (
    <a href={r?.href || to} {...(r?.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={cls}>
      {body}
    </a>
  )
}

// Headline copy may carry one emphasised (italic) phrase, written *like this*.
export function Rich({ text }) {
  const parts = text.split(/(\*[^*]+\*)/)
  return parts.map((p, i) => (p.startsWith('*') ? <em key={i} className="italic">{p.slice(1, -1)}</em> : p))
}

const H1 = 'font-serif text-[44px] leading-[44px] tracking-[-2.2px] text-text-primary md:text-[72px] md:leading-[72px] md:tracking-[-3.6px]'
const H2 = 'font-serif text-h2-mobile text-text-primary md:text-h2-lg-desktop'
const LEAD = 'text-lg leading-[25.2px] tracking-[-0.54px] text-text-primary md:text-xl md:leading-7 md:tracking-[-0.6px]'

export function Band({ children, className = '', inner = '' }) {
  return (
    <section className={`px-global py-12 md:py-section-md ${className}`}>
      {/* A band may narrow its own column; otherwise it is the 1280px grid. */}
      <div className={`mx-auto ${/\bmax-w-/.test(inner) ? '' : 'max-w-container-lg'} ${inner}`}>{children}</div>
    </section>
  )
}

/* ------------------------------------------------------------ product hero */

// Measured (Scribe/Evidence): centred. A near-black pill badge with the Heidi
// mark and the product name in exposure italic 24; h1 exposure 72/72/−3.6 in
// 768px; lead inter 20/28/−0.6; the product visual; then the two CTAs.
export function ProductHero({ badge, title, lead, visual, buttons, buttonsFirst = false }) {
  const ctas = (
    <div className="flex flex-wrap justify-center gap-3">
      {buttons.map((b) => (
        <Button key={b.t} to={b.to} tone={b.tone} icon={b.icon}>
          {b.t}
        </Button>
      ))}
    </div>
  )
  return (
    <Band inner="flex flex-col items-center text-center">
      {badge && (
        <span className="mb-8 inline-flex items-center gap-2 rounded-full bg-dark-fill py-1 pl-2 pr-4 text-[#F6ECE4]">
          <HeidiMark className="h-7 w-7" />
          <span className="font-serif text-2xl italic leading-[30px] tracking-[-1.2px]">{badge}</span>
        </span>
      )}
      <h1 className={`max-w-3xl ${H1}`}>
        <Rich text={title} />
      </h1>
      {lead && <p className={`mt-4 max-w-2xl ${LEAD}`}>{lead}</p>}
      {buttonsFirst && <div className="mt-8">{ctas}</div>}
      {visual?.node && <div className="mt-10 w-full">{visual.node}</div>}
      {visual?.src && <Media src={visual.src} alt="" className="mt-10 w-full" style={{ aspectRatio: `${visual.w} / ${visual.h}` }} />}
      {!buttonsFirst && <div className="mt-10">{ctas}</div>}
    </Band>
  )
}

/* ---------------------------------------------------------- logo marquee */

// Measured: 83×32 logos on an 80px gap, band 192px tall, scrolling left in a
// seamless loop (the live track holds the list several times over).
export function LogoMarquee({ logos, label, duration = 40, size }) {
  const row = [...logos, ...logos]
  return (
    <section className="overflow-hidden py-12 md:py-section-md">
      {label && <p className="mb-8 text-center text-body text-text-primary">{label}</p>}
      <div
        className="relative"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <ul className="flex w-max animate-[marquee_var(--d)_linear_infinite]" style={{ '--d': `${duration}s` }}>
          {row.map((l, i) => (
            <li key={i} className="shrink-0 pr-20" aria-hidden={i >= logos.length}>
              <Media
                src={l.src}
                alt={i < logos.length ? l.alt : ''}
                className="w-auto object-contain"
                style={size ? { width: size.w, height: size.h } : l.w ? { width: l.w, height: 32 } : { height: 32, maxWidth: 140 }}
                loading="lazy"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- tabs split */

// Measured (Scribe "Vanquish the paperwork"): heading block left (56px h2,
// 18px lead, yellow CTA), then 584px tab rail column + 584×584 visual right.
// Tabs: 2px top rail, 24px top padding, 40px apart; title exposure 24/30,
// inactive secondary; body inter 16/22.4 secondary. Autoplays every 5s with a
// linear progress fill on the rail, like the solutions pages.
const AUTOPLAY_MS = 5000

export function TabsSplit({ title, lead, cta, tabs, center = false, aspect = '1 / 1', headingSize = 56 }) {
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    const start = performance.now()
    setProgress(0)
    const tick = (now) => {
      const pct = Math.min(100, ((now - start) / AUTOPLAY_MS) * 100)
      setProgress(pct)
      if (pct >= 100) return setActive((i) => (i + 1) % tabs.length)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [active, tabs.length])
  return (
    <Band>
      <div className={center ? 'text-center' : ''}>
        <h2 className={`max-w-3xl ${center ? 'mx-auto' : ''} ${headingSize === 48 ? 'font-serif text-h2-mobile text-text-primary md:text-h2-desktop' : H2}`}>
          <Rich text={title} />
        </h2>
        {lead && <p className={`mt-4 max-w-2xl text-lg leading-[25.2px] tracking-[-0.54px] text-text-primary ${center ? 'mx-auto' : ''}`}>{lead}</p>}
        {cta && (
          <div className="mt-8">
            <Button to={cta.to} tone={cta.tone || 'yellow'}>
              {cta.t}
            </Button>
          </div>
        )}
      </div>
      <div className="mt-12 grid items-start gap-12 md:mt-20 lg:grid-cols-[584px_1fr] lg:gap-[112px]">
        <div className="flex flex-col gap-10" role="tablist" aria-label={title.replace(/\*/g, '')}>
          {tabs.map((t, i) => {
            const on = i === active
            return (
              <button
                key={t.title}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => i !== active && setActive(i)}
                className="relative flex flex-col border-t-2 border-border-base pt-6 text-left"
              >
                <span aria-hidden className="absolute left-0 top-0 -mt-0.5 h-[2px] bg-text-primary" style={{ width: on ? `${progress}%` : '0%' }} />
                <span className={`font-serif text-h3-desktop transition-colors duration-300 ${on ? 'text-text-primary' : 'text-text-secondary'}`}>{t.title}</span>
                <span className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: on ? '1fr' : '0fr' }}>
                  <span className="min-h-0 overflow-hidden">
                    <span className="block pt-2 text-body tracking-[-0.48px] text-text-secondary">{t.body}</span>
                    <Media src={t.img} alt="" loading="lazy" className="mt-6 w-full lg:hidden" style={{ aspectRatio: aspect }} />
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        <div className="relative hidden w-full lg:block" style={{ aspectRatio: aspect }}>
          {tabs.map((t, i) => (
            <Media key={t.img} src={t.img} alt="" className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${i === active ? 'opacity-100' : 'opacity-0'}`} />
          ))}
        </div>
      </div>
    </Band>
  )
}

/* ---------------------------------------------------------- practice panel */

// Measured (Scribe "In practice"): #F9F4F1 panel, 36px radius, 64px padding;
// eyebrow inter 18/25.2 semibold secondary with a plus; 56px heading; an
// arrow link; the specialty list in two 190px columns, 16px rows, the active
// one primary with a plus marker; round prev/next arrows; 643×632 preview.
export function PracticePanel({ title, link, items, columns = 2, blurb }) {
  const [active, setActive] = useState(0)
  const go = (d) => setActive((i) => (i + d + items.length) % items.length)
  return (
    <section className="px-global py-12 md:py-section-md">
      <div className="mx-auto flex max-w-container-lg flex-col gap-12 rounded-[36px] bg-accent p-8 lg:flex-row lg:gap-20 lg:p-16">
        <div className="flex flex-col justify-between gap-12 lg:w-[429px] lg:shrink-0">
          <div className="flex flex-col items-start gap-6">
            <p className="flex items-center gap-1.5 text-lg font-semibold tracking-[-0.54px] text-text-secondary">
              <Plus size={18} strokeWidth={1.5} /> In practice
            </p>
            <h2 className={H2}>
              <Rich text={title} />
            </h2>
            {link && (
              <Button to={link.to} tone="ghost" trailing={<ArrowRight size={24} strokeWidth={1.5} />}>
                {link.t}
              </Button>
            )}
            {blurb && <p className="text-body font-medium text-text-primary md:text-xl md:leading-7">{blurb}</p>}
          </div>
          <div>
            <ul
              className={`grid gap-x-10 gap-y-4 ${columns === 2 ? 'grid-flow-col grid-cols-2' : 'grid-cols-1'}`}
              style={columns === 2 ? { gridTemplateRows: `repeat(${Math.ceil(items.length / 2)}, auto)` } : undefined}
              role="tablist"
              aria-label="Specialties"
            >
              {items.map((it, i) => (
                <li key={it.label} className="relative">
                  {i === active && <Plus size={24} strokeWidth={1.5} className="absolute -left-7 top-0 hidden text-text-primary md:block" aria-hidden />}
                  <button
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    aria-label={`Select ${it.label}`}
                    onClick={() => setActive(i)}
                    className={`text-left text-body tracking-[-0.48px] transition-colors ${i === active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    {it.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-12 flex gap-3">
              {[['Previous', ArrowLeft, -1], ['Next', ArrowRight, 1]].map(([name, Icon, d]) => (
                <button key={name} type="button" aria-label={`${name} slide`} onClick={() => go(d)} className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:text-text-primary">
                  <Icon size={24} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="relative hidden w-full lg:block lg:max-w-[643px]" style={{ aspectRatio: '643 / 632' }}>
          {items.map((it, i) => (
            <Media key={it.img} src={it.img} alt="" loading="lazy" className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${i === active ? 'opacity-100' : 'opacity-0'}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- timeline */

// Measured (Scribe "Make your next shift"): centred eyebrow (sparkle + inter
// 18 medium secondary), 56px heading, yellow CTA; then a 1280×305 stage with
// a 3px #D9D9D9 curve that draws itself in (pathLength 1, dash offset 1 → 0)
// and three steps riding it — 28px icon, exposure 24/30 title, inter 16 body
// in 280px. Phones: a plain vertical list.
export function Timeline({ eyebrow, title, lead, cta, steps }) {
  const ref = useRef(null)
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setDrawn(true), io.disconnect()), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Band inner="flex flex-col items-center">
      {eyebrow && (
        <p className="mb-6 flex items-center gap-2 text-lg font-medium tracking-[-0.54px] text-text-secondary">
          <Sparkle className="h-5 w-5" /> {eyebrow}
        </p>
      )}
      <h2 className={`max-w-4xl text-center ${H2}`}>{title}</h2>
      {lead && <p className="mt-6 max-w-md text-center text-body tracking-[-0.48px] text-text-primary">{lead}</p>}
      {cta && (
        <div className="mt-8">
          <Button to={cta.to}>{cta.t}</Button>
        </div>
      )}
      <div ref={ref} className="relative mt-16 w-full lg:h-[305px] lg:mt-20">
        <svg viewBox="0 0 1280 305" preserveAspectRatio="none" className="absolute inset-0 hidden h-full w-full lg:block" aria-hidden>
          <path
            d="M -32.8,64.69 C 6.56,65.35 29.44,57.74 164,68 C 298.56,78.26 449.6,125.6 640,116 C 830.4,106.4 981.44,40.52 1116,20 C 1250.56,-0.52 1273.44,14.71 1312.8,13.38"
            fill="none"
            stroke="#D9D9D9"
            strokeWidth="3"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1 1"
            style={{ strokeDashoffset: drawn ? 0 : 1, transition: 'stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <ol className="flex flex-col gap-10 lg:block">
          {steps.map((s, i) => (
            <li key={s.title} className="lg:absolute lg:w-[280px]" style={{ left: s.x, top: s.y }}>
              {/* Live: the step glyph sits on a yellow disc centred on the curve. */}
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent-yellow">
                <Media src={s.icon} alt="" className="h-6 w-6" />
              </span>
              <h3 className="mb-6 font-serif text-h3-desktop text-text-primary">{s.title}</h3>
              <p className="text-body tracking-[-0.48px] text-text-primary">{s.body}</p>
              <span className="sr-only">Step {i + 1}</span>
            </li>
          ))}
        </ol>
      </div>
    </Band>
  )
}

/* ------------------------------------------------------- product cards panel */

// Measured (Scribe "Extend care beyond the note"): white panel inset 48px,
// 36px radius; centred 56px heading + 18px lead; two cards (544×306 visuals,
// exposure 32 titles, inter 16 body, yellow CTAs) 64px apart.
export function ProductCardsPanel({ title, lead, cards, tone = 'white' }) {
  return (
    <section className="py-12 md:px-12 md:py-12">
      <div className={`rounded-[36px] px-5 py-16 md:px-20 md:py-32 ${tone === 'white' ? 'bg-card-white' : 'bg-accent'}`}>
        <div className="mx-auto max-w-[1184px]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className={H2}>
              <Rich text={title} />
            </h2>
            {lead && <p className="mt-4 text-lg leading-[25.2px] tracking-[-0.54px] text-text-primary">{lead}</p>}
          </div>
          <div className="mt-12 grid gap-12 md:mt-16 md:grid-cols-2 md:gap-16">
            {cards.map((c) => (
              <article key={c.title} className="flex flex-col items-start">
                <Media src={c.img} alt="" loading="lazy" className="mb-8 w-full" style={{ aspectRatio: '544 / 306' }} />
                <h3 className="mb-3 font-serif text-[28px] leading-[34px] tracking-[-1.4px] text-text-primary md:text-[32px] md:leading-[38.4px] md:tracking-[-1.6px]">{c.title}</h3>
                <p className="mb-8 text-body tracking-[-0.48px] text-text-primary">{c.body}</p>
                <Button to={c.cta.to} className="mt-auto">
                  {c.cta.t}
                </Button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- partner CTA */

// Measured (Scribe/Evidence closer): yellow panel inset 32px, 36px radius,
// 716px tall; 60px Heidi mark, 56px heading, 32px sub (exposure), and a
// near-black 36px-radius button (inter 18 semibold, sparkle icon); a dark
// 1856×472 swoosh sits across the bottom.
export function PartnerCta({ title = 'Start practicing with a partner', sub = 'Care is better with Heidi', cta = { t: 'Get Heidi free', to: 'https://scribe.heidihealth.com/onboarding' } }) {
  return (
    <section className="p-3 md:p-8">
      <div className="relative flex min-h-[560px] flex-col items-center overflow-hidden rounded-[36px] bg-accent-yellow px-6 pt-24 text-center md:h-[716px] md:pt-36">
        <HeidiMark className="h-12 w-12 text-text-primary md:h-[60px] md:w-[60px]" />
        <h2 className={`mt-10 ${H2}`}>{title}</h2>
        <p className="mt-6 font-serif text-2xl tracking-[-1.2px] text-text-primary md:text-[32px] md:leading-[38.4px] md:tracking-[-1.6px]">{sub}</p>
        <a
          href={cta.to}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 mt-10 inline-flex items-center gap-2 rounded-[36px] bg-dark-fill p-4 text-lg font-semibold tracking-[-0.54px] text-drawer-invert transition hover:bg-text-primary/90"
        >
          <Sparkle className="h-6 w-6 text-accent-yellow" />
          {cta.t}
        </a>
        <Media src="/assets/shared/cta-swoosh.svg" alt="" aria-hidden className="pointer-events-none absolute left-1/2 top-[276px] w-[1856px] max-w-none -translate-x-1/2 md:top-auto md:bottom-[-32px]" />
      </div>
    </section>
  )
}

/* -------------------------------------------------------------- statement */

export function Statement({ title, lead, cta }) {
  return (
    <Band inner="mx-auto max-w-3xl text-center">
      <h2 className={H2}>
        <Rich text={title} />
      </h2>
      {lead && <p className="mt-6 text-body tracking-[-0.48px] text-text-primary">{lead}</p>}
      {cta && (
        <div className="mt-8">
          <Button to={cta.to} tone={cta.tone}>
            {cta.t}
          </Button>
        </div>
      )}
    </Band>
  )
}

/* ---------------------------------------------------------------- ask bar */

// Measured (Evidence hero): 768px white field, 1px #DABFA9 border, 16px
// radius, soft shadow; placeholder inter 16; a 32px round send button; five
// #FCFAF8 quick-action pills (8px radius, 6px × 12px, inter 14 medium
// secondary, 16px lucide icons at stroke 1.5).
const ASK_PILLS = [
  ['Look up', Search],
  ['Research', Stethoscope],
  ['Treat', Pill],
  ['Explain', MessageSquareText],
  ['Compare', ArrowLeftRight],
]

export function AskBar({ placeholder = 'What are the common side effects of amitriptyline?' }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
      <label className="flex w-full items-center gap-3 rounded-2xl border border-[#DABFA9] bg-card-white py-4 pl-4 pr-3 shadow-testimonial-md">
        <span className="sr-only">Evidence input field</span>
        <HeidiMark className="h-6 w-6 text-text-secondary" />
        <input
          type="text"
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-body text-text-primary placeholder:text-text-secondary focus:outline-none"
        />
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D4BFC4] text-drawer-invert">
          <ArrowUp size={16} strokeWidth={1.5} />
        </span>
      </label>
      <div className="flex flex-wrap justify-center gap-2.5">
        {ASK_PILLS.map(([t, Icon]) => (
          <span key={t} className="inline-flex items-center gap-1.5 rounded-lg border border-[#F4E7DD] bg-page px-3 py-1.5 text-sm font-medium tracking-[-0.42px] text-text-secondary">
            <Icon size={16} strokeWidth={1.5} />
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- panel feature */

// Measured (Evidence "Choose the sources"): #F9F4F1 panel inset 48px, 36px
// radius, 128px/80px padding; 552×442 visual left, copy right (exposure
// 48/52.8 heading, inter 16 body, forest button with trailing arrow).
export function PanelFeature({ title, body, cta, visual, reverse = false }) {
  return (
    <section className="py-12 md:px-12">
      <div className={`grid items-center gap-10 rounded-[36px] bg-accent px-5 py-12 md:px-20 md:py-32 lg:grid-cols-[552px_1fr] lg:gap-[80px] ${reverse ? 'lg:grid-cols-[1fr_552px]' : ''}`}>
        <Media src={visual} alt="" loading="lazy" className={`w-full ${reverse ? 'lg:order-2' : ''}`} style={{ aspectRatio: '552 / 442' }} />
        <div className={reverse ? 'lg:order-1' : ''}>
          <h2 className="mb-6 font-serif text-h2-mobile text-text-primary md:text-h2-desktop">{title}</h2>
          <p className="mb-8 max-w-[552px] text-body tracking-[-0.48px] text-text-primary">{body}</p>
          {cta && (
            <Button to={cta.to} tone={cta.tone || 'forest'} trailing={<ArrowRight size={22} strokeWidth={1.5} />}>
              {cta.t}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ quote block */

// Measured (Evidence): inter 16 semibold eyebrow; exposure 48/52.8/−2.4
// quote in 1024px; name inter 18 bold; role inter 14.
export function QuoteBlock({ eyebrow, quote, name, role, cta, italic = false }) {
  return (
    <Band inner="mx-auto flex max-w-5xl flex-col items-center text-center">
      {eyebrow && <p className="mb-4 text-body font-semibold text-text-primary">{eyebrow}</p>}
      <blockquote className={`font-serif text-[32px] leading-[36px] tracking-[-1.6px] text-text-primary md:text-h2-desktop ${italic ? 'italic' : ''}`}>{quote}</blockquote>
      <p className="mt-6 text-lg font-bold tracking-[-0.54px] text-text-primary">{name}</p>
      {role && <p className="text-sm tracking-[-0.42px] text-text-primary">{role}</p>}
      {cta && (
        <div className="mt-6">
          <Button to={cta.to} tone={cta.tone || 'dark'}>
            {cta.t}
          </Button>
        </div>
      )}
    </Band>
  )
}

/* ------------------------------------------------------------- centre shot */

// A centred heading block over one wide product visual (Evidence "Every
// answer, back to the source": 56px h2, 16px lead, yellow CTA, 1280×573 shot).
export function CenterShowcase({ title, lead, cta, visual }) {
  return (
    <Band inner="flex flex-col items-center text-center">
      <h2 className={`max-w-3xl ${H2}`}>
        <Rich text={title} />
      </h2>
      {lead && <p className="mt-6 max-w-3xl text-body tracking-[-0.48px] text-text-primary">{lead}</p>}
      {cta && (
        <div className="mt-8">
          <Button to={cta.to} tone={cta.tone || 'yellow'}>
            {cta.t}
          </Button>
        </div>
      )}
      <Media src={visual.src} alt="" loading="lazy" className="mt-12 w-full" style={{ aspectRatio: `${visual.w} / ${visual.h}` }} />
    </Band>
  )
}

/* -------------------------------------------------------------- split hero */

// Measured (Coding): full-bleed band (optionally #F9F4F1), copy left in 600px
// — inter 16 semibold eyebrow, exposure 56/56/−2.8 h1, inter 16 body with
// bold phrases — and a 600×480 visual right, 80px gutter.
export function SplitHero({ eyebrow, title, body, cta, visual, tone }) {
  return (
    <section className={`px-global py-12 md:py-section-md ${tone === 'sand' ? 'bg-accent' : ''}`}>
      <div className="mx-auto grid max-w-container-lg items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          {eyebrow && <p className="mb-4 text-body font-semibold text-text-primary">{eyebrow}</p>}
          <h1 className="mb-6 font-serif text-h1-mobile text-text-primary lg:text-h1-desktop">
            <Rich text={title} />
          </h1>
          <p className="mb-8 max-w-[600px] text-body tracking-[-0.48px] text-text-primary [&_strong]:font-bold" dangerouslySetInnerHTML={{ __html: body }} />
          {cta && (
            <Button to={cta.to} tone={cta.tone || 'forest'}>
              {cta.t}
            </Button>
          )}
        </div>
        <Media src={visual} alt="" className="w-full" style={{ aspectRatio: '600 / 480' }} />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ feature split */

// Alternating 600×480 visual + copy (exposure 56/56/−2.8 heading, inter 16
// body, one CTA). Phones: copy first.
export function FeatureSplit({ title, body, cta, visual, imageFirst, headingSize = 56 }) {
  return (
    <Band inner="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
      <Media src={visual} alt="" loading="lazy" className={`order-2 w-full ${imageFirst ? 'lg:order-1' : 'lg:order-2'}`} style={{ aspectRatio: '600 / 480' }} />
      <div className={`order-1 ${imageFirst ? 'lg:order-2' : 'lg:order-1'}`}>
        <h2 className={`mb-6 font-serif text-h2-mobile text-text-primary ${headingSize === 48 ? 'md:text-h2-desktop' : 'md:text-h2-lg-desktop'}`}>
          <Rich text={title} />
        </h2>
        <p className="mb-8 max-w-[600px] text-body tracking-[-0.48px] text-text-primary">{body}</p>
        {cta && (
          <Button to={cta.to} tone={cta.tone || 'forest'} trailing={cta.arrow ? <ArrowRight size={22} strokeWidth={1.5} /> : null}>
            {cta.t}
          </Button>
        )}
      </div>
    </Band>
  )
}

/* --------------------------------------------------------------- icon grid */

const lucide = (name) => icons[name.split('-').map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join('')]

function GridIcon({ icon, size = 48 }) {
  if (!icon) return null
  if (icon.startsWith('/')) return <Media src={icon} alt="" className="shrink-0" style={{ width: size, height: size }} />
  const I = lucide(icon)
  return I ? <I size={size} strokeWidth={1.5} className="shrink-0 text-text-primary" /> : null
}

// Measured (Coding "The codes you need"): centred 56px heading, 80px above a
// 3-up grid (405px columns, 32px gutters, ~40px rows); 48px lucide icon at
// stroke 1.5, 16px gap, exposure 32/38.4 title, inter 16 body.
export function IconGrid({ title, lead, items, cols = 3 }) {
  return (
    <Band>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className={H2}>
          <Rich text={title} />
        </h2>
        {lead && <p className="mt-6 text-body tracking-[-0.48px] text-text-primary">{lead}</p>}
      </div>
      <ul className={`mt-12 grid gap-x-8 gap-y-10 md:mt-20 md:grid-cols-2 ${cols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
        {items.map((it) => (
          <li key={it.title}>
            <GridIcon icon={it.icon} />
            <h3 className="mb-3 mt-4 font-serif text-[28px] leading-[34px] tracking-[-1.4px] text-text-primary md:text-[32px] md:leading-[38.4px] md:tracking-[-1.6px]">{it.title}</h3>
            <p className="text-body tracking-[-0.48px] text-text-primary">{it.body}</p>
          </li>
        ))}
      </ul>
    </Band>
  )
}

/* ------------------------------------------------------ icon columns panel */

// Measured (Coding "Chart by voice"): #F9F4F1 panel inset 48px, 36px radius,
// 128px/176px padding; pattern-4 in #F6ECE4 down each side (247×505,
// mask-size contain); centred 56px heading; three 373px columns with 48px
// icons (10px below), exposure 32 titles and inter 16 body.
export function IconColumnsPanel({ title, items }) {
  const side = {
    maskImage: 'url(/assets/icons/pattern-4.svg)',
    WebkitMaskImage: 'url(/assets/icons/pattern-4.svg)',
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
  }
  return (
    <section className="py-12 md:px-12">
      <div className="relative overflow-hidden rounded-[36px] bg-accent px-5 py-16 md:px-20 md:py-32">
        <div aria-hidden className="absolute left-0 top-12 hidden h-[505px] w-[247px] bg-[#F6ECE4] lg:block" style={side} />
        <div aria-hidden className="absolute right-0 top-12 hidden h-[505px] w-[247px] -scale-x-100 bg-[#F6ECE4] lg:block" style={side} />
        <div className="relative mx-auto max-w-[1184px]">
          <h2 className={`mx-auto max-w-3xl text-center ${H2}`}>
            <Rich text={title} />
          </h2>
          <ul className="mt-12 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-8">
            {items.map((it) => (
              <li key={it.title}>
                <span className="mb-2.5 block">
                  <GridIcon icon={it.icon} />
                </span>
                <h3 className="mb-3 font-serif text-[28px] leading-[34px] tracking-[-1.4px] text-text-primary md:text-[32px] md:leading-[38.4px] md:tracking-[-1.6px]">{it.title}</h3>
                <p className="text-body tracking-[-0.48px] text-text-primary">{it.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- faq band */

// Measured (Coding/Remote/Pricing): heading left (exposure 48/52.8), inter 16
// sub, optional buttons; list right in 600px (the shared FaqList). Stacked
// variant centres the heading over the list.
export function FaqBand({ title = 'Questions & answers', sub, buttons, items, stacked = false, wide = false }) {
  if (stacked)
    return (
      <Band inner="flex flex-col items-center gap-12 md:gap-section-md">
        <h2 className="text-center font-serif text-[40px] leading-[40px] tracking-[-2px] text-text-primary md:text-h2-lg-desktop">{title}</h2>
        <div className={`flex w-full justify-center ${wide ? '[&>div]:max-w-[1024px]' : ''}`}>
          <FaqList items={items} />
        </div>
      </Band>
    )
  return (
    <Band inner="grid gap-12 md:grid-cols-2 md:gap-section-md">
      <div>
        <h2 className="font-serif text-[40px] leading-[40px] tracking-[-2px] text-text-primary md:text-h2-desktop">{title}</h2>
        {sub && <p className="mt-4 text-body tracking-[-0.48px] text-text-primary">{sub}</p>}
        {buttons && (
          <div className="mt-8 flex flex-wrap gap-3">
            {buttons.map((b) => (
              <Button key={b.t} to={b.to} tone={b.tone || 'forest'} trailing={b.trailing}>
                {b.t}
              </Button>
            ))}
          </div>
        )}
      </div>
      <FaqList items={items} />
    </Band>
  )
}

/* ------------------------------------------------------------ pattern CTA */

// Closing panels with a masked pattern down each side. Measured variants:
//  - yellow / pattern-6 in #FDFAC4 (381×1272, centred): Coding, Dictate
//  - yellow / pattern-5 in #FDFAC4 (283px): the "For" pages
//  - forest / pattern in a lighter green: Pricing, Enterprise, Trainees
//  - sand / pattern-4 in #F6ECE4: Remote
const CTA_TONES = {
  yellow: { bg: 'bg-accent-yellow', ink: 'text-text-primary', pat: '#FDFAC4' },
  forest: { bg: 'bg-forest', ink: 'text-drawer-invert', pat: '#2B6433' },
  sand: { bg: 'bg-accent', ink: 'text-text-primary', pat: '#F6ECE4' },
}
export function PatternCta({ title, sub, buttons, tone = 'yellow', pattern = 6, height = 442 }) {
  const t = CTA_TONES[tone]
  const dims = pattern === 6 ? { width: 381, height: 1272 } : pattern === 5 ? { width: 283, height: 743 } : { width: 247, height: 505 }
  const mask = {
    maskImage: `url(/assets/icons/pattern-${pattern}.svg)`,
    WebkitMaskImage: `url(/assets/icons/pattern-${pattern}.svg)`,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
  }
  return (
    <section className="py-12 md:px-12">
      <div
        className={`relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden rounded-[36px] px-6 py-16 text-center md:min-h-[var(--cta-h)] ${t.bg}`}
        style={{ '--cta-h': `${height}px` }}
      >
        {['left-0', 'right-0 -scale-x-100'].map((pos) => (
          <div key={pos} aria-hidden className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2 md:block ${pos}`} style={{ ...dims, backgroundColor: t.pat, ...mask }} />
        ))}
        <div className="relative flex flex-col items-center">
          <h2 className={`max-w-3xl font-serif text-h2-mobile md:text-h2-lg-desktop ${t.ink}`}>
            {title.split('\n').map((l, i) => (
              <span key={i} className="block">
                <Rich text={l} />
              </span>
            ))}
          </h2>
          {sub && <p className={`mt-4 text-body tracking-[-0.48px] ${t.ink}`}>{sub}</p>}
          {buttons && (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {buttons.map((b) => (
                <Button key={b.t} to={b.to} tone={b.tone || 'dark'} icon={b.icon} trailing={b.trailing}>
                  {b.t}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ pill hero */

// Measured (Dictate): full-bleed #F9F4F1 band; a #D1E0FF 36px-radius pill
// (inter 16 semibold, 2px × 8px); h1 exposure 48/52.8/−2.4 with an italic
// phrase and a forced break; 18px secondary lead; near-black CTA; then a
// 1280×440 product visual.
export function PillHero({ pill, title, lead, cta, visual }) {
  return (
    <section className="bg-accent px-global pb-12 pt-12 md:pb-section-md">
      <div className="mx-auto flex max-w-container-lg flex-col items-center text-center">
        <span className="mb-4 rounded-[36px] bg-[#D1E0FF] px-2 py-0.5 text-body font-semibold text-text-primary">{pill}</span>
        <h1 className="font-serif text-[40px] leading-[44px] tracking-[-2px] text-text-primary md:text-h2-desktop">
          {title.split('\n').map((line, i) => (
            <span key={i} className="block">
              <Rich text={line} />
            </span>
          ))}
        </h1>
        <p className="mt-6 max-w-[470px] text-lg leading-[25.2px] tracking-[-0.54px] text-text-secondary">{lead}</p>
        <div className="mt-8">
          <Button to={cta.to} tone={cta.tone || 'dark'}>
            {cta.t}
          </Button>
        </div>
        <Media src={visual.src} alt="" className="mt-12 w-full" style={{ aspectRatio: `${visual.w} / ${visual.h}` }} />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- shot panel */

// A logo wall or other static composite shown as captured, inside the
// #F9F4F1 24px-radius panel it sits in on live (16/12/12px padding).
export function ShotPanel({ src, w, h, alt = '', caption }) {
  return (
    <Band>
      <div className="rounded-card bg-accent px-3 pb-3 pt-4">
        {caption && <p className="mb-6 text-center text-xl text-text-primary">{caption}</p>}
        <Media src={src} alt={alt} loading="lazy" className="w-full" style={{ aspectRatio: `${w} / ${h}` }} />
      </div>
    </Band>
  )
}

/* ------------------------------------------------------------ chip field */

// Measured (Dictate "Everywhere you'd otherwise be typing"): 1280×600 field of
// floating task chips around a centred exposure 40/44 heading. The chips come
// across as the captured field; their text is kept for assistive tech.
export function ChipField({ title, bg, chips }) {
  // The backdrop is a capture of the whole 1440×761 band, so it runs
  // full-bleed with the heading laid over its centre.
  return (
    <section className="relative overflow-hidden">
      <Media src={bg} alt="" aria-hidden className="w-full min-w-[720px] -translate-x-0 md:min-w-0" style={{ aspectRatio: '1440 / 761' }} />
      <h2 className="absolute inset-x-0 top-1/2 mx-auto max-w-[560px] -translate-y-1/2 px-5 text-center font-serif text-[28px] leading-[32px] tracking-[-1.4px] text-text-primary md:text-[40px] md:leading-[44px] md:tracking-[-2px]">
        {title}
      </h2>
      <ul className="sr-only">
        {chips.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </section>
  )
}

/* ---------------------------------------------------------- two-tone quote */

// Measured (Dictate): exposure 32/38.4/−1.6 in 560px, the second clause set
// in the secondary colour; name inter 14 semibold, role inter 14 secondary.
export function TwoToneQuote({ lead, rest, name, role }) {
  return (
    <Band inner="mx-auto max-w-[560px] text-center">
      <blockquote className="font-serif text-[26px] leading-[32px] tracking-[-1.3px] text-text-primary md:text-[32px] md:leading-[38.4px] md:tracking-[-1.6px]">
        {lead} <span className="text-text-secondary">{rest}</span>
      </blockquote>
      <p className="mt-6 text-sm font-semibold tracking-[-0.42px] text-text-primary">{name}</p>
      <p className="text-sm tracking-[-0.42px] text-text-secondary">{role}</p>
    </Band>
  )
}

/* ------------------------------------------------------------ demo video */

// Measured (Dictate "Press, speak, done"): #D1E0FF pill eyebrow, exposure 48
// heading, near-black CTA, 1280×720 embed with 24px radius, 48px below.
export function DemoVideo({ pill, title, cta, src }) {
  return (
    <Band inner="flex flex-col items-center text-center">
      {pill && <span className="mb-4 rounded-[36px] bg-[#D1E0FF] px-2 py-0.5 text-lg font-medium tracking-[-0.54px] text-text-secondary">{pill}</span>}
      <h2 className="font-serif text-h2-mobile text-text-primary md:text-h2-desktop">{title}</h2>
      {cta && (
        <div className="mt-8">
          <Button to={cta.to} tone={cta.tone || 'dark'}>
            {cta.t}
          </Button>
        </div>
      )}
      <div className="mt-12 aspect-video w-full overflow-hidden rounded-card">
        <Media as="iframe" src={src} title={title} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full" />
      </div>
    </Band>
  )
}

/* ------------------------------------------------------------- card trio */

// Measured (Dictate "What happens while you speak"): exposure 48 heading left,
// then three white 24px-radius cards (32px padding) with exposure 32 titles
// and inter 16 body, ~73px apart.
export function CardTrio({ title, cards }) {
  return (
    <Band>
      <h2 className="max-w-[616px] font-serif text-h2-mobile text-text-primary md:text-h2-desktop">{title}</h2>
      <ul className="mt-12 grid gap-6 md:grid-cols-3 lg:gap-[72px] lg:px-5">
        {cards.map((c) => (
          <li key={c.title} className="rounded-card bg-card-white p-8">
            <h3 className="mb-3 font-serif text-[28px] leading-[34px] tracking-[-1.4px] text-text-primary md:text-[32px] md:leading-[38.4px] md:tracking-[-1.6px]">{c.title}</h3>
            <p className="text-body tracking-[-0.48px] text-text-primary">{c.body}</p>
          </li>
        ))}
      </ul>
    </Band>
  )
}

/* ---------------------------------------------------------- download split */

// Measured (Dictate "Try Dictate for free"): exposure 48 heading in 600px; a
// near-black primary + borderless secondary download link; a 14px secondary
// note; 600×480 visual on a #F4E7DD 24px-radius panel.
export function DownloadSplit({ title, primary, secondary, note, visual }) {
  return (
    <Band inner="grid items-center gap-12 lg:grid-cols-2 lg:gap-20" className="scroll-mt-24">
      <div>
        <h2 className="mb-8 font-serif text-h2-mobile text-text-primary md:text-h2-desktop">{title}</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button to={primary.to} tone="dark">
            {primary.t}
          </Button>
          <Button to={secondary.to} tone="ghost" className="px-4 py-2.5">
            {secondary.t}
          </Button>
        </div>
        {note && <p className="mt-3 text-sm tracking-[-0.42px] text-text-secondary">{note}</p>}
      </div>
      <Media src={visual} alt="" loading="lazy" className="w-full rounded-card bg-[#F4E7DD]" style={{ aspectRatio: '600 / 480' }} />
    </Band>
  )
}

/* -------------------------------------------------------------- image CTA */

// Full-bleed closer on a captured backdrop (photo + masked side patterns):
// centred exposure 56 heading, inter 16 line, near-black CTA.
export function ImageCta({ bg, title, sub, cta }) {
  return (
    <section className="relative flex min-h-[420px] items-center justify-center overflow-hidden px-global py-24 text-center md:min-h-[577px]">
      <Media src={bg} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative flex max-w-3xl flex-col items-center">
        <h2 className={H2}>{title}</h2>
        {sub && <p className="mt-6 text-body tracking-[-0.48px] text-text-primary">{sub}</p>}
        {cta && (
          <div className="mt-8">
            <Button to={cta.to} tone={cta.tone || 'dark'}>
              {cta.t}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

/* -------------------------------------------------------------- video hero */

// Measured (Remote): a full-bleed 1440×810 video — the device clipping on —
// with the copy right-aligned in 531px (exposure 72/72 h1 with a break and an
// italic phrase, inter 16 body, struck-through old price + new price, and a
// near-black CTA with an arrow). A yellow "Skip" pill (bottom-left) jumps the
// intro to its last frame, where the copy sits.
export function VideoHero({ src, title, body, price, cta }) {
  const ref = useRef(null)
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    // Reduced-motion visitors get the settled frame straight away.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) skip()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const skip = () => {
    const v = ref.current
    if (v?.duration) v.currentTime = v.duration - 0.05
    setDone(true)
  }
  return (
    <section className="relative overflow-hidden">
      <video
        ref={ref}
        src={src}
        autoPlay
        muted
        playsInline
        onLoadedData={() => setReady(true)}
        onEnded={() => setDone(true)}
        onError={() => {
          setReady(true)
          setDone(true)
        }}
        className="h-[560px] w-full object-cover object-[30%_50%] md:h-[810px]"
      />
      <PulseLayer tone="video" hidden={ready} />
      <div className="absolute inset-0 px-global">
        <div className="mx-auto flex h-full max-w-container-lg items-end pb-10 md:items-center md:justify-end md:pb-0">
          <div className={`max-w-[531px] transition-opacity duration-700 md:text-right ${done ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
            <h1 className={H1}>
              {title.split('\n').map((l, i) => (
                <span key={i} className="block">
                  <Rich text={l} />
                </span>
              ))}
            </h1>
            <p className="mt-6 text-body tracking-[-0.48px] text-text-primary">{body}</p>
            <div className="mt-10 flex flex-wrap items-center gap-4 md:justify-end">
              {price && (
                <p className="text-body tracking-[-0.48px]">
                  <s className="mr-4 text-text-secondary">{price.was}</s>
                  <span className="font-medium text-text-primary">{price.now}</span>
                </p>
              )}
              <Button to={cta.to} tone="dark" trailing={<ArrowRight size={22} strokeWidth={1.5} />}>
                {cta.t}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {!done && (
        <button type="button" onClick={skip} className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-button bg-accent-yellow px-4 py-2 text-sm font-medium tracking-[-0.42px] text-text-primary">
          Skip <SkipForward size={16} strokeWidth={1.5} />
        </button>
      )}
    </section>
  )
}

/* ----------------------------------------------------------- centred intro */

function CenterIntro({ title, lead, cta, size = 56 }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h2 className={size === 48 ? 'font-serif text-h2-mobile text-text-primary md:text-h2-desktop' : H2}>
        {title.split('\n').map((l, i) => (
          <span key={i} className="block">
            <Rich text={l} />
          </span>
        ))}
      </h2>
      {lead && <p className="mt-4 max-w-[600px] text-body tracking-[-0.48px] text-text-primary">{lead}</p>}
      {cta && (
        <div className="mt-8">
          <Button to={cta.to} tone={cta.tone || 'dark'} trailing={cta.arrow === false ? null : <ArrowRight size={22} strokeWidth={1.5} />}>
            {cta.t}
          </Button>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------- image card trio */

// Measured (Remote "Clip on. Then care."): centred intro, then three 373×280
// photos (16px in from each column) with exposure 24/30 titles and inter 16
// body, 64px columns apart.
export function ImageTrio({ title, lead, cta, cards }) {
  return (
    <Band>
      <CenterIntro title={title} lead={lead} cta={cta} />
      <ul className="mt-12 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-8 lg:gap-16 lg:px-4">
        {cards.map((c) => (
          <li key={c.title}>
            <Media src={c.img} alt={c.alt || ''} loading="lazy" className="mb-8 w-full rounded-card object-cover" style={{ aspectRatio: '373 / 280' }} />
            <h3 className="mb-3 font-serif text-h3-desktop text-text-primary">{c.title}</h3>
            <p className="text-body tracking-[-0.48px] text-text-primary">{c.body}</p>
          </li>
        ))}
      </ul>
    </Band>
  )
}

/* ----------------------------------------------------------- icon card trio */

// Measured (Remote "built for the way you work"): centred intro, then three
// #F9F4F1 24px-radius cards (405×240, 32px padding): 48px lucide icon, 16px
// gap, exposure 32 title, inter 16 body.
export function IconCardTrio({ title, lead, cta, cards }) {
  return (
    <Band>
      <CenterIntro title={title} lead={lead} cta={cta} />
      <ul className="mt-12 grid gap-4 md:mt-20 md:grid-cols-3 md:gap-8">
        {cards.map((c) => (
          <li key={c.title} className="rounded-card bg-accent p-8">
            <GridIcon icon={c.icon} />
            <h3 className="mb-3 mt-4 font-serif text-[28px] leading-[34px] tracking-[-1.4px] text-text-primary md:text-[32px] md:leading-[38.4px] md:tracking-[-1.6px]">{c.title}</h3>
            <p className="text-body tracking-[-0.48px] text-text-primary">{c.body}</p>
          </li>
        ))}
      </ul>
    </Band>
  )
}

/* ------------------------------------------------------------- video band */

// Centred exposure 48 heading + inter 16 lead, then a 1280×720 embed
// (24px radius) 56px below (Remote "See Remote in action").
export function VideoIntro({ title, lead, src, cta }) {
  return (
    <Band>
      <CenterIntro title={title} lead={lead} cta={cta} size={48} />
      <div className="mt-12 aspect-video w-full overflow-hidden rounded-card md:mt-14">
        <Media as="iframe" src={src} title={title} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full" />
      </div>
    </Band>
  )
}

/* ---------------------------------------------------------- sand quote band */

// Measured (Remote customer story): full-bleed #F9F4F1; inter 16 semibold
// eyebrow; exposure italic 40/44/−2 quote in 884px; name inter 18 bold; role
// inter 16; near-black CTA.
export function StoryQuote({ eyebrow, quote, name, role, cta }) {
  return (
    <section className="bg-accent px-global py-16 md:py-28">
      <div className="mx-auto flex max-w-[884px] flex-col items-center text-center">
        {eyebrow && <p className="mb-4 text-body font-semibold text-text-primary">{eyebrow}</p>}
        <blockquote className="font-serif text-[28px] italic leading-[34px] tracking-[-1.4px] text-text-primary md:text-[40px] md:leading-[44px] md:tracking-[-2px]">{quote}</blockquote>
        <p className="mt-8 text-lg font-bold tracking-[-0.54px] text-text-primary">{name}</p>
        {role && <p className="text-body tracking-[-0.48px] text-text-primary">{role}</p>}
        {cta && (
          <div className="mt-8">
            <Button to={cta.to} tone="dark">
              {cta.t}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

/* -------------------------------------------------------- compliance panel */

// Measured (Remote "Your duty of care"): #F9F4F1 36px-radius panel (36px
// padding) in the 1280 column; exposure 48 heading left, near-black arrow CTA
// right; inter 20/28 body in 560px; a row of 124×70 certification badges.
export function CompliancePanel({ title, paras, cta, badges }) {
  return (
    <Band>
      <div className="rounded-[36px] bg-accent p-6 md:p-9">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
          <h2 className="max-w-[524px] font-serif text-h2-mobile text-text-primary md:text-h2-desktop">{title}</h2>
          {cta && (
            <Button to={cta.to} tone="dark" trailing={<ArrowRight size={22} strokeWidth={1.5} />}>
              {cta.t}
            </Button>
          )}
        </div>
        <div className="mt-10 flex max-w-[560px] flex-col gap-7 text-lg leading-7 text-text-primary md:text-xl">
          {paras.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
        <ul className="mt-10 flex flex-wrap gap-8">
          {badges.map((b) => (
            <li key={b.alt}>
              <Media src={b.src} alt={b.alt} loading="lazy" className="h-[70px] w-[124px] object-contain" />
            </li>
          ))}
        </ul>
      </div>
    </Band>
  )
}

/* ------------------------------------------------------------ diagram band */

// Centred intro over one 1280×720 captured panel (Remote "Portable. Secured.
// Reliable." power diagram).
export function DiagramBand({ title, lead, cta, visual }) {
  return (
    <Band>
      <CenterIntro title={title} lead={lead} cta={cta} size={48} />
      <Media src={visual} alt="" loading="lazy" className="mt-12 w-full" style={{ aspectRatio: '1280 / 720' }} />
    </Band>
  )
}

/* ------------------------------------------------------------ edge pattern */

function Edges({ pattern, color, w, h, top = '50%', className = 'hidden lg:block' }) {
  const mask = {
    maskImage: `url(/assets/icons/pattern-${pattern}.svg)`,
    WebkitMaskImage: `url(/assets/icons/pattern-${pattern}.svg)`,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
  }
  return ['left-0', 'right-0 -scale-x-100'].map((pos) => (
    <div key={pos} aria-hidden className={`pointer-events-none absolute -translate-y-1/2 ${className} ${pos}`} style={{ top, width: w, height: h, backgroundColor: color, ...mask }} />
  ))
}

/* ------------------------------------------------------------- centre hero */

// Measured (Enterprise): full-bleed #F9F4F1 band with pattern-3 in #F6ECE4
// (299×630) at each edge; inter 16 semibold eyebrow; exposure 48/52.8 h1
// with an italic phrase in 768px; inter 20/28 lead; forest CTA.
export function EdgeHero({ eyebrow, title, lead, cta }) {
  return (
    <section className="relative overflow-hidden bg-accent px-global py-12 md:py-section-md">
      <Edges pattern={3} color="#F6ECE4" w={299} h={630} />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        {eyebrow && <p className="mb-4 text-body font-semibold text-text-primary">{eyebrow}</p>}
        <h1 className="font-serif text-[40px] leading-[44px] tracking-[-2px] text-text-primary md:text-h2-desktop">
          <Rich text={title} />
        </h1>
        {lead && <p className="mt-6 text-lg leading-7 tracking-[-0.6px] text-text-primary md:text-xl">{lead}</p>}
        {cta && (
          <div className="mt-8">
            <Button to={cta.to} tone="forest">
              {cta.t}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- stats panel */

// Measured (Enterprise "Real impact"): centred 56px intro + forest CTA; a
// #F9F4F1 24px-radius panel (32/48px padding) with three stats: exposure 56
// figure, inter 20 medium label behind a 24px icon, inter 16 secondary note.
export function StatsPanel({ title, lead, cta, stats }) {
  return (
    <Band>
      <CenterIntro title={title} lead={lead} cta={cta ? { ...cta, tone: 'forest', arrow: false } : null} />
      <ul className="mt-12 grid gap-8 rounded-card bg-accent px-6 py-8 md:grid-cols-3 md:px-12">
        {stats.map((s) => (
          <li key={s.value}>
            <p className="font-serif text-h2-mobile text-text-primary md:text-h2-lg-desktop">{s.value}</p>
            <p className="mt-6 flex items-center gap-2 text-xl font-medium tracking-[-0.6px] text-text-primary">
              {s.icon && <Media src={s.icon} alt="" className="h-6 w-6" />}
              {s.label}
            </p>
            <p className="mt-2 text-body tracking-[-0.48px] text-text-secondary">{s.note}</p>
          </li>
        ))}
      </ul>
    </Band>
  )
}

/* ------------------------------------------------------------- org cards */

// Measured (Enterprise "Built for organizations"): 56px heading left, lead,
// forest CTA; three white 16px-radius cards (1px #F0DFD1, soft shadow, 32px
// padding): 48px icon, exposure 32 title, inter 16 body, and an italic
// outcome line under a hairline, pinned to the card foot.
export function OrgCards({ title, lead, cta, cards }) {
  return (
    <Band>
      <h2 className={`max-w-[763px] ${H2}`}>{title}</h2>
      {lead && <p className="mt-4 max-w-[690px] text-body tracking-[-0.48px] text-text-primary">{lead}</p>}
      {cta && (
        <div className="mt-8">
          <Button to={cta.to} tone="forest">
            {cta.t}
          </Button>
        </div>
      )}
      <ul className="mt-12 grid gap-6 md:mt-20 md:grid-cols-3 lg:gap-12">
        {cards.map((c) => (
          <li key={c.title} className="flex flex-col rounded-2xl border border-border-base bg-card-white p-8 shadow-testimonial-md">
            <GridIcon icon={c.icon} />
            <h3 className="mb-3 mt-4 font-serif text-[28px] leading-[34px] tracking-[-1.4px] text-text-primary md:text-[32px] md:leading-[38.4px] md:tracking-[-1.6px]">{c.title}</h3>
            <p className="text-body tracking-[-0.48px] text-text-primary">{c.body}</p>
            <p className="mt-auto border-t border-border-base pt-6 text-body italic tracking-[-0.48px] text-text-primary">{c.outcome}</p>
          </li>
        ))}
      </ul>
    </Band>
  )
}

/* ---------------------------------------------------------- dark quote */

// Measured (Enterprise): #28030F panel inset 48px, 36px radius, pattern-4 in
// #4C2934 (247×505) down each side; exposure italic 40/44 quote in #F9F4F1.
export function DarkQuote({ quote }) {
  return (
    <section className="py-12 md:px-12">
      <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-[36px] bg-dark-fill px-6 py-20 md:min-h-[388px]">
        <Edges pattern={4} color="#4C2934" w={247} h={505} className="hidden md:block" />
        <blockquote className="relative max-w-[633px] text-center font-serif text-[28px] italic leading-[34px] tracking-[-1.4px] text-drawer-invert md:text-[40px] md:leading-[44px] md:tracking-[-2px]">{quote}</blockquote>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ video split */

// Measured (Enterprise buyers guide): full-bleed #F9F4F1; 56px heading in
// 600px, inter 16 body, forest CTA; a 600×338 video on the right.
export function VideoSplit({ title, body, cta, src }) {
  return (
    <section className="bg-accent px-global py-12 md:py-section-md">
      <div className="mx-auto grid max-w-container-lg items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <h2 className={`mb-6 ${H2}`}>{title}</h2>
          <p className="mb-8 text-body tracking-[-0.48px] text-text-primary">{body}</p>
          {cta && (
            <Button to={cta.to} tone="forest">
              {cta.t}
            </Button>
          )}
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-card">
          <Media as="iframe" src={src} title={title} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full" />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- panel tabs */

// TabsSplit inside a white 36px-radius panel inset 48px (Enterprise "Built
// for your whole team": 128px side padding, 536px visual).
export function PanelTabs(props) {
  return (
    <section className="py-12 md:px-12">
      <div className="rounded-[36px] bg-card-white px-5 md:px-20 [&>section]:px-0">
        <TabsSplit {...props} />
      </div>
    </section>
  )
}

/* --------------------------------------------------------- image grid 4-up */

// Measured (Enterprise "complex care"): exposure 40/44 heading; eight items
// on a 4-up grid (264×149 images, 64px gutters), exposure 32 titles; a
// forest CTA centred beneath.
export function ImageGrid({ title, lead, items, cta }) {
  return (
    <Band>
      <h2 className="mx-auto max-w-[595px] text-center font-serif text-[32px] leading-[36px] tracking-[-1.6px] text-text-primary md:text-[40px] md:leading-[44px] md:tracking-[-2px]">{title}</h2>
      {lead && <p className="mx-auto mt-4 max-w-[560px] text-center text-body tracking-[-0.48px] text-text-primary">{lead}</p>}
      <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:mt-20 lg:grid-cols-4 lg:gap-x-16 lg:px-4">
        {items.map((it) => (
          <li key={it.title}>
            <Media src={it.img} alt={it.alt || ''} loading="lazy" className="mb-6 w-full rounded-xl object-cover" style={{ aspectRatio: '264 / 149' }} />
            <h3 className="font-serif text-2xl leading-[30px] tracking-[-1.2px] text-text-primary md:text-[32px] md:leading-[38.4px] md:tracking-[-1.6px]">{it.title}</h3>
          </li>
        ))}
      </ul>
      {cta && (
        <div className="mt-16 flex justify-center">
          <Button to={cta.to} tone="forest" trailing={<ArrowRight size={22} strokeWidth={1.5} />}>
            {cta.t}
          </Button>
        </div>
      )}
    </Band>
  )
}

/* ----------------------------------------------------------- case studies */

// Measured (Enterprise "Real teams"): full-bleed #F9F4F1; centred 56px intro;
// six cards on a 3-up grid: 336×189 logo tile, exposure 32 name, inter 16
// body led by a bold outcome, and a #B9CFFF "See full story" button.
export function CaseStudies({ title, lead, cases }) {
  return (
    <section className="bg-accent px-global py-12 md:py-12">
      <div className="mx-auto max-w-container-lg">
        <CenterIntro title={title} lead={lead} />
        <ul className="mt-12 grid gap-x-24 gap-y-16 md:mt-24 md:grid-cols-2 lg:grid-cols-3 lg:px-9">
          {cases.map((c) => (
            <li key={c.title} className="flex flex-col items-start">
              <Media src={c.img} alt={`${c.title} and Heidi`} loading="lazy" className="mb-8 w-full" style={{ aspectRatio: '336 / 189' }} />
              <h3 className="mb-4 font-serif text-[28px] leading-[34px] tracking-[-1.4px] text-text-primary md:text-[32px] md:leading-[38.4px] md:tracking-[-1.6px]">{c.title}</h3>
              <p className="mb-8 text-body tracking-[-0.48px] text-text-primary [&_strong]:font-bold" dangerouslySetInnerHTML={{ __html: c.html }} />
              <Button to={c.to} tone="white" className="mt-auto bg-[#B9CFFF] py-2 hover:bg-[#A7C2FF]">
                See full story
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ green band */

// Full-bleed forest closer (Enterprise, Trainees): pattern-3 in #2B6433
// (299×630) at each edge; exposure 56 heading and inter 16 line in #F9F4F1;
// a #F9F4F1 button with an arrow.
export function GreenBand({ title, sub, cta, inset = false }) {
  return (
    <section className={inset ? 'py-12 md:px-12' : ''}>
      <div className={`relative flex min-h-[320px] items-center justify-center overflow-hidden bg-forest px-global py-20 text-center ${inset ? 'rounded-[36px] md:min-h-[504px]' : 'md:min-h-[385px]'}`}>
        <Edges pattern={3} color="#2B6433" w={299} h={630} className="hidden md:block" />
        <div className="relative flex max-w-3xl flex-col items-center">
          <h2 className="font-serif text-h2-mobile text-drawer-invert md:text-h2-lg-desktop">{title}</h2>
          {sub && <p className="mt-6 text-body tracking-[-0.48px] text-drawer-invert">{sub}</p>}
          {cta && (
            <div className="mt-8">
              <Button to={cta.to} tone="sand" trailing={<ArrowRight size={22} strokeWidth={1.5} />}>
                {cta.t}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- quote carousel */

// Measured (Trainees "Tomorrow's leaders"): 56px heading left, forest arrow
// CTA right; a track of 560px cards (#FCFAF8, 1px #F0DFD1, 16px radius, 36px
// padding, soft shadow) 32px apart: exposure 24/30 headline quote, inter 16
// secondary body, 48px round avatar + inter 14 semibold name / secondary
// role; round secondary arrows bottom-right that clamp at the ends.
export function QuoteCarousel({ title, cta, items }) {
  const [i, setI] = useState(0)
  const [step, setStep] = useState(0)
  const track = useRef(null)
  useEffect(() => {
    const measure = () => {
      const t = track.current
      if (t?.firstElementChild) setStep(t.firstElementChild.getBoundingClientRect().width + 32)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  return (
    <Band>
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <h2 className={`max-w-[632px] ${H2}`}>{title}</h2>
        {cta && (
          <Button to={cta.to} tone="forest" trailing={<ArrowRight size={22} strokeWidth={1.5} />}>
            {cta.t}
          </Button>
        )}
      </div>
      <div className="relative mt-12 overflow-hidden py-3 md:mt-20" role="region" aria-roledescription="carousel" aria-label={title}>
        <ul ref={track} className="flex gap-8 px-3" style={{ transform: `translateX(-${i * step}px)`, transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
          {items.map((q) => (
            <li key={q.name} className="flex w-[85vw] max-w-[560px] shrink-0 flex-col rounded-2xl border border-border-base bg-page p-7 shadow-testimonial-md md:p-9">
              <h3 className="mb-3 font-serif text-h3-desktop text-text-primary">{q.title}</h3>
              <p className="mb-6 text-body tracking-[-0.48px] text-text-secondary">{q.body}</p>
              <div className="mt-auto flex items-center gap-3">
                {q.avatar && <Media src={q.avatar} alt="" className="h-12 w-12 rounded-full object-cover" loading="lazy" />}
                <div>
                  <p className="text-sm font-semibold tracking-[-0.42px] text-text-primary">{q.name}</p>
                  <p className="text-sm tracking-[-0.42px] text-text-secondary">{q.role}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-r from-transparent to-page md:block" />
      </div>
      <div className="mt-8 flex justify-end gap-3">
        {[['Previous', ArrowLeft, -1], ['Next', ArrowRight, 1]].map(([n, Icon, d]) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} slide`}
            disabled={d < 0 ? i === 0 : i === items.length - 1}
            onClick={() => setI((v) => Math.min(items.length - 1, Math.max(0, v + d)))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary disabled:opacity-40"
          >
            <Icon size={24} />
          </button>
        ))}
      </div>
    </Band>
  )
}

/* ------------------------------------------------------------- blue panel */

// Measured (Trainees "Clinician tools"): #B9CFFF panel inset 48px, 36px
// radius; centred 56px heading + inter 16 lead; three white 24px-radius
// cards (373×278, 32px padding): 48px icon, exposure 32 title, inter 16 body.
export function ToolsPanel({ title, lead, cards, color = '#B9CFFF' }) {
  return (
    <section className="py-12 md:px-12">
      <div className="rounded-[36px] px-5 py-16 md:px-20 md:py-16" style={{ backgroundColor: color }}>
        <div className="mx-auto max-w-[1184px]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className={H2}>{title}</h2>
            {lead && <p className="mt-4 text-body tracking-[-0.48px] text-text-primary">{lead}</p>}
          </div>
          <ul className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3 md:gap-8">
            {cards.map((c) => (
              <li key={c.title} className="rounded-card bg-card-white p-8">
                <GridIcon icon={c.icon} />
                <h3 className="mb-3 mt-4 font-serif text-[28px] leading-[34px] tracking-[-1.4px] text-text-primary md:text-[32px] md:leading-[38.4px] md:tracking-[-1.6px]">{c.title}</h3>
                <p className="text-body tracking-[-0.48px] text-text-primary">{c.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
