/**
 * Intro card — the hero panel, redesigned with a galaxy/space theme.
 *
 * DepthText 3D layered name with purple depthColor, sitting on:
 *   - Dithered noise background (SVG feTurbulence) — animated wave motion
 *   - Multi-layer twinkling starfield (70 stars across 3 depth layers)
 *   - Nebula clouds (feGaussianBlur circles in cyan, violet, amber)
 *   - Shooting stars (animateMotion along diagonal paths)
 *   - Orbital rings around the name
 *   - Galaxy core glow behind the name
 *
 * Subtitle shows role and graduation. Factory scene at bottom.
 *
 * IMPORTANT: GitHub's camo SVG proxy strips <animateTransform> elements.
 * All rotation/translation animations use <animate attributeName="transform">
 * with inline values syntax instead. This has been verified to work.
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

/** Seeded pseudo-random number generator (mulberry32). */
function seededRandom(seed: number) {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Starfield layer config — 3 depth layers for parallax feel. */
const STAR_LAYERS = [
  { count: 40, label: 'bg', rMin: 0.4, rMax: 0.9, oMin: 0.15, oMax: 0.40, durMin: 5, durMax: 9 },
  { count: 20, label: 'mid', rMin: 0.7, rMax: 1.3, oMin: 0.30, oMax: 0.65, durMin: 3.5, durMax: 7 },
  { count: 10, label: 'fg', rMin: 1.1, rMax: 1.8, oMin: 0.55, oMax: 0.9, durMin: 2, durMax: 4.5 },
] as const

/** Accent colours for coloured stars. */
const STAR_COLORS = ['#7c3aed', '#a78bfa', '#c084fc', '#e0e7ff']

export function IntroCard() {
  const theme = useTheme()
  const size = fitDisplay([NAME], CONTENT, t.hero, 2)

  // Centred vertically.
  const nameY = 170
  const nameCenterX = W / 2
  const nameCenterY = nameY - 10

  return (
    <>
      {/* ── Defs — dither filters, nebula blur, glow filters ────── */}
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
            <animate
              attributeName="baseFrequency"
              values="0.62;0.68;0.62"
              dur="20s"
              repeatCount="indefinite"
            />
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

        {/* Nebula blur — large soft glow for nebula clouds */}
        <filter id="nebula-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="40" />
        </filter>

        {/* Star glow — subtle halo for bright foreground stars */}
        <filter id="star-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Core haze gradient — radial glow behind the name */}
        <radialGradient id="core-haze" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={DEPTH_COLOR} stopOpacity="0.3" />
          <stop offset="40%" stopColor={DEPTH_COLOR} stopOpacity="0.12" />
          <stop offset="100%" stopColor={DEPTH_COLOR} stopOpacity="0" />
        </radialGradient>

        {/* Core bright center gradient */}
        <radialGradient id="core-bright" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="50%" stopColor={DEPTH_COLOR} stopOpacity="0.1" />
          <stop offset="100%" stopColor={DEPTH_COLOR} stopOpacity="0" />
        </radialGradient>

        {/* Shooting star gradient — white fade to transparent */}
        <linearGradient id="shoot-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ── Base wave layer (dither) ────────────────────────────── */}
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

      {/* ═══════════════════════════════════════════════════════════════
       * GALAXY LAYERS — nebula, starfield, core glow, orbital rings
       * ───────────────────────────────────────────────────────────────
       * Rendered between dither and text for depth layering.
       * All animations use <animate> (NOT <animateTransform>) because
       * GitHub's camo SVG proxy strips animateTransform elements.
       * ═══════════════════════════════════════════════════════════════ */}

      {/* ── Nebula clouds — large blurred colour blobs ───────────── */}
      <g opacity="0.8">
        {/* Cyan nebula — upper left */}
        <circle cx={W * 0.2} cy={INTRO_H * 0.3} r={100}
          fill="#7c3aed" opacity="0.07" filter="url(#nebula-blur)">
          <animate attributeName="opacity" values="0.07;0.12;0.07" dur="12s" repeatCount="indefinite" />
        </circle>
        {/* Violet nebula — right side */}
        <circle cx={W * 0.75} cy={INTRO_H * 0.25} r={90}
          fill="#a78bfa" opacity="0.06" filter="url(#nebula-blur)">
          <animate attributeName="opacity" values="0.06;0.1;0.06" dur="15s" begin="3s" repeatCount="indefinite" />
        </circle>
        {/* Amber nebula — bottom center */}
        <circle cx={W * 0.5} cy={INTRO_H * 0.7} r={110}
          fill="#c084fc" opacity="0.05" filter="url(#nebula-blur)">
          <animate attributeName="opacity" values="0.05;0.08;0.05" dur="18s" begin="6s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* ── Starfield — 3 depth layers with twinkle ─────────────── */}
      <g>
        {STAR_LAYERS.map((layer) => {
          const rng = seededRandom(
            layer.label === 'bg' ? 42 : layer.label === 'mid' ? 137 : 256
          )
          return Array.from({ length: layer.count }, (_, i) => {
            const cx = 10 + rng() * (W - 20)
            const cy = 10 + rng() * (INTRO_H - 20)
            const r = layer.rMin + rng() * (layer.rMax - layer.rMin)
            const opacity = layer.oMin + rng() * (layer.oMax - layer.oMin)
            const dur = layer.durMin + rng() * (layer.durMax - layer.durMin)
            const delay = rng() * dur
            const color = i % 5 === 0
              ? STAR_COLORS[Math.floor(rng() * STAR_COLORS.length)]
              : '#ffffff'
            const isBright = layer.label === 'fg' && rng() > 0.5

            return (
              <circle
                key={`${layer.label}-${i}`}
                cx={cx}
                cy={cy}
                r={r}
                fill={color}
                opacity={opacity}
                filter={isBright ? 'url(#star-glow)' : undefined}
              >
                <animate
                  attributeName="opacity"
                  values={`${opacity};${opacity * 2.2};${opacity}`}
                  dur={`${dur.toFixed(1)}s`}
                  begin={`${delay.toFixed(1)}s`}
                  repeatCount="indefinite"
                />
              </circle>
            )
          })
        })}
      </g>

      {/* ── Galaxy core glow — radial light behind the name ─────── */}
      <g>
        {/* Outer haze */}
        <circle cx={nameCenterX} cy={nameCenterY} r={80}
          fill="url(#core-haze)">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="8s" repeatCount="indefinite" />
        </circle>
        {/* Inner bright center */}
        <circle cx={nameCenterX} cy={nameCenterY} r={40}
          fill="url(#core-bright)">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="6s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* ── Orbital rings — elliptical orbits around the name ────── */}
      <g>
        {/* Ring 1 — inner, cyan */}
        <ellipse
          cx={nameCenterX}
          cy={nameCenterY}
          rx={60}
          ry={20}
          fill="none"
          stroke={DEPTH_COLOR}
          strokeWidth={0.8}
          strokeDasharray="4 6"
          opacity={0.3}
        >
          <animate
            attributeName="transform"
            values={`rotate(0 ${nameCenterX} ${nameCenterY});rotate(360 ${nameCenterX} ${nameCenterY})`}
            dur="20s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0.45;0.3"
            dur="8s"
            repeatCount="indefinite"
          />
        </ellipse>
        {/* Ring 2 — outer, violet, counter-rotation */}
        <ellipse
          cx={nameCenterX}
          cy={nameCenterY}
          rx={85}
          ry={28}
          fill="none"
          stroke="#a78bfa"
          strokeWidth={0.7}
          strokeDasharray="3 8"
          opacity={0.2}
        >
          <animate
            attributeName="transform"
            values={`rotate(360 ${nameCenterX} ${nameCenterY});rotate(0 ${nameCenterX} ${nameCenterY})`}
            dur="30s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.2;0.35;0.2"
            dur="10s"
            begin="2s"
            repeatCount="indefinite"
          />
        </ellipse>
      </g>

      {/* ── Shooting stars — 3 comets on diagonal paths ─────────── */}
      <g>
        {/* Comet 1 — top-left to center */}
        <line
          x1={W * 0.08}
          y1={INTRO_H * 0.12}
          x2={W * 0.08 + 25}
          y2={INTRO_H * 0.12 + 6}
          stroke="url(#shoot-grad)"
          strokeWidth={1.8}
          strokeLinecap="round"
          opacity={0}
        >
          <animate
            attributeName="opacity"
            values="0;0.9;0.6;0;0"
            keyTimes="0;0.04;0.12;0.18;1"
            dur="7s"
            repeatCount="indefinite"
          />
          <animateMotion
            path={`M0,0 L${W * 0.35},${INTRO_H * 0.28}`}
            dur="7s"
            repeatCount="indefinite"
          />
        </line>
        {/* Comet 2 — top-right toward center */}
        <line
          x1={W * 0.82}
          y1={INTRO_H * 0.08}
          x2={W * 0.82 + 22}
          y2={INTRO_H * 0.08 + 5}
          stroke="url(#shoot-grad)"
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0}
        >
          <animate
            attributeName="opacity"
            values="0;1;0.7;0;0"
            keyTimes="0;0.04;0.12;0.18;1"
            dur="9s"
            begin="3s"
            repeatCount="indefinite"
          />
          <animateMotion
            path={`M0,0 L${-W * 0.25},${INTRO_H * 0.22}`}
            dur="9s"
            begin="3s"
            repeatCount="indefinite"
          />
        </line>
        {/* Comet 3 — bottom-left upward */}
        <line
          x1={W * 0.15}
          y1={INTRO_H * 0.75}
          x2={W * 0.15 + 20}
          y2={INTRO_H * 0.75 - 4}
          stroke="url(#shoot-grad)"
          strokeWidth={1.2}
          strokeLinecap="round"
          opacity={0}
        >
          <animate
            attributeName="opacity"
            values="0;0.9;0.5;0;0"
            keyTimes="0;0.05;0.14;0.2;1"
            dur="8s"
            begin="5.5s"
            repeatCount="indefinite"
          />
          <animateMotion
            path={`M0,0 L${W * 0.2},${-INTRO_H * 0.3}`}
            dur="8s"
            begin="5.5s"
            repeatCount="indefinite"
          />
        </line>
      </g>

      {/* ═══════════════════════════════════════════════════════════════
       * TEXT LAYERS — name, subtitle, pitch, focus
       * ═══════════════════════════════════════════════════════════════ */}

      {/* ── DepthText — 3D layered name ──────────────────────────── */}
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

      {/* ── Subtitle ────────────────────────────────────────────── */}
      <g className="fade" style={{ animationDelay: '140ms' }}>
        <Mono x={MARGIN} y={nameY + 38} size={t.bodyS} fill={theme.inkMuted}>
          {`${identity.role.toLowerCase()} · class of ${academics.graduating}`}
        </Mono>
      </g>

      {/* ── Pitch — one tight line ───────────────────────────────── */}
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

      {/* ── Focus — second line ──────────────────────────────────── */}
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
       *
       * All animations use SMIL <animate> elements (NOT <animateTransform>
       * — GitHub strips animateTransform but keeps animate). This is the
       * same technique that makes the dither background wave animation work.
       * SMIL <animate> on the transform attribute uses inline values syntax.
       * ═══════════════════════════════════════════════════════════════ */}

      {/* ── PCB Traces — marching dashes via SMIL ──────────────── */}
      <g>
        <line
          x1={MARGIN + 50} y1={252}
          x2={MARGIN + 50} y2={286}
          stroke={DEPTH_COLOR} strokeWidth={1.5}
          strokeDasharray="3 3" opacity={0.4}
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-48" dur="6s" repeatCount="indefinite" />
        </line>
        <circle cx={MARGIN + 50} cy={286} r={2} fill={DEPTH_COLOR} opacity={0.55} />

        <polyline
          points={`${MARGIN + 160},252 ${MARGIN + 160},268 ${MARGIN + 140},268 ${MARGIN + 140},286`}
          fill="none" stroke={DEPTH_COLOR} strokeWidth={1.5}
          strokeDasharray="3 3" opacity={0.4}
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-48" dur="6s" repeatCount="indefinite" />
        </polyline>
        <circle cx={MARGIN + 160} cy={268} r={2} fill={DEPTH_COLOR} opacity={0.55} />
        <circle cx={MARGIN + 140} cy={268} r={2} fill={DEPTH_COLOR} opacity={0.55} />

        <polyline
          points={`${W - MARGIN - 100},252 ${W - MARGIN - 100},274 ${W - MARGIN - 80},274 ${W - MARGIN - 80},286`}
          fill="none" stroke={DEPTH_COLOR} strokeWidth={1.5}
          strokeDasharray="3 3" opacity={0.4}
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-48" dur="6s" repeatCount="indefinite" />
        </polyline>
        <circle cx={W - MARGIN - 100} cy={274} r={2} fill={DEPTH_COLOR} opacity={0.55} />
        <circle cx={W - MARGIN - 80} cy={274} r={2} fill={DEPTH_COLOR} opacity={0.55} />
      </g>

      {/* ── Steam particles — fade + rise via SMIL ─────────────── */}
      <g>
        <circle cx={MARGIN + 10} cy={275} r={3.5} fill={theme.inkMuted} opacity={0.55}>
          <animate attributeName="opacity" values="0.55;0" dur="4s" repeatCount="indefinite" />
          <animate attributeName="transform" values="translate(0,0);translate(0,-22)" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx={MARGIN + 20} cy={270} r={2.5} fill={theme.inkMuted} opacity={0.45}>
          <animate attributeName="opacity" values="0.45;0" dur="4.5s" begin="1.2s" repeatCount="indefinite" />
          <animate attributeName="transform" values="translate(0,0);translate(0,-18)" dur="4.5s" begin="1.2s" repeatCount="indefinite" />
        </circle>
        <circle cx={MARGIN + 5} cy={272} r={2} fill={theme.inkMuted} opacity={0.4}>
          <animate attributeName="opacity" values="0.4;0" dur="4s" begin="2.4s" repeatCount="indefinite" />
          <animate attributeName="transform" values="translate(0,0);translate(0,-20)" dur="4s" begin="2.4s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* ── Left gear — 10 teeth, clockwise 6s via SMIL ────────── */}
      <g>
        <circle cx={MARGIN + 14} cy={298} r={12} fill="none" stroke={DEPTH_COLOR} strokeWidth={2} opacity={0.55} />
        <circle cx={MARGIN + 14} cy={298} r={7} fill="none" stroke={DEPTH_COLOR} strokeWidth={1.2} opacity={0.45} />
        <circle cx={MARGIN + 14} cy={298} r={2} fill={DEPTH_COLOR} opacity={0.65} />
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
        <animate
          attributeName="transform"
          values={`rotate(0 ${MARGIN + 14} 298);rotate(360 ${MARGIN + 14} 298)`}
          dur="6s" repeatCount="indefinite"
        />
      </g>

      {/* ── Right gear — 8 teeth, counter-clockwise 5s via SMIL ── */}
      <g>
        <circle cx={W - MARGIN - 14} cy={298} r={9} fill="none" stroke={DEPTH_COLOR} strokeWidth={1.8} opacity={0.5} />
        <circle cx={W - MARGIN - 14} cy={298} r={5} fill="none" stroke={DEPTH_COLOR} strokeWidth={1} opacity={0.4} />
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
        <animate
          attributeName="transform"
          values={`rotate(0 ${W - MARGIN - 14} 298);rotate(-360 ${W - MARGIN - 14} 298)`}
          dur="5s" repeatCount="indefinite"
        />
      </g>

      {/* ── Conveyor belt — marching dashes via SMIL ────────────── */}
      <g>
        <line x1={MARGIN + 28} y1={289} x2={W - MARGIN - 28} y2={289}
          stroke={DEPTH_COLOR} strokeWidth={1} opacity={0.3} />
        <line x1={MARGIN + 28} y1={307} x2={W - MARGIN - 28} y2={307}
          stroke={DEPTH_COLOR} strokeWidth={1} opacity={0.3} />

        <line
          x1={MARGIN + 28} y1={293}
          x2={W - MARGIN - 28} y2={293}
          stroke={DEPTH_COLOR} strokeWidth={2.5}
          strokeDasharray="4 2" opacity={0.45}
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="4s" repeatCount="indefinite" />
        </line>
        <line
          x1={MARGIN + 28} y1={303}
          x2={W - MARGIN - 28} y2={303}
          stroke={DEPTH_COLOR} strokeWidth={2.5}
          strokeDasharray="4 2" opacity={0.4}
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="4s" repeatCount="indefinite" />
        </line>

        {[0.15, 0.35, 0.55, 0.75, 0.95].map((frac, i) => (
          <circle
            key={`rw-${i}`}
            cx={MARGIN + 28 + (W - 2 * MARGIN - 56) * frac}
            cy={298} r={1.8}
            fill="none" stroke={DEPTH_COLOR}
            strokeWidth={0.8} opacity={0.35}
          />
        ))}
      </g>

      {/* ── Products on belt — slide right-to-left via SMIL ────── */}

      {/* Product A — IC chip */}
      <g>
        <rect x={0} y={290} width={16} height={8} rx={1.5}
          fill={DEPTH_COLOR} opacity={0.55} />
        <line x1={-2} y1={292} x2={0} y2={292} stroke={DEPTH_COLOR} strokeWidth={0.8} opacity={0.45} />
        <line x1={-2} y1={294.5} x2={0} y2={294.5} stroke={DEPTH_COLOR} strokeWidth={0.8} opacity={0.45} />
        <line x1={-2} y1={297} x2={0} y2={297} stroke={DEPTH_COLOR} strokeWidth={0.8} opacity={0.45} />
        <line x1={16} y1={292} x2={18} y2={292} stroke={DEPTH_COLOR} strokeWidth={0.8} opacity={0.45} />
        <line x1={16} y1={294.5} x2={18} y2={294.5} stroke={DEPTH_COLOR} strokeWidth={0.8} opacity={0.45} />
        <line x1={16} y1={297} x2={18} y2={297} stroke={DEPTH_COLOR} strokeWidth={0.8} opacity={0.45} />
        <rect x={4} y={292} width={8} height={4} rx={0.5}
          fill="none" stroke={theme.ink} strokeWidth={0.4} opacity={0.35} />
        <animate attributeName="transform" values="translate(180,0);translate(-30,0)" dur="3.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.55;0.55;0" keyTimes="0;0.05;0.9;1"
          dur="3.5s" repeatCount="indefinite" />
      </g>

      {/* Product B — PCB board */}
      <g>
        <rect x={0} y={290} width={20} height={7} rx={1}
          fill="none" stroke={DEPTH_COLOR} strokeWidth={1.2} opacity={0.5} />
        <line x1={2} y1={292} x2={18} y2={292} stroke={DEPTH_COLOR} strokeWidth={0.5} opacity={0.4} />
        <line x1={2} y1={294.5} x2={13} y2={294.5} stroke={DEPTH_COLOR} strokeWidth={0.5} opacity={0.35} />
        <line x1={6} y1={291} x2={6} y2={296} stroke={DEPTH_COLOR} strokeWidth={0.4} opacity={0.3} />
        <line x1={14} y1={291} x2={14} y2={296} stroke={DEPTH_COLOR} strokeWidth={0.4} opacity={0.3} />
        <circle cx={3} cy={293.5} r={0.8} fill={DEPTH_COLOR} opacity={0.4} />
        <circle cx={17} cy={293.5} r={0.8} fill={DEPTH_COLOR} opacity={0.4} />
        <animate attributeName="transform" values="translate(180,0);translate(-30,0)" dur="4s" begin="1.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.5;0.5;0" keyTimes="0;0.05;0.9;1"
          dur="4s" begin="1.2s" repeatCount="indefinite" />
      </g>

      {/* Product C — Sensor module */}
      <g>
        <circle cx={8} cy={293.5} r={5}
          fill="none" stroke={DEPTH_COLOR} strokeWidth={1.2} opacity={0.5} />
        <circle cx={8} cy={293.5} r={2}
          fill={DEPTH_COLOR} opacity={0.4} />
        <line x1={3} y1={298.5} x2={3} y2={301} stroke={DEPTH_COLOR} strokeWidth={0.6} opacity={0.4} />
        <line x1={8} y1={298.5} x2={8} y2={301} stroke={DEPTH_COLOR} strokeWidth={0.6} opacity={0.4} />
        <line x1={13} y1={298.5} x2={13} y2={301} stroke={DEPTH_COLOR} strokeWidth={0.6} opacity={0.4} />
        <animate attributeName="transform" values="translate(180,0);translate(-30,0)" dur="4.5s" begin="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.5;0.5;0" keyTimes="0;0.05;0.9;1"
          dur="4.5s" begin="2.4s" repeatCount="indefinite" />
      </g>

      {/* ── Belt label ──────────────────────────────────────────── */}
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

      {/* ── Keyed pin ───────────────────────────────────────────── */}
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
