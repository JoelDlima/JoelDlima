/**
 * Register Map & Pinout Configuration for Joel D'Lima.
 * Authentic Hardware Datasheet Register Specification:
 * - Bank 0x01: Core Embedded Systems, Microcontrollers & Protocols
 * - Bank 0x02: Systems Tooling, Diagnostics & Infrastructure
 * - Crisp static pin chips with official vector marks
 */

import { STACK_GROUPS } from "./stack.mjs";
import { icon, rect, text } from "./svg.mjs";

const ALL_ITEMS = new Map(
  STACK_GROUPS.flatMap((g) => g.items).map((item) => [item.label, item]),
);

const PIN_CHIP = {
  height: 24,
  padX: 8,
  icon: 12,
  iconGap: 5,
  font: 9.5,
  gap: 8,
};

function pinChipWidth(item) {
  const glyph = item.path ? PIN_CHIP.icon + PIN_CHIP.iconGap : 0;
  return Math.round(PIN_CHIP.padX * 2 + glyph + item.label.length * PIN_CHIP.font * 0.6);
}

function renderPinChip(item, x, y, theme, isPrimary = false) {
  const width = pinChipWidth(item);
  const textX = x + PIN_CHIP.padX + (item.path ? PIN_CHIP.icon + PIN_CHIP.iconGap : 0);
  const accentColor = isPrimary ? theme.accent : theme.text;

  return (
    `<g>` +
    rect({
      x,
      y,
      width,
      height: PIN_CHIP.height,
      fill: theme.track,
      rx: 4,
      stroke: isPrimary ? theme.accent : theme.border,
      opacity: isPrimary ? 1 : 0.85,
    }) +
    (item.path
      ? icon(item.path, {
          x: x + PIN_CHIP.padX,
          y: y + (PIN_CHIP.height - PIN_CHIP.icon) / 2,
          size: PIN_CHIP.icon,
          fill: accentColor,
          opacity: 0.95,
        })
      : "") +
    text(item.label.toUpperCase(), {
      x: textX,
      y: y + PIN_CHIP.height / 2 + 3.2,
      size: PIN_CHIP.font,
      fill: isPrimary ? theme.text : theme.muted,
      weight: isPrimary ? 700 : 600,
      face: "mono",
    }) +
    `</g>`
  );
}

function renderRegisterRow(labels, startX, y, theme, isPrimary) {
  let x = startX;
  const items = labels.map((l) => ALL_ITEMS.get(l) || { label: l, path: null });
  let markup = "";

  for (const it of items) {
    markup += renderPinChip(it, x, y, theme, isPrimary);
    x += pinChipWidth(it) + PIN_CHIP.gap;
  }

  return markup;
}

export function marqueeStack({ top, x = 34, width = 812, theme }) {
  // Bank 0x01: Core Embedded & Hardware Systems
  const bank1Labels = [
    "c++",
    "c",
    "esp32",
    "arduino",
    "linux",
    "python",
    "git",
  ];

  // Bank 0x02: Systems Tooling, Diagnostics & Infrastructure
  const bank2Labels = [
    "typescript",
    "react",
    "next.js",
    "fastapi",
    "postgres",
    "docker",
    "pytorch",
  ];

  const cardH = 96;
  const cardY = top + 28;

  const b1Y = cardY + 16;
  const b2Y = cardY + 54;
  const pinStartX = x + 218;

  const bank1Markup = renderRegisterRow(bank1Labels, pinStartX, b1Y, theme, true);
  const bank2Markup = renderRegisterRow(bank2Labels, pinStartX, b2Y, theme, false);

  return {
    height: 136,
    markup:
      // Section Tag Row
      text("1.0 REGISTER MAP & PINOUT CONFIGURATION", {
        x,
        y: top + 18,
        size: 11.5,
        weight: 700,
        fill: theme.text,
        face: "sans",
      }) +
      text("PINOUT & ARCHITECTURES", {
        x: x + width,
        y: top + 18,
        size: 9.5,
        fill: theme.muted,
        anchor: "end",
        weight: 600,
        face: "mono",
      }) +
      // Register Matrix Shell
      rect({ x, y: cardY, width, height: cardH, fill: theme.cardBg, rx: 6, stroke: theme.border }) +
      // Bank 0x01 Label
      `<circle cx="${x + 16}" cy="${b1Y + 12}" r="3" fill="${theme.accent}" />` +
      text("BANK 0x01 [EMBEDDED_CORE]", {
        x: x + 26,
        y: b1Y + 15.5,
        size: 9.5,
        weight: 700,
        fill: theme.accent,
        face: "mono",
      }) +
      bank1Markup +
      // Divider
      rect({ x: x + 16, y: cardY + 47, width: width - 32, height: 1, fill: theme.border, opacity: 0.5 }) +
      // Bank 0x02 Label
      `<circle cx="${x + 16}" cy="${b2Y + 12}" r="3" fill="${theme.muted}" />` +
      text("BANK 0x02 [SYSTEMS_TOOLING]", {
        x: x + 26,
        y: b2Y + 15.5,
        size: 9.5,
        weight: 700,
        fill: theme.muted,
        face: "mono",
      }) +
      bank2Markup,
  };
}
