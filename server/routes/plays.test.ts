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

// Minimal stub so plays router can import without a real DB connection
vi.mock('../db/client', () => ({
  db: {},
}))

import { auth } from '../auth'
import playsRouter from './plays'

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

describe('plays routes', () => {
  beforeEach(() => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1', email: 'a@b.com', name: 'Test', image: null },
      session: { id: 'session-1' },
    } as any)
  })

  it('POST / returns 400 when title is missing', async () => {
    const app = new Hono()
    app.route('/api/plays', playsRouter)

    const res = await app.request('/api/plays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { id: 'x', name: 'Test' } }), // missing title
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('title and data are required')
  })

  it('POST / returns 401 when not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)

    const app = new Hono()
    app.route('/api/plays', playsRouter)

    const res = await app.request('/api/plays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test', data: {} }),
    })

    expect(res.status).toBe(401)
  })
})
