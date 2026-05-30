import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import Logo from '../components/ui/Logo'
import { authClient } from '../lib/authClient'

interface CloudPlay {
  id: string
  title: string
  updatedAt: string
  data?: { name?: string; courtType?: string; actions?: unknown[] }
}

export default function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const [cloudPlays, setCloudPlays] = useState<CloudPlay[]>([])
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!session) { setCloudPlays([]); return }

    const pending = sessionStorage.getItem('setplay_pending')
    const savePending: Promise<unknown> = pending
      ? (() => {
          sessionStorage.removeItem('setplay_pending')
          try {
            const play = JSON.parse(pending)
            return fetch('/api/plays', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: play.name, data: play }),
            })
          } catch { return Promise.resolve() }
        })()
      : Promise.resolve()

    savePending
      .then(() => fetch('/api/plays'))
      .then(r => r.ok ? r.json() : [])
      .then(setCloudPlays)
      .catch(() => setCloudPlays([]))
  }, [session])

  async function handleDelete(id: string) {
    await fetch(`/api/plays/${id}`, { method: 'DELETE' })
    setCloudPlays(prev => prev.filter(p => p.id !== id))
    setConfirmDeleteId(null)
  }

  async function handleShare(id: string) {
    const res = await fetch(`/api/plays/${id}/share`, { method: 'POST' })
    if (!res.ok) return
    const { shareToken } = await res.json()
    await navigator.clipboard.writeText(`${window.location.origin}/share/${shareToken}`)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function startEditing(id: string, currentTitle: string) {
    setEditingId(id)
    setEditingTitle(currentTitle)
    setTimeout(() => editInputRef.current?.select(), 0)
  }

  async function commitEdit(id: string) {
    const trimmed = editingTitle.trim()
    setEditingId(null)
    if (!trimmed) return
    // Sync data.name with title so reopening the play in the editor sees the new name
    // (the editor uses data.name as a fallback when title isn't available)
    const current = cloudPlays.find(p => p.id === id)
    const nextData = current?.data ? { ...current.data, name: trimmed } : undefined
    setCloudPlays(prev => prev.map(p => p.id === id ? { ...p, title: trimmed, data: nextData ?? p.data } : p))
    await fetch(`/api/plays/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: trimmed, ...(nextData ? { data: nextData } : {}) }),
    })
  }

  async function handleLogout() {
    await authClient.signOut()
    setCloudPlays([])
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Logo />
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {session ? (
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-slate-300 text-sm px-2 py-2 transition-colors"
            >
              {t('home.logoutButton')}
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            >
              {t('home.loginButton')}
            </button>
          )}
          <button
            onClick={() => navigate('/setup')}
            className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            {t('home.newPlayButton')}
          </button>
        </div>
      </div>

      {cloudPlays.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <div className="text-5xl mb-4">🏀</div>
          <p className="text-lg">{t('home.emptyState')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cloudPlays.map((p) => (
            <div key={p.id} className="bg-slate-800 rounded-xl p-5 flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                {editingId === p.id ? (
                  <input
                    ref={editInputRef}
                    value={editingTitle}
                    onChange={e => setEditingTitle(e.target.value)}
                    onBlur={() => commitEdit(p.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitEdit(p.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="w-full bg-slate-700 text-white font-semibold rounded px-2 py-0.5 outline-none focus:ring-2 focus:ring-orange-500 text-base"
                  />
                ) : (
                  <p
                    className="font-semibold text-white truncate cursor-text hover:text-orange-300 transition-colors"
                    onClick={() => startEditing(p.id, p.title)}
                    title={t('home.renameTitleTooltip')}
                  >{p.title}</p>
                )}
                <p className="text-sm text-slate-400 mt-1">
                  {p.data?.courtType === 'half' ? t('common.halfCourt') : t('common.fullCourt')}
                  {' · '}
                  {p.data?.actions?.length ?? 0} {(p.data?.actions?.length ?? 0) === 1 ? t('common.actionSingular') : t('common.actionPlural')}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleShare(p.id)}
                  className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {copiedId === p.id ? t('home.copiedButton') : t('home.shareButton')}
                </button>
                <button
                  onClick={() => navigate(`/editor/${p.id}?cloud=1`)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {t('home.openButton')}
                </button>
                {confirmDeleteId === p.id ? (
                  <button
                    onClick={() => handleDelete(p.id)}
                    onBlur={() => setConfirmDeleteId(null)}
                    autoFocus
                    className="text-red-400 hover:text-red-300 bg-red-400/10 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                  >
                    {t('home.deleteConfirmation')}
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(p.id)}
                    className="text-slate-400 hover:text-red-400 px-2 py-2 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
