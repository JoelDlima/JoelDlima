/**
 * Development aid: rasterises every asset/*.svg to .cache/png for inspection.
 * The README ships the SVGs themselves; these are for eyeballing and for
 * pixel-sampling checks (ground/accent/ink coverage) that catch a component
 * which silently missed the palette.
 */
import fs from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

fs.mkdirSync('.cache/png', { recursive: true })

const filter = process.argv[2] // optional substring filter, e.g. "dark"
for (const f of fs.readdirSync('assets').filter((f) => f.endsWith('.svg'))) {
  if (filter && !f.includes(filter)) continue
  const svg = fs.readFileSync(`assets/${f}`, 'utf8')
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: 900 } })
  fs.writeFileSync(`.cache/png/${f.replace(/\.svg$/, '.png')}`, r.render().asPng())
  console.log(f)
}
