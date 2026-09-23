import { useEffect } from 'react'
import {
  FaqBand,
  FeatureSplit,
  IconColumnsPanel,
  IconGrid,
  PatternCta,
  SplitHero,
  Statement,
} from '../components/bands/index.jsx'
import bands from '../data/bands/coding.json'
import faqAnswers from '../data/faq-answers.json'

// /product/coding — built band by band against
// https://www.heidihealth.com/en-gb/product/coding. Copy is read from the
// capture (src/data/bands/coding.json) so it stays verbatim.
const txt = (band, tag, n = 0) => bands[band].texts.filter((t) => t.tag === tag)[n]?.t
const SIGNUP = 'https://scribe.heidihealth.com/onboarding'
const WAITLIST = '/en-gb/medical-codes'

// The "Codes you need" grid pairs each title with the body below it.
const grid = (band) => {
  const titles = bands[band].texts.filter((t) => t.tag === 'h3' && t.fs === 32)
  const bodies = bands[band].texts.filter((t) => t.tag === 'p')
  const icons = bands[band].icons
  return titles.map((t, i) => ({ title: t.t, body: bodies[i]?.t, icon: icons[i]?.name }))
}

export default function CodingPage() {
  useEffect(() => {
    document.title = 'Heidi Coding | Accurate, billable codes as you write'
  }, [])
  const hero = bands[0].texts.find((t) => t.tag === 'p')
  const panel = grid(6)
  panel[2] = { ...panel[2], icon: '/assets/shared/icon-hospital.svg' }
  return (
    <>
      <SplitHero
        tone="sand"
        eyebrow="Coding"
        title={txt(0, 'h1')}
        body={hero.html || hero.t}
        cta={{ t: 'Join the waitlist for access', to: WAITLIST }}
        visual="/assets/bands/coding/v0-0.png"
      />
      <Statement title={txt(1, 'h2')} lead={txt(1, 'p')} />
      {[2, 3, 4].map((b, i) => (
        <FeatureSplit
          key={b}
          title={txt(b, 'h2')}
          body={txt(b, 'p')}
          cta={{ t: 'Get Heidi free', to: SIGNUP }}
          visual={`/assets/bands/coding/v${b}-0.png`}
          imageFirst={i % 2 === 0}
        />
      ))}
      <IconGrid title={txt(5, 'h3')} items={grid(5)} />
      <IconColumnsPanel title={txt(6, 'h3')} items={panel} />
      <FaqBand sub="Everything you need to know about Heidi" items={(faqAnswers['product-coding'] || []).filter((x) => x.a?.length)} />
      <PatternCta title={txt(8, 'h2')} buttons={[{ t: 'Join the waitlist for access', to: WAITLIST }]} />
    </>
  )
}
