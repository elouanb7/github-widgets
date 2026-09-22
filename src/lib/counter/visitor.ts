/**
 * Visitor heuristics for the views counter.
 *
 * README images are fetched through GitHub's camo proxy, which strips every trace
 * of the actual visitor: we only ever see camo's own IP and user agent. Real
 * "unique visitors" are therefore impossible — the best we can do is drop obvious
 * crawlers and collapse bursts coming from the same fetcher.
 */

const BOT_UA =
  /bot\b|bots\/|crawler|crawling|spider|slurp|scrapy|facebookexternalhit|embedly|quora link preview|outbrain|pinterest|vkshare|w3c_validator|whatsapp|telegram|discordbot|slackbot|twitterbot|linkedinbot|lighthouse|headlesschrome|monitoring|uptime/i;

export function isBot(userAgent: string | null): boolean {
  return !!userAgent && BOT_UA.test(userAgent);
}

function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? headers.get("cf-connecting-ip") ?? "unknown";
}

/**
 * Short, non-reversible tag for "the same fetcher asking for the same counter".
 * Only ever stored under a few-seconds TTL.
 */
export async function visitorTag(headers: Headers, counterKey: string): Promise<string> {
  const raw = `${clientIp(headers)}|${headers.get("user-agent") ?? ""}|${counterKey}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return [...new Uint8Array(digest).slice(0, 8)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
