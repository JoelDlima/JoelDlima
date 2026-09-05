/**
 * Master Profile Poster for Joel D'Lima.
 * Distinct, non-derivative engineering poster tailored to Joel's resume:
 * - Terminal Header with Solid ANSI Block Monospace Banner & Spinning Galaxy Core
 * - Dual-Lane Auto-Scrolling Infinite Marquee for Tech Stack (React Bits style)
 * - GitHub Activity HUD: 52-Week Equalizer Spectrum, Cadence Gauge, Language Horizon Bar & Pods,
 *   and Oscilloscope Scan with live filling contribution boxes
 * - Space Telemetry Connect Channels & Status Console
 */

import { bentoGithubSection } from "./bento-stats.mjs";
import { VOID_GIF_BASE64 } from "./void-asset.mjs";
import { CONTACTS, SPACE_ICONS } from "./icons.mjs";
import { marqueeStack } from "./marquee.mjs";
import {
  THEMES,
  document_,
  fontFace,
  frame,
  icon,
  rect,
  text,
} from "./svg.mjs";

const WIDTH = 880;
const PAD = 34;
const RIGHT = WIDTH - PAD;

const MARK = Object.fromEntries(CONTACTS.map((c) => [c.key, c.path]));

function divider(y, theme) {
  return rect({ x: PAD, y, width: WIDTH - PAD * 2, height: 1, fill: theme.border, cls: "fade" });
}

function label(content, x, y, theme, delay) {
  return text(content, { x, y, size: 10, fill: theme.muted, spacing: 1.6, cls: `rise d${delay}`, face: "mono", weight: 700 });
}

function tagRow(left, right, y, theme, delay, mark = null) {
  return (
    (mark ? icon(mark, { x: PAD, y: y - 10, size: 12, fill: theme.accent || theme.muted, cls: `rise d${delay}` }) : "") +
    label(left, mark ? PAD + 18 : PAD, y, theme, delay) +
    text(right, { x: RIGHT, y, size: 10, fill: theme.muted, anchor: "end", cls: `rise d${delay + 2}`, face: "mono", weight: 700 })
  );
}

/* ------------------------------------------------------------- 1. HEADER */

const ASCII_BLOCK = [
  "     ██╗ ██████╗ ███████╗██╗     ██████╗ ██╗     ██╗███╗   ███╗ █████╗ ",
  "     ██║██╔═══██╗██╔════╝██║     ██╔══██╗██║     ██║████╗ ████║██╔══██╗",
  "     ██║██║   ██║█████╗  ██║     ██║  ██║██║     ██║██╔████╔██║███████║",
  "██   ██║██║   ██║██╔══╝  ██║     ██║  ██║██║     ██║██║╚██╔╝██║██╔══██║",
  "╚█████╔╝╚██████╔╝███████╗███████╗██████╔╝███████╗██║██║ ╚═╝ ██║██║  ██║",
  " ╚════╝  ╚═════╝ ╚══════╝╚══════╝╚═════╝ ╚══════╝╚═╝╚═╝     ╚═╝╚═╝  ╚═╝",
];

function identitySection(top, theme, themeName) {
  const terminalW = WIDTH - PAD * 2;
  const terminalH = 190;
  const termY = top + 20;

  const asciiMarkup = ASCII_BLOCK.map(
    (line, i) =>
      `<tspan x="${PAD + 22}" dy="${i === 0 ? 0 : 12}">${line}</tspan>`,
  ).join("");

  return (
    // Terminal Window Shell
    `<g class="rise d1">` +
    rect({ x: PAD, y: termY, width: terminalW, height: terminalH, fill: theme.cardBg, rx: 8, stroke: theme.border }) +
    rect({ x: PAD, y: termY, width: terminalW, height: 26, fill: theme.track, rx: 8 }) +
    rect({ x: PAD, y: termY + 16, width: terminalW, height: 10, fill: theme.track }) +
    rect({ x: PAD, y: termY + 26, width: terminalW, height: 1, fill: theme.border }) +
    // Terminal Window Buttons
    `<circle cx="${PAD + 14}" cy="${termY + 13}" r="4" fill="#ef4444" opacity="0.85" />` +
    `<circle cx="${PAD + 26}" cy="${termY + 13}" r="4" fill="#eab308" opacity="0.85" />` +
    `<circle cx="${PAD + 38}" cy="${termY + 13}" r="4" fill="#10b981" opacity="0.85" />` +
    text("joel@workstation: ~ (embedded-core)", {
      x: PAD + terminalW / 2,
      y: termY + 17,
      size: 10,
      fill: theme.muted,
      anchor: "middle",
      face: "mono",
      weight: 700,
    }) +
    // Live status pip (real blink, no fake view counters)
    `<circle cx="${RIGHT - 16}" cy="${termY + 13}" r="3.5" fill="${theme.accent}" class="blink" />` +
    // Razor-Sharp Solid Monospace Block ASCII Name
    `<text x="${PAD + 22}" y="${termY + 46}" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" fill="${theme.accent}" xml:space="preserve" class="pop d3">` +
    asciiMarkup +
    `</text>` +
    // Terminal Prompt System Lines
    `<g class="rise d5">` +
    text("> WHOAMI  : JOEL DLIMA", {
      x: PAD + 22,
      y: termY + 128,
      size: 10.5,
      fill: theme.text,
      weight: 700,
      face: "mono",
    }) +
    text("> ROLE    : SOFTWARE ENGINEERING INTERN", {
      x: PAD + 22,
      y: termY + 148,
      size: 10.5,
      fill: theme.accent,
      weight: 700,
      face: "mono",
    }) +
    `<text x="${PAD + 22}" y="${termY + 168}" font-family="'JetBrains Mono', monospace" font-size="10.5" fill="${theme.muted}" font-weight="700">` +
    `&gt; FOCUS   : EMBEDDED FIRMWARE (ESP32 / C++) · FULL-STACK WEB (REACT / NODE) · AI FEATURES <tspan class="blink" fill="${theme.accent}">█</tspan>` +
    `</text>` +
    `</g>` +
    `</g>` +
    // Black-hole void GIF (data URI — survives GitHub sanitisation)
    voidEmbed({ cx: 726, cy: termY + 116, width: 130 })
  );
}

