/**
 * Intro card — the hero panel, redesigned.
 *
 * DepthText 3D layered name with purple depthColor, sitting on a dithered
 * noise background (SVG feTurbulence). Subtitle shows role and graduation.
 * Edge connectors, trace routing, pitch, and focus text are all removed —
 * the card is the name and nothing else.
 */
import { W, MARGIN, CONTENT, type as t, tracking } from '../design/tokens'
import { Mono, Display, fitDisplay } from '../design/text'
import { useTheme } from '../design/render'
import { identity, academics } from '../data/profile'

export const INTRO_H = 378

const NAME = "JOEL D'LIMA"

/** Number of depth shadow layers behind the face. */
const DEPTH_LAYERS = 8
/** Vertical offset per depth layer (px). */
const DEPTH_STEP = 2.4
/** Depth colour — matches DepthText depthColor="#7c3aed". */
const DEPTH_COLOR = '#7c3aed'

export function IntroCard() {
  const theme = useTheme()
  const size = fitDisplay([NAME], CONTENT, t.hero, 2)

  // Centred vertically.
  const nameY = 170

  return (
    <>
      {/* ── Dither background — animated wave motion via SMIL ────────── */}
      <defs>
        {/* Layer 1: base dithered noise, waveSpeed 0.05 → ~20s cycle */}
        <filter id="dither1" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            seed="2"
            result="noise"
          >
            {/* waveFrequency=3 → 3 cycles in baseFrequency range */}
            <animate
              attributeName="baseFrequency"
              values="0.62;0.68;0.62"
              dur="20s"
              repeatCount="indefinite"
            />
            {/* waveSpeed=0.05 → seed shifts slowly for organic drift */}
            <animate
              attributeName="seed"
              values="2;5;3;6;2"
              dur="40s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feComponentTransfer in="noise" result="quantized">
            <feFuncR type="discrete" tableValues="0 0.12 0.25 0.4" />
            <feFuncG type="discrete" tableValues="0 0.12 0.25 0.4" />
            <feFuncB type="discrete" tableValues="0 0.12 0.25 0.4" />
          </feComponentTransfer>
          <feColorMatrix type="saturate" values="0" in="quantized" result="grey1" />
        </filter>

        {/* Layer 2: finer grain, offset phase for depth */}
        <filter id="dither2" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.2"
            numOctaves="2"
            seed="7"
            result="fine"
          >
            <animate
              attributeName="baseFrequency"
              values="1.15;1.25;1.15"
              dur="15s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="seed"
              values="7;11;7"
              dur="30s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feComponentTransfer in="fine" result="qFine">
            <feFuncR type="discrete" tableValues="0 0.2 0.5" />
            <feFuncG type="discrete" tableValues="0 0.2 0.5" />
            <feFuncB type="discrete" tableValues="0 0.2 0.5" />
          </feComponentTransfer>
          <feColorMatrix type="saturate" values="0" in="qFine" result="grey2" />
        </filter>
      </defs>

      {/* Base wave layer */}
      <rect
        x="0"
        y="0"
        width={W}
        height={INTRO_H}
        filter="url(#dither1)"
        opacity="0.14"
      />
      {/* Fine grain overlay — adds texture depth */}
      <rect
        x="0"
        y="0"
        width={W}
        height={INTRO_H}
        filter="url(#dither2)"
        opacity="0.06"
      />

      {/* ── DepthText — 3D layered name ────────────────────────────────── */}
      <g>
        {/* Shadow layers — back to front, darkest to lightest */}
        {Array.from({ length: DEPTH_LAYERS }, (_, i) => {
          const layerIndex = DEPTH_LAYERS - 1 - i
          const yOff = (layerIndex + 1) * DEPTH_STEP
          const opacity = 0.15 + (i / (DEPTH_LAYERS - 1)) * 0.55
          return (
            <Display
              key={layerIndex}
              x={MARGIN}
              y={nameY + yOff}
              size={size}
              fill={DEPTH_COLOR}
              track={2}
              opacity={opacity}
            >
              {NAME}
            </Display>
          )
        })}
        {/* Face — the readable top layer */}
        <Display x={MARGIN} y={nameY} size={size} fill={theme.ink} track={2}>
          {NAME}
        </Display>
      </g>

      {/* ── Subtitle ──────────────────────────────────────────────────── */}
      <g className="fade" style={{ animationDelay: '140ms' }}>
        <Mono x={MARGIN} y={nameY + 38} size={t.bodyS} fill={theme.inkMuted}>
          {`${identity.role.toLowerCase()} · class of ${academics.graduating}`}
        </Mono>
      </g>

      {/* ── Pitch — one tight line ─────────────────────────────────────── */}
      <g className="fade" style={{ animationDelay: '220ms' }}>
        <Mono
          x={MARGIN}
          y={nameY + 68}
          size={t.body}
          fill={theme.inkFaint}
          track={tracking.micro}
        >
          {identity.pitch.toLowerCase()}
        </Mono>
      </g>

      {/* ── Focus — second line ────────────────────────────────────────── */}
      <g className="fade" style={{ animationDelay: '280ms' }}>
        <Mono
          x={MARGIN}
          y={nameY + 94}
          size={t.body}
          fill={theme.inkFaint}
          track={tracking.micro}
        >
          {identity.focus.toLowerCase()}
        </Mono>
      </g>

      {/* ── Factory scene — conveyor belt, gears, products, steam ──── */}
      <g className="fade" style={{ animationDelay: '350ms' }}>
        {/* Steam particles — above the left gear */}
        <circle cx={MARGIN + 14} cy={272} r={4} fill={theme.inkMuted} className="steam" opacity="0.35" />
        <circle cx={MARGIN + 6} cy={268} r={3} fill={theme.inkMuted} className="steam-2" opacity="0.25" />
        <circle cx={MARGIN + 22} cy={270} r={2.5} fill={theme.inkMuted} className="steam" opacity="0.2" style={{ animationDelay: '1.8s' }} />

        {/* Left gear — 12 teeth, spins clockwise */}
        <g className="gear-spin">
          <circle cx={MARGIN + 14} cy={298} r={11} fill="none" stroke={DEPTH_COLOR} strokeWidth={2.5} opacity={0.45} />
          <circle cx={MARGIN + 14} cy={298} r={5.5} fill="none" stroke={DEPTH_COLOR} strokeWidth={1.5} opacity={0.35} />
          <circle cx={MARGIN + 14} cy={298} r={2} fill={DEPTH_COLOR} opacity={0.55} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * 45 * Math.PI) / 180
            const r1 = 9, r2 = 14
            return (
              <line
                key={`gl-${i}`}
                x1={MARGIN + 14 + Math.cos(a) * r1}
                y1={298 + Math.sin(a) * r1}
                x2={MARGIN + 14 + Math.cos(a) * r2}
                y2={298 + Math.sin(a) * r2}
                stroke={DEPTH_COLOR}
                strokeWidth={2.5}
                strokeLinecap="round"
                opacity={0.4}
              />
            )
          })}
        </g>

        {/* Right gear — spins counter-clockwise, offset radius for meshing */}
        <g className="gear-spin-rev">
          <circle cx={W - MARGIN - 14} cy={298} r={8} fill="none" stroke={DEPTH_COLOR} strokeWidth={2} opacity={0.35} />
          <circle cx={W - MARGIN - 14} cy={298} r={4} fill="none" stroke={DEPTH_COLOR} strokeWidth={1.2} opacity={0.28} />
          <circle cx={W - MARGIN - 14} cy={298} r={1.5} fill={DEPTH_COLOR} opacity={0.45} />
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i * 60 * Math.PI) / 180
            const r1 = 6.5, r2 = 10.5
            return (
              <line
                key={`gr-${i}`}
                x1={W - MARGIN - 14 + Math.cos(a) * r1}
                y1={298 + Math.sin(a) * r1}
                x2={W - MARGIN - 14 + Math.cos(a) * r2}
                y2={298 + Math.sin(a) * r2}
                stroke={DEPTH_COLOR}
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.3}
              />
            )
          })}
        </g>

        {/* Conveyor belt — horizontal track with roller wheels */}
        <line
          x1={MARGIN + 26}
          y1={294}
          x2={W - MARGIN - 26}
          y2={294}
          stroke={DEPTH_COLOR}
          strokeWidth={3}
          strokeDasharray="4 2"
          opacity={0.3}
          className="belt-move"
        />
        <line
          x1={MARGIN + 26}
          y1={302}
          x2={W - MARGIN - 26}
          y2={302}
          stroke={DEPTH_COLOR}
          strokeWidth={3}
          strokeDasharray="4 2"
          opacity={0.25}
          className="belt-move"
        />
        {/* Belt rails */}
        <line x1={MARGIN + 26} y1={290} x2={W - MARGIN - 26} y2={290} stroke={DEPTH_COLOR} strokeWidth={1} opacity={0.15} />
        <line x1={MARGIN + 26} y1={306} x2={W - MARGIN - 26} y2={306} stroke={DEPTH_COLOR} strokeWidth={1} opacity={0.15} />
        {/* Belt roller wheels */}
        {[0.2, 0.4, 0.6, 0.8].map((frac, i) => (
          <circle
            key={`rw-${i}`}
            cx={MARGIN + 26 + (W - 2 * MARGIN - 52) * frac}
            cy={298}
            r={2}
            fill="none"
            stroke={DEPTH_COLOR}
            strokeWidth={1}
            opacity={0.2}
          />
        ))}

        {/* Products on belt — small chip-like boxes sliding right-to-left */}
        <g className="product-slide">
          <rect x={0} y={289} width={14} height={7} rx={1.5} fill={DEPTH_COLOR} opacity={0.35} />
          <line x1={2} y1={291} x2={12} y2={291} stroke={theme.ink} strokeWidth={0.5} opacity={0.3} />
          <line x1={2} y1={293.5} x2={9} y2={293.5} stroke={theme.ink} strokeWidth={0.5} opacity={0.2} />
        </g>
        <g className="product-slide-2">
          <rect x={0} y={289} width={14} height={7} rx={1.5} fill={DEPTH_COLOR} opacity={0.35} />
          <line x1={2} y1={291} x2={12} y2={291} stroke={theme.ink} strokeWidth={0.5} opacity={0.3} />
          <line x1={2} y1={293.5} x2={9} y2={293.5} stroke={theme.ink} strokeWidth={0.5} opacity={0.2} />
        </g>
        <g className="product-slide-3">
          <rect x={0} y={289} width={14} height={7} rx={1.5} fill={DEPTH_COLOR} opacity={0.35} />
          <line x1={2} y1={291} x2={12} y2={291} stroke={theme.ink} strokeWidth={0.5} opacity={0.3} />
          <line x1={2} y1={293.5} x2={9} y2={293.5} stroke={theme.ink} strokeWidth={0.5} opacity={0.2} />
        </g>

        {/* Belt label — monospace, small, right-aligned */}
        <text
          x={W - MARGIN}
          y={322}
          fontFamily="ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"
          fontSize="8"
          fill={theme.inkFaint}
          textAnchor="end"
          letterSpacing="1.2"
          opacity={0.5}
        >
          {'build → ship → repeat'}
        </text>
      </g>

      {/* ── Keyed pin ─────────────────────────────────────────────────── */}
      <rect
        x={W - MARGIN - 6}
        y={INTRO_H - 20}
        width={6}
        height={6}
        rx={1}
        fill={theme.accent}
        opacity={0.85}
      />
    </>
  )
}


