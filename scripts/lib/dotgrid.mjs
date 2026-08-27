/**
 * Perfboard / Breadboard DotGrid Background Component
 * Generates an authentic hardware workbench pattern:
 * - Precision 2.54mm pitch (16px / 20px grid) perfboard hole grid
 * - Solder pad annular rings for subtle tactile realism
 * - Corner PCB fiducials / alignment crosshairs for an authentic spec-sheet feel
 * - Restrained, low-contrast, non-distracting background
 */

function round(n) {
  return Math.round(n * 10) / 10;
}

export function dotGridBackground({ width, height, theme, seed = "workbench" }) {
  const patternId = `dot-grid-${seed}`;
  const pitch = 20; // 20px coordinate pitch
  const holeRadius = 1.2;
  const padRadius = 2.4;

  // PCB Corner Fiducials
  const fiducialOffset = 18;
  const fiducials = [
    { x: fiducialOffset, y: fiducialOffset },
    { x: width - fiducialOffset, y: fiducialOffset },
    { x: fiducialOffset, y: height - fiducialOffset },
    { x: width - fiducialOffset, y: height - fiducialOffset },
  ]
    .map(
      (f) =>
        `<g transform="translate(${f.x} ${f.y})" opacity="0.35">` +
        `<circle cx="0" cy="0" r="4" fill="none" stroke="${theme.accent}" stroke-width="0.8" />` +
        `<circle cx="0" cy="0" r="1.5" fill="${theme.accent}" />` +
        `<line x1="-7" y1="0" x2="7" y2="0" stroke="${theme.accent}" stroke-width="0.75" />` +
        `<line x1="0" y1="-7" x2="0" y2="7" stroke="${theme.accent}" stroke-width="0.75" />` +
        `</g>`,
    )
    .join("");

  return (
    `<defs>` +
    `<pattern id="${patternId}" width="${pitch}" height="${pitch}" patternUnits="userSpaceOnUse">` +
    // Annular copper/solder ring (very subtle)
    `<circle cx="${pitch / 2}" cy="${pitch / 2}" r="${padRadius}" fill="none" stroke="${theme.border}" stroke-width="0.75" opacity="0.35" />` +
    // Plated through-hole
    `<circle cx="${pitch / 2}" cy="${pitch / 2}" r="${theme.dot || theme.border}" opacity="0.4" />` +
    `</pattern>` +
    `</defs>` +
    // DotGrid pattern fill across the entire card
    `<rect x="0" y="0" width="${width}" height="${height}" fill="url(#${patternId})" />` +
    // Subtle PCB border trace
    `<rect x="10" y="10" width="${width - 20}" height="${height - 20}" fill="none" stroke="${theme.border}" stroke-width="0.75" stroke-dasharray="8 6" opacity="0.25" rx="6" />` +
    fiducials
  );
}
