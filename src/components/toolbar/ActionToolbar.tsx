import type { ActionType } from '../../models/types'

interface ToolDef {
  type: ActionType
  label: string
  icon: string
  requiresBall: boolean
}

const TOOLS: ToolDef[] = [
  { type: 'pass',    label: 'Pas',     icon: '- - →',  requiresBall: true  },
  { type: 'dribble', label: 'Dribble', icon: '∿→',     requiresBall: true  },
  { type: 'cut',     label: 'Kesme',   icon: '→',       requiresBall: false },
  { type: 'screen',  label: 'Ekran',   icon: '—⊣',     requiresBall: false },
  { type: 'shot',    label: 'Şut',     icon: '---⊕',    requiresBall: true  },
  { type: 'handoff', label: 'Handoff', icon: '—╋╋',    requiresBall: true  },
]

interface Props {
  activeType: ActionType | null
  ballHolderId: string
  onSelect: (type: ActionType) => void
  onCancel: () => void
}

export default function ActionToolbar({ activeType, ballHolderId, onSelect, onCancel }: Props) {
  return (
    <div className="flex flex-col gap-2 p-2 bg-slate-800 rounded-xl border border-slate-700">
      {TOOLS.map(t => {
        const disabled = t.requiresBall && !ballHolderId
        const active = activeType === t.type
        return (
          <button
            key={t.type}
            title={t.label}
            disabled={disabled}
            onClick={() => active ? onCancel() : onSelect(t.type)}
            className={`
              flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors
              ${active ? 'bg-orange-500 text-white' : ''}
              ${!active && !disabled ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : ''}
              ${disabled ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-500' : ''}
            `}
          >
            <span className="font-mono text-base leading-none">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}
