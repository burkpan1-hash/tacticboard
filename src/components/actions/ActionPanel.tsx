import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ActionCard from './ActionCard'
import { usePlayStore } from '../../store/usePlayStore'

export default function ActionPanel() {
  const { t } = useTranslation()
  const {
    activeSet, activeStep, isPlaying,
    setActiveStep, clearAllActions, setOptionText,
  } = usePlayStore()
  const [confirmClear, setConfirmClear] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activeSet?.actions.length])

  if (!activeSet) return null

  function handleClear() {
    clearAllActions()
    setConfirmClear(false)
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700">
      <div className="p-3 border-b border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">
          {t('actionPanel.actionsTitle')} <span className="text-slate-500">({activeSet.actions.length})</span>
        </h3>
        {activeSet.actions.length > 0 && (
          confirmClear ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-red-300">{t('actionPanel.confirmClear')}</span>
              <button onClick={handleClear}
                className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-0.5 rounded transition-colors">{t('common.yesButton')}</button>
              <button onClick={() => setConfirmClear(false)}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white px-2 py-0.5 rounded transition-colors">{t('common.noButton')}</button>
            </div>
          ) : (
            <button onClick={() => setConfirmClear(true)}
              className="text-xs bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white px-2 py-1 rounded transition-colors">
              {t('actionPanel.clearAllButton')}
            </button>
          )
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeSet.actions.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">
            {t('actionPanel.emptyState')}
          </p>
        )}

        {activeSet.actions.map((action, i) => (
          <ActionCard
            key={action.id}
            index={i}
            action={action}
            players={activeSet.players}
            isActive={isPlaying ? activeStep === i : activeStep === i + 1}
            onClick={() => setActiveStep(i + 1)}
            onOptionTextChange={(text) => setOptionText(action.id, text)}
          />
        ))}
      </div>
    </div>
  )
}
