/**
 * Development aid: rasterises the posters and slices them into bands small
 * enough to inspect. The README ships the SVGs themselves.
 */
import fs from 'node:fs'
import { Resvg } from '@resvg/resvg-js'
import { PNG } from 'pngjs'

const BAND = 620
fs.mkdirSync('.cache/png', { recursive: true })

for (const theme of process.argv[2] ? [process.argv[2]] : ['dark', 'light']) {
  const svg = fs.readFileSync(`assets/profile-${theme}.svg`, 'utf8')
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: 900 } })
  const img = PNG.sync.read(r.render().asPng())
  const bands = Math.ceil(img.height / BAND)
  for (let i = 0; i < bands; i++) {
    const h = Math.min(BAND, img.height - i * BAND)
    const out = new PNG({ width: img.width, height: h })
    PNG.bitblt(img, out, 0, i * BAND, img.width, h, 0, 0)
    fs.writeFileSync(`.cache/png/${theme}-${i}.png`, PNG.sync.write(out))
  }
  console.log(`${theme}: ${img.width}x${img.height} -> ${bands} bands`)
}
