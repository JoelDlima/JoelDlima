import { MARGIN, W, type as t, tracking } from '../design/tokens'
import { Mono } from '../design/text'
import { Rule, TickScale } from '../design/primitives'
import { useTheme, SPECTRUM } from '../design/render'
import type { Section } from './types'

/**
 * Colophon. Says how the thing above it was made, which is the one piece of
 * information a README of this shape genuinely owes the reader — otherwise the
 * poster looks like it came from a card service.
 */
export const colophon: Section = ({ y, snap, delay }) => {
  const height = 62
  return { node: <Colophon y={y} delay={delay} generatedAt={snap.generatedAt} />, height }
}

function Colophon({ y, delay, generatedAt }: { y: number; delay: number; generatedAt: string }) {
  const theme = useTheme()
  return (
    <g className="fade" style={{ animationDelay: `${delay}ms` }}>
      <Rule y={y} />
      <TickScale x={MARGIN} y={y + 4} w={W - MARGIN * 2} count={60} height={4} />

      <Mono x={MARGIN} y={y + 30} size={t.tiny} fill={theme.inkFaint} track={tracking.micro}>
        one svg · react components rendered to outlines at build time · no card services
      </Mono>
      <Mono x={MARGIN} y={y + 46} size={t.tiny} fill={theme.inkFaint} track={tracking.micro}>
        {`refreshed from the github api · ${generatedAt.slice(0, 10)}`}
      </Mono>

      <Mono
        x={W - MARGIN}
        y={y + 30}
        size={t.tiny}
        weight="monoBold"
        fill={SPECTRUM}
        anchor="end"
        track={tracking.label}
      >
        VIOLET · BLUE · RED
      </Mono>
      <Mono
        x={W - MARGIN}
        y={y + 46}
        size={t.tiny}
        fill={theme.inkFaint}
        anchor="end"
        track={tracking.micro}
      >
        the visible spectrum, in order
      </Mono>
    </g>
  )
}
