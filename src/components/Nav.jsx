import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Activity,
  Blocks,
  BookOpen,
  Brain,
  Building2,
  ChevronDown,
  ChevronRight,
  CirclePlus,
  DownloadCloud,
  GraduationCap,
  HeartHandshake,
  Hospital,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  Award,
  Menu,
  Mic,
  Newspaper,
  Radio,
  MessageSquareQuote,
  PawPrint,
  PersonStanding,
  Pill,
  Search,
  ShieldCheck,
  Smile,
  Stethoscope,
  User,
  Users,
  X,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo.jsx'
import { resolveHref } from '../lib/links.js'

// Header menus, modelled on the live site's two-pane flyout: a left rail of
// parent entries (some open a submenu, some are plain links, split into groups
// by a hairline divider) and a right pane showing the hovered parent's
// children. Hovering a parent swaps the right pane; the card itself never
// resizes mid-hover because its height is driven by the tallest pane.
const menus = [
  {
    id: 'product',
    label: 'Product',
    groups: [
      [
        {
          id: 'platform',
          label: 'Platform',
          icon: LayoutGrid,
          items: [
            { label: 'Scribe', icon: Activity, href: '/en-gb/scribe' },
            { label: 'Evidence', icon: Brain, href: '/en-gb/evidence' },
            { label: 'Remote', icon: Radio, href: '/en-gb/hardware' },
            { label: 'Dictate', icon: Mic, href: '/en-gb/product/dictate' },
            { label: 'Coding', icon: ListChecks, href: '/en-gb/product/coding' },
          ],
        },
        {
          id: 'for',
          label: 'For',
          icon: Stethoscope,
          items: [
            { label: 'Enterprise', icon: Building2, href: '/en-gb/solutions/enterprise' },
            { label: 'Primary Care', icon: User, href: '/en-gb/solutions/primary-care' },
            { label: 'Specialists', icon: CirclePlus, href: '/en-gb/solutions/medical-specialties' },
            { label: 'Nursing', icon: Pill, href: '/en-gb/solutions/nurses' },
            { label: 'Mental Health', icon: Brain, href: '/en-gb/solutions/mental-health' },
            { label: 'Allied Health', icon: PersonStanding, href: '/en-gb/solutions/allied-health' },
            { label: 'Dentists', icon: Smile, href: '/en-gb/solutions/dentists' },
            { label: 'Aged Care', icon: HeartHandshake, href: '/en-gb/solutions/aged-care' },
            { label: 'Veterinarians', icon: PawPrint, href: '/en-gb/solutions/veterinarians' },
            { label: 'Trainees', icon: GraduationCap, href: '/en-gb/solutions/medical-trainees' },
            { label: 'Surgeons', icon: Activity, href: '/en-gb/solutions/surgeons' },
            { label: 'Emergency Medicine', icon: Hospital, href: '/en-gb/solutions/emergency-medicine' },
          ],
        },
      ],
      [
        {
          id: 'integrations',
          label: 'Integrations',
          icon: Blocks,
          items: [
            { label: 'Explore Integrations', icon: Blocks, href: '/en-gb/integrations' },
            { label: 'Cerner', icon: Building2, href: '/en-gb/oracle-cerner-integration' },
            { label: 'Epic', icon: Building2, href: '/en-gb/epic-integration' },
            { label: 'Partners', icon: Users, href: '/en-gb/partners' },
            { label: 'APIs', icon: Activity, href: 'https://www.heidihealth.com/developers' },
          ],
        },
        {
          id: 'download',
          label: 'Download Heidi',
          icon: DownloadCloud,
          href: '/en-gb/download',
        },
        { id: 'progress', label: 'Progress notes', icon: ListChecks, href: '/en-gb/progress-notes' },
        { id: 'status', label: 'System Status', icon: Activity, href: 'https://status.heidihealth.com' },
      ],
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    groups: [
      [
        {
          id: 'data-security',
          label: 'Data & Security',
          icon: ShieldCheck,
          items: [
            { label: 'Safety & Compliance', icon: ShieldCheck, href: '/en-gb/safety' },
            { label: 'Trust Centre', icon: ShieldCheck, href: 'https://trust.heidihealth.com/' },
            { label: 'FAQs', icon: LifeBuoy, href: '/en-gb/resources/frequently-ask-questions' },
            { label: 'Patient Experience', icon: HeartHandshake, href: '/en-gb/resources/patients' },
            { label: 'Evaluating Heidi', icon: ListChecks, href: '/en-gb/resources/evaluation-framework' },
          ],
        },
        {
          id: 'about-us',
          label: 'About Us',
          icon: Users,
          items: [
            { label: 'Careers', icon: Users, href: '/en-gb/careers' },
            { label: 'Media', icon: Newspaper, href: '/en-gb/about-us/media' },
            { label: 'Awards and Recognition', icon: Award, href: '/en-gb/about-us/awards' },
          ],
        },
        { id: 'impact', label: 'Impact', icon: HeartHandshake, href: '/en-gb/impact' },
        { id: 'help', label: 'Help Centre', icon: LifeBuoy, href: 'https://support.heidihealth.com' },
        {
          id: 'guides',
          label: 'Guides',
          icon: BookOpen,
          href: 'https://support.heidihealth.com/en/collections/19474362-heidi-guides',
        },
      ],
      [
        { id: 'blog', label: 'Blog', icon: BookOpen, href: '/en-gb/blog' },
        { id: 'tools', label: 'AI Tools', icon: Blocks, href: '/en-gb/tools' },
        { id: 'customers', label: 'Customer Stories', icon: MessageSquareQuote, href: '/en-gb/customers' },
        { id: 'templates', label: 'Template Community', icon: ListChecks, href: '/en-gb/templates' },
        { id: 'explainers', label: 'Explainers', icon: BookOpen, href: '/en-gb/resource-centre' },
        { id: 'podcast', label: 'Podcast', icon: Mic, href: '/en-gb/podcast' },
      ],
    ],
  },
]

const plainLinks = [
  { label: 'Pricing', href: '/en-gb/pricing' },
  { label: 'Contact us', href: '/en-gb/contact' },
]

// The nav carries the live site's own hrefs; anything we have a local route
// for becomes a client-side <Link>, everything else stays an outbound anchor.
function SmartLink({ href, className, onClick, children }) {
  const r = resolveHref(href)
  if (r?.to)
    return (
      <Link to={r.to} className={className} onClick={onClick}>
        {children}
      </Link>
    )
  return (
    <a
      href={r?.href || href || '#'}
      {...(r?.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={className}
      onClick={onClick}
    >
      {children}
    </a>
  )
}

const firstPaneId = (menu) => menu.groups.flat().find((e) => e.items)?.id

function PaneRow({ entry, active, onActivate }) {
  const Icon = entry.icon
  const classes =
    'flex w-full items-center gap-2 rounded-button p-1.5 pl-2 text-left text-nav-link text-text-primary transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none'
  const body = (
    <>
      <Icon
        size={20}
        strokeWidth={2}
        className={`shrink-0 ${active ? 'text-text-primary' : 'text-sage'}`}
      />
      <span className="flex-1 truncate">{entry.label}</span>
      {entry.items && (
        <ChevronRight
          size={16}
          className={`shrink-0 ${active ? 'text-text-primary' : 'text-text-secondary'}`}
        />
      )}
    </>
  )

  if (entry.items) {
    return (
      <button
        type="button"
        aria-expanded={active}
        onClick={onActivate}
        className={`${classes} ${active ? 'bg-accent' : ''}`}
      >
        {body}
      </button>
    )
  }
  return (
    <SmartLink href={entry.href} className={classes}>
      {body}
    </SmartLink>
  )
}

function MenuCard({ menu, id, pane, setPane }) {
  const active = menu.groups.flat().find((e) => e.id === pane)
  return (
    <div
      id={id}
      className="w-[672px] overflow-hidden rounded-card bg-card-white p-6 pb-9 shadow-testimonial-md"
    >
      <div className="grid grid-cols-[240px_1fr] gap-6">
        {/* Left rail — parent entries, grouped with a hairline divider */}
        <div className="flex flex-col gap-2">
          {menu.groups.map((group, i) => (
            <div key={i} className={i > 0 ? 'border-t border-border-base pt-2' : ''}>
              {group.map((entry) => (
                <PaneRow
                  key={entry.id}
                  entry={entry}
                  active={entry.items ? pane === entry.id : false}
                  onActivate={() => setPane(entry.id)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Right pane — children of whichever parent is hovered */}
        <ul className="flex flex-col">
          {active?.items.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.label}>
                <SmartLink
                  href={item.href}
                  className="flex items-center gap-2 rounded-button p-1.5 pl-2 text-nav-link text-text-primary transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                >
                  <Icon size={20} className="shrink-0 text-sage" strokeWidth={2} />
                  <span className="truncate">{item.label}</span>
                </SmartLink>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default function Nav() {
  const [openMenu, setOpenMenu] = useState(null)
  const [pane, setPane] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState(null)
  const navRef = useRef(null)
  const closeTimer = useRef(null)
  // Both the scrim and the mobile sheet start at the header's real bottom edge,
  // which moves depending on whether the announcement bar is still in view.
  const [overlayTop, setOverlayTop] = useState(72)

  const isOverlayOpen = openMenu !== null || mobileOpen

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  // Live behaviour (measured): menus open on CLICK only — hover never opens
  // one, and hovering a sibling while one is open does not switch it. The first
  // open is a hard cut; switching between menus plays a 300ms direction-aware
  // slide (Radix NavigationMenu's data-motion from-start / from-end).
  const [motion, setMotion] = useState(null)
  const toggleMenu = useCallback(
    (menu) => {
      cancelClose()
      setOpenMenu((current) => {
        if (current === menu.id) return null
        if (current) {
          const from = menus.findIndex((m) => m.id === current)
          const to = menus.findIndex((m) => m.id === menu.id)
          setMotion(to > from ? 'from-end' : 'from-start')
        } else {
          setMotion(null)
        }
        return menu.id
      })
      setPane((p) => (menu.groups.flat().some((e) => e.id === p) ? p : firstPaneId(menu)))
    },
    [cancelClose],
  )

  // Navigating (from a menu link or anywhere else) always closes the menus.
  // Keyed on location.key, not pathname, so re-clicking the current page's
  // own link (Scribe while on /scribe) still closes the menu.
  const location = useLocation()
  useEffect(() => {
    setOpenMenu(null)
    setMobileOpen(false)
  }, [location.key])

  useEffect(() => cancelClose, [cancelClose])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return
      setOpenMenu(null)
      setMobileOpen(false)
    }
    const onPointerDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])

  // Keep the overlays pinned to the header while either is open.
  useEffect(() => {
    if (!isOverlayOpen) return
    const place = () => {
      if (navRef.current) setOverlayTop(navRef.current.getBoundingClientRect().bottom)
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, { passive: true })
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place)
    }
  }, [isOverlayOpen])

  // Lock page scroll while the mobile sheet is up.
  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  return (
    <>
      <header
        ref={navRef}
        className="sticky top-0 z-40 flex h-[72px] w-full items-center justify-center bg-white/80 px-global backdrop-blur-[8px]"
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <div className="mx-auto flex h-full w-full max-w-container-lg items-center justify-between">
          <Link
            to="/"
            aria-label="Heidi Home"
            className="flex shrink-0 items-center text-text-primary"
          >
            <Logo size="sm" />
          </Link>

          {/* Center nav — lg and up. Full-height items so the active tab's
              stroke can sit flush on the header's bottom edge. */}
          <nav aria-label="Main" className="relative hidden h-full lg:block">
            <ul className="flex h-full items-stretch">
              {menus.map((menu) => {
                const isOpen = openMenu === menu.id
                return (
                  <li key={menu.id} className="flex">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`nav-menu-${menu.id}`}
                      onClick={() => toggleMenu(menu)}
                      className={`relative flex items-center gap-1 px-3 text-nav-link transition-colors ${
                        isOpen ? 'text-sage' : 'text-text-primary'
                      }`}
                    >
                      {menu.label}
                      {/* Live chevron does not rotate on open. */}
                      <ChevronDown size={16} />
                      {/* Active-tab stroke */}
                      <span
                        aria-hidden
                        className={`absolute -inset-x-2 bottom-0 h-[4px] rounded-t-sm bg-sage-stroke ${
                          isOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </button>

                    {/* Pop-up card. No transition on first open (live is a hard
                        cut); data-motion drives the 300ms slide when switching
                        from one open menu to another. */}
                    <div
                      data-motion={isOpen && motion ? motion : undefined}
                      className={`nav-menu-card absolute left-0 top-full z-50 pt-[9px] ${
                        isOpen ? '' : 'pointer-events-none invisible opacity-0'
                      }`}
                    >
                      <MenuCard
                        menu={menu}
                        id={`nav-menu-${menu.id}`}
                        pane={pane}
                        setPane={setPane}
                      />
                    </div>
                  </li>
                )
              })}

              {plainLinks.map((link) => (
                <li key={link.label} className="flex">
                  <SmartLink
                    href={link.href}
                    className="flex items-center px-3 text-nav-link text-text-primary"
                  >
                    {link.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Open search"
              className="flex items-center justify-center rounded-lg p-2 text-text-secondary lg:hidden"
            >
              <Search size={20} />
            </button>
            <button
              type="button"
              className="hidden items-center gap-2 rounded-full bg-page px-2 py-1 text-nav-small text-text-secondary lg:flex"
            >
              <Search size={16} />
              <span>&#8984;K</span>
            </button>
            <a
              href="https://scribe.heidihealth.com/"
              className="hidden text-btn-pill font-medium text-text-primary lg:inline-block"
            >
              Log in
            </a>
            <a
              href="https://scribe.heidihealth.com/onboarding"
              className="hidden rounded-button bg-accent-yellow px-4 py-2.5 text-btn-pill font-medium text-text-primary lg:inline-block"
            >
              Get Heidi free
            </a>

            <button
              type="button"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex items-center justify-center rounded-lg p-1 text-text-primary lg:hidden"
            >
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      {/* Dim + blur scrim over the page while a menu is open. Deliberately a
          sibling of <header>: the header's backdrop-blur makes it a containing
          block for fixed descendants, which would trap this inside the bar. */}
      <div
        aria-hidden
        onClick={() => setOpenMenu(null)}
        style={{ top: overlayTop }}
        className={`fixed inset-x-0 bottom-0 z-30 bg-black/50 backdrop-blur-[8px] transition-opacity duration-200 ease-out ${
          openMenu ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Mobile sheet — sibling of <header> for the same reason */}
      <div
        id="mobile-menu"
        style={{ top: overlayTop }}
        className={`fixed inset-x-0 bottom-0 z-30 overflow-y-auto bg-page px-global pb-28 pt-6 transition duration-200 ease-out lg:hidden ${
          mobileOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        <ul className="flex flex-col gap-1">
          {menus.map((menu) => {
            const isOpen = mobileSection === menu.id
            return (
              <li key={menu.id} className="border-b border-border-base">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setMobileSection(isOpen ? null : menu.id)}
                  className="flex w-full items-center justify-between py-4 text-nav-link text-text-primary"
                >
                  {menu.label}
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="min-h-0">
                    <div className="flex flex-col gap-4 pb-4">
                      {menu.groups.flat().map((entry) => {
                        const Icon = entry.icon
                        if (!entry.items) {
                          return (
                            <SmartLink
                              key={entry.id}
                              href={entry.href}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 text-nav-link text-text-primary"
                            >
                              <Icon size={20} className="text-sage" strokeWidth={2} />
                              {entry.label}
                            </SmartLink>
                          )
                        }
                        return (
                          <div key={entry.id}>
                            <p className="mb-2 flex items-center gap-2 text-nav-small font-medium text-text-secondary">
                              <Icon size={18} className="text-sage" strokeWidth={2} />
                              {entry.label}
                            </p>
                            <ul className="flex flex-col">
                              {entry.items.map((item) => {
                                const ItemIcon = item.icon
                                return (
                                  <li key={item.label}>
                                    <SmartLink
                                      href={item.href}
                                      onClick={() => setMobileOpen(false)}
                                      className="flex items-center gap-3 py-2 text-nav-link text-text-primary"
                                    >
                                      <ItemIcon
                                        size={18}
                                        className="text-sage"
                                        strokeWidth={2}
                                      />
                                      {item.label}
                                    </SmartLink>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}

          {plainLinks.map((link) => (
            <li key={link.label} className="border-b border-border-base">
              <SmartLink
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-4 text-nav-link text-text-primary"
              >
                {link.label}
              </SmartLink>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-3">
          <a
            href="https://scribe.heidihealth.com/onboarding"
            className="rounded-button bg-accent-yellow px-4 py-3 text-center text-btn-pill font-medium text-text-primary"
          >
            Get Heidi free
          </a>
          <a
            href="https://scribe.heidihealth.com/"
            className="rounded-button border border-border-base px-4 py-3 text-center text-btn-pill font-medium text-text-primary"
          >
            Log in
          </a>
        </div>
      </div>
    </>
  )
}
