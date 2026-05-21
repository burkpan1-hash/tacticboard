import { useState } from 'react'
import type { ActionType } from '../../models/types'
import { ACTION_COLORS } from '../../utils/actionColors'

interface OffenseTool {
  type: ActionType
  label: string
  requiresBall: boolean
}

const OFFENSE_TOOLS: OffenseTool[] = [
  { type: 'pass',    label: 'Pass',    requiresBall: true  },
  { type: 'dribble', label: 'Dribble', requiresBall: true  },
  { type: 'cut',     label: 'Cut',     requiresBall: false },
  { type: 'screen',  label: 'Screen',  requiresBall: false },
  { type: 'shot',    label: 'Shot',    requiresBall: true  },
  { type: 'handoff', label: 'Handoff', requiresBall: true  },
]

const HINTS: Record<ActionType, string> = {
  pass:           'click receiver',
  dribble:        'click target',
  cut:            'player → spot',
  screen:         'player → spot',
  shot:           '1 click',
  handoff:        'receiver → spot',
  'defense-move': 'player → spot',
}

const BASE = { viewBox: '0 0 32 14', width: 32, height: 14, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const ICONS: Record<ActionType, React.ReactNode> = {
  pass: (() => { const c = ACTION_COLORS.pass; return (
    <svg {...BASE}><line x1="2" y1="7" x2="20" y2="7" stroke={c} strokeWidth="1.5" strokeDasharray="3 2"/><polyline points="16,3 24,7 16,11" stroke={c} strokeWidth="1.5"/></svg>
  )})(),
  dribble: (() => { const c = ACTION_COLORS.dribble; return (
    <svg {...BASE}><path d="M2,7 C4,2 7,2 9,7 C11,12 14,12 16,7 C18,2 20,2 21,7" stroke={c} strokeWidth="1.5"/><polyline points="18,3 28,7 18,11" stroke={c} strokeWidth="1.5"/></svg>
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
  'defense-move': (() => { const c = ACTION_COLORS['defense-move']; return (
    <svg {...BASE}><line x1="2" y1="7" x2="20" y2="7" stroke={c} strokeWidth="1.5"/><polyline points="16,3 24,7 16,11" stroke={c} strokeWidth="1.5"/></svg>
  )})(),
}

interface Props {
  activeType: ActionType | null
  ballHolderId: string
  onSelect: (type: ActionType) => void
  onCancel: () => void
  markingsEnabled: boolean
  onToggleMarkings: () => void
}

export default function ActionToolbar({ activeType, ballHolderId, onSelect, onCancel, markingsEnabled, onToggleMarkings }: Props) {
  const [activeTab, setActiveTab] = useState<'offense' | 'defense'>('offense')

  function handleTabChange(tab: 'offense' | 'defense') {
    setActiveTab(tab)
    onCancel()
  }

  return (
    <div className="flex flex-col gap-2 p-2 bg-slate-800 rounded-xl border border-slate-700">
      {/* Tab switcher */}
      <div className="flex rounded-lg overflow-hidden border border-slate-600 text-xs font-medium">
        <button
          onClick={() => handleTabChange('offense')}
          className={`flex-1 py-1 transition-colors ${activeTab === 'offense' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
        >
          ATK
        </button>
        <button
          onClick={() => handleTabChange('defense')}
          className={`flex-1 py-1 transition-colors ${activeTab === 'defense' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
        >
          DEF
        </button>
      </div>

      {activeTab === 'offense' && OFFENSE_TOOLS.map(t => {
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
            <span className="text-slate-500 text-[9px] leading-tight text-center">{HINTS[t.type]}</span>
          </button>
        )
      })}

      {activeTab === 'defense' && (
        <>
          {/* Hareket */}
          {(() => {
            const active = activeType === 'defense-move'
            const c = ACTION_COLORS['defense-move']
            return (
              <button
                onClick={() => active ? onCancel() : onSelect('defense-move')}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                  ${active ? 'bg-slate-600 ring-1 ring-white/30' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
              >
                {ICONS['defense-move']}
                <span style={{ color: c }}>Hareket</span>
                <span className="text-slate-500 text-[9px] leading-tight text-center">player → spot</span>
              </button>
            )
          })()}

          {/* Markaj toggle */}
          <div className="flex flex-col items-center gap-1.5 px-2 py-2 bg-slate-700 rounded-lg">
            <svg viewBox="0 0 32 14" width={32} height={14} fill="none" strokeLinecap="round">
              <circle cx="8" cy="7" r="5" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="2 2"/>
              <circle cx="24" cy="7" r="5" stroke="#f97316" strokeWidth="1.5"/>
              <line x1="13" y1="7" x2="19" y2="7" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="2 2"/>
            </svg>
            <span style={{ color: '#60a5fa' }} className="text-xs font-medium">Markaj</span>
            <button
              onClick={onToggleMarkings}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${markingsEnabled ? 'bg-blue-500' : 'bg-slate-600'}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${markingsEnabled ? 'left-6' : 'left-1'}`}
              />
            </button>
            <span className={`text-[9px] font-semibold ${markingsEnabled ? 'text-blue-400' : 'text-slate-500'}`}>
              {markingsEnabled ? 'ON' : 'OFF'}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
