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

export const INTRO_H = 350

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


