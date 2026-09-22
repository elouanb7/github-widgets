import { Theme, elevate } from "@/lib/themes";
import { renderCard } from "./card";
import { escapeXml, formatNumber, icons, measureText } from "./utils";

export const VIEWS_STYLES = [
  "badge",
  "flap",
  "segment",
  "matrix",
  "cyber",
  "neon",
  "minimal",
  "card",
] as const;
export type ViewsStyle = (typeof VIEWS_STYLES)[number];

export const VIEWS_ICONS = ["none", "eye", "user", "pulse", "bolt", "dot"] as const;
export type ViewsIcon = (typeof VIEWS_ICONS)[number];

/** Styles that only read as a counter with a fixed number of digits. */
export const FIXED_WIDTH_STYLES: ViewsStyle[] = ["flap", "segment", "matrix", "cyber"];

/** Styles built around an icon — the others ignore it. */
export const ICON_STYLES: ViewsStyle[] = ["badge", "card", "minimal"];

const MONO_FONT = `ui-monospace, 'SF Mono', 'Cascadia Code', 'Fira Code', Menlo, Consolas, monospace`;
const SANS_FONT = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;

interface ViewsCardOptions {
  theme: Theme;
  /** Null when the counter store could not be reached. */
  count: number | null;
  label: string;
  style: ViewsStyle;
  icon: ViewsIcon;
  username?: string;
  hideBorder?: boolean;
  hideTitle?: boolean;
  borderRadius?: number;
  /** Zero-pad the number to this many digits. */
  pad?: number;
  abbreviate?: boolean;
  /** Multiplies the rendered size; the layout itself is untouched. */
  scale?: number;
  customWidth?: number;
  customHeight?: number;
}

