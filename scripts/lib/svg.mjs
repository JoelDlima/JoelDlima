
/**
 * Monochrome space-themed SVG rendering.
 *
 * Three rules shape this file:
 *
 * 1. Colour, geometry and text are set with presentation attributes, never CSS.
 *    GitHub sanitises the SVGs it serves, and attributes always survive.
 * 2. Animation lives entirely in the <style> block, and nothing starts hidden
 *    via an attribute. If a sanitiser ever drops <style>, every card still
 *    renders correctly — just static.
 * 3. Motion is layered: a one-shot entrance cascade on load, then slow ambient
 *    loops that never stop. Nothing loops fast enough to nag.
 */

const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const DISPLAY = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const FACES = { mono: MONO, display: DISPLAY };

export const THEMES = {
  dark: {
    bg: "#040711",
    bgTop: "#010309",
    bgBottom: "#142952",
    nebulaA: "#0d9488",
    nebulaB: "#2563eb",
    nebulaC: "#6d28d9",
    border: "#152438",
    text: "#f1f5f9",
    muted: "#7c8ba1",
    track: "#0c1524",
    ink: "#2dd4bf",
    accent: "#2dd4bf",
    gold: "#fbbf24",
    cyan: "#38bdf8",
    cardBg: "#081120",
    star: "#e2e8f0",
    haze: "#0ea5e9",
    hazeOpacity: 0.08,
  },
  light: {
    bg: "#f8fafc",
    bgTop: "#f6f9fe",
    bgBottom: "#d9e6f8",
    nebulaA: "#99f6e4",
    nebulaB: "#bfdbfe",
    nebulaC: "#ddd6fe",
    border: "#cbd5e1",
    text: "#0f172a",
    muted: "#64748b",
    track: "#e2e8f0",
    ink: "#0d9488",
    accent: "#0d9488",
    gold: "#d97706",
    cyan: "#0284c7",
    cardBg: "#f1f5f9",
    star: "#0f172a",
    haze: "#0284c7",
    hazeOpacity: 0.04,
  },
};

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

const STAGGER_STEPS = 80;
const STAGGER_STEP_SECONDS = 0.045;

/** Far, mid and near star layers. Slower drift reads as further away. */
const PARALLAX = [
  { cls: "drift-a", share: 0.45, maxRadius: 0.9, maxOpacity: 0.3 },
  { cls: "drift-b", share: 0.33, maxRadius: 1.3, maxOpacity: 0.5 },
  { cls: "drift-c", share: 0.22, maxRadius: 1.9, maxOpacity: 0.85 },
];

export function escape(value) {
  return String(value).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function shortDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(`${isoDate}T00:00:00Z`);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export function monthYear(isoDate) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return `${MONTHS[d.getUTCMonth()]} '${String(d.getUTCFullYear()).slice(2)}`;
}

/** Seeded PRNG so a rebuild produces byte-identical stars, not a daily diff. */
function seededRandom(seed) {
  let state = [...String(seed)].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n) => Math.round(n * 10) / 10;

function classAttr(...names) {
  const value = names.filter(Boolean).join(" ");
  return value ? ` class="${value}"` : "";
}

export function text(content, { x, y, size = 12, fill, weight = 400, anchor = "start", spacing = 0, cls = "", face = "mono" }) {
  const letterSpacing = spacing ? ` letter-spacing="${spacing}"` : "";
  return (
    `<text x="${x}" y="${y}" font-family="${FACES[face]}" font-size="${size}" font-weight="${weight}" ` +
    `fill="${fill}" text-anchor="${anchor}"${letterSpacing}${classAttr(cls)}>${escape(content)}</text>`
  );
}

export function rect({ x, y, width, height, fill, rx = 0, stroke = null, opacity = null, cls = "" }) {
  const strokeAttr = stroke ? ` stroke="${stroke}" stroke-width="1"` : "";
  const opacityAttr = opacity === null ? "" : ` fill-opacity="${opacity}"`;
  return (
    `<rect x="${round(x)}" y="${round(y)}" width="${round(Math.max(0, width))}" height="${round(height)}" ` +
    `rx="${rx}" fill="${fill}"${opacityAttr}${strokeAttr}${classAttr(cls)} />`
  );
}

