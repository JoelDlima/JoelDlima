/**
 * The component vocabulary. Every section is composed from these, so a change
 * here propagates across the whole poster — that consistency is what lets each
 * section use a different layout without the page falling apart.
 */
import * as React from 'react'
import { MARGIN, W, CONTENT, radius, tracking, type as t, type Theme } from './tokens'
import { Mono, Display, measureMono, centerBaseline, round } from './text'
import { useTheme, SPECTRUM, SPECTRUM_H } from './render'

/** x of the vertical spine that runs the full height of the poster. */
export const SPINE_X = 24

// ---------------------------------------------------------------------------
// Rules and structure
// ---------------------------------------------------------------------------

export function Rule({
  y,
  x = MARGIN,
  w = CONTENT,
  opacity,
}: {
  y: number
  x?: number
  w?: number
  opacity?: number
}) {
  const theme = useTheme()
  return (
    <rect x={x} y={y} width={w} height={1} fill={theme.line} opacity={opacity ?? theme.lineOpacity} />
  )
}

/** A rule painted in the travelling spectrum, growing in from the left. */
export function SpectrumRule({
  y,
  x = MARGIN,
  w = CONTENT,
  h = 2,
}: {
  y: number
  x?: number
  w?: number
  h?: number
}) {
  return (
    <g className="grow">
      <rect x={x} y={y} width={w} height={h} fill={SPECTRUM_H} />
    </g>
  )
}

/**
 * Section header: a tracked label on the left, optional meta on the right, and
 * a hairline beneath. Repeated at every section so the eye can find the seams
 * without each section having to announce itself loudly.
 */
export function SectionHead({
  y,
  label,
  meta,
  index,
}: {
  y: number
  label: string
  meta?: string
  /** Two-digit section number, printed ahead of the label as an index. */
  index?: string
}) {
  const theme = useTheme()
  const numberW = index ? measureMono(index, t.label, tracking.sectionLabel) + 14 : 0
  return (
    <>
      {/* Marker on the spine, so section starts are findable from the margin. */}
      <rect x={SPINE_X - 3} y={y - 7} width={7} height={7} fill={SPECTRUM} />
      {index && (
        <Mono
          x={MARGIN}
          y={y}
          size={t.label}
          weight="monoBold"
          fill={SPECTRUM}
          track={tracking.sectionLabel}
        >
          {index}
        </Mono>
      )}
      <Mono
        x={MARGIN + numberW}
        y={y}
        size={t.label}
        weight="monoBold"
        fill={theme.inkFaint}
        track={tracking.sectionLabel}
      >
        {label.toUpperCase()}
      </Mono>
      {meta && (
        <Mono x={W - MARGIN} y={y} size={t.micro} fill={theme.inkFaint} anchor="end" track={tracking.micro}>
          {meta}
        </Mono>
      )}
      <Rule y={y + 13} />
    </>
  )
}

/** Height consumed by a SectionHead, from its label baseline to its rule. */
export const HEAD_H = 13

/** Leader dots between two x positions — the catalogue-index texture. */
export function DotLeader({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  const theme = useTheme()
  const gap = 5
  const count = Math.max(0, Math.floor((x2 - x1) / gap))
  return (
    <g fill={theme.inkFaint} opacity={0.5}>
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} cx={round(x1 + i * gap)} cy={y} r={0.75} />
      ))}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Chips
// ---------------------------------------------------------------------------

const CHIP_PAD = 9
const CHIP_H = 22

export function chipWidth(label: string, size = t.bodyS) {
  return measureMono(label, size, 0) + CHIP_PAD * 2
}

export function Chip({
  x,
  y,
  label,
  delay = 0,
  accent = false,
}: {
  x: number
  y: number
  label: string
  delay?: number
  /** Draws the border in the spectrum instead of the hairline colour. */
  accent?: boolean
}) {
  const theme = useTheme()
  const w = chipWidth(label)
  return (
    <g className="ignite" style={{ animationDelay: `${delay}ms` }}>
      <rect
        x={x}
        y={y}
        width={round(w)}
        height={CHIP_H}
        rx={radius.chip}
        fill={theme.surface}
        stroke={accent ? SPECTRUM : theme.line}
        strokeOpacity={accent ? 0.85 : theme.lineOpacity * 2}
        strokeWidth={1}
      />
      <Mono
        x={x + CHIP_PAD}
        y={centerBaseline(y, CHIP_H, t.bodyS)}
        size={t.bodyS}
        fill={theme.inkMuted}
      >
        {label}
      </Mono>
    </g>
  )
}

/**
 * Flows chips across a width, wrapping as needed, and reports the height used.
 * Widths come from the monospace advance, so nothing can overflow regardless of
 * what gets added to the stack later.
 */
export function chipFlow(
  labels: string[],
  opts: { x: number; y: number; maxW: number; delay?: number; step?: number; accentEvery?: number },
) {
  const gap = 7
  const lineH = CHIP_H + gap
  const nodes: React.ReactNode[] = []
  let cx = opts.x
  let cy = opts.y
  labels.forEach((label, i) => {
    const w = chipWidth(label)
    if (cx + w > opts.x + opts.maxW && cx > opts.x) {
      cx = opts.x
      cy += lineH
    }
    nodes.push(
      <Chip
        key={label + i}
        x={cx}
        y={cy}
        label={label}
        delay={(opts.delay ?? 0) + i * (opts.step ?? 26)}
        accent={opts.accentEvery ? i % opts.accentEvery === 0 : false}
      />,
    )
    cx += w + gap
  })
  return { nodes, height: cy - opts.y + CHIP_H }
}

