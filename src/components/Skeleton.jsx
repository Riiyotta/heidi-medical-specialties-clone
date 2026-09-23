import { useState } from 'react'

// Loading states, measured on the live site under a throttled connection
// (tools/recon-loading*.mjs). Live has two kinds:
//
//  1. A media frame — every image, video and embed sits in a positioned box
//     with a pulsing layer painted over it until the file arrives:
//       <div class="pointer-events-none absolute inset-0 z-1 overflow-hidden rounded-xl">
//         <div class="animate-pulse bg-sand-150 size-full rounded-xl" />
//       </div>
//     Images pulse in sand-150 (#F4E7DD); video pulses in black/20, and only
//     for motion-safe visitors.
//  2. Bar skeletons standing in for a section that has not rendered yet —
//     a fixed-height box of rounded sand bars in the shape of the real copy.
//
// Both use Tailwind's own `pulse`: 2s cubic-bezier(.4,0,.6,1) infinite.

const radiiOf = (cls) => (cls.match(/\brounded(-[\w[\]./%-]+)?\b/g) || []).join(' ')
const fitOf = (cls) => (cls.match(/\bobject-[\w[\]./%-]+\b/g) || []).join(' ')
// The frame inherits the element's own classes, so it must not fight them: only
// supply `relative`/`block` when the caller has not set position or display
// itself. Tailwind puts each of those in one CSS layer, where the later rule
// wins regardless of class order — an added `relative` would otherwise pull
// absolutely-positioned crossfade stacks back into flow.
const has = (cls, names) => new RegExp(`(^|\\s)(${names})(\\s|$)`).test(cls)
const POSITION = 'static|fixed|absolute|relative|sticky'
const DISPLAY = 'block|inline-block|inline|flex|inline-flex|grid|inline-grid|contents|hidden'

/** The pulsing layer live paints over media that has not loaded yet. */
export function PulseLayer({ radius = '', tone = 'sand', hidden = false }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-[1] block overflow-hidden transition-opacity duration-300 ${radius} ${
        hidden ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <span
        className={`block h-full w-full ${radius} ${
          tone === 'video' ? 'bg-black/20 motion-safe:animate-pulse' : 'animate-pulse bg-sand-150'
        }`}
      />
    </span>
  )
}

/**
 * Drop-in for <img>/<iframe> that carries live's placeholder. The wrapper keeps
 * the element's original layout classes so surrounding grids are untouched; the
 * media itself fills it.
 */
export function Media({ as = 'img', className = '', style, tone, alt = '', ...rest }) {
  const [loaded, setLoaded] = useState(false)
  const radius = radiiOf(className)
  const Tag = as
  const media =
    as === 'img' ? (
      <img
        {...rest}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`block h-full w-full ${fitOf(className)} ${radius}`}
      />
    ) : (
      <Tag
        {...rest}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`block h-full w-full ${fitOf(className)} ${radius}`}
      />
    )
  const frame = [
    has(className, POSITION) ? '' : 'relative',
    has(className, DISPLAY) ? '' : 'block',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <span className={frame} style={style}>
      {media}
      <PulseLayer radius={radius} tone={tone} hidden={loaded} />
    </span>
  )
}

/** One sand bar. Heights and widths below are live's own. */
export function Bar({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-sand-150 ${className}`} />
}

/**
 * Live's fallback for a section that has not rendered: a fixed-height box
 * holding a heading bar and two copy bars. Measured heights are 400, 500 and
 * 600px depending on the band.
 */
export function SectionFallback({ height = 600 }) {
  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-4 px-6"
      style={{ height }}
      role="status"
      aria-label="Loading"
    >
      <Bar className="h-8 w-1/3" />
      <Bar className="h-4 w-2/3" />
      <Bar className="h-4 w-1/2" />
    </div>
  )
}

/** Stand-in for a stack of accordion rows (FAQ bands). */
export function RowsSkeleton({ rows = 5 }) {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-14 w-full animate-pulse rounded-md bg-sand-150" />
      ))}
    </div>
  )
}

/** Stand-in for a card: title, three copy lines, a button and an image. */
export function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Bar className="h-6 w-3/5" />
      <Bar className="h-4 w-full" />
      <Bar className="h-4 w-4/5" />
      <Bar className="h-4 w-5/6" />
      <Bar className="h-9 w-4/5" />
      <div className="mt-3 aspect-[4/3] w-full animate-pulse rounded-lg bg-sand-150" />
    </div>
  )
}

/** Stand-in for a titled video block. */
export function VideoBlockSkeleton() {
  return (
    <div className="flex w-full max-w-4xl flex-col items-stretch gap-4">
      <Bar className="h-10 w-2/3 max-w-md" />
      <Bar className="h-5 w-full max-w-lg" />
      <div className="mt-1 aspect-video w-full max-w-3xl animate-pulse rounded-lg bg-sand-150" />
    </div>
  )
}

/** Stand-in for a three-up panel row. */
export function TrioSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-32 w-full animate-pulse rounded-lg bg-sand-150" />
      ))}
    </div>
  )
}

/** Stand-in for a wrapping row of pills. */
export function ChipsSkeleton({ chips = 7 }) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-4 px-2">
      {Array.from({ length: chips }, (_, i) => (
        <div key={i} className="h-12 w-28 animate-pulse rounded-md bg-sand-150" />
      ))}
    </div>
  )
}

/** Stand-in for an index page's filter bar — live uses the lighter sand-75. */
export function FilterBarSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-9">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-10 w-20 animate-pulse rounded-lg bg-sand-75" />
        ))}
      </div>
      <div className="h-10 w-full animate-pulse rounded-lg bg-sand-75 md:max-w-xs" />
    </div>
  )
}

/** What a whole route shows while its chunk is in flight. */
export function PageFallback() {
  return (
    <div className="px-global py-section-md">
      <div className="mx-auto w-full max-w-container-lg">
        <SectionFallback height={600} />
      </div>
    </div>
  )
}
