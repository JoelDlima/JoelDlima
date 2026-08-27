/**
 * Hardware IC Pinout Diagram for Joel D'Lima.
 * Breaks the stacked-box rhythm with a literal microchip pinout schematic:
 * - Central 32-bit MCU package with pin 1 index notch and internal architectural specs
 * - Left Pins (P01–P06): Core Embedded Systems, Microcontrollers, and Bus Protocols
 * - Right Pins (P07–P12): Systems Tooling, Diagnostics, and Software Infrastructure
 * - Authentic copper solder leads, circuit traces, and pin numbers
 */

import { STACK_GROUPS } from "./stack.mjs";
import { icon, rect, text } from "./svg.mjs";

const ALL_ITEMS = new Map(
  STACK_GROUPS.flatMap((g) => g.items).map((item) => [item.label, item]),
);

export function marqueeStack({ top, x = 34, width = 812, theme }) {
  const cardH = 196;
  const cardY = top + 26;
  const chipW = 180;
  const chipH = 152;
  const chipX = x + (width - chipW) / 2; // 34 + (812-180)/2 = 350
  const chipY = cardY + 22;

  // Left Pins: Core Embedded & Hardware
  const leftPins = [
    { label: "c++", name: "C / C++", role: "Core Firmware", pin: "P01" },
    { label: "esp32", name: "ESP32", role: "Wireless SoC", pin: "P02" },
    { label: "arduino", name: "ARDUINO", role: "Microcontrollers", pin: "P03" },
    { label: "linux", name: "LINUX / RTOS", role: "Kernel & Tasks", pin: "P04" },
    { label: "python", name: "CAN / SPI", role: "Bus Protocols", pin: "P05" },
    { label: "python", name: "PYTHON", role: "Hardware Automation", pin: "P06" },
  ];

  // Right Pins: Systems Tooling & Infrastructure
  const rightPins = [
    { label: "typescript", name: "TYPESCRIPT", role: "Internal Tooling", pin: "P07" },
    { label: "react", name: "REACT", role: "Diagnostic UIs", pin: "P08" },
    { label: "fastapi", name: "FASTAPI", role: "Telemetry APIs", pin: "P09" },
    { label: "postgres", name: "POSTGRES", role: "System Storage", pin: "P10" },
    { label: "docker", name: "DOCKER", role: "Containerized Builds", pin: "P11" },
    { label: "git", name: "GIT", role: "Version Control", pin: "P12" },
  ];

  // Render Central IC Body
  const notchR = 7;
  const chipBody =
    // IC Shadow / Outline
    rect({ x: chipX, y: chipY, width: chipW, height: chipH, fill: theme.track, rx: 4, stroke: theme.border }) +
    // Pin 1 Notch Cutout at Top Edge
    `<path d="M ${chipX + chipW / 2 - notchR} ${chipY} A ${notchR} ${notchR} 0 0 0 ${chipX + chipW / 2 + notchR} ${chipY}" fill="${theme.cardBg}" stroke="${theme.border}" stroke-width="1" />` +
    // Pin 1 Index Dot
    `<circle cx="${chipX + 14}" cy="${chipY + 14}" r="3" fill="${theme.accent}" />` +
    // Central Architectural Spec Text
    text("JOEL-D'LIMA", {
      x: chipX + chipW / 2,
      y: chipY + 44,
      size: 11,
      weight: 800,
      fill: theme.text,
      anchor: "middle",
      face: "mono",
    }) +
    text("EMBEDDED MCU // 32-BIT", {
      x: chipX + chipW / 2,
      y: chipY + 60,
      size: 8,
      weight: 700,
      fill: theme.accent,
      anchor: "middle",
      face: "mono",
    }) +
    text("REV 2.7 · QFP-12 PACKAGE", {
      x: chipX + chipW / 2,
      y: chipY + 74,
      size: 7.5,
      weight: 500,
      fill: theme.muted,
      anchor: "middle",
      face: "mono",
    }) +
    `<line x1="${chipX + 20}" y1="${chipY + 84}" x2="${chipX + chipW - 20}" y2="${chipY + 84}" stroke="${theme.border}" stroke-width="0.75" stroke-dasharray="3 3" />` +
    text("FLASH: 16MB · SRAM: 512KB", {
      x: chipX + chipW / 2,
      y: chipY + 99,
      size: 7.5,
      weight: 600,
      fill: theme.muted,
      anchor: "middle",
      face: "mono",
    }) +
    text("CAN 2.0B · SPI · I2C · UART", {
      x: chipX + chipW / 2,
      y: chipY + 114,
      size: 7.5,
      weight: 600,
      fill: theme.muted,
      anchor: "middle",
      face: "mono",
    }) +
    text("DUAL Xtensa @ 240MHz", {
      x: chipX + chipW / 2,
      y: chipY + 129,
      size: 7.5,
      weight: 600,
      fill: theme.accent,
      anchor: "middle",
      face: "mono",
    });

  // Render Left Pin Rows
  let leftMarkup = "";
  leftPins.forEach((p, i) => {
    const pinY = chipY + 22 + i * 22;
    const item = ALL_ITEMS.get(p.label);

    leftMarkup +=
      // Copper solder lead extending from IC
      `<rect x="${chipX - 16}" y="${pinY - 3.5}" width="16" height="7" fill="${theme.accent}" rx="1" />` +
      // PCB Trace extending outward
      `<line x1="220" y1="${pinY}" x2="${chipX - 16}" y2="${pinY}" stroke="${theme.accent}" stroke-width="1.2" opacity="0.45" />` +
      `<circle cx="220" cy="${pinY}" r="2" fill="${theme.accent}" />` +
      // Pin Number
      text(p.pin, { x: chipX - 22, y: pinY - 5, size: 7.5, fill: theme.accent, weight: 700, anchor: "end", face: "mono" }) +
      // Primary Tool Name
      text(p.name, { x: 210, y: pinY + 3.5, size: 9.5, fill: theme.text, weight: 700, anchor: "end", face: "mono" }) +
      // Functional Domain
      text(p.role, { x: 125, y: pinY + 3.5, size: 8.5, fill: theme.muted, anchor: "end", face: "sans" }) +
      // Vector Icon
      (item && item.path ? icon(item.path, { x: 214, y: pinY - 5.5, size: 11, fill: theme.accent }) : "");
  });

  // Render Right Pin Rows
  let rightMarkup = "";
  rightPins.forEach((p, i) => {
    const pinY = chipY + 22 + i * 22;
    const item = ALL_ITEMS.get(p.label);

    rightMarkup +=
      // Solder lead extending from IC
      `<rect x="${chipX + chipW}" y="${pinY - 3.5}" width="16" height="7" fill="${theme.border}" rx="1" />` +
      // PCB Trace extending outward
      `<line x1="${chipX + chipW + 16}" y1="${pinY}" x2="630" y2="${pinY}" stroke="${theme.border}" stroke-width="1.2" opacity="0.6" />` +
      `<circle cx="630" cy="${pinY}" r="2" fill="${theme.border}" />` +
      // Pin Number
      text(p.pin, { x: chipX + chipW + 22, y: pinY - 5, size: 7.5, fill: theme.muted, weight: 700, anchor: "start", face: "mono" }) +
      // Primary Tool Name
      text(p.name, { x: 642, y: pinY + 3.5, size: 9.5, fill: theme.text, weight: 700, anchor: "start", face: "mono" }) +
      // Functional Domain
      text(p.role, { x: 728, y: pinY + 3.5, size: 8.5, fill: theme.muted, anchor: "start", face: "sans" }) +
      // Vector Icon
      (item && item.path ? icon(item.path, { x: 624, y: pinY - 5.5, size: 11, fill: theme.muted }) : "");
  });

  return {
    height: cardH + 40,
    markup:
      // Section Tag Row
      text("1.0 PIN CONFIGURATION & SYSTEM ARCHITECTURE", {
        x,
        y: top + 18,
        size: 11.5,
        weight: 700,
        fill: theme.text,
        face: "sans",
      }) +
      text("IC PINOUT & PERIPHERAL SPECIFICATION", {
        x: x + width,
        y: top + 18,
        size: 9.5,
        fill: theme.muted,
        anchor: "end",
        weight: 600,
        face: "mono",
      }) +
      // Outer Drawing Shell
      rect({ x, y: cardY, width, height: cardH, fill: theme.cardBg, rx: 6, stroke: theme.border }) +
      leftMarkup +
      rightMarkup +
      chipBody,
  };
}
