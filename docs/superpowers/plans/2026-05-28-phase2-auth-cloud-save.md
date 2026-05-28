# Phase 2 — Auth + Cloud Save + Sharing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email/password + Google + Apple auth, cloud play storage, and public share links to SetPlay using Hono + Better Auth + Drizzle + Fly Postgres.

**Architecture:** Single Fly.io app — Hono backend serves both `/api/*` routes and the built React frontend from `dist/`. In development, Vite dev server (port 5173) proxies `/api` requests to the Hono server (port 3000). Session state is managed via HTTP-only cookies handled entirely by Better Auth.

**Tech Stack:** Hono, @hono/node-server, Better Auth, Drizzle ORM, postgres (pg driver), Fly Postgres, Vitest, React Testing Library

---

## File Map

### New files
| File | Responsibility |
|------|---------------|
| `server/index.ts` | Hono app entry — mounts auth + plays routes, serves `dist/` in production |
| `server/auth.ts` | Better Auth config — email/password, Google, Apple OAuth |
| `server/db/auth-schema.ts` | Better Auth table definitions for Drizzle |
| `server/db/schema.ts` | `plays` table definition |
| `server/db/client.ts` | Drizzle + postgres connection |
| `server/middleware/auth.ts` | `requireAuth` middleware — verifies session, sets `c.var.user` |
| `server/routes/plays.ts` | Play CRUD + share endpoints |
| `server/routes/plays.test.ts` | Tests for requireAuth + plays routes |
| `drizzle.config.ts` | drizzle-kit config — points to both schemas |
| `src/lib/authClient.ts` | Better Auth React client — exports `authClient` |
| `src/components/ui/ProtectedRoute.tsx` | Redirects to `/login` when no session |
| `src/components/ui/ProtectedRoute.test.tsx` | Test: redirects unauthenticated users |
| `src/pages/LoginPage.tsx` | Sign-in form (email/password + social buttons) |
| `src/pages/RegisterPage.tsx` | Sign-up form |
| `src/pages/MyPlaysPage.tsx` | Grid of user's saved plays with edit/delete/share |
| `src/pages/SharePage.tsx` | Read-only play viewer via share token |
| `.env.example` | All required environment variables documented |
| `fly.toml` | Fly.io app config |

### Modified files
| File | Change |
|------|--------|
| `package.json` | Add server deps + `server:dev`, `db:push`, `start` scripts |
| `vite.config.ts` | Add `/api` proxy to `http://localhost:3000` for dev |
| `src/App.tsx` | Add `/login`, `/register`, `/my-plays`, `/share/:token` routes |
| `src/pages/HomePage.tsx` | Add "Giriş Yap" / "Play'lerim" / user avatar to header |
| `src/pages/EditorPage.tsx` | Add "Kaydet" + "Paylaş" buttons |
| `Dockerfile` | Multi-stage build: vite build → Hono serve |

---

## Task 1: Install dependencies and configure build tooling

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `tsconfig.server.json`
- Create: `.env.example`

- [ ] **Step 1: Install server dependencies**

```bash
npm install hono @hono/node-server better-auth drizzle-orm postgres
npm install -D drizzle-kit tsx @types/node
```

Expected: no errors, `package.json` updated.

- [ ] **Step 2: Add scripts to package.json**

In `package.json`, add to `"scripts"`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "server:dev": "tsx watch server/index.ts",
    "db:push": "drizzle-kit push",
    "start": "tsx server/index.ts"
  }
}
```

- [ ] **Step 3: Create tsconfig.server.json**

Create `tsconfig.server.json` at project root:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist-server"
  },
  "include": ["server/**/*"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Add Vite dev proxy**

Replace the contents of `vite.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
  },
})
```

- [ ] **Step 5: Create .env.example**

Create `.env.example` at project root:
```
# Postgres (Fly.io provides this automatically)
DATABASE_URL=postgresql://user:password@localhost:5432/setplay

# Better Auth — generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=your-secret-here

