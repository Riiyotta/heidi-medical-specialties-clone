// Brand logo drawn in code (inline SVG mark + real-text wordmark) instead of
// the <img src="/assets/icons/heidi-logo.svg"> reference the page used before.
// The saved asset is a truncated/partial file, and an <img> can't inherit
// `color`, so the mark could never be recoloured for the dark footer. Drawing
// it inline fixes both: it renders from `currentColor` and scales crisply.
//
// The mark is the Heidi quatrefoil: a rounded-square silhouette holding four
// leaves that meet at the centre, drawn as one leaf repeated at 90deg.
export function LogoMark({ className = 'h-8 w-8' }) {
  return (
    <svg
      viewBox="0 0 38 38"
      role="img"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Rounded-square silhouette */}
      <rect x="1.9" y="1.9" width="34.2" height="34.2" rx="11.5" />
      {/* Quatrefoil knot: one leaf, repeated at 90deg about the centre */}
      {[0, 90, 180, 270].map((deg) => (
        <path
          key={deg}
          transform={`rotate(${deg} 19 19)`}
          d="M19 19C12.4 19 7.9 14.5 7.9 7.9 14.5 7.9 19 12.4 19 19Z"
        />
      ))}
    </svg>
  )
}

// `size` controls the mark height; the wordmark tracks it so the lockup stays
// proportional at every placement (header 32px, footer 48px).
const sizes = {
  sm: { mark: 'h-8 w-8', word: 'text-[26px] leading-none', gap: 'gap-2' },
  lg: { mark: 'h-12 w-12', word: 'text-[38px] leading-none', gap: 'gap-3' },
  // Footer lockup on live: 198×60.
  xl: { mark: 'h-[60px] w-[60px]', word: 'text-[58px] leading-none', gap: 'gap-3' },
}

export default function Logo({ size = 'sm', className = '', withWordmark = true }) {
  const s = sizes[size] ?? sizes.sm
  return (
    <span className={`inline-flex items-center ${s.gap} text-current ${className}`}>
      <LogoMark className={s.mark} />
      {withWordmark && (
        <span className={`font-serif tracking-[-0.03em] ${s.word}`}>Heidi</span>
      )}
    </span>
  )
}