function circle({ cx, cy, r, fill, opacity = null, cls = "", style = "" }) {
  const opacityAttr = opacity === null ? "" : ` fill-opacity="${opacity}"`;
  const styleAttr = style ? ` style="${style}"` : "";
  return (
    `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(r)}" fill="${fill}"` +
    `${opacityAttr}${classAttr(cls)}${styleAttr} />`
  );
}

/* ------------------------------------------------------------------ space */

/** Faint off-centre nebula wash that swells and settles on a long cycle. */
function haze(id, theme, width, height) {
  return (
    `<defs><radialGradient id="${id}" cx="18%" cy="8%" r="95%">` +
    `<stop offset="0%" stop-color="${theme.haze}" stop-opacity="${theme.hazeOpacity}" />` +
    `<stop offset="55%" stop-color="${theme.haze}" stop-opacity="${theme.hazeOpacity * 0.35}" />` +
    `<stop offset="100%" stop-color="${theme.haze}" stop-opacity="0" />` +
    `</radialGradient></defs>` +
    rect({ x: 0, y: 0, width, height, fill: `url(#${id})`, rx: 12, cls: "haze" })
  );
}

function starLayer({ width, height, count, random, theme, layer }) {
  const stars = [];
  for (let i = 0; i < count; i += 1) {
    stars.push(
      circle({
        cx: random() * width,
        cy: random() * height,
        r: 0.35 + random() * layer.maxRadius,
        fill: theme.star,
        opacity: round(0.12 + random() * layer.maxOpacity),
        cls: `tw d${Math.floor(random() * STAGGER_STEPS)}`,
      }),
    );
  }
  return stars.join("");
}

/**
 * Deep-space nebula wash — teal patch left of centre, blue haze right, faint
 * violet low-left, drifting on the aurora float loops. Evokes the pixel-art
 * void reference: mostly darkness, colour pooling in patches.
 */
export function reactBitsBackground({ width, height, theme, seed }) {
  const blurId = `aurora-blur-${seed}`;
  const gridPatternId = `tech-grid-${seed}`;

  return (
    `<defs>` +
    `<filter id="${blurId}" x="-20%" y="-20%" width="140%" height="140%">` +
    `<feGaussianBlur stdDeviation="80" result="blur" />` +
    `</filter>` +
    `<pattern id="${gridPatternId}" width="96" height="96" patternUnits="userSpaceOnUse">` +
    `<path d="M 96 0 L 0 0 0 96" fill="none" stroke="${theme.border}" stroke-width="0.75" opacity="0.22" />` +
    `<circle cx="0" cy="0" r="1.2" fill="${theme.accent}" opacity="0.22" />` +
    `<path d="M -4 0 L 4 0 M 0 -4 L 0 4" stroke="${theme.accent}" stroke-width="0.7" opacity="0.2" />` +
    `</pattern>` +
    `</defs>` +
    // Faint telemetry grid
    `<rect x="0" y="0" width="${width}" height="${height}" fill="url(#${gridPatternId})" />` +
    // Nebula patches drifting on the aurora loops
    `<g filter="url(#${blurId})">` +
    `<ellipse class="aurora-orb-1" cx="230" cy="${Math.round(height * 0.52)}" rx="290" ry="200" fill="${theme.nebulaA || theme.accent}" opacity="0.26" />` +
    `<ellipse class="aurora-orb-2" cx="690" cy="${Math.round(height * 0.38)}" rx="320" ry="230" fill="${theme.nebulaB || theme.accent}" opacity="0.2" />` +
    `<ellipse class="aurora-orb-3" cx="190" cy="${Math.round(height * 0.88)}" rx="270" ry="190" fill="${theme.nebulaC || theme.accent}" opacity="0.13" />` +
    `</g>`
  );
}

/**
 * Stationary deep space starfield with realistic individual twinkle.
 * Stars stay stationary in their astronomical coordinates (NO asteroid drift).
 */
export function twinkleStarfield({ width, height, count, seed, theme }) {
  const random = seededRandom(seed);
  let stars = "";
  for (let i = 0; i < count; i++) {
    const x = round(random() * width);
    const y = round(random() * height);
    const r = round(0.4 + random() * 1.3);
    const opacity = round(0.15 + random() * 0.7);
    const delay = Math.floor(random() * STAGGER_STEPS);
    stars += circle({
      cx: x,
      cy: y,
      r,
      fill: theme.star,
      opacity,
      cls: `tw d${delay}`,
    });
  }
  return `<g>${stars}</g>`;
}

