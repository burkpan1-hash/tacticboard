import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { secureHeaders } from 'hono/secure-headers'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { auth, googleEnabled } from './auth'
import { db } from './db/client'
import { plays, guestPlays } from './db/schema'
import playsRouter from './routes/plays'
import { rateLimit } from './middleware/rateLimit'
import type { PlaySet } from '../src/models/types'

const app = new Hono()

// Cap on anonymous share payloads — keeps a single huge blob from bloating the DB.
const MAX_SHARE_BYTES = 256 * 1024 // 256 KB
const MAX_TITLE_LEN = 200

app.use('*', secureHeaders())

// Better Auth handles all /api/auth/* routes
app.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw))

// Public: tells the frontend which optional auth providers are wired so it can hide
// buttons (e.g. Google) when credentials aren't configured. Don't leak anything else.
app.get('/api/auth-config', (c) => c.json({ googleEnabled }))

// Public share route — checks both user plays and guest plays.
// Return only the public-facing fields; never leak userId or internal flags.
app.get('/api/share/:token', async (c) => {
  const token = c.req.param('token')
  const [play] = await db.select().from(plays).where(eq(plays.shareToken, token))
  if (play) return c.json({ title: play.title, data: play.data })
  const [guest] = await db.select().from(guestPlays).where(eq(guestPlays.shareToken, token))
  if (guest) return c.json({ title: guest.title, data: guest.data })
  return c.json({ error: 'Not found' }, 404)
})

// Public share create — no auth required (for anonymous users).
// Rate-limited per IP and size-capped to keep this open endpoint from being
// abused for storage/cost amplification or anonymous content hosting.
app.post('/api/share-public', rateLimit({ windowMs: 60_000, max: 10 }), async (c) => {
  // Reject oversized bodies before parsing when the client declares the size.
  if (Number(c.req.header('content-length') || 0) > MAX_SHARE_BYTES) {
    return c.json({ error: 'PAYLOAD_TOO_LARGE', limit: MAX_SHARE_BYTES }, 413)
  }
  const body = await c.req.json<{ title: string; data: PlaySet }>()
  if (!body.title || !body.data) return c.json({ error: 'title and data are required' }, 400)
  // Defense in depth: content-length can be absent or lie, so measure the payload.
  if (JSON.stringify(body.data).length > MAX_SHARE_BYTES) {
    return c.json({ error: 'PAYLOAD_TOO_LARGE', limit: MAX_SHARE_BYTES }, 413)
  }
  const title = body.title.slice(0, MAX_TITLE_LEN)
  const token = nanoid(12)
  const [guest] = await db
    .insert(guestPlays)
    .values({ id: nanoid(), shareToken: token, title, data: body.data })
    .returning()
  return c.json({ shareToken: guest.shareToken }, 201)
})

// App API routes (auth required — handled inside the router)
app.route('/api/plays', playsRouter)

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use('*', serveStatic({ root: './dist' }))
  app.get('*', serveStatic({ path: './dist/index.html' }))
}

const port = Number(process.env.PORT) || 3000
console.log(`Server running on port ${port}`)

serve({ fetch: app.fetch, port, hostname: '0.0.0.0' })

export default app
