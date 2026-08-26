/**
 * Master Profile Poster for Joel D'Lima.
 * Distinct, non-derivative engineering poster tailored to Joel's resume:
 * - Terminal Header with Solid ANSI Block Monospace Banner & Spinning Galaxy Core
 * - Dual-Lane Auto-Scrolling Infinite Marquee for Tech Stack (React Bits style)
 * - Experience & Academic Timeline (Current Visteon SWE Intern, EpicForce, AITD CGPA 9.7, Hackathons)
 * - GitHub Activity HUD: 52-Week Equalizer Spectrum, Cadence Gauge, Language Horizon Bar & Pods,
 *   and Oscilloscope Scan with live filling contribution boxes
 * - Space Telemetry Connect Channels & Status Console
 */

import { bentoGithubSection } from "./bento-stats.mjs";
import { galaxyCore } from "./galaxy.mjs";
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

function identitySection(top, theme, themeName, views) {
  const terminalW = WIDTH - PAD * 2;
  const terminalH = 206;
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
    text("joel@aitd-workstation: ~ (embedded-core)", {
      x: PAD + terminalW / 2,
      y: termY + 17,
      size: 10,
      fill: theme.muted,
      anchor: "middle",
      face: "mono",
      weight: 700,
    }) +
    (views
      ? text(`${views.toLocaleString("en-US")} views`, {
          x: RIGHT - 16,
          y: termY + 17,
          size: 9.5,
          fill: theme.accent,
          anchor: "end",
          face: "mono",
          weight: 700,
        })
      : "") +
    // Razor-Sharp Solid Monospace Block ASCII Name
    `<text x="${PAD + 22}" y="${termY + 46}" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" fill="${theme.accent}" xml:space="preserve" class="pop d3">` +
    asciiMarkup +
    `</text>` +
    // Terminal Prompt System Lines
    `<g class="rise d5">` +
    text("> WHOAMI  : JOEL D'LIMA · MAPUSA, GOA, INDIA", {
      x: PAD + 22,
      y: termY + 128,
      size: 10.5,
      fill: theme.text,
      weight: 700,
      face: "mono",
    }) +
    text("> ROLE    : SOFTWARE ENGINEERING INTERN @ VISTEON CORPORATION (CURRENT)", {
      x: PAD + 22,
      y: termY + 146,
      size: 10.5,
      fill: theme.accent,
      weight: 700,
      face: "mono",
    }) +
    text("> FOCUS   : AUTOMOTIVE ELECTRONICS · EMBEDDED FIRMWARE · FULL-STACK WEB", {
      x: PAD + 22,
      y: termY + 164,
      size: 10.5,
      fill: theme.muted,
      weight: 700,
      face: "mono",
    }) +
    `<text x="${PAD + 22}" y="${termY + 182}" font-family="'JetBrains Mono', monospace" font-size="10.5" fill="${theme.gold}" font-weight="700">` +
    `&gt; STATUS  : CGPA: 9.7/10.0 · HACKINDIA TOP 25 · SIH 3RD · LENOVO LEAP AI <tspan class="blink" fill="${theme.accent}">█</tspan>` +
    `</text>` +
    `</g>` +
    `</g>` +
    // Spinning Galaxy Vortex Core (Astronomical live element)
    galaxyCore({ cx: 726, cy: termY + 116, theme, id: themeName })
  );
}

/* --------------------------------------------------------- 2. EXPERIENCE */

