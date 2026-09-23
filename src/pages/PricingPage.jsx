import { useEffect, useState } from 'react'
import { ArrowRight, Check, ChevronDown, ChevronUp, CircleHelp, GraduationCap } from 'lucide-react'
import { Button, FaqBand, LogoMarquee, PatternCta, Rich } from '../components/bands/index.jsx'
import table from '../data/bands/pricing-table.json'
import extras from '../data/bands/pricing-extras.json'
import faqAnswers from '../data/faq-answers.json'
import logos from '../data/bands/pricing-logos.json'

// /pricing — built against https://www.heidihealth.com/en-gb/pricing.
// Tier copy, prices (yearly + monthly), the Individuals / Teams split, the
// full comparison matrix and its tooltips were all captured from live
// (src/data/bands/pricing-*.json).

const PLANS = {
  individuals: [
    {
      name: 'Free',
      tagline: 'Start with the basics. Stay focused on the patient.',
      price: { yearly: '£0', monthly: '£0' },
      primary: { t: 'Get Heidi free', to: 'https://scribe.heidihealth.com/register', tone: 'sand' },
      lead: 'Free for everyone',
      features: ['Unlimited AI documentation', 'Unlimited clinical evidence with citations', 'Global healthcare-grade security'],
    },
    {
      name: 'Scribe Plus',
      tagline: 'Document with more control. Finish with more time.',
      price: { yearly: '£45', monthly: '£60' },
      per: 'per user / month',
      note: 'Prices excludes GST.',
      billing: true,
      save: 'Save £180',
      primary: { t: 'Try 14 days free', to: 'https://scribe.heidihealth.com/register#paymentChosen="PRO_TRIAL_YEARLY"' },
      secondary: { t: 'Talk to us', to: 'https://www.heidihealth.com/contact-sales' },
      lead: 'Everything in Free, plus:',
      features: ['Ask Heidi to edit or create your notes', 'Advanced templates', 'Patient & session linking'],
    },
    {
      name: 'Clinician',
      popular: true,
      tagline: 'Document clearly. Think with confidence. Leave on time.',
      price: { yearly: '£55', monthly: '£70' },
      per: 'per user / month',
      note: 'Excludes applicable sale taxes.',
      billing: true,
      save: 'Save £180',
      primary: { t: 'Try 14 days free', to: 'https://scribe.heidihealth.com/register#paymentChosen="CLINICIAN_TRIAL_YEARLY"' },
      secondary: { t: 'Talk to us', to: '/en-gb/contact-sales' },
      lead: 'Everything in Scribe Plus, plus:',
      features: ['Premium evidence sources and journals', 'Personal evidence library', 'Priority support'],
    },
    {
      name: 'Practice',
      tagline: 'Consistency across documentation and clinical standards.',
      price: { yearly: '£65', monthly: '£65' },
      per: 'per user / month',
      note: 'Billed annually. Excludes applicable sale taxes.',
      primary: { t: 'Talk to us', to: '/en-gb/contact-sales' },
      secondary: { t: 'Try 14 days free', to: 'https://scribe.heidihealth.com/register#paymentChosen="PRACTICE_TRIAL_YEARLY"' },
      lead: 'Everything in Clinician, plus:',
      features: ['Full Scribe functionality with team templates', 'Document and session sharing', 'Guided onboarding'],
    },
  ],
  teams: [
    {
      name: 'Practice',
      tagline: 'Consistency across documentation and clinical standards.',
      price: { yearly: '£65', monthly: '£65' },
      per: 'per user / month',
      note: 'Billed annually. Excludes applicable sale taxes.',
      primary: { t: 'Talk to us', to: '/en-gb/contact-sales' },
      secondary: { t: 'Try 14 days free', to: 'https://scribe.heidihealth.com/register#paymentChosen="PRACTICE_TRIAL_YEARLY"' },
      lead: 'Everything in Clinician, plus:',
      features: ['Full Scribe functionality with team templates', 'Document and session sharing', 'Guided onboarding'],
    },
    {
      name: 'Enterprise',
      tagline: 'Built for healthcare organizations with complex needs.',
      price: { yearly: 'Custom', monthly: 'Custom' },
      note: 'Flexible billing.',
      primary: { t: 'Talk to us', to: '/en-gb/contact-sales' },
      lead: 'Everything in Practice, plus:',
      features: ['SSO and enterprise-grade governance', 'Dedicated customer success', 'Service commitments and custom hosting'],
    },
  ],
}

