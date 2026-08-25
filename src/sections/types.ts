import type * as React from 'react'
import type { Snapshot } from '../data/github'

export interface SectionContext {
  /** Absolute y this section starts at. */
  y: number
  snap: Snapshot
  /** Entrance-cascade delay in ms, so motion runs top to bottom. */
  delay: number
  /** Two-digit section number, drawn against the spine. */
  index: string
}

export interface SectionResult {
  node: React.ReactNode
  /** Measured height. The poster stacks sections by running total, so a section
   *  that grows pushes everything below it down with no coordinates to re-derive. */
  height: number
}

export type Section = (ctx: SectionContext) => SectionResult
