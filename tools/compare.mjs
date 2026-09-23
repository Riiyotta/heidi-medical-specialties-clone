// Full-page local-vs-live screenshots + a side-by-side strip.
// usage: W=1440 node tools/compare.mjs name:/local/path:/en-gb/live/path ...
import { chromium } from 'playwright'
import { execFileSync } from 'child_process'
const W = Number(process.env.W || 1440)
const b = await chromium.launch()
for (const arg of process.argv.slice(2)) {
  const [name, local, live] = arg.split(':')
  for (const [tag, url] of [['local', 'http://localhost:5179' + local], ['live', 'https://www.heidihealth.com' + live]]) {
    const p = await b.newPage({ viewport: { width: W, height: 900 } })
    const errs = []
    p.on('pageerror', (e) => errs.push(e.message))
    await p.goto(url, { waitUntil: tag === 'live' ? 'domcontentloaded' : 'networkidle', timeout: 60000 })
    await p.waitForTimeout(tag === 'live' ? 3000 : 800)
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) } scrollTo(0, 0) })
    await p.waitForTimeout(800)
    await p.addStyleTag({ content: '.download-drawer-shell, aside#download { display: none !important }' })
    await p.screenshot({ path: `/tmp/cmp-${name}-${tag}.png`, fullPage: true })
    console.log(name, tag, await p.evaluate(() => document.body.scrollHeight), errs.length ? errs : '')
    await p.close()
  }
  execFileSync('python3', ['-c', `
from PIL import Image
n='${name}'; s=${W < 800 ? 0.5 : 0.3}; step=${W < 800 ? 2400 : 1500}
a=Image.open(f'/tmp/cmp-{n}-live.png'); b=Image.open(f'/tmp/cmp-{n}-local.png')
a=a.resize((int(a.width*s),int(a.height*s))); b=b.resize((int(b.width*s),int(b.height*s)))
H=max(a.height,b.height); c=Image.new('RGB',(a.width+b.width+20,H),'white'); c.paste(a,(0,0)); c.paste(b,(a.width+20,0))
for i in range(0,H,step): c.crop((0,i,c.width,min(H,i+step))).save(f'/tmp/side-{n}-{i//step}.png')
`])
}
await b.close()
