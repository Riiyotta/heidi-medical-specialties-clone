import { useEffect } from 'react'
import {
  AskBar,
  CenterShowcase,
  LogoMarquee,
  PanelFeature,
  PartnerCta,
  ProductCardsPanel,
  ProductHero,
  QuoteBlock,
  TabsSplit,
} from '../components/bands/index.jsx'
import data from '../data/bands/evidence-built.json'

// /evidence — built band by band against https://www.heidihealth.com/en-gb/evidence.
const TRIAL = 'https://scribe.heidihealth.com/register#paymentChosen="EVIDENCE_TRIAL"'

export default function EvidencePage() {
  useEffect(() => {
    document.title = 'Heidi Evidence | Clinical answers you can trace'
  }, [])
  return (
    <>
      <ProductHero
        badge="Evidence"
        title="The right call for *every* patient"
        lead="Heidi answers from your guidelines, scores, and drafts what comes next."
        visual={{ node: <AskBar /> }}
        buttons={[
          { t: 'Get Heidi free', to: TRIAL, tone: 'yellow' },
          { t: 'Chat with us', to: '/en-gb/contact', tone: 'dark' },
        ]}
      />
      <LogoMarquee label="Grounded in trusted clinical sources" logos={data.logos} duration={30} />
      <CenterShowcase
        title="Every answer, back to the source"
        lead="Open the citation behind any answer and read the source yourself. Every answer is traceable, so you can verify it before you act."
        cta={{ t: 'Get Heidi free', to: TRIAL }}
        visual={{ src: '/assets/bands/evidence/v2-0.png', w: 1280, h: 573 }}
      />
      <TabsSplit title="It doesn't stop at the answer" tabs={data.tabs} />
      <PanelFeature
        title="Choose the sources that shape your answers"
        body="Set which sources Heidi prioritises for you, or standardise them across your team, so everyone works from consistent guidance while keeping their own judgement."
        cta={{ t: 'Explore pricing', to: '/en-gb/pricing' }}
        visual="/assets/bands/evidence/v4-1.png"
      />
      <QuoteBlock
        eyebrow="Evidence you can see. Decisions you can trust."
        quote="“It saves time and increases my confidence in treatment plans.”"
        name="Dr John Duncan"
        role="Family Practitioner, Lahinch and Burren Medical Practice"
      />
      <ProductCardsPanel
        title="Every part of care, *connected*"
        lead="From conversations to clinical questions and follow-ups, Heidi brings the full clinical day into one AI Care Partner."
        cards={[
          {
            title: 'Heidi Scribe',
            body: 'Capture the encounter as it happens, adapting to your specialty, setting and style to create structured notes before the patient leaves.',
            img: '/assets/bands/evidence/v6-1.png',
            cta: { t: 'Explore Scribe', to: '/en-gb/scribe' },
          },
          {
            title: 'Heidi Remote',
            body: 'Wards, theaters, rural clinics, noisy EDs. Heidi Remote is a 21-gram wearable mic, fully offline, with on-device encryption. Documentation no longer depends on a desk or a quiet room.',
            img: '/assets/bands/evidence/v6-2.png',
            cta: { t: 'Explore Remote', to: '/en-gb/hardware' },
          },
        ]}
      />
      <PartnerCta />
    </>
  )
}
