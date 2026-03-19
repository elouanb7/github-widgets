import { NextResponse } from "next/server";

let cachedResult: { count: number; users: string[]; timestamp: number } | null = null;
const CACHE_TTL = 3600_000; // 1 hour

export async function GET() {
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
    return NextResponse.json(cachedResult);
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.github.com/search/code?q=${encodeURIComponent('"github-widgets.elouanb7.com"')}+in:file+filename:README&per_page=100`,
      {
        headers: {
          Authorization: `bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "github-widgets",
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: text }, { status: response.status });
    }

    const data = await response.json();
    const uniqueUsers = new Set<string>();
    for (const item of data.items ?? []) {
      if (item.repository?.owner?.login) {
        uniqueUsers.add(item.repository.owner.login);
      }
    }

    cachedResult = {
      count: uniqueUsers.size,
      users: [...uniqueUsers],
      timestamp: Date.now(),
    };

    return NextResponse.json(cachedResult, {
      headers: {
        "Cache-Control": "public, max-age=1800, s-maxage=3600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
