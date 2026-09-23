import { ArrowRight } from 'lucide-react'

// Verified against live site: the whole banner is a single clickable <a>
// (no separate "Learn more" link, no dismiss/X button), bg-sunlight
// (#FBF582), text-primary (#28030F), px-10 py-3, text-xs (12px), with a
// trailing arrow-right icon.
export default function AnnouncementBar() {
  return (
    <a
      href="https://www.heidihealth.com/en-gb/blog/nhs-launches-largest-ever-ai-scribe-procurement"
      className="flex min-h-[44px] w-full items-center justify-center gap-2 bg-accent-yellow px-10 py-3 text-text-primary"
    >
      <p className="text-center text-caption">
        <strong>Heidi powers the largest AI scribe procurement in NHS history.</strong>{' '}
        70,000 Clinicians. 15 NHS Trusts. 1,200+ GP Practices. Learn more.
      </p>
      <ArrowRight size={16} strokeWidth={1.5} className="shrink-0" />
    </a>
  )
}
