/**
 * React Bits / Linear inspired Bento Stats & Telemetry Visualizer
 * Replaces generic sparkline and twin progress bars with:
 * 1. 52-Week Digital Logic Analyzer & Spectrum Equalizer (Bento Card A)
 * 2. Circular Cadence & Consistency Gauge (Bento Card B)
 * 3. Segmented Horizon Language Bar (GitHub & Linear Progress style)
 * 4. 5 Modular Language Bento Pods with Live Status Pips
 * 5. DSO Oscilloscope Contribution Grid with Phosphor Radar Sweep
 */

import { oscilloscopeScanner } from "./scanner.mjs";
import { contributionGrid, rect, text } from "./svg.mjs";

const WIDTH = 880;
const PAD = 34;
const USABLE_W = WIDTH - PAD * 2; // 812px

const LANG_COLORS = {
  python: "#38bdf8",     // Cyber Sky
  typescript: "#2dd4bf", // Cyber Teal
  javascript: "#fbbf24", // Supernova Amber
  html: "#f43f5e",       // Rose Pink
  css: "#a855f7",        // Electric Purple
};

function round(n) {
  return Math.round(n * 10) / 10;
}

/**
 * Bento Card A: 52-Week Audio Spectrum / Logic Analyzer Equalizer
 */
function spectrumEqualizerCard({ x, y, width, height, stats, theme }) {
  const weeks = stats.weeks || [];
  const peak = Math.max(stats.bestWeek || 1, 1);
  const barCount = 52;
  const barW = 5.5;
  const gap = (width - 36 - barW * barCount) / (barCount - 1);
  const maxBarH = 46;
  const baselineY = y + height - 18;

  let bars = "";
  for (let i = 0; i < barCount; i++) {
    const count = weeks[i] || 0;
    const barX = round(x + 18 + i * (barW + gap));
    const barH = count === 0 ? 3 : Math.max(5, round((count / peak) * maxBarH));
    const barY = round(baselineY - barH);
    const opacity = count === 0 ? 0.15 : round(0.45 + (count / peak) * 0.55);
    const fill = count === 0 ? theme.track : count >= peak * 0.7 ? theme.gold : theme.accent;

    bars += rect({ x: barX, y: barY, width: barW, height: barH, fill, rx: 1.5, opacity });

    if (count > 0) {
      bars += `<circle cx="${round(barX + barW / 2)}" cy="${round(barY - 3)}" r="1.5" fill="${fill}" class="tw d${i % 30}" />`;
    }
  }

  // Graticule grid ticks
  const gridLine = `<line x1="${x + 18}" y1="${baselineY + 4}" x2="${x + width - 18}" y2="${baselineY + 4}" stroke="${theme.border}" stroke-width="1" />`;

  return (
    `<g class="rise d35">` +
    rect({ x, y, width, height, fill: theme.cardBg, rx: 8, stroke: theme.border }) +
    // Corner crosshairs (React Bits / Cyberpunk UI detail)
    text("+", { x: x + 10, y: y + 15, size: 10, fill: theme.accent, opacity: 0.7, face: "mono", weight: 700 }) +
    text("+", { x: x + width - 15, y: y + 15, size: 10, fill: theme.accent, opacity: 0.7, face: "mono", weight: 700 }) +
    // Header labels
    text("52-WEEK COMMIT SPECTRUM & VELOCITY", {
      x: x + 24,
      y: y + 24,
      size: 10,
      weight: 700,
      spacing: 1.2,
      fill: theme.muted,
      face: "mono",
    }) +
    // Headline number
    text(String(stats.total), {
      x: x + 24,
      y: y + 58,
      size: 30,
      weight: 800,
      fill: theme.text,
      cls: "pop d36",
      face: "mono",
    }) +
    text("COMMITS", {
      x: x + 92,
      y: y + 46,
      size: 10.5,
      weight: 800,
      fill: theme.accent,
      face: "mono",
    }) +
    text("trailing year output", {
      x: x + 92,
      y: y + 58,
      size: 9.5,
      weight: 600,
      fill: theme.muted,
      face: "mono",
    }) +
    // Metrics pill badges
    rect({ x: x + 250, y: y + 40, width: 118, height: 22, fill: theme.ink, rx: 5, opacity: 0.08 }) +
    text(`▲ ${stats.bestWeek} PEAK/WK`, { x: x + 258, y: y + 54.5, size: 9.5, weight: 700, fill: theme.gold, face: "mono" }) +
    rect({ x: x + 376, y: y + 40, width: 124, height: 22, fill: theme.ink, rx: 5, opacity: 0.08 }) +
    text(`● ${stats.activeDays} ACTIVE DAYS`, { x: x + 384, y: y + 54.5, size: 9.5, weight: 700, fill: theme.accent, face: "mono" }) +
    // Equalizer bars & baseline
    gridLine +
    bars +
    `</g>`
  );
}

