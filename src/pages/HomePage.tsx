import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePlayStore } from '../store/usePlayStore'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'

export default function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { savedSets, deleteSet, saveSet, loadSetsFromStorage } = usePlayStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadSetsFromStorage() }, [loadSetsFromStorage])

  useEffect(() => {
    if (editingId) inputRef.current?.select()
  }, [editingId])

  function startEdit(id: string, name: string) {
    setEditingId(id)
    setEditingName(name)
  }

  function commitEdit(id: string) {
    const set = savedSets.find(s => s.id === id)
    if (set) saveSet({ ...set, name: editingName.trim() || set.name })
    setEditingId(null)
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">
          {t('home.appName')} <span className="text-orange-400">🏀</span>
        </h1>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={() => navigate('/setup')}
            className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            {t('home.newPlayButton')}
          </button>
        </div>
      </div>

      {savedSets.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <div className="text-5xl mb-4">🏀</div>
          <p className="text-lg">{t('home.emptyState')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {savedSets.map((s) => (
            <div key={s.id} className="bg-slate-800 rounded-xl p-5 flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                {editingId === s.id ? (
                  <input
                    ref={inputRef}
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => commitEdit(s.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit(s.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="bg-slate-700 text-white rounded px-2 py-0.5 outline-none focus:ring-2 focus:ring-orange-500 w-full font-semibold"
                  />
                ) : (
                  <p
                    className="font-semibold text-white truncate cursor-text hover:text-orange-300 transition-colors"
                    title={t('home.renameTooltip')}
                    onClick={() => startEdit(s.id, s.name)}
                  >
                    {s.name}
                  </p>
                )}
                <p className="text-sm text-slate-400 mt-1">
                  {s.courtType === 'half' ? t('common.halfCourt') : t('common.fullCourt')} · {s.actions.length} {s.actions.length === 1 ? t('common.actionSingular') : t('common.actionPlural')}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/editor/${s.id}`)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {t('home.openButton')}
                </button>
                {confirmDeleteId === s.id ? (
                  <button
                    onClick={() => { deleteSet(s.id); setConfirmDeleteId(null) }}
                    onBlur={() => setConfirmDeleteId(null)}
                    autoFocus
                    className="text-red-400 hover:text-red-300 bg-red-400/10 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                  >
                    {t('home.deleteConfirmation')}
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(s.id)}
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
