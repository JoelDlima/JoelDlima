/**
 * Design tokens — "the workbench" system.
 *
 * One idea carries the whole page: Joel builds hardware, so the profile reads
 * like his bench at night — carbon-black surfaces, a single amber-phosphor
 * accent the way instruments mark what is live, copper traces and gold
 * contacts as structure. Deliberately NOT the violet-gradient look every
 * second student profile has, and deliberately single-accent: one hue marked
 * "energised" reads as intent, three read as a theme store.
 *
 * Light theme is the same bench in daylight: warm paper, burnt amber ink.
 */

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

/**
 * Card width. Sized for the *phone*, not the desktop column: GitHub renders
 * README images at ~358 CSS px on mobile and ~830 on desktop, so a 760 card
 * scales to 0.47× on a phone and 1.09× on desktop. Vectors stay crisp in both
 * directions — what matters is that type survives the 0.47×. The previous
 * 900-wide cards rendered body text at ~5 px on a phone: invisible.
 */
export const W = 760
export const MARGIN = 36
/** Usable content width between the margins. */
export const CONTENT = W - MARGIN * 2

// ---------------------------------------------------------------------------
// Themes
// ---------------------------------------------------------------------------

export interface Theme {
  name: 'dark' | 'light'
  /** Card background. */
  ground: string
  /** Raised surfaces — chips, badge fills. */
  surface: string
  /** Primary reading colour. */
  ink: string
  /** Secondary text. */
  inkMuted: string
  /** Tertiary: labels, captions, axis marks. */
  inkFaint: string
  /** The one live colour: amber phosphor. */
  accent: string
  /** Hairline rules and borders. */
  line: string
  lineOpacity: number
}

export const themes: Record<'dark' | 'light', Theme> = {
  dark: {
    name: 'dark',
    ground: '#0C0C0E',
    surface: '#141417',
    ink: '#EDEAE1',
    inkMuted: '#B3AEA2',
    // Raised one step from the original #79746A: this tone carries real
    // captions (footers, axis marks), and on compressed/mobile screens the
    // old value crushed into the ground and read as missing content.
    inkFaint: '#8A8478',
    accent: '#FFB627',
    line: '#FFFFFF',
    lineOpacity: 0.09,
  },
  light: {
    name: 'light',
    ground: '#FAF8F3',
    surface: '#FFFFFF',
    ink: '#1B1812',
    inkMuted: '#59544B',
    inkFaint: '#7B756A',
    // Burnt amber: bright phosphor fails contrast on paper; this keeps the
    // same hue family at ≥4.5:1 against the light ground.
    accent: '#9A6100',
    line: '#1B1812',
    lineOpacity: 0.13,
  },
}

// ---------------------------------------------------------------------------
// Typography — JetBrains Mono only, three weights, fixed 0.6em advance.
// ---------------------------------------------------------------------------

export const type = {
  hero: 64,
  lead: 26,
  body: 19,
  bodyS: 17,
  label: 14,
  micro: 13,
  tiny: 11.5,
} as const

export const tracking = {
  label: 2.2,
  micro: 1.5,
  none: 0,
} as const

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

export const motion = {
  /** Status blip breathing. */
  blinkDur: '2.6s',
  /** Terminal cursor after the name. */
  cursorDur: '1.1s',
  /** Marching dashes along a PCB trace — signal direction, quietly. */
  conductDur: '9s',
  ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** Entrance cascade step per card element. */
  cascadeStep: 70,
} as const
