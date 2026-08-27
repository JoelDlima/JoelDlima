/**
 * Master Profile Poster for Joel D'Lima.
 * Hardware Engineering Specification & Technical Datasheet:
 * - Technical Drawing Title Block with True Title/Serif Hierarchy
 * - Absolute Maximum Ratings & Parametrics Table
 * - Literal Hardware IC Pinout Diagram (Breaks Stacked-Box Rhythm)
 * - Non-Redundant Operational Record & Verified Milestones
 * - Non-Redundant System Architecture Specifications
 * - Compact Repository Activity Chronology
 * - Document Control Footer
 */

import { bentoGithubSection } from "./bento-stats.mjs";
import { marqueeStack } from "./marquee.mjs";
import {
  FACES,
  THEMES,
  document_,
  fontFace,
  frame,
  rect,
  text,
} from "./svg.mjs";

const WIDTH = 880;
const PAD = 34;
const RIGHT = WIDTH - PAD;
const USABLE_W = WIDTH - PAD * 2; // 812px

function divider(y, theme) {
  return rect({ x: PAD, y, width: USABLE_W, height: 1, fill: theme.border, opacity: 0.6, cls: "fade" });
}

/* ------------------------------------------------ 1. DATASHEET TITLE BLOCK */

function identitySection(top, theme) {
  const boxW = USABLE_W;
  const boxH = 202;
  const boxY = top + 16;

  // 4-cell Parametric Ratings Geometry
  const cellY = boxY + 142;
  const cellH = 46;
  const cellW = Math.floor((boxW - 20) / 4);

  return (
    `<g class="rise d1">` +
    // Outer specification drawing frame
    rect({ x: PAD, y: boxY, width: boxW, height: boxH, fill: theme.cardBg, rx: 6, stroke: theme.border }) +
    // Technical Document Header Strip
    rect({ x: PAD, y: boxY, width: boxW, height: 26, fill: theme.track, rx: 6 }) +
    rect({ x: PAD, y: boxY + 16, width: boxW, height: 10, fill: theme.track }) +
    rect({ x: PAD, y: boxY + 26, width: boxW, height: 1, fill: theme.border }) +
    text("TECHNICAL SPECIFICATION // DOC NO. JDL-2027-SPEC", {
      x: PAD + 14,
      y: boxY + 16.5,
      size: 9,
      fill: theme.muted,
      face: "mono",
      weight: 600,
    }) +
    text("CLASSIFICATION: EMBEDDED SYSTEMS & HARDWARE", {
      x: PAD + boxW / 2,
      y: boxY + 16.5,
      size: 9,
      fill: theme.muted,
      anchor: "middle",
      face: "mono",
      weight: 600,
    }) +
    `<circle cx="${RIGHT - 150}" cy="${boxY + 13}" r="3" fill="${theme.accent}" class="blink" />` +
    text("STATUS: ACTIVE [PRODUCTION]", {
      x: RIGHT - 14,
      y: boxY + 16.5,
      size: 9,
      fill: theme.accent,
      anchor: "end",
      face: "mono",
      weight: 700,
    }) +
    // Name in Authoritative Title/Editorial Type: Instant Contrast Against Monospace Data
    `<text x="${PAD + 20}" y="${boxY + 62}" font-family="${FACES.title}" font-size="31" font-weight="700" fill="${theme.text}" letter-spacing="0.5px" class="decrypt">` +
    `JOEL D'LIMA` +
    `</text>` +
    // Primary Specialization Title: Technical Sans
    `<text x="${PAD + 20}" y="${boxY + 84}" font-family="${FACES.sans}" font-size="12" font-weight="700" fill="${theme.accent}" letter-spacing="0.3px">` +
    `EMBEDDED SYSTEMS &amp; FIRMWARE ENGINEER` +
    `</text>` +
    // Primary Appointments Prose: High Contrast Sans
    text("Software Engineering Intern at Visteon Corporation · Automotive Electronics & Microcontroller Firmware", {
      x: PAD + 20,
      y: boxY + 104,
      size: 10.5,
      weight: 400,
      fill: theme.muted,
      face: "sans",
    }) +
    text("B.E. Electronics & Computer Engineering (2023–2027) · Agnel Institute of Technology & Design, Goa", {
      x: PAD + 20,
      y: boxY + 122,
      size: 10.5,
      weight: 400,
      fill: theme.muted,
      face: "sans",
    }) +
    // Absolute Maximum Ratings & Key Parametrics Table (Primary Focus for Numbers)
    `<g class="rise d5">` +
    rect({ x: PAD + 10, y: cellY, width: boxW - 20, height: cellH, fill: theme.track, rx: 4, stroke: theme.border }) +
    // Cell 1: CGPA
    text("CUMULATIVE CGPA", { x: PAD + 20, y: cellY + 14, size: 8, weight: 600, fill: theme.muted, face: "sans" }) +
    text("9.70 / 10.00", { x: PAD + 20, y: cellY + 31, size: 12, weight: 800, fill: theme.gold, face: "mono" }) +
    text("Top 1% Academic Rank", { x: PAD + 20, y: cellY + 41, size: 8, weight: 400, fill: theme.muted, face: "sans" }) +
    rect({ x: PAD + 10 + cellW, y: cellY + 6, width: 1, height: cellH - 12, fill: theme.border, opacity: 0.5 }) +
    // Cell 2: Role
    text("ACTIVE APPOINTMENT", { x: PAD + 20 + cellW, y: cellY + 14, size: 8, weight: 600, fill: theme.muted, face: "sans" }) +
    text("SWE INTERN", { x: PAD + 20 + cellW, y: cellY + 31, size: 12, weight: 800, fill: theme.accent, face: "mono" }) +
    text("Visteon Corporation", { x: PAD + 20 + cellW, y: cellY + 41, size: 8, weight: 400, fill: theme.muted, face: "sans" }) +
    rect({ x: PAD + 10 + cellW * 2, y: cellY + 6, width: 1, height: cellH - 12, fill: theme.border, opacity: 0.5 }) +
    // Cell 3: SIH
    text("COMPETITIVE FINISH", { x: PAD + 20 + cellW * 2, y: cellY + 14, size: 8, weight: 600, fill: theme.muted, face: "sans" }) +
    text("3RD PLACE", { x: PAD + 20 + cellW * 2, y: cellY + 31, size: 12, weight: 800, fill: theme.text, face: "mono" }) +
    text("Smart India Hackathon", { x: PAD + 20 + cellW * 2, y: cellY + 41, size: 8, weight: 400, fill: theme.muted, face: "sans" }) +
    rect({ x: PAD + 10 + cellW * 3, y: cellY + 6, width: 1, height: cellH - 12, fill: theme.border, opacity: 0.5 }) +
    // Cell 4: HackIndia
    text("STATEWIDE HONORS", { x: PAD + 20 + cellW * 3, y: cellY + 14, size: 8, weight: 600, fill: theme.muted, face: "sans" }) +
    text("TOP 25 FINISH", { x: PAD + 20 + cellW * 3, y: cellY + 31, size: 12, weight: 800, fill: theme.text, face: "mono" }) +
    text("HackIndia State Finalist", { x: PAD + 20 + cellW * 3, y: cellY + 41, size: 8, weight: 400, fill: theme.muted, face: "sans" }) +
    `</g>` +
    `</g>`
  );
}

