import { MARGIN, W, CONTENT, type as t, tracking } from '../design/tokens'
import { Mono, round } from '../design/text'
import { SectionHead, HEAD_H, Figure } from '../design/primitives'
import { useTheme, SPECTRUM } from '../design/render'
import type { Snapshot } from '../data/github'
import type { Section } from './types'

const AFTER_HEAD = 34
const CELL = 8
const GAP = 2.5
const STEP = CELL + GAP
const ROWS = 7

/**
 * Telemetry: streaks, the contribution calendar, and a route drawn through the
 * days that actually had commits.
 *
 * An earlier version of this section led with language-mix percentages and
 * byte counts instead of the calendar — measurable, but not what anyone asked
 * for. This is the grid and the streak figures GitHub's own profile shows,
 * rebuilt from the same daily data already sitting in data/github.json.
 */
export const telemetry: Section = ({ y, snap, delay, index }) => {
  const figTop = y + HEAD_H + AFTER_HEAD + 30
  const gridY = figTop + 40
  const gridH = ROWS * STEP - GAP
  const legendY = gridY + gridH + 22
  const height = legendY + 14 - y

  return {
    node: <Telemetry y={y} snap={snap} delay={delay} index={index} figTop={figTop} gridY={gridY} legendY={legendY} />,
    height,
  }
}

function Telemetry({
  y,
  snap,
  delay,
  index,
  figTop,
  gridY,
  legendY,
}: {
  y: number
  snap: Snapshot
  delay: number
  index: string
  figTop: number
  gridY: number
  legendY: number
}) {
  const theme = useTheme()
  const own = snap.repos.filter((r) => !r.isFork)

  const figures = [
    { value: String(snap.totals.contributionsYear), caption: 'contributions · 12mo' },
    { value: String(snap.totals.longestStreak), unit: 'd', caption: 'longest streak' },
    { value: String(snap.totals.currentStreak), unit: 'd', caption: 'current streak' },
    { value: String(own.length), caption: 'repositories' },
  ]
  const colW = CONTENT / figures.length

  return (
    <>
      <g className="fade" style={{ animationDelay: `${delay}ms` }}>
        <SectionHead y={y} label="telemetry" index={index} />
      </g>

      {figures.map((fig, i) => (
        <g key={fig.caption} className="rise" style={{ animationDelay: `${delay + 60 + i * 55}ms` }}>
          <Figure x={MARGIN + i * colW} y={figTop} value={fig.value} unit={fig.unit} caption={fig.caption} size={t.figureL} />
          {i > 0 && (
            <rect
              x={round(MARGIN + i * colW - 20)}
              y={figTop - 26}
              width={1}
              height={40}
              fill={theme.line}
              opacity={theme.lineOpacity}
            />
          )}
        </g>
      ))}

      <ContributionGrid snap={snap} x={MARGIN} y={gridY} delay={delay + 260} />

      <Legend x={MARGIN} y={legendY} />
      <Mono x={W - MARGIN} y={legendY + 4} size={t.tiny} fill={theme.inkFaint} anchor="end" track={tracking.micro}>
        {`${snap.calendar.length} days`}
      </Mono>
    </>
  )
}

// ---------------------------------------------------------------------------
// Grid + route
// ---------------------------------------------------------------------------

function bandOf(count: number, max: number): number {
  if (count <= 0) return 0
  if (max <= 0) return 1
  return Math.min(4, 1 + Math.floor((count / max) * 3))
}

function ContributionGrid({
  snap,
  x,
  y,
  delay,
}: {
  snap: Snapshot
  x: number
  y: number
  delay: number
}) {
  const theme = useTheme()
  const max = Math.max(1, ...snap.calendar.map((d) => d.count))

  const cells = snap.calendar.map((day, i) => {
    const col = Math.floor(i / ROWS)
    const row = i % ROWS
    return { ...day, col, row, cx: x + col * STEP + CELL / 2, cy: y + row * STEP + CELL / 2 }
  })

  const lit = cells.filter((c) => c.count > 0)
  const routeD = lit.length >= 2 ? `M${lit.map((c) => `${round(c.cx)} ${round(c.cy)}`).join('L')}` : null

  return (
    <g className="fade" style={{ animationDelay: `${delay}ms` }}>
      {cells.map((c, i) => (
        <rect
          key={c.date}
          x={round(x + c.col * STEP)}
          y={round(y + c.row * STEP)}
          width={CELL}
          height={CELL}
          rx={1.5}
          fill={c.count > 0 ? SPECTRUM : theme.ink}
          fillOpacity={c.count > 0 ? [0, 0.32, 0.52, 0.74, 1][bandOf(c.count, max)] : 0.08}
          className={c.count > 0 ? 'ignite' : undefined}
          style={c.count > 0 ? { animationDelay: `${delay + Math.min(i, 120) * 4}ms` } : undefined}
        />
      ))}

      {routeD && (
        <>
          {/* The static route: every commit day this year, connected in order. */}
          <path d={routeD} fill="none" stroke={SPECTRUM} strokeWidth={1} strokeOpacity={0.35} strokeDasharray="1 3" strokeLinecap="round" />
          {/* A three-segment snake travelling that same route, trailing itself
              via negative `begin` offsets on duplicate motion paths. */}
          <Snake pathD={routeD} />
        </>
      )}
    </g>
  )
}

/** Three trailing segments on one motion path — reads as a body, not a dot. */
function Snake({ pathD }: { pathD: string }) {
  const segments = [
    { begin: '0s', size: 4.5, opacity: 1 },
    { begin: '-0.55s', size: 3.6, opacity: 0.7 },
    { begin: '-1.1s', size: 2.8, opacity: 0.42 },
  ]
  return (
    <>
      {segments.map((seg, i) => (
        <rect key={i} x={-seg.size / 2} y={-seg.size / 2} width={seg.size} height={seg.size} rx={1} fill={SPECTRUM} opacity={seg.opacity}>
          <animateMotion dur="17s" begin={seg.begin} repeatCount="indefinite" rotate="auto" path={pathD} />
        </rect>
      ))}
    </>
  )
}

function Legend({ x, y }: { x: number; y: number }) {
  const theme = useTheme()
  const swatchOpacity = [0.08, 0.32, 0.52, 0.74, 1]
  return (
    <g>
      <Mono x={x} y={y + 4} size={t.tiny} fill={theme.inkFaint}>
        less
      </Mono>
      {swatchOpacity.map((o, i) => (
        <rect key={i} x={x + 26 + i * 12} y={y - 6} width={8} height={8} rx={1.5} fill={i === 0 ? theme.ink : SPECTRUM} fillOpacity={o} />
      ))}
      <Mono x={x + 26 + swatchOpacity.length * 12 + 6} y={y + 4} size={t.tiny} fill={theme.inkFaint}>
        more
      </Mono>
    </g>
  )
}
