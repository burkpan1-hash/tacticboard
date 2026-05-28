import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authClient } from '../lib/authClient'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await authClient.signIn.email({ email, password })
    if (error) {
      setError(error.message ?? 'Giriş başarısız')
      setLoading(false)
      return
    }
    navigate('/')
  }

  async function handleGoogle() {
    setError('')
    const { error } = await authClient.signIn.social({ provider: 'google', callbackURL: '/' })
    if (error) setError(error.message ?? 'Google ile giriş başarısız')
  }

  async function handleApple() {
    setError('')
    const { error } = await authClient.signIn.social({ provider: 'apple', callbackURL: '/' })
    if (error) setError(error.message ?? 'Apple ile giriş başarısız')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Giriş Yap</h1>

        <form onSubmit={handleEmailSignIn} className="space-y-4 mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="space-y-2">
          <button
            onClick={handleGoogle}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors text-sm font-medium"
          >
            Google ile Giriş Yap
          </button>
          <button
            onClick={handleApple}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors text-sm font-medium"
          >
            Apple ile Giriş Yap
          </button>
        </div>

        <p className="text-slate-400 text-sm text-center mt-6">
          Hesabın yok mu?{' '}
          <Link to="/register" className="text-orange-400 hover:text-orange-300">
            Kaydol
          </Link>
        </p>
      </div>
    </div>
  )
}
