Source: https://www.heidihealth.com/en-gb/solutions/medical-specialties

# Heidi — Medical Specialties Solutions Page — Clone Spec

Measured live with Playwright (Chromium) at 1280px (desktop), 768px (tablet) and 390px (mobile).
Framework observed on the live site: Next.js (App Router) + Tailwind CSS (utility classes visible
in the DOM: `px-global`, `max-w-container-lg`, `text-heading-2`, `rounded-2xl`, etc.) + Sanity CMS
for content images (`cdn.sanity.io`) + `lucide-react` icon set for all line icons.

Stack we are rebuilding in: React 18 + Vite + Tailwind v3. All values below are computed values
pulled from the live DOM (`getComputedStyle` / `getBoundingClientRect`), not visual estimates.

---

## 1. Global Design Tokens

### Colors (computed, hex derived from rgb)

| Token | rgb | hex | Usage |
|---|---|---|---|
| `bg-page` | rgb(252,250,248) | `#FCFAF8` | body background, most section backgrounds |
| `text-primary` | rgb(40,3,15) | `#28030F` | headings, body text, icon strokes |
| `text-secondary` | rgb(117,87,96) | `#755760` | muted copy (hero paragraph secondary, tab list inactive, ⌘K button, testimonial arrows) |
| `accent-yellow` | rgb(251,245,130) | `#FBF582` | announcement bar bg, primary CTA button bg, "Get Heidi free" bg, CTA band bg, download-drawer pulse |
| `border-base` | rgb(240,223,209) | `#F0DFD1` | card borders (template cards, testimonial cards) |
| `card-white` | rgb(255,255,255) | `#FFFFFF` | template card bg, FAQ item bg |
| `footer/nav-dark-fill` | rgb(40,3,15) | `#28030F` | download-drawer tab bg, dark secondary button (drawer header) |
| `drawer-text-invert` | rgb(249,244,241) | `#F9F4F1` | text on dark drawer tab |
| `badge-check-fill` | rgb(60,109,221) | `#3C6DDD` | verified badge in template cards — the badge shape is FILLED `#3C6DDD` and the tick is stroked `#F9F4F1`. (Superseded the earlier `sky-600` guess, which was never sampled.) |
| `sage` | rgb(88,143,96) | `#588F60` | every icon inside the nav mega-menu, and the active nav trigger's label + chevron. Icons are 20px at `stroke-width: 2`; the row currently under the cursor swaps its icon and chevron to `#28030F`. |
| `sage-stroke` | rgb(64,118,72) | `#407648` | the 4px active-tab stroke under an open nav trigger (a `::after` on the live site, ~8px wider than the label on each side) |
| nav scrim | oklab(0 0 0 / .5) | `rgba(0,0,0,.5)` | page dim while a menu is open, with `backdrop-filter: blur(8px)`, anchored to the header's bottom edge. The header itself keeps `rgba(255,255,255,.8)` + `blur(8px)` while open — it does NOT go solid. |
| download-tab star | rgb(251,245,130) | `#FBF582` | the sparkle on the fixed "Download Heidi" tab is accent-yellow, not the tab's `#F9F4F1` text colour |
| transparent | rgba(0,0,0,0) | — | most buttons/links (ghost style), nav bg |

Gradients observed:
- Right-edge fade next to horizontally-scrollable template row: `linear-gradient(270deg, rgb(252,250,248) 0%, rgba(0,0,0,0) 100%)`
- Download-drawer pulse dot: `radial-gradient(circle, rgb(251,245,130) 0px, rgba(0,0,0,0) 87.5%)`

### Typography

Two font families, both self-hosted via Next `next/font` (woff2), each with a matched
size-adjusted local fallback so there's no layout shift:

- **Display serif — `exposure`** (custom/licensed font, NOT a Google font). Fallback stack:
  `exposure, "exposure Fallback", Georgia, serif`. Weight 400 only. Used for every H1–H3 heading.
  Files captured: `exposure-400.woff2` (primary), `exposure-400-alt.woff2` (second face declared
  in the same family — treat as the same weight/style unless visual diffing shows italic).
- **Body sans — `inter`** (variable font, weight range 100–900). Fallback stack:
  `inter, "inter Fallback", system-ui, sans-serif`. Used for everything else (nav, body copy,
  buttons, labels, cards). Files: `inter-var.woff2` (upright, wght 100–900) and
  `inter-var-italic.woff2` (italic — unused on this page but loaded globally).

Font files downloaded to `public/assets/fonts/`:
```
inter-var.woff2
inter-var-italic.woff2
exposure-400.woff2
exposure-400-alt.woff2
```
Register both with `@font-face` (`font-weight: 100 900` for the inter variable file) and set
Tailwind `fontFamily.sans = ['inter', 'inter Fallback', 'system-ui', 'sans-serif']`,
`fontFamily.serif = ['exposure', 'exposure Fallback', 'Georgia', 'serif']`.

**Type scale (computed, desktop 1280px → mobile 390px):**

