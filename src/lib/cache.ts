interface CacheEntry {
  value: string;
  expiry: number;
}

class LRUCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;

  constructor(maxSize = 512) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: string, value: string, ttlMs = 1800_000): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, expiry: Date.now() + ttlMs });
  }
}

export const svgCache = new LRUCache(512);

export function buildCacheKey(
  cardType: string,
  username: string,
  params: URLSearchParams,
  isPrivate = false
): string {
  const relevant = [
    "theme",
    "hide",
    "hide_border",
    "hide_title",
    "langs_count",
    "layout",
    "title_color",
    "text_color",
    "bg_color",
    "icon_color",
    "border_color",
    "border_radius",
    "theme_colors",
    "width",
    "height",
  ];
  const parts = relevant.map((k) => `${k}=${params.get(k) ?? ""}`).join("&");
  return `${cardType}:${username.toLowerCase()}:${isPrivate ? "private" : "public"}:${parts}`;
}
