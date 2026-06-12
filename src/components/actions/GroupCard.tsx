import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Action, ActionGroup, Player } from '../../models/types'
import { ACTION_COLORS } from '../../utils/actionColors'
import OptionBadge from './OptionBadge'

const ACTION_LABELS: Record<string, string> = {
  pass: 'Pass', dribble: 'Dribble', cut: 'Cut',
  screen: 'Screen', shot: 'Shot', handoff: 'Handoff', 'defense-move': 'Move',
  'double-team': 'Double', 'ball-force': 'Force',
}

function describeSimple(action: Action, players: Player[]): string {
  const num = (id: string) => players.find(p => p.id === id)?.number ?? '?'
  switch (action.type) {
    case 'pass':         return `#${num(action.fromId)} → #${num(action.toId)}`
    case 'dribble':      return `#${num(action.playerId)}`
    case 'cut':          return `#${num(action.playerId)}`
    case 'screen':       return `#${num(action.screenerId)}`
    case 'shot':         return `#${num(action.shooterId)}`
    case 'handoff':      return `#${num(action.fromId)} → #${num(action.toId)}`
    case 'defense-move': return `#${num(action.playerId)}`
    case 'double-team':  return `#${num(action.defender1Id)} + #${num(action.defender2Id)}`
    case 'ball-force':   return `#${num(action.defenderId)}`
  }
}

interface Props {
  stepNum: number
  group: ActionGroup
  players: Player[]
  isActive: boolean
  onClick: () => void
  onUngroup: () => void
  onNameChange: (name: string) => void
  onOptionTextChange: (text: string) => void
}

export default function GroupCard({
  stepNum, group, players, isActive,
  onClick, onUngroup, onNameChange, onOptionTextChange,
}: Props) {
  const { t } = useTranslation()
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(group.name ?? '')

  const title = group.name || t('actionPanel.groupCard.title')

  function commitName() {
    setEditingName(false)
    onNameChange(nameDraft)
  }

  return (
    <div
      className={`rounded-lg border cursor-pointer transition-colors ${
        isActive
          ? 'border-amber-400 bg-slate-700/80'
          : 'border-amber-500/50 bg-slate-800/80 hover:border-amber-400/70'
      }`}
      onClick={onClick}
    >
      {/* Group header */}
      <div className="flex items-center justify-between px-3 py-2 rounded-t-lg bg-amber-900/20">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="text-slate-400 text-xs shrink-0">{stepNum}.</span>
          {editingName ? (
            <input
              autoFocus
              value={nameDraft}
              onChange={e => setNameDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') commitName()
                if (e.key === 'Escape') { setEditingName(false); setNameDraft(group.name ?? '') }
              }}
              onBlur={commitName}
              onClick={e => e.stopPropagation()}
              placeholder={t('actionPanel.groupCard.namePlaceholder')}
              className="flex-1 min-w-0 text-xs bg-slate-700 text-amber-200 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-amber-500 placeholder-slate-500"
            />
          ) : (
            <span
              className="text-xs font-semibold text-amber-300 truncate hover:text-amber-200 transition-colors"
              onClick={e => { e.stopPropagation(); setEditingName(true); setNameDraft(group.name ?? '') }}
              title={t('home.renameTitleTooltip')}
            >
              {title}
              <span className="text-amber-600 font-normal ml-1.5">({group.actions.length})</span>
            </span>
          )}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onUngroup() }}
          className="text-[10px] text-slate-500 hover:text-red-400 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-700 shrink-0 ml-1"
        >
          {t('actionPanel.groupCard.ungroup')}
        </button>
      </div>

      {/* Actions inside the group */}
      <div className="mx-2 mt-1 border-l-2 border-amber-500/40 pl-2 flex flex-col gap-1">
        {group.actions.map(action => (
          <div
            key={action.id}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-700/50 text-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ACTION_COLORS[action.type] }} />
            <span style={{ color: ACTION_COLORS[action.type] }} className="font-medium">
              {ACTION_LABELS[action.type]}
            </span>
            <span className="text-slate-400">{describeSimple(action, players)}</span>
          </div>
        ))}
        {group.actions.length === 0 && (
          <span className="text-slate-500 text-xs px-2 py-1 italic">Henüz hareket yok…</span>
        )}
      </div>

      {/* Option badge */}
      {isActive && (
        <div className="px-3 pb-2 pt-1.5 border-t border-slate-700/50 mt-1" onClick={e => e.stopPropagation()}>
          <OptionBadge text={group.optionText} onChange={onOptionTextChange} />
        </div>
      )}
      {group.optionText && !isActive && (
        <div className="px-3 pb-2 pt-0.5">
          <span className="text-xs text-orange-300/70"><span className="opacity-60 mr-1">◈</span>{group.optionText}</span>
        </div>
      )}
    </div>
  )
}
