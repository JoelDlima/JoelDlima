import { MARGIN, CONTENT, type as t } from '../design/tokens'
import { Mono, wrapMono } from '../design/text'
import { useTheme, SPECTRUM } from '../design/render'
import { identity } from '../data/profile'
import type { Section } from './types'

const SIZE = 20
const LEADING = 28
const SUB_SIZE = t.bodyS
const SUB_LEADING = 17
const BAR_W = 3
const TEXT_X = MARGIN + 26

/**
 * The lead. One sentence, set large and bold against a spectrum bar — then one
 * plain sentence beneath it in ordinary size. The first line carries the
 * personality; the second does the recruiting. Both are needed: a poetic line
 * alone leaves the reader guessing what is actually built here.
 */
export const statement: Section = ({ y, delay }) => {
  const lines = wrapMono(identity.pitch, SIZE, CONTENT - 26 - 40)
  const subLines = wrapMono(identity.focus, SUB_SIZE, CONTENT - 26 - 20)
  const height = lines.length * LEADING + 8 + subLines.length * SUB_LEADING
  return {
    node: <Statement y={y} delay={delay} lines={lines} subLines={subLines} height={height} />,
    height,
  }
}

function Statement({
  y,
  delay,
  lines,
  subLines,
  height,
}: {
  y: number
  delay: number
  lines: string[]
  subLines: string[]
  height: number
}) {
  const theme = useTheme()
  const subTop = y + 20 + lines.length * LEADING + 8
  return (
    <g className="rise" style={{ animationDelay: `${delay}ms` }}>
      <rect x={MARGIN} y={y} width={BAR_W} height={height} fill={SPECTRUM} />
      {lines.map((line, i) => (
        <Mono key={line} x={TEXT_X} y={y + 20 + i * LEADING} size={SIZE} weight="monoBold" fill={theme.ink}>
          {line}
        </Mono>
      ))}
      {subLines.map((line, i) => (
        <Mono key={line} x={TEXT_X} y={subTop + i * SUB_LEADING} size={SUB_SIZE} fill={theme.inkMuted}>
          {line}
        </Mono>
      ))}
    </g>
  )
}

export const STATEMENT_SIZE = { SIZE, LEADING, t }
