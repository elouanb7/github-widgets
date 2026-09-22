/**
 * Persistent view counters.
 *
 * Backed by Upstash Redis through its REST API (plain fetch, no SDK, works on any
 * runtime): an atomic INCR is exactly the primitive a hit counter needs, and one
 * view costs one command. Without credentials it falls back to an in-memory map so
 * `npm run dev` works with no setup — counts then reset with the process.
 */

function restUrl(): string | undefined {
  return process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
}

function restToken(): string | undefined {
  return process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
}

export function isPersistent(): boolean {
  return !!restUrl() && !!restToken();
}

async function command(args: (string | number)[]): Promise<unknown> {
  const response = await fetch(restUrl()!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${restToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args.map(String)),
    cache: "no-store",
  });

  const json = await response.json().catch(() => null);
  if (!response.ok || (json && json.error)) {
    throw new Error(json?.error ?? `Upstash responded with ${response.status}`);
  }
  return json?.result;
}

/**
 * Increment only when `seenKey` was not set in the last `ttl` seconds, so a burst
 * of requests for the same page load counts once. A Lua script keeps it atomic and
 * down to a single round-trip.
 */
const DEDUPED_INCR = `
if redis.call('SET', KEYS[1], '1', 'NX', 'EX', ARGV[1]) then
  return redis.call('INCR', KEYS[2])
end
return tonumber(redis.call('GET', KEYS[2]) or '0')
`;

// --- In-memory fallback (development / no credentials) ----------------------

const memoryCounts = new Map<string, number>();
const memorySeen = new Map<string, number>();

function memoryIncrement(key: string, seenKey: string | null, ttlMs: number): number {
  const now = Date.now();
  if (seenKey) {
    const expiry = memorySeen.get(seenKey);
    if (expiry && expiry > now) return memoryCounts.get(key) ?? 0;
    if (memorySeen.size > 5000) {
      for (const [k, exp] of memorySeen) if (exp <= now) memorySeen.delete(k);
    }
    memorySeen.set(seenKey, now + ttlMs);
  }
  const next = (memoryCounts.get(key) ?? 0) + 1;
  memoryCounts.set(key, next);
  return next;
}

// --- Public API -------------------------------------------------------------

export async function readCount(key: string): Promise<number> {
  if (!isPersistent()) return memoryCounts.get(key) ?? 0;
  return Number(await command(["GET", key])) || 0;
}

/**
 * Record a view and return the new total. When `seenKey` is set, views sharing it
 * within `dedupeSeconds` count once.
 */
export async function recordView(
  key: string,
  seenKey: string | null = null,
  dedupeSeconds = 0
): Promise<number> {
  const deduped = !!seenKey && dedupeSeconds > 0;

  if (!isPersistent()) {
    return memoryIncrement(key, deduped ? seenKey : null, dedupeSeconds * 1000);
  }

  if (deduped) {
    try {
      return Number(await command(["EVAL", DEDUPED_INCR, 2, seenKey!, key, dedupeSeconds])) || 0;
    } catch {
      // Scripting unavailable on the backing store: counting every hit beats failing.
    }
  }

  return Number(await command(["INCR", key])) || 0;
}