| Role | Desktop size/lh/tracking | Mobile size/lh/tracking | Weight | Font |
|---|---|---|---|---|
| H1 (hero) | 56px / 56px / -2.8px | 40px / ~40px / -2px | 400 | exposure |
| H2 (section heading, standard) | 48px / 52.8px / -2.4px | 36px / ~39.6px / -1.8px | 400 | exposure |
| H2 (large — "Every Specialist template made yours", "FAQs for Specialists", CTA band) | 56px / 56px / -2.8px | scales down proportionally | 400 | exposure |
| H3 (accordion tab heading / testimonial-adjacent) | 24px / 30px / -1.2px | same ratio | 400 | exposure |
| H3 (FAQ question) | 16px / 24px / normal | same | 400 | inter |
| H6 (testimonial quote) | 24px / 30px / -1.2px | same | 400 | exposure |
| Body / paragraph | 16px / 22.4px / normal | same | 400 | inter |
| Nav link | 16px / 24px / normal | n/a (hidden, hamburger) | 400 | inter |
| Nav small link (footer cols, "Product"/"Resources" labels) | 14px / 19.6px / normal | 14px | 500 | inter |
| Button label (ghost/outline, e.g. "Explore Scribe") | 16px / 24px / normal | same | 400 | inter |
| Button label (pill CTA, e.g. nav "Get Heidi free") | 14px / 19.6px / -0.42px | same | 500 | inter |
| Caption / meta (template card author sub-line, count) | 12px / 16.8px / normal | same | 400 | inter, color secondary |
| Card title (template card) | 18px / 25.2px | same | 500 | inter |
| Card author name | 14px / 19.6px | same | 600 | inter |

**Rule of thumb for the display font:** letter-spacing = `-5%` of font-size (56→-2.8px, 48→-2.4px,
24→-1.2px). Apply this as a derived Tailwind utility rather than hardcoding per-heading values.

### Spacing / Layout

- Outer page container: `max-w-container-xl` (1920px cap, effectively never hit at normal viewport
  widths) wrapping every section, with **horizontal padding (`px-global`)**:
  - Desktop/tablet (≥768px): `64px` each side
  - Mobile (<768px): `20px` each side
- Inner content container: `max-w-container-lg` = **1280px** — used for the nav row and the main
  content column inside each section.
- Section vertical rhythm: standard sections use `py-section-md` = **80px top/bottom** (padding
  block `80px 64px` measured directly on a section wrapper). The closing CTA band uses a larger
  inset: `py-section-lg-inset` = **176px top/bottom, 128px left/right** at desktop.
- Gap tokens observed: `gap-section-md` = 80px (vertical gap between a section's heading block and
  its content, e.g. above the template grid); card grid gap = 16px (`gap-4`); testimonial
  card-to-card gap = 32px; testimonial track outer gap = 64px.
- Breakpoints (Tailwind defaults, confirmed empirically):
  - `sm` 640px — not load-bearing for major layout shifts on this page
  - `md` 768px — template/testimonial grid goes from 1 → 2 columns; horizontal nav still hidden
  - `lg` 1024px — horizontal nav appears (hamburger disappears); template grid goes 2 → 3 columns;
    two-column feature rows (image + text) go from stacked to side-by-side
- Container widths confirmed at each breakpoint:
  | Viewport | `px-global` | Content col width | Nav mode |
  |---|---|---|---|
  | 390px | 20px | 350px | hamburger (`lucide-menu`, size-8) |
  | 768px | 64px | 640px | hamburger |
  | 1024px | 64px | 896px | full horizontal nav |
  | 1280px | 64px | 1152px | full horizontal nav |

### Border radius scale

| Radius | Usage |
|---|---|
| `9999px` (full) | pills ("Recommended for" tags), search "⌘K" button, avatar-style specialty chips, testimonial prev/next arrow buttons |
| `24px` (`rounded-2xl`) | template grid cards |
| `16px` (`rounded-xl`) | testimonial cards |
| `12px` (`rounded-lg`) | all standard buttons (primary yellow, outline, nav CTA) |
| `18.75px 18.75px 0 0` | download-drawer tab (top corners only, bottom flush with viewport edge) |

### Shadows

| Element | box-shadow (computed) |
|---|---|
| Primary yellow button | `rgba(120,90,60,.06) 0 1px 3px 1px, rgba(120,90,60,.03) 0 1px 1px 0` |
| Testimonial card (desktop, `lg:shadow-md`) | `rgba(120,90,60,.07) 0 6px 18px 8px, rgba(120,90,60,.04) 0 2px 6px 1px` |
| Template card | no shadow at rest; `hover:shadow-xs` on hover (subtle, exact values not resolvable without a real hover — flag for Pixel-Audit) |

---

## 2. Page Structure (top → bottom)

All sections are full-bleed backgrounds (`bg-page` `#FCFAF8`, or transparent) at `max-w-container-xl`
with an inner `max-w-container-lg` (1280px) column, except the closing CTA band which has its own
yellow background with a wavy SVG pattern.

### 2.1 Announcement bar (global, sticky at very top, dismissible)
- Full-width bar, bg `#FBF582`, text `#28030F`, height ≈ 32–40px, font-size 12px/16.8px line-height.
- Copy: **"Heidi powers the largest AI scribe procurement in NHS history. 70,000 Clinicians. 15 NHS
  Trusts. 1,200+ GP Practices. Learn more."** (first sentence bold via `<strong>`, rest regular,
  "Learn more." likely a link).
- Has a close/dismiss icon (svg) at the right edge — flag for Animation: verify dismiss persists via
  cookie/localStorage (not observable statically).

### 2.2 Global Nav (sticky/fixed header, shared across site)
- Row inside `max-w-container-lg` (1280px), height ~62px, `justify-between`.
- Left: Heidi logo mark (SVG, viewBox `0 0 122 37`, "Heidi AI" title) + wordmark, `h-8` (32px tall)
  in header, `h-12`/`h-15` variant used elsewhere (e.g. footer). Saved: `public/assets/icons/heidi-logo.svg`.
- Center-left nav links (**hidden below `lg` / 1024px, replaced by a `lucide-menu` hamburger,
  size-8**): "Product" (dropdown, `lucide-chevron-down` rotates 180° on open), "Resources"
  (dropdown), "Pricing" (plain link), "Contact us" (plain link). Font: inter 16px/24px/400, color
  `#28030F`.
