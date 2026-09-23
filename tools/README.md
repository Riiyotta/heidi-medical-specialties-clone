# Clone tooling

These scripts are how the multi-page clone was produced. They are build-time
tools, not part of the app bundle. Run them from the project root.

| Script | What it does |
|---|---|
| `routes.json` | The route manifest: every nav destination on the live site, mapped `live URL → local path`. `src/data/routes.js` is generated from it. |
| `node tools/recon.mjs` | Visits each live page with Playwright and writes a structured section model (headings, copy, links, images, computed type sizes) to `src/data/pages/<slug>.json`. Skips slugs already captured — delete a file to re-capture it. |
| `node tools/fetch-images.mjs` | Downloads every image referenced by the recon data into `public/assets/pages/` and rewrites the JSON to point at the local copies. Uses `curl`; node's `fetch` is blocked in this sandbox. |
| `node tools/recon-faq.mjs` | Opens every FAQ accordion item on every live page (after exhausting "Show more") and writes all questions and answers to `src/data/faq-answers.json`. Needed because the live Radix accordions unmount closed panels. |
| `node tools/recon-buttons.mjs` | Records each link's *painted* button style (fill, text colour, border, radius, icon) to `src/data/buttons.json`. On the live DOM the `<a>` is a transparent wrapper. |
| `node tools/capture-bands.mjs <slug> </en-gb/path>` | Deep per-band capture for hand-building a page: text with computed type and position, painted button styles, lucide icon names, panel geometry, and 2x screenshots of the browser-rendered mockups. Writes `src/data/bands/<slug>.json`. |
| `node tools/capture-extras.mjs <slug> </en-gb/path> <spec.json>` | The states a single capture cannot see: tab/carousel panels, decorative SVGs, CSS mask patterns. |
| `node tools/show-bands.mjs <slug> [bands]` | Compact dump of a captured page, for writing JSX against. |
| `node tools/band-shots.mjs </en-gb/path> <prefix>` | One screenshot per band of a live page, for reference. |
| `node tools/localize.mjs <slug> <band> [uniq]` | Downloads a band's images and prints local paths. |
| `node tools/recon-solutions.mjs`, `recon-template-grid.mjs`, `recon-testimonials.mjs`, `recon-hero-visuals.mjs`, `recon-feature-visuals.mjs` | The "For" pages' deep content: day tabs, template grids and carousels, testimonial cards, hero and feature visuals → `src/data/solutions.json`. |
| `node tools/recon-home.mjs` | Home page assets and measurements → `src/data/home.json`. |
| `W=1440 node tools/compare.mjs name:/local:/en-gb/live ...` | Full-page local-vs-live screenshots plus a side-by-side strip in /tmp. |
| `node tools/recon-loading.mjs` | Captures the live site's loading placeholders per route under a throttled connection — computed animation, fill and box for each one. The source for §8. |
| `node tools/verify-loading.mjs [/route]` | Checks the clone renders both loading states with live's measured values. Delays page chunks and images by hand, since Chromium ignores CDP throttling on loopback. |
| `node tools/sweep.mjs` | Loads every route in the local dev server at 1440px and 390px and reports console errors, horizontal overflow, broken images and empty sections. |
