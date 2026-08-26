/**
 * Bench status card — the daily-changing panel.
 *
 * The honest equivalent of a moon-phase widget: three gauges driven by real
 * dates, not decoration. Internship progress is computed from the actual
 * appointment window at build time, so the nightly refresh advances it one
 * day; the graduation countdown counts to the real one; contributions come
 * from the live snapshot. Nothing here is a vanity number.
 */
import { MARGIN, W, CONTENT, type as t } from '../design/tokens'
import { Mono, round } from '../design/text'
import { Label, Figure, BarRow } from '../design/primitives'
import { useTheme } from '../design/render'
import type { Snapshot } from '../data/github'

export const NOW_H = 252

/** The appointment window, from the resume. Build-time dates only. */
const INTERNSHIP_START = new Date('2026-07-01T00:00:00Z')
const INTERNSHIP_END = new Date('2026-10-31T23:59:59Z')
const GRADUATION = new Date('2027-06-30T23:59:59Z')

const DAY = 86_400_000

export function NowCard({ snap }: { snap: Snapshot }) {
  const theme = useTheme()
  const now = new Date()

  // Column geometry — three equal panels with hairline separators.
  const colW = CONTENT / 3
  const colX = [MARGIN, MARGIN + colW, MARGIN + colW * 2]
  const figY = 104

  // Internship gauge: countdown before, fraction during, done after.
  const internship =
    now < INTERNSHIP_START
      ? {
          value: String(Math.ceil((INTERNSHIP_START.getTime() - now.getTime()) / DAY)),
          unit: 'd',              caption: 'until visteon · jul 26',
          pct: 0,
          barCaption: 'not started',
        }
      : now <= INTERNSHIP_END
        ? (() => {
            const total = Math.round((INTERNSHIP_END.getTime() - INTERNSHIP_START.getTime()) / DAY)
            const day = Math.max(1, Math.ceil((now.getTime() - INTERNSHIP_START.getTime()) / DAY))
            return {
              value: String(day),
              unit: `/${total}`,
              caption: 'visteon · day',
              pct: day / total,
              barCaption: 'automotive embedded · in progress',
            }
          })()
        : {
            value: 'done',
            unit: '',
            caption: 'visteon · oct 26',
            pct: 1,
            barCaption: 'completed',
          }

  const daysToGrad = Math.max(0, Math.ceil((GRADUATION.getTime() - now.getTime()) / DAY))

  return (
    <>
      <Label y={28} text="bench status" meta="auto-updates daily" />

      {/* Panel separators */}
      {[1, 2].map((i) => (
        <rect
          key={i}
          x={round(MARGIN + colW * i - 14)}
          y={62}
          width={1}
          height={NOW_H - 104}
          fill={theme.line}
          opacity={theme.lineOpacity}
        />
      ))}

      <g className="rise" style={{ animationDelay: '60ms' }}>
        <Figure x={colX[0]!} y={figY} value={internship.value} unit={internship.unit} caption={internship.caption} size={40} />
        <BarRow x={colX[0]!} y={figY + 40} w={colW - 56} pct={internship.pct} delay={200} />
        <Mono x={colX[0]!} y={figY + 66} size={t.micro} fill={theme.inkFaint}>
          {internship.barCaption}
        </Mono>
      </g>

      <g className="rise" style={{ animationDelay: '130ms' }}>
        <Figure x={colX[1]!} y={figY} value={String(daysToGrad)} unit="d" caption="graduation · class '27" size={40} accent />
      </g>

      <g className="rise" style={{ animationDelay: '200ms' }}>
        <Figure x={colX[2]!} y={figY} value={String(snap.totals.contributionsYear)} caption={`contributions · 12mo`} size={40} />
        <Mono x={colX[2]!} y={figY + 66} size={t.micro} fill={theme.inkFaint}>
          {`streak ${snap.totals.currentStreak}d current · ${snap.totals.longestStreak}d best`}
        </Mono>
      </g>

      <Mono x={MARGIN} y={NOW_H - 18} size={t.tiny} fill={theme.inkFaint} track={0.5}>
        {'dates local to the build machine · snapshot ' + snap.generatedAt.slice(0, 10)}
      </Mono>

      <rect x={W - MARGIN - 6} y={NOW_H - 24} width={6} height={6} rx={1} fill={theme.accent} opacity={0.85} />
    </>
  )
}
