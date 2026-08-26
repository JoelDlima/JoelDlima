/**
 * Spinning Galaxy Vortex Component
 * Generates an astronomical multi-arm logarithmic spiral galaxy with a glowing
 * core, particle star dust, and orbiting telemetry satellites.
 * Replaces cartoon clipart with a modern sci-fi cybernetic aesthetic.
 */

function round(n) {
  return Math.round(n * 10) / 10;
}

function spiralArm(cx, cy, startAngle, turns = 1.8, maxR = 64, points = 45) {
  const pts = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const angle = startAngle + t * turns * 2 * Math.PI;
    const r = 3 + maxR * Math.pow(t, 1.25);
    const x = round(cx + r * Math.cos(angle));
    const y = round(cy + r * Math.sin(angle));
    pts.push(`${i === 0 ? "M" : "L"}${x} ${y}`);
  }
  return pts.join(" ");
}

export function galaxyCore({ cx = 726, cy = 104, theme, id = "dark" }) {
  const arm1 = spiralArm(0, 0, 0, 1.7, 56);
  const arm2 = spiralArm(0, 0, (2 * Math.PI) / 3, 1.7, 56);
  const arm3 = spiralArm(0, 0, (4 * Math.PI) / 3, 1.7, 56);

  // Stardust points along the arms
  const dust = [];
  const dustCounts = 18;
  for (let i = 1; i <= dustCounts; i++) {
    const t = i / dustCounts;
    const r = 6 + 50 * t;
    const a1 = t * 1.7 * 2 * Math.PI;
    const a2 = a1 + (2 * Math.PI) / 3;
    const a3 = a1 + (4 * Math.PI) / 3;
    const size = 0.6 + (1 - t) * 1.4;
    const op = round(0.3 + (1 - t) * 0.6);

    dust.push(`<circle cx="${round(r * Math.cos(a1))}" cy="${round(r * Math.sin(a1))}" r="${round(size)}" fill="${theme.ink}" fill-opacity="${op}" />`);
    dust.push(`<circle cx="${round(r * Math.cos(a2))}" cy="${round(r * Math.sin(a2))}" r="${round(size)}" fill="${theme.cyan}" fill-opacity="${op}" />`);
    dust.push(`<circle cx="${round(r * Math.cos(a3))}" cy="${round(r * Math.sin(a3))}" r="${round(size)}" fill="${theme.gold}" fill-opacity="${op * 0.8}" />`);
  }

  const gradId = `galaxy-glow-${id}`;
  const spiralGrad = `spiral-teal-${id}`;

  return (
    `<defs>` +
    `<radialGradient id="${gradId}" cx="50%" cy="50%" r="50%">` +
    `<stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.9" />` +
    `<stop offset="25%" stop-color="${theme.cyan}" stop-opacity="0.5" />` +
    `<stop offset="65%" stop-color="${theme.accent}" stop-opacity="0.15" />` +
    `<stop offset="100%" stop-color="${theme.bg}" stop-opacity="0" />` +
    `</radialGradient>` +
    `<linearGradient id="${spiralGrad}" x1="0%" y1="0%" x2="100%" y2="100%">` +
    `<stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.95" />` +
    `<stop offset="60%" stop-color="${theme.cyan}" stop-opacity="0.6" />` +
    `<stop offset="100%" stop-color="${theme.ink}" stop-opacity="0.1" />` +
    `</linearGradient>` +
    `</defs>` +
    `<g class="float">` +
    `<g transform="translate(${cx} ${cy})">` +
    // Outer telemetry ring
    `<circle cx="0" cy="0" r="68" fill="none" stroke="${theme.border}" stroke-width="1" stroke-dasharray="3 4" opacity="0.6" />` +
    `<circle cx="0" cy="0" r="50" fill="none" stroke="${theme.border}" stroke-width="0.8" stroke-dasharray="8 6" opacity="0.4" />` +
    // Pulsing core haze
    `<circle cx="0" cy="0" r="54" fill="url(#${gradId})" class="galaxy-pulse" />` +
    // Spinning galactic vortex
    `<g class="galaxy-spin">` +
    `<path d="${arm1}" fill="none" stroke="url(#${spiralGrad})" stroke-width="1.8" stroke-linecap="round" />` +
    `<path d="${arm2}" fill="none" stroke="url(#${spiralGrad})" stroke-width="1.8" stroke-linecap="round" />` +
    `<path d="${arm3}" fill="none" stroke="url(#${spiralGrad})" stroke-width="1.8" stroke-linecap="round" />` +
    dust.join("") +
    // Core star
    `<circle cx="0" cy="0" r="4.2" fill="${theme.text}" />` +
    `<circle cx="0" cy="0" r="8.5" fill="${theme.accent}" fill-opacity="0.35" class="halo" />` +
    `</g>` +
    // Counter-rotating satellite blip
    `<g class="orbit">` +
    `<circle cx="68" cy="0" r="3.2" fill="${theme.accent}" />` +
    `<circle cx="68" cy="0" r="6" fill="${theme.accent}" fill-opacity="0.3" class="halo" />` +
    `<circle cx="0" cy="0" r="71.2" fill="none" />` +
    `</g>` +
    `<g class="orbit-mid">` +
    `<circle cx="-50" cy="0" r="2.2" fill="${theme.cyan}" opacity="0.85" />` +
    `<circle cx="0" cy="0" r="52.2" fill="none" />` +
    `</g>` +
    `</g></g>`
  );
}
