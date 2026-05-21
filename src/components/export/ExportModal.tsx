import { useEffect, useRef, useState } from 'react'
import type Konva from 'konva'
import { exportGif, exportVideo, downloadBlob } from '../../utils/exportAnimation'
import { usePlayStore } from '../../store/usePlayStore'

type Format = 'gif' | 'video'
type Phase = 'idle' | 'playing' | 'encoding' | 'done'

interface Props {
  stageRef: React.RefObject<Konva.Stage | null>
  stepMs: number
  onClose: () => void
}

export default function ExportModal({ stageRef, stepMs, onClose }: Props) {
  const { activeSet, activeStep, setActiveStep, setIsPlaying, playbackSpeed, setPlaybackSpeed } = usePlayStore()

  const [format, setFormat] = useState<Format>('gif')
  const scale = 1
  const [phase, setPhase] = useState<Phase>('idle')
  const [captureProgress, setCaptureProgress] = useState(0)
  const [encodeProgress, setEncodeProgress] = useState(0)
  const cancelRef = useRef<(() => void) | null>(null)
  const savedSpeed = useRef(playbackSpeed)
  const savedStep = useRef(activeStep)

  const total = activeSet?.actions.length ?? 0
  const durationMs = total * (stepMs / 1) // always capture at 1× speed

  function startExport() {
    if (!stageRef.current || !activeSet || total === 0) return
    const stage = stageRef.current

    // Save and reset playback
    savedSpeed.current = playbackSpeed
    savedStep.current = activeStep
    setPlaybackSpeed(1)
    setActiveStep(0)

    setPhase('playing')
    setCaptureProgress(0)
    setEncodeProgress(0)

    // Small delay so React re-renders with step=0 before capture starts
    setTimeout(() => {
      setIsPlaying(true)

      if (format === 'gif') {
        const fps = 12
        const handle = exportGif(
          stage,
          durationMs,
          fps,
          scale,
          (p) => {
            setCaptureProgress(p)
            if (p >= 1) { setIsPlaying(false); setPhase('encoding') }
          },
          (p) => setEncodeProgress(p),
          (blob) => {
            downloadBlob(blob, `${activeSet.name || 'play'}.gif`)
            setPhase('done')
            restore()
          },
        )
        cancelRef.current = handle.cancel
      } else {
        const handle = exportVideo(
          stage,
          durationMs,
          scale,
          (p) => {
            setCaptureProgress(p)
            if (p >= 1) setPhase('encoding')
          },
          (blob) => {
            const ext = blob.type.includes('mp4') ? 'mp4' : 'webm'
            downloadBlob(blob, `${activeSet.name || 'play'}.${ext}`)
            setPhase('done')
            restore()
          },
        )
        cancelRef.current = handle.cancel
      }
    }, 80)
  }

  function restore() {
    setPlaybackSpeed(savedSpeed.current)
    setActiveStep(savedStep.current)
    setIsPlaying(false)
  }

  function handleCancel() {
    cancelRef.current?.()
    restore()
    onClose()
  }

  // Stop animation capture if user closes or component unmounts
  useEffect(() => () => { cancelRef.current?.() }, [])

  const busy = phase === 'playing' || phase === 'encoding'

  const progressBar = (value: number, label: string) => (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 transition-all duration-100"
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl w-80 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-sm">Export Animation</h2>
          {!busy && (
            <button onClick={onClose} className="text-slate-400 hover:text-white text-lg leading-none">×</button>
          )}
        </div>

        {phase === 'idle' && (
          <>
            <div className="flex gap-2">
              {(['gif', 'video'] as Format[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    format === f
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {f === 'gif' ? 'GIF' : 'Video (WebM)'}
                </button>
              ))}
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              {format === 'gif'
                ? 'Looping GIF at 12 fps. Animation plays once at 1× speed during capture.'
                : 'WebM video at 30 fps. Animation plays once at 1× speed during capture.'}
            </p>

            {total === 0 && (
              <p className="text-red-400 text-xs">No actions to export.</p>
            )}

            <div className="flex gap-2 mt-1">
              <button
                onClick={startExport}
                disabled={total === 0}
                className="flex-1 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium disabled:opacity-30 transition-colors"
              >
                Export
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {phase === 'playing' && (
          <div className="flex flex-col gap-3">
            <p className="text-slate-300 text-xs">Playing animation and capturing frames…</p>
            {progressBar(captureProgress, 'Capture')}
            <button
              onClick={handleCancel}
              className="py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {phase === 'encoding' && (
          <div className="flex flex-col gap-3">
            <p className="text-slate-300 text-xs">
              {format === 'gif' ? 'Encoding GIF…' : 'Finalizing video…'}
            </p>
            {format === 'gif'
              ? progressBar(encodeProgress, 'Encoding')
              : <div className="text-slate-400 text-xs">Processing…</div>
            }
          </div>
        )}

        {phase === 'done' && (
          <div className="flex flex-col gap-3">
            <p className="text-green-400 text-sm font-medium">Download started!</p>
            <button
              onClick={onClose}
              className="py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
