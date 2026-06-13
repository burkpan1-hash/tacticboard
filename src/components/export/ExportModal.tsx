import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { usePlayStore } from '../../store/usePlayStore'
import { exportPlayToMp4, type AspectKey, type ExportHandle } from '../../utils/export/exportVideo'
import { isVideoExportSupported } from '../../utils/export/encodeMp4'
import { downloadBlob } from '../../utils/export/downloadBlob'

type Phase = 'idle' | 'encoding' | 'done' | 'error'

interface Props {
  onClose: () => void
}

const ASPECTS: Array<{ key: AspectKey; labelKey: string; icon: string }> = [
  { key: '9:16', labelKey: 'export.aspectVertical', icon: '▯' },
  { key: '1:1',  labelKey: 'export.aspectSquare',   icon: '◻' },
  { key: '16:9', labelKey: 'export.aspectWide',     icon: '▭' },
]

export default function ExportModal({ onClose }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { activeSet } = usePlayStore()
  const [showUpgrade, setShowUpgrade] = useState(false)

  const [aspect, setAspect] = useState<AspectKey>('9:16')
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const [errorKey, setErrorKey] = useState<string>('export.genericError')
  const handleRef = useRef<ExportHandle | null>(null)

  const total = activeSet?.actions.length ?? 0
  const supported = isVideoExportSupported()

  useEffect(() => () => { handleRef.current?.cancel() }, [])

  function startExport() {
    if (!activeSet || total === 0) return
    if (!supported) { setErrorKey('export.unsupportedError'); setPhase('error'); return }
    setPhase('encoding')
    setProgress(0)
    const baseName = activeSet.name || 'play'
    handleRef.current = exportPlayToMp4(
      activeSet,
      aspect,
      setProgress,
      (blob) => {
        void downloadBlob(blob, `${baseName}-${aspect.replace(':', 'x')}.mp4`)
        setPhase('done')
        setTimeout(() => setShowUpgrade(true), 800)
      },
      (err) => {
        setErrorKey(err.message === 'UNSUPPORTED' ? 'export.unsupportedError' : 'export.genericError')
        setPhase('error')
      },
    )
  }

  function handleCancel() {
    handleRef.current?.cancel()
    onClose()
  }

  const busy = phase === 'encoding'

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
            <p className="text-slate-400 text-xs leading-relaxed">{t('export.description')}</p>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-400 font-medium">{t('export.aspectLabel')}</span>
              <div className="flex gap-2">
                {ASPECTS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setAspect(opt.key)}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium border transition-colors ${
                      aspect === opt.key
                        ? 'bg-orange-600/20 border-orange-500 text-orange-300'
                        : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-base leading-none mb-1">{opt.icon}</div>
                    <div className="font-semibold">{opt.key}</div>
                    <div className="opacity-70 text-[10px]">{t(opt.labelKey)}</div>
                  </button>
                ))}
              </div>
            </div>

            {total === 0 && <p className="text-red-400 text-xs">{t('export.noActionsError')}</p>}
            {!supported && <p className="text-amber-400 text-xs">{t('export.unsupportedError')}</p>}

            <div className="flex gap-2">
              <button
                onClick={startExport}
                disabled={total === 0 || !supported}
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

        {phase === 'encoding' && (
          <div className="flex flex-col gap-3">
            <p className="text-slate-300 text-xs">{t('export.encodingStatus')}</p>
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{t('export.progressLabel')}</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 transition-all duration-100" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            </div>
            <button onClick={handleCancel} className="py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors">
              {t('common.cancelButton')}
            </button>
          </div>
        )}

        {phase === 'error' && (
          <div className="flex flex-col gap-3">
            <p className="text-red-400 text-sm">{t(errorKey)}</p>
            <button onClick={onClose} className="py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors">
              {t('common.closeButton')}
            </button>
          </div>
        )}

        {phase === 'done' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
              <span className="text-green-400 text-lg">✓</span>
              <p className="text-green-400 text-sm font-medium">{t('export.downloadSuccess')}</p>
            </div>
            {showUpgrade ? (
              <div className="bg-slate-700/60 rounded-xl p-4 flex flex-col gap-3 border border-slate-600">
                <div>
                  <p className="text-white font-semibold text-sm">{t('export.upsellTitle')}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{t('export.upsellBody')}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { onClose(); navigate('/pricing') }} className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors">
                    {t('export.upsellCta')}
                  </button>
                  <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors">
                    {t('export.upsellDismiss')}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={onClose} className="py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors">
                {t('common.closeButton')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
