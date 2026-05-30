import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { eq } from 'drizzle-orm'
import { auth, googleEnabled } from './auth'
import { db } from './db/client'
import { plays } from './db/schema'
import playsRouter from './routes/plays'

const app = new Hono()

// Better Auth handles all /api/auth/* routes
app.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw))

// Public: tells the frontend which optional auth providers are wired so it can hide
// buttons (e.g. Google) when credentials aren't configured. Don't leak anything else.
app.get('/api/auth-config', (c) => c.json({ googleEnabled }))

// Public share route — no auth required
app.get('/api/share/:token', async (c) => {
  const token = c.req.param('token')
  const [play] = await db
    .select()
    .from(plays)
    .where(eq(plays.shareToken, token))
  if (!play) return c.json({ error: 'Not found' }, 404)
  return c.json(play)
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

serve({ fetch: app.fetch, port })

export default app