# Your deployed URL (used for OAuth callbacks)
BETTER_AUTH_URL=https://your-app.fly.dev

# Google OAuth — https://console.cloud.google.com
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Apple OAuth — https://developer.apple.com
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
```

- [ ] **Step 6: Commit**

```bash
git add package.json vite.config.ts tsconfig.server.json .env.example package-lock.json
git commit -m "chore: add server deps and build tooling for Phase 2"
```

---

## Task 2: Database schemas and Drizzle client

**Files:**
- Create: `server/db/auth-schema.ts`
- Create: `server/db/schema.ts`
- Create: `server/db/client.ts`
- Create: `drizzle.config.ts`

- [ ] **Step 1: Create Better Auth tables schema**

Create `server/db/auth-schema.ts`:
```typescript
import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
})
```

- [ ] **Step 2: Create plays table schema**

Create `server/db/schema.ts`:
```typescript
import { pgTable, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { user } from './auth-schema'

export { user, session, account, verification } from './auth-schema'

export const plays = pgTable('plays', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  data: jsonb('data').notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  shareToken: text('share_token').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Play = typeof plays.$inferSelect
export type NewPlay = typeof plays.$inferInsert
```

- [ ] **Step 3: Create Drizzle client**

Create `server/db/client.ts`:
```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

const queryClient = postgres(connectionString)
export const db = drizzle(queryClient, { schema })
```

- [ ] **Step 4: Create drizzle.config.ts**

Create `drizzle.config.ts` at project root:
```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

- [ ] **Step 5: Commit**

```bash
git add server/db/ drizzle.config.ts
git commit -m "feat: add Drizzle schema for auth tables and plays"
```

---

## Task 3: Better Auth configuration

**Files:**
- Create: `server/auth.ts`

- [ ] **Step 1: Create Better Auth config**

Create `server/auth.ts`:
```typescript
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db/client'
import * as schema from './db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  baseURL: process.env.BETTER_AUTH_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    },
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
```

- [ ] **Step 2: Commit**

```bash
git add server/auth.ts
git commit -m "feat: add Better Auth config with email, Google, Apple providers"
```

---

## Task 4: Hono app entry point

**Files:**
- Create: `server/index.ts`

- [ ] **Step 1: Create Hono entry point**

Create `server/index.ts`:
```typescript
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { auth } from './auth'
import playsRouter from './routes/plays'

const app = new Hono()

// Better Auth handles all /api/auth/* routes
app.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw))

// App API routes
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
```

- [ ] **Step 2: Verify server starts**

In one terminal, run the backend:
```bash
DATABASE_URL=postgresql://localhost/setplay BETTER_AUTH_SECRET=test BETTER_AUTH_URL=http://localhost:3000 npm run server:dev
```

Expected: `Server running on port 3000` — no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add server/index.ts
git commit -m "feat: add Hono app entry with Better Auth and static serve"
```

---

## Task 5: Auth middleware and plays routes

**Files:**
- Create: `server/middleware/auth.ts`
- Create: `server/routes/plays.ts`
- Create: `server/routes/plays.test.ts`

- [ ] **Step 1: Create requireAuth middleware**

Create `server/middleware/auth.ts`:
```typescript
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
```

- [ ] **Step 2: Write failing tests for requireAuth**

Create `server/routes/plays.test.ts`:
```typescript
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
```

- [ ] **Step 3: Run tests — verify they fail**

```bash
npx vitest run server/routes/plays.test.ts
```

Expected: FAIL — `requireAuth` not implemented yet (file doesn't exist).

- [ ] **Step 4: Create plays routes**

Create `server/routes/plays.ts`:
```typescript
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
```

- [ ] **Step 5: Add public share route to server/index.ts**

In `server/index.ts`, add before `app.route('/api/plays', playsRouter)`:
```typescript
import { eq } from 'drizzle-orm'
import { db } from './db/client'
import { plays } from './db/schema'

// Public — no auth required
app.get('/api/share/:token', async (c) => {
  const token = c.req.param('token')
  const [play] = await db
    .select()
    .from(plays)
    .where(eq(plays.shareToken, token))
  if (!play) return c.json({ error: 'Not found' }, 404)
  return c.json(play)
})
```

- [ ] **Step 6: Run tests — verify they pass**

```bash
npx vitest run server/routes/plays.test.ts
```

Expected: 2 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add server/middleware/ server/routes/ server/index.ts
git commit -m "feat: add requireAuth middleware and plays CRUD + share routes"
```

---

## Task 6: Better Auth React client and ProtectedRoute

**Files:**
- Create: `src/lib/authClient.ts`
- Create: `src/components/ui/ProtectedRoute.tsx`
- Create: `src/components/ui/ProtectedRoute.test.tsx`

- [ ] **Step 1: Write failing test for ProtectedRoute**

Create `src/components/ui/ProtectedRoute.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

vi.mock('../../lib/authClient', () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

import { authClient } from '../../lib/authClient'

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: null,
      isPending: false,
      error: null,
    } as any)

    render(
      <MemoryRouter initialEntries={['/my-plays']}>
        <Routes>
          <Route
            path="/my-plays"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { id: 'u1', email: 'a@b.com' }, session: {} },
      isPending: false,
      error: null,
    } as any)

    render(
      <MemoryRouter initialEntries={['/my-plays']}>
        <Routes>
          <Route
            path="/my-plays"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npx vitest run src/components/ui/ProtectedRoute.test.tsx
```

Expected: FAIL — `authClient` not found.

- [ ] **Step 3: Create Better Auth React client**

Create `src/lib/authClient.ts`:
```typescript
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: '/api/auth',
})
```

- [ ] **Step 4: Create ProtectedRoute**

Create `src/components/ui/ProtectedRoute.tsx`:
```typescript
import { Navigate } from 'react-router-dom'
import { authClient } from '../../lib/authClient'

interface Props {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
npx vitest run src/components/ui/ProtectedRoute.test.tsx
```

Expected: 2 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/authClient.ts src/components/ui/ProtectedRoute.tsx src/components/ui/ProtectedRoute.test.tsx
git commit -m "feat: add Better Auth client and ProtectedRoute component"
```

---

## Task 7: LoginPage and RegisterPage

**Files:**
- Create: `src/pages/LoginPage.tsx`
- Create: `src/pages/RegisterPage.tsx`

- [ ] **Step 1: Create LoginPage**

Create `src/pages/LoginPage.tsx`:
```typescript
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authClient } from '../lib/authClient'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await authClient.signIn.email({ email, password })
    if (error) {
      setError(error.message ?? 'Giriş başarısız')
      setLoading(false)
      return
    }
    navigate('/')
  }

  async function handleGoogle() {
    await authClient.signIn.social({ provider: 'google', callbackURL: '/' })
  }

  async function handleApple() {
    await authClient.signIn.social({ provider: 'apple', callbackURL: '/' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Giriş Yap</h1>

        <form onSubmit={handleEmailSignIn} className="space-y-4 mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="space-y-2">
          <button
            onClick={handleGoogle}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors text-sm font-medium"
          >
            Google ile Giriş Yap
          </button>
          <button
            onClick={handleApple}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors text-sm font-medium"
          >
            Apple ile Giriş Yap
          </button>
        </div>

        <p className="text-slate-400 text-sm text-center mt-6">
          Hesabın yok mu?{' '}
          <Link to="/register" className="text-orange-400 hover:text-orange-300">
            Kaydol
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create RegisterPage**

Create `src/pages/RegisterPage.tsx`:
```typescript
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authClient } from '../lib/authClient'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await authClient.signUp.email({ name, email, password })
    if (error) {
      setError(error.message ?? 'Kayıt başarısız')
      setLoading(false)
      return
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Hesap Oluştur</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="İsim"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="password"
            placeholder="Şifre (en az 8 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydol'}
          </button>
        </form>

        <p className="text-slate-400 text-sm text-center mt-6">
          Zaten hesabın var mı?{' '}
          <Link to="/login" className="text-orange-400 hover:text-orange-300">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/LoginPage.tsx src/pages/RegisterPage.tsx
git commit -m "feat: add LoginPage and RegisterPage with email + social auth"
```

---

## Task 8: MyPlaysPage

**Files:**
- Create: `src/pages/MyPlaysPage.tsx`

- [ ] **Step 1: Create MyPlaysPage**

Create `src/pages/MyPlaysPage.tsx`:
```typescript
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient } from '../lib/authClient'

interface CloudPlay {
  id: string
  title: string
  shareToken: string | null
  createdAt: string
  updatedAt: string
}

export default function MyPlaysPage() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const [plays, setPlays] = useState<CloudPlay[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/plays')
      .then((r) => r.json())
      .then((data) => setPlays(data))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    await fetch(`/api/plays/${id}`, { method: 'DELETE' })
    setPlays((prev) => prev.filter((p) => p.id !== id))
  }

  async function handleShare(id: string) {
    const res = await fetch(`/api/plays/${id}/share`, { method: 'POST' })
    const { shareToken } = await res.json()
    const url = `${window.location.origin}/share/${shareToken}`
    await navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    setPlays((prev) => prev.map((p) => (p.id === id ? { ...p, shareToken } : p)))
  }

  async function handleLogout() {
    await authClient.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Play'lerim</h1>
          <p className="text-slate-400 text-sm mt-1">{session?.user.email}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Ana Sayfa
          </button>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      {plays.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <div className="text-5xl mb-4">🏀</div>
          <p className="text-lg">Henüz kaydedilmiş play yok.</p>
          <button
            onClick={() => navigate('/setup')}
            className="mt-4 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Yeni Play Oluştur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plays.map((play) => (
            <div key={play.id} className="bg-slate-800 rounded-xl p-5">
              <p className="font-semibold text-white truncate mb-1">{play.title}</p>
              <p className="text-xs text-slate-500 mb-4">
                {new Date(play.updatedAt).toLocaleDateString('tr-TR')}
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => navigate(`/editor/${play.id}?cloud=1`)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  Aç
                </button>
                <button
                  onClick={() => handleShare(play.id)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  {copiedId === play.id ? 'Kopyalandı!' : play.shareToken ? 'Link Kopyala' : 'Paylaş'}
                </button>
                <button
                  onClick={() => handleDelete(play.id)}
                  className="text-slate-400 hover:text-red-400 px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/MyPlaysPage.tsx
git commit -m "feat: add MyPlaysPage with list, share, delete actions"
```

---

## Task 9: SharePage

**Files:**
- Create: `src/pages/SharePage.tsx`

- [ ] **Step 1: Create SharePage**

Create `src/pages/SharePage.tsx`:
```typescript
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlayStore } from '../store/usePlayStore'
import CourtCanvas from '../components/court/CourtCanvas'
import PlaybackControls from '../components/playback/PlaybackControls'
import type { PlaySet } from '../models/types'

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { setActiveSet } = usePlayStore()
  const [title, setTitle] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null }
        return r.json()
      })
      .then((play) => {
        if (!play) return
        setTitle(play.title)
        setActiveSet(play.data as PlaySet)
      })
      .finally(() => setLoading(false))
  }, [token, loadSet])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Yükleniyor...</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400 text-lg">Play bulunamadı.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-2 rounded-lg"
        >
          Ana Sayfa
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 gap-4">
      <div className="flex items-center justify-between w-full max-w-2xl">
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
          Salt okunur
        </span>
      </div>
      <CourtCanvas readOnly />
      <PlaybackControls />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/SharePage.tsx
git commit -m "feat: add SharePage for public read-only play viewing"
```

---

## Task 10: EditorPage — Save and Share buttons

**Files:**
- Modify: `src/pages/EditorPage.tsx`

- [ ] **Step 1: Add Save + Share button state to EditorPage**

Find the import block at the top of `src/pages/EditorPage.tsx` (line 1) and add:
```typescript
import { authClient } from '../lib/authClient'
```

- [ ] **Step 2: Add save/share state inside EditorPage component**

Find the component's state declarations (after `const { t } = useTranslation()`) and add:
```typescript
const { data: session } = authClient.useSession()
const [saving, setSaving] = useState(false)
const [saved, setSaved] = useState(false)
const [shareUrl, setShareUrl] = useState<string | null>(null)
const [copied, setCopied] = useState(false)
```

- [ ] **Step 3: Add save and share handler functions inside EditorPage**

Add these two functions before the `return` statement:
```typescript
async function handleSave() {
  if (!session) {
    navigate('/login')
    return
  }
  if (!activeSet) return
  setSaving(true)
  try {
    const res = await fetch('/api/plays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: activeSet.name, data: activeSet }),
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  } finally {
    setSaving(false)
  }
}

async function handleShare() {
  if (!session) {
    navigate('/login')
    return
  }
  if (!activeSet) return
  // Save first, then generate share token
  const res = await fetch('/api/plays', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: activeSet.name, data: activeSet }),
  })
  const play = await res.json()
  const shareRes = await fetch(`/api/plays/${play.id}/share`, { method: 'POST' })
  const { shareToken } = await shareRes.json()
  const url = `${window.location.origin}/share/${shareToken}`
  setShareUrl(url)
  await navigator.clipboard.writeText(url)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}
```

- [ ] **Step 4: Add Save + Share buttons to the EditorPage header JSX**

In `EditorPage.tsx`, find the `LanguageSwitcher` component in the JSX and add the two buttons alongside it:
```tsx
<div className="flex items-center gap-2">
  <button
    onClick={handleSave}
    disabled={saving}
    className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors"
  >
    {saved ? 'Kaydedildi!' : saving ? 'Kaydediliyor...' : 'Kaydet'}
  </button>
  <button
    onClick={handleShare}
    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-1.5 rounded-lg text-sm transition-colors"
  >
    {copied ? 'Link Kopyalandı!' : 'Paylaş'}
  </button>
  <LanguageSwitcher />
</div>
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/EditorPage.tsx
git commit -m "feat: add Save and Share buttons to EditorPage"
```

---

## Task 11: HomePage auth header and App.tsx routing

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add auth imports to HomePage.tsx**

Add to the top of `src/pages/HomePage.tsx`:
```typescript
import { authClient } from '../lib/authClient'
```

- [ ] **Step 2: Add session and logout to HomePage component**

Inside `HomePage`, after `const navigate = useNavigate()`, add:
```typescript
const { data: session } = authClient.useSession()

async function handleLogout() {
  await authClient.signOut()
}
```

- [ ] **Step 3: Replace the header button area in HomePage JSX**

Find the `<div className="flex items-center gap-3">` in `HomePage.tsx` that currently contains `<LanguageSwitcher />` and the "New Play" button. Replace it with:
```tsx
<div className="flex items-center gap-3">
  <LanguageSwitcher />
  {session ? (
    <>
      <button
        onClick={() => navigate('/my-plays')}
        className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
      >
        Play'lerim
      </button>
      <button
        onClick={handleLogout}
        className="text-slate-400 hover:text-slate-300 text-sm px-2 py-2 transition-colors"
      >
        Çıkış
      </button>
    </>
  ) : (
    <button
      onClick={() => navigate('/login')}
      className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
    >
      Giriş Yap
    </button>
  )}
  <button
    onClick={() => navigate('/setup')}
    className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
  >
    {t('home.newPlayButton')}
  </button>
</div>
```

- [ ] **Step 4: Update App.tsx with all new routes**

Replace the contents of `src/App.tsx`:
```typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SetupPage from './pages/SetupPage'
import EditorPage from './pages/EditorPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MyPlaysPage from './pages/MyPlaysPage'
import SharePage from './pages/SharePage'
import ProtectedRoute from './components/ui/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/editor/:setId" element={<EditorPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/my-plays"
        element={
          <ProtectedRoute>
            <MyPlaysPage />
          </ProtectedRoute>
        }
      />
      <Route path="/share/:token" element={<SharePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
```

- [ ] **Step 5: Run all tests**

```bash
npm test
```

Expected: All previously passing tests still pass.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/pages/HomePage.tsx
git commit -m "feat: add auth header to HomePage and wire up all routes in App.tsx"
```

---

## Task 12: Dockerfile and fly.toml

**Files:**
- Modify: `Dockerfile`
- Create: `fly.toml`

- [ ] **Step 1: Rewrite Dockerfile for production**

Replace `Dockerfile` contents:
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build React frontend → dist/
RUN npm run build

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server ./server
COPY --from=builder /app/src/models ./src/models

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npx", "tsx", "server/index.ts"]
```

- [ ] **Step 2: Create fly.toml**

Create `fly.toml` at project root:
```toml
app = "setplay"
primary_region = "ams"

[build]

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0

  [http_service.concurrency]
    type = "connections"
    hard_limit = 25
    soft_limit = 20

[[vm]]
  memory = "512mb"
  cpu_kind = "shared"
  cpus = 1
```

- [ ] **Step 3: Create .dockerignore (if not present)**

Create `.dockerignore`:
```
node_modules
dist
dist-server
drizzle
.env
*.log
ballforce-test.png
test-*.png
```

- [ ] **Step 4: Commit**

```bash
git add Dockerfile fly.toml .dockerignore
git commit -m "chore: update Dockerfile and add fly.toml for production deploy"
```

---

## Task 13: Database push and Fly.io deployment

**Files:**
- No code changes — commands only

- [ ] **Step 1: Create Fly.io app**

```bash
fly auth login
fly apps create setplay
```

Expected: App created at `setplay.fly.dev`.

- [ ] **Step 2: Create Fly Postgres database**

```bash
fly postgres create --name setplay-db --region ams
fly postgres attach setplay-db --app setplay
```

Expected: `DATABASE_URL` secret automatically set on the app.

- [ ] **Step 3: Set remaining secrets**

```bash
fly secrets set \
  BETTER_AUTH_SECRET="$(openssl rand -base64 32)" \
  BETTER_AUTH_URL="https://setplay.fly.dev" \
  GOOGLE_CLIENT_ID="your-google-client-id" \
  GOOGLE_CLIENT_SECRET="your-google-client-secret" \
  APPLE_CLIENT_ID="your-apple-client-id" \
  APPLE_CLIENT_SECRET="your-apple-client-secret"
```

Note: Get Google credentials from https://console.cloud.google.com — create OAuth 2.0 client, set callback URL to `https://setplay.fly.dev/api/auth/callback/google`. Apple credentials require Apple Developer account.

- [ ] **Step 4: Push database schema**

```bash
DATABASE_URL="$(fly secrets list | grep DATABASE_URL)" npx drizzle-kit push
```

Or connect via Fly proxy:
```bash
fly proxy 5432 -a setplay-db
# In another terminal:
DATABASE_URL=postgresql://postgres:password@localhost:5432/setplay npx drizzle-kit push
```

Expected: All tables created — `user`, `session`, `account`, `verification`, `plays`.

- [ ] **Step 5: Deploy**

```bash
fly deploy
```

Expected: Build succeeds, app reachable at `https://setplay.fly.dev`.

- [ ] **Step 6: Verify**

```bash
curl https://setplay.fly.dev/api/auth/session
```

Expected: `{"session":null}` — auth system responding.

---

## Summary

After all tasks complete, the app will have:
- Full auth (email/password + Google + Apple) at `/login` and `/register`
- Cloud play storage via `/api/plays` (create, read, update, delete)
- Public sharing via `/share/:token` — no auth required to view
- "Play'lerim" page for managing saved plays
- Save + Share buttons in the editor
- Production deploy on Fly.io serving both API and React frontend
