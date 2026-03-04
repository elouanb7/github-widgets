import { NextRequest } from "next/server";
import { fetchUserStats, isPrivateUser } from "@/lib/github/client";
import { resolveTheme } from "@/lib/themes";
import { renderStatsCard } from "@/lib/svg/stats-card";
import { renderErrorCard } from "@/lib/svg/card";
import { svgCache, buildCacheKey } from "@/lib/cache";

const isDev = process.env.NODE_ENV === "development";
const SVG_HEADERS = {
  "Content-Type": "image/svg+xml; charset=utf-8",
  "Cache-Control": isDev
    ? "no-cache, no-store, must-revalidate"
    : "public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400",
};

function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username);
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

  try {
    const usePrivate = isPrivateUser(username);
    const cacheKey = buildCacheKey("stats", username, searchParams, usePrivate);
    const cached = svgCache.get(cacheKey);
    if (cached) {
      return new Response(cached, { headers: SVG_HEADERS });
    }

    const stats = await fetchUserStats(username, usePrivate);
    const theme = resolveTheme(searchParams);
    const hide = (searchParams.get("hide") ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const borderRadius = Math.min(50, Math.max(0, parseFloat(searchParams.get("border_radius") ?? "4.5") || 4.5));
    const customWidth = searchParams.get("width") ? Math.min(1000, Math.max(100, parseInt(searchParams.get("width")!, 10) || 390)) : undefined;
    const customHeight = searchParams.get("height") ? Math.min(1000, Math.max(50, parseInt(searchParams.get("height")!, 10) || 0)) : undefined;

    const svg = renderStatsCard(stats, {
      theme,
      hideBorder: searchParams.get("hide_border") === "true",
      hideTitle: searchParams.get("hide_title") === "true",
      hide,
      borderRadius,
      customWidth,
      customHeight,
    });

    svgCache.set(cacheKey, svg);
    return new Response(svg, { headers: SVG_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(renderErrorCard(message), {
      status: 500,
      headers: SVG_HEADERS,
    });
  }
}