- Right cluster: search trigger pill "⌘K" (`lucide-search` icon, size-4, full-radius pill, bg
  `#FCFAF8`, text secondary `#755760`), "Log in" link (inter 14px/500, color primary), "Get Heidi
  free" button (pill, bg `#FBF582`, text `#28030F`, 14px/500, padding `10px 16px`, radius 12px,
  letter-spacing -0.42px).
- "Skip to main content" a11y link present (visually hidden until focused).

### 2.3 Hero
- Two-column layout ≥1024px (text left, visual right); stacks to single column below.
- Eyebrow: "Heidi for specialists" (small caps/label style, secondary or primary text — verify
  color/weight against screenshot; measured as 16px/400).
- H1: **"Clear the list, starting with patients"** — exposure 56px/56px/-2.8px (40px/-2px on mobile).
- Body paragraph: "The AI Care Partner that adapts to your voice, handling the invisible admin, so
  you can stay present with the patients only you can help." — inter 16px/22.4px/400, `#28030F`.
- Primary CTA: "Get Heidi free" button — dark variant here (screenshot shows a dark-green/black
  pill button distinct from the nav's yellow one; confirm exact bg against screenshot
  `desktop_full3.png`, section ~y0–785 — looked like a very dark green, close to `#28030F`/near-
  black with white text — flag for Pixel-Audit to sample exact pixel color since our computed-style
  sweep captured the smaller nav CTA, not this one specifically).
