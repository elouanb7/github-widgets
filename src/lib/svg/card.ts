import { Theme } from "@/lib/themes";
import { escapeXml } from "./utils";

export interface CardOptions {
  width: number;
  height: number;
  title: string;
  theme: Theme;
  hideBorder?: boolean;
  hideTitle?: boolean;
  borderRadius?: number;
}

export function renderCard(options: CardOptions, body: string): string {
  const {
    width,
    height,
    title,
    theme,
    hideBorder = false,
    hideTitle = false,
    borderRadius = 4.5,
  } = options;

  const titleOffset = hideTitle ? 10 : 45;

  const fontFamily = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title" text-rendering="geometricPrecision">
  <title id="title">${escapeXml(title)}</title>
  <style>
    * { font-family: ${fontFamily}; }
    .card-bg { fill: ${theme.bgColor}; stroke: ${hideBorder ? "none" : theme.borderColor}; stroke-opacity: 1; }
    .card-title { font-size: 18px; font-weight: 600; fill: ${theme.titleColor}; }
    .stat-label { font-size: 14px; font-weight: 400; fill: ${theme.textColor}; }
    .stat-value { font-size: 14px; font-weight: 700; fill: ${theme.textColor}; }
    .lang-name { font-size: 12px; font-weight: 400; fill: ${theme.textColor}; }
    .icon { fill: ${theme.iconColor}; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .fade-in { animation: fadeIn 0.3s ease-in-out forwards; }
  </style>
  <rect class="card-bg" x="0.5" y="0.5" rx="${borderRadius}" width="${width - 1}" height="${height - 1}"/>
  ${hideTitle ? "" : `<text x="25" y="40" class="card-title">${escapeXml(title)}</text>`}
  <g transform="translate(0, ${titleOffset})">
    ${body}
  </g>
</svg>`;
}

export function renderErrorCard(message: string): string {
  return renderCard(
    {
      width: 495,
      height: 120,
      title: "Error",
      theme: {
        titleColor: "#e74c3c",
        textColor: "#434d58",
        iconColor: "#e74c3c",
        bgColor: "#ffffff",
        borderColor: "#e4e2e2",
      },
    },
    `<text x="25" y="40" class="stat-label">${escapeXml(message)}</text>`
  );
}
