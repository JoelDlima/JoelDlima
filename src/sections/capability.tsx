import * as React from 'react'
import { MARGIN, W, type as t } from '../design/tokens'
import { Display, Mono, round } from '../design/text'
import { SectionHead, HEAD_H, chipFlow } from '../design/primitives'
import { useTheme, SPECTRUM } from '../design/render'
import { domains } from '../data/profile'
import type { Section, SectionResult } from './types'

const GUTTER = 176
const ROW_GAP = 26
const AFTER_HEAD = 30

/**
 * Capability, as a gutter of domains against a flowing field of chips.
 *
 * The gutter carries the domain name in the display face plus a spectrum
 * proficiency bar; the chips carry the tools. Splitting it this way means the
 * eye can read the five domains in one pass without wading through forty tool
 * names first.
 */
export const capability: Section = ({ y, delay, index }): SectionResult => {
  const chipsX = MARGIN + GUTTER
  const chipsW = W - MARGIN - chipsX
  const top = y + HEAD_H + AFTER_HEAD
  const maxTools = Math.max(...domains.map((d) => d.tools.length))

  // Lay out first, measure second: chips wrap, so row heights are not constant.
  let cursor = top
  const rows = domains.map((domain, i) => {
    const flow = chipFlow(domain.tools, {
      x: chipsX,
      y: cursor,
      maxW: chipsW,
      delay: delay + 120 + i * 70,
      step: 22,
    })
    // The gutter block is three lines tall; a row can never be shorter.
    const rowH = Math.max(flow.height, 52)
    const row = { domain, flow, top: cursor, height: rowH }
    cursor += rowH + ROW_GAP
    return row
  })

  const height = cursor - ROW_GAP - y

  return {
    node: <Capability y={y} delay={delay} index={index} rows={rows} maxTools={maxTools} />,
    height,
  }
}

type Row = {
  domain: (typeof domains)[number]
  flow: { nodes: React.ReactNode[]; height: number }
  top: number
  height: number
}

function Capability({
  y,
  delay,
  index,
  rows,
  maxTools,
}: {
  y: number
  delay: number
  index: string
  rows: Row[]
  maxTools: number
}) {
  const theme = useTheme()
  return (
    <>
      <g className="fade" style={{ animationDelay: `${delay}ms` }}>
        <SectionHead y={y} label="capability" meta={`${domains.length} domains`} index={index} />
      </g>
      {rows.map((row, i) => (
        <React.Fragment key={row.domain.key}>
          <g className="rise" style={{ animationDelay: `${delay + 80 + i * 70}ms` }}>
            <Display x={MARGIN} y={row.top + 15} size={19} fill={theme.ink}>
              {row.domain.label.toLowerCase()}
            </Display>
            {/* Width tracks how many tools the domain actually lists, rather
                than a self-assessed proficiency figure nothing can verify. */}
            <rect
              className="grow"
              style={{ animationDelay: `${delay + 160 + i * 70}ms` }}
              x={MARGIN}
              y={row.top + 27}
              width={round((GUTTER - 46) * (row.domain.tools.length / maxTools))}
              height={2}
              fill={SPECTRUM}
            />
            <Mono x={MARGIN} y={row.top + 44} size={t.tiny} fill={theme.inkFaint}>
              {row.domain.note.toLowerCase()}
            </Mono>
            {/* Hairline joining the gutter to its chips. */}
            <rect
              x={MARGIN + GUTTER - 22}
              y={row.top + 11}
              width={14}
              height={1}
              fill={theme.line}
              opacity={theme.lineOpacity * 1.6}
            />
          </g>
          {row.flow.nodes}
        </React.Fragment>
      ))}
    </>
  )
}
