import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// Verified against live site (data-testid="download-drawer-tab" /
// "download-drawer-panel-*"): a bottom-fixed capsule tab reading "Download
// Heidi" with a star icon; clicking slides a full-width panel up containing
// a heading, subcopy, and two CTAs — "Download for macOS" (solid forest) and
// "Download for Windows" (ghost/outline) — linking to the CrabNebula CDN
// installers.
//
// Motion measured on the live site (2026-09-22): the panel
// (`.download-drawer-shell`) transitions its `translate` over 400ms using
// cubic-bezier(0.5, 0, 0.5, 1) — a symmetric ease-in-out, noticeably
// steeper/snappier through the middle than Tailwind's default
// cubic-bezier(0.4,0,0.2,1). A separate desktop-only (`hidden lg:block`)
// fixed backdrop fades with it (see BACKDROP_TRANSITION).
const PANEL_TRANSITION = 'transform 400ms cubic-bezier(0.5, 0, 0.5, 1)'
// Re-measured: the backdrop fades in lockstep with the panel (400ms,
// cubic-bezier(0.5,0,0.5,1)) at 40% of the primary ink, not 200ms / 50% black.
const BACKDROP_TRANSITION = 'opacity 400ms cubic-bezier(0.5, 0, 0.5, 1)'

// The closed offset used to be a hard-coded 56px, which left ~16px of panel
// below the tab's dark baseline strip — the strip floated above the viewport
// edge instead of sitting flush on it. Measuring the tab row instead keeps the
// baseline pinned to the bottom edge at any font size or breakpoint.
export default function DownloadDrawer() {
  const [open, setOpen] = useState(false)
  const tabRowRef = useRef(null)
  const [peek, setPeek] = useState(46)

  useLayoutEffect(() => {
    const measure = () => {
      if (tabRowRef.current) setPeek(tabRowRef.current.getBoundingClientRect().height)
    }
    measure()
    window.addEventListener('resize', measure)
    // Re-measure once webfonts land, since the tab is sized by its label.
    if (document.fonts?.ready) document.fonts.ready.then(measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Let anything on the page (e.g. the nav's "Download Heidi" entry) open it.
  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener('heidi:open-download-drawer', onOpen)
    return () => window.removeEventListener('heidi:open-download-drawer', onOpen)
  }, [])

  // Escape closes the expanded panel.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <aside id="download" className="fixed inset-x-0 bottom-0 z-[51]">
      {/* Desktop-only dimming backdrop behind the open panel */}
      <div
        className="fixed inset-0 z-40 hidden bg-text-primary/40 lg:block"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: BACKDROP_TRANSITION,
        }}
        aria-hidden
        onClick={() => setOpen(false)}
      />
      <div
        className="download-drawer-shell relative z-50 w-full overflow-hidden"
        style={{
          transform: open ? 'translateY(0)' : `translateY(calc(100% - ${peek}px))`,
          transition: PANEL_TRANSITION,
        }}
      >
        <div ref={tabRowRef} className="relative flex justify-center">
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-dark-fill" aria-hidden />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="relative z-10 flex items-center gap-2 rounded-t-drawer-tab bg-dark-fill px-6 py-2.5 text-btn-pill font-semibold text-drawer-invert"
          >
            <span className="download-drawer-pulse relative flex h-[22px] w-[22px] items-center justify-center">
              {/* Live site paints this star accent-yellow, not the tab's text colour. */}
              <svg
                viewBox="0 0 22 22"
                className="relative z-10 h-[22px] w-[22px] text-accent-yellow"
                fill="currentColor"
                aria-hidden
                focusable="false"
              >
                <path d="M0.25 10.2661H6.28951C8.34771 10.2661 10.0161 8.59771 10.0161 6.53951V0.5H11.4839V6.53951C11.4839 8.59771 13.1523 10.2661 15.2105 10.2661H21.25V11.7339H15.2105C13.1523 11.7339 11.4839 13.4023 11.4839 15.4605V21.5H10.0161V15.4605C10.0161 13.4023 8.34771 11.7339 6.28951 11.7339H0.25V10.2661Z" />
              </svg>
            </span>
            Download Heidi
          </button>
        </div>

        <div
          className="w-full bg-page px-global py-12 text-center shadow-xl"
          // Hidden outright when closed (as on live), after the 400ms slide, so
          // it can never show below the tab — e.g. when a mobile URL bar
          // collapses and the viewport grows.
          style={{ visibility: open ? 'visible' : 'hidden', transition: open ? 'none' : 'visibility 0s 400ms' }}
          aria-hidden={!open}
          {...(!open ? { inert: '' } : {})}
        >
          <h2 className="mx-auto mb-4 max-w-lg font-serif text-h3-desktop text-text-primary">
            Heidi Desktop goes where the browser can&rsquo;t.
          </h2>
          <p className="mx-auto mb-4 max-w-lg text-body text-text-primary">
            Dictate anywhere on your screen, capture telehealth audio straight
            from the call, and skip the second login.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://cdn.crabnebula.app/download/heidi-scribe/scribe/latest/platform/dmg-aarch64"
              className="rounded-button bg-forest px-4 py-2.5 text-btn-outline font-medium text-drawer-invert transition-colors hover:bg-forest-700"
            >
              Download for macOS
            </a>
            <a
              href="https://cdn.crabnebula.app/download/heidi-scribe/scribe/latest/platform/nsis-x86_64"
              className="rounded-button bg-transparent px-4 py-2.5 text-btn-outline font-medium text-text-primary transition-colors hover:bg-accent"
            >
              Download for Windows
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