/** Keeps generated coordinates free of floating-point noise. */
function r(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatCount(
  count: number | null,
  pad: number,
  abbreviate: boolean,
  separators: boolean
): string {
  if (count === null) return "—";
  if (abbreviate) return formatNumber(count);
  if (pad > 0) return String(count).padStart(pad, "0");
  return separators ? count.toLocaleString("en-US") : String(count);
}

function shell(options: {
  width: number;
  height: number;
  title: string;
  css: string;
  body: string;
  defs?: string;
}): string {
  const { title, css, body, defs } = options;
  const width = r(options.width);
  const height = r(options.height);
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title" text-rendering="geometricPrecision">
  <title id="title">${escapeXml(title)}</title>${defs ? `
  <defs>${defs}</defs>` : ""}
  <style>${css}</style>
  ${body}
</svg>`;
}

/**
 * The viewBox keeps the internal geometry, so bumping the root width/height
 * resizes every style proportionally and stays crisp at any scale.
 */
function applyScale(svg: string, scale: number): string {
  if (scale === 1) return svg;
  return svg.replace(
    /^<svg width="([\d.]+)" height="([\d.]+)"/,
    (_match, width: string, height: string) =>
      `<svg width="${r(Number(width) * scale)}" height="${r(Number(height) * scale)}"`
  );
}

function iconMarkup(icon: ViewsIcon, x: number, y: number, size: number): string {
  if (icon === "none") return "";
  return `<svg class="icon" x="${r(x)}" y="${r(y)}" viewBox="0 0 16 16" width="${size}" height="${size}">${icons[icon]}</svg>`;
}

function titleFor(label: string, value: string): string {
  return label ? `${label}: ${value}` : value;
}

export function renderViewsCard(options: ViewsCardOptions): string {
  const scale = Math.min(4, Math.max(0.4, options.scale ?? 1));
  let svg: string;
  switch (options.style) {
    case "card":
      svg = renderFullCard(options);
      break;
    case "flap":
      svg = renderFlap(options);
      break;
    case "segment":
      svg = renderSegment(options);
      break;
    case "matrix":
      svg = renderMatrix(options);
      break;
    case "cyber":
      svg = renderCyber(options);
      break;
    case "neon":
      svg = renderNeon(options);
      break;
    case "minimal":
      svg = renderMinimal(options);
      break;
    default:
      svg = renderBadge(options);
  }
  return applyScale(svg, scale);
}

/** Compact pill, the closest thing to a classic README counter badge. */
function renderBadge(options: ViewsCardOptions): string {
  const {
    theme,
    count,
    label,
    icon,
    hideBorder,
    borderRadius = 6,
    pad = 0,
    abbreviate = false,
    customWidth,
    customHeight,
  } = options;

  const value = formatCount(count, pad, abbreviate, false);
  const fontSize = 12.5;
  const height = customHeight ?? 28;
  const padX = 11;
  const gap = 7;
  const iconSize = 14;

  const labelWidth = label ? measureText(label, fontSize) : 0;
  const valueWidth = measureText(value, fontSize, true);
  const iconWidth = icon === "none" ? 0 : iconSize + gap;
  const width =
    customWidth ?? Math.round(padX * 2 + iconWidth + labelWidth + (label ? gap : 0) + valueWidth);

  const textY = r(height / 2 + fontSize * 0.35);

  return shell({
    width,
    height,
    title: titleFor(label, value),
    css: `
    * { font-family: ${SANS_FONT}; }
    .badge-bg { fill: ${theme.bgColor}; stroke: ${hideBorder ? "none" : theme.borderColor}; }
    .badge-label { font-size: ${fontSize}px; fill: ${theme.textColor}; }
    .badge-value { font-size: ${fontSize}px; font-weight: 700; fill: ${theme.titleColor}; }
    .icon { fill: ${theme.iconColor}; color: ${theme.iconColor}; }`,
    body: `<rect class="badge-bg" x="0.5" y="0.5" rx="${borderRadius}" width="${width - 1}" height="${height - 1}"/>
  ${iconMarkup(icon, padX, (height - iconSize) / 2, iconSize)}
  ${label ? `<text x="${r(padX + iconWidth)}" y="${textY}" class="badge-label">${escapeXml(label)}</text>` : ""}
  <text x="${width - padX}" y="${textY}" text-anchor="end" class="badge-value">${escapeXml(value)}</text>`,
  });
}

/** One flat tile per digit, with a discreet hinge line. */
function renderFlap(options: ViewsCardOptions): string {
  const {
    theme,
    count,
    label,
    hideBorder,
    borderRadius = 6,
    pad = 6,
    abbreviate = false,
    customWidth,
    customHeight,
  } = options;

  const chars = [...formatCount(count, pad, abbreviate, false)];
  const tileW = 22;
  const tileH = 32;
  const tileGap = 3;
  const padX = 12;
  const padY = 7;
  const labelSize = 12.5;

  const labelWidth = label ? measureText(label, labelSize) : 0;
  const boardWidth = chars.length * tileW + (chars.length - 1) * tileGap;
  const height = customHeight ?? tileH + padY * 2;
  const width = customWidth ?? Math.round(padX * 2 + labelWidth + (label ? 14 : 0) + boardWidth);

  const boardX = width - padX - boardWidth;
  const tileY = r((height - tileH) / 2);

  const tiles = chars
    .map((char, i) => {
      const x = r(boardX + i * (tileW + tileGap));
      return `
  <g transform="translate(${x}, ${tileY})">
    <rect width="${tileW}" height="${tileH}" rx="${borderRadius}" class="flap-tile"/>
    <line x1="0" y1="${tileH / 2}" x2="${tileW}" y2="${tileH / 2}" class="flap-hinge"/>
    <text x="${tileW / 2}" y="${tileH / 2 + 6.5}" text-anchor="middle" class="flap-digit">${escapeXml(char)}</text>
  </g>`;
    })
    .join("");

  return shell({
    width,
    height,
    title: titleFor(label, chars.join("")),
    css: `
    .flap-label { font-family: ${SANS_FONT}; font-size: ${labelSize}px; fill: ${theme.textColor}; }
    .flap-digit { font-family: ${MONO_FONT}; font-size: 19px; font-weight: 600; fill: ${theme.titleColor}; }
    .flap-tile { fill: ${elevate(theme.bgColor, 0.09)}; }
    .flap-hinge { stroke: ${theme.bgColor}; stroke-width: 1.4; opacity: 0.75; }`,
    body: `<rect x="0.5" y="0.5" rx="${r(borderRadius + 3)}" width="${width - 1}" height="${height - 1}" fill="${theme.bgColor}" stroke="${hideBorder ? "none" : theme.borderColor}"/>
  ${label ? `<text x="${padX}" y="${r(height / 2 + labelSize * 0.35)}" class="flap-label">${escapeXml(label)}</text>` : ""}
  ${tiles}`,
  });
}

/** Seven-segment LCD, unlit segments left visible like a real display. */
const SEGMENT_GLYPHS: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abdeg",
  "3": "abcdg",
  "4": "bcfg",
  "5": "acdfg",
  "6": "acdefg",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
  "-": "g",
  "—": "g",
};

function renderSegment(options: ViewsCardOptions): string {
  const {
    theme,
    count,
    label,
    hideBorder,
    borderRadius = 8,
    pad = 6,
    abbreviate = false,
    customWidth,
    customHeight,
  } = options;

  const chars = [...formatCount(count, pad, abbreviate, false)];
  const digitW = 15;
  const digitH = 26;
  const thickness = 2.8;
  const digitGap = 5.5;
  const screenPadX = 9;
  const screenPadY = 6;
  const padX = 12;
  const padY = 7;
  const labelSize = 12.5;

  const long = digitW - thickness * 1.5;
  const shortH = (digitH - thickness) / 2 - thickness * 0.75;
  const segments: Record<string, string> = {
    a: `<rect x="${thickness * 0.75}" y="0" width="${long}" height="${thickness}" rx="1.1"/>`,
    g: `<rect x="${thickness * 0.75}" y="${r((digitH - thickness) / 2)}" width="${long}" height="${thickness}" rx="1.1"/>`,
    d: `<rect x="${thickness * 0.75}" y="${r(digitH - thickness)}" width="${long}" height="${thickness}" rx="1.1"/>`,
    f: `<rect x="0" y="${thickness * 0.75}" width="${thickness}" height="${r(shortH)}" rx="1.1"/>`,
    b: `<rect x="${r(digitW - thickness)}" y="${thickness * 0.75}" width="${thickness}" height="${r(shortH)}" rx="1.1"/>`,
    e: `<rect x="0" y="${r(digitH / 2 + thickness * 0.25)}" width="${thickness}" height="${r(shortH)}" rx="1.1"/>`,
    c: `<rect x="${r(digitW - thickness)}" y="${r(digitH / 2 + thickness * 0.25)}" width="${thickness}" height="${r(shortH)}" rx="1.1"/>`,
  };

  const screenW = chars.length * digitW + (chars.length - 1) * digitGap + screenPadX * 2;
  const screenH = digitH + screenPadY * 2;
  const labelWidth = label ? measureText(label, labelSize) : 0;
  const height = customHeight ?? screenH + padY * 2;
  const width = customWidth ?? Math.round(padX * 2 + labelWidth + (label ? 14 : 0) + screenW);

  const screenX = width - padX - screenW;
  const screenY = r((height - screenH) / 2);

  const digits = chars
    .map((char, i) => {
      const lit = SEGMENT_GLYPHS[char] ?? "";
      const x = r(screenX + screenPadX + i * (digitW + digitGap));
      const drawn = Object.entries(segments)
        .map(([name, rect]) =>
          rect.replace("<rect", `<rect class="${lit.includes(name) ? "seg-on" : "seg-off"}"`)
        )
        .join("");
      return `
  <g transform="translate(${x}, ${r(screenY + screenPadY)})">${drawn}</g>`;
    })
    .join("");

  return shell({
    width,
    height,
    title: titleFor(label, chars.join("")),
    css: `
    .seg-label { font-family: ${SANS_FONT}; font-size: ${labelSize}px; fill: ${theme.textColor}; }
    .seg-on { fill: ${theme.titleColor}; }
    .seg-off { fill: ${theme.titleColor}; opacity: 0.1; }`,
    body: `<rect x="0.5" y="0.5" rx="${borderRadius}" width="${width - 1}" height="${height - 1}" fill="${theme.bgColor}" stroke="${hideBorder ? "none" : theme.borderColor}"/>
  ${label ? `<text x="${padX}" y="${r(height / 2 + labelSize * 0.35)}" class="seg-label">${escapeXml(label)}</text>` : ""}
  <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="${r(borderRadius - 3)}" fill="${elevate(theme.bgColor, 0.06)}"/>
  ${digits}`,
  });
}

/** LED dot-matrix board — 5x7 glyphs, unlit dots left visible. */
const DOT_GLYPHS: Record<string, string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  k: ["10000", "10000", "10010", "10100", "11000", "10100", "10010"],
  M: ["10001", "11011", "10101", "10001", "10001", "10001", "10001"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "—": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
};

function renderMatrix(options: ViewsCardOptions): string {
  const {
    theme,
    count,
    label,
    hideBorder,
    borderRadius = 8,
    pad = 6,
    abbreviate = false,
    customWidth,
    customHeight,
  } = options;

  const chars = [...formatCount(count, pad, abbreviate, false)];
  const pitch = 3.4;
  const dotRadius = 1.35;
  const glyphW = 4 * pitch + dotRadius * 2;
  const glyphH = 6 * pitch + dotRadius * 2;
  const glyphGap = 5;
  const boardPadX = 9;
  const boardPadY = 7;
  const padX = 12;
  const padY = 7;
  const labelSize = 12.5;

  const boardW = chars.length * glyphW + (chars.length - 1) * glyphGap + boardPadX * 2;
  const boardH = glyphH + boardPadY * 2;
  const labelWidth = label ? measureText(label, labelSize) : 0;
  const height = customHeight ?? boardH + padY * 2;
  const width = customWidth ?? Math.round(padX * 2 + labelWidth + (label ? 14 : 0) + boardW);

  const boardX = width - padX - boardW;
  const boardY = r((height - boardH) / 2);

  const glyphs = chars
    .map((char, i) => {
      const rows = DOT_GLYPHS[char] ?? DOT_GLYPHS[char.toUpperCase()] ?? Array(7).fill("00000");
      const originX = r(boardX + boardPadX + i * (glyphW + glyphGap) + dotRadius);
      const originY = r(boardY + boardPadY + dotRadius);
      const dots = rows
        .flatMap((row, rowIndex) =>
          [...row].map(
            (cell, colIndex) =>
              `<circle cx="${r(originX + colIndex * pitch)}" cy="${r(originY + rowIndex * pitch)}" r="${dotRadius}" class="${cell === "1" ? "led-on" : "led-off"}"/>`
          )
        )
        .join("");
      return dots;
    })
    .join("");

  return shell({
    width,
    height,
    title: titleFor(label, chars.join("")),
    css: `
    .led-label { font-family: ${SANS_FONT}; font-size: ${labelSize}px; fill: ${theme.textColor}; }
    .led-on { fill: ${theme.titleColor}; }
    .led-off { fill: ${theme.textColor}; opacity: 0.13; }`,
    body: `<rect x="0.5" y="0.5" rx="${borderRadius}" width="${width - 1}" height="${height - 1}" fill="${theme.bgColor}" stroke="${hideBorder ? "none" : theme.borderColor}"/>
  ${label ? `<text x="${padX}" y="${r(height / 2 + labelSize * 0.35)}" class="led-label">${escapeXml(label)}</text>` : ""}
  <rect x="${boardX}" y="${boardY}" width="${boardW}" height="${boardH}" rx="${r(borderRadius - 3)}" fill="${elevate(theme.bgColor, 0.06)}"/>
  ${glyphs}`,
  });
}

/** Terminal readout: monospace digits, glow, scanlines and a blinking cursor. */
function renderCyber(options: ViewsCardOptions): string {
  const {
    theme,
    count,
    label,
    hideBorder,
    borderRadius = 4,
    pad = 6,
    abbreviate = false,
    customWidth,
    customHeight,
  } = options;

  const value = formatCount(count, pad, abbreviate, false);
  const valueSize = 16;
  const labelSize = 12;
  const height = customHeight ?? 34;
  const padX = 12;
  const gap = 8;

  // Monospace advance width is a constant fraction of the font size, plus whatever
  // letter-spacing the classes below add to every character.
  const monoWidth = (text: string, size: number, tracking = 0) =>
    text.length * (size * 0.6 + tracking);

  const labelTracking = 0.5;
  const valueTracking = 1;
  const prompt = "$";
  const promptWidth = monoWidth(prompt, labelSize);
  const labelWidth = label ? monoWidth(label, labelSize, labelTracking) : 0;
  const valueWidth = monoWidth(value, valueSize, valueTracking);
  const cursorWidth = 8;
  const width =
    customWidth ??
    Math.round(
      padX * 2 + promptWidth + gap + labelWidth + (label ? gap : 0) + valueWidth + 6 + cursorWidth
    );

  const baseline = r(height / 2 + valueSize * 0.35);
  const labelX = r(padX + promptWidth + gap);
  const valueX = r(labelX + labelWidth + (label ? gap : 0));

  return shell({
    width,
    height,
    title: titleFor(label, value),
    defs: `
    <filter id="cyber-glow" x="-30%" y="-60%" width="160%" height="220%">
      <feGaussianBlur stdDeviation="1.3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="cyber-scan" width="3" height="3" patternUnits="userSpaceOnUse">
      <rect width="3" height="1" fill="${theme.textColor}" opacity="0.07"/>
    </pattern>`,
    css: `
    * { font-family: ${MONO_FONT}; }
    .cy-prompt { font-size: ${labelSize}px; font-weight: 700; fill: ${theme.iconColor}; }
    .cy-label { font-size: ${labelSize}px; fill: ${theme.textColor}; letter-spacing: ${labelTracking}px; }
    .cy-value { font-size: ${valueSize}px; font-weight: 700; fill: ${theme.titleColor}; letter-spacing: ${valueTracking}px; }
    .cy-cursor { fill: ${theme.titleColor}; animation: blink 1.1s step-end infinite; }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`,
    body: `<rect x="0.5" y="0.5" rx="${borderRadius}" width="${width - 1}" height="${height - 1}" fill="${theme.bgColor}" stroke="${hideBorder ? "none" : theme.titleColor}" stroke-opacity="0.55"/>
  <rect x="1" y="1" rx="${borderRadius}" width="${width - 2}" height="${height - 2}" fill="url(#cyber-scan)"/>
  <text x="${padX}" y="${baseline}" class="cy-prompt">${prompt}</text>
  ${label ? `<text x="${labelX}" y="${baseline}" class="cy-label">${escapeXml(label)}</text>` : ""}
  <text x="${valueX}" y="${baseline}" class="cy-value" filter="url(#cyber-glow)">${escapeXml(value)}</text>
  <rect class="cy-cursor" x="${r(valueX + valueWidth + 6)}" y="${r(baseline - valueSize + 3)}" width="${cursorWidth}" height="${valueSize}" rx="1"/>`,
  });
}

/** Glowing pill: uppercase label, oversized number, neon outline. */
function renderNeon(options: ViewsCardOptions): string {
  const {
    theme,
    count,
    label,
    hideBorder,
    pad = 0,
    abbreviate = false,
    customWidth,
    customHeight,
  } = options;

  const value = formatCount(count, pad, abbreviate, false);
  const height = customHeight ?? 40;
  const padX = 18;
  const gap = 12;
  const labelSize = 10.5;
  const labelTracking = 1.4;
  const valueSize = 20;

  const upperLabel = label.toUpperCase();
  const labelWidth = label
    ? measureText(upperLabel, labelSize) + upperLabel.length * labelTracking
    : 0;
  const valueWidth = measureText(value, valueSize, true);
  const width =
    customWidth ?? Math.round(padX * 2 + labelWidth + (label ? gap : 0) + valueWidth);
  const radius = height / 2;

  return shell({
    width,
    height,
    title: titleFor(label, value),
    defs: `
    <filter id="neon-glow" x="-50%" y="-80%" width="200%" height="260%">
      <feGaussianBlur stdDeviation="2.2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`,
    css: `
    * { font-family: ${SANS_FONT}; }
    .neon-label { font-size: ${labelSize}px; font-weight: 600; letter-spacing: ${labelTracking}px; fill: ${theme.textColor}; }
    .neon-value { font-size: ${valueSize}px; font-weight: 800; fill: ${theme.titleColor}; }`,
    body: `<rect x="1" y="1" rx="${radius}" width="${width - 2}" height="${height - 2}" fill="${theme.bgColor}"/>
  ${hideBorder ? "" : `<rect x="1" y="1" rx="${radius}" width="${width - 2}" height="${height - 2}" fill="none" stroke="${theme.titleColor}" stroke-width="1.6" filter="url(#neon-glow)"/>`}
  ${label ? `<text x="${padX}" y="${r(height / 2 + labelSize * 0.35)}" class="neon-label">${escapeXml(upperLabel)}</text>` : ""}
  <text x="${width - padX}" y="${r(height / 2 + valueSize * 0.35)}" text-anchor="end" class="neon-value" filter="url(#neon-glow)">${escapeXml(value)}</text>`,
  });
}

