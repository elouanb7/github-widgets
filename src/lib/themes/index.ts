export interface Theme {
  titleColor: string;
  textColor: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
}

export const themes: Record<string, Theme> = {
  light: {
    titleColor: "#2f80ed",
    textColor: "#434d58",
    iconColor: "#4c71f2",
    bgColor: "#ffffff",
    borderColor: "#e4e2e2",
  },
  dark: {
    titleColor: "#58a6ff",
    textColor: "#c9d1d9",
    iconColor: "#58a6ff",
    bgColor: "#0d1117",
    borderColor: "#30363d",
  },
  "github-dark": {
    titleColor: "#58a6ff",
    textColor: "#8b949e",
    iconColor: "#58a6ff",
    bgColor: "#161b22",
    borderColor: "#21262d",
  },
  radical: {
    titleColor: "#fe428e",
    textColor: "#a9fef7",
    iconColor: "#f8d847",
    bgColor: "#141321",
    borderColor: "#fe428e",
  },
  tokyonight: {
    titleColor: "#70a5fd",
    textColor: "#38bdae",
    iconColor: "#bf91f3",
    bgColor: "#1a1b27",
    borderColor: "#565f89",
  },
  dracula: {
    titleColor: "#ff6e96",
    textColor: "#f8f8f2",
    iconColor: "#bd93f9",
    bgColor: "#282a36",
    borderColor: "#6272a4",
  },
  nord: {
    titleColor: "#81a1c1",
    textColor: "#d8dee9",
    iconColor: "#88c0d0",
    bgColor: "#2e3440",
    borderColor: "#4c566a",
  },
  gruvbox: {
    titleColor: "#fabd2f",
    textColor: "#ebdbb2",
    iconColor: "#fe8019",
    bgColor: "#282828",
    borderColor: "#665c54",
  },
  onedark: {
    titleColor: "#e4bf7a",
    textColor: "#abb2bf",
    iconColor: "#61afef",
    bgColor: "#282c34",
    borderColor: "#4b5263",
  },
  cobalt: {
    titleColor: "#e683d9",
    textColor: "#75eeb2",
    iconColor: "#0480ef",
    bgColor: "#193549",
    borderColor: "#0480ef",
  },
  synthwave: {
    titleColor: "#e2e9ec",
    textColor: "#e2e9ec",
    iconColor: "#ef8539",
    bgColor: "#2b213a",
    borderColor: "#e2e9ec",
  },
  highcontrast: {
    titleColor: "#e7f216",
    textColor: "#fff",
    iconColor: "#00ffff",
    bgColor: "#000",
    borderColor: "#e7f216",
  },
  "catppuccin-mocha": {
    titleColor: "#cba6f7",
    textColor: "#cdd6f4",
    iconColor: "#f5c2e7",
    bgColor: "#1e1e2e",
    borderColor: "#313244",
  },
  "catppuccin-latte": {
    titleColor: "#8839ef",
    textColor: "#4c4f69",
    iconColor: "#ea76cb",
    bgColor: "#eff1f5",
    borderColor: "#ccd0da",
  },
  monokai: {
    titleColor: "#eb1f6a",
    textColor: "#f8f8f2",
    iconColor: "#e28905",
    bgColor: "#272822",
    borderColor: "#49483e",
  },
  "rose-pine": {
    titleColor: "#9ccfd8",
    textColor: "#e0def4",
    iconColor: "#c4a7e7",
    bgColor: "#191724",
    borderColor: "#26233a",
  },
  aura: {
    titleColor: "#a277ff",
    textColor: "#edecee",
    iconColor: "#ffca85",
    bgColor: "#15141b",
    borderColor: "#a277ff",
  },
  sunset: {
    titleColor: "#ff6b6b",
    textColor: "#ffeaa7",
    iconColor: "#fd79a8",
    bgColor: "#2d1b69",
    borderColor: "#e17055",
  },
  ocean: {
    titleColor: "#00cec9",
    textColor: "#dfe6e9",
    iconColor: "#74b9ff",
    bgColor: "#0c2461",
    borderColor: "#0984e3",
  },
  contributions: {
    titleColor: "#39d353",
    textColor: "#26a641",
    iconColor: "#da6dd8",
    bgColor: "#0d1117",
    borderColor: "#0e4429",
  },
};

/**
 * Generate a palette of distinct colors derived from the theme's accent colors.
 * Used when theme_colors=true to replace GitHub's native language colors.
 */
export function generateThemePalette(theme: Theme, count: number): string[] {
  const baseColors = [
    theme.titleColor,
    theme.iconColor,
    theme.textColor,
    theme.borderColor,
  ];

  function hexToHsl(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return [h * 360, s, l];
  }

  function hslToHex(h: number, s: number, l: number): string {
    h = ((h % 360) + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // Start from the title color hue and spread evenly
  const [baseHue, baseSat] = hexToHsl(baseColors[0]);
  const palette: string[] = [];
  const saturation = Math.max(baseSat, 0.5);
  const lightness = 0.55;

  for (let i = 0; i < count; i++) {
    const hue = baseHue + (i * 360) / count;
    palette.push(hslToHex(hue, saturation, lightness));
  }

  return palette;
}

function sanitizeColor(color: string | null): string | null {
  if (!color) return null;
  const hex = color.replace(/^#/, "");
  if (/^[0-9a-fA-F]{3,8}$/.test(hex)) return `#${hex}`;
  return null;
}

export function resolveTheme(params: URLSearchParams): Theme {
  const themeName = params.get("theme") ?? "light";
  const base = themes[themeName] ?? themes.light;

  return {
    titleColor: sanitizeColor(params.get("title_color")) ?? base.titleColor,
    textColor: sanitizeColor(params.get("text_color")) ?? base.textColor,
    iconColor: sanitizeColor(params.get("icon_color")) ?? base.iconColor,
    bgColor: sanitizeColor(params.get("bg_color")) ?? base.bgColor,
    borderColor: sanitizeColor(params.get("border_color")) ?? base.borderColor,
  };
}