- Right visual: pastel blue/green photo background (rounded card) with an overlaid white UI card
  labelled **"Referrer Letter"** showing a tab switcher — **Paediatrician / Neurologist / Sports
  Physician** (Paediatrician active by default) — plus mock form fields (Referrer, Diagnosis) and a
  "Send" button. This entire visual is built from a single Sanity image
  (`hero-referrer-letter-1200x960.jpg`, alt: "An example of the Heidi platform creating a
  psychiatric intake note from transcription") composited with a real DOM card, OR the tabs may be
  live DOM elements overlaid on the photo — clicking "Neurologist"/"Sports Physician" did not
  change the network-loaded image, so **the tab switching is a DOM/CSS state change only, not an
  image swap** — flag for Animation agent to inspect the exact transition (likely a crossfade or
  clip-path reveal) since it could not be triggered headlessly with full confidence.
- Rendered image box (desktop): 536×429px.

### 2.4 "Built for your specialty, every one of them"
- Centered H2, exposure 48px/52.8px/-2.4px, max-width ~768px, centered text.
- Sub-copy: **"Recommended for"** label (16px/400) followed by a centered, wrapped row of specialty
  pill-badges (not a marquee/carousel — static `flex flex-wrap justify-center gap-3`):
  Paediatrician, Gastroenterologist, Sports Physician, Neurologist, Dermatologist, Internal
  Medicine Specialist. Pills: full-radius, bg `#FCFAF8`, border `#755760`? (measured border color
  matched text color `rgb(117,87,96)`), text 14px secondary, padding `py-1 px-2`, gap 8px icon+label
  (icon appears to be a small specialty glyph — not resolvable statically, flag for asset review).
- Note: an earlier full-page screenshot appears to show a "Download Heidi" pill overlapping this
  heading — **this is a full-page-screenshot stitching artifact from the fixed-position download
  drawer tab, not real page content.** Verify in Build/Pixel-Audit with a normal (non-stitched)
  screenshot.

### 2.5 Feature row 1 — "Documentation that holds up to a second opinion"
- Two-column, image LEFT / text RIGHT at ≥1024px (order reverses per row, alternating zig-zag
  pattern down the page — confirm each row's order against screenshots below).
- Image: dark green/teal photo UI mock (`feature-scribe-transcript-1188x952.png`, alt "Heidi
  Transcript"), rendered 536×429.
- Copy: paragraph "Consult letters and procedure notes in your preferred structure, all from the
  same session. One visit. Nothing to rewrite." + CTA button **"Explore Scribe"** (yellow pill).

### 2.6 Feature row 2 — "Peer-reviewed answers, no corridor guesswork"
- Text LEFT / image RIGHT.
- Image: clinical-outcomes card UI (`feature-evidence-ask-heidi-1200x960.jpg`, alt "Ask heidi"),
  536×429.
- Copy: "Peer-reviewed, traceable answers with citations you can open and verify in real time.
  Every decision, sourced." + CTA **"Explore Evidence"**.

### 2.7 Feature row 3 — "The site never stops the note"
- Image LEFT (dark moody photo of the Heidi Remote hardware pen/device,
  `feature-remote-device-1200x960.png`, alt "Comms") / text RIGHT.
- Copy: "Works across private rooms, hospital outpatient wings, and any setting with unreliable
  internet. Offline capture, automatic sync. The site never determines whether the note gets done."
  + CTA **"Get Remote"**.

### 2.8 Feature row 4 — "Speak, don't type it"
- Text LEFT / image RIGHT.
- Image: dictating-note UI card over a blurred yellow/blue bokeh background
  (`feature-dictate-note-600x480.svg`, alt "Heidi Dictate") — this is genuinely an SVG asset
  (not a loading artifact), 536×429 render box; contains a mock "Dear Dr Patel..." referral letter
  card and a floating "● Dictating" pill with a live waveform icon.
- Copy: "Press and hold one key and Heidi turns your voice into clinical text in any application,
  so the findings, addenda and letters back to referrers or emails get done in the moment. Not
  after clinic." + CTA **"Explore Dictate"**.

### 2.9 "Your day with Heidi" — tabbed/accordion feature
- H2 "Your day with Heidi", centered? (measure shows left-aligned content column at 1024+, image
  right).
- Left: accordion-style list of 3 items, first expanded by default:
  1. **"Defensible documentation, every session"** (expanded — shows body copy: "Heidi listens
     while you work. Letters and notes drafted in your preferred structure ready to review and
     ready to send. Configure your specialty template once, reuse it every session.")
  2. "Evidence mid-session, no tab avalanche" (collapsed)
  3. "From the rooms to the ward, nothing lost" (collapsed)
  Each item separated by a horizontal divider; active item's divider/heading rendered in primary
  text color, inactive items in secondary color `#755760`.
- Right: image swaps per active tab — 3 Sanity images, same 1200×1200 crop, all featuring a blurred
  autumn-leaves bokeh background behind clinic-note UI cards ("Follow Up Clinic Note", "Email" /
  "Download PDF" buttons):
  - Tab 1 → `day-with-heidi-1200x1200.jpg`
  - Tab 2 → `day-with-heidi-tab2-1200x1200.jpg`
  - Tab 3 → `day-with-heidi-tab3-1200x1200.jpg`
  Flag for Animation: confirm whether the image swap crossfades or hard-cuts (clicking accordion
  headings did trigger new network image loads, confirming it's a real content swap, not CSS-only).

### 2.10 "Every Specialist template made yours"
- Centered H2, larger scale (56px/56px/-2.8px desktop).
- Below: a responsive grid of template cards — **1 col mobile / 2 col tablet (≥768) / 3 col desktop
  (≥1024)**, gap 16px, each card ~373×154px at desktop (white bg `#FFFFFF`, 1px border `#F0DFD1`,
  radius 24px, padding 16px, `hover:shadow-xs` + subtle hover state (group utility present in
  class list — implies a hover affordance, exact values need live-hover inspection later)).
- Card anatomy (top → bottom): small kind label ("Document" or "Note", secondary/muted, 12px),
  title (18px/500, e.g. "Response to referral letter"), footer row with a UK flag icon (`country=
  united-kingdom.svg`), author name (14px/600), specialty (12px secondary), and a right-aligned
  count badge (e.g. "4", "18", "38") — likely a "used N times" indicator, paired with a
  `lucide-badge-check` (fill `sky-600`) and `lucide-user` icon seen in the SVG inventory.
- The 6 cards observed (content only, verbatim):
  1. Document — "Response to referral letter" — Jim Callaghan — Gastroenterologist — 4
  2. Note — "High Risk Anaesthesia Clinic" — madankumar narayanan — Adult Intensive Care Specialist — 18
  3. Document — "Formal clinic letter" — Anonymous — Gastroenterologist — 38
  4. Note — "Follow up appointment - female" — Susannah Woodrow — Gastroenterologist — 5
  5. Note — "New Male General Outpatient review" — Susannah Woodrow — Gastroenterologist — 4
  6. Note — "Gastroenterology letter" — Doctor MEDii — Endocrinologist — 5
- A right-edge fade gradient (`linear-gradient(270deg,#FCFAF8 0%,transparent 100%)`, 96px wide) sits
  over the grid — implies the grid area may be horizontally scrollable on narrower breakpoints, or
  is a leftover overflow mask; verify scroll behavior in Build/Pixel-Audit at tablet width.

### 2.11 "Hear from Specialists already using Heidi"
- H2 left-aligned next to a "Read customer stories" pill link/button (top-right of the row).
- Below: a horizontal testimonial carousel, 2 cards visible at desktop (each `max-w-md`, gap 32px
  between cards, gap 64px in outer track), with **Previous slide / Next slide** icon buttons
  (`lucide-arrow-left` / `lucide-arrow-right`, full-radius, color secondary) below the row.
- Card: bg `#FCFAF8`, 1px border `#F0DFD1`, radius 16px, padding 36px (28px gap between quote and
  attribution), shadow `rgba(120,90,60,.07) 0 6px 18px 8px, rgba(120,90,60,.04) 0 2px 6px 1px`
  (desktop only — `lg:shadow-md`).
- Quote text: exposure font, 24px/30px/-1.2px, `#28030F` (rendered as an H6 tag — semantically odd
  but matches computed styles).
- All 3 quotes captured (only 2 visible at once in the carousel viewport):
  1. "Heidi has quietly raised the floor of what my documentation looks like on my busiest days. On
     a busy day, that floor matters more than the ceiling." — **Alex Hwong-Ruey Leow**, Consultant
     Gastroenterologist and Hepatologist
  2. "I can't believe we ever lived without Heidi Health. It's been a huge time-saver and a far
     more detailed way of keeping track of progress through therapy." — **Romy Cohen**, The
     Forbury Clinic
  3. "I leave the clinic with this sense of ease that I've done everything. It's not this cloud
     hanging over you. It's a lightness." — **Dr Louise Nott**, Director of Medical Oncology

### 2.12 "FAQs for Specialists"
- Centered H2, 56px/56px/-2.8px.
- Accordion, 4 items ("Showing 4 of 4 questions" footer text implies pagination/filtering exists
  elsewhere on the site but not on this page). First item expanded by default.
- Item shell: white bg, radius 24px (rounded-2xl, matches template cards), question row uses a
  custom animated plus/minus icon pair (`faq-plus.svg` / `faq-minus.svg`, both 22×22, cross-fade /
  scale-to-0 transition via `group-data-[state=open]:scale-0` on the plus glyph — i.e. plus rotates
  out and a horizontal bar (minus) is always present underneath, creating a plus→minus swap on
  open). Duration/easing: Tailwind default `transition-all duration-300` — no explicit easing class
  seen, so default `ease` (cubic-bezier(0.4,0,0.2,1) is Tailwind's default `transition` timing).
- Questions:
  1. "How does Heidi work for my specialty?" (expanded) — "Heidi comes with specialty-specific
     templates you can configure to match your real letter structure, voice, and clinical
     workflow. For clinical questions mid-session, Evidence surfaces cited, peer-reviewed answers
     from the guideline bodies relevant to your specialty. Set it up once; it adapts from there."
  2. "Will the output be good enough to actually send?" (collapsed, answer not captured statically)
  3. "How is Heidi setup?" (collapsed)
  4. "I already use an EMR. Will Heidi work with it?" (collapsed)
  — Flag for Build/Pixel-Audit: click through to capture the 3 collapsed answers' copy verbatim
  before shipping (not visible without interaction; this recon pass only got answer #1).

### 2.13 Closing CTA band
- Full-bleed yellow (`#FBF582`) band, large vertical padding (176px top/bottom desktop, 128px
  sides — `py-section-lg-inset`), with a repeating wavy/organic SVG pattern as a background layer
  (`pattern-5.svg`, saved to `public/assets/icons/pattern-5.svg`).
- Centered H2 (56px/56px/-2.8px): **"Built for specialists. Works the way you do."**
- CTA button below, dark variant (bg near-black/`#28030F`-family, not the yellow pill) —
  **"Get Heidi free"**.

### 2.14 Footer (global, shared across site)
- Top row: language selector "English" (dropdown, `lucide-chevron-down`), Heidi logo (larger,
  `h-12`/`h-15`) + tagline "Heidi. By your side.", social icons row (Facebook, Instagram, LinkedIn,
  X, YouTube — all 5 saved as individual SVGs even though only 4 typically render in the footer
  row; verify which 4 are actually visible in Build/Pixel-Audit, likely FB/IG/X/YouTube per the
  screenshot, with LinkedIn possibly used elsewhere on the site).
- Link columns (6): **Specialties** (Family Medicine, Specialists, Nurses, Mental Health, Allied
  Health, Dentists, Veterinarians, Trainees), **Compliance** (Safety, Trust Center, AU/NZ, Canada,
  UK, GDPR, HIPAA), **Product** (Pricing, Changelog, Downloads, Heidi Guides, Help Centre, System
  Status, System Requirements), **About Us** (Contact Us, Company, Customer Stories, Media, Open
  Roles), **Resources** (Blog, ROI Calculator, Resource Centre, Template Community, FAQs),
  **Legal** (Privacy Policy, Terms of Service, Usage Policy, UKGDPR Policy, Accessibility, Website
  Legal Information, Modern Slavery Statement (UK)).
- Bottom row: "© 2026 Heidi. All rights reserved." + "Cookie preferences" link.
- Column label typography: inter 14px/500 (matches nav dropdown label size); link items likely 14px/400.

### 2.15 Persistent floating element — "Download Heidi" drawer
- A fixed `<aside>` pinned to `inset-x-0 bottom-0`, `z-51`, present on every scroll position (not
  scoped to one section). Collapsed state shows a small dark pill/tab (`#28030F` bg, `#F9F4F1`
  text, top corners radius `18.75px`, height = CSS var `--download-drawer-tab-height`) reading
  "Download Heidi" with a sparkle/star icon (`download-star.svg`) and a `lucide-download` icon.
  Class names (`download-drawer-shell`, `translate-y-[calc(100%_-_var(--download-drawer-tab-
  height))]`, `download-drawer-pulse`) indicate it slides up from off-screen to reveal a fuller
  panel on click/hover, with a pulsing radial-gradient dot animation on the star icon. **Flag for
  Animation agent**: the open/expanded panel content was not captured (never triggered a click) —
  needs a follow-up interactive pass to record the expanded state's contents, size, and
  transition timing/easing.

---

## 3. Assets

All assets have been downloaded into `public/assets/` (paths below are relative to `public/`).

### Images

| Local path | Original URL | Dimensions | Used in |
|---|---|---|---|
| `assets/images/hero-referrer-letter-1200x960.jpg` | `cdn.sanity.io/.../0ac476fa0d005b1e35962418bd131dfb6286c761-1200x960.jpg` | 1200×960 (rendered 536×429) | Hero right visual |
| `assets/images/feature-scribe-transcript-1188x952.png` | `.../7bdc2851057230cc2b73a7a674e2ba840deee104-1188x952.png` | 1188×952 (rendered 536×429) | "Documentation that holds up..." row |
| `assets/images/feature-evidence-ask-heidi-1200x960.jpg` | `.../11bcde0b50527cfc32f1156e221b096021c93677-1200x960.jpg` | 1200×960 (rendered 536×429) | "Peer-reviewed answers..." row |
| `assets/images/feature-remote-device-1200x960.png` | `.../09544aac3133e4530ae95331a6d1a7b8925f342b-1200x960.png` | 1200×960 (rendered 536×429) | "The site never stops the note" row |
| `assets/images/feature-dictate-note-600x480.svg` | `.../de48644d369af2bbafc1f2471558f3cddce7dc83-600x480.svg` | 600×480 (rendered 536×429) | "Speak, don't type it" row |
| `assets/images/day-with-heidi-1200x1200.jpg` | `.../d8bbaa0b85dda4bbe885782eaaa51b6ce34f856f-1200x1200.jpg` | 1200×1200 (rendered 456×456) | "Your day with Heidi" tab 1 (default) |
| `assets/images/day-with-heidi-tab2-1200x1200.jpg` | `.../353ea8e5c9faa2f4723f63f3e41409d8f6eb6028-1200x1200.jpg` | 1200×1200 | "Your day with Heidi" tab 2 |
| `assets/images/day-with-heidi-tab3-1200x1200.jpg` | `.../0c10af974d112a74c95d7b265c4f9bb12591135c-1200x1200.jpg` | 1200×1200 | "Your day with Heidi" tab 3 |

Note: the live site serves these via Next.js `/_next/image` with AVIF re-encoding at various
widths/quality; we downloaded the original un-transcoded source from `cdn.sanity.io` (with
`?fit=max&auto=format`) so Build should re-optimize (WebP/AVIF + responsive `srcset`) locally
rather than hardcoding one size.

### Icons / SVG

| Local path | Source | Notes |
|---|---|---|
| `assets/icons/heidi-logo.svg` | inline DOM SVG | viewBox `0 0 122 37`, `fill="currentColor"` — recolor via CSS `color` |
| `assets/icons/pattern-5.svg` | `/patterns/pattern-5.svg` | wavy background pattern, closing CTA band |
| `assets/icons/flags/country-united-kingdom.svg` | `/images/flags/country=united-kingdom.svg` | 34×24, template cards |
| `assets/icons/social-facebook.svg` | inline DOM SVG | footer |
| `assets/icons/social-instagram.svg` | inline DOM SVG | footer |
| `assets/icons/social-linkedin.svg` | inline DOM SVG | footer (verify if actually rendered on this page) |
| `assets/icons/social-x.svg` | inline DOM SVG | footer |
| `assets/icons/social-youtube.svg` | inline DOM SVG | footer |
| `assets/icons/faq-plus.svg` | inline DOM SVG | FAQ accordion, "closed" state glyph |
| `assets/icons/faq-minus.svg` | inline DOM SVG | FAQ accordion, always-present bar under the plus |
| `assets/icons/download-star.svg` | inline DOM SVG | download drawer sparkle icon |

### Icon library

Every other icon on the page is a stock **lucide-react** icon used at native stroke style — install
`lucide-react` rather than re-creating these as static assets:
`arrow-right`, `arrow-left`, `chevron-down`, `search`, `menu`, `badge-check` (filled `sky-600`),
`user`, `download`.

### Fonts

| Local path | Family | Weight | Format |
|---|---|---|---|
| `assets/fonts/inter-var.woff2` | inter | 100–900 (variable) | woff2 |
| `assets/fonts/inter-var-italic.woff2` | inter | 100–900 italic (variable) | woff2 |
| `assets/fonts/exposure-400.woff2` | exposure | 400 | woff2 |
| `assets/fonts/exposure-400-alt.woff2` | exposure | 400 (second face — verify if italic/alt cut) | woff2 |

### Not downloaded / not applicable
- No `<video>` or `<canvas>` elements exist on this page.
- Third-party tracking pixels (Google Ads, Bing, Clarity, HubSpot, Outbrain, AdRoll/adsrvr,
  Flashtalking) were observed in network traffic but are analytics/marketing tags, not visual
  assets — excluded from the manifest.

---

## 4. Motion / Interaction Inventory

| Interaction | Observed | Notes for Animation agent |
|---|---|---|
| Announcement bar dismiss | Close icon present | Persistence mechanism (cookie/localStorage) not verified — check on real click |
| Nav dropdowns (Product/Resources) | `lucide-chevron-down` rotates 180° via `group-data-[state=open]:rotate-180 transition-transform` | Duration/easing = Tailwind default (`transition-transform` ⇒ 150ms, default ease) — confirm against DevTools timeline |
| Hero tab switcher (Paediatrician/Neurologist/Sports Physician) | DOM state change, no new image network request on click | Exact transition (crossfade vs. instant) not confirmed — needs live inspection |
| "Your day with Heidi" accordion | Clicking a tab heading swaps the right-side image (confirmed via new network request) and expands/collapses body copy | Investigate crossfade vs. hard cut, and whether height animates |
| FAQ accordion | Plus icon scales to 0 on open (`transition-all duration-300`), minus bar remains, revealing answer text | Standard accordion height animation likely via Radix/Headless UI `data-state` pattern — check for `overflow: hidden` height transition |
| Testimonial carousel | Prev/Next arrow buttons; card track likely uses `transform: translateX` | Not triggered in this pass — confirm scroll-snap vs. JS-controlled slide, and whether it auto-advances |
| Download drawer (bottom-fixed) | `translate-y-[calc(100%_-_var(--download-drawer-tab-height))]` suggests it's parked mostly off-screen and slides up on interaction; a `download-drawer-pulse` radial-gradient dot animates continuously (likely a `pulse`/`ping` keyframe) | Expanded-state content, trigger (hover vs click), and full slide timing not captured — needs a dedicated interactive pass |
| Scroll-triggered entrance animations | Not conclusively detected in this pass (all content was present in DOM before scroll; no IntersectionObserver-gated opacity/transform changes were confirmed) | Flag for Animation agent to check for fade/slide-up-on-scroll via a scroll-triggered screenshot diff or by inspecting `data-*` attributes / Framer Motion presence in bundled JS |
| Right-edge fade mask over template grid | Static `linear-gradient` overlay, `hidden md:block` (i.e. absent below `md`) | Implies possible horizontal scroll/overflow at some breakpoint — verify scroll behavior in Pixel-Audit |
| Button/card hover states | `hover:shadow-xs` on template cards, `group` classes present throughout | No hover state was capturable via static screenshots — Pixel-Audit should diff `:hover` against this spec's rest-state values |

---

## 5. Open Items / Flags for Other Agents

1. **Hero primary CTA button color** — measured the *nav* "Get Heidi free" (yellow), not the
   larger hero CTA which reads visually darker/near-black in the screenshot. Pixel-Audit should
   sample this pixel directly.
2. **Collapsed FAQ answers 2–4** — copy not captured (would require clicking each accordion item;
   only answer #1 was captured in this pass).
3. **Specialty pill icon glyphs** ("Recommended for" row) — small icons before each specialty label
   were not individually extracted; re-run icon inventory zoomed into that row if pixel-fidelity is
   required.
4. **Download-drawer expanded panel** — never triggered; content, layout, and animation unknown.
5. **Template grid horizontal-scroll behavior** — the fade-mask gradient implies possible overflow
   scrolling that wasn't exercised.
6. **Testimonial carousel mechanics** — slide/transform implementation and autoplay behavior not
   confirmed.
7. **Footer social icon set** — 5 icons extracted from the DOM (FB/IG/LinkedIn/X/YouTube); confirm
   against a screenshot which 4 (or 5) actually render in the footer on this specific page.

---

## 6. Multi-page clone (added after the initial single-page build)

### 6.1 Routes
`tools/routes.json` holds all 40 internal nav destinations, mapped live URL → local
path. `src/data/routes.js` is generated from it and drives both the router
(`src/App.jsx`) and link resolution (`src/lib/links.js`). Destinations we do not
clone — `status.heidihealth.com`, `support.heidihealth.com`,
`trust.heidihealth.com`, `scribe.heidihealth.com`, `/developers` — stay as
outbound links, as do heidihealth.com paths with no local route (compliance/*,
legal/*, about-us/people, resources/roi, system-requirements).

### 6.2 How page content is produced
Each route's copy, headings, links and imagery are the live page's own, captured
with Playwright into `src/data/pages/<slug>.json` (see `tools/README.md`).
`src/lib/classify.js` assigns each captured section a type from its *content*
signature — one h2 + one image + a CTA is a feature row, a run of inter-set h3s
is an FAQ, two or more pull quotes is a testimonial band — and
`src/components/sections/index.jsx` renders that type using this spec's tokens.
Classification deliberately ignores the live site's class strings: those are
build-hashed and reorder between deploys.

`/solutions/medical-specialties` is the exception — it keeps its hand-built,
pixel-audited composition (`src/pages/SpecialtiesPage.jsx`), since it is the page
every measurement in sections 1–5 above was taken against.

### 6.3 Known limits of the templated pages
- **Layout is archetypal, not per-page.** A section is drawn with the template
  its content matches, not with the live page's exact bespoke arrangement.
- **The plan comparison matrix has no per-plan ticks.** `/pricing`'s tier cards
  are rebuilt faithfully (dedicated renderer), but the "Compare our plans"
  table marks availability with icons the recon does not capture, so it renders
  as grouped feature lists with their inline qualifiers.
- **Carousels render as static grids.** Anything the live site scrolls
  horizontally (customer logos, template cards on the solutions pages) is laid
  out as a wrapped grid.
- **No scroll/reveal motion** on the generated pages.

### 6.4 Corrections from the QA round (2026-09-22)
Measured on the live site; these supersede anything above that disagrees.

**Nav mega-menu motion.** Opens on **click only** — hover never opens a menu,
and hovering a sibling trigger while one is open does not switch it. Left-rail
parents also swap the right pane on click, not hover. The first open is a hard
cut (no transition). Switching from one open menu to another plays a keyframe
slide driven by `data-motion`: `from-end` → enters from +20px, `from-start` →
from −20px, 300ms ease-out, with opacity 0→1. The scrim fades 200ms. The trigger
chevron does **not** rotate. The menu closes on every navigation.

**FAQ.** Questions are exposure 24/30/−1.2px (`text-h6-quote`); the earlier
"inter 16px" value came from sampling the `<h3>` wrapper instead of its text
span. Layout: `md:grid-cols-2`, gap 80px, heading left, list right in a 600px
column; 8px between items; each item is 24px-radius, transparent when closed
(hover `#F9F4F1`), white when open; trigger padding 24px; answers inter 16/22.4
with 0 24px 24px padding. Five questions show, then "Showing N of M questions"
+ "Show more". Every answer comes from `src/data/faq-answers.json`.

**Buttons.** On the live DOM the `<a>` is a transparent wrapper and a child
paints the button, so the first recon recorded every CTA as transparent. Fills
vary by placement, not by label: solutions-page hero "Get Heidi free" is forest
`#194B22` + 22px arrow; feature-row CTAs are `#FBF582` with **no** arrow; CTA
bands are `#28030F` with no arrow; home's hero is `#28030F`. Each link's own
captured style lives in `src/data/buttons.json`.

**Pricing tiers.** Card white, 1px `#F0DFD1`, 16px radius, 20px padding, four
across. Tier name exposure 24/30; price exposure 40/44/−2px; primary CTA
`#28030F`; secondary "Talk to us" is a borderless 28px text link; features use
a 20px `lucide-check` in `#28030F`. The "Most Popular" tier has a `#28030F`
border and a `#F9DFCD` pill (36px radius).

**Download drawer.** Backdrop is `#28030F` at 40%, fading over **400ms
cubic-bezier(0.5,0,0.5,1)** in lockstep with the panel (not 200ms / black 50%).
The star's glow animates the **width/height** of a radial-gradient dot on a 3s
linear loop: 4px → 23.7px at 50.24% (ease-in-out), then → 5.7px at 100%.

**Reduced motion.** The live site disables drawer, pulse and nav motion under
`prefers-reduced-motion: reduce`; the clone now does the same globally.

**Scroll reveal.** None on the live home, product, solutions or pricing pages,
so none is built. Unchecked: blog and article pages.

### 6.5 Still open after the QA round
- Motion on `/solutions/medical-specialties` sub-components (DayWithHeidi image
  swap, testimonial carousel, hero tab switcher, template-card hover) was not
  re-measured against live.
- Footer links and mobile-sheet rows are 17–24px tall, under the ~40px tap
  guideline (this matches the live site's density).
- "Cookie preferences" in the footer is a dead link: there is no consent
  manager to open.
- "Log in" / "Get Heidi free" in the header leave in the same tab, as on live.

---

## 7. Build structure after the layout rebuild (2026-09-23)

The clone is built in three tiers. Which tier a route uses is decided in
`src/App.jsx` (`BUILT` map → `SolutionsPage` → `GeneratedPage`).

### 7.1 Hand-built pages
`src/pages/{Home,Scribe,Evidence,Coding,Dictate,Hardware,Pricing,Enterprise,
Trainees}Page.jsx`, each written band by band against the live page using
`tools/capture-bands.mjs` (text with computed type + box, painted button
styles, lucide icon names, panel geometry) and `tools/capture-extras.mjs`
(tab/carousel states, decorative SVGs, mask patterns). Shared band components
live in `src/components/bands/index.jsx`.

Desktop heights vs live at 1440px: Home 5756/5741, Scribe 6566/6583, Evidence
6919/6885, Coding 6713/6665, Dictate 7907/7748, Remote 8382/8234, Pricing
6024/6034, Enterprise 8990/8974, Trainees 8064/7781.

### 7.2 The ten "For" pages
`src/pages/SolutionsPage.jsx` + `src/components/solutions/index.jsx`. One
structure shared by Specialists, Primary Care, Nursing, Mental Health, Allied
Health, Dentists, Aged Care, Vets, Surgeons and Emergency Medicine; content per
page from `src/data/solutions.json` (day tabs, stat icons, template grids and
carousels, testimonials, hero/feature visuals).

### 7.3 The remaining 21 pages
`src/pages/GeneratedPage.jsx` + `src/components/sections/index.jsx`. Bands are
typed by content signature and now render their captured background layer:
full-bleed colour, 36px-radius inset panel, or photo, with dark bands inverting
their copy. Card bands with large captured images lay out as stacked rows;
index bands (blog, customers) paginate behind "Load more" as live does; link
directories keep their category groupings.

### 7.4 Assets captured from live
Mockups that the live site renders in the browser — hero panels, feature
visuals, device diagrams, chip fields — are 2x element screenshots under
`public/assets/bands/` and `public/assets/solutions/`; the copy and controls
around them are real HTML. Decorative patterns (`pattern-3/4/5/6.svg`), the
Heidi mark, the timeline curve and the Remote hero video are local assets.

### 7.5 Known gaps
- Scroll-reveal entrance motion is not implemented; live uses it on several
  bands (stats cards, product panels), which is why live full-page captures
  show empty space where the clone shows content.
- The 21 templated pages remain archetypal: `/safety` renders ~0.67 of live's
  height, `/tools` ~0.73, `/customers` ~1.44. Copy, imagery, links and band
  backgrounds are right; bespoke per-band arrangements are not.
- Remote's two guide downloads are gated on live; the buttons point at the
  live page rather than a file.
- `/pricing`'s comparison matrix reflects the Individuals and Teams views as
  captured; currency is GBP only (the live selector has more).


## 8. Loading state (2026-09-23)

Measured on live with `tools/recon-loading.mjs` under a throttled connection.
Live has no splash screen and no route progress bar. It has two placeholder
families, both animated with Tailwind's own `pulse`:
`2s cubic-bezier(0.4, 0, 0.6, 1) infinite`.

### 8.1 Media frame

Every image, video and embed sits in a positioned box with a pulsing layer
painted over it until the file arrives:

```html
<div class="pointer-events-none absolute inset-0 z-1 overflow-hidden rounded-xl">
  <div class="animate-pulse bg-sand-150 size-full rounded-xl" />
</div>
```

The layer's radius tracks the media's own (`rounded-none`, `-lg`, `-xl`,
`-2xl` all observed). Images pulse in `sand-150`; video pulses in `black/20`
and only for motion-safe visitors (`motion-safe:animate-pulse`).

### 8.2 Section fallback

A section that has not rendered yet shows a fixed-height box of sand bars in
the shape of the copy it will hold — heading, then two lines:

| Part | Live classes |
|---|---|
| Box | `h-[400px]` / `h-[500px]` / `h-[600px]` `flex w-full flex-col items-center justify-center gap-4 px-6` |
| Heading bar | `animate-pulse rounded-md bg-sand-150 h-8 w-1/3` |
| Copy bars | `h-4 w-2/3`, then `h-4 w-1/2` |

Live uses several other shapes of the same idea, all reproduced in
`src/components/Skeleton.jsx`: accordion rows (`h-14 w-full` in a
`max-w-3xl` stack), cards (title, three copy lines, a button, a 4:3 image), a
titled video block (`aspect-video max-w-3xl`), a three-up panel row
(`h-32` in `sm:grid-cols-3`) and a chip row (`h-12 w-28`). An index page's
filter bar uses the lighter `sand-75`.

### 8.3 Tokens

| Token | Value | Where |
|---|---|---|
| `sand-75` | `#F6EFEA` | filter-bar placeholders |
| `sand-100` | `#F6ECE4` | — |
| `sand-150` | `#F4E7DD` | every other placeholder |
| video | `rgb(0 0 0 / 0.2)` | video frames only |

### 8.4 How the clone implements it

`src/components/Skeleton.jsx` holds the primitives. `Media` is a drop-in for
`<img>`/`<iframe>` that carries the frame; it is used at all 46 media sites in
`src/components/{bands,sections,solutions}/index.jsx`, `HomePage` and
`TraineesPage`. `VideoHero` carries a `PulseLayer` directly.

`Media` keeps the element's own layout classes on the frame and only supplies
`relative`/`block` when the caller has not set position or display itself.
That matters: Tailwind puts each of those in one CSS layer where the later
rule wins regardless of class order, so an unconditional `relative` pulls
absolutely-positioned crossfade stacks back into flow. A/B measurement across
the nine hand-built pages confirms the wrapper costs 0px of layout (±1px
rounding on two pages).

Routes are code-split (`React.lazy` per page, one `Suspense` in `App.jsx`), so
`PageFallback` is a real loading state rather than decoration: the initial
chunk dropped from 1,978kB to 249kB and each page's data now arrives on
demand. `GeneratedPage` alone is 949kB of captured page JSON.

Verified with `node tools/verify-loading.mjs`: both families render with
live's exact fill and animation, including the video tone and its
`motion-safe` gate.
