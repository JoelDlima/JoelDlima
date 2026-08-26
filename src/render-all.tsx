/**
 * Renders every card in both themes plus the contact badges.
 *
 * Cards are separate SVGs on purpose — the README composes them as discrete
 * markdown-level elements (intro → work list → bench status → snake), each
 * with its own entrance cascade, rather than one tall poster. The README
 * picks dark/light per element with <picture> + prefers-color-scheme.
 */
import fs from 'node:fs'
import path from 'node:path'
import * as React from 'react'
import { renderCard, renderBadge, useTheme, BADGE_EDGE } from './design/render'
import { themes, type Theme, type as t } from './design/tokens'
import { Mono, measureMono, centerBaseline } from './design/text'
import { loadSnapshot } from './data/github'
import { INTRO_H, IntroCard } from './cards/intro'
import { WORK_H, WorkCard } from './cards/work'
import { NOW_H, NowCard } from './cards/now'
import { snakeCardHeight, SnakeCard } from './cards/snake-card'
import { LINKS } from './links'
import { ASSETS_DIR, CACHE_DIR } from './paths'

interface Asset {
  file: string
  svg: string
}

export const ALT_INTRO =
  "Joel D'Lima — Software Engineering Intern at Visteon. Embedded + full-stack."

export function renderAll() {
  const snap = loadSnapshot()
  fs.mkdirSync(ASSETS_DIR, { recursive: true })

  const assets: Asset[] = []

  // One tree per card, two themes each: colour resolves through context at
  // render time, so light and dark layouts cannot drift apart.
  const cards: { file: string; height: number; node: React.ReactElement; title: string; desc: string }[] = [
    {
      file: 'intro',
      height: INTRO_H,
      node: <IntroCard />,
      title: "Joel D'Lima — intro",
      desc: ALT_INTRO,
    },
    {
      file: 'work',
      height: WORK_H,
      node: <WorkCard />,
      title: "Joel D'Lima — projects",
      desc: 'Four selected projects with one-line descriptions.',
    },
    {
      file: 'now',
      height: NOW_H,
      node: <NowCard snap={snap} />,
      title: "Joel D'Lima — status",
      desc: 'Role, graduation, and trailing-year contributions.'
    },
    {
      file: 'snake',
      height: snakeCardHeight(),
      node: <SnakeCard snap={snap} />,
      title: "Joel D'Lima — contribution snake",
      desc: `A snake travelling the ${snap.totals.contributionsYear}-contribution trailing year.`,
    },
  ]

  for (const theme of [themes.dark, themes.light]) {
    for (const card of cards) {
      assets.push({
        file: `${card.file}-${theme.name}.svg`,
        svg: renderCard(card.node, {
          theme,
          height: card.height,
          title: card.title,
          desc: card.desc,
        }),
      })
    }
  }

  for (const link of LINKS) {
    assets.push({
      // `contact-` prefix, not `badge-`: the old violet-era badges shipped
      // under assets/badge-*.svg, and GitHub's camo proxy caches per-URL —
      // same name would keep serving the stale old design for hours.
      file: `contact-${link.key}.svg`,
      svg: renderBadgeAsset(themes.dark, link.label, link.handle),
    })
  }

  let total = 0
  for (const asset of assets) {
    fs.writeFileSync(path.join(ASSETS_DIR, asset.file), asset.svg)
    total += asset.svg.length
    console.log(`  ${asset.file.padEnd(22)} ${kb(asset.svg.length).padStart(9)}`)
  }
  console.log(`  ${'—'.repeat(22)} ${kb(total).padStart(9)}`)

  writePreview(cards)
  console.log(`\n  preview → ${path.join(CACHE_DIR, 'preview.html')}`)
}

const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

/** Clickable contact row under the hero. Amber edge, one palette, no brands. */
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
      <rect width={width} height={height} rx={4} fill={theme.surface} />
      <rect x={0.75} y={0.75} width={width - 1.5} height={height - 1.5} rx={3.5} fill="none" stroke={BADGE_EDGE} strokeWidth={1.5} />
      <rect x={11} y={height / 2 - 2.75} width={5.5} height={5.5} rx={1} fill={theme.accent} />
      <Mono x={24} y={centerBaseline(0, height, t.bodyS)} size={t.bodyS} weight="monoBold" fill={theme.ink} track={0.3}>
        {label}
      </Mono>
    </>
  )
}

// ---------------------------------------------------------------------------
// Preview
// ---------------------------------------------------------------------------

function writePreview(cards: { file: string; title: string }[]) {
  const badges = ['linkedin', 'portfolio', 'email']
    .map((k) => `<img src="../assets/contact-${k}.svg" alt="" height="30">`)
    .join(' ')

  const pane = (theme: 'dark' | 'light') => `
    <section class="${theme}">
      <h2>github ${theme}</h2>
      ${cards
        .map(
          (c) =>
            `<img src="../assets/${c.file}-${theme}.svg" alt="${c.title}" style="margin-bottom:18px">`,
        )
        .join('\n      ')}
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
  .badges{margin:6px 0 0;display:flex;gap:8px;flex-wrap:wrap}
  .badges img{width:auto;display:inline-block}
</style>
${pane('dark')}
${pane('light')}`

  fs.mkdirSync(CACHE_DIR, { recursive: true })
  fs.writeFileSync(path.join(CACHE_DIR, 'preview.html'), html)
}
