import { useEffect } from 'react'
import {
  CardTrio,
  ChipField,
  DemoVideo,
  DownloadSplit,
  FaqBand,
  ImageCta,
  PillHero,
  ShotPanel,
  TabsSplit,
  TwoToneQuote,
} from '../components/bands/index.jsx'
import bands from '../data/bands/dictate.json'
import extras from '../data/bands/dictate-extras.json'
import faqAnswers from '../data/faq-answers.json'

// /product/dictate — built band by band against
// https://www.heidihealth.com/en-gb/product/dictate.
const TRY = '#download-section'
const txt = (band, tag, n = 0) => bands[band].texts.filter((t) => t.tag === tag)[n]?.t
const dl = (band, label) => bands[band].links.find((l) => l.t === label)?.href

export default function DictatePage() {
  useEffect(() => {
    document.title = 'Heidi Dictate | Write 3x faster, anywhere you work'
  }, [])
  const cards = bands[6].texts.filter((t) => t.tag === 'h3' && t.fs === 32).map((h, i) => ({ title: h.t, body: txt(6, 'p', i) }))
  const chips = bands[3].texts.filter((t) => t.tag === 'span').map((t) => t.t)
  return (
    <>
      <PillHero
        pill="Dictate"
        title={'Write *3x faster*,\nanywhere you work'}
        lead="Hold one key and speak. Heidi writes finished clinical text in your record, inbox, or any form."
        cta={{ t: 'Try Dictate', to: TRY }}
        visual={{ src: '/assets/bands/dictate/v0-0.png', w: 1280, h: 440 }}
      />
      <ShotPanel src="/assets/bands/dictate/v1-0.png" w={1256} h={212} alt="Trusted by CHCP, modality, NHS trusts, onecare, Portman dentex, Sue Ryder and Swiss Medical Network" />
      <TabsSplit
        title={txt(2, 'h2')}
        headingSize={48}
        aspect="584 / 467"
        tabs={extras.tabs.map((t) => ({ title: t.label, body: t.body, img: t.img }))}
      />
      <ChipField title={txt(3, 'h2')} bg="/assets/bands/dictate/chips-bg.png" chips={chips} />
      <TwoToneQuote
        lead="“It saves so much time,"
        rest="and I'm already finding new places to use it. My EHR, to-do lists, emails, and messages.”"
        name="Dr Kenneth Liu"
        role="Periodontist"
      />
      <DemoVideo
        pill="Demo"
        title="Press, speak, done"
        cta={{ t: 'Try Dictate', to: TRY }}
        src="https://www.youtube.com/embed/KDnWyRegbQo?mute=1&playsinline=1&modestbranding=1&rel=0&cc_load_policy=1&cc_lang_pref=en&hl=en"
      />
      <CardTrio title={txt(6, 'h3')} cards={cards} />
      <div id="download-section" className="scroll-mt-24">
        <DownloadSplit
          title="Try Dictate for free on MacOS"
          primary={{ t: 'Apple Silicon', to: dl(7, 'Apple Silicon') }}
          secondary={{ t: 'Intel Chip', to: dl(7, 'Intel Chip') }}
          note="Also available on Windows"
          visual="/assets/bands/dictate/v7-0.png"
        />
      </div>
      <ImageCta bg="/assets/bands/dictate/cta-bg.png" title={txt(8, 'h2')} sub={txt(8, 'p')} cta={{ t: 'Try Dictate', to: TRY }} />
      <FaqBand
        title="Your questions answered"
        stacked
        wide
        items={(faqAnswers['product-dictate'] || []).filter((x) => x.a?.length)}
      />
    </>
  )
}
