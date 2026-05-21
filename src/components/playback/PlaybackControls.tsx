import { usePlayStore } from '../../store/usePlayStore'

export default function PlaybackControls() {
  const { activeSet, activeStep, setActiveStep, undoLastAction } = usePlayStore()

  const total = activeSet?.actions.length ?? 0

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800 border-t border-slate-700">
      <button
        onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
        disabled={activeStep === 0}
        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-30 transition-colors"
      >◀</button>

      <span className="text-sm text-slate-400 min-w-[80px] text-center">
        {activeStep} / {total}
      </span>

      <button
        onClick={() => setActiveStep(Math.min(total, activeStep + 1))}
        disabled={activeStep === total}
        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-30 transition-colors"
      >▶</button>

      <div className="flex-1" />

      <button
        onClick={undoLastAction}
        disabled={total === 0}
        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm disabled:opacity-30 transition-colors"
        title="Undo (Ctrl+Z)"
      >↩ Undo</button>
    </div>
  )
}