function experienceSection(top, theme) {
  let markup =
    tagRow("experience & honors", "visteon · epicforce · aitd", top + 28, theme, 26, SPACE_ICONS.satellite) +
    // Left column: career & academics
    text("VISTEON CORPORATION", { x: PAD, y: top + 58, size: 13, weight: 800, fill: theme.text, cls: "pop d27", face: "mono" }) +
    text("Software Engineering Intern  ·  Current (Panjim, Goa)", { x: PAD, y: top + 74, size: 10.5, weight: 700, fill: theme.accent, cls: "rise d28", face: "mono" }) +
    text("Automotive electronics & embedded software systems", { x: PAD, y: top + 89, size: 10, weight: 600, fill: theme.muted, cls: "rise d29", face: "mono" }) +

    text("EPICFORCE (INNERVERSE)", { x: PAD, y: top + 116, size: 13, weight: 800, fill: theme.text, cls: "pop d30", face: "mono" }) +
    text("Software Developer  ·  Feb 2026 – Jun 2026", { x: PAD, y: top + 132, size: 10.5, weight: 700, fill: theme.accent, cls: "rise d31", face: "mono" }) +
    text("Rebuilt quiz & UI in React · Scoped Supabase architecture", { x: PAD, y: top + 147, size: 10, weight: 600, fill: theme.muted, cls: "rise d32", face: "mono" }) +

    text("AGNEL INSTITUTE OF TECH & DESIGN", { x: PAD, y: top + 174, size: 13, weight: 800, fill: theme.text, cls: "pop d33", face: "mono" }) +
    text("B.E. Electronics & Computer Engineering  ·  2023 – 2027", { x: PAD, y: top + 190, size: 10.5, weight: 700, fill: theme.accent, cls: "rise d34", face: "mono" }) +
    text("CGPA: 9.7  ·  Sem I–III: 10.0  ·  Sem IV: 9.81  ·  Sem V: 9.41", { x: PAD, y: top + 205, size: 10, weight: 800, fill: theme.gold, cls: "rise d35", face: "mono" }) +

    // Vertical separator
    rect({ x: 440, y: top + 46, width: 1, height: 168, fill: theme.border, cls: "fade" }) +

    // Right column: honors & hackathons
    text("HONORS & HACKATHONS", { x: 462, y: top + 58, size: 12, weight: 800, spacing: 1.2, fill: theme.gold, cls: "pop d27", face: "mono" }) +

    text("[TOP 25] HackIndia — State Level Finish", { x: 462, y: top + 84, size: 11, weight: 700, fill: theme.text, cls: "rise d28", face: "mono" }) +
    text("Selected in top 25 teams across state in 2nd year", { x: 462, y: top + 98, size: 9.5, weight: 600, fill: theme.muted, cls: "rise d29", face: "mono" }) +

    text("[3RD PLACE] Smart India Hackathon (SIH)", { x: 462, y: top + 124, size: 11, weight: 700, fill: theme.text, cls: "rise d30", face: "mono" }) +
    text("3rd place in Software & Hardware tracks (Internal SIH)", { x: 462, y: top + 138, size: 9.5, weight: 600, fill: theme.muted, cls: "rise d31", face: "mono" }) +

    text("[LEAP AI] Lenovo Dual Track Certification", { x: 462, y: top + 164, size: 11, weight: 700, fill: theme.text, cls: "rise d32", face: "mono" }) +
    text("Dual 8-week completions: AI & Web Technologies", { x: 462, y: top + 178, size: 9.5, weight: 600, fill: theme.muted, cls: "rise d33", face: "mono" }) +

    text("[BUILD] GDG Goa 'Build for All' Participant", { x: 462, y: top + 204, size: 11, weight: 700, fill: theme.text, cls: "rise d34", face: "mono" }) +
    text("Built RideScore driving scorer and AccessMate accessibility", { x: 462, y: top + 218, size: 9.5, weight: 600, fill: theme.muted, cls: "rise d35", face: "mono" });

  return markup;
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
    text("VISTEON SWE INTERN  ·  READY TO SHIP FIRMWARE & SOFTWARE  ·  GOA, IN (15.59° N, 73.81° E)", {
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
  experience: 230,
  github: 540,
  bottom: 128,
};

export function posterCard({ profile, links, stats, font, views }, themeName) {
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
    identitySection(tops.identity, theme, themeName, views) +
    marquee.markup +
    experienceSection(tops.experience, theme) +
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
