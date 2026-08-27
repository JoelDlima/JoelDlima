/**
 * Technical Specification Metrics & Activity Log for Joel D'Lima
 * Clean, honest, non-redundant presentation adhering to datasheet aesthetics:
 * - 52-Week Commit Cadence (honest 104 commits with peak week)
 * - System Specifications & Architecture (ARM Cortex, CAN/SPI/I2C, FreeRTOS — NO duplicate CGPA/Role!)
 * - Codebase Language Allocation (TypeScript labeled as Internal Tooling / Systems UI)
 * - Understated, compact Activity Chronology (compact footprint fitting actual sprint cadence)
 */

import { oscilloscopeScanner } from "./scanner.mjs";
import { contributionGrid, rect, text } from "./svg.mjs";

const WIDTH = 880;
const PAD = 34;
const USABLE_W = WIDTH - PAD * 2; // 812px

const LANG_COLORS = {
  python: "#38bdf8",     // Python Blue
  typescript: "#2dd4bf", // TypeScript Teal
  javascript: "#fbbf24", // JavaScript Amber
  html: "#f43f5e",       // HTML Rose
  css: "#a855f7",        // CSS Purple
};

function round(n) {
  return Math.round(n * 10) / 10;
}

/**
 * 52-Week Commit Cadence Card
 */
function commitCadenceCard({ x, y, width, height, stats, theme }) {
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
  }

  const gridLine = `<line x1="${x + 18}" y1="${baselineY + 4}" x2="${x + width - 18}" y2="${baselineY + 4}" stroke="${theme.border}" stroke-width="1" opacity="0.6" />`;

  return (
    `<g class="rise d35">` +
    rect({ x, y, width, height, fill: theme.cardBg, rx: 6, stroke: theme.border }) +
    // Header labels: Technical Sans
    text("OUTPUT CADENCE (TRAILING 52 WEEKS)", {
      x: x + 20,
      y: y + 22,
      size: 11,
      weight: 700,
      fill: theme.text,
      face: "sans",
    }) +
    // Headline number: Monospace
    text(String(stats.total), {
      x: x + 20,
      y: y + 56,
      size: 26,
      weight: 800,
      fill: theme.text,
      cls: "pop d36",
      face: "mono",
    }) +
    text("COMMITS", {
      x: x + 82,
      y: y + 44,
      size: 10,
      weight: 700,
      fill: theme.accent,
      face: "mono",
    }) +
    text("across 13 active sprints", {
      x: x + 82,
      y: y + 56,
      size: 9.5,
      weight: 400,
      fill: theme.muted,
      face: "sans",
    }) +
    // Metrics pill badges
    rect({ x: x + 230, y: y + 38, width: 116, height: 22, fill: theme.ink, rx: 4, opacity: 0.08 }) +
    text(`▲ ${stats.bestWeek} PEAK/WK`, { x: x + 238, y: y + 52.5, size: 9, weight: 700, fill: theme.gold, face: "mono" }) +
    rect({ x: x + 354, y: y + 38, width: 122, height: 22, fill: theme.ink, rx: 4, opacity: 0.08 }) +
    text(`● ${stats.activeDays} ACTIVE DAYS`, { x: x + 362, y: y + 52.5, size: 9, weight: 700, fill: theme.accent, face: "mono" }) +
    gridLine +
    bars +
    `</g>`
  );
}

/**
 * System Specifications & Architecture (Non-redundant, authentic hardware specs!)
 */
function systemSpecificationsCard({ x, y, width, height, stats, theme }) {
  return (
    `<g class="rise d37">` +
    rect({ x, y, width, height, fill: theme.cardBg, rx: 6, stroke: theme.border }) +
    text("SYSTEM SPECIFICATIONS", {
      x: x + 18,
      y: y + 22,
      size: 11,
      weight: 700,
      fill: theme.text,
      face: "sans",
    }) +
    // Specification rows: No repetition of 9.70 CGPA or Visteon!
    text("ARCH", { x: x + 18, y: y + 48, size: 9.5, weight: 600, fill: theme.muted, face: "sans" }) +
    text("ARM Cortex-M · ESP32 (Xtensa)", { x: x + 64, y: y + 48, size: 9.5, weight: 700, fill: theme.text, face: "mono" }) +

    text("BUS", { x: x + 18, y: y + 70, size: 9.5, weight: 600, fill: theme.muted, face: "sans" }) +
    text("CAN 2.0B · SPI · I2C · UART", { x: x + 64, y: y + 70, size: 9.5, weight: 700, fill: theme.accent, face: "mono" }) +

    text("RTOS", { x: x + 18, y: y + 92, size: 9.5, weight: 600, fill: theme.muted, face: "sans" }) +
    text("FreeRTOS · Embedded Linux", { x: x + 64, y: y + 92, size: 9.5, weight: 700, fill: theme.text, face: "mono" }) +

    text("CLASS", { x: x + 18, y: y + 114, size: 9.5, weight: 600, fill: theme.muted, face: "sans" }) +
    text("Batch of 2027 · B.E. ECE", { x: x + 64, y: y + 114, size: 9.5, weight: 700, fill: theme.gold, face: "mono" }) +
    `<circle cx="${x + width - 18}" cy="${y + 111}" r="3" fill="${theme.accent}" class="blink" />` +
    `</g>`
  );
}

/**
 * Codebase Language Breakdown
 */
