import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authClient } from '../lib/authClient'
import { authErrorKey } from '../lib/authErrors'
import AuthShell from '../components/auth/AuthShell'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorKey, setErrorKey] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorKey(null)
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: '/reset-password',
    })
    setLoading(false)
    // Show success even on "user not found" — never leak account existence to attackers.
    if (error && error.status !== 404 && !/not.?found/i.test(error.message ?? '')) {
      setErrorKey(authErrorKey(error))
      return
    }
    setSent(true)
  }

  return (
    <AuthShell
      title={t('auth.forgotPasswordTitle')}
      subtitle={!sent ? t('auth.forgotPasswordIntro') : undefined}
      footer={
        <Link to="/login" className="text-orange-400 hover:text-orange-300">
          {t('auth.backToLogin')}
        </Link>
      }
    >
      {sent ? (
        <div className="text-center">
          <div className="text-emerald-400 text-2xl mb-2">✉️</div>
          <p className="text-slate-200">{t('auth.forgotPasswordSent', { email })}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-slate-300 text-xs font-medium mb-1.5">{t('auth.emailLabel')}</label>
            <input
              id="email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          {errorKey && <p className="text-red-400 text-sm">{t(errorKey)}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? t('auth.sendResetLoading') : t('auth.sendResetButton')}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
