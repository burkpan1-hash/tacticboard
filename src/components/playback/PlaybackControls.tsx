import { useTranslation } from 'react-i18next'
import { usePlayStore } from '../../store/usePlayStore'
import { composeOptionLine } from '../../utils/optionLines'
import { MOD_KEY } from '../../hooks/useEditorShortcuts'

const KBD_INLINE = 'ml-1 text-[10px] font-mono opacity-70 hidden sm:inline'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface Props {
  onExport?: () => void
  onSave?: () => void
  canSave?: boolean
  saveStatus?: SaveStatus
  onShare?: () => void
  shareCopied?: boolean
}

export default function PlaybackControls({ onExport, onSave, canSave, saveStatus = 'idle', onShare, shareCopied = false }: Props) {
  const { t } = useTranslation()
  const {
    activeSet, activeStep, setActiveStep, undoLastAction, activeOptionId,
    isPlaying, playbackSpeed, setIsPlaying, setPlaybackSpeed,
  } = usePlayStore()

  // Step count follows the active option's composed line (trunk + option tail).
  const total = activeSet ? composeOptionLine(activeSet, activeOptionId).length : 0

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
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 px-3 sm:px-4 py-2 bg-slate-800 border-t border-slate-700">
      <button
        onClick={() => stepTo(0)}
        disabled={activeStep === 0 || isPlaying}
        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-30 transition-colors"
        title={`${t('playback.goToStartTooltip')} (Home)`}
      >⏮</button>

      <button
        onClick={() => stepTo(Math.max(0, activeStep - 1))}
        disabled={activeStep === 0 || isPlaying}
        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-30 transition-colors"
        title="← "
      >◀</button>

      <button
        onClick={togglePlay}
        disabled={total === 0}
        className="px-3 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-30 transition-colors text-base leading-none"
        title={`${isPlaying ? t('playback.pauseTooltip') : t('playback.playTooltip')} (Space)`}
      >{isPlaying ? '⏸' : '▶'}</button>

      <button
        onClick={() => stepTo(Math.min(total, activeStep + 1))}
        disabled={activeStep === total || isPlaying}
        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-30 transition-colors"
        title="→ "
      >▶</button>

      <button
        onClick={() => stepTo(total)}
        disabled={activeStep === total || isPlaying}
        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-30 transition-colors"
        title={`${t('playback.goToEndTooltip')} (End)`}
      >⏭</button>

      <span className="text-sm text-slate-400 min-w-[72px] text-center">
        {activeStep} / {total}
      </span>

      <div className="hidden sm:flex items-center gap-1 ml-1">
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

      {onSave && (() => {
        const label =
          saveStatus === 'saving' ? t('playback.savingButton') :
          saveStatus === 'saved'  ? `✓ ${t('playback.savedButton')}` :
          saveStatus === 'error'  ? t('playback.saveErrorButton') :
          t('playback.saveButton')
        const colorClass =
          saveStatus === 'saved' ? 'enabled:bg-emerald-500 enabled:hover:bg-emerald-400 enabled:text-white' :
          saveStatus === 'error' ? 'enabled:bg-red-500 enabled:hover:bg-red-400 enabled:text-white' :
          'enabled:bg-orange-500 enabled:hover:bg-orange-400 enabled:text-white'
        // Keep button enabled while "saved" so green stays visible during the 2s confirmation.
        // Once status returns to idle, fall back to the canSave (isDirty) gate.
        const disabled = saveStatus === 'saving' || (saveStatus !== 'saved' && !canSave)
        return (
          <button
            onClick={onSave}
            disabled={disabled}
            title={`${t('playback.saveButton')} (${MOD_KEY}S)`}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors min-w-[80px] disabled:opacity-50 disabled:cursor-not-allowed ${colorClass}`}
          >{label}{saveStatus === 'idle' && <kbd className={KBD_INLINE}>{MOD_KEY}S</kbd>}</button>
        )
      })()}

      {onShare && (
        <button
          onClick={onShare}
          disabled={total === 0}
          className="px-3 py-1 rounded bg-orange-500 hover:bg-orange-400 text-white text-sm disabled:opacity-30 transition-colors"
          title={`${t('playback.shareTooltip')} (${MOD_KEY}L)`}
        >{shareCopied ? t('playback.shareCopiedButton') : <>{t('playback.shareButton')}<kbd className={KBD_INLINE}>{MOD_KEY}L</kbd></>}</button>
      )}

      {onExport && (
        <button
          onClick={onExport}
          disabled={isPlaying || total === 0}
          className="px-3 py-1 rounded bg-orange-500 hover:bg-orange-400 text-white text-sm disabled:opacity-30 transition-colors"
          title={`${t('playback.exportTooltip')} (${MOD_KEY}E)`}
        >{t('playback.exportButton')}<kbd className={KBD_INLINE}>{MOD_KEY}E</kbd></button>
      )}

      <div className="hidden sm:block flex-1" />

      <button
        onClick={undoLastAction}
        disabled={total === 0 || isPlaying}
        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm disabled:opacity-30 transition-colors"
        title={`${t('playback.undoTooltip')} (${MOD_KEY}Z)`}
      >{t('playback.undoButton')}<kbd className={KBD_INLINE}>{MOD_KEY}Z</kbd></button>
    </div>
  )
}