/* ------------------------------------------------------------- segmented */

// Measured: active #28030F / #F9F4F1, 8px radius, 2px × 12px, inter 16.
function Segmented({ value, onChange }) {
  return (
    <div role="tablist" aria-label="Plan audience" className="inline-flex rounded-xl bg-accent p-1">
      {[
        ['individuals', 'For Individuals'],
        ['teams', 'For Teams and Enterprise'],
      ].map(([k, label]) => (
        <button
          key={k}
          type="button"
          role="tab"
          aria-selected={value === k}
          onClick={() => onChange(k)}
          className={`rounded-lg px-3 py-0.5 text-body tracking-[-0.48px] transition-colors ${value === k ? 'bg-dark-fill text-drawer-invert' : 'text-text-secondary hover:text-text-primary'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------- tiers */

// Measured card: white, 1px #F0DFD1, 16px radius, 20px padding, 305px (four
// up) or 502px (two up). Name exposure 24/30; tagline inter 12 secondary;
// price exposure 40/44/−2 with "per user / month" inter 14; a Yearly/Monthly
// switch (12px, 6px radius) and a green (#16A34A) saving; full-width 40px
// CTA; borderless 14px secondary link; features inter 14 with 20px checks.
// "Most Popular" swaps the border to #28030F and hangs a #F9DFCD pill on it.
function TierCard({ plan, cycle, setCycle }) {
  const price = plan.price[cycle]
  return (
    <article className={`relative flex flex-col rounded-2xl border bg-card-white p-5 ${plan.popular ? 'border-text-primary' : 'border-border-base'}`}>
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-[36px] bg-[#F9DFCD] px-3 py-1 text-caption font-semibold text-text-primary">Most Popular</span>
      )}
      <h2 className="font-serif text-h3-desktop text-text-primary">{plan.name}</h2>
      <p className="mt-1 min-h-[34px] text-caption tracking-[-0.36px] text-text-secondary">{plan.tagline}</p>
      <p className="mt-4 flex items-baseline gap-2">
        <span className="font-serif text-[40px] leading-[44px] tracking-[-2px] text-text-primary">{price}</span>
        {plan.per && <span className="text-sm tracking-[-0.42px] text-text-primary">{plan.per}</span>}
      </p>
      <div className="mt-2 min-h-[48px] text-caption tracking-[-0.36px] text-text-secondary">
        {plan.note && <p>{plan.note}</p>}
        {plan.billing && (
          <div className="mt-2 flex items-center gap-2">
            <span>Billed</span>
            {['yearly', 'monthly'].map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={cycle === c}
                onClick={() => setCycle(c)}
                className={`rounded-md px-1.5 capitalize ${cycle === c ? 'bg-dark-fill text-drawer-invert' : 'text-text-secondary hover:text-text-primary'}`}
              >
                {c}
              </button>
            ))}
            {cycle === 'yearly' && plan.save && <span className="ml-auto text-sm font-semibold tracking-[-0.42px] text-[#16A34A]">{plan.save}</span>}
          </div>
        )}
      </div>
      <div className="mt-6 flex flex-col items-center gap-2">
        <Button to={plan.primary.to} tone={plan.primary.tone || 'dark'} className="w-full justify-center py-2.5 text-sm">
          {plan.primary.t}
        </Button>
        {plan.secondary && (
          <Button to={plan.secondary.to} tone="ghost" className="rounded-2xl px-4 py-1 text-sm">
            {plan.secondary.t}
          </Button>
        )}
      </div>
      <div className="mt-6">
        <p className="mb-3 text-sm font-medium tracking-[-0.42px] text-text-primary">{plan.lead}</p>
        <ul className="flex flex-col gap-2.5">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm tracking-[-0.42px] text-text-secondary">
              <Check size={20} strokeWidth={2} className="shrink-0 text-text-primary" />
              {f}
            </li>
          ))}
        </ul>
      </div>
      <a href="#pricing-table" className="mt-auto pt-8 text-body font-medium tracking-[-0.48px] text-text-primary hover:underline">
        See more
      </a>
    </article>
  )
}

const edgeMask = {
  maskImage: 'url(/assets/icons/pattern-5.svg)',
  WebkitMaskImage: 'url(/assets/icons/pattern-5.svg)',
  maskSize: 'contain',
  WebkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
}

function Hero({ audience, setAudience }) {
  const [cycle, setCycle] = useState('yearly')
  const plans = PLANS[audience]
  return (
    <section className="relative overflow-hidden px-global py-12 md:py-section-md">
      {['left-0', 'right-0 -scale-x-100'].map((pos) => (
        <div key={pos} aria-hidden className={`pointer-events-none absolute top-[173px] hidden h-[743px] w-[283px] bg-accent xl:block ${pos}`} style={edgeMask} />
      ))}
      <div className="relative mx-auto max-w-container-lg">
        <h1 className="text-center font-serif text-h1-mobile text-text-primary lg:text-h1-desktop">
          <Rich text="There's a Heidi that's right for *you*" />
        </h1>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <Segmented value={audience} onChange={setAudience} />
          <label className="relative">
            <span className="sr-only">Currency</span>
            <select defaultValue="GBP" className="appearance-none rounded-button bg-card-white py-2.5 pl-4 pr-11 text-body tracking-[-0.48px] text-text-primary">
              <option value="GBP">GBP (£)</option>
            </select>
            <ChevronDown size={24} strokeWidth={1.5} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-primary" />
          </label>
        </div>
        <div className={`mt-14 grid gap-5 ${plans.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'mx-auto max-w-[1024px] md:grid-cols-2'}`}>
          {plans.map((p) => (
            <TierCard key={p.name} plan={p} cycle={cycle} setCycle={setCycle} />
          ))}
        </div>
        <div className="mt-20 flex flex-col items-center justify-center gap-4 text-center md:flex-row md:text-left">
          <GraduationCap size={24} strokeWidth={1.5} className="text-text-primary" />
          <div>
            <p className="text-body font-semibold tracking-[-0.48px] text-text-primary">Trainees get Clinician, free</p>
            <p className="text-body tracking-[-0.48px] text-text-secondary">Verify your student status. Get the same tool consultants trust, yours free.</p>
          </div>
          <Button to="/en-gb/solutions/medical-trainees" tone="sand" className="md:ml-20">
            Learn more
          </Button>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ comparison */

const TIPS = Object.fromEntries(extras.tips.filter((t) => t.tip).map((t) => [t.label, t.tip]))

function sections(rows) {
  const out = []
  for (const r of rows) {
    if (r.fs === '24px') out.push({ title: r.label, rows: [] })
    else out[out.length - 1]?.rows.push(r)
  }
  return out
}

function Cell({ v }) {
  if (v === 'check') return <Check size={16} strokeWidth={2} className="mx-auto text-text-secondary" aria-label="Included" />
  if (v === '—' || !v) return <span className="text-sm tracking-[-0.42px] text-text-secondary" aria-label="Not included">—</span>
  return <span className="text-sm tracking-[-0.42px] text-text-secondary">{v}</span>
}

// Measured: sticky 173px header (exposure 32 title + toggle; plan names
// exposure 24 over their two CTAs, 224px columns from x=480); collapsible
// sections (exposure 24 + chevron); 65px rows with inter 16 labels and a 16px
// help icon at 40% black; cells centred; the Clinician column sits on a white
// 192px strip with 12px-rounded ends.
function CompareTable({ audience, setAudience }) {
  const teams = audience === 'teams'
  const plans = teams ? ['Practice', 'Enterprise'] : ['Free', 'Scribe Plus', 'Clinician', 'Practice']
  const rows = teams ? extras.teams.table.rows : table.rows
  const highlight = teams ? -1 : 2
  const [open, setOpen] = useState({})
  const heads = (teams ? PLANS.teams : PLANS.individuals).map((p) => ({ name: p.name, primary: p.primary, secondary: p.secondary }))
  const cols = `minmax(0,1fr) repeat(${plans.length}, minmax(0, ${teams ? '336px' : '224px'}))`
  return (
    <section id="pricing-table" className="scroll-mt-24 px-global py-12 md:py-section-md">
      <div className="mx-auto max-w-container-lg overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="sticky top-[72px] z-10 grid items-start bg-page pb-6 pt-4" style={{ gridTemplateColumns: cols }}>
            <div className="pt-6">
              <h2 className="mb-4 font-serif text-[32px] leading-[38.4px] tracking-[-1.6px] text-text-primary">Compare our plans</h2>
              <Segmented value={audience} onChange={setAudience} />
            </div>
            {heads.map((h) => (
              <div key={h.name} className="flex flex-col items-center gap-3 text-center">
                <h3 className="font-serif text-h3-desktop text-text-primary">{h.name}</h3>
                <Button to={h.primary.to} tone={h.primary.tone || 'dark'} className="text-body">
                  {h.primary.t}
                </Button>
                {h.secondary && (
                  <Button to={h.secondary.to} tone="ghost" className="text-sm">
                    {h.secondary.t}
                  </Button>
                )}
              </div>
            ))}
          </div>
          {sections(rows).map((sec) => {
            const collapsed = open[sec.title] === false
            return (
              <div key={sec.title} className="mt-10">
                <button
                  type="button"
                  aria-expanded={!collapsed}
                  onClick={() => setOpen((o) => ({ ...o, [sec.title]: collapsed }))}
                  className="flex w-full items-center justify-between px-6 py-4 font-serif text-h3-desktop text-text-primary"
                >
                  {sec.title}
                  {collapsed ? <ChevronDown size={24} className="text-[#4C2934]" /> : <ChevronUp size={24} className="text-[#4C2934]" />}
                </button>
                {!collapsed && (
                  <div role="table" aria-label={`${sec.title} features`}>
                    {sec.rows.map((r, i) => (
                      <div key={r.label} role="row" className="grid items-center border-b border-border-base/60" style={{ gridTemplateColumns: cols }}>
                        <div role="rowheader" className="flex items-center gap-2 px-6 py-5 text-body tracking-[-0.48px] text-text-primary">
                          {r.label}
                          {TIPS[r.label] && (
                            <span className="group relative inline-flex">
                              <CircleHelp size={16} strokeWidth={2} className="text-black/40" aria-label={TIPS[r.label]} />
                              <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-60 -translate-x-1/2 rounded-lg bg-dark-fill px-3 py-2 text-caption text-drawer-invert opacity-0 transition-opacity group-hover:opacity-100">
                                {TIPS[r.label]}
                              </span>
                            </span>
                          )}
                        </div>
                        {r.cells.map((c, k) => (
                          <div
                            key={k}
                            role="cell"
                            className={`flex h-full items-center justify-center py-5 ${k === highlight ? `mx-4 bg-card-white ${i === 0 ? 'rounded-t-xl' : ''} ${i === sec.rows.length - 1 ? 'rounded-b-xl' : ''}` : ''}`}
                          >
                            <Cell v={c} />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default function PricingPage() {
  const [audience, setAudience] = useState('individuals')
  useEffect(() => {
    document.title = 'Pricing | Heidi'
  }, [])
  return (
    <>
      <Hero audience={audience} setAudience={setAudience} />
      <LogoMarquee label="Trusted by clinicians globally" logos={logos} />
      <CompareTable audience={audience} setAudience={setAudience} />
      <FaqBand
        sub="Everything you need to know about Heidi."
        buttons={[{ t: 'Speak to Heidi team', to: '/en-gb/contact', trailing: <ArrowRight size={22} strokeWidth={1.5} /> }]}
        items={(faqAnswers.pricing || []).filter((x) => x.a?.length)}
      />
      <PatternCta
        tone="forest"
        pattern={5}
        height={425}
        title="The inside scoop on Heidi"
        sub="100s of 5-star testimonials"
        buttons={[{ t: 'Get Heidi free', to: 'https://scribe.heidihealth.com/onboarding', tone: 'sand', trailing: <ArrowRight size={22} strokeWidth={1.5} /> }]}
      />
    </>
  )
}
