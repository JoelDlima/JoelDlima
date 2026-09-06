/**
 * Clickable contact cards (ByteLounge pattern, our theme).
 *
 * GitHub renders README SVGs inside an <img>, so <a> tags *inside* an SVG
 * are inert. The poster therefore keeps its channel chips as pure visuals,
 * and these small standalone cards carry the clicks instead: the README
 * wraps each card <img> in a markdown-level <a href>. Dark/light variants
 * swap via <picture> + prefers-color-scheme, same as the poster.
 *
 * Card recipe mirrors the poster chips exactly: cardBg body + 4% ink inner
 * wash + the same border, accent icon, uppercase label, muted handle.
 */

import { CONTACTS } from "./icons.mjs";
import { THEMES, escape, icon, rect, text } from "./svg.mjs";

export const CARD_W = 196;
export const CARD_H = 44;

export function contactCard(link, themeName) {
  const theme = THEMES[themeName];
  // Long handles (email, portfolio URL) step down a size so nothing clips.
  const handleSize = link.handle.length > 24 ? 8 : 9;
  const title = `${link.label}: ${link.handle}`;

  const body =
    rect({ x: 0.5, y: 0.5, width: CARD_W - 1, height: CARD_H - 1, fill: theme.cardBg, rx: 8, stroke: theme.border }) +
    rect({ x: 1.5, y: 1.5, width: CARD_W - 3, height: CARD_H - 3, fill: theme.ink, rx: 7, opacity: 0.04 }) +
    icon(link.path, { x: 14, y: CARD_H / 2 - 8, size: 16, fill: theme.accent || theme.text }) +
    text(link.label.toUpperCase(), { x: 38, y: 20, size: 10.5, weight: 800, fill: theme.text, face: "mono" }) +
    text(link.handle, { x: 38, y: 33, size: handleSize, weight: 600, fill: theme.muted, face: "mono" });

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}" ` +
    `viewBox="0 0 ${CARD_W} ${CARD_H}" fill="none" role="img" aria-label="${escape(title)}">` +
    `<title>${escape(title)}</title>${body}</svg>\n`
  );
}

/** The four poster channels, in poster order. */
export function contactCardLinks() {
  return CONTACTS;
}
