import { useEffect } from 'react'
import { ArrowRight, Download } from 'lucide-react'
import {
  CompliancePanel,
  DiagramBand,
  FaqBand,
  IconCardTrio,
  ImageTrio,
  PatternCta,
  StoryQuote,
  VideoHero,
  VideoIntro,
} from '../components/bands/index.jsx'
import bands from '../data/bands/hardware.json'
import faqAnswers from '../data/faq-answers.json'

// /hardware (Heidi Remote) — built band by band against
// https://www.heidihealth.com/en-gb/hardware.
const STORE = '/en-gb/store/remote'
const GET = { t: 'Get Remote', to: STORE }
const txt = (band, tag, n = 0) => bands[band].texts.filter((t) => t.tag === tag)[n]?.t
const trio = (band, size) =>
  bands[band].texts.filter((t) => t.tag === 'h3' && t.fs === size).map((h, i) => ({ title: h.t, body: txt(band, 'p', i + (band === 1 ? 1 : 0)) }))

// The two guides download through a gated flow on live; send people there.
const GUIDES = 'https://www.heidihealth.com/en-gb/hardware'

export default function HardwarePage() {
  useEffect(() => {
    document.title = 'Heidi Remote | The clip-on AI mic for clinicians'
  }, [])
  const clip = trio(1, 24).map((c, i) => ({ ...c, img: `/assets/bands/hardware/v1-${i}.png`, alt: 'Heidi remote held by a doctor' }))
  const built = trio(2, 32).map((c, i) => ({ ...c, icon: bands[2].icons.filter((x) => x.box.w === 48)[i]?.name }))
  return (
    <>
      <VideoHero
        src="/assets/bands/hardware/hero.mp4"
        title={'Capture every\nsession. *On the go.*'}
        body={txt(0, 'p')}
        price={{ was: '£209', now: '£156.75' }}
        cta={GET}
      />
      <ImageTrio title="Clip on. Then *care.*" lead={txt(1, 'p')} cta={GET} cards={clip} />
      <IconCardTrio title={'Remote is built for\n*the way you work*'} cta={GET} cards={built} />
      <VideoIntro
        title="See Remote in action"
        lead={txt(3, 'p')}
        src="https://www.youtube.com/embed/fnIm8hMaXOE?mute=1&playsinline=1&modestbranding=1&rel=0&cc_load_policy=1&cc_lang_pref=en&hl=en"
      />
      <StoryQuote
        eyebrow="Customer Story"
        quote={bands[4].texts.find((t) => t.tag === 'em').t}
        name="Dr Paul Hacker"
        role="Community Palliative Care Physician, Ottawa"
        cta={{ t: 'Learn More', to: '/en-gb/customers/how-heidi-remote-moves-with-dr-paul-hacker' }}
      />
      <CompliancePanel
        title="Your duty of care, built in."
        cta={{ t: 'View Our Privacy Policy', to: '/en-gb/legal/privacy-policy' }}
        paras={[
          'Heidi Remote is designed and tested to meet international regulatory standards across key markets.',
          'When paired with the Heidi platform, your data is further protected by an enterprise-grade security framework that is ISO 27001:2022 certified and SOC 2 compliant. This includes encryption in transit and at rest, de-identification of personal and health information, and strict access controls.',
          'The Heidi platform is also built to meet GDPR, HIPAA, and PIPEDA requirements.',
        ]}
        badges={[
          { alt: '27001 Certified', src: '/assets/bands/hardware/bf9f0ff1a93439418fe92e904b3ce72f4881bdb4-170x73.png' },
          { alt: 'RGPD Compliant', src: '/assets/bands/hardware/3cc92d71f0445f557837746be54706de2b32a3a1-101x44.svg' },
          { alt: 'HIPAA Compliant', src: '/assets/bands/hardware/32c6ae37170988a19ea5a8e5b994adb730c03f38-101x44.svg' },
          { alt: 'PIPEDA Compliant', src: '/assets/bands/hardware/da71c01f8e757d6765cdc7a6c89f6c7c56af1e24-101x44.svg' },
        ]}
      />
      <DiagramBand title="Portable. Secured. Reliable." lead={txt(6, 'p')} cta={GET} visual="/assets/bands/hardware/v6-0.png" />
      <FaqBand
        title="FAQs"
        sub="Everything you need to know about Heidi Remote"
        buttons={[
          { t: 'Download Quickstart Guide', to: GUIDES, trailing: <Download size={22} strokeWidth={1.5} /> },
          { t: 'Download User Manual', to: GUIDES, trailing: <Download size={22} strokeWidth={1.5} /> },
        ]}
        items={(faqAnswers.hardware || []).filter((x) => x.a?.length)}
      />
      <PatternCta tone="sand" pattern={6} height={544} title={'Moves with you\n*through every session*'} buttons={[{ ...GET, tone: 'dark', trailing: <ArrowRight size={22} strokeWidth={1.5} /> }]} />
    </>
  )
}
