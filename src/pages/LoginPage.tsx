import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authClient } from '../lib/authClient'
import { authErrorKey } from '../lib/authErrors'
import AuthShell from '../components/auth/AuthShell'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleEnabled, setGoogleEnabled] = useState(false)

  useEffect(() => {
    fetch('/api/auth-config')
      .then(r => r.ok ? r.json() : null)
      .then(cfg => { if (cfg) setGoogleEnabled(!!cfg.googleEnabled) })
      .catch(() => { /* config endpoint unreachable; just hide Google */ })
  }, [])

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorKey(null)
    setUnverifiedEmail(null)
    const { error } = await authClient.signIn.email({ email, password })
    if (error) {
      const key = authErrorKey(error)
      if (key === 'auth.verifyEmailUnverified') setUnverifiedEmail(email)
      else setErrorKey(key)
      setLoading(false)
      return
    }
    navigate('/')
  }

  async function handleGoogle() {
    setErrorKey(null)
    const { error } = await authClient.signIn.social({ provider: 'google', callbackURL: '/' })
    if (error) setErrorKey(authErrorKey(error))
  }

  return (
    <AuthShell
      title={t('auth.signInTitle')}
      footer={
        <>
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-orange-400 hover:text-orange-300">
            {t('auth.signUpLink')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleEmailSignIn} className="space-y-4">
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
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-slate-300 text-xs font-medium">{t('auth.passwordLabel')}</label>
            <Link to="/forgot-password" className="text-orange-400 hover:text-orange-300 text-xs">
              {t('auth.forgotPasswordLink')}
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {unverifiedEmail && (
          <div className="text-amber-300 text-sm bg-amber-900/30 border border-amber-700/40 rounded-lg p-3">
            {t('auth.verifyEmailUnverified')}{' '}
            <Link to={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`} className="text-amber-200 underline">
              {t('auth.resendVerificationButton')}
            </Link>
          </div>
        )}
        {errorKey && <p className="text-red-400 text-sm">{t(errorKey)}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {loading ? t('auth.signInLoading') : t('auth.signInButton')}
        </button>
      </form>

      {googleEnabled && (
        <>
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-slate-500 text-xs uppercase">or</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>
          <button
            onClick={handleGoogle}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            {t('auth.googleButton')}
          </button>
        </>
      )}
    </AuthShell>
  )
}
