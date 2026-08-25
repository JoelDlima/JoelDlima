/**
 * Renders the poster in both themes, the contact badges, and a local preview.
 *
 * The README picks between the two posters with <picture> +
 * prefers-color-scheme, so the card follows GitHub's own theme instead of
 * sitting on the page as a dark slab in light mode.
 */
import fs from 'node:fs'
import path from 'node:path'
import { renderPoster, renderBadge, useTheme } from './design/render'
import { themes, type Theme, type as t, radius } from './design/tokens'
import { Mono, measureMono, centerBaseline } from './design/text'
import { loadSnapshot, type Snapshot } from './data/github'
import { buildPoster } from './poster'
import { LINKS } from './sections/links'
import { ASSETS_DIR, CACHE_DIR } from './paths'

interface Asset {
  file: string
  svg: string
}

export const ALT =
  "Joel D'Lima — Electronics and Computer Engineering. Capability, selected work, " +
  'track record, and live GitHub telemetry.'

export function renderAll() {
  const snap = loadSnapshot()
  fs.mkdirSync(ASSETS_DIR, { recursive: true })

  const assets: Asset[] = []

  // One tree, two themes: colour is resolved through context at render time,
  // so the layout is guaranteed identical between the light and dark files.
  const poster = buildPoster(snap)

  for (const theme of [themes.dark, themes.light]) {
    assets.push({
      file: `profile-${theme.name}.svg`,
      svg: renderPoster(poster.node, {
        theme,
        height: poster.height,
        title: "Joel D'Lima — Electronics and Computer Engineering",
        desc: describe(snap),
      }),
    })
  }

  for (const link of LINKS) {
    assets.push({
      file: `badge-${link.key}.svg`,
      svg: renderBadgeAsset(themes.dark, link.label, link.handle),
    })
  }

  let total = 0
  for (const asset of assets) {
    fs.writeFileSync(path.join(ASSETS_DIR, asset.file), asset.svg)
    total += asset.svg.length
    console.log(`  ${asset.file.padEnd(24)} ${kb(asset.svg.length).padStart(9)}`)
  }
  console.log(`  ${'—'.repeat(24)} ${kb(total).padStart(9)}`)

  writePreview(assets)
  console.log(`\n  preview → ${path.join(CACHE_DIR, 'preview.html')}`)
}

function describe(snap: Snapshot) {
  return (
    'Firmware on the board, the API in between, the interface people touch. ' +
    `${snap.user.publicRepos} public repositories, CGPA 9.7 of 10, four hackathon placements. ` +
    'Currently a Software Engineering Intern at Visteon. ' +
    'Sections: capability, selected work, track record, telemetry, contact.'
  )
}

const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

/**
 * The clickable row under the poster. Drawn in the same spectrum rather than in
 * each service's brand colour, so the README still reads as one object.
 */
function renderBadgeAsset(theme: Theme, label: string, handle: string) {
  const height = 30
  const padX = 13
  const width = Math.round(measureMono(label, t.bodyS, 0.3) + padX * 2 + 18)
  return renderBadge(<Badge label={label} width={width} height={height} />, {
    theme,
    width,
    height,
    title: `${label} — ${handle}`,
  })
}

function Badge({ label, width, height }: { label: string; width: number; height: number }) {
  const theme = useTheme()
  return (
    <>
      <rect width={width} height={height} rx={radius.chip} fill={theme.surface} />
      <rect width={width} height={height} rx={radius.chip} fill="url(#badgeSweep)" opacity={0.15} />
      <rect
        x={0.75}
        y={0.75}
        width={width - 1.5}
        height={height - 1.5}
        rx={radius.chip}
        fill="none"
        stroke="url(#badgeSweep)"
        strokeWidth={1.5}
      />
      <circle cx={15} cy={height / 2} r={3.5} fill="url(#badgeSweep)" />
      <Mono
        x={28}
        y={centerBaseline(0, height, t.bodyS)}
        size={t.bodyS}
        weight="monoBold"
        fill={theme.ink}
        track={0.3}
      >
        {label}
      </Mono>
    </>
  )
}

// ---------------------------------------------------------------------------
// Preview
// ---------------------------------------------------------------------------

/**
 * A local page showing both themes on GitHub's own backgrounds. Viewing an SVG
 * in isolation hides exactly the problems that matter: contrast against the
 * page, and how the poster reads at the width a README actually renders it.
 */
function writePreview(assets: Asset[]) {
  const badges = assets
    .filter((a) => a.file.startsWith('badge-'))
    .map((a) => `<img src="../assets/${a.file}" alt="" height="30">`)
    .join(' ')

  const pane = (theme: 'dark' | 'light') => `
    <section class="${theme}">
      <h2>github ${theme}</h2>
      <img src="../assets/profile-${theme}.svg" alt="${ALT}">
      <p class="badges">${badges}</p>
    </section>`

  const html = `<!doctype html><meta charset="utf-8"><title>profile preview</title>
<style>
  body{margin:0;font:13px ui-monospace,Menlo,Consolas,monospace}
  section{padding:34px 20px 70px}
  .dark{background:#0d1117;color:#8b949e}
  .light{background:#fff;color:#57606a}
  h2{font-size:10px;letter-spacing:.16em;text-transform:uppercase;margin:0 0 14px;opacity:.7}
  img{max-width:900px;width:100%;display:block}
  .badges{margin:14px 0 0;display:flex;gap:8px;flex-wrap:wrap}
  .badges img{width:auto;display:inline-block}
</style>
${pane('dark')}
${pane('light')}`

  fs.mkdirSync(CACHE_DIR, { recursive: true })
  fs.writeFileSync(path.join(CACHE_DIR, 'preview.html'), html)
}
