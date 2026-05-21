import { useState } from 'react'
import OptionBadge from './OptionBadge'
import type { Action } from '../../models/types'

const ACTION_LABELS: Record<string, string> = {
  pass: 'Pas', dribble: 'Dribble', cut: 'Kesme',
  screen: 'Ekran', shot: 'Şut', handoff: 'Handoff',
}
const ACTION_COLORS: Record<string, string> = {
  pass: 'border-yellow-500', dribble: 'border-violet-500',
  cut: 'border-green-500', screen: 'border-blue-500',
  shot: 'border-red-500', handoff: 'border-orange-500',
}

interface Props {
  index: number
  action: Action
  isActive: boolean
  onClick: () => void
  onDelete: () => void
  onEdit: () => void
  onOptionTextChange: (text: string) => void
}

export default function ActionCard({
  index, action, isActive,
  onClick, onDelete, onEdit, onOptionTextChange,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div
      className={`
        rounded-lg border-l-4 cursor-pointer transition-colors
        ${ACTION_COLORS[action.type]}
        ${isActive ? 'bg-slate-600' : 'bg-slate-700/60 hover:bg-slate-700'}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-medium text-white">
          <span className="text-slate-400 text-xs mr-2">{index + 1}.</span>
          {ACTION_LABELS[action.type]}
        </span>

        {!confirmDelete ? (
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <button onClick={onEdit} title="Düzenle"
              className="text-slate-400 hover:text-white text-sm px-1 transition-colors">✏️</button>
            <button onClick={() => setConfirmDelete(true)} title="Sil"
              className="text-slate-400 hover:text-red-400 text-sm px-1 transition-colors">✕</button>
          </div>
        ) : (
          <div className="flex gap-1 items-center" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-red-300">Emin misin?</span>
            <button onClick={onDelete}
              className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-0.5 rounded transition-colors">Evet</button>
            <button onClick={() => setConfirmDelete(false)}
              className="text-xs text-slate-400 hover:text-white transition-colors">Hayır</button>
          </div>
        )}
      </div>

      {isActive && (
        <div className="px-3 pb-2 border-t border-slate-600/50" onClick={e => e.stopPropagation()}>
          <OptionBadge
            text={action.optionText}
            onChange={onOptionTextChange}
          />
        </div>
      )}
    </div>
  )
}
