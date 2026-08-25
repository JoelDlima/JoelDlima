import { MARGIN, W, type as t, tracking } from '../design/tokens'
import { Mono } from '../design/text'
import { Rule } from '../design/primitives'
import { useTheme } from '../design/render'
import type { Section } from './types'

/**
 * Colophon. One line: how the poster above was made and when. Kept short —
 * a footer that explains itself at length starts competing with the projects
 * for attention, which is the one thing this section must never do.
 */
export const colophon: Section = ({ y, snap, delay }) => {
  const height = 34
  return { node: <Colophon y={y} delay={delay} generatedAt={snap.generatedAt} />, height }
}

function Colophon({ y, delay, generatedAt }: { y: number; delay: number; generatedAt: string }) {
  const theme = useTheme()
  return (
    <g className="fade" style={{ animationDelay: `${delay}ms` }}>
      <Rule y={y} />
      <Mono x={MARGIN} y={y + 20} size={t.tiny} fill={theme.inkFaint} track={tracking.micro}>
        one svg, generated from the github api
      </Mono>
      <Mono
        x={W - MARGIN}
        y={y + 20}
        size={t.tiny}
        fill={theme.inkFaint}
        anchor="end"
        track={tracking.micro}
      >
        {generatedAt.slice(0, 10)}
      </Mono>
    </g>
  )
}
