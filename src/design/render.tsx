/**
 * Poster shell: turns a React tree into a standalone, self-contained .svg.
 *
 * Constraints this file exists to satisfy — GitHub renders README images inside
 * an <img>, proxied through camo.githubusercontent.com, which puts the SVG in
 * "secure animated mode":
 *
 *   - No scripts.        React runs at build time only.
 *   - No external URLs.  No @import, no remote <image>, no linked webfonts.
 *   - No interactivity.  An <a> inside is dead, and so is `currentColor`.
 *   - Animation DOES run. CSS keyframes and SMIL both play. That is the only
 *                        dynamism available, so it carries the whole design.
 *
 * Two further rules, both learned the hard way and both load-bearing:
 *
 *   Nothing is hidden by an attribute. Entrance animations start from
 *   `opacity: 0` inside @keyframes only, so if a sanitiser ever strips <style>
 *   the poster still renders — just static, never blank.
 *
 *   The tree is rendered through a real React <svg> root. Outside the SVG
 *   namespace React treats `linearGradient`, `radialGradient` and `clipPath` as
 *   unknown HTML elements and lowercases them, which silently kills every
 *   gradient and clip in the file.
 */
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { GlyphRegistry, withRegistry } from './text'
import { W, motion, spectrumStops, type Theme } from './tokens'

const r1 = (n: number) => Math.round(n * 10) / 10

// ---------------------------------------------------------------------------
// Theme plumbing
// ---------------------------------------------------------------------------

const ThemeContext = React.createContext<Theme | null>(null)

export function useTheme(): Theme {
  const theme = React.useContext(ThemeContext)
  if (!theme) throw new Error('Component rendered outside a ThemeContext')
  return theme
}

/** Paint id for the travelling spectrum. Everything accented references this. */
export const SPECTRUM = 'url(#spectrum)'
/** Same gradient, oriented across a horizontal band rather than the page. */
export const SPECTRUM_H = 'url(#spectrumH)'

// ---------------------------------------------------------------------------
// Stylesheet
// ---------------------------------------------------------------------------

/**
 * `transform-box: fill-box` is scoped to the classes that genuinely scale or
 * rotate about their own box. Applying it with `*` also distorts plain
 * translations that compose with an ancestor rotation, which is a very
 * confusing bug to chase down later.
 */
const STYLES = `
.rise,.grow,.ignite,.draw,.blip{transform-box:fill-box}
.rise{animation:rise .85s ${motion.ease} both}
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.fade{animation:fade .9s ${motion.ease} both}
@keyframes fade{from{opacity:0}to{opacity:1}}
.grow{transform-origin:left center;animation:grow 1.1s ${motion.ease} both}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.ignite{animation:ignite .55s ${motion.ease} both}
@keyframes ignite{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
.draw{animation:draw 2.2s ${motion.ease} both}
@keyframes draw{from{stroke-dashoffset:var(--len)}to{stroke-dashoffset:0}}
.blip{transform-origin:center;animation:blip 3.4s ease-in-out infinite}
@keyframes blip{0%,100%{opacity:.25;transform:scale(.7)}50%{opacity:.9;transform:scale(1.15)}}
.drift{animation:drift 34s ease-in-out infinite}
@keyframes drift{0%,100%{transform:translate(0,0)}50%{transform:translate(26px,-18px)}}
.driftB{animation:driftB 41s ease-in-out infinite}
@keyframes driftB{0%,100%{transform:translate(0,0)}50%{transform:translate(-30px,20px)}}
@media (prefers-reduced-motion:reduce){
.rise,.fade,.grow,.ignite,.draw{animation-duration:.01s}
.rise{transform:none}
.drift,.driftB{animation:none}
.blip{opacity:.6;transform:none;animation:none}
}
`.trim()

// ---------------------------------------------------------------------------
// Signal traces
// ---------------------------------------------------------------------------

/**
 * One horizontal signal, sampled across `span`, deterministic to the digit —
 * no Math.random anywhere near the render, or the daily workflow would commit
 * noise. Every waveform is built from whole cycles across one poster width,
 * which is what makes the drift loop seamless: shift by exactly W and the
 * window lands on a shape identical to where it started.
 */
function tracePath(kind: 'sine' | 'clock' | 'analog', y: number, span: number): string {
  const pts: string[] = []
  const step = 9
  for (let x = 0; x <= span; x += step) {
    const u = (x / W) * Math.PI * 2
    let dy = 0
    if (kind === 'sine') dy = Math.sin(u * 6) * 7
    if (kind === 'clock') dy = ((x / W) * 24) % 1 < 0.5 ? -5.5 : 5.5
    if (kind === 'analog') dy = Math.sin(u * 3 + 1.2) * 4 + Math.sin(u * 11 + 0.4) * 2.5
    pts.push(`${r1(x)} ${r1(y + dy)}`)
  }
  return `M${pts.join('L')}`
}

