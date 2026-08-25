import { MARGIN, W, CONTENT, type as t, tracking, radius } from '../design/tokens'
import { Display, Mono, measureMono, centerBaseline, round } from '../design/text'
import { SectionHead, HEAD_H, Blip } from '../design/primitives'
import { useTheme, SPECTRUM } from '../design/render'
import { awards, roles, academics } from '../data/profile'
import type { Section } from './types'

const AFTER_HEAD = 30
const COL_GAP = 40
const LEFT_W = CONTENT * 0.54
const RIGHT_X = MARGIN + LEFT_W + COL_GAP
const RIGHT_W = W - MARGIN - RIGHT_X
const AWARD_STEP = 46
const ROLE_STEP = 74

/**
 * Track record, split into two columns that are structurally different from
 * each other: distinctions read as a stamped list, appointments as a spine with
 * dated nodes. One section, two shapes — placements and posts are not the same
 * kind of fact and should not look like they are.
 */
export const record: Section = ({ y, delay, index }) => {
  const top = y + HEAD_H + AFTER_HEAD
  const leftH = awards.length * AWARD_STEP
  const rightH = roles.length * ROLE_STEP + 52
  const height = Math.max(leftH, rightH) + AFTER_HEAD + HEAD_H

  return { node: <Record y={y} top={top} delay={delay} index={index} />, height }
}

function Record({ y, top, delay, index }: { y: number; top: number; delay: number; index: string }) {
  const theme = useTheme()

  return (
    <>
      <g className="fade" style={{ animationDelay: `${delay}ms` }}>
        <SectionHead y={y} label="track record" meta={`cgpa ${academics.cgpa} / 10`} index={index} />
      </g>

      {/* ---- Left: distinctions ---------------------------------------- */}
      <Mono
        x={MARGIN}
        y={top - 10}
        size={t.tiny}
        weight="monoBold"
        fill={theme.inkFaint}
        track={tracking.label}
      >
        DISTINCTIONS
      </Mono>

      {awards.map((award, i) => {
        const ay = top + 14 + i * AWARD_STEP
        const rankW = measureMono(award.rank, t.tiny, tracking.micro) + 16
        return (
          <g key={`${award.title}-${award.detail}`} className="rise" style={{ animationDelay: `${delay + 90 + i * 60}ms` }}>
            <rect
              x={MARGIN}
              y={ay - 9}
              width={round(rankW)}
              height={17}
              rx={radius.chip}
              fill="none"
              stroke={SPECTRUM}
              strokeWidth={1}
              opacity={0.85}
            />
            <Mono
              x={MARGIN + 8}
              y={centerBaseline(ay - 9, 17, t.tiny)}
              size={t.tiny}
              weight="monoBold"
              fill={SPECTRUM}
              track={tracking.micro}
            >
              {award.rank}
            </Mono>
            <Display x={MARGIN + rankW + 12} y={ay + 3} size={16} fill={theme.ink}>
              {award.title.toLowerCase()}
            </Display>
            <Mono x={MARGIN} y={ay + 24} size={t.tiny} fill={theme.inkFaint}>
              {award.detail.toLowerCase()}
            </Mono>
          </g>
        )
      })}

      {/* ---- Right: appointments --------------------------------------- */}
      <Mono
        x={RIGHT_X}
        y={top - 10}
        size={t.tiny}
        weight="monoBold"
        fill={theme.inkFaint}
        track={tracking.label}
      >
        APPOINTMENTS
      </Mono>

      <rect
        x={RIGHT_X + 3}
        y={top + 6}
        width={1}
        height={roles.length * ROLE_STEP - 20}
        fill={SPECTRUM}
        opacity={0.45}
      />

      {roles.map((role, i) => {
        const ry = top + 14 + i * ROLE_STEP
        return (
          <g key={role.org} className="rise" style={{ animationDelay: `${delay + 140 + i * 70}ms` }}>
            {role.current ? (
              <Blip x={RIGHT_X + 3.5} y={ry - 4} r={3} />
            ) : (
              <circle cx={RIGHT_X + 3.5} cy={ry - 4} r={3} fill={theme.inkFaint} />
            )}
            <Display x={RIGHT_X + 20} y={ry} size={17} fill={theme.ink}>
              {role.org.toLowerCase()}
            </Display>
            <Mono
              x={W - MARGIN}
              y={ry - 1}
              size={t.tiny}
              fill={theme.inkFaint}
              anchor="end"
              track={tracking.micro}
            >
              {role.period.toLowerCase()}
            </Mono>
            <Mono x={RIGHT_X + 20} y={ry + 18} size={t.bodyS} fill={theme.inkMuted}>
              {role.title.toLowerCase()}
            </Mono>
            <Mono x={RIGHT_X + 20} y={ry + 34} size={t.tiny} fill={theme.inkFaint}>
              {role.note.toLowerCase()}
            </Mono>
          </g>
        )
      })}

      {/* Academics as a closing footnote under the appointments spine. */}
      <g className="fade" style={{ animationDelay: `${delay + 300}ms` }}>
        <Mono
          x={RIGHT_X}
          y={top + roles.length * ROLE_STEP + 8}
          size={t.tiny}
          fill={theme.inkFaint}
        >
          {academics.extra.toLowerCase()}
        </Mono>
      </g>
    </>
  )
}

export const RECORD_METRICS = { LEFT_W, RIGHT_W }
