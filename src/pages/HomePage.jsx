import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowRight, Calendar, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import home from '../data/home.json'
import { resolveHref } from '../lib/links.js'
import { Media } from '../components/Skeleton.jsx'

// The home page, band by band, measured on https://www.heidihealth.com/en-gb at
// 1440px (tools/recon-home.mjs → src/data/home.json). Visual mockups inside the
// hero panel and bento cards are element screenshots of the live page, since
// they are client-rendered DOM mocks; all copy and controls are real.

function Btn({ to, children, tone = 'dark', icon, trailing }) {
  const r = resolveHref(to)
  const cls = `inline-flex items-center gap-2 rounded-button px-4 py-2.5 text-btn-outline font-medium tracking-[-0.48px] transition ${
    tone === 'dark'
      ? 'bg-dark-fill text-drawer-invert hover:bg-text-primary/90'
      : 'bg-accent-yellow text-text-primary shadow-btn-primary hover:brightness-95'
  }`
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

const SIGNUP = 'https://scribe.heidihealth.com/onboarding'
const DEMO = '/en-gb/contact-sales'

/* ------------------------------------------------------------------ hero */

// Measured: 48px below the header; h1 exposure 56/56/−2.8 with an italic
// "Relief"; sub inter 20/28/−0.6; 1280×440 panel whose segmented control
// (#F9F4F1, 16px radius, 4px padding) sits 20px off the bottom and swaps the
// panel between Evidence / Scribe / Dictate. Active tab #28030F, 12px radius.
const TABS = ['Evidence', 'Scribe', 'Dictate']

function MobilePanel({ tab, setTab }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative -mx-5 mt-8 w-[calc(100%+40px)] md:hidden">
      {TABS.map((t) => (
        <Media
          key={t}
          src={`/assets/home/hero-m-${t.toLowerCase()}.png`}
          alt=""
          className={`w-full transition-opacity duration-300 ${t === tab ? 'relative opacity-100' : 'absolute inset-0 opacity-0'}`}
          style={{ aspectRatio: '390 / 440' }}
        />
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        {open && (
          <ul role="listbox" className="absolute bottom-full left-0 mb-2 w-full rounded-2xl bg-accent p-1 shadow-testimonial-md">
            {TABS.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  role="option"
                  aria-selected={t === tab}
                  onClick={() => {
                    setTab(t)
                    setOpen(false)
                  }}
                  className={`w-full rounded-button px-4 py-2 text-left ${t === tab ? 'bg-dark-fill text-drawer-invert' : 'text-text-secondary'}`}
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-[142px] items-center rounded-2xl bg-accent p-1"
        >
          <span className="flex flex-1 items-center justify-between gap-3 rounded-button bg-dark-fill px-5 py-2 text-drawer-invert">
            {tab}
            <ChevronDown size={18} />
          </span>
        </button>
      </div>
    </div>
  )
}

function Hero() {
  const [tab, setTab] = useState('Evidence')
  return (
    <section className="px-global pb-12 pt-12 md:pb-section-md">
      <div className="mx-auto flex max-w-container-lg flex-col items-center">
        <h1 className="text-center font-serif text-h1-mobile text-text-primary lg:text-h1-desktop">
          <em className="italic">Relief</em> in every visit
        </h1>
        <p className="mt-4 text-center text-xl leading-7 tracking-[-0.6px] text-text-secondary">{home.hero.sub.t}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Btn to={SIGNUP}>Get Heidi free</Btn>
          <Btn to={DEMO} tone="yellow" icon={<Calendar size={22} strokeWidth={1.5} />}>
            Book a demo
          </Btn>
        </div>
        {/* Phones: live swaps in a portrait 390×440 panel with a dropdown in
            place of the segmented control. */}
        <MobilePanel tab={tab} setTab={setTab} />
        <div className="relative mt-8 hidden w-full md:block">
          {TABS.map((t) => (
            <Media
              key={t}
              src={`/assets/home/hero-${t.toLowerCase()}.png`}
              alt=""
              className={`w-full transition-opacity duration-300 ${t === tab ? 'relative opacity-100' : 'absolute inset-0 opacity-0'}`}
              style={{ aspectRatio: '1280 / 440' }}
            />
          ))}
          <div
            role="tablist"
            aria-label="Heidi products"
            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 rounded-2xl bg-accent p-1 md:bottom-5"
          >
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={t === tab}
                onClick={() => setTab(t)}
                className={`rounded-button px-3 py-1.5 text-sm tracking-[-0.48px] transition-colors md:px-5 md:py-2 md:text-base ${
                  t === tab ? 'bg-dark-fill text-drawer-invert' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ logo panel */

// Measured: #F9F4F1 panel, 24px radius, 16/12/12px padding, 24px gap; five
// 242×100 white tiles per row (24px radius) holding 154×60 logos. The live
// counter is a digit reel that ticks upward; this ticks at a similar pace.
function VisitsCounter() {
  const [n, setN] = useState(2740361)
  useEffect(() => {
    const id = setInterval(() => setN((v) => v + 1 + Math.floor(Math.random() * 3)), 1600)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="mx-2 inline-block rounded-full bg-dark-fill px-3 py-0.5 font-semibold tabular-nums text-drawer-invert">
      {n.toLocaleString('en-GB')}
    </span>
  )
}

function LogoPanel() {
  return (
    <section className="px-global py-12 md:py-section-md">
      <div className="mx-auto flex max-w-container-lg flex-col gap-6 rounded-card bg-accent px-3 pb-3 pt-4">
        <p className="text-center text-lg text-text-primary md:text-xl">
          Heidi has enabled care for <VisitsCounter /> patient visits this week
        </p>
        <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-5">
          {home.logos.logos.map((l) => (
            <li key={l.alt} className="flex h-[72px] items-center justify-center rounded-2xl bg-card-white px-4 md:h-[100px] md:rounded-card lg:px-11">
              <Media src={l.local} alt={l.alt} className="h-[44px] w-[120px] object-contain md:h-[60px] md:w-[154px]" loading="lazy" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- quotes */

// Measured: exposure 32/38.4/−1.6 centred (768px max); attribution inter
// 18/25.2/−0.54 with the organisation in bold.
function QuoteBand({ quote, by, org }) {
  return (
    <section className="px-global py-12 md:py-section-md">
      <figure className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <blockquote className="font-serif text-[28px] leading-[34px] tracking-[-1.4px] text-text-primary md:text-[32px] md:leading-[38.4px] md:tracking-[-1.6px]">
          {quote}
        </blockquote>
        <figcaption className="text-lg tracking-[-0.54px] text-text-primary">
          {by} <strong className="font-semibold">{org}</strong>
        </figcaption>
      </figure>
    </section>
  )
}

/* ---------------------------------------------------------------- bento */

// Measured: 56px heading, 80px above the grid; 16px gaps. Row 1 is one
// 1280×482 card with copy left and the visual filling the right half; row 2
// is two 630×799 cards, visual (630×480) on top and copy below. Cards
// #F9F4F1, 36px radius, copy inset 40px; titles exposure 32; body inter 20
// secondary in 396px; buttons near-black with a trailing arrow.
function BentoCopy({ card }) {
  return (
    <div className="flex flex-col items-start p-8 lg:p-10">
      <h3 className="mb-4 font-serif text-[28px] leading-[34px] tracking-[-1.4px] text-text-primary md:text-[32px] md:leading-[38.4px] md:tracking-[-1.6px]">
        {card.h3.t}
      </h3>
      <p className="mb-8 max-w-[396px] text-lg leading-7 text-text-secondary md:text-xl">{card.p.t}</p>
      <Btn to={card.a.href} trailing={<ArrowRight size={22} strokeWidth={1.5} />}>
        {card.a.t}
      </Btn>
    </div>
  )
}

function Bento() {
  const [a, b, c] = home.bento.cards
  return (
    <section className="px-global py-12 md:py-section-md">
      <div className="mx-auto max-w-container-lg">
        <h2 className="mb-12 max-w-[430px] font-serif text-h2-mobile text-text-primary md:mb-section-md md:text-h2-lg-desktop">
          From first visit to final follow-up.
        </h2>
        <div className="flex flex-col gap-4">
          <article className="grid overflow-hidden rounded-[36px] bg-accent lg:grid-cols-[648px_1fr]">
            <BentoCopy card={a} />
            <Media src="/assets/home/bento-0.png" alt="" loading="lazy" className="w-full lg:h-full lg:object-cover" />
          </article>
          <div className="grid gap-4 md:grid-cols-2">
            {[b, c].map((card, i) => (
              <article key={card.h3.t} className="flex flex-col overflow-hidden rounded-[36px] bg-accent md:min-h-[799px]">
                {/* Phones: copy first, as live; md+: visual on top. */}
                <Media src={`/assets/home/bento-${i + 1}.png`} alt="" loading="lazy" className="order-2 aspect-[630/480] w-full object-cover md:order-1" />
                <div className="order-1 md:order-2 md:pt-4">
                  <BentoCopy card={card} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------- dark band */

// Measured: full-bleed #28030F, 176px vertical padding around a 420px row.
// Left: inter 20 semibold #F9F4F1. Centre: a rolling list of tasks (exposure
// 40), advancing one item every 2000ms; the centred item is full strength and
// the rest fade toward the edges. Right: yellow "Explore enterprise".
const TASKS = [
  'Clinical coding & documentation integrity',
  'Inbound correspondence & document processing',
  'Telehealth',
  'Patient communications',
  'Letter workflow management',
  'EPR integration',
]
const STEP_MS = 2000

function RollingList() {
  // Three copies so the loop can wrap without a visible jump.
  const items = [...TASKS, ...TASKS, ...TASKS]
  const [i, setI] = useState(TASKS.length)
  const [animate, setAnimate] = useState(true)
  const [offsets, setOffsets] = useState([])
  const listRef = useRef(null)
  const winRef = useRef(null)
  const [windowH, setWindowH] = useState(420)

  useLayoutEffect(() => {
    const measure = () => {
      const els = [...(listRef.current?.children || [])]
      setOffsets(els.map((e) => e.offsetTop + e.offsetHeight / 2))
      if (winRef.current) setWindowH(winRef.current.clientHeight)
    }
    measure()
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setI((v) => v + 1), STEP_MS)
    return () => clearInterval(id)
  }, [])

  // After passing the second copy, snap back one copy without animating.
  useEffect(() => {
    if (i < TASKS.length * 2) return
    const t = setTimeout(() => {
      setAnimate(false)
      setI((v) => v - TASKS.length)
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)))
    }, 800)
    return () => clearTimeout(t)
  }, [i])

  const y = offsets[i] != null ? windowH / 2 - offsets[i] : 0
  return (
    <div
      ref={winRef}
      className="relative h-[260px] overflow-hidden lg:h-[420px]"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
      }}
      aria-hidden
    >
      <ul
        ref={listRef}
        className="flex flex-col gap-6 lg:gap-12"
        style={{ transform: `translateY(${y}px)`, transition: animate ? 'transform 700ms cubic-bezier(0.65, 0, 0.35, 1)' : 'none' }}
      >
        {items.map((t, k) => (
          <li
            key={k}
            className={`mx-auto max-w-[720px] font-serif text-[22px] leading-[28px] tracking-[-1px] text-drawer-invert lg:mx-0 transition-opacity duration-700 md:text-[40px] md:leading-[44px] md:tracking-[-2px] ${
              k === i ? 'opacity-100' : 'opacity-50'
            }`}
          >
            {t}
          </li>
        ))}
      </ul>
    </div>
  )
}

function DarkBand() {
  return (
    <section className="bg-dark-fill px-global py-16 lg:py-44">
      <div className="mx-auto grid max-w-container-lg items-center gap-8 text-center lg:grid-cols-[272px_1fr_auto] lg:gap-12 lg:text-left">
        <p className="whitespace-pre-line text-xl font-semibold leading-7 text-drawer-invert">
          {'Tackles every clinical task.\nTailored to your workforce.'}
        </p>
        <div className="order-3 lg:order-none">
          <RollingList />
          <ul className="sr-only">
            {TASKS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div className="lg:order-none">
          <Btn to="/en-gb/solutions/enterprise" tone="yellow">
            Explore enterprise
          </Btn>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- CTA band */

// Measured: 1344×504 panel inset 48px, 36px radius, blurred-sky image, and
// pattern-6.svg as a #FBF582 mask (381×1272, one per side, mirrored). Heading
// exposure 72/72/−3.6; yellow "Get Heidi free" + near-black "Book a demo".
function CtaBand() {
  return (
    <section className="py-12 md:px-12">
      <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-[36px] md:h-[504px]">
        <Media src="/assets/home/cta-sky.png" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        {['left-0', 'right-0 -scale-x-100'].map((pos) => (
          <div
            key={pos}
            aria-hidden
            className={`pointer-events-none absolute top-1/2 hidden h-[1272px] w-[381px] -translate-y-1/2 bg-accent-yellow md:block ${pos}`}
            style={{
              maskImage: 'url(/assets/icons/pattern-6.svg)',
              WebkitMaskImage: 'url(/assets/icons/pattern-6.svg)',
              maskSize: '100% 100%',
              WebkitMaskSize: '100% 100%',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
            }}
          />
        ))}
        <div className="relative flex flex-col items-center px-6 text-center">
          <h2 className="mb-8 font-serif text-[44px] leading-[44px] tracking-[-2.2px] text-text-primary md:text-[72px] md:leading-[72px] md:tracking-[-3.6px]">
            Discover real relief today.
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Btn to={SIGNUP} tone="yellow">
              Get Heidi free
            </Btn>
            <Btn to={DEMO} icon={<Calendar size={22} strokeWidth={1.5} />}>
              Book a demo
            </Btn>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  useEffect(() => {
    document.title = 'Heidi | The AI Care Partner for clinicians'
  }, [])
  return (
    <>
      <Hero />
      <LogoPanel />
      <QuoteBand quote={home.quotes[0].t} by="Dr Theresa Colina, Family Practitioner," org="Tuggerah Family Doctors" />
      <Bento />
      <DarkBand />
      <QuoteBand quote={home.quotes[1].t} by="Mark St. John, CIO," org="MaineGeneral Health" />
      <CtaBand />
    </>
  )
}
