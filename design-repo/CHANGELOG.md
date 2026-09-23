# Changelog

## 1.0.0 -- 2026-09-23 -- Initial build (from scratch)

First build of this design-repo (Situation A: no design-repo existed for this
project before this session). Built bottom-up per
`DESIGN-REPO-BUILD-GUIDE.md`: tokens -> primitives -> components -> sections
-> templates -> compatibility graph -> schema -> example instance -> semantic
validator -> adversarial tests -> manifest/allowlist/docs.

### Added
- 18 token files across `00-foundation` (8), `10-semantic` (3),
  `20-component` (3), `30-layout` (3), `themes` (1), all grounded in
  `tailwind.config.js` and `CLONE_SPEC.md`'s real Playwright measurements.
- `tokens/llm/{token-catalog,token-policy,component-allowlist,asset-roles}.json`.
- 7 primitives, 6 components, 80 section contracts (14 generic, 11 solutions,
  44 hand-built band, 8 HomePage-local, 3 PricingPage-local), every one citing
  a real `path:line` range in the source project.
- 26 templates in `templates/templates.json`, mapping all 40 real routes
  1:1 with zero gaps and zero double-assignment.
- `compatibility/graph.json` with 6 rhythm rules (`ONE_HERO_PER_PAGE`,
  `NO_ADJACENT_SAME_SECTION`, `NO_CONSECUTIVE_SCROLL_STAGES`,
  `CTA_BAND_MUST_BE_LAST`, `FAQ_AT_MOST_ONCE`, `MOTION_BUDGET`), each with an
  explicit severity and, where relevant, a named exception grounded in a real
  template.
- `schema/pagespec.schema.json` (Draft-07): closed `basedOnTemplate` enum (26
  values), closed node `section` enum (80 values), one independent `if/then`
  content branch per section id (avoiding the shared-base
  `additionalProperties:false` draft-07 trap), a closed `motion` object
  (`pattern` enum + `const`-locked `reducedMotionFallback`).
- `schema/example.pagespec.json`: a real, complete `solutions-shared`
  instance using Heidi's own captured medical-specialties copy from
  `src/data/solutions.json`. Validates with 0 schema errors.
- `schema/semantic_validate.py`: cross-references a PageSpec's declared
  `basedOnTemplate` against that template's own real node list (not `nodes[]`
  in isolation), enforces the compatibility graph's rhythm rules, and
  independently re-checks `maxWords` per real field against each referenced
  section's own content contract.
- `schema/tests/adversarial_test.py`: 43 assertions -- 27 controls (the
  bundled example plus one synthesized minimal-valid instance per real
  template, all zero-error) and 16 rejected mutations across schema,
  structural and runtime categories.
- `extraction/measured-values.json`: citation ledger for evidence living
  outside `design-repo/`, plus 6 recorded structural/compliance findings.
- `extraction/verify_all.py`: automated allowlist-parity, citation-validity,
  manifest-count-recompute, route-coverage, manifest-self-containment, and
  no-absolute-path checks, all runnable from a self-contained copy with no
  sibling source tree present.
- `registry.manifest.json` with real recomputed counts, in-package-only
  `entryPoints`, and explicit compliance guidance pointing at
  `tokens/llm/asset-roles.json`.

### Fixed during this same build pass (caught by the adversarial control
suite before shipping, per MASTER-GUIDE 3.18)
- `sections/band.ask-bar.json` and `sections/band.video-intro.json` were
  initially miscategorized as `category: "hero"`. Running the adversarial
  suite's per-template control instances immediately surfaced
  `ONE_HERO_PER_PAGE` false failures on the real `evidence` and `hardware`
  templates (each legitimately has one true hero plus one of these
  supplementary bands). Corrected to `"content"` (ask-bar) and `"feature"`
  (video-intro) -- both are real supplementary bands elsewhere on their page,
  not the page's H1-bearing hero, confirmed against each page's own JSX
  render order.

### Known, explicitly recorded gaps (not silently invented around)
- `tokens/llm/token-policy.json`'s `overrides` field states plainly that this
  design-repo's PageSpec instances carry no per-instance style/token-override
  field at all -- styling is fully owned by the section/component contracts a
  node references. No token-override validation/adversarial coverage was
  built for a mechanism that does not exist (MASTER-GUIDE 3.21).
