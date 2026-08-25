/**
 * Downloads the one face the poster is set in: JetBrains Mono, three weights.
 *
 * Committed to build/fonts so a build never depends on the network, and so CI
 * renders byte-identically to a local run. SIL OFL 1.1, which permits
 * redistribution and embedding.
 */
import fs from 'node:fs'
import path from 'node:path'

const FONTS = [
  ['JetBrainsMono-Regular.ttf', 'https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Regular.ttf'],
  ['JetBrainsMono-Bold.ttf', 'https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Bold.ttf'],
  ['JetBrainsMono-ExtraBold.ttf', 'https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-ExtraBold.ttf'],
]

const dir = path.join(process.cwd(), 'build', 'fonts')
fs.mkdirSync(dir, { recursive: true })

for (const [name, url] of FONTS) {
  const dest = path.join(dir, name)
  if (fs.existsSync(dest) && process.argv[2] !== '--force') {
    console.log(`  ${name} — already present`)
    continue
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${name}: ${res.status} ${res.statusText}`)
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(dest, buf)
  console.log(`  ${name} — ${(buf.length / 1024).toFixed(0)} KB`)
}
