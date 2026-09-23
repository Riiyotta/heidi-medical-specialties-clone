# Heidi Clone Design-Repo

A machine-validated, AI-ready design system extracted from a Heidi Health
clone project -- a React 18.3.1 + Vite 5.4 +
Tailwind 3.4 + react-router-dom 6.30 rebuild of the real, live commercial site
**heidihealth.com**. The original live site runs Next.js (App Router); this
clone deliberately rebuilds in Vite, and this design-repo describes the
**clone's** real structure, not Next.js's.

Built following this workspace's standard `DESIGN-REPO-BUILD-GUIDE.md` /
`DESIGN-REPO-MASTER-GUIDE.md` methodology (Situation A: no design-repo
existed for this project before this build).

## Real counts (recomputed from disk; also machine-checked by
`extraction/verify_all.py`'s `check_manifest_counts()`)

| Layer | Count |
|---|---|
| Tokens (00-foundation + 10-semantic + 20-component + 30-layout + themes) | 18 |
| Primitives | 7 |
| Components | 6 |
| Sections (distinct content contracts) | 80 |
| Templates (distinct real page shapes) | 26 |
| Routes mapped (1:1, no gaps, no double-assignment) | 40 |

**Route count note:** the build brief this repo was built from stated 37
routes. The real `src/data/routes.js` in the source project contains **40**
route entries (independently recounted via a direct regex extraction of every
`"slug"` key) -- this design-repo is built against the real, current 40-route
list. See `extraction/measured-values.json`'s `structuralFindings` for the
full evidence trail.

## Template families

- **9 hand-built templates** (`home`, `scribe`, `evidence`, `product-coding`,
  `product-dictate`, `hardware`, `pricing`, `solutions-enterprise`,
  `solutions-medical-trainees`) -- each is its own genuinely distinct page
  shape, composed from `src/components/bands/index.jsx`'s 44 real band
  components (plus 8 HomePage-local and 3 PricingPage-local sections). Real
  render order was read directly from each page's own `return (...)` JSX, not
  guessed from the bands module's export order.
- **1 shared solutions template** (`solutions-shared`, 10 routes) -- every
  `/solutions/<vertical>` route except `enterprise` and `medical-trainees`
  (both of which are hand-built, per `src/App.jsx`'s `BUILT` dict), driven by
  `SolutionsPage.jsx` and per-vertical content in `src/data/solutions.json`.
- **16 generic-renderer templates** (21 routes) -- derived by running the
  real `classifyPage()` classifier from `src/lib/classify.js` against every
  route's `src/data/pages/<slug>.json` file and grouping identical resulting
  section-type sequences into one template each (4 groups of 2-3 routes
  share an identical sequence; 12 routes have a genuinely unique sequence and
  keep their own template). `podcast` is the one hero-less template in this
  family (its live page promotes an `h2` to `h1` rather than rendering a
  dedicated hero section -- see `src/lib/classify.js`'s `ensureH1()`).

## Structural findings worth knowing before generating with this repo

1. **19 of the 40 files in `src/data/pages/*.json` are dead data** as far as
   the generic renderer is concerned -- they belong to slugs that `App.jsx`
   routes to a hand-built page or the shared solutions template before
   `GeneratedPage.jsx` ever runs. Only 21 files are live generic-renderer
   input.
2. **HomePage's own 8 local sections mostly take zero props.** Their real
   copy is hardcoded directly in `HomePage.jsx`, unlike every band/solutions
   section, which is genuinely data-driven. Their section contracts in
   `sections/home.*.json` record this honestly (an intentionally minimal
   content schema) rather than inventing a fake generator-editable shape for
   single-instance, hand-authored copy.
3. **Real third-party content requiring licensing guidance exists in this
   project.** `public/assets/home/logo-0..9.svg` and several
   `public/assets/pages/*logo*` files are real, named partner/EMR companies'
   logos (e.g. EMIS Health, Medicus Health, MedicOffice) downloaded from the
   live site's own CDN -- not stock art. `public/assets/icons/heidi-logo.svg`
   is Heidi Health's own real trademark. Testimonial quotes throughout
   `src/data/solutions.json` and `src/data/pages/*.json` attribute real named
   clinicians/customers. See `tokens/llm/asset-roles.json` for the full
   closed `assetRole` enum with explicit AI-generation
   (`may-generate-new` / `must-reuse-exact` / `must-not-fabricate`) and
   licensing guidance per role -- **this is a compliance requirement, not a
   nice-to-have, because Heidi Health is a real, live commercial healthcare
   company.**
4. **No dark theme exists.** Neither `tailwind.config.js` nor `src/index.css`
   defines one; `tokens/themes/` ships a single `light.json` reflecting the
   real app, not an incomplete build.

## Structure

```
design-repo/
  README.md · CHANGELOG.md · registry.manifest.json
  tokens/{00-foundation,10-semantic,20-component,30-layout,themes,llm}/
  primitives/ · components/ · sections/
  templates/templates.json
  compatibility/graph.json
  schema/{pagespec.schema.json, example.pagespec.json, semantic_validate.py, tests/adversarial_test.py}
  extraction/{measured-values.json, verify_all.py}
```

## Running verification

From inside `design-repo/` (works identically from any location, including a
copy with zero sibling folders -- see `extraction/verify_all.py`'s
self-containment design):

```bash
python3 schema/semantic_validate.py            # validates the bundled example
python3 schema/tests/adversarial_test.py        # full adversarial + control suite
python3 extraction/verify_all.py                # allowlist parity, citations, counts, self-containment
```

## Version fields

- `allowlistVersion` (in `registry.manifest.json` and
  `tokens/llm/component-allowlist.json`) is **machine-checked** --
  `extraction/verify_all.py` fails the run if the two drift apart.
- `repositoryVersion` / `pageSpecVersion` are **documentation-only**,
  hand-maintained markers with nothing automatically checking them.
