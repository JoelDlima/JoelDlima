/**
 * Design tokens for the poster.
 *
 * The whole thing is one continuous spectrum — violet → blue → red → violet —
 * that travels slowly across the page. Colour is never decorative here: an
 * element's hue is a function of where it sits, so the poster reads as one
 * gradient sampled in many places rather than as several accent colours. That
 * is what stops it looking like a palette picked at random.
 *
 * Every value below is shared by both themes unless it lives inside `themes`.
 */

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

/** Poster width. GitHub's README column renders this at roughly 860 CSS px. */
export const W = 900
export const MARGIN = 42
/** Usable content width between the margins. */
export const CONTENT = W - MARGIN * 2

// ---------------------------------------------------------------------------
// Spectrum
// ---------------------------------------------------------------------------

/**
 * Deliberately desaturated against the obvious neon versions of these hues.
 * #8B5CF6 / #3B82F6 / #EF4444 are the framework defaults and read as generic;
 * pulling saturation down and value slightly in gives ink rather than glow.
 */
export const spectrumDark = ['#8257E5', '#3D7DE0', '#D24A4A'] as const
export const spectrumLight = ['#6A3AD0', '#2A5FBF', '#B33636'] as const

/** One full violet → blue → red → violet turn, twice, for a seamless loop. */
export function spectrumStops(hues: readonly string[]): { offset: number; color: string }[] {
  const cycle = [...hues, ...hues, hues[0]!]
  return cycle.map((color, i) => ({ offset: i / (cycle.length - 1), color }))
}

// ---------------------------------------------------------------------------
// Themes
// ---------------------------------------------------------------------------

export interface Theme {
  name: 'dark' | 'light'
  /** Poster background. */
  ground: string
  /** Raised surfaces — chips, cards, meter tracks. */
  surface: string
  surfaceStrong: string
  /** Primary reading colour. */
  ink: string
  /** Secondary text: descriptions, values. */
  inkMuted: string
  /** Tertiary: section labels, captions, axis marks. */
  inkFaint: string
  /** Hairline rules and chip borders. */
  line: string
  lineOpacity: number
  /** Spectrum stops for this theme. */
  spectrum: readonly string[]
  /** Opacity for the ambient interference field behind everything. */
  fieldOpacity: number
}

export const themes: Record<'dark' | 'light', Theme> = {
  dark: {
    name: 'dark',
    ground: '#0A0A0D',
    surface: '#131318',
    surfaceStrong: '#1B1B22',
    ink: '#F4F4F8',
    inkMuted: '#B4B4C0',
    inkFaint: '#7A7A85',
    line: '#FFFFFF',
    lineOpacity: 0.09,
    spectrum: spectrumDark,
    fieldOpacity: 0.5,
  },
  light: {
    name: 'light',
    ground: '#FBFAF9',
    surface: '#FFFFFF',
    surfaceStrong: '#F2F1EE',
    ink: '#101014',
    inkMuted: '#4B4B58',
    inkFaint: '#7C7C88',
    line: '#14141A',
    lineOpacity: 0.13,
    spectrum: spectrumLight,
    fieldOpacity: 0.28,
  },
}

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

/**
 * Two faces, split by role: Bodoni Moda carries identity and headline figures,
 * JetBrains Mono carries anything with a data texture. The contrast between
 * them is the poster's main typographic idea, so nothing sits in between.
 */
export const type = {
  masthead: 62,
  figureXL: 58,
  figureL: 38,
  sectionTitle: 25,
  lead: 17,

  body: 12.5,
  bodyS: 11.5,
  label: 10.5,
  micro: 9.5,
  tiny: 8.5,
} as const

export const tracking = {
  masthead: 2.4,
  sectionLabel: 1.9,
  label: 1.5,
  micro: 1.1,
  none: 0,
} as const

// ---------------------------------------------------------------------------
// Rhythm
// ---------------------------------------------------------------------------

export const space = {
  /** Gap between the end of one section and the next section's rule. */
  section: 34,
  /** Gap from a section rule down to its first content. */
  afterRule: 30,
  row: 15,
  tight: 8,
} as const

export const radius = {
  chip: 4,
  card: 7,
  bar: 2,
} as const

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

export const motion = {
  /** One full spectrum turn. Slow enough to feel like light, not a rainbow. */
  spectrumDur: '26s',
  ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** The entrance cascade advances by this much per section. */
  cascadeStep: 90,
} as const
