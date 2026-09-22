import { NextRequest } from "next/server";
import { recordView, readCount } from "@/lib/counter/store";
import { isBot, visitorTag } from "@/lib/counter/visitor";
import { resolveTheme } from "@/lib/themes";
import {
  FIXED_WIDTH_STYLES,
  renderViewsCard,
  VIEWS_ICONS,
  VIEWS_STYLES,
  ViewsIcon,
  ViewsStyle,
} from "@/lib/svg/views-card";
import { renderErrorCard } from "@/lib/svg/card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// A counter must never be cached: camo, the CDN and the browser all have to come
// back to the function for the number to move.
const SVG_HEADERS = {
  "Content-Type": "image/svg+xml; charset=utf-8",
  "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

const DEFAULT_DEDUPE_SECONDS = 5;

function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username);
}

const SIZE_PRESETS: Record<string, number> = { sm: 0.8, md: 1, lg: 1.4, xl: 1.8 };

function clampFloat(value: string | null, min: number, max: number, fallback: number): number {
  if (value === null) return fallback;
  const parsed = parseFloat(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function clampInt(value: string | null, min: number, max: number, fallback: number): number {
  if (value === null) return fallback;
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const username = searchParams.get("username");

  if (!username) {
    return new Response(renderErrorCard("Missing ?username= parameter"), {
      status: 400,
      headers: SVG_HEADERS,
    });
  }

  if (!isValidUsername(username)) {
    return new Response(renderErrorCard("Invalid GitHub username"), {
      status: 400,
      headers: SVG_HEADERS,
    });
  }

  const requestedStyle = searchParams.get("style") as ViewsStyle | null;
  const style: ViewsStyle =
    requestedStyle && VIEWS_STYLES.includes(requestedStyle) ? requestedStyle : "badge";
  // Digit tiles, displays and terminal readouts want a fixed width of digits.
  const defaultPad = FIXED_WIDTH_STYLES.includes(style) ? 6 : 0;

  const requestedIcon = searchParams.get("icon") as ViewsIcon | null;
  const icon: ViewsIcon =
    searchParams.get("hide_icon") === "true"
      ? "none"
      : requestedIcon && VIEWS_ICONS.includes(requestedIcon)
        ? requestedIcon
        : style === "badge"
          ? "eye"
          : "none";

  const scale = SIZE_PRESETS[searchParams.get("size") ?? ""] ?? clampFloat(searchParams.get("scale"), 0.4, 4, 1);
  const label = (searchParams.get("label") ?? "Profile views")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f]/g, "")
    .slice(0, 48);

  const key = `views:${username.toLowerCase()}`;
  const dedupeSeconds = clampInt(searchParams.get("dedupe"), 0, 3600, DEFAULT_DEDUPE_SECONDS);
  const offset = clampInt(searchParams.get("offset"), 0, 1_000_000_000, 0);

  // Previews (our own site) and crawlers read the counter without moving it.
  const readOnly =
    searchParams.get("increment") === "false" ||
    searchParams.get("count") === "false" ||
    isBot(request.headers.get("user-agent"));

  let count: number | null = null;
  try {
    if (readOnly) {
      count = await readCount(key);
    } else {
      const tag = dedupeSeconds > 0 ? `seen:${await visitorTag(request.headers, key)}` : null;
      count = await recordView(key, tag, dedupeSeconds);
    }
    count += offset;
  } catch (error) {
    // A broken image on someone's profile is worse than a counter showing "—".
    console.error("views counter:", error instanceof Error ? error.message : error);
  }

  const svg = renderViewsCard({
    theme: resolveTheme(searchParams),
    count,
    label,
    style,
    username,
    hideBorder: searchParams.get("hide_border") === "true",
    hideTitle: searchParams.get("hide_title") === "true",
    icon,
    scale,
    borderRadius: searchParams.get("border_radius")
      ? Math.min(50, Math.max(0, parseFloat(searchParams.get("border_radius")!) || 0))
      : undefined,
    pad: clampInt(searchParams.get("pad"), 0, 12, defaultPad),
    abbreviate: searchParams.get("abbreviate") === "true",
    customWidth: searchParams.get("width")
      ? Math.min(1000, Math.max(60, parseInt(searchParams.get("width")!, 10) || 0))
      : undefined,
    customHeight: searchParams.get("height")
      ? Math.min(1000, Math.max(20, parseInt(searchParams.get("height")!, 10) || 0))
      : undefined,
  });

  return new Response(svg, { headers: SVG_HEADERS });
}
