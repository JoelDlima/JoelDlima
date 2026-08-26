/**
 * Oscilloscope Radar Sweep Scanner for GitHub Contributions
 * Replaces the toy spaceship with a hardware oscilloscope / logic analyzer
 * radar sweep line that scans across the contribution heatmap.
 * Also generates the scan-reveal clipPath so the commit boxes dynamically fill
 * as the beam sweeps across each column.
 */

function round(n) {
  return Math.round(n * 10) / 10;
}

export function oscilloscopeScanner({ plot, theme, id = "dark" }) {
  const scanGrad = `scan-grad-${id}`;
  const clipId = `scan-clip-${id}`;
  const revealClipId = `scan-reveal-${id}`;
  const width = plot.width;
  const height = plot.height;
  const x = plot.x;
  const y = plot.y;

  return (
    `<defs>` +
    // Clip path for the beam itself (keeps phosphor within grid bounds)
    `<clipPath id="${clipId}">` +
    `<rect x="${x}" y="${y - 4}" width="${width}" height="${height + 8}" />` +
    `</clipPath>` +
    // Dynamic reveal clip path: grows width synchronously with the sweeping beam
    `<clipPath id="${revealClipId}">` +
    `<rect x="${x}" y="${y - 4}" width="0" height="${height + 8}" class="scan-reveal-rect" style="--scan-w:${round(width)}px" />` +
    `</clipPath>` +
    // Gradient for the trailing phosphor glow
    `<linearGradient id="${scanGrad}" x1="100%" y1="0%" x2="0%" y2="0%">` +
    `<stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.95" />` +
    `<stop offset="35%" stop-color="${theme.accent}" stop-opacity="0.3" />` +
    `<stop offset="100%" stop-color="${theme.accent}" stop-opacity="0" />` +
    `</linearGradient>` +
    `</defs>` +
    // Sweeping beam group
    `<g clip-path="url(#${clipId})">` +
    `<g class="oscillo-sweep" style="--scan-w:${round(width)}px;--scan-start:${round(x)}px">` +
    // Phosphor trailing wake
    `<rect x="${round(x - 56)}" y="${y}" width="56" height="${height}" fill="url(#${scanGrad})" />` +
    // Leading laser line
    `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + height}" stroke="${theme.text}" stroke-width="2" />` +
    // Leading glow dots
    `<circle cx="${x}" cy="${y}" r="3" fill="${theme.accent}" />` +
    `<circle cx="${x}" cy="${y + height / 2}" r="2" fill="${theme.text}" />` +
    `<circle cx="${x}" cy="${y + height}" r="3" fill="${theme.accent}" />` +
    `</g>` +
    `</g>`
  );
}