interface TraceSpec {
  kind: 'sine' | 'clock' | 'analog'
  /** Fraction of poster height the trace sits at. */
  at: number
  /** Base opacity before the theme's field opacity. */
  o: number
  dur: string
}

const TRACES: TraceSpec[] = [
  { kind: 'sine', at: 0.1, o: 0.16, dur: motion.traceDurs[0] },
  { kind: 'clock', at: 0.46, o: 0.12, dur: motion.traceDurs[1] },
  { kind: 'analog', at: 0.8, o: 0.14, dur: motion.traceDurs[2] },
]

/** The three ambient signals, drifting left at different speeds. */
function SignalTraces({ theme, height }: { theme: Theme; height: number }) {
  return (
    <g opacity={theme.fieldOpacity}>
      {TRACES.map((t) => {
        const y = Math.round(height * t.at)
        return (
          <path
            key={t.kind}
            d={tracePath(t.kind, y, W * 2)}
            fill="none"
            stroke="url(#spectrumH)"
            strokeWidth={1.1}
            opacity={t.o}
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to={`${-W} 0`}
              dur={t.dur}
              repeatCount="indefinite"
            />
          </path>
        )
      })}
    </g>
  )
}

/**
 * The scan: a soft band of light travelling top to bottom, like an instrument
 * re-sweeping its display. The hard restart at the bottom is deliberate — a
 * scan that bounced back would read as a screensaver.
 */
function ScanBand({ theme, height }: { theme: Theme; height: number }) {
  const band = 110
  return (
    <rect width={W} height={band} fill="url(#scanGrad)" opacity={theme.fieldOpacity * 1.4}>
      <animateTransform
        attributeName="transform"
        type="translate"
        from={`0 ${-band}`}
        to={`0 ${height + band}`}
        dur={motion.scanDur}
        repeatCount="indefinite"
      />
    </rect>
  )
}

// ---------------------------------------------------------------------------
// Defs
// ---------------------------------------------------------------------------

/**
 * The spectrum, defined twice.
 *
 * `spectrum` spans the poster diagonally in user space, so an element's hue
 * depends on where it sits — the poster reads as one gradient sampled in many
 * places. `spectrumH` spans a single horizontal band, for bars and rules that
 * should show the full sweep within their own width.
 *
 * Both hold two full turns and translate by exactly one turn per cycle, so the
 * loop restarts with the second turn sitting precisely where the first began
 * and there is no visible jump. SMIL rather than CSS because `gradientTransform`
 * is a presentation attribute that CSS `transform` does not map onto.
 */
function SpectrumDefs({ theme, height }: { theme: Theme; height: number }) {
  const stops = spectrumStops(theme.spectrum)
  const diagX = W * 1.6
  const diagY = height * 1.15

  return (
    <>
      <linearGradient id="spectrum" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={diagX} y2={diagY}>
        {stops.map((s) => (
          <stop key={s.offset} offset={s.offset} stopColor={s.color} />
        ))}
        <animateTransform
          attributeName="gradientTransform"
          type="translate"
          from="0 0"
          to={`${diagX / 2} ${diagY / 2}`}
          dur={motion.spectrumDur}
          repeatCount="indefinite"
        />
      </linearGradient>

      <linearGradient id="spectrumH" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0">
        {stops.map((s) => (
          <stop key={s.offset} offset={s.offset} stopColor={s.color} />
        ))}
        <animateTransform
          attributeName="gradientTransform"
          type="translate"
          from="0 0"
          to="0.5 0"
          dur={motion.spectrumDur}
          repeatCount="indefinite"
        />
      </linearGradient>

      {theme.spectrum.map((hue, i) => (
        <radialGradient key={hue} id={`bloom${i}`}>
          <stop offset="0%" stopColor={hue} stopOpacity="0.5" />
          <stop offset="55%" stopColor={hue} stopOpacity="0.12" />
          <stop offset="100%" stopColor={hue} stopOpacity="0" />
        </radialGradient>
      ))}

      {/* Soft vertical band for the scan sweep. */}
      <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={theme.spectrum[0]} stopOpacity="0" />
        <stop offset="0.5" stopColor={theme.spectrum[1]} stopOpacity="0.14" />
        <stop offset="1" stopColor={theme.spectrum[2]} stopOpacity="0" />
      </linearGradient>

      {/* Fade-in/out cap for the spine pulse, so the packet never pops in or
          out at the ends of its run. */}
      <linearGradient id="spinePulse" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={theme.spectrum[1]} stopOpacity="0" />
        <stop offset="0.5" stopColor={theme.spectrum[1]} stopOpacity="0.9" />
        <stop offset="1" stopColor={theme.spectrum[1]} stopOpacity="0" />
      </linearGradient>
    </>
  )
}

