import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authClient } from '../../lib/authClient'

interface UserButtonProps {
  onSignOut?: () => void
}

export default function UserButton({ onSignOut }: UserButtonProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()

  if (session) {
    return (
      <button
        onClick={async () => { await authClient.signOut(); onSignOut?.() }}
        className="text-slate-400 hover:text-slate-300 text-sm px-2 py-2 transition-colors"
      >
        {t('home.logoutButton')}
      </button>
    )
  }

  return (
    <button
      onClick={() => navigate('/login')}
      className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
    >
      {t('home.loginButton')}
    </button>
  )
}
