import { MARGIN, CONTENT, type as t } from '../design/tokens'
import { Mono, wrapMono } from '../design/text'
import { useTheme, SPECTRUM } from '../design/render'
import { identity } from '../data/profile'
import type { Section } from './types'

const SIZE = 20
const LEADING = 28
const BAR_W = 3
const TEXT_X = MARGIN + 26

/**
 * The lead. One sentence, set large and bold against a spectrum bar.
 *
 * Deliberately unlabelled and structurally unlike everything below it: after a
 * masthead the reader wants one plain statement of what this person does, not
 * another headed block to parse.
 */
export const statement: Section = ({ y, delay }) => {
  const lines = wrapMono(identity.pitch, SIZE, CONTENT - 26 - 40)
  const height = lines.length * LEADING + 6
  return { node: <Statement y={y} delay={delay} lines={lines} height={height} />, height }
}

function Statement({
  y,
  delay,
  lines,
  height,
}: {
  y: number
  delay: number
  lines: string[]
  height: number
}) {
  const theme = useTheme()
  return (
    <g className="rise" style={{ animationDelay: `${delay}ms` }}>
      <rect x={MARGIN} y={y} width={BAR_W} height={height} fill={SPECTRUM} />
      {lines.map((line, i) => (
        <Mono key={line} x={TEXT_X} y={y + 20 + i * LEADING} size={SIZE} weight="monoBold" fill={theme.ink}>
          {line}
        </Mono>
      ))}
    </g>
  )
}

export const STATEMENT_SIZE = { SIZE, LEADING, t }