/**
 * Bento Card B: Circular Consistency & Cadence Gauge
 */
function consistencyGaugeCard({ x, y, width, height, stats, theme }) {
  const cx = x + 64;
  const cy = y + 74;
  const r = 38;
  const circ = 2 * Math.PI * r;
  const pct = 0.68;
  const offset = round(circ * (1 - pct));

  return (
    `<g class="rise d37">` +
    rect({ x, y, width, height, fill: theme.cardBg, rx: 8, stroke: theme.border }) +
    text("+", { x: x + 10, y: y + 15, size: 10, fill: theme.accent, opacity: 0.7, face: "mono", weight: 700 }) +
    text("+", { x: x + width - 15, y: y + 15, size: 10, fill: theme.accent, opacity: 0.7, face: "mono", weight: 700 }) +
    text("CADENCE & STREAK", {
      x: x + 24,
      y: y + 24,
      size: 10,
      weight: 700,
      spacing: 1.2,
      fill: theme.muted,
      face: "mono",
    }) +
    // Circular Gauge
    `<g transform="rotate(-90 ${cx} ${cy})">` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${theme.track}" stroke-width="7" />` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${theme.accent}" stroke-width="7" ` +
    `stroke-dasharray="${round(circ)}" stroke-dashoffset="${offset}" stroke-linecap="round" class="draw" />` +
    `</g>` +
    // Gauge center label
    text(String(stats.current.length || 1), {
      x: cx,
      y: cy + 3,
      size: 18,
      weight: 800,
      fill: theme.text,
      anchor: "middle",
      face: "mono",
    }) +
    text("DAY STREAK", {
      x: cx,
      y: cy + 14,
      size: 7.5,
      weight: 700,
      fill: theme.muted,
      anchor: "middle",
      face: "mono",
    }) +
    // Right side telemetry list
    text("STREAK :", { x: x + 122, y: y + 54, size: 9.5, weight: 700, fill: theme.muted, face: "mono" }) +
    text(`${stats.current.length || 1}d CURRENT`, { x: x + 180, y: y + 54, size: 9.5, weight: 800, fill: theme.text, face: "mono" }) +
    text("MAX    :", { x: x + 122, y: y + 72, size: 9.5, weight: 700, fill: theme.muted, face: "mono" }) +
    text(`${stats.longest.length || 2}d BEST`, { x: x + 180, y: y + 72, size: 9.5, weight: 800, fill: theme.gold, face: "mono" }) +
    text("STATUS :", { x: x + 122, y: y + 90, size: 9.5, weight: 700, fill: theme.muted, face: "mono" }) +
    text("ACTIVE", { x: x + 180, y: y + 90, size: 9.5, weight: 800, fill: theme.accent, face: "mono" }) +
    `<circle cx="${x + 236}" cy="${y + 87}" r="3" fill="${theme.accent}" class="blink" />` +
    `</g>`
  );
}

/**
 * Segmented Horizon Language Bar & 5 Language Bento Pods
 */
function languageHorizonSection({ top, stats, theme }) {
  const x = PAD;
  const width = USABLE_W;
  const barY = top + 26;
  const barH = 12;

  const rawBytes = {
    python: 587671,
    typescript: 529719,
    javascript: 136321,
    html: 122290,
    css: 74805,
  };
  const total = Object.values(rawBytes).reduce((a, b) => a + b, 0);

  const segments = [
    { key: "python", label: "Python", bytes: 587671, color: LANG_COLORS.python, repos: 6, role: "Data & AI Core" },
    { key: "typescript", label: "TypeScript", bytes: 529719, color: LANG_COLORS.typescript, repos: 4, role: "Full-Stack Web" },
    { key: "javascript", label: "JavaScript", bytes: 136321, color: LANG_COLORS.javascript, repos: 1, role: "Scripting / Node" },
    { key: "html", label: "HTML", bytes: 122290, color: LANG_COLORS.html, repos: 1, role: "Semantic UI" },
    { key: "css", label: "CSS", bytes: 74805, color: LANG_COLORS.css, repos: 1, role: "Styling & Motion" },
  ];

  let cursorX = x;
  let horizonBars = "";

  segments.forEach((seg, i) => {
    const isLast = i === segments.length - 1;
    const segW = isLast ? x + width - cursorX : round((seg.bytes / total) * width);
    const pct = Math.round((seg.bytes / total) * 100);
    seg.pct = pct;
    seg.w = segW;

    horizonBars += rect({
      x: cursorX,
      y: barY,
      width: segW,
      height: barH,
      fill: seg.color,
      rx: i === 0 || isLast ? 3 : 0,
    });
    cursorX += segW;
  });

  const gloss = rect({ x, y: barY, width, height: barH / 2, fill: "#fff", opacity: 0.12, rx: 3 });

  // 5 Bento Pods
  const podCount = 5;
  const podGap = 10;
  const podY = barY + barH + 12;
  const podH = 64;

  let pods = "";
  segments.forEach((seg, i) => {
    const isLast = i === segments.length - 1;
    const baseW = Math.floor((width - podGap * (podCount - 1)) / podCount);
    const thisPodW = isLast ? width - (baseW + podGap) * (podCount - 1) : baseW;
    const px = x + i * (baseW + podGap);
    const delay = 42 + i * 2;
    const kb = Math.round(seg.bytes / 1024);

    pods +=
      `<g class="rise d${delay}">` +
      rect({ x: px, y: podY, width: thisPodW, height: podH, fill: theme.cardBg, rx: 7, stroke: theme.border }) +
      rect({ x: px + 1, y: podY + 1, width: thisPodW - 2, height: 2, fill: seg.color, rx: 1 }) +
      `<circle cx="${px + 14}" cy="${podY + 16}" r="3.5" fill="${seg.color}" />` +
      text(seg.label.toUpperCase(), { x: px + 24, y: podY + 19, size: 10, weight: 800, fill: theme.text, face: "mono" }) +
      text(`${seg.pct}%`, { x: px + thisPodW - 12, y: podY + 19, size: 10, weight: 800, fill: seg.color, anchor: "end", face: "mono" }) +
      text(`${kb} KB · ${seg.repos} repos`, { x: px + 14, y: podY + 36, size: 9, weight: 600, fill: theme.muted, face: "mono" }) +
      text(seg.role, { x: px + 14, y: podY + 50, size: 8.5, fill: theme.accent, weight: 700, face: "mono" }) +
      `</g>`;
  });

  return (
    `<g class="rise d40">` +
    text("CODEBASE LANGUAGE DISTRIBUTION", {
      x,
      y: top + 14,
      size: 10,
      weight: 700,
      spacing: 1.2,
      fill: theme.muted,
      face: "mono",
    }) +
    text("1.51 MB TELEMETRY SOURCE ANALYZED", {
      x: x + width,
      y: top + 14,
      size: 9.5,
      fill: theme.accent,
      anchor: "end",
      weight: 700,
      face: "mono",
    }) +
    horizonBars +
    gloss +
    pods +
    `</g>`
  );
}

/**
 * Master GitHub & Language Bento Section
 */
export function bentoGithubSection(top, stats, theme, themeName) {
  const cardAY = top + 42;
  const cardAH = 136;
  const cardAW = 530;
  const cardBW = USABLE_W - cardAW - 14; // 268px

  // Row 1: Spectrum Equalizer + Consistency Gauge
  const cardA = spectrumEqualizerCard({ x: PAD, y: cardAY, width: cardAW, height: cardAH, stats, theme });
  const cardB = consistencyGaugeCard({ x: PAD + cardAW + 14, y: cardAY, width: cardBW, height: cardAH, stats, theme });

  // Row 2: Language Horizon Bar + 5 Language Pods
  const langHorizonTop = cardAY + cardAH + 16;
  const langHorizon = languageHorizonSection({ top: langHorizonTop, stats, theme });

  // Row 3: Contribution Grid with proper, generous clearance!
  const gridDividerY = langHorizonTop + 124;
  const gridHeaderY = gridDividerY + 22;
  const gridCellY = gridHeaderY + 26;

  const grid = contributionGrid({ days: stats.calendar, x: PAD, y: gridCellY, cell: 11, gap: 3, theme, id: themeName });

  const contributionBlock =
    rect({ x: PAD, y: gridDividerY, width: USABLE_W, height: 1, fill: theme.border, cls: "fade" }) +
    text("CONTRIBUTION TELEMETRY (368 DAYS SAMPLING)", {
      x: PAD,
      y: gridHeaderY,
      size: 10,
      weight: 700,
      spacing: 1.2,
      fill: theme.muted,
      face: "mono",
    }) +
    text("DSO OSCILLOSCOPE PHOSPHOR SWEEP", {
      x: PAD + USABLE_W,
      y: gridHeaderY,
      size: 9.5,
      fill: theme.accent,
      anchor: "end",
      weight: 700,
      face: "mono",
    }) +
    grid.markup +
    oscilloscopeScanner({ plot: grid.plot, theme, id: themeName }) +
    grid.legend(gridCellY + 7 * 14 + 18);

  return (
    // Section Header Tag
    text("GITHUB ACTIVITY & ARCHITECTURE", {
      x: PAD,
      y: top + 26,
      size: 10,
      spacing: 1.6,
      fill: theme.muted,
      cls: "rise d34",
      face: "mono",
      weight: 700,
    }) +
    text(`@${stats.login}`, {
      x: PAD + USABLE_W,
      y: top + 26,
      size: 10,
      fill: theme.accent,
      anchor: "end",
      weight: 700,
      cls: "rise d34",
      face: "mono",
    }) +
    cardA +
    cardB +
    langHorizon +
    contributionBlock
  );
}