export function starfield(args) {
  return twinkleStarfield(args);
}

/**
 * Shooting stars.
 *
 * A real one is a brief diagonal flash, not a slow horizontal drift, so the
 * streak crosses in a small slice of its cycle and stays invisible for the
 * rest — that gap is what makes them read as sporadic rather than as traffic.
 *
 * The angle lives on an outer attribute transform and the travel on an inner
 * CSS one, because a CSS `transform` replaces the attribute rather than
 * composing with it. Starting off-canvas means a stripped stylesheet leaves
 * them parked outside the frame instead of stacked in a corner.
 */
export function shootingStarGradient(id, theme) {
  return (
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">` +
    `<stop offset="0%" stop-color="${theme.star}" stop-opacity="0" />` +
    `<stop offset="100%" stop-color="${theme.accent || theme.star}" stop-opacity="0.95" />` +
    `</linearGradient></defs>`
  );
}

export function shootingStar({ startX, startY, angle, travel, length, duration, delay, theme, gradientId }) {
  return (
    `<g transform="translate(${round(startX)} ${round(startY)}) rotate(${angle})">` +
    `<g class="shoot" style="--travel:${Math.round(travel)}px;` +
    `animation-duration:${duration}s;animation-delay:${delay}s">` +
    `<rect x="${-length}" y="-0.6" width="${length}" height="1.2" rx="0.6" fill="url(#${gradientId})" />` +
    circle({ cx: 0, cy: 0, r: 1.7, fill: theme.star, opacity: 0.95 }) +
    `</g></g>`
  );
}

/**
 * A rotating group. The invisible circle is load-bearing: `transform-box:
 * fill-box` measures the group's own bounding box, so without it the box would
 * be the moon alone and the moon would spin in place instead of orbiting.
 */
function revolving({ cls, radius, moonRadius, moon }) {
  // The sizing circle must clear the moon on every side, or the box centre —
  // and so the axis of rotation — sits slightly off the planet.
  return `<g class="${cls}"><circle cx="0" cy="0" r="${radius + moonRadius}" fill="none" />${moon}</g>`;
}

/**
 * The rotating moon, played from a horizontal sprite sheet.
 *
 * One wide image stepped left by exactly one frame beats stacking 60 images
 * and cross-fading them: a single decode, and with CSS stripped the clip simply
 * shows frame 0 instead of every frame piled on top of each other.
 */
export function moonSprite({ cx, cy, frames, size, base64, id, duration = 5 }) {
  const clip = `moon-${id}`;
  const x = cx - size / 2;
  const y = cy - size / 2;

  return (
    `<defs><clipPath id="${clip}">` +
    `<rect x="${round(x)}" y="${round(y)}" width="${size}" height="${size}" />` +
    `</clipPath></defs>` +
    `<g clip-path="url(#${clip})">` +
    `<image class="moon" style="--sheet:-${size * frames}px;animation-duration:${duration}s" ` +
    `x="${round(x)}" y="${round(y)}" ` +
    `width="${size * frames}" height="${size}" ` +
    `href="data:image/png;base64,${base64}" />` +
    `</g>`
  );
}

/**
 * Moon with two satellites on tilted orbits, the whole system drifting on a
 * long swell. The moon sits inside the same `.float` group as the rings — in
 * its own group it would bob on an independent timeline and visibly detach.
 */
export function orbit({ cx, cy, theme, moon = "" }) {
  return (
    `<g class="float">` +
    moon +
    `<g transform="translate(${cx} ${cy})">` +
    revolving({
      cls: "orbit",
      radius: 58,
      moonRadius: 3.6,
      moon: circle({ cx: 58, cy: 0, r: 3.6, fill: theme.ink }),
    }) +
    revolving({
      cls: "orbit-mid",
      radius: 44,
      moonRadius: 2.4,
      moon: circle({ cx: -31, cy: 31, r: 2.4, fill: theme.ink, opacity: 0.75 }),
    }) +
    revolving({
      cls: "orbit-slow",
      radius: 34,
      moonRadius: 2.2,
      moon: circle({ cx: 0, cy: 34, r: 2.2, fill: theme.ink, opacity: 0.55 }),
    }) +
    `</g></g>`
  );
}

