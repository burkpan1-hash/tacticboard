import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { nanoid } from 'nanoid'
import type Konva from 'konva'
import CourtCanvas from '../components/court/CourtCanvas'
import PlayerNode from '../components/players/PlayerNode'
import ActionOverlay from '../components/actions/ActionOverlay'
import ActionToolbar from '../components/toolbar/ActionToolbar'
import ActionPanel from '../components/actions/ActionPanel'
import PlaybackControls from '../components/playback/PlaybackControls'
import { usePlayStore } from '../store/usePlayStore'
import { computeStateAtStep } from '../utils/stateEngine'
import type { Action, NormalizedPosition } from '../models/types'
import { HALF_COURT_W, HALF_COURT_H, FULL_COURT_H, COURT_PADDING_X } from '../utils/courtCoords'

export default function EditorPage() {
  const { setId } = useParams<{ setId: string }>()
  const navigate = useNavigate()
  const {
    savedSets, activeSet, setActiveSet,
    activeStep,
    actionCreation, startActionCreation, setPendingSource, cancelActionCreation,
    addAction,
  } = usePlayStore()

  useEffect(() => {
    const found = savedSets.find(s => s.id === setId)
    if (found) {
      setActiveSet(found)
    } else {
      usePlayStore.getState().loadSetsFromStorage()
    }
  }, [setId, savedSets, setActiveSet])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        usePlayStore.getState().undoLastAction()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!activeSet) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <p>Set yükleniyor...</p>
      </div>
    )
  }

  const currentState = computeStateAtStep(
    activeSet.actions, activeStep, activeSet.initialPositions, activeSet.initialBall
  )
  const cH = activeSet.courtType === 'half' ? HALF_COURT_H : FULL_COURT_H

  function handleCourtClick(e: Konva.KonvaEventObject<MouseEvent>) {
    const { type, pendingSourceId } = actionCreation
    if (!type) return

    const pos = e.target.getStage()?.getPointerPosition()
    if (!pos) return
    // Subtract COURT_PADDING_X because court group is offset inside Stage
    const normPos: NormalizedPosition = {
      x: (pos.x - COURT_PADDING_X) / HALF_COURT_W,
      y: pos.y / cH,
    }

    if (type === 'shot') {
      const action: Action = { id: nanoid(), type: 'shot', shooterId: currentState.ball.holderId }
      addAction(action)
      return
    }

    if (type === 'dribble') {
      const action: Action = { id: nanoid(), type: 'dribble', playerId: currentState.ball.holderId, toPosition: normPos }
      addAction(action)
      return
    }

    if (type === 'cut' && pendingSourceId) {
      const action: Action = { id: nanoid(), type: 'cut', playerId: pendingSourceId, toPosition: normPos }
      addAction(action)
      return
    }

    if (type === 'screen' && pendingSourceId) {
      const action: Action = { id: nanoid(), type: 'screen', screenerId: pendingSourceId, screenPosition: normPos }
      addAction(action)
      return
    }

    if (type === 'handoff' && pendingSourceId) {
      const action: Action = {
        id: nanoid(), type: 'handoff',
        fromId: currentState.ball.holderId, toId: pendingSourceId, meetPosition: normPos,
      }
      addAction(action)
      return
    }
  }

  function handlePlayerClick(playerId: string) {
    const { type, pendingSourceId } = actionCreation
    if (!type) return

    if (type === 'pass') {
      if (playerId === currentState.ball.holderId) return
      const action: Action = { id: nanoid(), type: 'pass', fromId: currentState.ball.holderId, toId: playerId }
      addAction(action)
      return
    }

    if (type === 'cut' && !pendingSourceId) {
      setPendingSource(playerId)
      return
    }

    if (type === 'screen' && !pendingSourceId) {
      setPendingSource(playerId)
      return
    }

    if (type === 'handoff' && !pendingSourceId) {
      if (playerId === currentState.ball.holderId) return
      setPendingSource(playerId)
      return
    }
  }

  const instructionText = (() => {
    const { type, pendingSourceId } = actionCreation
    if (!type) return null
    if (type === 'pass') return 'Topu alacak oyuncuya tıkla'
    if (type === 'dribble') return 'Kortta hedefe tıkla'
    if (type === 'shot') return 'Şut için kortta herhangi yere tıkla'
    if (type === 'cut') return pendingSourceId ? 'Kortta hedefe tıkla' : 'Keseceği oyuncuya tıkla'
    if (type === 'screen') return pendingSourceId ? 'Ekran kurulacak yere tıkla' : 'Ekran kuracak oyuncuya tıkla'
    if (type === 'handoff') return pendingSourceId ? 'Handoff noktasına tıkla' : 'Topu alacak oyuncuya tıkla'
    return null
  })()

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white transition-colors text-sm">← Ana Sayfa</button>
          <span className="text-white font-semibold">{activeSet.name}</span>
        </div>
        <span className="text-slate-400 text-sm">
          {activeSet.courtType === 'half' ? 'Yarım Kort' : 'Tam Kort'}
        </span>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left toolbar */}
        <div className="p-2 border-r border-slate-700">
          <ActionToolbar
            activeType={actionCreation.type}
            ballHolderId={currentState.ball.holderId}
            onSelect={startActionCreation}
            onCancel={cancelActionCreation}
          />
        </div>

        {/* Court */}
        <div className="flex-1 flex items-center justify-center bg-slate-950 overflow-auto p-4">
          <div className="relative">
            {instructionText && (
              <div className="absolute -top-10 left-0 right-0 text-center text-sm text-orange-300 font-medium">
                {instructionText}
                <button onClick={cancelActionCreation} className="ml-3 text-slate-400 hover:text-white text-xs underline">İptal</button>
              </div>
            )}
            <CourtCanvas courtType={activeSet.courtType} onStageClick={handleCourtClick}>
              <ActionOverlay
                actions={activeSet.actions}
                initialPositions={activeSet.initialPositions}
                initialBall={activeSet.initialBall}
                activeStep={activeStep}
                courtType={activeSet.courtType}
              />
              {activeSet.players.map(player => {
                const pos = currentState.positions[player.id] ?? { x: 0.5, y: 0.5 }
                return (
                  <PlayerNode
                    key={player.id}
                    player={player}
                    position={pos}
                    courtType={activeSet.courtType}
                    hasBall={currentState.ball.holderId === player.id}
                    isSelected={actionCreation.pendingSourceId === player.id}
                    onDragEnd={() => {}}
                    onClick={handlePlayerClick}
                  />
                )
              })}
            </CourtCanvas>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-64 flex flex-col border-l border-slate-700">
          <ActionPanel />
        </div>
      </div>

      {/* Bottom playback */}
      <PlaybackControls />
    </div>
  )
}
