// Thin email transport layer. Real send via Resend when RESEND_API_KEY is set; otherwise
// the email is logged to the console so dev flows work without provider setup.

import { Resend } from 'resend'

const FROM = process.env.EMAIL_FROM || 'Basketball Tactic Board <onboarding@resend.dev>'
const APP_NAME = 'Basketball Tactic Board'

if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('RESEND_API_KEY is required in production — set it via: flyctl secrets set RESEND_API_KEY=re_...')
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

type SendArgs = { to: string; subject: string; html: string; text: string }

export async function sendMail({ to, subject, html, text }: SendArgs): Promise<void> {
  if (!resend) {
    // Dev/staging fallback — print the message so flows can be exercised without a provider.
    // Never reached in production (guarded above at module load).
    console.log('\n=== EMAIL (dev fallback — no RESEND_API_KEY set) ===')
    console.log('To:     ', to)
    console.log('Subject:', subject)
    console.log('Body:\n', text)
    console.log('=====================================================\n')
    return
  }
  const { error } = await resend.emails.send({ from: FROM, to, subject, html, text })
  if (error) throw new Error(`Resend send failed: ${error.message}`)
}

// ── Templates ───────────────────────────────────────────────────────────────

function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#f1f5f9;padding:32px;margin:0;">
    <div style="max-width:480px;margin:0 auto;background:#1e293b;border-radius:16px;padding:32px;">
      <h1 style="color:#fb923c;margin:0 0 16px;font-size:24px;">${APP_NAME} 🏀</h1>
      <h2 style="margin:0 0 16px;font-size:18px;">${title}</h2>
      ${body}
      <p style="color:#64748b;font-size:12px;margin-top:32px;border-top:1px solid #334155;padding-top:16px;">
        You're receiving this because someone (hopefully you) requested it on ${APP_NAME}.
        If it wasn't you, ignore this email.
      </p>
    </div></body></html>`
}

export function verificationEmail(url: string) {
  const text = `Welcome to ${APP_NAME}!\n\nClick the link below to verify your email:\n${url}\n\nIf you didn't sign up, ignore this email.`
  const html = shell('Verify your email', `
    <p>Welcome! Click the button below to confirm your email and finish setting up your account.</p>
    <p style="text-align:center;margin:24px 0;">
      <a href="${url}" style="background:#f97316;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Verify email</a>
    </p>
    <p style="color:#94a3b8;font-size:13px;">Or copy this link into your browser:<br><a href="${url}" style="color:#fb923c;word-break:break-all;">${url}</a></p>
  `)
  return { subject: `Verify your email — ${APP_NAME}`, html, text }
}

export function passwordResetEmail(url: string) {
  const text = `Someone requested a password reset for your ${APP_NAME} account.\n\nIf this was you, click:\n${url}\n\nThis link expires in 1 hour. If it wasn't you, ignore this email.`
  const html = shell('Reset your password', `
    <p>Click the button below to choose a new password. This link expires in 1 hour.</p>
    <p style="text-align:center;margin:24px 0;">
      <a href="${url}" style="background:#f97316;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Reset password</a>
    </p>
    <p style="color:#94a3b8;font-size:13px;">Or copy this link into your browser:<br><a href="${url}" style="color:#fb923c;word-break:break-all;">${url}</a></p>
  `)
  return { subject: `Reset your password — ${APP_NAME}`, html, text }
}
