import type { Context, Next } from 'hono'

// Lightweight in-memory IP rate limiter for unauthenticated endpoints.
//
// It is per-instance and resets on restart, which is fine for throttling abuse
// on a small single-instance deploy. If you scale to multiple Fly machines,
// move this to a shared store (Redis, or a small Postgres table) so the limit
// is enforced globally instead of per-instance.

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()
let lastSweep = Date.now()

function clientIp(c: Context): string {
  // Fly sets Fly-Client-IP to the real client; fall back to XFF, then unknown.
  return (
    c.req.header('fly-client-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

export function rateLimit({ windowMs, max }: { windowMs: number; max: number }) {
  return async (c: Context, next: Next) => {
    const now = Date.now()

    // Opportunistic cleanup so the map can't grow without bound under abuse.
    if (now - lastSweep > windowMs) {
      for (const [key, b] of buckets) if (now > b.resetAt) buckets.delete(key)
      lastSweep = now
    }

    const ip = clientIp(c)
    const bucket = buckets.get(ip)
    if (!bucket || now > bucket.resetAt) {
      buckets.set(ip, { count: 1, resetAt: now + windowMs })
    } else {
      bucket.count++
      if (bucket.count > max) {
        c.header('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)))
        return c.json({ error: 'RATE_LIMITED' }, 429)
      }
    }
    return next()
  }
}
