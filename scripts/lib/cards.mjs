/**
 * Master Profile Poster for Joel D'Lima.
 * Authentic Embedded Systems & Firmware Engineering Specification Poster:
 * - Specification Header with Crisp Name Decrypt & Visteon Engineering Callout
 * - Dual-Lane Technical Toolchain (Embedded Systems First)
 * - Tactile Experience & Honors Bento Modules (Visteon, SIH 3rd, HackIndia Top 25, 9.7 CGPA)
 * - Honest GitHub Activity & Language Distribution Horizon
 * - Clean Hardware Engineering Sign-Off Bar
 */

import { bentoGithubSection } from "./bento-stats.mjs";
import { SPACE_ICONS } from "./icons.mjs";
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

function identitySection(top, theme) {
  const boxW = WIDTH - PAD * 2;
  const boxH = 176;
  const boxY = top + 18;

  return (
    `<g class="rise d1">` +
    // Outer hardware module shell
    rect({ x: PAD, y: boxY, width: boxW, height: boxH, fill: theme.cardBg, rx: 8, stroke: theme.border }) +
    // Specification top bar
    rect({ x: PAD, y: boxY, width: boxW, height: 26, fill: theme.track, rx: 8 }) +
    rect({ x: PAD, y: boxY + 16, width: boxW, height: 10, fill: theme.track }) +
    rect({ x: PAD, y: boxY + 26, width: boxW, height: 1, fill: theme.border }) +
    // Spec status indicators
    `<circle cx="${PAD + 14}" cy="${boxY + 13}" r="3" fill="${theme.accent}" class="blink" />` +
    text("SPECIFICATION // EMBEDDED SYSTEMS & HARDWARE IDENTITY", {
      x: PAD + 24,
      y: boxY + 16.5,
      size: 9.5,
      fill: theme.muted,
      face: "mono",
      weight: 700,
    }) +
    text("LOC: GOA, IN (15.59° N, 73.81° E)  ·  CLASS OF '27", {
      x: RIGHT - 14,
      y: boxY + 16.5,
      size: 9.5,
      fill: theme.accent,
      anchor: "end",
      face: "mono",
      weight: 700,
    }) +
    // Authoritative Name with One-Time Hardware Decrypt Effect
    `<text x="${PAD + 22}" y="${boxY + 62}" font-family="'JetBrains Mono', monospace" font-size="26" font-weight="800" fill="${theme.text}" class="decrypt">` +
    `JOEL D'LIMA` +
    `</text>` +
    // Primary Specialization Subtitle
    `<text x="${PAD + 22}" y="${boxY + 84}" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" fill="${theme.accent}" class="decrypt-sub">` +
    `EMBEDDED SYSTEMS &amp; FIRMWARE ENGINEER  ·  B.E. ELECTRONICS &amp; COMPUTER ENGINEERING` +
    `</text>` +
    // Dedicated Visteon & Core Achievement Module
    `<g class="rise d5">` +
    rect({ x: PAD + 20, y: boxY + 100, width: boxW - 40, height: 60, fill: theme.track, rx: 6, stroke: theme.border }) +
    `<circle cx="${PAD + 36}" cy="${boxY + 120}" r="3.5" fill="${theme.accent}" class="blink" />` +
    text("SOFTWARE ENGINEERING INTERN @ VISTEON CORPORATION", {
      x: PAD + 48,
      y: boxY + 124,
      size: 11.5,
      fill: theme.text,
      weight: 800,
      face: "mono",
    }) +
    text("[ CURRENT ]", {
      x: RIGHT - 32,
      y: boxY + 124,
      size: 10,
      fill: theme.accent,
      anchor: "end",
      weight: 800,
      face: "mono",
    }) +
    text("Automotive electronics, embedded firmware & microcontroller software", {
      x: PAD + 48,
      y: boxY + 144,
      size: 10,
      fill: theme.muted,
      weight: 500,
      face: "mono",
    }) +
    text("CGPA: 9.7 / 10.0", {
      x: RIGHT - 32,
      y: boxY + 144,
      size: 10.5,
      fill: theme.gold,
      anchor: "end",
      weight: 800,
      face: "mono",
    }) +
    `</g>` +
    `</g>`
  );
}

/* --------------------------------------------------------- 2. EXPERIENCE */