/** A 24x24 brand mark scaled to `size` with its top-left corner at (x, y). */
export function icon(path, { x, y, size, fill, opacity = null, cls = "" }) {
  const scale = round((size / 24) * 1000) / 1000;
  const opacityAttr = opacity === null ? "" : ` fill-opacity="${opacity}"`;
  return (
    `<g transform="translate(${round(x)} ${round(y)}) scale(${scale})"${classAttr(cls)}>` +
    `<path d="${path}" fill="${fill}"${opacityAttr} />` +
    `</g>`
  );
}

/**
 * The astronaut, inlined as a data URI like the moon sheet. He drifts on a long
 * cycle — a bob plus a slight roll, the two on different periods so the motion
 * never repeats in an obviously looping way.
 */
export function astronaut({ x, y, width, height, base64 }) {
  return (
    `<g class="astro">` +
    `<image x="${round(x)}" y="${round(y)}" width="${round(width)}" height="${round(height)}" ` +
    `href="data:image/png;base64,${base64}" />` +
    `</g>`
  );
}

/* ------------------------------------------------------------- components */

export function frame({ width, height, theme, seed, stars = 120 }) {
  const clipId = `frame-clip-${seed}`;
  const gradId = `bg-grad-${seed}`;
  return (
    `<defs>` +
    // Deep-space vertical wash: near-black up top, rich navy toward the bottom
    `<linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0%" stop-color="${theme.bgTop || theme.bg}" />` +
    `<stop offset="55%" stop-color="${theme.bg}" />` +
    `<stop offset="100%" stop-color="${theme.bgBottom || theme.bg}" />` +
    `</linearGradient>` +
    `<clipPath id="${clipId}">` +
    `<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="12" />` +
    `</clipPath>` +
    `</defs>` +
    rect({ x: 0.5, y: 0.5, width: width - 1, height: height - 1, fill: `url(#${gradId})`, rx: 12, stroke: theme.border }) +
    `<g clip-path="url(#${clipId})">` +
    reactBitsBackground({ width, height, theme, seed }) +
    twinkleStarfield({ width, height, count: stars, seed, theme }) +
    `</g>`
  );
}

/**
 * The embedded display face. `font-display: block` rather than `swap` because
 * the SVG is rasterised once as an image — a swap would risk the fallback being
 * what gets painted.
 */
export function fontFace(base64) {
  if (!base64) return "";
  return (
    "@font-face{font-family:'JetBrains Mono';font-style:normal;font-weight:400 800;" +
    `font-display:block;src:url(data:font/woff2;base64,${base64}) format('woff2');}`
  );
}

export function document_({ width, height, title, body, face = "" }) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
    `viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-label="${escape(title)}">` +
    `<title>${escape(title)}</title><style>${face}</style>${style(width)}${body}</svg>\n`
  );
}

/**
 * Traced trajectory. The line draws itself left to right while the area fill is
 * wiped in behind it on matching timing, so the graph builds as one motion.
 * Afterwards a probe runs the path on a loop, keeping the graph alive.
 *
 * The probe sits at the origin in its own coordinates — `offset-path` moves it.
 * It is clipped to the plot area so that if CSS is ever stripped it is hidden
 * rather than parked in the card's top-left corner.
 */
export function sparkline({ values, x, y, width, height, theme, id }) {
  if (values.length < 2) return "";

  const peak = Math.max(...values, 1);
  const step = width / (values.length - 1);
  const points = values.map((value, i) => [x + i * step, y + height - (value / peak) * height]);

  const line = points.map(([px, py], i) => `${i === 0 ? "M" : "L"}${round(px)} ${round(py)}`).join(" ");
  const area = `${line} L${round(x + width)} ${y + height} L${x} ${y + height} Z`;
  const [tipX, tipY] = points.at(-1);
  const wipeId = `wipe-${id}`;
  const plotId = `plot-${id}`;

  return (
    `<defs>` +
    `<clipPath id="${wipeId}">` +
    `<rect x="${x}" y="${y}" width="${round(width)}" height="${height}" class="wipe" />` +
    `</clipPath>` +
    `<clipPath id="${plotId}">` +
    `<rect x="${x}" y="${y - 8}" width="${round(width)}" height="${height + 16}" />` +
    `</clipPath>` +
    `</defs>` +
    `<g clip-path="url(#${wipeId})">` +
    `<path d="${area}" fill="${theme.ink}" fill-opacity="0.10" />` +
    rect({ x, y: y + height, width, height: 1, fill: theme.ink, opacity: 0.25 }) +
    `</g>` +
    `<path d="${line}" pathLength="1" fill="none" stroke="${theme.ink}" stroke-width="1.6" ` +
    `stroke-linejoin="round" stroke-linecap="round" class="draw" />` +
    `<g clip-path="url(#${plotId})">` +
    circle({ cx: 0, cy: 0, r: 2.4, fill: theme.ink, cls: "probe", style: `offset-path:path('${line}')` }) +
    `</g>` +
    circle({ cx: tipX, cy: tipY, r: 5.5, fill: theme.ink, opacity: 0.25, cls: "halo" }) +
    circle({ cx: tipX, cy: tipY, r: 2.6, fill: theme.ink, cls: "fade-late" })
  );
}

