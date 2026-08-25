/**
 * Text rendering.
 *
 * Every glyph is converted to outlines at build time, so a viewer's installed
 * fonts never affect the result. The reference implementation this poster's
 * architecture is modelled on inlines a subsetted woff2 as a data URI instead;
 * outlining avoids that entirely — no @font-face to verify, no `font-display`
 * race when the SVG is rasterised, and nothing to fall back to.
 *
 * Both faces go through one glyph registry: each unique glyph is emitted once
 * into <defs>, normalised to a 1000-unit em, then placed with <use> and a scale
 * transform. Kerning is applied to the cursor at placement time. Emitting a
 * merged <path> per string is simpler but repeats the same outlines hundreds of
 * times across the poster — it took the two theme files from 158 KB to 458 KB.
 */
import fs from 'node:fs'
import path from 'node:path'
import opentype, { type Font } from 'opentype.js'
import * as React from 'react'
import { FONT_DIR } from '../paths'

const FILES = {
  display: 'BodoniModa.ttf',
  displayItalic: 'BodoniModa-Italic.ttf',
  mono: 'JetBrainsMono-Regular.ttf',
  monoBold: 'JetBrainsMono-Bold.ttf',
  monoXBold: 'JetBrainsMono-ExtraBold.ttf',
} as const

export type FontKey = keyof typeof FILES
export type MonoWeight = 'mono' | 'monoBold' | 'monoXBold'
export type DisplayWeight = 'display' | 'displayItalic'

const cache = new Map<FontKey, Font>()

function load(key: FontKey): Font {
  const hit = cache.get(key)
  if (hit) return hit
  const file = path.join(FONT_DIR, FILES[key])
  if (!fs.existsSync(file)) {
    throw new Error(`Missing font ${FILES[key]}. Run: npm run fonts`)
  }
  const font = opentype.parse(fs.readFileSync(file).buffer as ArrayBuffer)
  cache.set(key, font)
  return font
}

/** JetBrains Mono advances every glyph at exactly 0.6em — layout is arithmetic. */
export const MONO_ADVANCE = 0.6

/**
 * Registry outlines are normalised to this em, so one def serves every size.
 *
 * It is NOT each font's own unitsPerEm: JetBrains Mono is 1000 but Bodoni Moda
 * is 2000. Scaling a normalised path by `size / unitsPerEm` renders Bodoni at
 * half size while still advancing the cursor by the full width, which shows up
 * as wildly loose letter-spacing rather than as an obviously wrong size.
 */
const NORMALISED_EM = 1000

// ---------------------------------------------------------------------------
// Display composition
// ---------------------------------------------------------------------------

/**
 * Note on shaping: glyphs are walked directly rather than via `font.getPath`.
 * getPath runs opentype's full feature/Bidi pipeline, which throws outright on
 * Bodoni Moda (`lookupType: 6 substFormat: 2 is not yet supported`). Walking
 * glyphs sidesteps the feature tables and still applies pair kerning — the only
 * shaping a Latin display line actually needs.
 */

export function measureDisplay(
  text: string,
  size: number,
  track = 0,
  weight: DisplayWeight = 'display',
): number {
  if (!text) return 0
  const font = load(weight)
  const scale = size / font.unitsPerEm
  let w = 0
  const glyphs = [...text].map((ch) => font.charToGlyph(ch))
  glyphs.forEach((glyph, i) => {
    w += (glyph.advanceWidth ?? 0) * scale
    const next = glyphs[i + 1]
    if (next) w += font.getKerningValue(glyph, next) * scale + track
  })
  return w
}

/**
 * Largest display size at which every line still fits `maxWidth`.
 * Lets the masthead fill its column instead of being tuned to a magic number.
 */
export function fitDisplay(lines: string[], maxWidth: number, maxSize: number, track = 0): number {
  const at100 = Math.max(...lines.map((l) => measureDisplay(l, 100, (track * 100) / maxSize)))
  return Math.min(maxSize, Math.floor((maxWidth / at100) * 100))
}

// ---------------------------------------------------------------------------
// Glyph registry
// ---------------------------------------------------------------------------

/**
 * Collects unique mono glyphs while a tree renders. renderToStaticMarkup is
 * synchronous, so the registry is complete by the time the string comes back
 * and the caller can emit <defs> ahead of it.
 */
const ID_PREFIX: Record<FontKey, string> = {
  mono: 'r',
  monoBold: 'b',
  monoXBold: 'x',
  display: 'd',
  displayItalic: 'i',
}

export class GlyphRegistry {
  private defs = new Map<string, string>()

  id(key: FontKey, ch: string): string {
    const code = ch.codePointAt(0)!.toString(36)
    const id = `${ID_PREFIX[key]}${code}`
    if (!this.defs.has(id)) {
      // 0 decimals at 1000upm is ~0.1% precision — invisible at any size.
      const outline = load(key).charToGlyph(ch).getPath(0, 0, NORMALISED_EM)
      this.defs.set(id, outline.toPathData(0))
    }
    return id
  }

  pathMarkup(): string {
    return [...this.defs].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join('')
  }

  get size() {
    return this.defs.size
  }
}

