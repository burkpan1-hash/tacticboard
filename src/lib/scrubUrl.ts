/**
 * Strip sensitive query parameters from a URL before it gets sent to a
 * third-party observability service (Sentry, PostHog, etc.).
 *
 * Verify-email and password-reset links carry single-use tokens in the query
 * string — if those URLs flow through breadcrumbs or pageviews, anyone with
 * access to the observability dashboard can replay them. Strip them out before
 * the URL leaves the browser.
 */

const SENSITIVE_PARAMS = new Set([
  'token',
  'code',
  'state',
  'key',
  'access_token',
  'id_token',
  'refresh_token',
  'secret',
  'password',
  'api_key',
  'auth',
])

export function scrubUrl(input: string | undefined | null): string {
  if (!input) return input ?? ''
  try {
    // Support both absolute URLs and path-only inputs (e.g. '/reset-password?token=abc').
    const url = input.startsWith('http')
      ? new URL(input)
      : new URL(input, 'http://placeholder.invalid')
    let changed = false
    for (const key of Array.from(url.searchParams.keys())) {
      if (SENSITIVE_PARAMS.has(key.toLowerCase())) {
        url.searchParams.set(key, '[Filtered]')
        changed = true
      }
    }
    if (!changed) return input
    // Return path+query for relative inputs, full URL for absolute ones.
    if (input.startsWith('http')) return url.toString()
    return url.pathname + (url.search ? url.search : '') + (url.hash ? url.hash : '')
  } catch {
    // If URL parsing fails, return the original — better to leak a malformed URL
    // than to drop the breadcrumb entirely (which would hide a real issue).
    return input
  }
}
