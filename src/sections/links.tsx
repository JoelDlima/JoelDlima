import { MARGIN, CONTENT, type as t, radius, tracking } from '../design/tokens'
import { Mono } from '../design/text'
import { SectionHead, HEAD_H } from '../design/primitives'
import { useTheme, SPECTRUM } from '../design/render'
import { identity } from '../data/profile'
import type { Section } from './types'

const AFTER_HEAD = 26
const CARD_H = 54
const GAP = 12

export interface LinkSpec {
  key: string
  label: string
  handle: string
  href: string
}

/** Single source of truth: the poster draws these, and the README links them. */
export const LINKS: LinkSpec[] = [
  { key: 'github', label: 'github', handle: `@${identity.handle}`, href: `https://github.com/${identity.handle}` },
  { key: 'linkedin', label: 'linkedin', handle: identity.linkedin, href: `https://linkedin.com/in/${identity.linkedin}` },
  { key: 'portfolio', label: 'portfolio', handle: 'portfolio-v1', href: identity.portfolio },
  { key: 'email', label: 'email', handle: identity.email, href: `mailto:${identity.email}` },
]

/**
 * Contact, drawn inside the poster and repeated beneath it as real badges.
 *
 * An SVG behind an <img> cannot be clicked — an <a> inside it is inert — so the
 * poster shows the addresses and the README carries the links. There is no way
 * to have both in one element: <object>, <embed>, inline <svg> and <map> are
 * all stripped by GitHub's sanitiser.
 */
export const links: Section = ({ y, delay, index }) => {
  const height = HEAD_H + AFTER_HEAD + CARD_H
  return { node: <Links y={y} delay={delay} index={index} />, height }
}

function Links({ y, delay, index }: { y: number; delay: number; index: string }) {
  const theme = useTheme()
  const cardW = (CONTENT - GAP * (LINKS.length - 1)) / LINKS.length
  const top = y + HEAD_H + AFTER_HEAD

  return (
    <>
      <g className="fade" style={{ animationDelay: `${delay}ms` }}>
        <SectionHead y={y} label="contact" meta="links are below the card" index={index} />
      </g>
      {LINKS.map((link, i) => {
        const x = MARGIN + i * (cardW + GAP)
        return (
          <g key={link.key} className="rise" style={{ animationDelay: `${delay + 60 + i * 55}ms` }}>
            <rect
              x={x}
              y={top}
              width={cardW}
              height={CARD_H}
              rx={radius.card}
              fill={theme.surface}
              stroke={theme.line}
              strokeOpacity={theme.lineOpacity * 1.7}
            />
            <rect x={x} y={top} width={2.5} height={CARD_H} rx={1} fill={SPECTRUM} />
            <LinkMark kind={link.key} x={x + 18} y={top + 20} />
            <Mono x={x + 40} y={top + 24} size={t.bodyS} weight="monoBold" fill={theme.ink}>
              {link.label}
            </Mono>
            <Mono x={x + 18} y={top + 42} size={t.tiny} fill={theme.inkFaint} track={tracking.micro}>
              {truncate(link.handle, Math.floor((cardW - 30) / (t.tiny * 0.6 + tracking.micro)))}
            </Mono>
          </g>
        )
      })}
    </>
  )
}

function truncate(text: string, max: number) {
  return text.length <= max ? text : `${text.slice(0, Math.max(1, max - 1))}…`
}

/**
 * Minimal geometric marks rather than brand logos: brand colours would break
 * the single spectrum, and monochrome brand marks read as broken logos.
 */
function LinkMark({ kind, x, y }: { kind: string; x: number; y: number }) {
  const common = { stroke: SPECTRUM, strokeWidth: 1.5, fill: 'none', strokeLinecap: 'round' as const }
  switch (kind) {
    case 'github':
      return (
        <g {...common}>
          <circle cx={x} cy={y} r={7} />
          <path d={`M${x - 3.5} ${y + 5.5}v-3a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3v3`} />
        </g>
      )
    case 'linkedin':
      return (
        <g {...common}>
          <rect x={x - 7} y={y - 7} width={14} height={14} rx={2.5} />
          <path d={`M${x - 3.5} ${y - 1}v4M${x + 0.5} ${y + 3}v-2a2 2 0 0 1 4 0v2`} />
          <circle cx={x - 3.5} cy={y - 4} r={0.9} fill={SPECTRUM} stroke="none" />
        </g>
      )
    case 'portfolio':
      return (
        <g {...common}>
          <circle cx={x} cy={y} r={7} />
          <path d={`M${x - 7} ${y}h14M${x} ${y - 7}c3 3.5 3 10.5 0 14c-3-3.5-3-10.5 0-14`} />
        </g>
      )
    default:
      return (
        <g {...common}>
          <rect x={x - 7.5} y={y - 5.5} width={15} height={11} rx={2} />
          <path d={`M${x - 7.5} ${y - 4.5}l7.5 5.5l7.5-5.5`} />
        </g>
      )
  }
}
