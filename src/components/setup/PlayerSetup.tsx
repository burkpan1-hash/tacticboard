interface Props {
  offenseCount: number
  defenseCount: number
  onChange: (offense: number, defense: number) => void
}

function CountSelector({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-slate-300 text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors"
        >−</button>
        <span className="text-2xl font-bold text-white w-6 text-center">{value}</span>
        <button
          onClick={() => onChange(Math.min(5, value + 1))}
          className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors"
        >+</button>
      </div>
    </div>
  )
}

export default function PlayerSetup({ offenseCount, defenseCount, onChange }: Props) {
  return (
    <div className="flex gap-10 justify-center">
      <CountSelector
        label="Offense 🟠"
        value={offenseCount}
        onChange={(v) => onChange(v, defenseCount)}
      />
      <CountSelector
        label="Defense 🔵"
        value={defenseCount}
        onChange={(v) => onChange(offenseCount, v)}
      />
    </div>
  )
}
