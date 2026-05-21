import { useState } from 'react'
import OptionBadge from './OptionBadge'
import type { Action, Player } from '../../models/types'
import { ACTION_COLORS } from '../../utils/actionColors'

const ACTION_LABELS: Record<string, string> = {
  pass: 'Pass', dribble: 'Dribble', cut: 'Cut',
  screen: 'Screen', shot: 'Shot', handoff: 'Handoff',
}

function describeAction(action: Action, players: Player[]): string {
  const num = (id: string) => players.find(p => p.id === id)?.number ?? '?'
  switch (action.type) {
    case 'pass':    return `#${num(action.fromId)} → #${num(action.toId)}`
    case 'dribble': return `#${num(action.playerId)}`
    case 'cut':     return `#${num(action.playerId)}`
    case 'screen':  return `#${num(action.screenerId)}`
    case 'shot':    return `#${num(action.shooterId)}`
    case 'handoff': return `#${num(action.fromId)} → #${num(action.toId)}`
  }
}

interface Props {
  index: number
  action: Action
  players: Player[]
  isActive: boolean
  onClick: () => void
  onDelete: () => void
  onOptionTextChange: (text: string) => void
}

export default function ActionCard({
  index, action, players, isActive,
  onClick, onDelete, onOptionTextChange,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div
      className={`rounded-lg border-l-4 cursor-pointer transition-colors ${isActive ? 'bg-slate-600' : 'bg-slate-700/60 hover:bg-slate-700'}`}
      style={{ borderLeftColor: ACTION_COLORS[action.type] }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-medium" style={{ color: ACTION_COLORS[action.type] }}>
          <span className="text-slate-400 text-xs mr-2">{index + 1}.</span>
          {ACTION_LABELS[action.type]}
          <span className="text-slate-400 font-normal ml-1 text-xs">{describeAction(action, players)}</span>
        </span>

        {!confirmDelete ? (
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <button onClick={() => setConfirmDelete(true)} title="Sil"
              className="text-slate-400 hover:text-red-400 text-sm px-1 transition-colors">✕</button>
          </div>
        ) : (
          <div className="flex gap-1 items-center" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-red-300">Sure?</span>
            <button onClick={onDelete}
              className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-0.5 rounded transition-colors">Yes</button>
            <button onClick={() => setConfirmDelete(false)}
              className="text-xs text-slate-400 hover:text-white transition-colors">No</button>
          </div>
        )}
      </div>

      {action.optionText && !isActive && (
        <div className="px-3 pb-2" onClick={e => e.stopPropagation()}>
          <span className="text-xs text-orange-300/70"><span className="opacity-60 mr-1">◈</span>{action.optionText}</span>
        </div>
      )}

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
