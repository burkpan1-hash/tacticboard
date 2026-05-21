import { usePlayStore } from '../../store/usePlayStore'

export default function PlaybackControls() {
  const {
    activeSet, activeStep, setActiveStep, undoLastAction,
    isPlaying, playbackSpeed, setIsPlaying, setPlaybackSpeed,
  } = usePlayStore()

  const total = activeSet?.actions.length ?? 0

  function stepTo(n: number) {
    setIsPlaying(false)
    setActiveStep(n)
  }

  function togglePlay() {
    if (isPlaying) { setIsPlaying(false); return }
    if (activeStep >= total) { setActiveStep(0); setIsPlaying(true); return }
    setIsPlaying(true)
  }

  const SPEEDS = [0.5, 1, 1.5, 2]

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800 border-t border-slate-700">
      <button
        onClick={() => stepTo(0)}
        disabled={activeStep === 0 || isPlaying}
        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-30 transition-colors"
        title="Go to start"
      >⏮</button>

      <button
        onClick={() => stepTo(Math.max(0, activeStep - 1))}
        disabled={activeStep === 0 || isPlaying}
        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-30 transition-colors"
      >◀</button>

      <button
        onClick={togglePlay}
        disabled={total === 0}
        className="px-3 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-30 transition-colors text-base leading-none"
        title={isPlaying ? 'Pause' : 'Play'}
      >{isPlaying ? '⏸' : '▶'}</button>

      <button
        onClick={() => stepTo(Math.min(total, activeStep + 1))}
        disabled={activeStep === total || isPlaying}
        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-30 transition-colors"
      >▶</button>

      <button
        onClick={() => stepTo(total)}
        disabled={activeStep === total || isPlaying}
        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-30 transition-colors"
        title="Go to end"
      >⏭</button>

      <span className="text-sm text-slate-400 min-w-[72px] text-center">
        {activeStep} / {total}
      </span>

      <div className="flex items-center gap-1 ml-2">
        {SPEEDS.map(s => (
          <button
            key={s}
            onClick={() => setPlaybackSpeed(s)}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              playbackSpeed === s
                ? 'bg-orange-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >{s}×</button>
        ))}
      </div>

      <div className="flex-1" />

      <button
        onClick={undoLastAction}
        disabled={total === 0 || isPlaying}
        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm disabled:opacity-30 transition-colors"
        title="Undo (Ctrl+Z)"
      >↩ Undo</button>
    </div>
  )
}
