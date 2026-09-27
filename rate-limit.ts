import { env } from './env';

const local = new Map<string, { count: number; reset: number }>();

export async function rateLimit(key: string, limit = 12, windowMs = 60_000) {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redisKey = `rl:${key}`;
      const response = await fetch(`${env.UPSTASH_REDIS_REST_URL}/pipeline`, {
        method: 'POST', headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`, 'content-type': 'application/json' },
        body: JSON.stringify([['INCR', redisKey], ['EXPIRE', redisKey, Math.ceil(windowMs / 1000)]])
      });
      const result = await response.json() as Array<{ result?: number }>;
      return Number(result?.[0]?.result ?? limit + 1) <= limit;
    } catch { /* fall through to local protection */ }
  }
  const now = Date.now(); const item = local.get(key);
  if (!item || item.reset < now) { local.set(key, { count: 1, reset: now + windowMs }); return true; }
  item.count += 1; return item.count <= limit;
}
