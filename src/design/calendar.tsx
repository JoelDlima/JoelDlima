/**
 * Shared contribution-calendar machinery: cell layout, the chronological
 * commit-day route, and the travelling three-segment snake.
 *
 * Two consumers: the telemetry section of the main poster, and the standalone
 * snake card the README embeds as its own element. One implementation means
 * the two can never disagree about where a day sits or which way the snake
 * faces.
 *
 * Orientation note, measured rather than assumed (getCTM sampling): a more
 * negative SMIL `begin` sits FURTHER ALONG the path at any instant, so the
 * offsets here are assigned back-to-front — the largest, brightest segment
 * carries the most-negative begin and leads. Flip it and the snake swims
 * tail-first: bright dot dragging behind, faint dots pointing the way.
 */
import { useTheme } from './render'
import { Mono } from './text'
import { type as t } from './tokens'
import type { Snapshot } from '../data/github'

// Grid spans the full content width: 53 columns across CONTENT.
export const CELL = 10.5
export const GAP = 2.5
export const STEP = CELL + GAP
export const ROWS = 7
/** Rendered height of one full calendar: seven rows of stepped cells. */
export const GRID_H = ROWS * STEP - GAP

export interface CalendarCell {
  date: string
  count: number
  col: number
  row: number
  cx: number
  cy: number
}

const r1 = (n: number) => Math.round(n * 10) / 10

/** Places every day of the snapshot's calendar at `x,y` in column-major order. */
export function layoutCalendar(
  snap: Snapshot,
  x: number,
  y: number,
): { cells: CalendarCell[]; max: number } {
  const max = Math.max(1, ...snap.calendar.map((d) => d.count))
  const cells = snap.calendar.map((day, i) => {
    const col = Math.floor(i / ROWS)
    const row = i % ROWS
    return { ...day, col, row, cx: r1(x + col * STEP + CELL / 2), cy: r1(y + row * STEP + CELL / 2) }
  })
  return { cells, max }
}

function bandOf(count: number, max: number): number {
  if (count <= 0) return 0
  if (max <= 0) return 1
  return Math.min(4, 1 + Math.floor((count / max) * 3))
}

/**
 * The calendar itself: every cell, the dashed static route through the days
 * that had commits, and — unless declined — the snake travelling that route.
 */
export function ContributionCalendar({
  cells,
  max,
  delay,
  snakeDur = '17s',
}: {
  cells: CalendarCell[]
  max: number
  /** Entrance stagger base, milliseconds. */
  delay: number
  snakeDur?: string
}) {
  const theme = useTheme()
  const lit = cells.filter((c) => c.count > 0)
  const routeD =
    lit.length >= 2 ? `M${lit.map((c) => `${r1(c.cx)} ${r1(c.cy)}`).join('L')}` : null

  return (
    <>
      {cells.map((c, i) => (
        <rect
          key={c.date}
          x={r1(c.cx - CELL / 2)}
          y={r1(c.cy - CELL / 2)}
          width={CELL}
          height={CELL}
          rx={1.5}
          fill={c.count > 0 ? theme.accent : theme.ink}
          fillOpacity={c.count > 0 ? [0, 0.32, 0.52, 0.74, 1][bandOf(c.count, max)] : 0.08}
          className={c.count > 0 ? 'ignite' : undefined}
          style={c.count > 0 ? { animationDelay: `${delay + Math.min(i, 120) * 4}ms` } : undefined}
        />
      ))}

      {routeD && (
        <path
          d={routeD}
          fill="none"
          stroke={theme.accent}
          strokeWidth={1}
          strokeOpacity={0.35}
          strokeDasharray="1 3"
          strokeLinecap="round"
        />
      )}
      {routeD && <Snake pathD={routeD} dur={snakeDur} />}
    </>
  )
}

/** Three segments on one motion path — reads as a body, not a dot. */
export function Snake({ pathD, dur = '17s' }: { pathD: string; dur?: string }) {
  const theme = useTheme()
  const segments = [
    { begin: '-1.1s', size: 6, opacity: 1 },
    { begin: '-0.55s', size: 4.8, opacity: 0.7 },
    { begin: '0s', size: 3.7, opacity: 0.42 },
  ]
  return (
    <>
      {segments.map((seg, i) => (
        <rect
          key={i}
          x={-seg.size / 2}
          y={-seg.size / 2}
          width={seg.size}
          height={seg.size}
          rx={1}
          fill={theme.accent}
          opacity={seg.opacity}
        >
          <animateMotion dur={dur} begin={seg.begin} repeatCount="indefinite" rotate="auto" path={pathD} />
        </rect>
      ))}
    </>
  )
}

/** less ▢▢▢▢▢ more — the intensity key beneath the grid. */
export function CalendarLegend({ x, y }: { x: number; y: number }) {
  const theme = useTheme()
  const swatchOpacity = [0.08, 0.32, 0.52, 0.74, 1]
  return (
    <g>
      <Mono x={x} y={y + 4} size={t.tiny} fill={theme.inkFaint}>
        less
      </Mono>
      {swatchOpacity.map((o, i) => (
        <rect
          key={i}
          x={x + 26 + i * 12}
          y={y - 6}
          width={8}
          height={8}
          rx={1.5}
          fill={i === 0 ? theme.ink : theme.accent}
          fillOpacity={o}
        />
      ))}
      <Mono x={x + 26 + swatchOpacity.length * 12 + 6} y={y + 4} size={8.5} fill={theme.inkFaint}>
        more
      </Mono>
    </g>
  )
}
