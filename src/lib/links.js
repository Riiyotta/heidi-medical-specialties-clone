import { urlToPath } from '../data/routes.js'

// The recon data carries the live site's own hrefs. Anything we have a local
// route for becomes an in-app link; everything else (status page, support,
// the scribe app, /developers) stays an outbound link.
export function resolveHref(href) {
  if (!href) return null
  if (href.startsWith('#')) return { to: null, href, external: false }

  let path = href
  if (/^https?:/i.test(href)) {
    try {
      const u = new URL(href)
      if (!/(^|\.)heidihealth\.com$/i.test(u.hostname)) return { to: null, href, external: true }
      path = u.pathname
    } catch {
      return { to: null, href, external: true }
    }
  }

  const local = urlToPath[path.replace(/\/$/, '')] || urlToPath[path]
  if (local) return { to: local, href: local, external: false }

  // A heidihealth.com page we did not clone — send it to the live site rather
  // than a dead in-app route.
  return { to: null, href: 'https://www.heidihealth.com' + path, external: true }
}
