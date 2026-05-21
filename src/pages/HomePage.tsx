import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayStore } from '../store/usePlayStore'

export default function HomePage() {
  const navigate = useNavigate()
  const { savedSets, deleteSet, saveSet, loadSetsFromStorage } = usePlayStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
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
          SetPlay <span className="text-orange-400">🏀</span>
        </h1>
        <button
          onClick={() => navigate('/setup')}
          className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          + New Play
        </button>
      </div>

      {savedSets.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <div className="text-5xl mb-4">🏀</div>
          <p className="text-lg">No plays yet. Create your first!</p>
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
                    title="Click to rename"
                    onClick={() => startEdit(s.id, s.name)}
                  >
                    {s.name}
                  </p>
                )}
                <p className="text-sm text-slate-400 mt-1">
                  {s.courtType === 'half' ? 'Half Court' : 'Full Court'} · {s.actions.length} {s.actions.length === 1 ? 'action' : 'actions'}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/editor/${s.id}`)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Open
                </button>
                <button
                  onClick={() => { if (confirm('Are you sure you want to delete this play?')) deleteSet(s.id) }}
                  className="text-slate-400 hover:text-red-400 px-2 py-2 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
