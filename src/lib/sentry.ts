import * as Sentry from '@sentry/react'
import { scrubUrl } from './scrubUrl'

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
 *
 * URL scrubbing: verify-email and reset-password links carry single-use tokens
 * in the query string. We rewrite those out of every event/breadcrumb/transaction
 * before it leaves the browser so the Sentry dashboard never sees them.
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Sample 10% of normal transactions in prod, 100% in dev.
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    integrations: [Sentry.browserTracingIntegration()],
    sendDefaultPii: false,

    beforeSend(event) {
      if (event.request?.url) event.request.url = scrubUrl(event.request.url)
      if (event.transaction) event.transaction = scrubUrl(event.transaction)
      return event
    },
    beforeSendTransaction(event) {
      if (event.request?.url) event.request.url = scrubUrl(event.request.url)
      if (event.transaction) event.transaction = scrubUrl(event.transaction)
      return event
    },
    beforeBreadcrumb(crumb) {
      if (crumb.data && typeof crumb.data.url === 'string') {
        crumb.data.url = scrubUrl(crumb.data.url)
      }
      // The "navigation" breadcrumb stores 'from' and 'to' as raw URLs/paths.
      if (crumb.category === 'navigation' && crumb.data) {
        if (typeof crumb.data.from === 'string') crumb.data.from = scrubUrl(crumb.data.from)
        if (typeof crumb.data.to === 'string') crumb.data.to = scrubUrl(crumb.data.to)
      }
      return crumb
    },
  })
}

/** Attach the signed-in user to subsequent error reports. Call after login. */
export function setSentryUser(email: string | null) {
  if (!import.meta.env.VITE_SENTRY_DSN) return
  Sentry.setUser(email ? { email } : null)
}

export const SentryErrorBoundary = Sentry.ErrorBoundary