/**
 * One "name ▇▇▇▇ value" row. The bar grows from the left on load, then holds a
 * slow brightness swell. Entrance and ambient loop sit on separate elements
 * because a single element gets one animation-delay, and they need different
 * ones.
 */
export function barRow({
  item,
  x,
  y,
  labelWidth,
  barWidth,
  max,
  theme,
  index = 0,
  delayOffset = 0,
  face = "mono",
  // Room reserved to the right of the bar for its value. The value is
  // right-anchored at the far edge of that gutter, so a gutter narrower than
  // the widest value pushes the text back over the track.
  labelGap = 34,
}) {
  const filled = Math.max(3, (item.value / max) * barWidth);
  const delay = delayOffset + index * 2;
  return (
    text(item.name, { x, y: y + 9, size: 11, fill: theme.text, cls: `rise d${delay}`, face }) +
    rect({ x: x + labelWidth, y, width: barWidth, height: 10, fill: theme.track, rx: 5 }) +
    `<g class="grow d${delay}">` +
    rect({ x: x + labelWidth, y, width: filled, height: 10, fill: theme.ink, rx: 5, cls: `glowbar d${delay + 6}` }) +
    `</g>` +
    text(item.label, {
      x: x + labelWidth + barWidth + labelGap,
      y: y + 9,
      size: 11,
      fill: theme.muted,
      anchor: "end",
      cls: `rise d${delay + 1}`,
    })
  );
}

/* ------------------------------------------------- contribution calendar */

const WEEKDAY_LABELS = { 1: "mon", 3: "wed", 5: "fri" };
const LEVELS = 4;

/** GitHub-style quantisation: zero, then four bands up to the busiest day. */
function level(count, peak) {
  if (count === 0) return 0;
  return Math.min(LEVELS, Math.ceil((count / peak) * LEVELS));
}

function monthLabels(days, { x, y, columns, pitch, theme }) {
  const labels = [];

  // The leftmost column is a partial month, so it is seeded as "previous" and
  // never labelled — labelling it would sit a stub against the next month and
  // squeeze that one out. GitHub's own calendar does the same.
  let previous = days[0] ? new Date(`${days[0].date}T00:00:00Z`).getUTCMonth() : null;

  for (let column = 1; column < columns; column += 1) {
    const day = days[column * 7];
    if (!day) break;
    const month = new Date(`${day.date}T00:00:00Z`).getUTCMonth();
    if (month !== previous) labels.push({ column, text: MONTHS[month] });
    previous = month;
  }

  return labels
    .map((entry) =>
      text(entry.text, { x: x + entry.column * pitch, y, size: 9, fill: theme.muted, cls: "rise d24" }),
    )
    .join("");
}

function legend({ x, y, cell, theme }) {
  const swatches = Array.from({ length: LEVELS + 1 }, (_, i) =>
    rect({
      x: x + 28 + i * (cell + 3),
      y: y - cell + 2,
      width: cell,
      height: cell,
      fill: i === 0 ? theme.track : theme.ink,
      rx: 2,
      opacity: i === 0 ? null : round(0.22 + (i / LEVELS) * 0.78),
    }),
  ).join("");

  return (
    text("less", { x, y, size: 9, fill: theme.muted, cls: "rise d40" }) +
    swatches +
    text("more", { x: x + 40 + (LEVELS + 1) * (cell + 3), y, size: 9, fill: theme.muted, cls: "rise d40" })
  );
}

/**
 * The full year of contribution boxes, GitHub's layout: one column per week,
 * Sunday at the top. Cells ignite on a diagonal sweep as the poster loads.
 */
