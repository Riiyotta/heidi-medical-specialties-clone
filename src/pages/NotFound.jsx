import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-container-lg flex-col items-center px-global py-section-md text-center">
      <p className="mb-4 text-body font-semibold text-text-secondary">404</p>
      <h1 className="mb-6 font-serif text-h1-mobile text-text-primary lg:text-h1-desktop">
        We couldn&rsquo;t find that page
      </h1>
      <p className="mb-8 max-w-md text-body text-text-primary">
        The link may be out of date, or the page may live on the live Heidi site rather than in
        this clone.
      </p>
      <Link
        to="/"
        className="inline-flex items-center rounded-button bg-forest px-4 py-2.5 text-btn-outline font-medium text-drawer-invert transition-colors hover:bg-forest-700"
      >
        Back to home
      </Link>
    </section>
  )
}
