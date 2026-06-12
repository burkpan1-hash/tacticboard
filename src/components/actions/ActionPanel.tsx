import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ActionCard from './ActionCard'
import GroupCard from './GroupCard'
import { usePlayStore } from '../../store/usePlayStore'
import { validateGroupActions, type GroupConflictReason } from '../../utils/groupValidation'
import type { Action } from '../../models/types'

export default function ActionPanel() {
  const { t } = useTranslation()
  const {
    activeSet, activeStep, isPlaying,
    setActiveStep, clearAllActions, setOptionText,
    ungroupGroup, createGroup,
    isRecordingGroup, groupConflictError,
    setGroupName, setGroupOptionText,
  } = usePlayStore()

  const [confirmClear, setConfirmClear] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [postHocError, setPostHocError] = useState<GroupConflictReason | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activeSet?.actions.length])

  useEffect(() => {
    if (isRecordingGroup) {
      setSelectionMode(false)
      setSelectedIds(new Set())
    }
  }, [isRecordingGroup])

  if (!activeSet) return null

  const topLevelActions = activeSet.actions.filter(item => item.type !== 'group')
  const canGroup = selectionMode && selectedIds.size >= 2

  function handleClear() {
    clearAllActions()
    setConfirmClear(false)
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  function handleGroupConfirm() {
    const selected = activeSet!.actions
      .filter(item => item.type !== 'group' && selectedIds.has(item.id)) as Action[]
    const conflict = validateGroupActions(selected)
    if (conflict) {
      setPostHocError(conflict)
      setTimeout(() => setPostHocError(null), 6000)
      return
    }
    createGroup([...selectedIds])
    setSelectionMode(false)
    setSelectedIds(new Set())
    setPostHocError(null)
  }

  function toggleSelection(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const hasActions = activeSet.actions.length > 0

  const CONFLICT_KEY: Record<GroupConflictReason, string> = {
    SHOT_IN_GROUP:          'actionPanel.conflictShotInGroup',
    BALL_ACTION_CONFLICT:   'actionPanel.conflictBallAction',
    PLAYER_ALREADY_IN_GROUP:'actionPanel.conflictPlayerBusy',
  }

  // Shared button style matching Clear All size
  const btnBase = 'text-xs px-2 py-1 rounded transition-colors font-medium'

  let stepCounter = 0

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b border-slate-700">
        {selectionMode ? (
          /* ── Selection mode ─────────────────────── */
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-300 font-medium">
                {t('actionPanel.groupingCount', { count: selectedIds.size })}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleGroupConfirm}
                  disabled={!canGroup}
                  className={`${btnBase} bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white`}
                >
                  {t('actionPanel.groupConfirmButton')}
                </button>
                <button
                  onClick={() => { setSelectionMode(false); setSelectedIds(new Set()); setPostHocError(null) }}
                  className={`${btnBase} bg-slate-700 hover:bg-slate-600 text-slate-300`}
                >
                  {t('common.cancelButton')}
                </button>
              </div>
            </div>
            {postHocError && (
              <div className="flex items-center gap-1.5 bg-red-900/40 border border-red-500/40 rounded px-2 py-1">
                <span className="text-red-400 shrink-0">✕</span>
                <span className="text-xs text-red-300">{t(CONFLICT_KEY[postHocError])}</span>
              </div>
            )}
          </div>
        ) : (
          /* ── Normal / recording mode ─────────────── */
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-300 shrink-0">
              {t('actionPanel.actionsTitle')} <span className="text-slate-500">({activeSet.actions.length})</span>
            </h3>
            <div className="flex items-center gap-1 flex-wrap justify-end">
              {/* Post-hoc group button */}
              {hasActions && !confirmClear && !isRecordingGroup && topLevelActions.length >= 2 && (
                <button
                  onClick={() => setSelectionMode(true)}
                  className={`${btnBase} bg-slate-700 hover:bg-amber-700 text-slate-300 hover:text-white`}
                >
                  {t('actionPanel.groupButton')}
                </button>
              )}
              {/* Clear button */}
              {hasActions && !isRecordingGroup && (
                confirmClear ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-red-300">{t('actionPanel.confirmClear')}</span>
                    <button onClick={handleClear}
                      className={`${btnBase} bg-red-600 hover:bg-red-500 text-white`}>{t('common.yesButton')}</button>
                    <button onClick={() => setConfirmClear(false)}
                      className={`${btnBase} bg-slate-700 hover:bg-slate-600 text-slate-300`}>{t('common.noButton')}</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmClear(true)}
                    className={`${btnBase} bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white`}>
                    {t('actionPanel.clearAllButton')}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Recording banner */}
        {isRecordingGroup && (
          <div className="mt-2 flex flex-col gap-1">
            <div className="flex items-center gap-2 bg-red-900/30 border border-red-600/40 rounded px-2 py-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />
              <span className="text-xs text-red-300">{t('actionPanel.recordingBanner')}</span>
            </div>
            {groupConflictError && (
              <div className="flex items-center gap-1.5 bg-red-900/40 border border-red-500/40 rounded px-2 py-1">
                <span className="text-red-400 shrink-0">✕</span>
                <span className="text-xs text-red-300">
                  {t(CONFLICT_KEY[groupConflictError as GroupConflictReason])}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeSet.actions.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">
            {t('actionPanel.emptyState')}
          </p>
        )}

        {activeSet.actions.map(item => {
          stepCounter++
          const stepNum = stepCounter

          if (item.type === 'group') {
            return (
              <GroupCard
                key={item.id}
                stepNum={stepNum}
                group={item}
                players={activeSet.players}
                isActive={isPlaying ? activeStep === stepNum - 1 : activeStep === stepNum}
                onClick={() => setActiveStep(stepNum)}
                onUngroup={() => ungroupGroup(item.id)}
                onNameChange={(name) => setGroupName(item.id, name)}
                onOptionTextChange={(text) => setGroupOptionText(item.id, text)}
              />
            )
          }

          const isChecked = selectedIds.has(item.id)
          return (
            <ActionCard
              key={item.id}
              stepNum={stepNum}
              action={item}
              players={activeSet.players}
              isActive={isPlaying ? activeStep === stepNum - 1 : activeStep === stepNum}
              checked={selectionMode ? isChecked : undefined}
              onCheckChange={selectionMode ? (v) => { if (v) setSelectedIds(p => new Set([...p, item.id])); else toggleSelection(item.id) } : undefined}
              onClick={() => {
                if (selectionMode) { toggleSelection(item.id); return }
                setActiveStep(stepNum)
              }}
              onOptionTextChange={(text) => setOptionText(item.id, text)}
            />
          )
        })}
      </div>
    </div>
  )
}
