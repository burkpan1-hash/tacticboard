// Password policy — same rules enforced on client (live feedback) and server (auth.ts).
// Keep this file dependency-free so the server can import it directly.

export const PASSWORD_MIN = 8
export const PASSWORD_MAX = 72  // bcrypt's hard limit

export type PolicyCheck = {
  ok: boolean
  // Which named rule failed first — used by i18n to show the user a clear next step.
  failedRule?: 'tooShort' | 'tooLong' | 'noUpper' | 'noLower' | 'noDigit' | 'common'
}

// Tiny list of the most-tried passwords. Catches the obvious mistakes without bloating bundle.
const COMMON = new Set([
  'password', 'password1', 'password123', '12345678', '123456789', '1234567890',
  'qwerty', 'qwerty123', 'abc12345', 'iloveyou', 'admin123', 'letmein1',
  'welcome1', 'monkey12', 'football', 'basketball', 'master12', 'starwars',
  'football1', 'changeme', 'baseball1', 'shadow12',
])

export function checkPassword(pw: string): PolicyCheck {
  if (pw.length < PASSWORD_MIN) return { ok: false, failedRule: 'tooShort' }
  if (pw.length > PASSWORD_MAX) return { ok: false, failedRule: 'tooLong' }
  if (!/[A-Z]/.test(pw))        return { ok: false, failedRule: 'noUpper' }
  if (!/[a-z]/.test(pw))        return { ok: false, failedRule: 'noLower' }
  if (!/\d/.test(pw))           return { ok: false, failedRule: 'noDigit' }
  if (COMMON.has(pw.toLowerCase())) return { ok: false, failedRule: 'common' }
  return { ok: true }
}

// 0–4 strength score for the inline meter. Independent of policy pass/fail so users can
// see "your 12-char password is strong" even mid-typing before all rules are satisfied.
export function passwordStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8)  score++
  if (pw.length >= 12) score++
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(re => re.test(pw)).length
  if (classes >= 2) score++
  if (classes >= 4) score++
  return Math.min(4, score) as 0 | 1 | 2 | 3 | 4
}
