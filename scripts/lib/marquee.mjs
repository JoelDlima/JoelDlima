/**
 * React Bits style Infinite Scrolling Marquee for Tech Stack
 * Dual-lane auto-scrolling horizontal ribbon tracks with edge-fade masks.
 * Lane 1: Embedded Hardware & Core Languages (Scrolls Left)
 * Lane 2: Web Frameworks, AI & Cloud Infrastructure (Scrolls Right)
 */

import { STACK_GROUPS } from "./stack.mjs";
import { icon, rect, text } from "./svg.mjs";

const ALL_ITEMS = new Map(
  STACK_GROUPS.flatMap((g) => g.items).map((item) => [item.label, item]),
);

const CHIP = {
  height: 30,
  padX: 12,
  icon: 14,
  iconGap: 7,
  font: 11,
  gap: 12,
};

function chipWidth(item) {
  const glyph = item.path ? CHIP.icon + CHIP.iconGap : 0;
  return Math.round(CHIP.padX * 2 + glyph + item.label.length * CHIP.font * 0.6);
}

function renderChip(item, x, y, theme) {
  const width = chipWidth(item);
  const textX = x + CHIP.padX + (item.path ? CHIP.icon + CHIP.iconGap : 0);
  return (
    `<g>` +
    rect({ x, y, width, height: CHIP.height, fill: theme.cardBg, rx: 7, stroke: theme.border }) +
    rect({ x: x + 1, y: y + 1, width: width - 2, height: CHIP.height - 2, fill: theme.ink, rx: 6, opacity: 0.04 }) +
    (item.path
      ? icon(item.path, { x: x + CHIP.padX, y: y + (CHIP.height - CHIP.icon) / 2, size: CHIP.icon, fill: theme.accent || theme.text, opacity: 0.95 })
      : "") +
    text(item.label, { x: textX, y: y + CHIP.height / 2 + 3.8, size: CHIP.font, fill: theme.text, weight: 500 }) +
    `</g>`
  );
}

function buildLane(labels, y, theme) {
  let x = 0;
  const items = labels.map((l) => ALL_ITEMS.get(l) || { label: l, path: null });
  let markup = "";

  for (const it of items) {
    markup += renderChip(it, x, y, theme);
    x += chipWidth(it) + CHIP.gap;
  }

  return { markup, totalWidth: x };
}

export function marqueeStack({ top, x = 34, width = 812, theme, id = "dark" }) {
  const lane1Labels = [
    "esp32",
    "c++",
    "c",
    "python",
    "typescript",
    "javascript",
    "arduino",
    "linux",
    "html5",
    "css3",
    "sql",
  ];

  const lane2Labels = [
    "react",
    "next.js",
    "tailwind",
    "vite",
    "node",
    "fastapi",
    "flask",
    "supabase",
    "gemini api",
    "tensorflow",
    "pytorch",
    "postgres",
    "docker",
    "git",
    "github",
    "figma",
  ];

  const lane1Y = top + 52;
  const lane2Y = lane1Y + CHIP.height + 12;

  const l1 = buildLane(lane1Labels, lane1Y, theme);
  const l2 = buildLane(lane2Labels, lane2Y, theme);

  const maskId = `marquee-mask-${id}`;
  const clipId = `marquee-clip-${id}`;

  return {
    height: 140,
    markup:
      `<defs>` +
      `<clipPath id="${clipId}">` +
      `<rect x="${x}" y="${top + 40}" width="${width}" height="84" rx="8" />` +
      `</clipPath>` +
      `<linearGradient id="fade-grad-${id}" x1="0%" y1="0%" x2="100%" y2="0%">` +
      `<stop offset="0%" stop-color="#000" stop-opacity="0" />` +
      `<stop offset="7%" stop-color="#fff" stop-opacity="1" />` +
      `<stop offset="93%" stop-color="#fff" stop-opacity="1" />` +
      `<stop offset="100%" stop-color="#000" stop-opacity="0" />` +
      `</linearGradient>` +
      `<mask id="${maskId}">` +
      `<rect x="${x}" y="${top + 40}" width="${width}" height="84" fill="url(#fade-grad-${id})" />` +
      `</mask>` +
      `</defs>` +
      // Header tag row
      text("TECH STACK", { x, y: top + 26, size: 10, spacing: 1.6, fill: theme.muted, cls: "rise d10", face: "display" }) +
      text("AUTO-SCROLLING HARDWARE & SOFTWARE REGISTRY", {
        x: x + width,
        y: top + 26,
        size: 9.5,
        fill: theme.accent,
        anchor: "end",
        cls: "rise d12",
        weight: 600,
      }) +
      // Background track container
      rect({ x, y: top + 42, width, height: 80, fill: theme.bg, rx: 8, stroke: theme.border, opacity: 0.8 }) +
      `<g clip-path="url(#${clipId})" mask="url(#${maskId})">` +
      // Lane 1: Scrolling left
      `<g class="marquee-track-l1" style="--w1:${l1.totalWidth}px">` +
      `<g>${l1.markup}</g>` +
      `<g transform="translate(${l1.totalWidth} 0)">${l1.markup}</g>` +
      `</g>` +
      // Lane 2: Scrolling right
      `<g class="marquee-track-l2" style="--w2:${l2.totalWidth}px">` +
      `<g transform="translate(-${l2.totalWidth} 0)">${l2.markup}</g>` +
      `<g>${l2.markup}</g>` +
      `</g>` +
      `</g>`,
  };
}
