import * as React from 'react'
import { MARGIN, W, CONTENT, type as t, tracking } from '../design/tokens'
import { Mono, round } from '../design/text'
import { SectionHead, HEAD_H, Figure, SpectralBand, spectralBandHeight, Rule } from '../design/primitives'
import { useTheme, SPECTRUM } from '../design/render'
import type { Snapshot } from '../data/github'
import type { Section } from './types'

const AFTER_HEAD = 34
const BAND_H = 13
const TOP_LANGS = 6

/**
 * Language mix, weighted by bytes, excluding markup and build config.
 *
 * Counting HTML and CSS as "languages written" flatters everyone equally and
 * tells a reader nothing about what someone actually programs in.
 */
const NOT_A_LANGUAGE = new Set([
  'HTML', 'CSS', 'SCSS', 'Sass', 'Less', 'MDX', 'TeX', 'Roff', 'CMake', 'Makefile',
  'Dockerfile', 'Batchfile', 'Procfile', 'Nix', 'Jupyter Notebook', 'EJS', 'Handlebars',
  'Pug', 'Blade', 'Mustache', 'Vim Script', 'Gnuplot', 'RTF', 'Shell', 'PowerShell',
])

export function languageMix(snap: Snapshot) {
  const entries = Object.entries(snap.languages)
    .filter(([name]) => !NOT_A_LANGUAGE.has(name))
    .sort((a, b) => b[1] - a[1])
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0) || 1
  const top = entries.slice(0, TOP_LANGS)
  const rest = total - top.reduce((sum, [, bytes]) => sum + bytes, 0)
  const segments = top.map(([name, bytes]) => ({
    label: name.toLowerCase(),
    pct: bytes / total,
    value: `${((bytes / total) * 100).toFixed(0)}%`,
  }))
  if (rest > 0) {
    segments.push({ label: 'other', pct: rest / total, value: `${((rest / total) * 100).toFixed(0)}%` })
  }
  // `count` is the real number of languages, which is not segments.length —
  // that only equals it when nothing spilled into an "other" bucket.
  return { segments, total, count: entries.length }
}

/**
 * Telemetry, read straight from the GitHub API.
 *
 * Contribution streaks and a heatmap are the obvious things to put here and are
 * deliberately absent: Joel commits in bursts and most of his work sits in
 * private repos, so a 12-month grid renders as a near-empty field and reads as
 * inactivity rather than as the missing data it actually is. Volume of code,
 * language mix and recent pushes are all measurable and all honest.
 */
export const telemetry: Section = ({ y, snap, delay, index }) => {
  const { segments } = languageMix(snap)
  // Clears the figure captions above. At +78 the band's own label collided
  // with them, which only shows up once a caption is long enough to reach it.
  const bandTop = y + HEAD_H + AFTER_HEAD + 112
  const bandH = spectralBandHeight(segments.length, BAND_H)
  const pushesTop = bandTop + bandH + 34
  const height = pushesTop + 4 * 19 + 6 - y

  return {
    node: (
      <Telemetry
        y={y}
        snap={snap}
        delay={delay}
        index={index}
        segments={segments}
        bandTop={bandTop}
        pushesTop={pushesTop}
      />
    ),
    height,
  }
}

function Telemetry({
  y,
  snap,
  delay,
  index,
  segments,
  bandTop,
  pushesTop,
}: {
  y: number
  snap: Snapshot
  delay: number
  index: string
  segments: { label: string; pct: number; value: string }[]
  bandTop: number
  pushesTop: number
}) {
  const theme = useTheme()
  const { total, count } = languageMix(snap)
  const own = snap.repos.filter((r) => !r.isFork)

  const figures = [
    { value: formatBytes(total), caption: 'source written' },
    { value: String(own.length), caption: 'repositories' },
    { value: String(count), caption: 'languages' },
    { value: String(snap.user.followers), caption: 'followers' },
  ]

  const recent = [...own]
    .sort((a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt))
    .slice(0, 4)

  const figTop = y + HEAD_H + AFTER_HEAD + 34
  const colW = CONTENT / figures.length

  return (
    <>
      <g className="fade" style={{ animationDelay: `${delay}ms` }}>
        <SectionHead
          y={y}
          label="telemetry"
          meta={`generated ${snap.generatedAt.slice(0, 10)}`}
          index={index}
        />
      </g>

      {/* Headline figures */}
      {figures.map((fig, i) => (
        <g key={fig.caption} className="rise" style={{ animationDelay: `${delay + 70 + i * 60}ms` }}>
          <Figure
            x={MARGIN + i * colW}
            y={figTop}
            value={fig.value}
            caption={fig.caption}
            size={t.figureL}
          />
          {i > 0 && (
            <rect
              x={round(MARGIN + i * colW - 20)}
              y={figTop - 30}
              width={1}
              height={44}
              fill={theme.line}
              opacity={theme.lineOpacity}
            />
          )}
        </g>
      ))}

      {/* Language mix as one band being split, not as separate bars */}
      <g className="fade" style={{ animationDelay: `${delay + 260}ms` }}>
        <Mono
          x={MARGIN}
          y={bandTop - 14}
          size={t.tiny}
          weight="monoBold"
          fill={theme.inkFaint}
          track={tracking.label}
        >
          LANGUAGE MIX · BY BYTES
        </Mono>
        <Mono
          x={W - MARGIN}
          y={bandTop - 14}
          size={t.tiny}
          fill={theme.inkFaint}
          anchor="end"
          track={tracking.micro}
        >
          markup and build config excluded
        </Mono>
      </g>
      <SpectralBand
        x={MARGIN}
        y={bandTop}
        w={CONTENT}
        h={BAND_H}
        segments={segments}
        delay={delay + 300}
      />

      {/* Recent pushes */}
      <g className="fade" style={{ animationDelay: `${delay + 380}ms` }}>
        <Rule y={pushesTop - 22} opacity={theme.lineOpacity * 0.7} />
        <Mono
          x={MARGIN}
          y={pushesTop - 4}
          size={t.tiny}
          weight="monoBold"
          fill={theme.inkFaint}
          track={tracking.label}
        >
          RECENT PUSHES
        </Mono>
        {recent.map((repo, i) => {
          const ry = pushesTop + 18 + i * 19
          return (
            <React.Fragment key={repo.name}>
              <rect x={MARGIN} y={ry - 5} width={4} height={4} rx={1} fill={SPECTRUM} opacity={0.9} />
              <Mono x={MARGIN + 14} y={ry} size={t.bodyS} fill={theme.inkMuted}>
                {repo.name.toLowerCase()}
              </Mono>
              <Mono x={MARGIN + 250} y={ry} size={t.tiny} fill={theme.inkFaint}>
                {(repo.language ?? '—').toLowerCase()}
              </Mono>
              <Mono
                x={W - MARGIN}
                y={ry}
                size={t.tiny}
                fill={theme.inkFaint}
                anchor="end"
                track={tracking.micro}
              >
                {relativeDate(repo.pushedAt, snap.generatedAt)}
              </Mono>
            </React.Fragment>
          )
        })}
      </g>
    </>
  )
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)}MB`
  if (bytes >= 1_000) return `${Math.round(bytes / 1_000)}KB`
  return String(bytes)
}

function relativeDate(iso: string, nowIso: string): string {
  const days = Math.floor((Date.parse(nowIso) - Date.parse(iso)) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`
  const years = Math.floor(days / 365)
  return `${years} year${years === 1 ? '' : 's'} ago`
}