/** No frame, no background — just the number, for READMEs that want it quiet. */
function renderMinimal(options: ViewsCardOptions): string {
  const {
    theme,
    count,
    label,
    icon,
    pad = 0,
    abbreviate = false,
    customWidth,
    customHeight,
  } = options;

  const value = formatCount(count, pad, abbreviate, true);
  const fontSize = 13;
  const height = customHeight ?? 20;
  const gap = 6;
  const iconSize = 13;

  const iconWidth = icon === "none" ? 0 : iconSize + gap;
  const valueWidth = measureText(value, fontSize, true);
  const labelWidth = label ? measureText(label, fontSize) : 0;
  const width =
    customWidth ?? Math.round(iconWidth + valueWidth + (label ? gap + labelWidth : 0) + 2);

  const textY = r(height / 2 + fontSize * 0.35);
  const valueX = r(iconWidth);

  return shell({
    width,
    height,
    title: titleFor(label, value),
    css: `
    * { font-family: ${SANS_FONT}; }
    .min-value { font-size: ${fontSize}px; font-weight: 700; fill: ${theme.titleColor}; }
    .min-label { font-size: ${fontSize}px; fill: ${theme.textColor}; }
    .icon { fill: ${theme.iconColor}; color: ${theme.iconColor}; }`,
    body: `${iconMarkup(icon, 0, (height - iconSize) / 2, iconSize)}
  <text x="${valueX}" y="${textY}" class="min-value">${escapeXml(value)}</text>
  ${label ? `<text x="${r(valueX + valueWidth + gap)}" y="${textY}" class="min-label">${escapeXml(label)}</text>` : ""}`,
  });
}