export function contributionGrid({ days, x, y, cell = 11, gap = 3, theme, gutter = 26, id = "dark" }) {
  const pitch = cell + gap;
  const peak = Math.max(...days.map((d) => d.count), 1);
  const columns = Math.ceil(days.length / 7);
  const gridX = x + gutter;

  const weekdays = Object.entries(WEEKDAY_LABELS)
    .map(([row, name]) =>
      text(name, { x, y: y + Number(row) * pitch + cell - 1, size: 8.5, fill: theme.muted, cls: "rise d26" }),
    )
    .join("");

  const baseCells = days
    .map((day, i) => {
      const column = Math.floor(i / 7);
      const row = i % 7;
      const cx = gridX + column * pitch;
      const cy = y + row * pitch;
      return rect({ x: cx, y: cy, width: cell, height: cell, fill: theme.track, rx: 2 });
    })
    .join("");

  const litCells = days
    .map((day, i) => {
      const band = level(day.count, peak);
      if (band === 0) return "";
      const column = Math.floor(i / 7);
      const row = i % 7;
      const cx = gridX + column * pitch;
      const cy = y + row * pitch;
      const opacity = round(0.22 + (band / LEVELS) * 0.78);
      return rect({ x: cx, y: cy, width: cell, height: cell, fill: theme.ink, rx: 2, opacity });
    })
    .join("");

  const plotW = columns * pitch - gap;
  const plotH = 7 * pitch - gap;
  const revealGroup = `<g clip-path="url(#scan-reveal-${id})">${litCells}</g>`;

  return {
    width: gutter + plotW,
    height: plotH,
    markup:
      monthLabels(days, { x: gridX, y: y - 8, columns, pitch, theme }) +
      weekdays +
      baseCells +
      revealGroup,
    legend: (legendY) => legend({ x: gridX, y: legendY, cell: cell - 2, theme }),
    plot: { x: gridX, y, width: plotW, height: plotH },
  };
}

/**
 * A ship flying the contribution grid on a long loop, banking into the curve.
 *
 * `offset-rotate: auto` turns the ship along the tangent, so the hull is drawn
 * pointing along +x and the path does the aiming. Both ship and track are
 * clipped to the grid, which also means that if CSS is ever stripped the ship
 * hides instead of parking at the origin.
 */
/**
 * A smooth curve through the given points, Catmull-Rom converted to cubic
 * Béziers. Straight segments between cell centres would make the ship jerk at
 * every waypoint; this keeps the heading continuous so `offset-rotate: auto`
 * banks it cleanly.
 */
/** Submission grid. Cells ignite on a diagonal sweep, then breathe out of phase. */
export function heatmap({ days, x, y, cell = 12, gap = 3, theme }) {
  const peak = Math.max(...days.map((d) => d.count), 1);

  const cells = days.map((day, i) => {
    const column = Math.floor(i / 7);
    const row = i % 7;
    const cx = x + column * (cell + gap);
    const cy = y + row * (cell + gap);
    const base = rect({ x: cx, y: cy, width: cell, height: cell, fill: theme.track, rx: 3 });

    if (day.count === 0) return base;

    const opacity = round(0.3 + 0.7 * Math.min(1, day.count / peak));
    const phase = (column + row) % STAGGER_STEPS;
    const lit = rect({ x: cx, y: cy, width: cell, height: cell, fill: theme.ink, rx: 3, opacity, cls: `ignite d${phase}` });
    return `${base}<g class="breathe d${phase}">${lit}</g>`;
  });

  return cells.join("");
}

/* -------------------------------------------------------------- animation */

function staggerRules() {
  return Array.from(
    { length: STAGGER_STEPS },
    (_, i) => `.d${i}{animation-delay:${round(i * STAGGER_STEP_SECONDS)}s}`,
  ).join("");
}

function entranceRules() {
  return (
    ".rise{animation:rise .7s cubic-bezier(.22,.8,.3,1) both}" +
    ".pop{transform-origin:left bottom;animation:pop .8s cubic-bezier(.22,.9,.3,1.15) both}" +
    ".fade{animation:fade 1.2s ease-out both;animation-delay:.5s}" +
    ".fade-late{animation:fade .6s ease-out both;animation-delay:1.9s}" +
    ".draw{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.9s cubic-bezier(.4,0,.2,1) both;animation-delay:.3s}" +
    ".grow{transform-origin:left center;animation:grow 1s cubic-bezier(.22,.8,.3,1) both}" +
    ".wipe{transform-origin:left center;animation:grow 2s cubic-bezier(.4,0,.2,1) both;animation-delay:.3s}" +
    ".ignite{animation:ignite .6s cubic-bezier(.22,.9,.3,1.15) both;animation-delay:.4s}"
  );
}