function languageAllocationSection({ top, stats, theme }) {
  const x = PAD;
  const width = USABLE_W;
  const barY = top + 26;
  const barH = 10;

  const rawBytes = {
    python: 587671,
    typescript: 529719,
    javascript: 136321,
    html: 122290,
    css: 74805,
  };
  const total = Object.values(rawBytes).reduce((a, b) => a + b, 0);

  const segments = [
    { key: "python", label: "Python", bytes: 587671, color: LANG_COLORS.python, repos: 6, role: "Systems & ML Automation" },
    { key: "typescript", label: "TypeScript", bytes: 529719, color: LANG_COLORS.typescript, repos: 4, role: "Internal Tooling & Systems UI" },
    { key: "javascript", label: "JavaScript", bytes: 136321, color: LANG_COLORS.javascript, repos: 1, role: "Utilities & Scripts" },
    { key: "html", label: "HTML", bytes: 122290, color: LANG_COLORS.html, repos: 1, role: "Markup & Interfaces" },
    { key: "css", label: "CSS", bytes: 74805, color: LANG_COLORS.css, repos: 1, role: "Interface Styling" },
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

  const podCount = 5;
  const podGap = 10;
  const podY = barY + barH + 12;
  const podH = 56;

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
      rect({ x: px, y: podY, width: thisPodW, height: podH, fill: theme.cardBg, rx: 6, stroke: theme.border }) +
      rect({ x: px + 1, y: podY + 1, width: thisPodW - 2, height: 2, fill: seg.color, rx: 1 }) +
      `<circle cx="${px + 12}" cy="${podY + 16}" r="3" fill="${seg.color}" />` +
      text(seg.label, { x: px + 20, y: podY + 18.5, size: 10.5, weight: 700, fill: theme.text, face: "sans" }) +
      text(`${seg.pct}%`, { x: px + thisPodW - 10, y: podY + 18.5, size: 9.5, weight: 700, fill: seg.color, anchor: "end", face: "mono" }) +
      text(`${kb} KB · ${seg.repos} repos`, { x: px + 12, y: podY + 33, size: 8.5, weight: 400, fill: theme.muted, face: "mono" }) +
      text(seg.role, { x: px + 12, y: podY + 45, size: 8, fill: theme.accent, weight: 600, face: "sans" }) +
      `</g>`;
  });

  return (
    `<g class="rise d40">` +
    text("LANGUAGE ALLOCATION BY VOLUME", {
      x,
      y: top + 14,
      size: 11,
      weight: 700,
      fill: theme.text,
      face: "sans",
    }) +
    text("SOURCE REPOSITORY BYTES", {
      x: x + width,
      y: top + 14,
      size: 9.5,
      fill: theme.muted,
      anchor: "end",
      weight: 600,
      face: "mono",
    }) +
    horizonBars +
    pods +
    `</g>`
  );
}

/**
 * Master Codebase Metrics & Activity Section
 */
export function bentoGithubSection(top, stats, theme, themeName) {
  const cardAY = top + 34;
  const cardAH = 130;
  const cardAW = 490;
  const cardBW = USABLE_W - cardAW - 14;

  // Row 1: Output Cadence + System Specifications
  const cardA = commitCadenceCard({ x: PAD, y: cardAY, width: cardAW, height: cardAH, stats, theme });
  const cardB = systemSpecificationsCard({ x: PAD + cardAW + 14, y: cardAY, width: cardBW, height: cardAH, stats, theme });

  // Row 2: Language Allocation
  const langHorizonTop = cardAY + cardAH + 16;
  const langHorizon = languageAllocationSection({ top: langHorizonTop, stats, theme });

  // Row 3: Compact Activity Trace (Understated, quiet, truthful!)
  const traceDividerY = langHorizonTop + 114;
  const traceHeaderY = traceDividerY + 18;
  const traceCellY = traceHeaderY + 16;

  // Compact cell size: 9px (down from 11px), pitch 12px
  const grid = contributionGrid({ days: stats.calendar, x: PAD, y: traceCellY, cell: 9, gap: 3, theme, id: themeName });

  const compactActivityTrace =
    rect({ x: PAD, y: traceDividerY, width: USABLE_W, height: 1, fill: theme.border, cls: "fade" }) +
    text("ACTIVITY LOG // REPOSITORY SPRINTS", {
      x: PAD,
      y: traceHeaderY,
      size: 10,
      weight: 700,
      fill: theme.text,
      face: "sans",
    }) +
    text("104 COMMITS ACROSS ACTIVE SPRINT WINDOWS", {
      x: PAD + USABLE_W,
      y: traceHeaderY,
      size: 8.5,
      fill: theme.muted,
      anchor: "end",
      weight: 600,
      face: "mono",
    }) +
    grid.markup +
    oscilloscopeScanner({ plot: grid.plot, theme, id: themeName }) +
    grid.legend(traceCellY + 7 * 12 + 14);

  return (
    text("3.0 SOURCE CODE AUDIT & ACTIVITY CHRONOLOGY", {
      x: PAD,
      y: top + 18,
      size: 11.5,
      weight: 700,
      fill: theme.text,
      face: "sans",
    }) +
    text(`ID: @${stats.login} // AUDIT LOG`, {
      x: PAD + USABLE_W,
      y: top + 18,
      size: 9.5,
      fill: theme.accent,
      anchor: "end",
      weight: 700,
      face: "mono",
    }) +
    cardA +
    cardB +
    langHorizon +
    compactActivityTrace
  );
}
