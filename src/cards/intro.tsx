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

      {/* ═══════════════════════════════════════════════════════════════
       * FACTORY SCENE — PCB traces, gears, conveyor, products, steam
       * ───────────────────────────────────────────────────────────────
       * Layout:
       *   y 252-278  PCB traces (vertical, right-angle bends)
       *   y 286-310  Conveyor belt + gears + products
       *   y 265-280  Steam particles (above left gear)
       *   y 322      "build → ship → repeat" label
       * ═══════════════════════════════════════════════════════════════ */}

      {/* ── PCB Traces — signal flow from name to factory ────────────
       * Three vertical traces with right-angle bends, marching dashes.
       * Uses stroke-dasharray + animated stroke-dashoffset (the "marching
       * ants" technique). Each trace has a junction pad (small circle) at
       * the bend point, like real PCB routing.
       * ────────────────────────────────────────────────────────────── */}
      <g className="pcb-trace" style={{ animationDelay: '300ms' }}>
        {/* Left trace — straight down from name area to belt */}
        <line
          x1={MARGIN + 50} y1={252}
          x2={MARGIN + 50} y2={286}
          stroke={DEPTH_COLOR} strokeWidth={1.5}
          strokeDasharray="3 3" opacity={0.4}
        />
        <circle cx={MARGIN + 50} cy={286} r={2} fill={DEPTH_COLOR} opacity={0.55} />

        {/* Centre trace — vertical with right-angle jog */}
        <polyline
          points={`${MARGIN + 160},252 ${MARGIN + 160},268 ${MARGIN + 140},268 ${MARGIN + 140},286`}
          fill="none" stroke={DEPTH_COLOR} strokeWidth={1.5}
          strokeDasharray="3 3" opacity={0.4}
        />
        <circle cx={MARGIN + 160} cy={268} r={2} fill={DEPTH_COLOR} opacity={0.55} />
        <circle cx={MARGIN + 140} cy={268} r={2} fill={DEPTH_COLOR} opacity={0.55} />

        {/* Right trace — longer jog to reach far side of belt */}
        <polyline
          points={`${W - MARGIN - 100},252 ${W - MARGIN - 100},274 ${W - MARGIN - 80},274 ${W - MARGIN - 80},286`}
          fill="none" stroke={DEPTH_COLOR} strokeWidth={1.5}
          strokeDasharray="3 3" opacity={0.4}
        />
        <circle cx={W - MARGIN - 100} cy={274} r={2} fill={DEPTH_COLOR} opacity={0.55} />
        <circle cx={W - MARGIN - 80} cy={274} r={2} fill={DEPTH_COLOR} opacity={0.55} />
      </g>

      {/* ── Steam particles ─────────────────────────────────────────
       * Three circles that drift upward and fade. Staggered delays
       * so they don't pulse in sync. Larger particles = closer.
       * ────────────────────────────────────────────────────────────── */}
      <g className="fade" style={{ animationDelay: '750ms' }}>
        <circle cx={MARGIN + 10} cy={275} r={3.5} fill={theme.inkMuted} className="steam" opacity={0.55} />
        <circle cx={MARGIN + 20} cy={270} r={2.5} fill={theme.inkMuted} className="steam-2" opacity={0.45} />
        <circle cx={MARGIN + 5}  cy={272} r={2}   fill={theme.inkMuted} className="steam" opacity={0.4} style={{ animationDelay: '2.4s' }} />
      </g>

      {/* ── Left gear — 10 teeth, clockwise, 6s ─────────────────────
       * Structure: outer ring (tooth tips), inner ring (tooth roots),
       * hub circle, axle dot. Teeth are lines from inner to outer radius.
       * transform-box:fill-box + transform-origin:center ensures rotation
       * around the gear's own centre (learned from Spacey6849).
       * ────────────────────────────────────────────────────────────── */}
      <g className="gear-spin" style={{ animationDelay: '450ms' }}>
        <circle cx={MARGIN + 14} cy={298} r={12} fill="none" stroke={DEPTH_COLOR} strokeWidth={2} opacity={0.55} />
        <circle cx={MARGIN + 14} cy={298} r={7}  fill="none" stroke={DEPTH_COLOR} strokeWidth={1.2} opacity={0.45} />
        <circle cx={MARGIN + 14} cy={298} r={2}  fill={DEPTH_COLOR} opacity={0.65} />
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i * 36 * Math.PI) / 180
          const r1 = 10, r2 = 14.5
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
              opacity={0.5}
            />
          )
        })}
      </g>

      {/* ── Right gear — 8 teeth, counter-clockwise, 5s ─────────────
       * Smaller than the left gear. Meshes visually because the
       * counter-rotation and different tooth count create the illusion
       * of interlocking.
       * ────────────────────────────────────────────────────────────── */}
      <g className="gear-spin-rev" style={{ animationDelay: '500ms' }}>
        <circle cx={W - MARGIN - 14} cy={298} r={9}  fill="none" stroke={DEPTH_COLOR} strokeWidth={1.8} opacity={0.5} />
        <circle cx={W - MARGIN - 14} cy={298} r={5}  fill="none" stroke={DEPTH_COLOR} strokeWidth={1}   opacity={0.4} />
        <circle cx={W - MARGIN - 14} cy={298} r={1.5} fill={DEPTH_COLOR} opacity={0.6} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * 45 * Math.PI) / 180
          const r1 = 7.5, r2 = 11.5
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
              opacity={0.45}
            />
          )
        })}
      </g>

      {/* ── Conveyor belt ───────────────────────────────────────────
       * Two parallel dashed tracks (top + bottom) with marching-dash
       * animation. Solid rails above and below. Four roller wheels at
       * even intervals. The belt spans from left gear to right gear.
       * ────────────────────────────────────────────────────────────── */}
      <g className="fade" style={{ animationDelay: '550ms' }}>
        {/* Rails */}
        <line x1={MARGIN + 28} y1={289} x2={W - MARGIN - 28} y2={289}
          stroke={DEPTH_COLOR} strokeWidth={1} opacity={0.3} />
        <line x1={MARGIN + 28} y1={307} x2={W - MARGIN - 28} y2={307}
          stroke={DEPTH_COLOR} strokeWidth={1} opacity={0.3} />

        {/* Track — top */}
        <line
          x1={MARGIN + 28} y1={293}
          x2={W - MARGIN - 28} y2={293}
          stroke={DEPTH_COLOR} strokeWidth={2.5}
          strokeDasharray="4 2" opacity={0.45}
          className="belt-move"
        />
        {/* Track — bottom */}
        <line
          x1={MARGIN + 28} y1={303}
          x2={W - MARGIN - 28} y2={303}
          stroke={DEPTH_COLOR} strokeWidth={2.5}
          strokeDasharray="4 2" opacity={0.4}
          className="belt-move"
        />

        {/* Roller wheels */}
        {[0.15, 0.35, 0.55, 0.75, 0.95].map((frac, i) => (
          <circle
            key={`rw-${i}`}
            cx={MARGIN + 28 + (W - 2 * MARGIN - 56) * frac}
            cy={298}
            r={1.8}
            fill="none" stroke={DEPTH_COLOR}
            strokeWidth={0.8} opacity={0.35}
          />
        ))}
      </g>

      {/* ── Products on belt — three distinct types ─────────────────
       * Each product slides right-to-left with a different speed and
       * stagger delay, creating the feel of a real production line.
       *
       * Product A — IC chip: black rectangle with gold pin stubs
       *   on left/right edges. Represents embedded firmware work.
       *
       * Product B — PCB board: wider rectangle with horizontal
       *   trace lines. Represents hardware design.
       *
       * Product C — Sensor module: circle with vertical pin lines.
       *   Represents IoT / sensor integration.
       * ────────────────────────────────────────────────────────────── */}

      {/* Product A — IC chip */}
      <g className="product-a" style={{ animationDelay: '650ms' }}>
        <rect x={0} y={290} width={16} height={8} rx={1.5}
          fill={DEPTH_COLOR} opacity={0.55} />
        {/* Left pins */}
        <line x1={-2} y1={292} x2={0} y2={292} stroke={DEPTH_COLOR} strokeWidth={0.8} opacity={0.45} />
        <line x1={-2} y1={294.5} x2={0} y2={294.5} stroke={DEPTH_COLOR} strokeWidth={0.8} opacity={0.45} />
        <line x1={-2} y1={297} x2={0} y2={297} stroke={DEPTH_COLOR} strokeWidth={0.8} opacity={0.45} />
        {/* Right pins */}
        <line x1={16} y1={292} x2={18} y2={292} stroke={DEPTH_COLOR} strokeWidth={0.8} opacity={0.45} />
        <line x1={16} y1={294.5} x2={18} y2={294.5} stroke={DEPTH_COLOR} strokeWidth={0.8} opacity={0.45} />
        <line x1={16} y1={297} x2={18} y2={297} stroke={DEPTH_COLOR} strokeWidth={0.8} opacity={0.45} />
        {/* Die mark */}
        <rect x={4} y={292} width={8} height={4} rx={0.5}
          fill="none" stroke={theme.ink} strokeWidth={0.4} opacity={0.35} />
      </g>

      {/* Product B — PCB board */}
      <g className="product-b" style={{ animationDelay: '700ms' }}>
        <rect x={0} y={290} width={20} height={7} rx={1}
          fill="none" stroke={DEPTH_COLOR} strokeWidth={1.2} opacity={0.5} />
        {/* Traces on the board */}
        <line x1={2} y1={292} x2={18} y2={292} stroke={DEPTH_COLOR} strokeWidth={0.5} opacity={0.4} />
        <line x1={2} y1={294.5} x2={13} y2={294.5} stroke={DEPTH_COLOR} strokeWidth={0.5} opacity={0.35} />
        <line x1={6} y1={291} x2={6} y2={296} stroke={DEPTH_COLOR} strokeWidth={0.4} opacity={0.3} />
        <line x1={14} y1={291} x2={14} y2={296} stroke={DEPTH_COLOR} strokeWidth={0.4} opacity={0.3} />
        {/* Solder pads */}
        <circle cx={3} cy={293.5} r={0.8} fill={DEPTH_COLOR} opacity={0.4} />
        <circle cx={17} cy={293.5} r={0.8} fill={DEPTH_COLOR} opacity={0.4} />
      </g>

      {/* Product C — Sensor module */}
      <g className="product-c" style={{ animationDelay: '750ms' }}>
        <circle cx={8} cy={293.5} r={5}
          fill="none" stroke={DEPTH_COLOR} strokeWidth={1.2} opacity={0.5} />
        <circle cx={8} cy={293.5} r={2}
          fill={DEPTH_COLOR} opacity={0.4} />
        {/* Pin legs */}
        <line x1={3} y1={298.5} x2={3} y2={301} stroke={DEPTH_COLOR} strokeWidth={0.6} opacity={0.4} />
        <line x1={8} y1={298.5} x2={8} y2={301} stroke={DEPTH_COLOR} strokeWidth={0.6} opacity={0.4} />
        <line x1={13} y1={298.5} x2={13} y2={301} stroke={DEPTH_COLOR} strokeWidth={0.6} opacity={0.4} />
      </g>

      {/* ── Belt label ────────────────────────────────────────────── */}
      <g className="fade" style={{ animationDelay: '850ms' }}>
        <text
          x={W - MARGIN}
          y={322}
          fontFamily="ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"
          fontSize="8"
          fill={theme.inkFaint}
          textAnchor="end"
          letterSpacing="1.2"
          opacity={0.65}
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


