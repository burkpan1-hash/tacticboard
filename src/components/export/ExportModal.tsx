import { useEffect, useRef, useState } from 'react'
import type Konva from 'konva'
import { useTranslation } from 'react-i18next'
import { exportVideo, downloadBlob } from '../../utils/exportAnimation'
import { usePlayStore } from '../../store/usePlayStore'

type Phase = 'idle' | 'playing' | 'encoding' | 'done'

interface Props {
  stageRef: React.RefObject<Konva.Stage | null>
  stepMs: number
  onClose: () => void
}

export default function ExportModal({ stageRef, stepMs, onClose }: Props) {
  const { t } = useTranslation()
  const { activeSet, activeStep, setActiveStep, setIsPlaying, playbackSpeed, setPlaybackSpeed } = usePlayStore()

  const scale = 1
  const [phase, setPhase] = useState<Phase>('idle')
  const [captureProgress, setCaptureProgress] = useState(0)
  const cancelRef = useRef<(() => void) | null>(null)
  const savedSpeed = useRef(playbackSpeed)
  const savedStep = useRef(activeStep)

  const total = activeSet?.actions.length ?? 0
  const durationMs = total * stepMs

  function startExport() {
    if (!stageRef.current || !activeSet || total === 0) return
    const stage = stageRef.current

    savedSpeed.current = playbackSpeed
    savedStep.current = activeStep
    setPlaybackSpeed(1)
    setActiveStep(0)

    setPhase('playing')
    setCaptureProgress(0)

    setTimeout(() => {
      setIsPlaying(true)

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
          <h2 className="text-white font-semibold text-sm">{t('export.title')}</h2>
          {!busy && (
            <button onClick={onClose} className="text-slate-400 hover:text-white text-lg leading-none">×</button>
          )}
        </div>

        {phase === 'idle' && (
          <>
            <p className="text-slate-400 text-xs leading-relaxed">
              {t('export.description')}
            </p>

            {total === 0 && (
              <p className="text-red-400 text-xs">{t('export.noActionsError')}</p>
            )}

            <div className="flex gap-2 mt-1">
              <button
                onClick={startExport}
                disabled={total === 0}
                className="flex-1 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium disabled:opacity-30 transition-colors"
              >
                {t('export.exportButton')}
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors"
              >
                {t('common.cancelButton')}
              </button>
            </div>
          </>
        )}

        {phase === 'playing' && (
          <div className="flex flex-col gap-3">
            <p className="text-slate-300 text-xs">{t('export.capturingStatus')}</p>
            {progressBar(captureProgress, t('export.captureProgressLabel'))}
            <button
              onClick={handleCancel}
              className="py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors"
            >
              {t('common.cancelButton')}
            </button>
          </div>
        )}

        {phase === 'encoding' && (
          <div className="flex flex-col gap-3">
            <p className="text-slate-300 text-xs">{t('export.encodingStatus')}</p>
            <div className="text-slate-400 text-xs">{t('export.processingStatus')}</div>
          </div>
        )}

        {phase === 'done' && (
          <div className="flex flex-col gap-3">
            <p className="text-green-400 text-sm font-medium">{t('export.downloadSuccess')}</p>
            <button
              onClick={onClose}
              className="py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors"
            >
              {t('common.closeButton')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
