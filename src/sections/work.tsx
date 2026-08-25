import * as React from 'react'
import { MARGIN, W, CONTENT, type as t, tracking } from '../design/tokens'
import { Display, Mono, measureDisplay, measureMono, wrapMono, round } from '../design/text'
import { SectionHead, HEAD_H, DotLeader, Rule } from '../design/primitives'
import { useTheme, SPECTRUM } from '../design/render'
import { featured, alsoBuilt } from '../data/profile'
import type { Snapshot } from '../data/github'
import type { Section } from './types'

const AFTER_HEAD = 28
const NUM_W = 34
const TITLE_SIZE = 21
const ENTRY_GAP = 22

/**
 * Selected work, as a numbered catalogue rather than a grid of cards.
 *
 * Cards force every project into the same rectangle and waste most of it on
 * padding; an indexed list with leader dots puts the titles in one scannable
 * column and lets each description run as long as it needs.
 */
export const work: Section = ({ y, snap, delay, index }) => {
  const entries = featured.map((project) => {
    const repo = project.repo ? snap.repos.find((r) => r.name === project.repo) : undefined
    const lines = wrapMono(project.blurb, t.bodyS, CONTENT - NUM_W - 90)
    return { project, repo, lines }
  })

  let cursor = y + HEAD_H + AFTER_HEAD
  const placed = entries.map((entry) => {
    const h = 26 + entry.lines.length * 16 + 16
    const top = cursor
    cursor += h + ENTRY_GAP
    return { ...entry, top, height: h }
  })

  const alsoTop = cursor - ENTRY_GAP + 28
  const height = alsoTop + 22 + alsoBuilt.length * 18 - y

  return {
    node: <Work y={y} delay={delay} index={index} entries={placed} alsoTop={alsoTop} />,
    height,
  }
}

type Entry = {
  project: (typeof featured)[number]
  repo: Snapshot['repos'][number] | undefined
  lines: string[]
  top: number
  height: number
}

function Work({
  y,
  delay,
  index,
  entries,
  alsoTop,
}: {
  y: number
  delay: number
  index: string
  entries: Entry[]
  alsoTop: number
}) {
  const theme = useTheme()
  return (
    <>
      <g className="fade" style={{ animationDelay: `${delay}ms` }}>
        <SectionHead
          y={y}
          label="selected work"
          meta={`${entries.length} of ${featured.length + alsoBuilt.length}`}
          index={index}
        />
      </g>

      {entries.map((entry, i) => {
        const { project, repo, top } = entry
        const titleW = measureDisplay(project.title.toLowerCase(), TITLE_SIZE)
        // No star counts: JetBrains Mono has no ★ glyph, and single-digit star
        // counts undersell work that is genuinely worth reading anyway.
        const rightLabel = repo
          ? `${(repo.language ?? 'mixed').toLowerCase()} · ${repo.pushedAt.slice(0, 4)}`
          : 'private repo'
        const rightW = measureMono(rightLabel, t.micro, tracking.micro)
        const leaderStart = MARGIN + NUM_W + titleW + 12
        const leaderEnd = W - MARGIN - rightW - 12

        return (
          <g key={project.title} className="rise" style={{ animationDelay: `${delay + 70 + i * 55}ms` }}>
            <Mono x={MARGIN} y={top + 15} size={t.micro} weight="monoBold" fill={SPECTRUM} track={0.6}>
              {String(i + 1).padStart(2, '0')}
            </Mono>

            <Display x={MARGIN + NUM_W} y={top + 16} size={TITLE_SIZE} fill={theme.ink}>
              {project.title.toLowerCase()}
            </Display>

            {leaderEnd > leaderStart && <DotLeader x1={leaderStart} x2={leaderEnd} y={top + 11} />}

            <Mono
              x={W - MARGIN}
              y={top + 15}
              size={t.micro}
              fill={theme.inkFaint}
              anchor="end"
              track={tracking.micro}
            >
              {rightLabel}
            </Mono>

            {entry.lines.map((line, li) => (
              <Mono
                key={line}
                x={MARGIN + NUM_W}
                y={top + 36 + li * 16}
                size={t.bodyS}
                fill={theme.inkMuted}
              >
                {line}
              </Mono>
            ))}

            {/* Stack as a plain delimited run — the chip treatment already
                belongs to the capability section, and repeating it here would
                flatten the difference between the two. */}
            <Mono
              x={MARGIN + NUM_W}
              y={top + 36 + entry.lines.length * 16 + 10}
              size={t.tiny}
              fill={theme.inkFaint}
              track={0.5}
            >
              {project.stack.map((s) => s.toLowerCase()).join('  ·  ')}
            </Mono>

            {project.demo && (
              <Mono
                x={W - MARGIN}
                y={top + 36 + entry.lines.length * 16 + 10}
                size={t.tiny}
                fill={SPECTRUM}
                anchor="end"
                track={0.5}
              >
                live demo
              </Mono>
            )}

            <Rule y={round(top + entry.height)} opacity={theme.lineOpacity * 0.7} />
          </g>
        )
      })}

      {/* Private and team work: named, not linked. */}
      <g className="fade" style={{ animationDelay: `${delay + 460}ms` }}>
        <Mono x={MARGIN} y={alsoTop} size={t.micro} weight="monoBold" fill={theme.inkFaint} track={tracking.label}>
          ALSO BUILT
        </Mono>
        {/* One per line. Two columns overflowed: these blurbs are sentences,
            not labels, and half the content width cannot hold them. */}
        {alsoBuilt.map((item, i) => {
          const yy = alsoTop + 22 + i * 18
          return (
            <React.Fragment key={item.title}>
              <rect x={MARGIN} y={yy - 5} width={5} height={5} rx={1} fill={SPECTRUM} opacity={0.85} />
              <Mono x={MARGIN + 13} y={yy} size={t.bodyS} fill={theme.ink}>
                {item.title.toLowerCase()}
              </Mono>
              <Mono
                x={MARGIN + 13 + measureMono(item.title, t.bodyS) + 14}
                y={yy}
                size={t.bodyS}
                fill={theme.inkMuted}
              >
                {item.blurb.toLowerCase()}
              </Mono>
            </React.Fragment>
          )
        })}
      </g>
    </>
  )
}
