import { useState } from 'react'

interface Props {
  text: string | undefined
  onChange: (text: string) => void
}

export default function OptionBadge({ text, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(text ?? '')

  if (!editing && !text) {
    return (
      <button
        onClick={() => { setDraft(''); setEditing(true) }}
        className="text-xs text-orange-500 hover:text-orange-400 mt-1.5 flex items-center gap-1 transition-colors"
      >
        <span>◈</span> Add label
      </button>
    )
  }

  if (!editing) {
    return (
      <div className="mt-1.5 flex items-start gap-1.5">
        <div
          onClick={() => { setDraft(text ?? ''); setEditing(true) }}
          className="flex-1 text-xs text-orange-300 bg-orange-950/40 border border-orange-800/40 rounded px-2 py-1 cursor-pointer hover:bg-orange-950/60 transition-colors"
        >
          <span className="opacity-60 mr-1">◈</span>{text}
        </div>
        <button
          onClick={() => onChange('')}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors"
        >✕</button>
      </div>
    )
  }

  return (
    <div className="mt-1.5 flex gap-1">
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { onChange(draft); setEditing(false) }
          if (e.key === 'Escape') setEditing(false)
        }}
        onBlur={() => setEditing(false)}
        placeholder="e.g. If open, shoot — Enter to save"
        className="flex-1 text-xs bg-slate-700 text-white rounded px-2 py-1 outline-none focus:ring-1 focus:ring-orange-500 placeholder-slate-500"
      />
      <button
        onMouseDown={e => e.preventDefault()}
        onClick={() => { onChange(draft); setEditing(false) }}
        className="text-xs bg-orange-600 hover:bg-orange-500 text-white rounded px-2 transition-colors"
      >✓</button>
      <button
        onClick={() => setEditing(false)}
        className="text-xs text-slate-400 hover:text-white transition-colors"
      >✕</button>
    </div>
  )
}
