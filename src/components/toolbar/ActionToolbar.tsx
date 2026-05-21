import type { ActionType } from '../../models/types'
import { ACTION_COLORS } from '../../utils/actionColors'

interface ToolDef {
  type: ActionType
  label: string
  requiresBall: boolean
}

const TOOLS: ToolDef[] = [
  { type: 'pass',    label: 'Pass',    requiresBall: true  },
  { type: 'dribble', label: 'Dribble', requiresBall: true  },
  { type: 'cut',     label: 'Cut',     requiresBall: false },
  { type: 'screen',  label: 'Screen',  requiresBall: false },
  { type: 'shot',    label: 'Shot',    requiresBall: true  },
  { type: 'handoff', label: 'Handoff', requiresBall: true  },
]

const BASE = { viewBox: '0 0 32 14', width: 32, height: 14, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const ICONS: Record<ActionType, React.ReactNode> = {
  pass: (() => { const c = ACTION_COLORS.pass; return (
    <svg {...BASE}><line x1="2" y1="7" x2="20" y2="7" stroke={c} strokeWidth="1.5" strokeDasharray="3 2"/><polyline points="16,3 24,7 16,11" stroke={c} strokeWidth="1.5"/></svg>
  )})(),
  dribble: (() => { const c = ACTION_COLORS.dribble; return (
    <svg {...BASE}><path d="M2,7 C4,3 6,3 8,7 C10,11 12,11 14,7 C16,3 17,3 18,7" stroke={c} strokeWidth="1.5"/><polyline points="16,3 24,7 16,11" stroke={c} strokeWidth="1.5"/></svg>
  )})(),
  cut: (() => { const c = ACTION_COLORS.cut; return (
    <svg {...BASE}><line x1="2" y1="7" x2="20" y2="7" stroke={c} strokeWidth="1.5"/><polyline points="16,3 24,7 16,11" stroke={c} strokeWidth="1.5"/></svg>
  )})(),
  screen: (() => { const c = ACTION_COLORS.screen; return (
    <svg {...BASE}><line x1="2" y1="7" x2="21" y2="7" stroke={c} strokeWidth="1.5"/><line x1="21" y1="1" x2="21" y2="13" stroke={c} strokeWidth="3"/></svg>
  )})(),
  shot: (() => { const c = ACTION_COLORS.shot; return (
    <svg {...BASE}><path d="M2,13 Q14,2 26,11" stroke={c} strokeWidth="1.5" strokeDasharray="3 2"/><circle cx="28" cy="11" r="2.5" stroke={c} strokeWidth="1.5"/></svg>
  )})(),
  handoff: (() => { const c = ACTION_COLORS.handoff; return (
    <svg {...BASE}><line x1="2" y1="7" x2="18" y2="7" stroke={c} strokeWidth="1.5"/><line x1="20" y1="1" x2="20" y2="13" stroke={c} strokeWidth="1.5"/><line x1="25" y1="1" x2="25" y2="13" stroke={c} strokeWidth="1.5"/></svg>
  )})(),
}

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
              ${active ? 'bg-slate-600 ring-1 ring-white/30' : ''}
              ${!active && !disabled ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : ''}
              ${disabled ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-500' : ''}
            `}
          >
            {ICONS[t.type]}
            <span style={{ color: disabled ? undefined : ACTION_COLORS[t.type] }}>{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}
