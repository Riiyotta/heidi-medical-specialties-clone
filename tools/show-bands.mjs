// Compact dump of a captured page for writing JSX against.
import fs from 'fs'
const [slug, only] = process.argv.slice(2)
const bands = JSON.parse(fs.readFileSync(`src/data/bands/${slug}.json`, 'utf8'))
const fg = (c) => ({ 'rgb(40, 3, 15)': 'ink', 'rgb(117, 87, 96)': 'sec', 'rgb(249, 244, 241)': 'inv', 'rgb(255, 255, 255)': 'white' }[c] || c)
for (const b of bands) {
  if (only && !only.split(',').includes(String(b.i))) continue
  console.log(`\n=== #${b.i} ${b.box.w}x${b.box.h}  sec=${b.secBox ? `${b.secBox.x},${b.secBox.y} ${b.secBox.w}x${b.secBox.h}` : '-'}`)
  for (const t of b.texts) console.log(`  ${t.tag.padEnd(6)} ${t.ff.slice(0, 4)} ${t.fs}/${t.lh}/${t.ls} w${t.fw}${t.fst === 'italic' ? ' i' : ''} ${fg(t.fg)} ${t.ta} @${t.box.x},${t.box.y} ${t.box.w}w | ${t.t.slice(0, 90)}${t.html ? '  HTML:' + t.html.slice(0, 80) : ''}`)
  for (const l of b.links) console.log(`  LINK "${l.t.slice(0, 30)}" ${l.href || ''} bg=${fg(l.bg)} fg=${fg(l.fg)} r=${l.r} pad=${l.pad} icon=${l.icon}${l.iconBefore ? '(before)' : ''} @${l.box.x},${l.box.y} ${l.box.w}x${l.box.h}`)
  for (const i of b.imgs.slice(0, 8)) console.log(`  IMG ${i.alt.slice(0, 30)} ${i.box.w}x${i.box.h} @${i.box.x},${i.box.y} ${i.src.slice(-50)}`)
  if (b.imgs.length > 8) console.log(`  ...${b.imgs.length} imgs`)
  for (const i of b.icons.slice(0, 10)) console.log(`  ICON ${i.name} ${i.box.w} @${i.box.x},${i.box.y} ${fg(i.fg)} sw${i.sw}`)
  for (const pnl of b.panels.slice(0, 8)) console.log(`  PANEL bg=${fg(pnl.bg)} r=${pnl.r} pad=${pnl.pad}${pnl.bd ? ' bd=' + pnl.bd : ''}${pnl.shadow ? ' sh' : ''}${pnl.bgi ? ' bgi' : ''} @${pnl.box.x},${pnl.box.y} ${pnl.box.w}x${pnl.box.h}`)
  for (const v of b.visuals) console.log(`  VISUAL ${v.id} ${v.tag} ${v.box.w}x${v.box.h} @${v.box.x},${v.box.y} r=${v.r} ${v.file || v.src || v.err || ''}`)
}
