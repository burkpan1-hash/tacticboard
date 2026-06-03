// Maps Better Auth error codes / messages to i18n keys. The auth client returns errors
// of shape { code?: string; status?: number; message?: string }. We pick a key here so
// the consumer just renders t(authErrorKey(error)).

interface BetterAuthError {
  code?: string
  status?: number
  message?: string
}

export function authErrorKey(err: BetterAuthError | null | undefined): string {
  if (!err) return 'auth.errorGeneric'
  const msg = err.message ?? ''
  const code = err.code ?? ''

  // Rate-limited
  if (err.status === 429 || /rate.?limit|too many/i.test(msg)) return 'auth.errorRateLimited'

  // Email/password mismatch — Better Auth uses "Invalid email or password"
  if (/invalid (email|credentials|password)/i.test(msg) || /INVALID_(EMAIL_OR_PASSWORD|CREDENTIALS)/i.test(code)) {
    return 'auth.errorInvalidCredentials'
  }

  // Email already exists at signup
  if (/already (exists|registered)|USER_EXISTS|EMAIL_ALREADY/i.test(msg + code)) {
    return 'auth.errorEmailInUse'
  }

  // Unverified email block from our requireEmailVerification config
  if (/verif/i.test(msg) || /UNVERIFIED|EMAIL_NOT_VERIFIED/i.test(code)) {
    return 'auth.verifyEmailUnverified'
  }

  // Password policy violation surfaced from the server (auth.ts throws weakPassword:RULE)
  const weakMatch = msg.match(/weakPassword:(\w+)/)
  if (weakMatch) {
    const rule = weakMatch[1]
    return `auth.weak${rule.charAt(0).toUpperCase()}${rule.slice(1)}`
  }

  return 'auth.errorGeneric'
}
