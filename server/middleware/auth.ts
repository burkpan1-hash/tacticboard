import type { Context, Next } from 'hono'
import { createMiddleware } from 'hono/factory'
import { auth } from '../auth'

type AuthVariables = {
  user: { id: string; email: string; name: string; image: string | null }
}

export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(
  async (c: Context, next: Next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    c.set('user', session.user)
    return next()
  }
)
