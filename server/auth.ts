import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db/client'
import * as schema from './db/schema'
import { checkPassword, PASSWORD_MAX, PASSWORD_MIN } from '../src/lib/passwordPolicy'
import { passwordResetEmail, sendMail, verificationEmail } from './email'

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
  trustedOrigins: process.env.TRUSTED_ORIGINS
    ? process.env.TRUSTED_ORIGINS.split(',')
    : ['http://localhost:5173'],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: PASSWORD_MIN,
    maxPasswordLength: PASSWORD_MAX,
    // Block sign-in until the verification email is confirmed (Better Auth will surface this
    // as an error the client can recognize and route to the "check your inbox" page).
    requireEmailVerification: true,
    // Forgot-password flow: Better Auth generates a token and we email the reset link.
    sendResetPassword: async ({ user, url }) => {
      const tpl = passwordResetEmail(url)
      await sendMail({ to: user.email, ...tpl })
    },
    // Defense-in-depth: even though the client validates, also reject on the server.
    // Better Auth doesn't expose a custom-validator hook on minPasswordLength alone, so
    // we hash-time the policy check inside the password hashing override.
    password: {
      hash: async (password: string) => {
        const check = checkPassword(password)
        if (!check.ok) throw new Error(`weakPassword:${check.failedRule}`)
        // Fall through to Better Auth's default hashing by re-importing the built-in.
        const { hashPassword } = await import('better-auth/crypto')
        return hashPassword(password)
      },
      verify: async ({ hash, password }) => {
        const { verifyPassword } = await import('better-auth/crypto')
        return verifyPassword({ hash, password })
      },
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const tpl = verificationEmail(url)
      await sendMail({ to: user.email, ...tpl })
    },
  },

  // Rate limits: Better Auth's built-in limiter caps how often a given IP can hit auth
  // endpoints. Defaults are sensible; tighten the sensitive ones explicitly.
  rateLimit: {
    enabled: true,
    window: 60,        // 60-second window
    max: 30,           // 30 generic auth requests per window
    customRules: {
      '/sign-in/email':        { window: 900, max: 5 },   // 5 failed logins / 15min
      '/sign-up/email':        { window: 3600, max: 3 },  // 3 sign-ups / hour / IP
      '/forget-password':      { window: 3600, max: 3 },  // 3 reset requests / hour
      '/send-verification-email': { window: 3600, max: 3 },
    },
  },

  // Only register the social providers whose credentials are present. This avoids the
  // "missing clientId or clientSecret" warning on startup when running without OAuth set up
  // (e.g. local dev). Apple is currently not wired — add a clause here when ready.
  socialProviders: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {},
})

// Expose to the frontend whether Google OAuth is wired — so LoginPage can hide or
// disable the button cleanly when running without OAuth credentials.
export const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
