/**
 * Contribution snake card — the classic element, in the workbench language.
 *
 * The real calendar from the snapshot, and a three-segment amber snake that
 * travels only over days that actually had commits (route built from those
 * cells' centres, in chronological order). This is its own small SVG rather
 * than a section of a big poster so the README carries it as a discrete
 * element — the thing people actually ask for by name.
 */
import { MARGIN, W, type as t } from '../design/tokens'
import { Mono, round } from '../design/text'
import { Label } from '../design/primitives'
import { layoutCalendar, ContributionCalendar, CalendarLegend, GRID_H } from '../design/calendar'
import { useTheme } from '../design/render'
import type { Snapshot } from '../data/github'

const GRID_Y = 58

export function snakeCardHeight(): number {
  return GRID_Y + GRID_H + 40
}

export function SnakeCard({ snap }: { snap: Snapshot }) {
  const theme = useTheme()
  const { cells, max } = layoutCalendar(snap, MARGIN, GRID_Y)
  const footY = GRID_Y + GRID_H + 24

  return (
    <>
      <Label y={28} text="contribution snake" meta="trailing 12 months" />

      <g className="fade">
        <ContributionCalendar cells={cells} max={max} delay={120} snakeDur="15s" />
      </g>

      <g className="fade">
        <CalendarLegend x={MARGIN} y={footY} />
        <Mono x={W - MARGIN} y={footY + 4} size={t.tiny} fill={theme.inkFaint} anchor="end">
          {`${snap.calendar.length} days · rebuilt daily from the github api`}
        </Mono>
      </g>

      {/* keyed pin: one accent square marking the card's live edge */}
      <rect x={round(W - MARGIN - 6)} y={footY - 12} width={6} height={6} rx={1} fill={theme.accent} opacity={0.85} />
    </>
  )
}
