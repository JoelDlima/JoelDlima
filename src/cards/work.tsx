/**
 * Project index card — the selected-work section, in the workbench language.
 *
 * Six rows like a channel guide on a bench instrument: index number, project
 * name in bold mono, tag marker, one-line description. Replaces the generic
 * GitHub markdown table that used to sit here — the README carries links in
 * the markdown layer beneath the card, because links inside an SVG behind
 * <img> are inert (see NOTES.md).
 */
import { MARGIN, W, CONTENT, type as t, tracking } from '../design/tokens'
import { Mono, Display, wrapMono, round } from '../design/text'
import { Label, Rule } from '../design/primitives'
import { useTheme } from '../design/render'
import { featured } from '../data/profile'

const HEAD_Y = 28
const FIRST_Y = 78

/** Rows measure themselves: fixed height would collide once a blurb wraps. */
function rowHeight(p: (typeof featured)[number]): number {
  const lines = wrapMono(p.blurb, t.tiny + 0.5, CONTENT - 150).length
  return 36 + lines * 15 + 12
}

const ROW_Y = featured.map((_, i) =>
  FIRST_Y + featured.slice(0, i).reduce((acc, p) => acc + rowHeight(p), 0),
)

export const WORK_H = ROW_Y[ROW_Y.length - 1]! + rowHeight(featured[featured.length - 1]!)

export function WorkCard() {
  const theme = useTheme()

  return (
    <>
      <Label y={HEAD_Y} text="project index" meta={`${featured.length} built · repos linked below`} />

      {featured.map((p, i) => {
        const y = ROW_Y[i]!
        const blurbLines = wrapMono(p.blurb, t.tiny + 0.5, CONTENT - 150)
        return (
          <g key={p.title} className="fade" style={{ animationDelay: `${i * 60}ms` }}>
            {/* row hairline */}
            {i > 0 && <Rule y={y - 8} />}
            {/* index — the channel number */}
            <Mono x={MARGIN} y={y + 14} size={t.micro} fill={theme.accent} weight="monoBold" track={1}>
              {String(i + 1).padStart(2, '0')}
            </Mono>
            {/* name + tag */}
            <Display x={MARGIN + 34} y={y + 14} size={t.bodyS + 1} fill={theme.ink}>
              {p.title.toLowerCase()}
            </Display>
            <Mono
              x={W - MARGIN}
              y={y + 14}
              size={t.micro}
              fill={theme.inkFaint}
              anchor="end"
              track={tracking.label}
            >
              {(p.tag ?? '').toLowerCase()}
            </Mono>
            {/* blurb, wrapped */}
            {blurbLines.map((l, j) => (
              <Mono key={l} x={MARGIN + 34} y={y + 32 + j * 15} size={t.tiny + 0.5} fill={theme.inkMuted}>
                {l.toLowerCase()}
              </Mono>
            ))}
          </g>
        )
      })}

      {/* keyed pin: one accent square marking the card's live edge */}
      <rect x={round(W - MARGIN - 6)} y={WORK_H - 20} width={6} height={6} rx={1} fill={theme.accent} opacity={0.85} />
    </>
  )
}
