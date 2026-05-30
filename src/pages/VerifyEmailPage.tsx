import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authClient } from '../lib/authClient'
import { authErrorKey } from '../lib/authErrors'
import AuthShell from '../components/auth/AuthShell'

const RESEND_COOLDOWN_SEC = 30

export default function VerifyEmailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''
  const status = params.get('status') // Better Auth callback appends ?status=success|error

  const [cooldown, setCooldown] = useState(0)
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [resentToast, setResentToast] = useState(false)

  // Tick down the resend cooldown so the user sees how long until they can ask again.
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  // If Better Auth's callback brought the user back with success, kick them home shortly.
  useEffect(() => {
    if (status === 'success') {
      const t = setTimeout(() => navigate('/'), 1500)
      return () => clearTimeout(t)
    }
  }, [status, navigate])

  async function handleResend() {
    if (!email || cooldown > 0) return
    setErrorKey(null)
    setResentToast(false)
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: '/verify-email?status=success',
    })
    if (error) {
      setErrorKey(authErrorKey(error))
      return
    }
    setResentToast(true)
    setCooldown(RESEND_COOLDOWN_SEC)
  }

  // Three states render different bodies inside the shared shell.
  let body
  if (status === 'success') {
    body = (
      <>
        <div className="text-center text-emerald-400 text-2xl mb-2">✓</div>
        <p className="text-slate-200 text-center">{t('auth.verifyEmailSuccess')}</p>
      </>
    )
  } else if (status === 'error') {
    body = (
      <>
        <p className="text-red-300 text-center mb-4">{t('auth.verifyEmailInvalid')}</p>
        {email && (
          <button
            onClick={handleResend}
            disabled={cooldown > 0}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {cooldown > 0
              ? t('auth.resendCooldown', { seconds: cooldown })
              : t('auth.resendVerificationButton')}
          </button>
        )}
      </>
    )
  } else {
    body = (
      <>
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          {t('auth.verifyEmailSent', { email: email || '…' })}
        </p>
        {resentToast && (
          <p className="text-emerald-400 text-sm mb-3">{t('auth.verifyEmailResent')}</p>
        )}
        {errorKey && <p className="text-red-400 text-sm mb-3">{t(errorKey)}</p>}
        <button
          onClick={handleResend}
          disabled={!email || cooldown > 0}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {cooldown > 0
            ? t('auth.resendCooldown', { seconds: cooldown })
            : t('auth.resendVerificationButton')}
        </button>
      </>
    )
  }

  return (
    <AuthShell
      title={t('auth.verifyEmailTitle')}
      footer={
        <Link to="/login" className="text-orange-400 hover:text-orange-300">
          {t('auth.backToLogin')}
        </Link>
      }
    >
      {body}
    </AuthShell>
  )
}