/**
 * The black-hole void animation, inlined as a base64 GIF data URI (same
 * pattern as the astronaut/moon sheets). A looping ambient drift keeps it
 * alive without a second motion system.
 */
function voidEmbed({ cx, cy, width }) {
  const height = Math.round((width * 203) / 360);
  return (
    `<g class="float">` +
    `<image x="${cx - width / 2}" y="${cy - height / 2}" width="${width}" height="${height}" ` +
    `href="data:image/gif;base64,${VOID_GIF_BASE64}" />` +
    `</g>`
  );
}

/* ----------------------------------------------------- 3. BOTTOM CONNECT */

function bottomSection(top, links, theme) {
  let markup = tagRow("channels & transmission", "ground station telemetry", top + 24, theme, 50, SPACE_ICONS.orbit);

  // Connect Channels
  const chipH = 38;
  const chipW = Math.floor((WIDTH - PAD * 2 - 12 * (links.length - 1)) / links.length);
  const connY = top + 42;

  links.forEach((link, i) => {
    const cx = PAD + i * (chipW + 12);
    markup +=
      `<g class="rise d52">` +
      rect({ x: cx, y: connY, width: chipW, height: chipH, fill: theme.cardBg, rx: 8, stroke: theme.border }) +
      rect({ x: cx + 1, y: connY + 1, width: chipW - 2, height: chipH - 2, fill: theme.ink, rx: 7, opacity: 0.04 }) +
      icon(link.path, { x: cx + 14, y: connY + chipH / 2 - 8, size: 16, fill: theme.accent || theme.text }) +
      text(link.label.toUpperCase(), { x: cx + 38, y: connY + 16, size: 10.5, weight: 800, fill: theme.text, face: "mono" }) +
      text(link.handle, { x: cx + 38, y: connY + 29, size: 9, weight: 600, fill: theme.muted, face: "mono" }) +
      `</g>`;
  });

  // Terminal Console Status Line with Radar telemetry
  const footY = top + 92;
  markup +=
    rect({ x: PAD, y: footY, width: WIDTH - PAD * 2, height: 26, fill: theme.track, rx: 6, stroke: theme.border }) +
    `<circle cx="${PAD + 14}" cy="${footY + 13}" r="3.5" fill="${theme.accent}" class="blink" />` +
    icon(SPACE_ICONS.radar, { x: PAD + 24, y: footY + 7, size: 12, fill: theme.accent }) +
    text("SOFTWARE ENGINEERING INTERN  ·  EMBEDDED FIRMWARE × FULL-STACK WEB × AI", {
      x: PAD + 42,
      y: footY + 16.5,
      size: 9,
      fill: theme.muted,
      face: "mono",
      weight: 700,
    }) +
    text("CLASS OF '27", {
      x: RIGHT - 14,
      y: footY + 16.5,
      size: 9,
      fill: theme.gold,
      anchor: "end",
      face: "mono",
      weight: 800,
    });

  return markup;
}

/* ---------------------------------------------------------------- POSTER */

const SECTION = {
  identity: 236,
  stack: 140,
  github: 540,
  bottom: 128,
};

export function posterCard({ profile, links, stats, font }, themeName) {
  const theme = THEMES[themeName];

  const tops = {};
  let cursor = 0;
  for (const [name, height] of Object.entries(SECTION)) {
    tops[name] = cursor;
    cursor += height;
  }
  const height = cursor;

  const boundaries = Object.values(tops)
    .slice(1)
    .map((top) => divider(top, theme))
    .join("");

  const marquee = marqueeStack({ top: tops.stack, x: PAD, width: WIDTH - PAD * 2, theme, id: themeName });

  const body =
    frame({ width: WIDTH, height, theme, seed: `poster-${themeName}`, stars: 220 }) +
    boundaries +
    identitySection(tops.identity, theme, themeName) +
    marquee.markup +
    bentoGithubSection(tops.github, stats, theme, themeName) +
    bottomSection(tops.bottom, links, theme);

  return document_({
    width: WIDTH,
    height,
    title: `${profile.name} — GitHub Profile`,
    body,
    face: fontFace(font),
  });
}
