/**
 * The workbench component vocabulary. Small on purpose — three cards compose
 * from these, and anything they all need lives here so it stays consistent.
 */
import { CONTENT, MARGIN, W, type as t, tracking } from './tokens'
import { Mono, Display, measureMono, round } from './text'
import { useTheme } from './render'

// ---------------------------------------------------------------------------
// Structure
// ---------------------------------------------------------------------------

export function Rule({
  y,
  x = MARGIN,
  w = CONTENT,
  opacity,
}: {
  y: number
  x?: number
  w?: number
  opacity?: number
}) {
  const theme = useTheme()
  return (
    <rect x={x} y={y} width={w} height={1} fill={theme.line} opacity={opacity ?? theme.lineOpacity} />
  )
}

/** Height consumed by a Label row: baseline to rule. */
export const LABEL_H = 20

/**
 * Card header: tracked caps label left, optional meta right, hairline under.
 * Every card opens with one so the README reads as a set of instrument panels.
 */
export function Label({ y, text, meta }: { y: number; text: string; meta?: string }) {
  const theme = useTheme()
  return (
    <>
      <Mono x={MARGIN} y={y} size={t.label} weight="monoBold" fill={theme.inkFaint} track={tracking.label}>
        {text.toUpperCase()}
      </Mono>
      {meta && (
        <Mono x={W - MARGIN} y={y} size={t.micro} fill={theme.inkFaint} anchor="end" track={tracking.micro}>
          {meta}
        </Mono>
      )}
      <Rule y={y + 9} />
    </>
  )
}

// ---------------------------------------------------------------------------
// Marks
// ---------------------------------------------------------------------------

/** A breathing amber dot — marks whatever line is actually live right now. */
export function Blip({ x, y, r = 3 }: { x: number; y: number; r?: number }) {
  const theme = useTheme()
  return (
    <g>
      <circle className="blink" cx={x} cy={y} r={r * 2.2} fill={theme.accent} opacity={0.35} />
      <circle cx={x} cy={y} r={r} fill={theme.accent} />
    </g>
  )
}

/** Terminal block cursor that sits after the name and blinks in steps. */
export function Cursor({ x, y, size }: { x: number; y: number; size: number }) {
  const theme = useTheme()
  const w = size * 0.55
  const h = size * 1.05
  return <rect className="cursor" x={round(x)} y={round(y - h * 0.78)} width={round(w)} height={round(h)} fill={theme.accent} />
}

// ---------------------------------------------------------------------------
// Figures and bars
// ---------------------------------------------------------------------------

/** A number worth reading, its unit beside it small, its caption underneath. */
export function Figure({
  x,
  y,
  value,
  unit,
  caption,
  size = 30,
  anchor = 'start',
  accent = false,
}: {
  x: number
  y: number
  value: string
  /** Short suffix drawn smaller beside the value ("d", "/120"). */
  unit?: string
  caption: string
  size?: number
  anchor?: 'start' | 'end'
  accent?: boolean
}) {
  const theme = useTheme()
  const paint = accent ? theme.accent : theme.ink
  const valueW = measureMono(value, size, -0.5)
  const unitX = (anchor === 'end' ? x : x + valueW) + 4
  return (
    <>
      <Display x={x} y={y} size={size} fill={paint} track={-0.5} anchor={anchor}>
        {value}
      </Display>
      {unit && (
        <Mono x={unitX} y={y} size={t.bodyS} weight="monoBold" fill={theme.accent} opacity={0.85}>
          {unit}
        </Mono>
      )}
      <Mono x={x} y={y + 17} size={t.micro} fill={theme.inkFaint} anchor={anchor} track={tracking.micro}>
        {caption}
      </Mono>
    </>
  )
}

/** Track + animated amber fill, with the value printed at the bar's right end. */
export function BarRow({
  x,
  y,
  w,
  pct,
  delay = 0,
}: {
  x: number
  y: number
  w: number
  /** 0..1 */
  pct: number
  delay?: number
}) {
  const theme = useTheme()
  const h = 7
  const filled = Math.max(h / 2, w * Math.min(1, Math.max(0, pct)))
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx={2} fill={theme.ink} opacity={0.1} />
      <rect
        className="grow"
        style={{ animationDelay: `${delay}ms` }}
        x={x}
        y={y}
        width={round(filled)}
        height={h}
        rx={2}
        fill={theme.accent}
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// PCB furniture
// ---------------------------------------------------------------------------

/**
 * Gold edge-connector fingers along a horizontal run — the contact edge of a
 * expansion card. One or two "keyed" pins carry full accent so the strip is
 * never mechanically uniform.
 */
export function EdgeConnectors({
  x,
  y,
  count = 26,
  fingerW = 6,
  gap = 5,
}: {
  x: number
  y: number
  count?: number
  fingerW?: number
  gap?: number
}) {
  const theme = useTheme()
  const step = fingerW + gap
  return (
    <g className="fade">
      {Array.from({ length: count }, (_, i) => {
        const keyed = i % 7 === 3
        const h = i % 2 === 0 ? 9 : 6
        return (
          <rect
            key={i}
            x={round(x + i * step)}
            y={y - h}
            width={fingerW}
            height={h}
            rx={1}
            fill={theme.accent}
            opacity={keyed ? 0.95 : 0.32}
          />
        )
      })}
    </g>
  )
}

/**
 * A copper trace: faint base line with accent dashes conducting along it, and
 * via pads at each bend supplied by the caller. `d` should be an orthogonal
 * rounded path — traces route, they do not wander.
 */
export function Trace({
  d,
  vias = [],
  opacity = 1,
}: {
  d: string
  vias?: [number, number][]
  opacity?: number
}) {
  const theme = useTheme()
  return (
    <g opacity={opacity}>
      <path d={d} fill="none" stroke={theme.line} strokeWidth={2.4} strokeOpacity={theme.lineOpacity * 2.4} strokeLinecap="round" />
      <path
        className="conduct"
        d={d}
        fill="none"
        stroke={theme.accent}
        strokeWidth={1.2}
        strokeOpacity={0.75}
        strokeDasharray="3 13"
        strokeLinecap="round"
      />
      {vias.map(([vx, vy], i) => (
        <g key={i}>
          <circle cx={vx} cy={vy} r={3.4} fill="none" stroke={theme.accent} strokeWidth={1} strokeOpacity={0.8} />
          <circle cx={vx} cy={vy} r={1.2} fill={theme.accent} />
        </g>
      ))}
    </g>
  )
}

/** Inline stack run: `a` · `b` · `c` in muted mono, for project footers. */
export function StackRun({ x, y, items, maxW }: { x: number; y: number; items: string[]; maxW: number }) {
  const theme = useTheme()
  const sep = '  ·  '
  let line = ''
  const lines: string[] = []
  for (const item of items) {
    const next = line ? line + sep + item.toLowerCase() : item.toLowerCase()
    if (measureMono(next, t.tiny, 0.5) > maxW && line) {
      lines.push(line)
      line = item.toLowerCase()
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return (
    <>
      {lines.map((l, i) => (
        <Mono key={l} x={x} y={y + i * 12} size={t.tiny} fill={theme.inkFaint} track={0.5}>
          {l}
        </Mono>
      ))}
    </>
  )
}

/** Convenience for cards that want the standard side margins. */
export const CARD_X = MARGIN