// ---------------------------------------------------------------------------
// Figures and proportion
// ---------------------------------------------------------------------------

/** A headline number in the display face, with its caption beneath. */
export function Figure({
  x,
  y,
  value,
  caption,
  size = t.figureXL,
  anchor = 'start',
  spectrum = true,
}: {
  x: number
  y: number
  value: string
  caption: string
  size?: number
  anchor?: 'start' | 'end'
  spectrum?: boolean
}) {
  const theme = useTheme()
  return (
    <>
      <Display x={x} y={y} size={size} fill={spectrum ? SPECTRUM : theme.ink} anchor={anchor}>
        {value}
      </Display>
      <Mono
        x={x}
        y={y + 21}
        size={t.micro}
        fill={theme.inkFaint}
        anchor={anchor}
        track={tracking.micro}
      >
        {caption}
      </Mono>
    </>
  )
}

/** label · track+fill · value — the standard proportion row. */
export function BarRow({
  x,
  y,
  labelW,
  barW,
  label,
  pct,
  value,
  delay = 0,
}: {
  x: number
  y: number
  labelW: number
  barW: number
  label: string
  /** 0..1 */
  pct: number
  value: string
  delay?: number
}) {
  const theme = useTheme()
  const h = 7
  const barX = x + labelW
  const filled = Math.max(h, barW * Math.min(1, Math.max(0, pct)))
  return (
    <>
      <Mono x={x} y={y + 6} size={t.bodyS} fill={theme.inkMuted}>
        {label}
      </Mono>
      <rect x={barX} y={y} width={barW} height={h} rx={radius.bar} fill={theme.ink} opacity={0.09} />
      <rect
        className="grow"
        style={{ animationDelay: `${delay}ms` }}
        x={barX}
        y={y}
        width={round(filled)}
        height={h}
        rx={radius.bar}
        fill={SPECTRUM}
      />
      <Mono x={barX + barW + 14} y={y + 6} size={t.bodyS} fill={theme.inkFaint}>
        {value}
      </Mono>
    </>
  )
}

/**
 * One horizontal band divided proportionally, with leader lines down to labels.
 * Reads as a spectrum being split rather than as a row of separate bars, which
 * is the point — it is the same gradient the rest of the poster is painted in.
 */
export function SpectralBand({
  x,
  y,
  w,
  h,
  segments,
  delay = 0,
}: {
  x: number
  y: number
  w: number
  h: number
  segments: { label: string; pct: number; value: string }[]
  delay?: number
}) {
  const theme = useTheme()
  const gap = 2
  let cx = x
  const bars: React.ReactNode[] = []
  const legend: React.ReactNode[] = []

  segments.forEach((seg, i) => {
    const segW = Math.max(3, w * seg.pct - gap)
    bars.push(
      <rect
        key={`b${i}`}
        x={round(cx)}
        y={y}
        width={round(segW)}
        height={h}
        rx={radius.bar}
        fill={SPECTRUM}
        opacity={1 - i * 0.11}
      />,
    )
    cx += segW + gap
  })

  // Legend below, in two columns so long stacks stay compact.
  const perCol = Math.ceil(segments.length / 2)
  segments.forEach((seg, i) => {
    const col = Math.floor(i / perCol)
    const row = i % perCol
    const lx = x + col * (w / 2)
    const ly = y + h + 26 + row * 17
    legend.push(
      <React.Fragment key={`l${i}`}>
        <rect x={lx} y={ly - 6} width={7} height={7} rx={1.5} fill={SPECTRUM} opacity={1 - i * 0.11} />
        <Mono x={lx + 14} y={ly} size={t.bodyS} fill={theme.inkMuted}>
          {seg.label}
        </Mono>
        <Mono x={lx + w / 2 - 26} y={ly} size={t.bodyS} fill={theme.inkFaint} anchor="end">
          {seg.value}
        </Mono>
      </React.Fragment>,
    )
  })

  return (
    <>
      <g className="grow" style={{ animationDelay: `${delay}ms` }}>
        {bars}
      </g>
      {legend}
    </>
  )
}

export function spectralBandHeight(count: number, h: number) {
  return h + 26 + Math.ceil(count / 2) * 17 - 6
}

// ---------------------------------------------------------------------------
// Marks
// ---------------------------------------------------------------------------

/** A small spectrum dot with a breathing halo — used for "live" states. */
export function Blip({ x, y, r = 3.5 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle className="blip" cx={x} cy={y} r={r * 2.6} fill={SPECTRUM} />
      <circle cx={x} cy={y} r={r} fill={SPECTRUM} />
    </g>
  )
}

/** A tick scale, like the graduations on an instrument face. */
export function TickScale({
  x,
  y,
  w,
  count = 40,
  height = 5,
}: {
  x: number
  y: number
  w: number
  count?: number
  height?: number
}) {
  const theme = useTheme()
  const step = w / count
  return (
    <g fill={theme.inkFaint}>
      {Array.from({ length: count + 1 }, (_, i) => (
        <rect
          key={i}
          x={round(x + i * step)}
          y={y}
          width={1}
          height={i % 5 === 0 ? height : height * 0.5}
          opacity={i % 5 === 0 ? 0.55 : 0.3}
        />
      ))}
    </g>
  )
}

/** Vertical spine running the full poster height, painted in the spectrum. */
export function Spine({ top, bottom, theme }: { top: number; bottom: number; theme: Theme }) {
  return (
    <>
      <rect x={SPINE_X} y={top} width={1} height={bottom - top} fill={theme.ink} opacity={0.1} />
      <rect x={SPINE_X} y={top} width={1} height={bottom - top} fill={SPECTRUM} opacity={0.5} />
    </>
  )
}