function ambientRules(width) {
  return (
    ".tw{animation:tw 5s ease-in-out infinite}" +
    ".haze{transform-origin:center;animation:haze 22s ease-in-out infinite}" +
    ".aurora-orb-1{animation:aurora-float-1 20s ease-in-out infinite;transform-box:fill-box;transform-origin:center}" +
    ".aurora-orb-2{animation:aurora-float-2 26s ease-in-out infinite;transform-box:fill-box;transform-origin:center}" +
    ".aurora-orb-3{animation:aurora-float-3 22s ease-in-out infinite;transform-box:fill-box;transform-origin:center}" +
    ".float{animation:float 13s ease-in-out infinite}" +
    ".planet{transform-origin:center;animation:planet 9s ease-in-out infinite}" +
    ".orbit{transform-origin:center;animation:spin 9s linear infinite}" +
    ".orbit-mid{transform-origin:center;animation:spin 15s linear infinite reverse}" +
    ".orbit-slow{transform-origin:center;animation:spin 21s linear infinite}" +
    ".halo{transform-origin:center;animation:halo 3.2s ease-in-out infinite;animation-delay:2s}" +
    ".probe{offset-rotate:0deg;animation:travel 11s cubic-bezier(.5,0,.5,1) infinite;animation-delay:2.4s}" +
    ".glowbar{animation:glowbar 6s ease-in-out infinite}" +
    ".chip{animation:chip 5.5s ease-in-out infinite}" +
    ".astro{transform-origin:center;animation:astro 14s ease-in-out infinite}" +
    ".breathe{animation:breathe 7s ease-in-out infinite}" +
    ".moon{animation-name:moon;animation-timing-function:steps(60);animation-iteration-count:infinite}" +
    ".thruster{transform-origin:right center;animation:thrust .34s ease-in-out infinite alternate}" +
    ".shoot{animation-name:shoot;animation-timing-function:cubic-bezier(.3,0,.5,1);animation-iteration-count:infinite}" +
    ".galaxy-spin{animation:galaxy-spin 42s linear infinite;transform-box:fill-box;transform-origin:center}" +
    ".galaxy-pulse{animation:galaxy-pulse 6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}" +
    ".marquee-track-l1{animation:marquee-scroll-left 26s linear infinite}" +
    ".marquee-track-l2{animation:marquee-scroll-right 28s linear infinite}" +
    ".oscillo-sweep{animation:oscillo-sweep 4.8s cubic-bezier(.4,0,.2,1) infinite}" +
    ".scan-reveal-rect{animation:scan-reveal 4.8s cubic-bezier(.4,0,.2,1) infinite}" +
    ".blink{animation:blink 1.1s steps(1) infinite}" +
    ".pulse-slow{animation:pulse-slow 3.2s ease-in-out infinite}"
  );
}

