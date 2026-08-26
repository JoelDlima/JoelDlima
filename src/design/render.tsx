/**
 * Card shell: turns a React tree into a standalone, self-contained .svg.
 *
 * Constraints this file exists to satisfy — GitHub renders README images inside
 * an <img>, proxied through camo.githubusercontent.com, which puts the SVG in
 * "secure animated mode":
 *
 *   - No scripts.        React runs at build time only.
 *   - No external URLs.  No @import, no remote <image>, no linked webfonts.
 *   - No interactivity.  An <a> inside is dead, and so is `currentColor`.
 *   - Animation DOES run. CSS keyframes and SMIL both play.
 *
 * Two rules carried forward from hard-won experience:
 *
 *   Nothing is hidden by an attribute — entrance animations start from
 *   opacity 0 inside @keyframes only, so if a sanitiser ever strips <style>
 *   every card still renders, just static. Never blank.
 *
 *   The tree renders through a real React <svg> root; outside that namespace
 *   React lowercases linearGradient/radialGradient and silently kills them.
 */
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { GlyphRegistry, withRegistry } from './text'
import { W, motion, type Theme } from './tokens'

const ThemeContext = React.createContext<Theme | null>(null)

export function useTheme(): Theme {
  const theme = React.useContext(ThemeContext)
  if (!theme) throw new Error('Component rendered outside a ThemeContext')
  return theme
}

/**
 * Stylesheet. Motion inventory, deliberately small:
 *
 *   rise/fade/grow/ignite   one-shot entrance cascade
 *   blink                   status blip breathing — "this line is live"
 *   cursor                  terminal block after the name
 *   conduct                 dashes marching along a PCB trace
 *
 * Factory scene animations use SMIL <animate>/<animateTransform> elements
 * directly in the SVG (same technique as the dither background). This avoids
 * CSS transform issues in GitHub's camo proxy.
 *
 * prefers-reduced-motion collapses entrances to near-instant and stops the
 * decorative loops (conduct), but the blink keeps its slow breathing at half
 * amplitude.
 */
const STYLES = `
.rise,.grow,.ignite{transform-box:fill-box}
.rise{animation:rise .8s ${motion.ease} both}
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.fade{animation:fade .85s ${motion.ease} both}
@keyframes fade{from{opacity:0}to{opacity:1}}
.grow{transform-origin:left center;animation:grow 1s ${motion.ease} both}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.ignite{animation:ignite .5s ${motion.ease} both}
@keyframes ignite{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
.blink{animation:blink ${motion.blinkDur} ease-in-out infinite}
@keyframes blink{0%,100%{opacity:.35}50%{opacity:1}}
.cursor{animation:cursor ${motion.cursorDur} steps(1) infinite}
@keyframes cursor{0%,49%{opacity:1}50%,100%{opacity:0}}
.conduct{animation:conduct ${motion.conductDur} linear infinite}
@keyframes conduct{to{stroke-dashoffset:-96}}
@media (prefers-reduced-motion:reduce){
.rise,.fade,.grow,.ignite{animation-duration:.01s}
.rise{transform:none}
.conduct{animation:none;stroke-dashoffset:-48}
.cursor{animation:none}
.blink{animation-duration:${motion.blinkDur};animation-timing-function:ease-in-out}
}
`.trim()

// ---------------------------------------------------------------------------
// Defs — one soft amber glow, reused behind hero elements. Nothing else.
// ---------------------------------------------------------------------------

function CardDefs({ theme }: { theme: Theme }) {
  return (
    <radialGradient id="glow">
      <stop offset="0%" stopColor={theme.accent} stopOpacity="0.22" />
      <stop offset="60%" stopColor={theme.accent} stopOpacity="0.06" />
      <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
    </radialGradient>
  )
}

export const GLOW = 'url(#glow)'

// ---------------------------------------------------------------------------
// Render entry points
// ---------------------------------------------------------------------------

export interface CardOptions {
  theme: Theme
  width?: number
  height: number
  title: string
  desc: string
}

/** Two passes: pass 1 fills the glyph registry, pass 2 emits defs ahead of use. */
export function renderCard(node: React.ReactElement, opts: CardOptions): string {
  const { theme, height, title, desc } = opts
  const width = opts.width ?? W
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
        <desc>{desc}</desc>
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
        <defs>
          <CardDefs theme={theme} />
          {defs ? <g dangerouslySetInnerHTML={{ __html: defs }} /> : null}
        </defs>
        <rect width={width} height={height} fill={theme.ground} rx={12} />
        {node}
      </svg>
    </ThemeContext.Provider>
  )

  withRegistry(registry, () => renderToStaticMarkup(tree('')))
  return withRegistry(registry, () => renderToStaticMarkup(tree(registry.pathMarkup())))
}

/** Renders a small standalone SVG — the clickable contact badges. */
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
        {/* badgeEdge is static, so it renders on BOTH passes — emitting it
            only when defs is empty would leave the second pass pointing at a
            paint that no longer exists. */}
        <defs>
          <linearGradient id="badgeEdge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={theme.accent} stopOpacity="0.9" />
            <stop offset="1" stopColor={theme.accent} stopOpacity="0.4" />
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

/** Badge edge paint id. */
export const BADGE_EDGE = 'url(#badgeEdge)'
