import { LanguageStat } from "@/lib/github/types";
import { Theme, generateThemePalette } from "@/lib/themes";
import { renderCard } from "./card";
import { escapeXml } from "./utils";

interface LanguagesCardOptions {
  theme: Theme;
  hideBorder?: boolean;
  hideTitle?: boolean;
  layout?: "compact" | "normal";
  username?: string;
  borderRadius?: number;
  customWidth?: number;
  customHeight?: number;
  themeColors?: boolean;
}

export function renderLanguagesCard(
  languages: LanguageStat[],
  options: LanguagesCardOptions
): string {
  const { theme, hideBorder, hideTitle, layout = "compact", username = "", borderRadius, customWidth, customHeight, themeColors } = options;

  // Override language colors with theme-derived palette if requested
  const langs = themeColors
    ? (() => {
        const palette = generateThemePalette(theme, languages.length);
        return languages.map((lang, i) => ({ ...lang, color: palette[i] }));
      })()
    : languages;

  if (layout === "normal") {
    return renderNormalLayout(langs, { theme, hideBorder, hideTitle, username, borderRadius, customWidth, customHeight });
  }
  return renderCompactLayout(langs, { theme, hideBorder, hideTitle, username, borderRadius, customWidth, customHeight });
}

function renderCompactLayout(
  languages: LanguageStat[],
  options: { theme: Theme; hideBorder?: boolean; hideTitle?: boolean; username: string; borderRadius?: number; customWidth?: number; customHeight?: number }
): string {
  const { theme, hideBorder, hideTitle, username, borderRadius, customWidth, customHeight } = options;

  const barWidth = 435;
  const barY = 20;
  const legendY = 48;

  // Progress bar segments
  let barOffset = 0;
  const barSegments = languages
    .map((lang) => {
      const width = (lang.percentage / 100) * barWidth;
      const segment = `<rect x="${30 + barOffset}" y="${barY}" width="${width}" height="8" fill="${lang.color}" rx="0"/>`;
      barOffset += width;
      return segment;
    })
    .join("");

  // Wrap bar in a rounded clip path
  const bar = `
    <defs>
      <clipPath id="bar-clip">
        <rect x="30" y="${barY}" width="${barWidth}" height="8" rx="4"/>
      </clipPath>
    </defs>
    <g clip-path="url(#bar-clip)">
      ${barSegments}
    </g>`;

  // Legend: 2 columns
  const colWidth = 220;
  const legend = languages
    .map((lang, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 30 + col * colWidth;
      const y = legendY + row * 22;
      return `
    <g transform="translate(${x}, ${y})">
      <circle cx="5" cy="6" r="5" fill="${lang.color}"/>
      <text x="15" y="10" class="lang-name">${escapeXml(lang.name)} ${lang.percentage.toFixed(1)}%</text>
    </g>`;
    })
    .join("");

  const legendRows = Math.ceil(languages.length / 2);
  const titleSpace = hideTitle ? 10 : 45;
  const cardHeight = titleSpace + legendY + legendRows * 22 + 20;

  return renderCard(
    {
      width: customWidth ?? 495,
      height: customHeight ?? cardHeight,
      title: username ? `${username}'s Top Languages` : "Top Languages",
      theme,
      hideBorder,
      hideTitle,
      borderRadius,
    },
    `${bar}${legend}`
  );
}

function renderNormalLayout(
  languages: LanguageStat[],
  options: { theme: Theme; hideBorder?: boolean; hideTitle?: boolean; username: string; borderRadius?: number; customWidth?: number; customHeight?: number }
): string {
  const { theme, hideBorder, hideTitle, username, borderRadius, customWidth, customHeight } = options;

  const rowHeight = 40;
  const startY = 15;
  const barMaxWidth = 200;

  const rows = languages
    .map((lang, i) => {
      const y = startY + i * rowHeight;
      const barWidth = (lang.percentage / 100) * barMaxWidth;
      return `
    <g transform="translate(30, ${y})" class="fade-in" style="animation-delay: ${i * 150}ms">
      <circle cx="5" cy="8" r="5" fill="${lang.color}"/>
      <text x="15" y="12" class="stat-label">${escapeXml(lang.name)}</text>
      <text x="150" y="12" class="stat-value">${lang.percentage.toFixed(1)}%</text>
      <rect x="200" y="2" width="${barWidth}" height="12" rx="2" fill="${lang.color}" opacity="0.7"/>
    </g>`;
    })
    .join("");

  const titleSpace = hideTitle ? 10 : 45;
  const cardHeight = titleSpace + startY + languages.length * rowHeight + 15;

  return renderCard(
    {
      width: customWidth ?? 495,
      height: customHeight ?? cardHeight,
      title: username ? `${username}'s Top Languages` : "Top Languages",
      theme,
      hideBorder,
      hideTitle,
      borderRadius,
    },
    rows
  );
}
