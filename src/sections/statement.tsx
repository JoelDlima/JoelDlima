import { MARGIN, CONTENT, type as t } from '../design/tokens'
import { Display, wrapDisplay } from '../design/text'
import { useTheme, SPECTRUM } from '../design/render'
import { identity } from '../data/profile'
import type { Section } from './types'

const SIZE = 25
const LEADING = 34
const BAR_W = 3
const TEXT_X = MARGIN + 26

/**
 * The lead. One sentence, set large in Bodoni italic against a spectrum bar.
 *
 * Deliberately unlabelled and structurally unlike everything below it: after a
 * masthead the reader wants one plain statement of what this person does, not
 * another headed block to parse.
 */
export const statement: Section = ({ y, delay }) => {
  const lines = wrapDisplay(identity.pitch, SIZE, CONTENT - 26 - 40, 'displayItalic')
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
        <Display
          key={line}
          x={TEXT_X}
          y={y + 24 + i * LEADING}
          size={SIZE}
          weight="displayItalic"
          fill={theme.ink}
        >
          {line}
        </Display>
      ))}
    </g>
  )
}

export const STATEMENT_SIZE = { SIZE, LEADING, t }
