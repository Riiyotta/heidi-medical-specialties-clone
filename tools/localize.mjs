// Download a band's images to public/assets/bands/<slug>/ and print local paths.
// usage: node tools/localize.mjs <slug> <band> [unique]
import fs from 'fs'
import { execFileSync } from 'child_process'
const [slug, band, uniq] = process.argv.slice(2)
const bands = JSON.parse(fs.readFileSync(`src/data/bands/${slug}.json`, 'utf8'))
const out = []
const seen = new Set()
for (const im of bands[+band].imgs) {
  let u = im.src
  try { const x = new URL(u); u = x.searchParams.get('url') || u } catch {}
  if (uniq && seen.has(u)) continue
  seen.add(u)
  const base = decodeURIComponent(u.split('?')[0].split('/').pop()).replace(/[^a-zA-Z0-9._-]/g, '-')
  const dest = `public/assets/bands/${slug}/${base}`
  if (!fs.existsSync(dest)) execFileSync('curl', ['-sSL', '--fail', '-o', dest, u.includes('cdn.sanity.io') && !u.endsWith('.svg') ? u + (u.includes('?') ? '&' : '?') + 'w=1600&q=80' : u])
  out.push({ alt: im.alt, src: '/' + dest.replace('public/', ''), w: im.box.w, h: im.box.h })
}
console.log(JSON.stringify(out))
