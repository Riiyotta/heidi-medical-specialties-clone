import { useEffect } from 'react'
import {
  CaseStudies,
  DarkQuote,
  EdgeHero,
  FaqBand,
  GreenBand,
  ImageGrid,
  LogoMarquee,
  OrgCards,
  PanelTabs,
  StatsPanel,
  VideoSplit,
} from '../components/bands/index.jsx'
import bands from '../data/bands/enterprise.json'
import extras from '../data/bands/enterprise-extras.json'
import faqAnswers from '../data/faq-answers.json'
import logos from '../data/bands/enterprise-logos.json'

// /solutions/enterprise — built band by band against
// https://www.heidihealth.com/en-gb/solutions/enterprise. It does not follow
// the shared "For" layout, so it is built on its own.
const SALES = { t: 'Contact sales', to: '/en-gb/contact-sales' }
const T = (i, tag) => bands[i].texts.filter((t) => t.tag === tag).map((t) => t.t)

export default function EnterprisePage() {
  useEffect(() => {
    document.title = 'Heidi for Enterprise | AI Care Partner for health systems'
  }, [])
  const p2 = T(2, 'p')
  const p3 = T(3, 'p')
  const outcomes = T(3, 'em')
  const cards = [
    { title: 'Health systems', icon: 'heart-handshake' },
    { title: 'Hospitals', icon: 'hospital' },
    { title: 'Large group practices', icon: 'stethoscope' },
  ].map((c, i) => ({ ...c, body: p3[i + 1], outcome: outcomes[i] }))
  const caseHtml = bands[9].texts.filter((t) => t.tag === 'p').slice(1).map((t) => (t.html || t.t).replace(/\n/g, '<br>'))
  const caseLinks = bands[9].links.map((l) => l.href)
  const caseNames = bands[9].texts.filter((t) => t.tag === 'h3').map((t) => t.t)
  const grid = bands[8].texts.filter((t) => t.tag === 'h3' && t.fs === 32).map((t, i) => ({ title: t.t, img: logos.grid[i]?.src, alt: logos.grid[i]?.alt }))
  return (
    <>
      <EdgeHero eyebrow="Enterprise" title="Adapts to every provider, *adopted by every department*" lead={T(0, 'p')[0]} cta={SALES} />
      <LogoMarquee label="Chosen by hospitals and healthcare systems for their clinical workforce." logos={logos.clients} size={{ w: 128, h: 96 }} duration={35} />
      <StatsPanel
        title="Real impact, at enterprise scale"
        lead={p2[0]}
        cta={SALES}
        stats={[
          { value: '62.9M', label: p2[1], note: p2[2], icon: '/assets/bands/enterprise/stat-0.svg' },
          { value: '61.7%', label: p2[3], note: p2[4], icon: '/assets/bands/enterprise/stat-1.svg' },
          { value: '200+', label: p2[5], note: p2[6], icon: '/assets/bands/enterprise/stat-2.svg' },
        ]}
      />
      <OrgCards title="Built for organizations like yours" lead={p3[0]} cta={SALES} cards={cards} />
      <LogoMarquee label="A platform built on trust." logos={logos.badges} size={{ w: 165, h: 72 }} duration={45} />
      <DarkQuote quote={bands[5].texts.find((t) => t.tag === 'em').t} />
      <VideoSplit
        title="Health System Buyers Guide with Dr. Thomas Kelly"
        body={T(6, 'p')[0]}
        cta={SALES}
        src="https://www.youtube.com/embed/bBa6EFtf5OQ?mute=1&playsinline=1&modestbranding=1&rel=0&cc_load_policy=1&cc_lang_pref=en&hl=en"
      />
      <PanelTabs
        title="Built for *your whole team*"
        lead={T(7, 'p')[0]}
        tabs={extras.tabs.map((t) => ({ title: t.label, body: t.body, img: t.img }))}
      />
      <ImageGrid
        title="Built for the reality of complex care"
        lead="Designed for healthcare environments. Background noise, mobile setups, specialty terms, and fast-moving care."
        items={grid} cta={{ t: 'Visit Trust Centre', to: 'https://trust.heidihealth.com/' }} />
      <CaseStudies
        title="Real teams, real results with Heidi"
        lead={T(9, 'p')[0]}
        cases={caseNames.map((n, i) => ({ title: n, html: caseHtml[i], to: caseLinks[i], img: `/assets/bands/enterprise/v9-${i}.png` }))}
      />
      <FaqBand title="FAQs about Heidi for Enterprise" stacked wide items={(faqAnswers['solutions-enterprise'] || []).filter((x) => x.a?.length)} />
      <GreenBand title="Real adoption drives real transformation" sub="Join thousands of teams worldwide who've made Heidi part of their daily practice" cta={SALES} />
    </>
  )
}