/**
 * Ambient depth, in three registered layers:
 *
 *   blooms   three slow spectrum glows drifting out of phase
 *   lattice  the existing fine dot grid
 *   graticule an oscilloscope grid — hairlines every 45px, heavier every 225px
 *
 * On top of the field sit the signal traces and the scan band, which carry the
 * poster's identity: this is the page Joel's projects actually live on — a
 * bench instrument — not a generic dark dashboard. All of it is deliberately
 * quiet: atmosphere you register rather than an element you look at.
 */
function AmbientField({ theme, height }: { theme: Theme; height: number }) {
  const o = theme.fieldOpacity
  return (
    <>
      <g opacity={o}>
        <circle className="drift" cx={W * 0.12} cy={height * 0.06} r={340} fill="url(#bloom0)" />
        <circle className="driftB" cx={W * 0.94} cy={height * 0.42} r={380} fill="url(#bloom1)" />
        <circle className="drift" cx={W * 0.2} cy={height * 0.86} r={360} fill="url(#bloom2)" />
        <rect width={W} height={height} fill="url(#lattice)" opacity={theme.name === 'dark' ? 0.5 : 0.7} />
        <rect width={W} height={height} fill="url(#graticule)" opacity={theme.name === 'dark' ? 0.75 : 1} />
        <rect width={W} height={height} fill="url(#graticuleMajor)" opacity={theme.name === 'dark' ? 0.9 : 1} />
      </g>
      <SignalTraces theme={theme} height={height} />
      <ScanBand theme={theme} height={height} />
    </>
  )
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

export interface PosterOptions {
  theme: Theme
  height: number
  title: string
  desc: string
}

/**
 * Two passes, deliberately. Pass 1 populates the glyph registry — a component
 * only registers a glyph when it renders, and <defs> has to be emitted ahead of
 * the content referencing it. Pass 2 renders the same tree with those defs in
 * place. The registry is idempotent, so the second pass adds nothing new.
 */
export function renderPoster(node: React.ReactElement, opts: PosterOptions): string {
  const { theme, height, title, desc } = opts
  const registry = new GlyphRegistry()

  const tree = (defs: string) => (
    <ThemeContext.Provider value={theme}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={W}
        height={height}
        viewBox={`0 0 ${W} ${height}`}
        role="img"
        aria-label={title}
      >
        <title>{title}</title>
        <desc>{desc}</desc>
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
        <defs>
          <SpectrumDefs theme={theme} height={height} />
          <pattern id="lattice" width={26} height={26} patternUnits="userSpaceOnUse">
            <circle cx={1} cy={1} r={0.9} fill={theme.ink} opacity={0.11} />
          </pattern>
          {/* Oscilloscope graticule: fine 45px cells, major lines every 225px.
              Hairlines only — a filled grid would fight the text. */}
          <pattern id="graticule" width={45} height={45} patternUnits="userSpaceOnUse">
            <path d="M45 0H0V45" fill="none" stroke={theme.ink} strokeWidth={0.5} opacity={0.05} />
          </pattern>
          <pattern id="graticuleMajor" width={225} height={225} patternUnits="userSpaceOnUse">
            <path d="M225 0H0V225" fill="none" stroke={theme.ink} strokeWidth={0.6} opacity={0.07} />
          </pattern>
          {defs ? <g dangerouslySetInnerHTML={{ __html: defs }} /> : null}
        </defs>
        <rect width={W} height={height} fill={theme.ground} />
        <AmbientField theme={theme} height={height} />
        {node}
      </svg>
    </ThemeContext.Provider>
  )

  withRegistry(registry, () => renderToStaticMarkup(tree('')))
  return withRegistry(registry, () => renderToStaticMarkup(tree(registry.pathMarkup())))
}

/** Renders a small standalone SVG — used for the clickable contact badges. */
export function renderBadge(
  node: React.ReactElement,
  opts: { theme: Theme; width: number; height: number; title: string },
): string {
  const { theme, width, height, title } = opts
  const registry = new GlyphRegistry()

  const tree = (defs: string) => (
    <ThemeContext.Provider value={theme}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={title}
      >
        <title>{title}</title>
        <defs>
          <linearGradient id="badgeSweep" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0">
            {spectrumStops(theme.spectrum).map((s) => (
              <stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              from="0 0"
              to="0.5 0"
              dur={motion.spectrumDur}
              repeatCount="indefinite"
            />
          </linearGradient>
          {defs ? <g dangerouslySetInnerHTML={{ __html: defs }} /> : null}
        </defs>
        {node}
      </svg>
    </ThemeContext.Provider>
  )

  withRegistry(registry, () => renderToStaticMarkup(tree('')))
  return withRegistry(registry, () => renderToStaticMarkup(tree(registry.pathMarkup())))
}