/** Full-size card matching the stats and languages widgets. */
function renderFullCard(options: ViewsCardOptions): string {
  const {
    theme,
    count,
    label,
    icon,
    username = "",
    hideBorder,
    hideTitle,
    borderRadius,
    pad = 0,
    abbreviate = false,
    customWidth,
    customHeight,
  } = options;

  const value = formatCount(count, pad, abbreviate, true);
  const width = customWidth ?? 390;
  const titleSpace = hideTitle ? 10 : 45;

  // The title already says what the number is, so the label line is only worth the
  // space when the title is hidden.
  const showLabel = hideTitle && !!label;
  const height = customHeight ?? titleSpace + (showLabel ? 100 : 75);

  const valueSize = 38;
  const iconSize = 22;
  const gap = 12;
  const iconWidth = icon === "none" ? 0 : iconSize + gap;
  const blockWidth = measureText(value, valueSize, true) + iconWidth;
  const blockX = r((width - blockWidth) / 2);
  const valueY = 48;

  const body = `
    ${iconMarkup(icon, blockX, valueY - iconSize - 4, iconSize)}
    <text x="${r(blockX + iconWidth)}" y="${valueY}" class="views-value">${escapeXml(value)}</text>
    ${showLabel ? `<text x="${width / 2}" y="${valueY + 26}" text-anchor="middle" class="stat-label">${escapeXml(label)}</text>` : ""}
    <style>.views-value { font-size: ${valueSize}px; font-weight: 700; fill: ${theme.titleColor}; }</style>`;

  return renderCard(
    {
      width,
      height,
      title: username ? `${username}'s Profile Views` : "Profile Views",
      theme,
      hideBorder,
      hideTitle,
      borderRadius,
    },
    body
  );
}