/* ------------------------------------------- 2. OPERATIONAL RECORD & HONORS */

function experienceSection(top, theme) {
  const colW = Math.floor((USABLE_W - 16) / 2); // 398px
  const colH = 224;
  const cardY = top + 32;

  return (
    // Section Header Tag
    text("2.0 VERIFIED APPOINTMENTS & COMPETITION MILESTONES", {
      x: PAD,
      y: top + 18,
      size: 11.5,
      weight: 700,
      fill: theme.text,
      face: "sans",
    }) +
    text("CHRONOLOGY & VERIFIED MILESTONES", {
      x: RIGHT,
      y: top + 18,
      size: 9.5,
      fill: theme.muted,
      anchor: "end",
      weight: 600,
      face: "mono",
    }) +
    // Left Column: 2.1 Appointments & Education
    `<g class="rise d27">` +
    rect({ x: PAD, y: cardY, width: colW, height: colH, fill: theme.cardBg, rx: 6, stroke: theme.border }) +
    text("2.1 PROFESSIONAL & ACADEMIC APPOINTMENTS", {
      x: PAD + 16,
      y: cardY + 20,
      size: 9.5,
      weight: 700,
      fill: theme.muted,
      face: "sans",
    }) +
    // Visteon
    text("VISTEON CORPORATION", { x: PAD + 16, y: cardY + 42, size: 12.5, weight: 700, fill: theme.text, face: "sans" }) +
    text("Software Engineering Intern  ·  Current (Panjim, Goa)", { x: PAD + 16, y: cardY + 57, size: 9.5, weight: 700, fill: theme.accent, face: "mono" }) +
    text("Automotive electronics, embedded firmware & microcontroller systems.", { x: PAD + 16, y: cardY + 71, size: 9.5, weight: 400, fill: theme.muted, face: "sans" }) +
    rect({ x: PAD + 16, y: cardY + 81, width: colW - 32, height: 1, fill: theme.border, opacity: 0.5 }) +
    // Agnel Institute (NON-REDUNDANT: Focusing on academic coursework & honors!)
    text("AGNEL INSTITUTE OF TECH & DESIGN", { x: PAD + 16, y: cardY + 102, size: 12.5, weight: 700, fill: theme.text, face: "sans" }) +
    text("B.E. Electronics & Computer Engineering  ·  Class of 2027", { x: PAD + 16, y: cardY + 117, size: 9.5, weight: 700, fill: theme.accent, face: "mono" }) +
    text("Major: Embedded Systems & Computing · Five Consecutive Dean's Lists", { x: PAD + 16, y: cardY + 131, size: 8.5, weight: 600, fill: theme.gold, face: "sans" }) +
    rect({ x: PAD + 16, y: cardY + 141, width: colW - 32, height: 1, fill: theme.border, opacity: 0.5 }) +
    // EpicForce
    text("EPICFORCE (INNERVERSE)", { x: PAD + 16, y: cardY + 162, size: 11.5, weight: 700, fill: theme.text, face: "sans" }) +
    text("Software Developer  ·  Feb 2026 – Jun 2026", { x: PAD + 16, y: cardY + 177, size: 9.5, weight: 600, fill: theme.muted, face: "mono" }) +
    text("Interactive modules in React; designed database schema in Supabase.", { x: PAD + 16, y: cardY + 191, size: 9, weight: 400, fill: theme.muted, face: "sans" }) +
    `</g>` +

    // Right Column: 2.2 Competitive Engineering & Honors
    `<g class="rise d29">` +
    rect({ x: PAD + colW + 16, y: cardY, width: colW, height: colH, fill: theme.cardBg, rx: 6, stroke: theme.border }) +
    text("2.2 COMPETITIVE ENGINEERING & HONORS", {
      x: PAD + colW + 32,
      y: cardY + 20,
      size: 9.5,
      weight: 700,
      fill: theme.muted,
      face: "sans",
    }) +
    // SIH
    text("Smart India Hackathon (SIH)", { x: PAD + colW + 32, y: cardY + 42, size: 12, weight: 700, fill: theme.text, face: "sans" }) +
    text("[3RD PLACE FINISH] Software & Hardware Tracks (Internal SIH)", { x: PAD + colW + 32, y: cardY + 56, size: 9, weight: 700, fill: theme.gold, face: "mono" }) +
    text("Built functional hardware prototype integrating sensor ingest & edge compute.", { x: PAD + colW + 32, y: cardY + 69, size: 8.5, weight: 400, fill: theme.muted, face: "sans" }) +
    rect({ x: PAD + colW + 32, y: cardY + 77, width: colW - 48, height: 1, fill: theme.border, opacity: 0.5 }) +
    // HackIndia
    text("HackIndia Hackathon", { x: PAD + colW + 32, y: cardY + 95, size: 12, weight: 700, fill: theme.text, face: "sans" }) +
    text("[TOP 25 TEAMS] State-Level Finalist Finish", { x: PAD + colW + 32, y: cardY + 109, size: 9, weight: 700, fill: theme.accent, face: "mono" }) +
    text("Selected in top 25 teams across state in 2nd year of engineering.", { x: PAD + colW + 32, y: cardY + 122, size: 8.5, weight: 400, fill: theme.muted, face: "sans" }) +
    rect({ x: PAD + colW + 32, y: cardY + 130, width: colW - 48, height: 1, fill: theme.border, opacity: 0.5 }) +
    // Lenovo LEAP
    text("Lenovo LEAP AI Program", { x: PAD + colW + 32, y: cardY + 148, size: 11.5, weight: 700, fill: theme.text, face: "sans" }) +
    text("[DUAL-TRACK CERTIFIED] AI & Web Technologies", { x: PAD + colW + 32, y: cardY + 162, size: 9, weight: 700, fill: theme.text, face: "mono" }) +
    text("Completed dual 8-week engineering tracks in AI and modern web systems.", { x: PAD + colW + 32, y: cardY + 175, size: 8.5, weight: 400, fill: theme.muted, face: "sans" }) +
    rect({ x: PAD + colW + 32, y: cardY + 183, width: colW - 48, height: 1, fill: theme.border, opacity: 0.5 }) +
    // GDG Goa
    text("GDG Goa 'Build for All'", { x: PAD + colW + 32, y: cardY + 199, size: 11, weight: 700, fill: theme.text, face: "sans" }) +
    text("[PROJECT FINALIST] Google Developer Groups Participant", { x: PAD + colW + 32, y: cardY + 212, size: 8.5, weight: 600, fill: theme.muted, face: "mono" }) +
    `</g>`
  );
}

