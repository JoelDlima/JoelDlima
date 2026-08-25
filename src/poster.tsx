/**
 * Stacks the sections into one poster.
 *
 * Each section is a pure function of the y it starts at, and reports the height
 * it actually used. The poster lays them out by running total, so resizing or
 * reordering a section shifts everything below it automatically — no coordinate
 * further down ever needs re-deriving by hand.
 */
import * as React from 'react'
import { space } from './design/tokens'
import { Spine } from './design/primitives'
import { useTheme } from './design/render'
import { motion } from './design/tokens'
import type { Snapshot } from './data/github'
import type { Section } from './sections/types'

import { masthead } from './sections/masthead'
import { statement } from './sections/statement'
import { capability } from './sections/capability'
import { work } from './sections/work'
import { record } from './sections/record'
import { telemetry } from './sections/telemetry'
import { links } from './sections/links'
import { colophon } from './sections/colophon'

/** Order is the reading order. Everything else follows from it. */
const SECTIONS: Section[] = [
  masthead,
  statement,
  capability,
  work,
  record,
  telemetry,
  links,
  colophon,
]

/** Gap between the bottom of one section and the top of the next. */
const GAP = space.section

export interface Poster {
  node: React.ReactElement
  height: number
}

export function buildPoster(snap: Snapshot): Poster {
  const parts: React.ReactNode[] = []
  let y = 0

  // Only headed sections carry an index; the masthead and the lead are not
  // numbered entries, and numbering them makes the first visible index "03".
  let headed = 0

  SECTIONS.forEach((section, i) => {
    const numbered = section !== masthead && section !== statement && section !== colophon
    if (numbered) headed += 1
    const { node, height } = section({
      y,
      snap,
      delay: i * motion.cascadeStep,
      index: numbered ? String(headed).padStart(2, '0') : '',
    })
    parts.push(<React.Fragment key={i}>{node}</React.Fragment>)
    y += height + (i === SECTIONS.length - 1 ? 0 : GAP)
  })

  const height = Math.round(y + 46)
  return { node: <PosterBody parts={parts} height={height} />, height }
}

function PosterBody({ parts, height }: { parts: React.ReactNode[]; height: number }) {
  const theme = useTheme()
  return (
    <>
      <Spine top={70} bottom={height - 60} theme={theme} />
      {parts}
    </>
  )
}