function keyframeRules(width) {
  return (
    "@keyframes tw{0%,100%{opacity:.25}50%{opacity:1}}" +
    "@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}" +
    "@keyframes pop{from{opacity:0;transform:scale(.78)}to{opacity:1;transform:none}}" +
    "@keyframes fade{from{opacity:0}to{opacity:1}}" +
    "@keyframes draw{to{stroke-dashoffset:0}}" +
    "@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}" +
    "@keyframes ignite{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:none}}" +
    "@keyframes halo{0%,100%{opacity:.12;transform:scale(.8)}50%{opacity:.45;transform:scale(1.4)}}" +
    "@keyframes planet{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:.22;transform:scale(.88)}}" +
    "@keyframes spin{to{transform:rotate(360deg)}}" +
    "@keyframes float{0%,100%{transform:translateY(-3.5px)}50%{transform:translateY(3.5px)}}" +
    "@keyframes haze{0%,100%{opacity:.75;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}" +
    "@keyframes glowbar{0%,100%{fill-opacity:1}50%{fill-opacity:.68}}" +
    "@keyframes chip{0%,100%{fill-opacity:.07}50%{fill-opacity:.15}}" +
    "@keyframes astro{0%,100%{transform:translateY(-9px) rotate(-4deg)}35%{transform:translateY(4px) rotate(2deg)}70%{transform:translateY(9px) rotate(5deg)}}" +
    "@keyframes breathe{0%,100%{opacity:1}50%{opacity:.5}}" +
    "@keyframes travel{0%{offset-distance:0%;opacity:0}7%{opacity:.9}88%{opacity:.9}100%{offset-distance:100%;opacity:0}}" +
    "@keyframes thrust{from{transform:scaleX(.5);opacity:.45}to{transform:scaleX(1.2);opacity:1}}" +
    "@keyframes moon{to{transform:translateX(var(--sheet,-2880px))}}" +
    "@keyframes shoot{0%{opacity:0;transform:translateX(0)}2%{opacity:0}5%{opacity:1}13%{opacity:1}17%{opacity:0;transform:translateX(var(--travel,1200px))}100%{opacity:0;transform:translateX(var(--travel,1200px))}}" +
    "@keyframes galaxy-spin{to{transform:rotate(360deg)}}" +
    "@keyframes galaxy-pulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.2);opacity:1}}" +
    "@keyframes marquee-scroll-left{0%{transform:translateX(0)}100%{transform:translateX(calc(-1 * var(--w1, 1180px)))}}" +
    "@keyframes marquee-scroll-right{0%{transform:translateX(calc(-1 * var(--w2, 1470px)))}100%{transform:translateX(0)}}" +
    "@keyframes oscillo-sweep{0%{transform:translateX(0);opacity:0}4%{opacity:1}96%{opacity:1}100%{transform:translateX(var(--scan-w, 750px));opacity:0}}" +
    "@keyframes scan-reveal{0%{width:0}4%{width:0}96%{width:var(--scan-w, 750px)}99%{width:var(--scan-w, 750px)}100%{width:0}}" +
    "@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}" +
    "@keyframes pulse-slow{0%,100%{opacity:.4}50%{opacity:.95}}" +
    "@keyframes aurora-float-1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(100px,60px) scale(1.22)}}" +
    "@keyframes aurora-float-2{0%,100%{transform:translate(0,0) scale(1.1)}50%{transform:translate(-80px,-70px) scale(.88)}}" +
    "@keyframes aurora-float-3{0%,100%{transform:translate(0,0) scale(.92)}50%{transform:translate(70px,-50px) scale(1.18)}}"
  );
}

/**
 * Reduced motion strips travel, spin and scale — not the card. Everything that
 * moved becomes a plain fade; opacity-only loops keep running, slower.
 */
function reducedMotionRules() {
  return (
    "@media(prefers-reduced-motion:reduce){" +
    ".drift-a,.drift-b,.drift-c{animation:none!important}" +
    ".shoot{animation-duration:22s}" +
    // The ship and probe stay in flight under reduced motion. The ship keeps
    // its full-speed duration because the cell flashes are scheduled against
    // it; slowing it here would desync every one of them.
    ".probe{animation-duration:18s}" +
    ".haze{animation:haze 26s ease-in-out infinite;transform:none!important}" +
    ".pop,.rise,.ignite{animation:fade .7s ease-out both}" +
    ".grow,.wipe{animation:fade .9s ease-out both;transform:none!important}" +
    ".draw{animation:fade .9s ease-out both;stroke-dasharray:none!important;stroke-dashoffset:0!important}" +
    ".tw{animation:tw 8s ease-in-out infinite}" +
    ".breathe{animation:breathe 10s ease-in-out infinite}" +
    ".glowbar{animation:glowbar 9s ease-in-out infinite}" +
    ".marquee-track-l1,.marquee-track-l2,.galaxy-spin,.galaxy-pulse,.oscillo-sweep{animation:none!important}" +
    "}"
  );
}

function style(width) {
  return (
    "<style>" +
    // Only elements that scale or rotate about their own box need fill-box.
    // Applying it to `*` also caught plain translations, where it distorts how
    // they compose with an ancestor rotation — that is what flattened the
    // shooting stars to horizontal.
    ".pop,.grow,.wipe,.ignite,.halo,.planet,.thruster,.astro,.orbit,.orbit-mid,.orbit-slow{transform-box:fill-box}" +
    ".shot{transform-box:view-box}" +
    entranceRules() +
    ambientRules(width) +
    keyframeRules(width) +
    staggerRules() +
    reducedMotionRules() +
    "</style>"
  );
}
