# Phase 2 — Auth + Cloud Save + Sharing Design

**Date:** 2026-05-28  
**App name:** SetPlay — Basketball Play Designer  
**Status:** Approved

---

## Scope

- Auth: email/password + Google OAuth + Apple OAuth
- Cloud save: unlimited (no limits for now — monetization comes later)
- Play sharing: public read-only link via share token
- No Stripe, no limits in this phase

Out of scope (future phases):
- Free tier limits (3 save / 1 download per month)
- Stripe / subscription

---

## Architecture

**Approach:** Single Fly.io app — Hono backend serves both the API and the built React frontend (`dist/`).

```
basketball-board-tactics/
├── src/                    (React frontend — unchanged)
├── server/                 (NEW — Hono backend)
│   ├── index.ts            (Hono app entry, static serve)
│   ├── auth.ts             (Better Auth config)
│   ├── db/
│   │   ├── schema.ts       (Drizzle schema)
│   │   └── client.ts       (Drizzle + Postgres connection)
│   └── routes/
│       ├── plays.ts        (save/load/delete/share)
│       └── index.ts        (route registration)
├── fly.toml                (single Fly.io app)
└── Dockerfile              (updated to build + serve)
```

**Data flow:**
1. `vite build` outputs `dist/`
2. Hono serves `dist/` as static files for all non-API routes
3. `/api/*` routes go to Hono handlers
4. Better Auth manages sessions via HTTP-only cookies
5. Drizzle connects to Fly Postgres

---

## Database Schema

```sql
-- Managed by Better Auth
users (
  id, email, name, avatar_url, created_at
)

-- App tables
plays (
  id           TEXT PRIMARY KEY,   -- nanoid
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  data         JSONB NOT NULL,     -- serialized Zustand store state
  is_public    BOOLEAN DEFAULT false,
  share_token  TEXT UNIQUE,        -- nanoid, null if not shared
  created_at   TIMESTAMP DEFAULT now(),
  updated_at   TIMESTAMP DEFAULT now()
)
```

---

## API Routes

### Plays (auth required)
```
POST   /api/plays           → create play
GET    /api/plays           → list user's plays
GET    /api/plays/:id       → get single play (owner only)
PUT    /api/plays/:id       → update play
DELETE /api/plays/:id       → delete play
POST   /api/plays/:id/share → generate share_token, set is_public=true
```

### Sharing (public, no auth)
```
GET    /api/share/:token    → return play data (read-only)
```

### Auth (managed by Better Auth)
```
POST   /api/auth/sign-in
POST   /api/auth/sign-up
POST   /api/auth/sign-out
GET    /api/auth/session
GET    /api/auth/google     → OAuth redirect
GET    /api/auth/apple      → OAuth redirect
```

---

## Frontend Changes

### New pages
| Page | Route | Auth required |
|------|-------|---------------|
| `LoginPage` | `/login` | No |
| `RegisterPage` | `/register` | No |
| `MyPlaysPage` | `/my-plays` | Yes |
| `SharePage` | `/share/:token` | No (read-only editor) |

### Existing page changes
- **HomePage:** Add "Giriş Yap" + "Play'lerim" to header
- **EditorPage:** Add "Kaydet" button → redirect to login if not auth'd; Add "Paylaş" button → copies share link to clipboard
- **App.tsx:** Add `ProtectedRoute` wrapper for `/my-plays`

### New state
```
src/store/useAuthStore.ts   → Zustand store: { user, loading, login, logout }
```

### UX flow
1. User can use the editor without logging in
2. Clicking "Kaydet" redirects to `/login` if not authenticated
3. After login, user is redirected back to editor and save completes
4. "Play'lerim" shows saved plays grid with edit/delete/share actions

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Hono (Node.js) |
| Auth | Better Auth |
| ORM | Drizzle |
| DB | Fly Postgres |
| Deploy | Fly.io (single app) |
| Session | HTTP-only cookie |
| Frontend | React + Zustand (unchanged) |

---

## SEO

- `<title>`: `SetPlay — Basketball Play Designer`
- `<meta name="description">`: `Free basketball play designer and coaching tool. Create, save, and share basketball plays online.`
- OG tags on share pages for link previews
