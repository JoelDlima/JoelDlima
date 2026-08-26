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

export const INTRO_H = 434

const NAME = "JOEL D'LIMA"

export function IntroCard() {
  const theme = useTheme()
  const size = fitDisplay([NAME], 620, t.hero, 2)
  const nameW = measureName(size)

  const pitchLines = wrapMono(identity.pitch, t.lead, CONTENT - 4)
  const focusLines = wrapMono(identity.focus, t.body, CONTENT - 60)

  let y = 112
  const nameY = y
  y += 44 // role line
  const statusY = y + 30
  y = statusY + 40 // pitch start
  const pitchStart = y
  y += pitchLines.length * 36
  const focusStart = y + 14
  y = focusStart + focusLines.length * 26

  return (
    <>
      {/* Ambient trace routing behind the name — signal direction, quietly */}
      <Trace
        d={`M${MARGIN + 420} 30 H580 Q596 30 596 46 V74`}
        vias={[
          [MARGIN + 420, 30],
          [596, 74],
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
        <Mono x={MARGIN} y={nameY + 34} size={t.bodyS} fill={theme.inkMuted}>
          {`${identity.role.toLowerCase()} · class of ${academics.graduating}`}
        </Mono>
      </g>

      <g className="fade" style={{ animationDelay: '200ms' }}>
        <Blip x={MARGIN + 3} y={statusY - 5} r={3.4} />
        <Mono x={MARGIN + 18} y={statusY} size={t.bodyS} weight="monoBold" fill={theme.accent} track={0.4}>
          {identity.status.toLowerCase()}
        </Mono>
        <Mono
          x={MARGIN + 18 + measureStatus(identity.status) + 14}
          y={statusY}
          size={t.bodyS}
          fill={theme.inkMuted}
        >
          automotive embedded · ppo track
        </Mono>
      </g>

      <g className="rise" style={{ animationDelay: '260ms' }}>
        {pitchLines.map((line, i) => (
          <Display key={line} x={MARGIN} y={pitchStart + i * 36} size={t.lead} fill={theme.ink}>
            {line.toLowerCase()}
          </Display>
        ))}
      </g>

      <g className="fade" style={{ animationDelay: '320ms' }}>
        {focusLines.map((line, i) => (
          <Mono key={line} x={MARGIN} y={focusStart + i * 26} size={t.body} fill={theme.inkMuted}>
            {line.toLowerCase()}
          </Mono>
        ))}
      </g>

      <EdgeConnectors x={MARGIN} y={INTRO_H - 16} count={Math.floor(CONTENT / 13)} />
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
