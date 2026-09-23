import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, BadgeCheck, Plus, User, icons } from 'lucide-react'
import { Cta, FaqList } from '../sections/index.jsx'
import { Media } from '../Skeleton.jsx'

// Components for the "For" (solutions) pages. Every one of these pages is the
// same stack of bands on the live site; the content comes from the recon data
// (src/data/pages/solutions-*.json + src/data/solutions.json) and the layout
// values below were measured on the live pages at 1440px.
//
// Each band is inset 80px top and bottom from md up (the live band wrapper is
// its section's height + 160px), 48px on phones.

function Band({ children, className = '', id }) {
  return (
    <section id={id} className={`px-global py-12 md:py-section-md ${id ? 'scroll-mt-24' : ''}`}>
      <div className={`mx-auto max-w-container-lg ${className}`}>{children}</div>
    </section>
  )
}

/* ------------------------------------------------------------------- hero */

// Text left, visual right: two 600px columns with an 80px gap. The visual is
// an element screenshot of the live hero (photo + the client-side mock card,
// which differs per page and is not in the page's HTML).
export function Hero({ eyebrow, heading, body, cta, visual }) {
  return (
    <Band className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
      <div>
        {eyebrow && <p className="mb-4 text-body font-semibold text-text-primary">{eyebrow}</p>}
        <h1 className="mb-6 font-serif text-h1-mobile text-text-primary lg:text-h1-desktop">{heading}</h1>
        {body && <p className="mb-8 max-w-xl text-body text-text-primary">{body}</p>}
        {cta && <Cta link={cta} variant="primary" />}
      </div>
      {visual && (
        <Media
          src={visual.src}
          alt=""
          className="mx-auto aspect-[600/480] w-full max-w-[600px] lg:mx-0 lg:justify-self-end"
        />
      )}
    </Band>
  )
}

/* ---------------------------------------------------------- specialty strip */

// Chips: plain text, #F9F4F1 fill, 8px radius, 14px medium, 12px × 8px.
export function SpecialtyStrip({ heading, sub, label, chips, icon }) {
  return (
    <Band className="text-center">
      <h2 className="mx-auto mb-8 max-w-3xl font-serif text-h2-mobile text-text-primary md:text-h2-desktop">
        {heading}
      </h2>
      {sub && <p className="mx-auto mb-8 max-w-2xl text-body text-text-primary">{sub}</p>}
      {label && <p className="text-body font-semibold text-text-primary">{label}</p>}
      <div className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-3">
        {chips.map((c) => (
          <span key={c} className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-text-primary">
            {/* Some pages (Primary Care) prefix each chip with the 20px sparkle. */}
            {icon && (
              <svg viewBox="0 0 22 22" className="h-5 w-5 shrink-0" fill="currentColor" aria-hidden>
                <path d="M0.25 10.2661H6.28951C8.34771 10.2661 10.0161 8.59771 10.0161 6.53951V0.5H11.4839V6.53951C11.4839 8.59771 13.1523 10.2661 15.2105 10.2661H21.25V11.7339H15.2105C13.1523 11.7339 11.4839 13.4023 11.4839 15.4605V21.5H10.0161V15.4605C10.0161 13.4023 8.34771 11.7339 6.28951 11.7339H0.25V10.2661Z" />
              </svg>
            )}
            {c}
          </span>
        ))}
      </div>
    </Band>
  )
}

/* ------------------------------------------------------------- feature row */

// Alternating 600×480 visual + copy. The visual is a screenshot of the live
// one, since several are DOM mocks (the Dictate waveform card) not images.
export function FeatureRow({ heading, body, cta, visual, imageFirst }) {
  return (
    <Band className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
      {/* Phones: copy first, visual second (as live); lg: alternate. */}
      <div className={`order-2 ${imageFirst ? 'lg:order-1' : 'lg:order-2'}`}>
        {visual && <Media src={visual} alt="" loading="lazy" className="mx-auto aspect-[600/480] w-full max-w-[600px]" />}
      </div>
      <div className={`order-1 ${imageFirst ? 'lg:order-2' : 'lg:order-1'}`}>
        <h2 className="mb-6 font-serif text-h2-mobile text-text-primary md:text-h2-desktop">{heading}</h2>
        {body.map((p) => (
          <p key={p} className="mb-8 max-w-xl text-body text-text-primary">
            {p}
          </p>
        ))}
        {cta && <Cta link={cta} variant="yellow" />}
      </div>
    </Band>
  )
}

/* ------------------------------------------------------------------- stats */

const toPascal = (name) => name.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('')