function experienceSection(top, theme) {
  const colW = Math.floor((WIDTH - PAD * 2 - 16) / 2); // 398px
  const colH = 196;

  let markup =
    tagRow("experience & honors", "visteon · sih 3rd · hackindia top 25 · aitd", top + 26, theme, 26, SPACE_ICONS.satellite) +
    // Left column: career & academics module
    `<g class="rise d27">` +
    rect({ x: PAD, y: top + 42, width: colW, height: colH, fill: theme.cardBg, rx: 8, stroke: theme.border }) +
    // Visteon block
    text("VISTEON CORPORATION", { x: PAD + 16, y: top + 64, size: 12.5, weight: 800, fill: theme.text, face: "mono" }) +
    text("SWE Intern  ·  Current (Panjim, Goa)", { x: PAD + 16, y: top + 79, size: 10.5, weight: 700, fill: theme.accent, face: "mono" }) +
    text("Automotive electronics & embedded systems", { x: PAD + 16, y: top + 93, size: 9.5, weight: 500, fill: theme.muted, face: "mono" }) +
    // Separator line
    rect({ x: PAD + 16, y: top + 104, width: colW - 32, height: 1, fill: theme.border, opacity: 0.6 }) +
    // Academics block
    text("AGNEL INSTITUTE OF TECH & DESIGN", { x: PAD + 16, y: top + 124, size: 12.5, weight: 800, fill: theme.text, face: "mono" }) +
    text("B.E. Electronics & Computer Engineering  ·  '27", { x: PAD + 16, y: top + 139, size: 10.5, weight: 700, fill: theme.accent, face: "mono" }) +
    text("CGPA: 9.7  ·  Sem I–III: 10.0  ·  Sem IV: 9.81", { x: PAD + 16, y: top + 153, size: 9.5, weight: 800, fill: theme.gold, face: "mono" }) +
    // Separator line
    rect({ x: PAD + 16, y: top + 164, width: colW - 32, height: 1, fill: theme.border, opacity: 0.6 }) +
    // EpicForce
    text("EPICFORCE — Software Developer (Feb–Jun '26)", { x: PAD + 16, y: top + 182, size: 9.5, weight: 700, fill: theme.text, face: "mono" }) +
    text("React systems · Scoped Supabase data architecture", { x: PAD + 16, y: top + 196, size: 9, weight: 500, fill: theme.muted, face: "mono" }) +
    `</g>` +

    // Right column: honors & hackathons module
    `<g class="rise d29">` +
    rect({ x: PAD + colW + 16, y: top + 42, width: colW, height: colH, fill: theme.cardBg, rx: 8, stroke: theme.border }) +
    text("HONORS & COMPETITIVE ENGINEERING", { x: PAD + colW + 32, y: top + 64, size: 11, weight: 800, spacing: 1.2, fill: theme.gold, face: "mono" }) +

    text("[3RD PLACE] Smart India Hackathon (SIH)", { x: PAD + colW + 32, y: top + 88, size: 10.5, weight: 700, fill: theme.text, face: "mono" }) +
    text("3rd place finish in Software & Hardware tracks", { x: PAD + colW + 32, y: top + 101, size: 9.5, weight: 500, fill: theme.muted, face: "mono" }) +

    text("[TOP 25] HackIndia — State Level Finish", { x: PAD + colW + 32, y: top + 123, size: 10.5, weight: 700, fill: theme.text, face: "mono" }) +
    text("Selected in top 25 teams across state in 2nd year", { x: PAD + colW + 32, y: top + 136, size: 9.5, weight: 500, fill: theme.muted, face: "mono" }) +

    text("[LEAP AI] Lenovo Dual Track Certification", { x: PAD + colW + 32, y: top + 158, size: 10.5, weight: 700, fill: theme.text, face: "mono" }) +
    text("Dual 8-week completions: AI & Web Technologies", { x: PAD + colW + 32, y: top + 171, size: 9.5, weight: 500, fill: theme.muted, face: "mono" }) +

    text("[FINALIST] GDG Goa 'Build for All'", { x: PAD + colW + 32, y: top + 193, size: 10, weight: 700, fill: theme.muted, face: "mono" }) +
    text("Built RideScore driving scorer and AccessMate", { x: PAD + colW + 32, y: top + 206, size: 9, weight: 500, fill: theme.muted, face: "mono" }) +
    `</g>`;

  return markup;
}

/* ----------------------------------------------------- 3. BOTTOM SIGN-OFF */

function bottomSection(top, theme) {
  const footY = top + 16;
  const footW = WIDTH - PAD * 2;
  const footH = 34;

  return (
    `<g class="rise d50">` +
    rect({ x: PAD, y: footY, width: footW, height: footH, fill: theme.cardBg, rx: 6, stroke: theme.border }) +
    `<circle cx="${PAD + 14}" cy="${footY + footH / 2}" r="3.5" fill="${theme.accent}" class="blink" />` +
    text("JOEL D'LIMA  ·  ELECTRONICS & COMPUTER ENGINEERING  ·  GOA, INDIA", {
      x: PAD + 28,
      y: footY + footH / 2 + 3.5,
      size: 9.5,
      fill: theme.text,
      face: "mono",
      weight: 700,
    }) +
    text("CLASS OF 2027  ·  READY TO SHIP EMBEDDED SYSTEMS & FIRMWARE", {
      x: RIGHT - 14,
      y: footY + footH / 2 + 3.5,
      size: 9.5,
      fill: theme.accent,
      anchor: "end",
      face: "mono",
      weight: 700,
    }) +
    `</g>`
  );
}

/* ---------------------------------------------------------------- POSTER */

const SECTION = {
  identity: 206,
  stack: 140,
  experience: 256,
  github: 540,
  bottom: 64,
};

export function posterCard({ profile, stats, font }, themeName) {
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
    frame({ width: WIDTH, height, theme, seed: `poster-${themeName}` }) +
    boundaries +
    identitySection(tops.identity, theme) +
    marquee.markup +
    experienceSection(tops.experience, theme) +
    bentoGithubSection(tops.github, stats, theme, themeName) +
    bottomSection(tops.bottom, theme);

  return document_({
    width: WIDTH,
    height,
    title: `${profile.name} — GitHub Profile`,
    body,
    face: fontFace(font),
  });
}