let active: GlyphRegistry | null = null

export function withRegistry<T>(reg: GlyphRegistry, fn: () => T): T {
  const prev = active
  active = reg
  try {
    return fn()
  } finally {
    active = prev
  }
}

function registry(): GlyphRegistry {
  if (!active) throw new Error('Text rendered outside of renderSvg()')
  return active
}

// ---------------------------------------------------------------------------
// Measurement helpers
// ---------------------------------------------------------------------------

export function measureMono(text: string, size: number, track = 0): number {
  if (!text) return 0
  return text.length * MONO_ADVANCE * size + (text.length - 1) * track
}

/** Cap height as a fraction of size — used to optically centre text in a box. */
export const CAP = { mono: 0.73, display: 0.7 } as const

export function centerBaseline(
  top: number,
  h: number,
  size: number,
  family: 'mono' | 'display' = 'mono',
) {
  return top + h / 2 + (size * CAP[family]) / 2
}

export function round(n: number): number {
  return Math.round(n * 100) / 100
}

/** Greedy word wrap for the display face, on real kerned widths. */
export function wrapDisplay(
  text: string,
  size: number,
  maxWidth: number,
  weight: DisplayWeight = 'display',
  track = 0,
): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (measureDisplay(next, size, track, weight) <= maxWidth || !line) line = next
    else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

/** Greedy word wrap on measured widths. The caller decides leading. */
export function wrapMono(text: string, size: number, maxWidth: number, track = 0): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (measureMono(next, size, track) <= maxWidth || !line) line = next
    else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export type Anchor = 'start' | 'middle' | 'end'

const offsetFor = (anchor: Anchor, width: number) =>
  anchor === 'start' ? 0 : anchor === 'middle' ? -width / 2 : -width

export interface MonoProps {
  x: number
  /** Baseline y. */
  y: number
  children: string
  size?: number
  weight?: MonoWeight
  fill?: string
  track?: number
  anchor?: Anchor
  opacity?: number
  className?: string
  style?: React.CSSProperties
}

/** A run of monospace text, placed glyph by glyph from the shared registry. */
export function Mono({
  x,
  y,
  children,
  size = 12.5,
  weight = 'mono',
  fill = 'currentColor',
  track = 0,
  anchor = 'start',
  opacity,
  className,
  style,
}: MonoProps) {
  const reg = registry()
  const text = String(children)
  const width = measureMono(text, size, track)
  let cursor = x + offsetFor(anchor, width)
  const step = MONO_ADVANCE * size + track
  const scale = (size / NORMALISED_EM).toFixed(5)

  const glyphs: React.ReactNode[] = []
  for (const ch of text) {
    if (ch !== ' ') {
      glyphs.push(
        <use
          key={glyphs.length}
          href={`#${reg.id(weight, ch)}`}
          transform={`translate(${round(cursor)} ${round(y)}) scale(${scale})`}
        />,
      )
    }
    cursor += step
  }

  return (
    <g fill={fill} opacity={opacity} className={className} style={style}>
      {glyphs}
    </g>
  )
}

export interface DisplayProps {
  x: number
  y: number
  children: string
  size?: number
  fill?: string
  track?: number
  anchor?: Anchor
  weight?: DisplayWeight
  opacity?: number
  className?: string
  style?: React.CSSProperties
}

/**
 * A display line, placed glyph by glyph from the shared registry with pair
 * kerning applied to the cursor.
 *
 * Emitting one merged <path> per string is simpler, but Bodoni's outlines are
 * dense and the poster repeats the same letters hundreds of times across titles,
 * labels and figures — merging took the two files to 458 KB. Referencing one def
 * per unique glyph brings that down by roughly three quarters.
 */
export function Display({
  x,
  y,
  children,
  size = 40,
  fill = 'currentColor',
  track = 0,
  anchor = 'start',
  weight = 'display',
  opacity,
  className,
  style,
}: DisplayProps) {
  const reg = registry()
  const font = load(weight)
  const text = String(children)
  // Two different scales, deliberately: outlines are normalised to
  // NORMALISED_EM, advances come from the font's own em.
  const renderScale = (size / NORMALISED_EM).toFixed(5)
  const advanceScale = size / font.unitsPerEm
  let cursor = x + offsetFor(anchor, measureDisplay(text, size, track, weight))

  const glyphs = [...text].map((ch) => ({ ch, glyph: font.charToGlyph(ch) }))
  const nodes: React.ReactNode[] = []

  glyphs.forEach(({ ch, glyph }, i) => {
    if (glyph.advanceWidth === undefined) return
    if (ch !== ' ') {
      nodes.push(
        <use
          key={nodes.length}
          href={`#${reg.id(weight, ch)}`}
          transform={`translate(${round(cursor)} ${round(y)}) scale(${renderScale})`}
        />,
      )
    }
    cursor += glyph.advanceWidth * advanceScale + track
    const next = glyphs[i + 1]
    if (next) cursor += font.getKerningValue(glyph, next.glyph) * advanceScale
  })

  return (
    <g fill={fill} opacity={opacity} className={className} style={style}>
      {nodes}
    </g>
  )
}
