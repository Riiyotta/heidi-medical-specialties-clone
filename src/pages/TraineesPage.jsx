import { useEffect } from 'react'
import {
  FaqBand,
  FeatureSplit,
  GreenBand,
  LogoMarquee,
  QuoteCarousel,
  Statement,
  ToolsPanel,
} from '../components/bands/index.jsx'
import data from '../data/bands/trainees-built.json'
import faqAnswers from '../data/faq-answers.json'
import { Media } from '../components/Skeleton.jsx'

// /solutions/medical-trainees — built band by band against
// https://www.heidihealth.com/en-gb/solutions/medical-trainees (its own
// layout, not the shared "For" one).
const CLAIM = { t: 'Claim your free Clinician Plan', to: 'https://www.heidihealth.com/trainee/sign-up' }

export default function TraineesPage() {
  useEffect(() => {
    document.title = 'Heidi for Medical Trainees | Free Clinician plan'
  }, [])
  return (
    <>
      <section className="px-global py-12 md:py-section-md">
        <div className="mx-auto flex max-w-[800px] flex-col items-center text-center">
          <h1 className="max-w-[650px] font-serif text-h1-mobile text-text-primary lg:text-h1-desktop">You are the future of care. Heidi is here to back you.</h1>
          <p className="mt-6 text-body tracking-[-0.48px] text-text-primary">
            <strong className="font-bold">Full access to the Heidi Clinician plan.</strong> Free for students and trainees in medicine, nursing and allied health.
          </p>
          <a href={CLAIM.to} className="mt-8 inline-flex items-center rounded-button bg-forest px-4 py-2.5 text-btn-outline font-medium tracking-[-0.48px] text-drawer-invert transition hover:bg-forest-700">
            {CLAIM.t}
          </a>
        </div>
      </section>
      <section className="py-12 md:px-12">
        <Media src="/assets/bands/trainees/v1-0.png" alt="Heidi templates for trainees: intern clinical notes, handover summaries, registrar admission, training logbooks and case reflection notes" className="w-full" style={{ aspectRatio: '1344 / 794' }} />
      </section>
      <LogoMarquee logos={data.logos} size={{ w: 187, h: 72 }} />
      <Statement
        title="You chose medicine, not admin"
        lead="That’s why we’re lightening the load. With Heidi, every note becomes more time with patients and every hour saved gives you space to study, rest, and grow."
      />
      <FeatureSplit
        title="Efficient documentation, better habits"
        body="Heidi captures your notes in real time so you can stay present with patients. Every chart you save now compounds into thousands over your career. More time for care, more time for you."
        visual="/assets/bands/trainees/v4-0.png"
        imageFirst
      />
      <FeatureSplit
        title="The same tool consultants trust, yours free"
        body="No “lite” version. No trainee discount. Just the same Pro support your consultants rely on, because you deserve to work and learn with the best."
        visual="/assets/bands/trainees/v5-0.png"
      />
      <FeatureSplit
        title="Make care sustainable"
        body="Healthcare only thrives if clinicians do. Heidi helps you reclaim evenings, protect your energy, and build a career that lasts."
        visual="/assets/bands/trainees/v6-0.png"
        imageFirst
      />
      <ToolsPanel
        title="Clinician tools, trainee-ready"
        lead="Learn faster. Think sharper. Grow with every patient."
        cards={[
          { title: 'Chart like a consultant', icon: 'notebook-pen', body: 'Master hands-free documentation across wards and clinics while others are still typing.' },
          { title: 'Turn every note into a lesson', icon: 'book-open-text', body: 'Trainee templates don’t just structure notes. They highlight what experienced clinicians look for, teaching as you work.' },
          { title: 'See the whole patient picture', icon: 'circle-user-round', body: 'Pull in labs, imaging, and notes into a single view. Learn to see the whole picture, not fragments.' },
        ]}
      />
      <QuoteCarousel title="Tomorrow’s leaders are already using Heidi" cta={{ t: 'Read case studies', to: '/en-gb/customers' }} items={data.quotes} />
      <FaqBand title="AI Scribe for Medical Trainees" items={(faqAnswers['solutions-medical-trainees'] || []).filter((x) => x.a?.length)} />
      <GreenBand inset title="We’re investing in you, so you can invest in your patients" sub="Reclaim your time. Protect your energy. Grow into the doctor you set out to be." cta={{ ...CLAIM }} />
    </>
  )
}
