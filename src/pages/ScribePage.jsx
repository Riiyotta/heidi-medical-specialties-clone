import { useEffect } from 'react'
import {
  LogoMarquee,
  PartnerCta,
  PracticePanel,
  ProductCardsPanel,
  ProductHero,
  TabsSplit,
  Timeline,
} from '../components/bands/index.jsx'
import data from '../data/bands/scribe-built-scribe.json'

// /scribe — built band by band against https://www.heidihealth.com/en-gb/scribe
// (captured with tools/capture-bands.mjs + capture-extras.mjs). Mockup visuals
// are 2x element screenshots of the live page; copy and controls are real.
const SIGNUP = 'https://scribe.heidihealth.com/onboarding'

export default function ScribePage() {
  useEffect(() => {
    document.title = 'Heidi Scribe | AI medical scribe'
  }, [])
  return (
    <>
      <ProductHero
        badge="Scribe"
        title="Capture care in your own words"
        lead="Structured documentation, generated in your natural clinical language."
        visual={{ src: '/assets/bands/scribe/v0-0.png', w: 1280, h: 180 }}
        buttons={[
          { t: 'Get Heidi free', to: SIGNUP, tone: 'yellow' },
          { t: 'Chat with us', to: '/en-gb/contact', tone: 'dark' },
        ]}
      />
      <LogoMarquee logos={data.logos} />
      <TabsSplit
        title="Vanquish the paperwork with Heidi"
        lead="Clinicians are buried in needless admin. It’s time to finally be in charge of your day"
        cta={{ t: 'Get Heidi free', to: SIGNUP }}
        tabs={data.tabs}
      />
      <PracticePanel
        title="*Every* clinician, every specialty, every setting."
        link={{ t: 'Explore templates', to: 'https://www.heidihealth.com/templates' }}
        blurb="From cardiology to paediatrics, from busy wards to offline consults, Heidi adapts to the realities of your work."
        items={data.practice}
      />
      <Timeline
        eyebrow="Working with Heidi"
        title="Make your next shift your best shift."
        lead="Heidi frees you from the admin so you can enjoy work, have a lunch break and get home on time."
        cta={{ t: 'Get Heidi free', to: SIGNUP }}
        steps={[
          {
            title: 'Before the consult',
            body: 'Review history, notes, and results in one place, sync schedules, and walk in prepared with key findings.',
            icon: '/assets/shared/before-consult.svg',
            x: 24,
            y: 48,
          },
          {
            title: 'During the consult',
            body: 'Transcribe visits in 110+ languages, structure notes your way, and instantly generate referrals and handouts.',
            icon: '/assets/shared/during-consult.svg',
            x: 500,
            y: 96,
          },
          {
            title: 'After the consult',
            body: 'Send everything to your EHR in one click, auto-apply codes and tasks, and finish your day on time without backlog.',
            icon: '/assets/shared/after-consult.svg',
            x: 976,
            y: 24,
          },
        ]}
      />
      <ProductCardsPanel
        title="Extend care beyond the note"
        lead="See how Evidence and Remote support decisions and patient care after the visit."
        cards={[
          {
            title: 'Heidi Evidence',
            body: 'Independent, unlimited evidence right where care happens.',
            img: '/assets/bands/scribe/v5-1.png',
            cta: { t: 'Explore Evidence', to: '/en-gb/evidence' },
          },
          {
            title: 'Heidi Remote',
            body: 'Wards, theaters, rural clinics, noisy EDs. Heidi Remote is a 21-gram wearable mic, fully offline, with on-device encryption. Documentation no longer depends on a desk or a quiet room.',
            img: '/assets/bands/scribe/v5-2.png',
            cta: { t: 'Explore Remote', to: '/en-gb/hardware' },
          },
        ]}
      />
      <PartnerCta />
    </>
  )
}
