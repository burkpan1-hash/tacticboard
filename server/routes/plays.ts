import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '../db/client'
import { plays } from '../db/schema'
import { requireAuth } from '../middleware/auth'
import type { PlaySet } from '../../src/models/types'

type Env = { Variables: { user: { id: string; email: string; name: string; image: string | null } } }
const router = new Hono<Env>()

// All routes below require auth
router.use('*', requireAuth)

// List user's plays
router.get('/', async (c) => {
  const user = c.get('user')
  const userPlays = await db
    .select()
    .from(plays)
    .where(eq(plays.userId, user.id))
  return c.json(userPlays)
})

// Get single play (owner only)
router.get('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const [play] = await db
    .select()
    .from(plays)
    .where(and(eq(plays.id, id), eq(plays.userId, user.id)))
  if (!play) return c.json({ error: 'Not found' }, 404)
  return c.json(play)
})

// Create play
router.post('/', async (c) => {
  const user = c.get('user')
  const body = await c.req.json<{ title: string; data: PlaySet }>()
  const [play] = await db
    .insert(plays)
    .values({
      id: nanoid(),
      userId: user.id,
      title: body.title,
      data: body.data,
    })
    .returning()
  return c.json(play, 201)
})

// Update play (owner only)
router.put('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const body = await c.req.json<{ title?: string; data?: PlaySet }>()
  const [play] = await db
    .update(plays)
    .set({ ...body, updatedAt: new Date() })
    .where(and(eq(plays.id, id), eq(plays.userId, user.id)))
    .returning()
  if (!play) return c.json({ error: 'Not found' }, 404)
  return c.json(play)
})

// Delete play (owner only)
router.delete('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const [deleted] = await db
    .delete(plays)
    .where(and(eq(plays.id, id), eq(plays.userId, user.id)))
    .returning()
  if (!deleted) return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})

// Generate share token
router.post('/:id/share', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const token = nanoid(12)
  const [play] = await db
    .update(plays)
    .set({ shareToken: token, isPublic: true, updatedAt: new Date() })
    .where(and(eq(plays.id, id), eq(plays.userId, user.id)))
    .returning()
  if (!play) return c.json({ error: 'Not found' }, 404)
  return c.json({ shareToken: play.shareToken })
})

export default router