// Measured: heading exposure 32/38.4/−1.6 centred in 768px, 80px above the
// cards; cards white, 24px radius, 32px padding, 32px between icon and copy;
// icon 43px lucide at stroke 1.5 (the live page's own icon names); value
// exposure 32/38.4/−1.6; caption inter 16/22.4/−0.48.
export function StatsBand({ heading, cards }) {
  return (
    <Band className="flex flex-col items-center gap-section-md">
      {heading && (
        <h2 className="max-w-3xl text-center font-serif text-[32px] leading-[38.4px] tracking-[-1.6px] text-text-primary">
          {heading}
        </h2>
      )}
      <div className="grid w-full max-w-[1072px] grid-cols-1 gap-8 md:grid-cols-3">
        {cards.map((c) => {
          const Icon = (c.icon && icons[toPascal(c.icon)]) || null
          return (
            <div key={c.value} className="flex flex-col gap-8 rounded-card bg-card-white p-8">
              {Icon && <Icon size={43} strokeWidth={1.5} className="text-text-primary" />}
              <div>
                <p className="mb-2 font-serif text-[32px] leading-[38.4px] tracking-[-1.6px] text-text-primary">{c.value}</p>
                <p className="text-body tracking-[-0.48px] text-text-primary">{c.caption}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Band>
  )
}

/* -------------------------------------------------------- your day with heidi */

// Autoplay measured on live: the active tab's rail fills linearly over 5000ms,
// then advances (looping). Tabs sit on 2px rails; inactive titles secondary.
const AUTOPLAY_MS = 5000

export function DayWithHeidi({ heading, intro, items }) {
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    const start = performance.now()
    setProgress(0)
    const tick = (now) => {
      const pct = Math.min(100, ((now - start) / AUTOPLAY_MS) * 100)
      setProgress(pct)
      if (pct >= 100) return setActive((i) => (i + 1) % items.length)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [active, items.length])

  return (
    <Band id="day-with-heidi">
      <h2 className="mb-4 font-serif text-h2-mobile text-text-primary md:text-h2-desktop">{heading}</h2>
      {intro && <p className="mb-12 max-w-3xl text-body text-text-primary">{intro}</p>}
      {!intro && <div className="mb-8" />}
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-10" role="tablist" aria-label={heading}>
          {items.map((it, i) => {
            const on = i === active
            return (
              <button
                key={it.title}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => i !== active && setActive(i)}
                className="relative flex flex-col gap-1 border-t-2 border-border-base pt-6 text-left"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-0 -mt-0.5 h-[2px] bg-text-primary"
                  style={{ width: on ? `${progress}%` : '0%' }}
                />
                <span
                  className={`font-serif text-h3-desktop transition-colors duration-300 ${
                    on ? 'text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  {it.title}
                </span>
                <span
                  className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: on ? '1fr' : '0fr' }}
                >
                  <span
                    className="min-h-0 max-w-md pt-2 text-body text-text-secondary"
                    style={{
                      opacity: on ? 1 : 0,
                      transform: on ? 'none' : 'translateY(8px)',
                      transition: 'opacity 300ms cubic-bezier(0.4,0,0.2,1), transform 300ms cubic-bezier(0.4,0,0.2,1)',
                    }}
                  >
                    {it.body}
                    {/* Phones: live shows the tab's image inside the open tab. */}
                    {it.img && (
                      <Media src={it.img} alt={it.alt} loading="lazy" className="mt-6 aspect-square w-full rounded-card object-cover lg:hidden" />
                    )}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        <div className="mx-auto hidden aspect-square w-full max-w-[536px] overflow-hidden rounded-card lg:mr-0 lg:block">
          {items[active].img && (
            <Media src={items[active].img} alt={items[active].alt} className="h-full w-full object-cover" />
          )}
        </div>
      </div>
    </Band>
  )
}

/* ----------------------------------------------------------- template grid */

// Measured: centred 56px heading; 3 × 416px white cards, 1px #F0DFD1, 24px
// radius, 16px padding, 16px gap. Kind pill #F9F4F1 / 14px medium / primary.
// Footer: 34×24 flag, author 14 semibold + verified badge (#3C6DDD fill,
// #F9F4F1 tick), specialty 14 secondary, user icon + count 12 secondary.
export function TemplateGrid({ eyebrow, heading, body, cta, cards }) {
  return (
    <Band id="templates" className="flex flex-col items-center">
      {eyebrow && <p className="mb-4 text-body text-text-secondary">{eyebrow}</p>}
      <h2 className="max-w-3xl text-center font-serif text-h2-mobile text-text-primary md:text-h2-lg-desktop">
        {heading}
      </h2>
      {body && <p className="mt-6 max-w-2xl text-center text-body text-text-primary">{body}</p>}
      {cta && (
        <div className="mt-8">
          <Cta link={cta} variant="primary" />
        </div>
      )}
      <div className="mt-12 grid w-full grid-cols-1 items-stretch gap-4 md:mt-section-md md:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <a
            key={c.href}
            href={`https://www.heidihealth.com${c.href}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-full flex-col rounded-card border border-border-base bg-card-white p-4 transition-shadow hover:shadow-xs"
          >
            <span className="mb-2 w-fit rounded-lg bg-accent px-2 py-0.5 text-sm font-medium text-text-primary">
              {c.kind}
            </span>
            <p className="mb-6 text-card-title font-medium text-text-primary">{c.title}</p>
            <div className="mt-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Media src="/assets/icons/flags/country-united-kingdom.svg" alt={c.flag || ''} width={34} height={24} className="h-6 w-[34px] shrink-0" />
                <div>
                  <p className="flex items-center gap-1 text-sm font-semibold text-text-primary">
                    {c.author}
                    <BadgeCheck size={16} className="fill-badge-check text-badge-check-tick" />
                  </p>
                  {c.specialty && <p className="text-sm text-text-secondary">{c.specialty}</p>}
                </div>
              </div>
              {c.count != null && (
                <span className="flex shrink-0 items-center gap-1 text-caption text-text-secondary">
                  <User size={16} />
                  {c.count}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </Band>
  )
}

/* ----------------------------------------------------- "In practice" panel */

// Measured: #F9F4F1 panel, 36px radius, 64px padding, 80px between a 429px
// copy column (56px gaps) and a 643px square preview. Eyebrow inter 18/25.2
// secondary with a plus glyph; template names 16px, 16px apart, the active one
// primary with a plus marker, the rest secondary.
export function TemplatePractice({ heading, cta, body, items }) {
  const [active, setActive] = useState(0)
  const go = (d) => setActive((i) => (i + d + items.length) % items.length)
  return (
    <section className="px-global py-12 md:py-section-md">
      <div className="mx-auto flex max-w-container-lg flex-col gap-12 rounded-[36px] bg-accent p-8 lg:flex-row lg:gap-20 lg:p-16">
        <div className="flex flex-col gap-14 lg:w-[429px] lg:shrink-0">
          <div className="flex flex-col items-start gap-6">
            <p className="flex items-center gap-1.5 text-lg tracking-[-0.54px] text-text-secondary">
              <Plus size={18} strokeWidth={1.5} /> In practice
            </p>
            <h2 className="font-serif text-h2-mobile text-text-primary md:text-h2-lg-desktop">{heading}</h2>
            {cta && <Cta link={cta} variant="primary" />}
            {body && <p className="text-body text-text-primary md:text-xl md:leading-7">{body}</p>}
          </div>
          <div>
            <ul className="flex flex-col gap-4" role="tablist" aria-label="Templates">
              {items.map((it, i) => (
                <li key={it.name} className="relative">
                  {i === active && (
                    <Plus size={24} strokeWidth={1.5} className="absolute -left-7 top-0 text-text-primary" aria-hidden />
                  )}
                  <button
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    onClick={() => setActive(i)}
                    className={`text-left text-base transition-colors ${
                      i === active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {it.name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex gap-5">
              <button type="button" aria-label="Previous template" onClick={() => go(-1)} className="text-text-secondary hover:text-text-primary">
                <ArrowLeft size={24} />
              </button>
              <button type="button" aria-label="Next template" onClick={() => go(1)} className="text-text-secondary hover:text-text-primary">
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        </div>
        <div className="hidden aspect-square w-full overflow-hidden rounded-card lg:block lg:max-w-[643px]">
          {items[active]?.img && (
            <Media src={items[active].img.src} alt={items[active].img.alt || items[active].name} className="h-full w-full object-cover" />
          )}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------- video */

// Measured: centred 56px heading + 16px sub, 80px above a 1280×720 embed with
// a 24px radius. Live autoplays muted; so does this.
export function VideoBand({ heading, sub, src }) {
  return (
    <Band className="flex flex-col items-center gap-section-md">
      <div className="text-center">
        <h2 className="mb-4 font-serif text-h2-mobile text-text-primary md:text-h2-lg-desktop">{heading}</h2>
        {sub && <p className="text-body tracking-[-0.48px] text-text-primary">{sub}</p>}
      </div>
      <div className="aspect-video w-full overflow-hidden rounded-card">
        <Media as="iframe"
          src={src}
          title={sub || heading}
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </Band>
  )
}

/* ----------------------------------------------------------- testimonials */

// shadcn/embla carousel on live: ~560px cards with a peek of the next, a
// right-edge fade, and plain secondary arrows (right-aligned) that clamp at
// the ends. The track eases like embla's friction settle (~380ms expo-out).
export function Testimonials({ heading, link, items }) {
  const [index, setIndex] = useState(0)
  const [step, setStep] = useState(0)
  const track = useRef(null)
  useEffect(() => {
    const measure = () => {
      const t = track.current
      if (!t?.firstElementChild) return
      setStep(t.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(t).columnGap || '0'))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  const max = items.length - 1
  return (
    <Band id="testimonials">
      <div className="mb-16 grid items-end gap-8 md:grid-cols-2">
        <h2 className="font-serif text-h2-mobile text-text-primary md:text-h2-desktop">{heading}</h2>
        {link && (
          <div className="md:justify-self-end">
            <Cta link={link} variant="primary" />
          </div>
        )}
      </div>
      <div className="relative overflow-hidden" role="region" aria-roledescription="carousel" aria-label={heading}>
        <div
          ref={track}
          className="flex gap-8 px-3 py-3"
          style={{ transform: `translateX(-${index * step}px)`, transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {items.map((t) => (
            <figure
              key={t.quote}
              className="flex w-full max-w-[560px] shrink-0 flex-col rounded-testimonial border border-border-base bg-page p-6 md:p-9 lg:shadow-testimonial-md"
            >
              <blockquote className="mb-8 max-w-[400px] font-serif text-xl leading-[25px] tracking-[-1px] text-text-primary md:mb-12 md:text-h6-quote">{t.quote}</blockquote>
              <figcaption className="mt-auto">
                <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                {t.title && <p className="text-sm text-text-secondary">{t.title}</p>}
              </figcaption>
            </figure>
          ))}
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-r from-transparent to-page md:block" />
      </div>
      {items.length > 1 && (
        <div className="mt-10 flex justify-end gap-5">
          <button type="button" aria-label="Previous slide" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))} className="text-text-secondary disabled:opacity-40">
            <ArrowLeft size={24} />
          </button>
          <button type="button" aria-label="Next slide" disabled={index === max} onClick={() => setIndex((i) => Math.min(max, i + 1))} className="text-text-secondary disabled:opacity-40">
            <ArrowRight size={24} />
          </button>
        </div>
      )}
    </Band>
  )
}

/* -------------------------------------------------------------------- faq */

// Two live variants, told apart by the band's own classes: most pages put the
// heading left and the list right (md:grid-cols-2); some (Specialists,
// Nursing) stack a centred heading over a centred 600px list.
export function Faq({ heading, items, stacked }) {
  if (stacked)
    return (
      <Band id="faq" className="flex flex-col items-center gap-section-md">
        <h2 className="text-center font-serif text-[40px] leading-[40px] tracking-[-2px] text-text-primary md:text-h2-lg-desktop">{heading}</h2>
        <FaqList items={items} />
      </Band>
    )
  return (
    <Band id="faq" className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-section-md">
      <h2 className="font-serif text-[40px] leading-[40px] tracking-[-2px] text-text-primary md:text-h2-lg-desktop">{heading}</h2>
      <FaqList items={items} />
    </Band>
  )
}

/* ------------------------------------------------------------- CTA band */

// Measured: a yellow panel inset 48px from the viewport edges, 36px radius,
// ~544px tall, with the white swirl pattern; centred 56px heading and the
// page's own captured button (near-black, no arrow, on every "For" page).
export function CtaBand({ heading, buttons }) {
  return (
    <section className="py-12 md:px-12 md:py-section-md">
      <div className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-[36px] bg-accent-yellow px-8 py-20 text-center md:min-h-[544px]">
        {/* Live: pattern-5.svg used as a CSS mask over #FDFAC4, in a 283px
            panel at each edge, vertically centred (mirrored on the right). */}
        {['left-0', 'right-0 -scale-x-100'].map((pos) => (
          <div
            key={pos}
            aria-hidden
            className={`pointer-events-none absolute top-1/2 hidden h-full w-[283px] -translate-y-1/2 bg-[#FDFAC4] md:block ${pos}`}
            style={{
              maskImage: 'url(/assets/icons/pattern-5.svg)',
              WebkitMaskImage: 'url(/assets/icons/pattern-5.svg)',
              maskSize: '100% 100%',
              WebkitMaskSize: '100% 100%',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
            }}
          />
        ))}
        <div className="relative flex flex-col items-center">
          <h2 className="mb-10 max-w-3xl font-serif text-h2-mobile text-text-primary md:text-h2-lg-desktop">{heading}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {buttons.map((b, i) => (
              <Cta key={b.t + i} link={b} variant="dark" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
