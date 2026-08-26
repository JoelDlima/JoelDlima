/**
 * Bench status card — simplified.
 *
 * No day counters. Just the role, graduation year, and contribution count.
 */
import { MARGIN, W, CONTENT, type as t } from '../design/tokens'
import { Mono, round } from '../design/text'
import { Label, Figure } from '../design/primitives'
import { useTheme } from '../design/render'
import type { Snapshot } from '../data/github'

export const NOW_H = 190

export function NowCard({ snap }: { snap: Snapshot }) {
  const theme = useTheme()

  const colW = CONTENT / 2
  const colX = [MARGIN, MARGIN + colW]
  const figY = 90

  return (
    <>
      <Label y={28} text="bench status" meta="auto-updates daily" />

      {/* Panel separator */}
      <rect
        x={round(MARGIN + colW - 14)}
        y={62}
        width={1}
        height={NOW_H - 100}
        fill={theme.line}
        opacity={theme.lineOpacity}
      />

      <g className="rise" style={{ animationDelay: '60ms' }}>
        <Mono
          x={colX[0]!}
          y={figY}
          size={t.lead}
          fill={theme.ink}
          weight="monoBold"
        >
          software intern · visteon
        </Mono>
        <Mono
          x={colX[0]!}
          y={figY + 30}
          size={t.bodyS}
          fill={theme.inkFaint}
          track={0.5}
        >
          graduating july 2027
        </Mono>
      </g>

      <g className="rise" style={{ animationDelay: '130ms' }}>
        <Figure
          x={colX[1]!}
          y={figY}
          value={String(snap.totals.contributionsYear)}
          caption={`contributions · 12mo`}
          size={40}
        />
        <Mono x={colX[1]!} y={figY + 66} size={t.micro} fill={theme.inkFaint}>
          {`streak ${snap.totals.currentStreak}d current · ${snap.totals.longestStreak}d best`}
        </Mono>
      </g>

      <Mono x={MARGIN} y={NOW_H - 18} size={t.tiny} fill={theme.inkFaint} track={0.5}>
        {'snapshot ' + snap.generatedAt.slice(0, 10)}
      </Mono>

      <rect x={W - MARGIN - 6} y={NOW_H - 24} width={6} height={6} rx={1} fill={theme.accent} opacity={0.85} />
    </>
  )
}
