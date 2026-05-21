import type { FormationPreset } from '../../utils/formations'
import { OFFENSE_FORMATIONS, DEFENSE_FORMATIONS } from '../../utils/formations'

interface Props {
  team: 'offense' | 'defense'
  onSelect: (formation: FormationPreset) => void
  selectedId?: string
  courtType?: 'half' | 'full'
}

export default function FormationPicker({ team, onSelect, selectedId, courtType }: Props) {
  const all = team === 'offense' ? OFFENSE_FORMATIONS : DEFENSE_FORMATIONS
  const formations = all.filter(f => !f.courtOnly || f.courtOnly === courtType)

  return (
    <div>
      <p className="text-sm text-slate-400 mb-3">
        {team === 'offense' ? 'Offense Formation' : 'Defense Formation'} — or place manually
      </p>
      <div className="grid grid-cols-3 gap-2">
        {formations.map((f) => (
          <button
            key={f.id}
            onClick={() => onSelect(f)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-colors border
              ${selectedId === f.id
                ? 'bg-orange-500 border-orange-400 text-white'
                : 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600'
              }
            `}
          >
            {f.name}
          </button>
        ))}
        <button
          onClick={() => onSelect({ id: 'custom', name: 'Custom', positions: {} })}
          className={`
            px-3 py-2 rounded-lg text-sm font-medium transition-colors border
            ${selectedId === 'custom'
              ? 'bg-slate-500 border-slate-400 text-white'
              : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
            }
          `}
        >
          Custom
        </button>
      </div>
    </div>
  )
}
