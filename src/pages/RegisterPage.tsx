import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authClient } from '../lib/authClient'
import { authErrorKey } from '../lib/authErrors'
import { checkPassword } from '../lib/passwordPolicy'
import AuthShell from '../components/auth/AuthShell'
import PasswordInput from '../components/auth/PasswordInput'
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter'

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const policy = checkPassword(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Client-side guard — server enforces the same policy independently.
    if (!policy.ok) {
      setErrorKey(`auth.weak${policy.failedRule!.charAt(0).toUpperCase()}${policy.failedRule!.slice(1)}`)
      return
    }
    setLoading(true)
    setErrorKey(null)
    const { error } = await authClient.signUp.email({ name, email, password })
    if (error) {
      setErrorKey(authErrorKey(error))
      setLoading(false)
      return
    }
    // requireEmailVerification means no session is created; route to the inbox-check page.
    navigate(`/verify-email?email=${encodeURIComponent(email)}`)
  }

  return (
    <AuthShell
      title={t('auth.signUpTitle')}
      footer={
        <>
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-orange-400 hover:text-orange-300">
            {t('auth.signInLink')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-slate-300 text-xs font-medium mb-1.5">{t('auth.nameLabel')}</label>
          <input
            id="name"
            type="text"
            placeholder={t('auth.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            autoComplete="name"
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-slate-300 text-xs font-medium mb-1.5">{t('auth.emailLabel')}</label>
          <input
            id="email"
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-slate-300 text-xs font-medium mb-1.5">{t('auth.passwordLabel')}</label>
          <PasswordInput
            id="password"
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
          />
          <PasswordStrengthMeter password={password} />
        </div>

        {errorKey && <p className="text-red-400 text-sm">{t(errorKey)}</p>}

        <button
          type="submit"
          disabled={loading || !policy.ok}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {loading ? t('auth.signUpLoading') : t('auth.signUpButton')}
        </button>
      </form>
    </AuthShell>
  )
}
