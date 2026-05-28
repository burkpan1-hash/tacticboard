import { useTranslation } from 'react-i18next'
import type { ActionType } from '../../models/types'
import { ACTION_COLORS, ACTION_LABEL_KEYS } from '../../utils/actionColors'

interface OffenseTool {
  type: ActionType
  requiresBall: boolean
}

const OFFENSE_TOOLS: OffenseTool[] = [
  { type: 'pass',    requiresBall: true  },
  { type: 'dribble', requiresBall: true  },
  { type: 'cut',     requiresBall: false },
  { type: 'screen',  requiresBall: false },
  { type: 'shot',    requiresBall: true  },
  { type: 'handoff', requiresBall: true  },
]

const HINT_KEYS: Record<ActionType, string> = {
  pass:           'toolbar.hints.pass',
  dribble:        'toolbar.hints.dribble',
  cut:            'toolbar.hints.cutScreen',
  screen:         'toolbar.hints.cutScreen',
  shot:           'toolbar.hints.shot',
  handoff:        'toolbar.hints.handoff',
  'defense-move': 'toolbar.hints.defenseMove',
  'double-team':  'toolbar.hints.doubleTeam',
  'ball-force':   'toolbar.hints.ballForce',
}

interface DefTool {
  type: ActionType
}
const DEF_TOOLS: DefTool[] = [
  { type: 'defense-move' },
  { type: 'double-team'  },
  { type: 'ball-force'   },
]

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
  'double-team': (() => { const c = ACTION_COLORS['double-team']; return (
    <svg {...BASE}><line x1="2" y1="3" x2="18" y2="7" stroke={c} strokeWidth="1.5"/><line x1="2" y1="11" x2="18" y2="7" stroke={c} strokeWidth="1.5"/><polyline points="14,3 24,7 14,11" stroke={c} strokeWidth="1.5"/></svg>
  )})(),
  'ball-force': (() => { const c = ACTION_COLORS['ball-force']; return (
    <svg {...BASE}><path d="M2,10 Q12,1 20,7" stroke={c} strokeWidth="1.5" fill="none"/><polyline points="16,3 24,7 16,11" stroke={c} strokeWidth="1.5"/></svg>
  )})(),
}

interface Props {
  activeType: ActionType | null
  ballHolderId: string
  hasDefenders: boolean
  onSelect: (type: ActionType) => void
  onCancel: () => void
  markingsEnabled: boolean
  onToggleMarkings: () => void
  gameOver?: boolean
}

export default function ActionToolbar({ activeType, ballHolderId, hasDefenders, onSelect, onCancel, markingsEnabled, onToggleMarkings, gameOver }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-2 p-2 bg-slate-800 rounded-xl border border-slate-700">

      {gameOver && (
        <div className="flex flex-col items-center gap-1 px-2 py-2 bg-slate-700/60 rounded-lg border border-slate-600">
          <span className="text-[9px] text-orange-400 font-bold tracking-wide text-center leading-tight">{t('toolbar.shotTaken')}</span>
          <span className="text-[8px] text-slate-500 text-center leading-tight">{t('toolbar.playEnded')}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">

        {/* ATK column */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] text-orange-400 font-semibold px-1 tracking-wide">{t('toolbar.offenseHeader')}</div>
          {OFFENSE_TOOLS.map(tool => {
            const disabled = gameOver || (tool.requiresBall && !ballHolderId)
            const active = activeType === tool.type
            return (
              <button
                key={tool.type}
                title={t(ACTION_LABEL_KEYS[tool.type])}
                disabled={disabled}
                onClick={() => active ? onCancel() : onSelect(tool.type)}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                  ${active ? 'bg-slate-600 ring-1 ring-white/30' : ''}
                  ${!active && !disabled ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : ''}
                  ${disabled ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-500' : ''}
                `}
              >
                {ICONS[tool.type]}
                <span style={{ color: disabled ? undefined : ACTION_COLORS[tool.type] }}>{t(ACTION_LABEL_KEYS[tool.type])}</span>
                <span className="text-slate-500 text-[9px] leading-tight text-center">{t(HINT_KEYS[tool.type])}</span>
              </button>
            )
          })}
        </div>

        {/* DEF column */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] text-blue-400 font-semibold px-1 tracking-wide">{t('toolbar.defenseHeader')}</div>

          {DEF_TOOLS.map(tool => {
            const disabled = !!gameOver || !hasDefenders
            const active = activeType === tool.type
            return (
              <button
                key={tool.type}
                title={t(ACTION_LABEL_KEYS[tool.type])}
                disabled={disabled}
                onClick={() => active ? onCancel() : onSelect(tool.type)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                  ${active ? 'bg-slate-600 ring-1 ring-white/30' : ''}
                  ${!active && !disabled ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : ''}
                  ${disabled ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-500' : ''}`}
              >
                {ICONS[tool.type]}
                <span style={{ color: ACTION_COLORS[tool.type] }}>{t(ACTION_LABEL_KEYS[tool.type])}</span>
                <span className="text-slate-500 text-[9px] leading-tight text-center">{t(HINT_KEYS[tool.type])}</span>
              </button>
            )
          })}

          <div className="flex flex-col items-center gap-1.5 px-2 py-2 bg-slate-700 rounded-lg">
            <svg viewBox="0 0 32 14" width={32} height={14} fill="none" strokeLinecap="round">
              <circle cx="8" cy="7" r="5" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="2 2"/>
              <circle cx="24" cy="7" r="5" stroke="#f97316" strokeWidth="1.5"/>
              <line x1="13" y1="7" x2="19" y2="7" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="2 2"/>
            </svg>
            <span style={{ color: '#60a5fa' }} className="text-xs font-medium">{t('toolbar.markingLabel')}</span>
            <button
              onClick={onToggleMarkings}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${markingsEnabled ? 'bg-blue-500' : 'bg-slate-600'}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${markingsEnabled ? 'left-6' : 'left-1'}`}
              />
            </button>
            <span className={`text-[9px] font-semibold ${markingsEnabled ? 'text-blue-400' : 'text-slate-500'}`}>
              {markingsEnabled ? t('toolbar.markingStateOn') : t('toolbar.markingStateOff')}
            </span>
          </div>
        </div>

      </div>

      {activeType && (
        <button
          onClick={onCancel}
          className="w-full py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-semibold transition-colors"
        >
          {t('toolbar.cancelButton')}
        </button>
      )}
    </div>
  )
}
