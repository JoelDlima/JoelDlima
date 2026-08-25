/**
 * Text rendering.
 *
 * Every glyph is converted to outlines at build time, so a viewer's installed
 * fonts never affect the result — no @font-face to verify, no `font-display`
 * race when the SVG is rasterised, nothing to fall back to.
 *
 * One family only: JetBrains Mono, in three weights. Headline and body text
 * both go through the exact same glyph registry and the exact same fixed
 * 0.6em advance — there is no separate "display face" any more, which removes
 * an entire class of bug (a previous serif display face used a different
 * units-per-em from the mono face, and kerning made width non-arithmetic).
 * A merged monospace headline is also what gives the poster its terminal/
 * dev-tool register rather than an editorial one.
 *
 * `Display` stays as its own component because sections read better calling
 * a name that means "headline" — but it is a thin wrapper: same registry,
 * same fixed-advance math, just a bolder default weight.
 */
import fs from 'node:fs'
import path from 'node:path'
import opentype, { type Font } from 'opentype.js'
import * as React from 'react'
import { FONT_DIR } from '../paths'

const FILES = {
  mono: 'JetBrainsMono-Regular.ttf',
  monoBold: 'JetBrainsMono-Bold.ttf',
  monoXBold: 'JetBrainsMono-ExtraBold.ttf',
} as const

export type MonoWeight = keyof typeof FILES

const cache = new Map<MonoWeight, Font>()

function load(key: MonoWeight): Font {
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

/**
 * JetBrains Mono advances every glyph at exactly 0.6em, verified identical
 * across all three weights — layout is arithmetic, no per-glyph measurement.
 */
export const MONO_ADVANCE = 0.6

/** Registry outlines are normalised to this em; one def serves every size. */
const NORMALISED_EM = 1000

// ---------------------------------------------------------------------------
// Glyph registry
// ---------------------------------------------------------------------------

/**
 * Collects unique glyphs while a tree renders. renderToStaticMarkup is
 * synchronous, so the registry is complete by the time the string comes back
 * and the caller can emit <defs> ahead of it.
 */
const ID_PREFIX: Record<MonoWeight, string> = {
  mono: 'r',
  monoBold: 'b',
  monoXBold: 'x',
}

export class GlyphRegistry {
  private defs = new Map<string, string>()

  id(key: MonoWeight, ch: string): string {
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
// Measurement
// ---------------------------------------------------------------------------

export function measureMono(text: string, size: number, track = 0): number {
  if (!text) return 0
  return text.length * MONO_ADVANCE * size + (text.length - 1) * track
}

/** Cap height as a fraction of size — used to optically centre text in a box. */
export const CAP_HEIGHT = 0.73

export function centerBaseline(top: number, h: number, size: number) {
  return top + h / 2 + (size * CAP_HEIGHT) / 2
}

export function round(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Largest size at which every line still fits `maxWidth`.
 * Lets the masthead fill its column instead of being tuned to a magic number.
 */
export function fitMono(lines: string[], maxWidth: number, maxSize: number, track = 0): number {
  const at100 = Math.max(...lines.map((l) => measureMono(l, 100, (track * 100) / maxSize)))
  return Math.min(maxSize, Math.floor((maxWidth / at100) * 100))
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

export interface DisplayProps extends Omit<MonoProps, 'weight'> {
  weight?: MonoWeight
}

/** Headline text. Identical to Mono, just bolder by default — see file header. */
export function Display({ weight = 'monoXBold', ...rest }: DisplayProps) {
  return <Mono weight={weight} {...rest} />
}

export const measureDisplay = measureMono
export const fitDisplay = fitMono
export const wrapDisplay = wrapMono
