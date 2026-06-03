import * as Sentry from '@sentry/react'

/**
 * Initialize Sentry if a DSN is provided via VITE_SENTRY_DSN.
 *
 * Without a DSN we no-op (so local dev and unconfigured deploys don't crash
 * and don't waste a Sentry quota). The DSN is read at build time by Vite — set
 * it in .env.local for dev or as a Fly secret for prod.
 *
 * Once the user signs up at sentry.io:
 *   1. Create a new project (platform: React)
 *   2. Copy the DSN shown on the setup page
 *   3. Add to .env.local: VITE_SENTRY_DSN=https://...@...sentry.io/...
 *   4. For prod: `fly secrets set VITE_SENTRY_DSN=https://...` (then redeploy)
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Sample 10% of normal transactions in prod, 100% in dev.
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    // Capture user actions (clicks, navigation) leading up to errors
    integrations: [Sentry.browserTracingIntegration()],
    // Don't send PII automatically — we'll attach user.email manually on auth.
    sendDefaultPii: false,
  })
}

/** Attach the signed-in user to subsequent error reports. Call after login. */
export function setSentryUser(email: string | null) {
  if (!import.meta.env.VITE_SENTRY_DSN) return
  Sentry.setUser(email ? { email } : null)
}

export const SentryErrorBoundary = Sentry.ErrorBoundary
