import posthog from 'posthog-js'
import { getConsent, onConsentChange } from '../components/ui/CookieConsentBanner'
import { scrubUrl } from './scrubUrl'

// Properties that PostHog auto-captures and may carry sensitive query tokens.
const URL_PROPS = ['$current_url', '$pathname', '$referrer', '$initial_referrer', '$initial_current_url']

/**
 * Initialize PostHog analytics if a key is provided via VITE_POSTHOG_KEY.
 *
 * Gated on cookie consent: PostHog only loads after the user clicks "Accept"
 * in CookieConsentBanner. If consent is already granted on page load, init
 * immediately; otherwise listen for the consent-changed event.
 *
 * Once the user signs up at posthog.com:
 *   1. Create a project (Web)
 *   2. Copy the Project API Key from project settings
 *   3. Add to .env.local: VITE_POSTHOG_KEY=phc_...
 *   4. (Optional) VITE_POSTHOG_HOST=https://eu.i.posthog.com if using EU cloud
 *   5. For prod: `fly secrets set VITE_POSTHOG_KEY=phc_...` (then redeploy)
 */
let initialized = false

function actuallyInit() {
  if (initialized) return
  const key = import.meta.env.VITE_POSTHOG_KEY
  if (!key) return
  const host = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'

  posthog.init(key, {
    api_host: host,
    // We're gating on cookie consent ourselves; don't have PostHog show its own modal.
    persistence: 'localStorage+cookie',
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    // Strip sensitive query params (?token=, ?code=, etc) from any URL property
    // before the event leaves the browser — keeps reset/verify tokens out of analytics.
    sanitize_properties: (properties) => {
      for (const k of URL_PROPS) {
        const v = properties[k]
        if (typeof v === 'string') properties[k] = scrubUrl(v)
      }
      return properties
    },
  })
  initialized = true
}

export function initAnalytics() {
  if (!import.meta.env.VITE_POSTHOG_KEY) return

  // If consent already accepted (returning user), init now.
  if (getConsent() === 'accepted') {
    actuallyInit()
    return
  }
  // Otherwise wait for the user to accept; opt-out flow leaves PostHog uninitialized.
  onConsentChange((state) => {
    if (state === 'accepted') actuallyInit()
  })
}

/** Track a named event. No-op if PostHog isn't initialized. */
export function track(event: string, properties?: Record<string, unknown>) {
  if (!initialized) return
  posthog.capture(event, properties)
}

/** Identify the signed-in user. Call after login. */
export function identifyUser(email: string | null) {
  if (!initialized) return
  if (email) posthog.identify(email)
  else posthog.reset()
}
