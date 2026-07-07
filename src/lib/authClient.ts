import { createAuthClient } from 'better-auth/react'

// This module is imported transitively by every page (App -> HomePage, etc.),
// so it also gets evaluated under Node during prerendering (see
// scripts/prerender.mjs) — `window` doesn't exist there. The fallback is never
// actually requested during prerendering; only real browser sessions call auth.
const baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://basketballtacticboard.com'

export const authClient = createAuthClient({
  baseURL: `${baseOrigin}/api/auth`,
})
