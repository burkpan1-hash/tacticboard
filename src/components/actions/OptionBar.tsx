import { useState } from 'react'
import { usePlayStore } from '../../store/usePlayStore'
import { primaryLabel } from '../../utils/optionLines'

// Pill/tab bar for a play's options (branching reads). The primary line is
// "Option 1"; "+ Option" branches off the primary line at the current step.
// Double-click a pill to rename it; the × on an option deletes it.
export default function OptionBar() {
  const { activeSet, activeOptionId, setActiveOption, addOption, renameOption, deleteOption, isPlaying } = usePlayStore()
  const [editingId, setEditingId] = useState<string | 'primary' | null>(null)
  const [draft, setDraft] = useState('')

  if (!activeSet || activeSet.actions.length === 0) return null

  const options = activeSet.options ?? []

  function startRename(id: string | 'primary', current: string) {
    setEditingId(id)
    setDraft(current)
  }
  function commitRename() {
    if (editingId === null) return
    renameOption(editingId === 'primary' ? null : editingId, draft)
    setEditingId(null)
  }

  const pillBase = 'shrink-0 flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border transition-colors'
  const activeCls = 'bg-orange-500/20 border-orange-500/60 text-orange-200'
  const idleCls = 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-400'

  function pill(id: string | null, label: string, editKey: string | 'primary') {
    const isActive = activeOptionId === id
    if (editingId === editKey) {
      return (
        <input
          key={editKey}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingId(null) }}
          className="shrink-0 w-32 text-xs px-2 py-1 rounded-md bg-slate-900 border border-orange-500/60 text-white outline-none"
        />
      )
    }
    return (
      <div key={editKey} className={`${pillBase} ${isActive ? activeCls : idleCls}`}>
        <button
          onClick={() => setActiveOption(id)}
          onDoubleClick={() => startRename(editKey, label)}
          title="Double-click to rename"
          className="max-w-[10rem] truncate"
        >
          {label}
        </button>
        {id !== null && (
          <button
            onClick={() => deleteOption(id)}
            title="Delete option"
            className="text-slate-500 hover:text-red-400 leading-none"
          >
            ×
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto pl-2 ml-1 border-l border-slate-700">
      <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-500 mr-0.5">Options</span>
      {pill(null, primaryLabel(activeSet), 'primary')}
      {options.map((o) => pill(o.id, o.name, o.id))}
      <button
        onClick={() => addOption()}
        disabled={isPlaying}
        title="Branch a new option at the current step"
        className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-md border border-dashed border-slate-600 text-slate-400 hover:text-orange-300 hover:border-orange-500/60 disabled:opacity-40 transition-colors"
      >
        + Option
      </button>
    </div>
  )
}
