// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'

vi.mock('../auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

import { auth } from '../auth'

describe('requireAuth middleware', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when no session', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)

    const app = new Hono()
    app.use('*', requireAuth)
    app.get('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test')
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('allows request through when session is valid', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1', email: 'a@b.com', name: 'Test', image: null },
      session: { id: 'session-1' },
    } as any)

    const app = new Hono()
    app.use('*', requireAuth)
    app.get('/test', (c) => c.json({ userId: c.get('user').id }))

    const res = await app.request('/test')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.userId).toBe('user-1')
  })
})
