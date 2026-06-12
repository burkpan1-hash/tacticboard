import OptionBadge from './OptionBadge'
import type { Action, Player } from '../../models/types'
import { ACTION_COLORS } from '../../utils/actionColors'

const ACTION_LABELS: Record<string, string> = {
  pass: 'Pass', dribble: 'Dribble', cut: 'Cut',
  screen: 'Screen', shot: 'Shot', handoff: 'Handoff', 'defense-move': 'Move',
  'double-team': 'Double', 'ball-force': 'Force',
}

function describeAction(action: Action, players: Player[]): string {
  const num = (id: string) => players.find(p => p.id === id)?.number ?? '?'
  switch (action.type) {
    case 'pass':         return `#${num(action.fromId)} → #${num(action.toId)}`
    case 'dribble':      return `#${num(action.playerId)}`
    case 'cut':          return `#${num(action.playerId)}`
    case 'screen':       return `#${num(action.screenerId)}`
    case 'shot':         return `#${num(action.shooterId)}`
    case 'handoff':      return `#${num(action.fromId)} → #${num(action.toId)}`
    case 'defense-move': return `#${num(action.playerId)}`
    case 'double-team':  return `#${num(action.defender1Id)} + #${num(action.defender2Id)} → #${num(action.targetId)}`
    case 'ball-force':   return `#${num(action.defenderId)} → #${num(action.targetId)}`
  }
}

interface Props {
  stepNum: number
  action: Action
  players: Player[]
  isActive: boolean
  /** If true renders without step number — used for actions inside a group during selection mode */
  compact?: boolean
  /** If true renders a checkbox for selection mode */
  checked?: boolean
  onCheckChange?: (checked: boolean) => void
  onClick: () => void
  onOptionTextChange: (text: string) => void
}

export default function ActionCard({
  stepNum, action, players, isActive, compact,
  checked, onCheckChange,
  onClick, onOptionTextChange,
}: Props) {
  return (
    <div
      className={`rounded-lg border-l-4 cursor-pointer transition-colors ${isActive ? 'bg-slate-600' : 'bg-slate-700/60 hover:bg-slate-700'}`}
      style={{ borderLeftColor: ACTION_COLORS[action.type] }}
      onClick={onClick}
    >
      <div className="flex items-center px-3 py-2 gap-2">
        {onCheckChange !== undefined && (
          <input
            type="checkbox"
            checked={checked ?? false}
            onChange={e => { e.stopPropagation(); onCheckChange(e.target.checked) }}
            onClick={e => e.stopPropagation()}
            className="w-3.5 h-3.5 accent-violet-500 shrink-0 cursor-pointer"
          />
        )}
        <span className="text-sm font-medium flex-1" style={{ color: ACTION_COLORS[action.type] }}>
          {!compact && <span className="text-slate-400 text-xs mr-2">{stepNum}.</span>}
          {ACTION_LABELS[action.type]}
          <span className="text-slate-400 font-normal ml-1 text-xs">{describeAction(action, players)}</span>
        </span>
      </div>

      {action.optionText && !isActive && (
        <div className="px-3 pb-2">
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