/* ---------------------------------------------------- 3. DOCUMENT CONTROL */

function documentControlSection(top, theme) {
  const footY = top + 14;
  const footH = 32;

  return (
    `<g class="rise d50">` +
    rect({ x: PAD, y: footY, width: USABLE_W, height: footH, fill: theme.cardBg, rx: 4, stroke: theme.border }) +
    text("DOCUMENT CONTROL: JDL-SPEC-2027-REV2.7", {
      x: PAD + 14,
      y: footY + footH / 2 + 3.5,
      size: 9,
      fill: theme.muted,
      face: "mono",
      weight: 600,
    }) +
    text("ISSUED: GOA, INDIA  ·  BATCH OF 2027", {
      x: PAD + USABLE_W / 2,
      y: footY + footH / 2 + 3.5,
      size: 9,
      fill: theme.muted,
      anchor: "middle",
      face: "mono",
      weight: 600,
    }) +
    `<circle cx="${RIGHT - 130}" cy="${footY + footH / 2}" r="3" fill="${theme.accent}" class="blink" />` +
    text("STATUS: VERIFIED & ACTIVE", {
      x: RIGHT - 14,
      y: footY + footH / 2 + 3.5,
      size: 9,
      fill: theme.accent,
      anchor: "end",
      face: "mono",
      weight: 700,
    }) +
    `</g>`
  );
}

/* --------------------------------------------------------- MASTER POSTER */

const SECTION = {
  identity: 232,
  stack: 238,
  experience: 278,
  github: 512,
  bottom: 58,
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

  const pinoutDiagram = marqueeStack({ top: tops.stack, x: PAD, width: USABLE_W, theme, id: themeName });

  const body =
    frame({ width: WIDTH, height, theme, seed: `datasheet-${themeName}` }) +
    boundaries +
    identitySection(tops.identity, theme) +
    pinoutDiagram.markup +
    experienceSection(tops.experience, theme) +
    bentoGithubSection(tops.github, stats, theme, themeName) +
    documentControlSection(tops.bottom, theme);

  return document_({
    width: WIDTH,
    height,
    title: `${profile.name} — Technical Specification Datasheet`,
    body,
    face: fontFace(font),
  });
}
