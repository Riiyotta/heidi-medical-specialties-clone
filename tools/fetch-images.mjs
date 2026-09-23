import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'

const dir = 'src/data/pages'
const outDir = 'public/assets/pages'
const srcs = new Set()
for (const f of fs.readdirSync(dir)) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
  for (const s of j.sections) for (const b of s.blocks) if (b.k === 'img' && b.src) srcs.add(b.src)
}

// _next/image wraps the real Sanity asset; unwrap it so we fetch the original
// (and pick a sane width instead of the 1920 the live page requests).
const resolve = (u) => {
  try {
    const url = new URL(u)
    const inner = url.searchParams.get('url')
    if (inner) { const s = new URL(inner); s.searchParams.set('w', '1200'); s.searchParams.set('q', '75'); return s.toString() }
    return u
  } catch { return u }
}
const nameOf = (real) => {
  const base = decodeURIComponent(new URL(real).pathname.split('/').pop())
  return base.replace(/[^a-zA-Z0-9._-]/g, '-')
}

const map = {}
let n = 0, fail = 0
const entries = [...srcs]
const work = async (u) => {
  const real = resolve(u)
  let name
  try { name = nameOf(real) } catch { fail++; return }
  const dest = path.join(outDir, name)
  map[u] = '/assets/pages/' + name
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return
  try {
    // node's fetch is blocked in this sandbox; curl is not.
    execFileSync('curl', ['-sSL', '--fail', '--max-time', '60', '-o', dest, real])
    if (!fs.statSync(dest).size) throw new Error('empty')
    n++
  } catch (e) { fail++; delete map[u]; console.log('FAIL', name, e.message.split('\n')[0]) }
}
for (let i = 0; i < entries.length; i += 8) await Promise.all(entries.slice(i, i + 8).map(work))

// rewrite the recon JSON to point at local files
for (const f of fs.readdirSync(dir)) {
  const p = path.join(dir, f)
  const j = JSON.parse(fs.readFileSync(p, 'utf8'))
  let touched = false
  for (const s of j.sections) for (const b of s.blocks) if (b.k === 'img' && map[b.src]) { b.src = map[b.src]; touched = true }
  if (touched) fs.writeFileSync(p, JSON.stringify(j, null, 1))
}
console.log('downloaded', n, 'failed', fail, 'mapped', Object.keys(map).length)
