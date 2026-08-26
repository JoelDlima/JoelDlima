/**
 * Intro card — who he is, in one panel.
 *
 * Name with a blinking terminal cursor, the one live fact (current
 * appointment, breathing blip), the pitch, and one plain sentence that does
 * the recruiting. Gold edge-connector fingers close the bottom edge: this is
 * a card you could seat on a board.
 */
import { W, MARGIN, CONTENT, type as t, tracking } from '../design/tokens'
import { Display, Mono, wrapMono, fitDisplay } from '../design/text'
import { Blip, Cursor, EdgeConnectors, Trace } from '../design/primitives'
import { useTheme } from '../design/render'
import { identity, academics } from '../data/profile'

export const INTRO_H = 344

const NAME = "JOEL D'LIMA"

export function IntroCard() {
  const theme = useTheme()
  const size = fitDisplay([NAME], 600, 58, 2)
  const nameW = measureName(size)

  const pitchLines = wrapMono(identity.pitch, t.lead, CONTENT - 4)
  const focusLines = wrapMono(identity.focus, t.body, CONTENT - 60)

  let y = 96
  const nameY = y
  y += 34 // role line
  const statusY = y + 22
  y = statusY + 30 // pitch start
  const pitchStart = y
  y += pitchLines.length * 27
  const focusStart = y + 10
  y = focusStart + focusLines.length * 18

  return (
    <>
      {/* Ambient trace routing behind the name — signal direction, quietly */}
      <Trace
        d={`M${MARGIN + 520} 26 H700 Q714 26 714 40 V64`}
        vias={[
          [MARGIN + 520, 26],
          [714, 64],
        ]}
        opacity={0.55}
      />

      <g className="fade">
        <Mono x={MARGIN} y={30} size={t.micro} fill={theme.inkFaint} track={tracking.label}>
          PROFILE / JOELDLIMA
        </Mono>
        <Mono x={W - MARGIN} y={30} size={t.micro} fill={theme.inkFaint} anchor="end" track={tracking.micro}>
          {`${identity.location.toLowerCase()} · utc+5:30`}
        </Mono>
      </g>

      <g className="rise" style={{ animationDelay: '60ms' }}>
        <Display x={MARGIN} y={nameY} size={size} fill={theme.ink} track={2}>
          {NAME}
        </Display>
        <Cursor x={MARGIN + nameW + 14} y={nameY} size={size} />
      </g>

      <g className="fade" style={{ animationDelay: '140ms' }}>
        <Mono x={MARGIN} y={nameY + 26} size={t.bodyS} fill={theme.inkMuted}>
          {`${identity.role.toLowerCase()} · class of ${academics.graduating}`}
        </Mono>
      </g>

      <g className="fade" style={{ animationDelay: '200ms' }}>
        <Blip x={MARGIN + 3} y={statusY - 3.5} r={2.6} />
        <Mono x={MARGIN + 15} y={statusY} size={t.bodyS} weight="monoBold" fill={theme.accent} track={0.4}>
          {identity.status.toLowerCase()}
        </Mono>
        <Mono
          x={MARGIN + 15 + measureStatus(identity.status) + 12}
          y={statusY}
          size={t.bodyS}
          fill={theme.inkMuted}
        >
          automotive embedded · ppo track
        </Mono>
      </g>

      <g className="rise" style={{ animationDelay: '260ms' }}>
        {pitchLines.map((line, i) => (
          <Display key={line} x={MARGIN} y={pitchStart + i * 27} size={t.lead} fill={theme.ink}>
            {line.toLowerCase()}
          </Display>
        ))}
      </g>

      <g className="fade" style={{ animationDelay: '320ms' }}>
        {focusLines.map((line, i) => (
          <Mono key={line} x={MARGIN} y={focusStart + i * 18} size={t.body} fill={theme.inkMuted}>
            {line.toLowerCase()}
          </Mono>
        ))}
      </g>

      <EdgeConnectors x={MARGIN} y={INTRO_H - 14} count={Math.floor(CONTENT / 11)} />
    </>
  )
}

/** Width helper local to this card (keeps measureMono out of JSX math above). */
function measureName(size: number): number {
  return NAME.length * 0.6 * size + (NAME.length - 1) * 2
}

function measureStatus(s: string): number {
  return s.length * 0.6 * t.bodyS + (s.length - 1) * 0.4
}
