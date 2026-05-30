import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authClient } from '../lib/authClient'
import { authErrorKey } from '../lib/authErrors'
import { checkPassword } from '../lib/passwordPolicy'
import AuthShell from '../components/auth/AuthShell'
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter'

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const policy = checkPassword(password)
  const matched = password === confirm

  if (!token) {
    return (
      <AuthShell
        title={t('auth.resetPasswordTitle')}
        footer={<Link to="/forgot-password" className="text-orange-400 hover:text-orange-300">{t('auth.forgotPasswordLink')}</Link>}
      >
        <p className="text-red-400 text-center">{t('auth.resetTokenInvalid')}</p>
      </AuthShell>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!policy.ok) {
      setErrorKey(`auth.weak${policy.failedRule!.charAt(0).toUpperCase()}${policy.failedRule!.slice(1)}`)
      return
    }
    if (!matched) {
      setErrorKey('auth.passwordMismatch')
      return
    }
    setLoading(true)
    setErrorKey(null)
    const { error } = await authClient.resetPassword({ newPassword: password, token })
    if (error) {
      // Better Auth surfaces expired/invalid tokens — show the targeted message rather than generic.
      const code = error.code ?? ''
      const msg = error.message ?? ''
      if (/token|expire|invalid/i.test(code + msg)) setErrorKey('auth.resetTokenInvalid')
      else setErrorKey(authErrorKey(error))
      setLoading(false)
      return
    }
    setDone(true)
    setTimeout(() => navigate('/login'), 1500)
  }

  return (
    <AuthShell
      title={t('auth.resetPasswordTitle')}
      subtitle={!done ? t('auth.resetPasswordIntro') : undefined}
      footer={
        <Link to="/login" className="text-orange-400 hover:text-orange-300">
          {t('auth.backToLogin')}
        </Link>
      }
    >
      {done ? (
        <div className="text-center">
          <div className="text-emerald-400 text-2xl mb-2">✓</div>
          <p className="text-slate-200">{t('auth.resetPasswordSuccess')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-slate-300 text-xs font-medium mb-1.5">{t('auth.newPasswordLabel')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              autoComplete="new-password"
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
            />
            <PasswordStrengthMeter password={password} />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-slate-300 text-xs font-medium mb-1.5">{t('auth.confirmPasswordLabel')}</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
            />
            {confirm && !matched && (
              <p className="text-orange-300 text-xs mt-1">{t('auth.passwordMismatch')}</p>
            )}
          </div>
          {errorKey && <p className="text-red-400 text-sm">{t(errorKey)}</p>}
          <button
            type="submit"
            disabled={loading || !policy.ok || !matched}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? t('auth.resetPasswordLoading') : t('auth.resetPasswordButton')}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
