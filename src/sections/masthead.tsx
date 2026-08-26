import { W, MARGIN, CONTENT, type as t, tracking } from '../design/tokens'
import { Display, Mono, fitDisplay, measureDisplay, round } from '../design/text'
import { SpectrumRule, TickScale, Blip } from '../design/primitives'
import { useTheme, SPECTRUM } from '../design/render'
import { identity, academics } from '../data/profile'
import type { Section } from './types'

const NAME = "JOEL D'LIMA"
const DISC_R = 62

/**
 * The masthead. No section label — it is the one block allowed to just be big.
 *
 * The name is set in JetBrains Mono ExtraBold caps and painted in the travelling
 * spectrum; its hairlines are what make the gradient read as light moving across
 * the letters rather than as a flat colour fill. Under it, the one recruiter
 * fact that outranks everything else on the page — the current appointment —
 * gets a live blip and its own line.
 */
export const masthead: Section = ({ y, delay }) => {
  const node = <Masthead y={y} delay={delay} />
  return { node, height: 250 }
}

function Masthead({ y, delay }: { y: number; delay: number }) {
  const theme = useTheme()
  const size = fitDisplay([NAME], 600, 84, tracking.masthead)
  const nameW = measureDisplay(NAME, size, tracking.masthead)

  const discX = W - MARGIN - DISC_R - 4
  const discY = y + 112

  return (
    <>
      {/* Top meta row */}
      <g className="fade" style={{ animationDelay: `${delay}ms` }}>
        <Mono x={MARGIN} y={y + 46} size={t.micro} fill={theme.inkFaint} track={tracking.label}>
          PROFILE
        </Mono>
        <Mono
          x={W - MARGIN}
          y={y + 46}
          size={t.micro}
          fill={theme.inkFaint}
          anchor="end"
          track={tracking.micro}
        >
          {identity.location.toLowerCase()}
        </Mono>
      </g>

      {/* Name */}
      <g className="rise" style={{ animationDelay: `${delay + 60}ms` }}>
        <Display x={MARGIN} y={y + 134} size={size} track={tracking.masthead} fill={SPECTRUM}>
          {NAME}
        </Display>
      </g>

      <g className="rise" style={{ animationDelay: `${delay + 130}ms` }}>
        <Mono x={MARGIN} y={y + 162} size={t.body} fill={theme.ink}>
          {identity.role.toLowerCase()}
        </Mono>
        <Mono x={MARGIN} y={y + 182} size={t.bodyS} fill={theme.inkMuted}>
          {`${academics.institution.toLowerCase()} · class of ${academics.graduating}`}
        </Mono>
      </g>

      {/* The appointment, with a breathing marker: the strongest single fact
          for a recruiter, and the one thing an earlier revision of this poster
          defined but never actually rendered. */}
      <g className="fade" style={{ animationDelay: `${delay + 180}ms` }}>
        <Blip x={MARGIN + 3} y={y + 198.5} r={2.2} />
        <Mono
          x={MARGIN + 14}
          y={y + 202}
          size={t.bodyS}
          weight="monoBold"
          fill={theme.inkMuted}
          track={tracking.label}
        >
          {identity.status.toLowerCase()}
        </Mono>
      </g>

      <g className="fade" style={{ animationDelay: `${delay + 220}ms` }}>
        <SpectrumRule y={y + 222} w={round(nameW)} h={2} />
        <TickScale x={MARGIN} y={y + 228} w={CONTENT} count={60} height={5} />
      </g>

      <SpectralDisc cx={discX} cy={discY} r={DISC_R} delay={delay + 160} />
    </>
  )
}

/**
 * The masthead's signature object: a polar plot whose radius is modulated by a
 * sum of harmonics, with a slow radar sweep across it.
 *
 * The waveform is deterministic — derived from fixed harmonics rather than
 * Math.random — so the two theme files and every rebuild are byte-identical and
 * the daily workflow never commits noise.
 */
function SpectralDisc({ cx, cy, r, delay }: { cx: number; cy: number; r: number; delay: number }) {
  const theme = useTheme()

  const wave = polarWave(cx, cy, r * 0.62, r * 0.2, [
    { k: 3, a: 0.42, p: 0.4 },
    { k: 5, a: 0.3, p: 1.9 },
    { k: 8, a: 0.18, p: 3.1 },
    { k: 13, a: 0.1, p: 0.7 },
  ])

  const ticks = Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2
    const inner = i % 3 === 0 ? r - 8 : r - 4
    return (
      <line
        key={i}
        x1={round(cx + Math.cos(a) * inner)}
        y1={round(cy + Math.sin(a) * inner)}
        x2={round(cx + Math.cos(a) * r)}
        y2={round(cy + Math.sin(a) * r)}
        stroke={theme.inkFaint}
        strokeWidth={1}
        opacity={i % 3 === 0 ? 0.6 : 0.28}
      />
    )
  })

  return (
    <g className="fade" style={{ animationDelay: `${delay}ms` }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={theme.line} strokeOpacity={theme.lineOpacity * 2} />
      <circle
        cx={cx}
        cy={cy}
        r={r * 0.62}
        fill="none"
        stroke={theme.line}
        strokeOpacity={theme.lineOpacity}
        strokeDasharray="2 4"
      />
      {ticks}

      <path
        className="draw"
        style={{ ['--len' as string]: '520', animationDelay: `${delay + 120}ms` }}
        d={wave}
        fill={SPECTRUM}
        fillOpacity={0.14}
        stroke={SPECTRUM}
        strokeWidth={1.6}
        strokeDasharray="520"
      />

      {/* The sweep needs its own centred box, or fill-box measures the wedge
          alone and it spins in place instead of rotating about the disc. */}
      <g style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" />
        <SweepArm cx={cx} cy={cy} r={r} />
      </g>

      <circle cx={cx} cy={cy} r={2.5} fill={SPECTRUM} />
      <Blip x={cx + r} y={cy} r={2.5} />
    </g>
  )
}

function SweepArm({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <line
        x1={cx}
        y1={cy}
        x2={cx + r}
        y2={cy}
        stroke={SPECTRUM}
        strokeWidth={1.4}
        opacity={0.75}
        strokeLinecap="round"
      />
      <animateTransform
        attributeName="transform"
        type="rotate"
        from={`0 ${cx} ${cy}`}
        to={`360 ${cx} ${cy}`}
        dur="18s"
        repeatCount="indefinite"
      />
    </g>
  )
}

/** Closed path for r(θ) = base + amp · Σ aₖ·sin(kθ + pₖ). */
function polarWave(
  cx: number,
  cy: number,
  base: number,
  amp: number,
  harmonics: { k: number; a: number; p: number }[],
  steps = 180,
) {
  const pts: string[] = []
  for (let i = 0; i < steps; i++) {
    const th = (i / steps) * Math.PI * 2
    const mod = harmonics.reduce((sum, h) => sum + h.a * Math.sin(h.k * th + h.p), 0)
    const rr = base + amp * mod
    pts.push(`${round(cx + Math.cos(th) * rr)} ${round(cy + Math.sin(th) * rr)}`)
  }
  return `M${pts.join('L')}Z`
}
