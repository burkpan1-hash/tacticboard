import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import Logo from '../components/ui/Logo'
import UpgradeModal from '../components/ui/UpgradeModal'
import { authClient } from '../lib/authClient'
import { GUIDES_ENABLED } from '../config/features'

const FREE_PLAY_LIMIT = 10
const ADSENSE_CLIENT = 'ca-pub-6965917095403868'

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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)

  // Load AdSense script only on this content-rich page.
  // IMPORTANT: Auto Ads must be disabled in the AdSense console so that the
  // script does not inject ads on pages it has already loaded into (e.g. auth
  // pages reached via SPA navigation). window.adsbygoogle persists in memory
  // even after the script tag is removed, so console-level control is required.
  useEffect(() => {
    const existing = document.querySelector(`script[src*="${ADSENSE_CLIENT}"]`)
    if (existing) return  // script already in DOM; don't add a second copy
    const script = document.createElement('script')
    script.async = true
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`
    script.crossOrigin = 'anonymous'
    script.setAttribute('data-adsense-managed', 'true')
    document.head.appendChild(script)
    return () => { script.remove() }
  }, [])

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

  function handleNewPlay() {
    if (session && cloudPlays.length >= FREE_PLAY_LIMIT) {
      setShowUpgradeModal(true)
      return
    }
    navigate('/setup')
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {GUIDES_ENABLED && (
            <a href="/guides" className="text-slate-300 hover:text-orange-400 text-sm font-medium px-2 py-2 transition-colors">Guides</a>
          )}
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
              className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-4 py-2 rounded-lg transition-colors text-sm shadow-md shadow-orange-500/30"
            >
              {t('home.loginButton')}
            </button>
          )}
          <button
            onClick={handleNewPlay}
            className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
          >
            {t('home.newPlayButton')}
          </button>
        </div>
      </div>

      {!session && (
        <div className="mb-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              {t('home.landing.heroHeadline')}
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-6">
              {t('home.landing.heroSubtitle')}
            </p>
            <button
              onClick={handleNewPlay}
              className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-3 rounded-xl transition-colors text-base shadow-lg shadow-orange-500/30"
            >
              {t('home.landing.startFreeButton')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { title: t('home.landing.feature1Title'), desc: t('home.landing.feature1Desc') },
              { title: t('home.landing.feature2Title'), desc: t('home.landing.feature2Desc') },
              { title: t('home.landing.feature3Title'), desc: t('home.landing.feature3Desc') },
            ].map(f => (
              <div key={f.title} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
                <h2 className="text-white font-semibold text-sm mb-2">{f.title}</h2>
                <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-6 mb-6">
            <h2 className="text-white font-semibold text-sm mb-4">{t('home.landing.howTitle')}</h2>
            <ol className="space-y-2">
              {[t('home.landing.step1'), t('home.landing.step2'), t('home.landing.step3')].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-400 text-xs">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-6">
            <h2 className="text-white font-semibold text-sm mb-4">{t('home.landing.useCasesTitle')}</h2>
            <ul className="space-y-2">
              {[
                t('home.landing.useCase1'),
                t('home.landing.useCase2'),
                t('home.landing.useCase3'),
                t('home.landing.useCase4'),
                t('home.landing.useCase5'),
              ].map((uc, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-400 text-xs">
                  <span className="text-orange-400 shrink-0">→</span>
                  {uc}
                </li>
              ))}
            </ul>
            <p className="text-slate-500 text-xs mt-4 pt-4 border-t border-slate-700/40">
              {t('home.landing.freeTierNote')}
            </p>
          </div>
        </div>
      )}

      {session && cloudPlays.length === 0 && (
        <div className="text-center py-24 text-slate-400">
          <div className="text-5xl mb-4">🏀</div>
          <p className="text-lg">{t('home.emptyState')}</p>
        </div>
      )}

      {session && cloudPlays.length > 0 && (
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
              <div className="flex gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={() => handleShare(p.id)}
                  className="bg-orange-500 hover:bg-orange-400 text-white px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors"
                >
                  {copiedId === p.id ? t('home.copiedButton') : t('home.shareButton')}
                </button>
                <button
                  onClick={() => navigate(`/editor/${p.id}?cloud=1`)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors"
                >
                  {t('home.openButton')}
                </button>
                {confirmDeleteId === p.id ? (
                  <button
                    onClick={() => handleDelete(p.id)}
                    onBlur={() => setConfirmDeleteId(null)}
                    autoFocus
                    className="text-red-400 hover:text-red-300 bg-red-400/10 px-2 sm:px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
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

      {session && cloudPlays.length >= FREE_PLAY_LIMIT && (
        <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-between gap-4">
          <div>
            <p className="text-orange-400 font-semibold text-sm">You've reached the 10 play limit</p>
            <p className="text-slate-400 text-xs mt-0.5">Upgrade to Pro for unlimited saves and no ads.</p>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="shrink-0 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Upgrade →
          </button>
        </div>
      )}

      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}

      <footer className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 space-y-2">
        <div>
          {GUIDES_ENABLED && (
            <>
              <a href="/guides" className="hover:text-orange-400 transition-colors">Guides</a>
              <span className="mx-3">·</span>
            </>
          )}
          <a href="/pricing" className="hover:text-orange-400 transition-colors">Pricing</a>
          <span className="mx-3">·</span>
          <a href="/refund" className="hover:text-orange-400 transition-colors">Refunds</a>
          <span className="mx-3">·</span>
          <a href="/privacy" className="hover:text-orange-400 transition-colors">Privacy</a>
          <span className="mx-3">·</span>
          <a href="/terms" className="hover:text-orange-400 transition-colors">Terms</a>
          <span className="mx-3">·</span>
          <a href="mailto:support@basketballtacticboard.com" className="hover:text-orange-400 transition-colors">Support</a>
        </div>
        <div className="text-slate-600">support@basketballtacticboard.com</div>
      </footer>
    </div>
  )
}
