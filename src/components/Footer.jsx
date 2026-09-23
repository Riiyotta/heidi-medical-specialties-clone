import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import { resolveHref } from '../lib/links.js'

// Footer columns and hrefs taken verbatim from the live site's footer.
const columns = [
  {
    label: 'Specialties',
    links: [
      { label: "Family Medicine", href: '/en-gb/solutions/primary-care' },
      { label: "Specialists", href: '/en-gb/solutions/medical-specialties' },
      { label: "Nurses", href: '/en-gb/solutions/nurses' },
      { label: "Mental Health", href: '/en-gb/solutions/mental-health' },
      { label: "Allied Health", href: '/en-gb/solutions/allied-health' },
      { label: "Dentists", href: '/en-gb/solutions/dentists' },
      { label: "Veterinarians", href: '/en-gb/solutions/veterinarians' },
      { label: "Trainees", href: '/en-gb/solutions/medical-trainees' },
    ],
  },
  {
    label: 'Compliance',
    links: [
      { label: "Safety", href: '/en-gb/safety' },
      { label: "Trust Center", href: 'https://trust.heidihealth.com/' },
      { label: "AU/NZ", href: '/en-gb/compliance/app' },
      { label: "Canada", href: '/en-gb/compliance/canada' },
      { label: "UK", href: '/en-gb/compliance/uk' },
      { label: "GDPR", href: '/en-gb/compliance/gdpr' },
      { label: "HIPAA", href: '/en-gb/compliance/hipaa' },
    ],
  },
  {
    label: 'Product',
    links: [
      { label: "Pricing", href: '/en-gb/pricing' },
      { label: "Changelog", href: '/en-gb/progress-notes' },
      { label: "Downloads", href: '/en-gb/download' },
      { label: "Heidi Guides", href: 'https://support.heidihealth.com/en/collections/19474362-heidi-guides' },
      { label: "Help Centre", href: 'https://support.heidihealth.com' },
      { label: "System Status", href: 'https://status.heidihealth.com/' },
      { label: "System Requirements", href: '/en-gb/system-requirements' },
    ],
  },
  {
    label: 'About Us',
    links: [
      { label: "Contact Us", href: '/en-gb/contact' },
      { label: "Company", href: '/en-gb/about-us/awards' },
      { label: "Customer Stories", href: '/en-gb/customers' },
      { label: "Media", href: '/en-gb/about-us/media' },
      { label: "Open Roles", href: '/en-gb/careers', badge: '10+' },
      { label: "People", href: '/en-gb/about-us/people' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { label: "Blog", href: '/en-gb/blog' },
      { label: "ROI Calculator", href: '/en-gb/resources/roi' },
      { label: "Resource Centre", href: '/en-gb/resource-centre' },
      { label: "Template Community", href: '/en-gb/templates' },
      { label: "FAQs", href: '/en-gb/resources/frequently-ask-questions' },
    ],
  },
  {
    label: 'Legal',
    links: [
      { label: "Privacy Policy", href: '/en-gb/legal/privacy-policy' },
      { label: "Terms of Service", href: '/en-gb/legal/heidi-scribe-terms-of-use' },
      { label: "Usage Policy", href: '/en-gb/legal/scribe-usage-policy' },
      { label: "UKGDPR Policy", href: '/en-gb/legal/ukgdpr-compliance-policy' },
      { label: "Accessibility", href: '/en-gb/legal/accessibility-statement' },
      { label: "Website Legal Information", href: '/en-gb/legal/website-legal-information' },
      { label: "Modern Slavery Statement (UK)", href: '/en-gb/legal/modern-slavery-statement' },
    ],
  },
]

const socials = [
  { name: 'Facebook', icon: '/assets/icons/social-facebook.svg', href: 'https://www.facebook.com/tryheidi' },
  { name: 'Instagram', icon: '/assets/icons/social-instagram.svg', href: 'https://www.instagram.com/tryheidi/' },
  { name: 'LinkedIn', icon: '/assets/icons/social-linkedin.svg', href: 'https://www.linkedin.com/company/heidihealth' },
  { name: 'X', icon: '/assets/icons/social-x.svg', href: 'https://twitter.com/tryheidi' },
  { name: 'YouTube', icon: '/assets/icons/social-youtube.svg', href: 'https://www.youtube.com/channel/UC8il6_apE8OfdRdGXQCmiIA' },
]

function FooterLink({ link }) {
  const r = resolveHref(link.href)
  const cls = 'inline-flex items-center gap-2 text-sm text-text-primary hover:underline lg:text-body'
  const body = (
    <>
      {link.label}
      {link.badge && (
        <span className="rounded-full bg-accent-yellow px-2 py-0.5 text-caption font-semibold text-text-primary">
          {link.badge}
        </span>
      )}
    </>
  )
  return r?.to ? (
    <Link to={r.to} className={cls}>
      {body}
    </Link>
  ) : (
    <a href={r?.href || '#'} {...(r?.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={cls}>
      {body}
    </a>
  )
}

// Measured on live (1440px): a full-width #F9F4F1 panel with rounded top
// corners. Left column 233px — language switcher, 28px socials 12px apart,
// 198×60 logo, tagline and cookie link (14px). Link columns sit on a 4-up grid
// (262px pitch from x=377), wrapping Resources and Legal to a second row;
// headings inter 18/25.2 semibold, links 16px primary, 12px apart.
export default function Footer() {
  return (
    <footer className="rounded-t-[48px] bg-accent">
      <div className="mx-auto flex max-w-container-lg flex-col-reverse gap-16 px-global pb-16 pt-16 lg:flex-row lg:pb-24 lg:pt-24">
        <div className="flex shrink-0 flex-col items-start gap-8 lg:w-[233px]">
          <button type="button" className="-ml-2 flex items-center gap-2 rounded-2xl px-2 py-1 text-body text-text-primary hover:bg-border-base/50">
            <img src="/assets/icons/flags/country-united-kingdom.svg" alt="" className="h-[14px] w-5" />
            English
            <ChevronDown size={20} />
          </button>
          <div className="flex items-center gap-3">
            {socials.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} className="text-text-primary">
                <img src={s.icon} alt="" aria-hidden className="h-7 w-7" />
              </a>
            ))}
          </div>
          <Link to="/" aria-label="Heidi home" className="text-text-primary">
            <Logo size="xl" />
          </Link>
          <div className="flex flex-col gap-3 text-sm text-text-primary">
            <p>Heidi. By your side.</p>
            <p>&copy; {new Date().getFullYear()} Heidi. All rights reserved.</p>
            <a href="#" className="hover:underline">
              Cookie preferences
            </a>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-16 lg:gap-y-12">
          {columns.map((col) => (
            <div key={col.label}>
              <p className="mb-3 text-base font-semibold text-text-primary lg:mb-4 lg:text-lg">{col.label}</p>
              <ul className="flex flex-col gap-2 lg:gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
