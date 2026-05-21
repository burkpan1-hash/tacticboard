import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { nanoid } from 'nanoid'
import type Konva from 'konva'
import { Line } from 'react-konva'
import CourtCanvas from '../components/court/CourtCanvas'
import PlayerNode from '../components/players/PlayerNode'
import ActionOverlay from '../components/actions/ActionOverlay'
import ActionPreview from '../components/actions/ActionPreview'
import ActionToolbar from '../components/toolbar/ActionToolbar'
import ActionPanel from '../components/actions/ActionPanel'
import PlaybackControls from '../components/playback/PlaybackControls'
import { usePlayStore } from '../store/usePlayStore'
import { computeStateAtStep } from '../utils/stateEngine'
import { denormalize } from '../utils/courtCoords'
import type { Action, NormalizedPosition, Player } from '../models/types'
import { HALF_COURT_W, HALF_COURT_H, FULL_COURT_H, COURT_PADDING_X } from '../utils/courtCoords'

export default function EditorPage() {
  const { setId } = useParams<{ setId: string }>()
  const navigate = useNavigate()
  const {
    savedSets, activeSet, setActiveSet,
    activeStep,
    actionCreation, startActionCreation, setPendingSource, cancelActionCreation,
    addAction, addPlayerToCourt, updateMarkings,
  } = usePlayStore()

  const [markingsEnabled, setMarkingsEnabled] = useState(false)
  const [mousePos, setMousePos] = useState<NormalizedPosition | null>(null)
  const [dribbleWaypoints, setDribbleWaypoints] = useState<NormalizedPosition[]>([])
  const isDraggingDribble = useRef(false)
  const dragWasUsed = useRef(false)
  const lastWaypoint = useRef<NormalizedPosition | null>(null)
  const SAMPLE_DIST = 15


  useEffect(() => {
    if (activeSet?.id === setId) return
    const found = savedSets.find(s => s.id === setId)
    if (found) setActiveSet(found)
    else usePlayStore.getState().loadSetsFromStorage()
  }, [setId, savedSets, setActiveSet, activeSet])

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

  useEffect(() => {
    if (!actionCreation.type) setMousePos(null)
  }, [actionCreation.type])

  if (!activeSet) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <p>Loading...</p>
      </div>
    )
  }

  const activeMarkings = markingsEnabled ? (activeSet.markings ?? {}) : undefined
  const currentState = computeStateAtStep(
    activeSet.actions, activeStep, activeSet.initialPositions, activeSet.initialBall, activeMarkings
  )
  const cH = activeSet.courtType === 'half' ? HALF_COURT_H : FULL_COURT_H

  const inPlayIds = new Set(activeSet.players.map(p => p.id))
  const benchPlayers: Player[] = []
  for (let n = 1; n <= 5; n++) {
    if (!inPlayIds.has(`o${n}`)) benchPlayers.push({ id: `o${n}`, number: n as Player['number'], team: 'offense' })
    if (!inPlayIds.has(`d${n}`)) benchPlayers.push({ id: `d${n}`, number: n as Player['number'], team: 'defense' })
  }

  function cancelAll() {
    cancelActionCreation()
  }

  function handleToggleMarkings() {
    if (markingsEnabled) {
      setMarkingsEnabled(false)
    } else {
      // Ensure d1↔o1 … assignments exist before enabling
      if (Object.keys(activeSet.markings ?? {}).length === 0) {
        const newMarkings: Record<string, string> = {}
        const defPlayers = activeSet.players.filter(p => p.team === 'defense')
        const offPlayers = activeSet.players.filter(p => p.team === 'offense')
        for (const def of defPlayers) {
          const match = offPlayers.find(o => o.number === def.number)
          if (match) newMarkings[def.id] = match.id
        }
        updateMarkings(newMarkings)
      }
      setMarkingsEnabled(true)
    }
  }

  function handleCourtDrop(e: React.DragEvent<HTMLDivElement>) {
    const pid = e.dataTransfer.getData('benchPlayerId')
    if (!pid) return
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0.02, Math.min(0.98, (e.clientX - rect.left - COURT_PADDING_X) / HALF_COURT_W))
    const y = Math.max(0.02, Math.min(0.98, (e.clientY - rect.top) / cH))
    addPlayerToCourt(pid, { x, y })
  }

  function normFromEvent(e: Konva.KonvaEventObject<MouseEvent>): NormalizedPosition | null {
    const pos = e.target.getStage()?.getPointerPosition()
    if (!pos) return null
    return { x: (pos.x - COURT_PADDING_X) / HALF_COURT_W, y: pos.y / cH }
  }

  function handleMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    if (actionCreation.type !== 'dribble') return
    const norm = normFromEvent(e)
    if (!norm) return
    isDraggingDribble.current = true
    dragWasUsed.current = false
    lastWaypoint.current = norm
    setDribbleWaypoints([])
  }

  function handleMouseUp(e: Konva.KonvaEventObject<MouseEvent>) {
    if (!isDraggingDribble.current || actionCreation.type !== 'dribble') return
    isDraggingDribble.current = false
    if (dragWasUsed.current && dribbleWaypoints.length > 2) {
      const last = dribbleWaypoints[dribbleWaypoints.length - 1]
      addAction({ id: nanoid(), type: 'dribble', playerId: currentState.ball.holderId, toPosition: last, waypoints: dribbleWaypoints })
    }
    setDribbleWaypoints([])
    lastWaypoint.current = null
  }

  function handleMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    if (!actionCreation.type) return
    const norm = normFromEvent(e)
    if (!norm) return
    setMousePos(norm)

    if (isDraggingDribble.current && actionCreation.type === 'dribble' && lastWaypoint.current) {
      const last = lastWaypoint.current
      const dx = (norm.x - last.x) * HALF_COURT_W
      const dy = (norm.y - last.y) * cH
      if (Math.sqrt(dx * dx + dy * dy) >= SAMPLE_DIST) {
        dragWasUsed.current = true
        setDribbleWaypoints(prev => [...prev, norm])
        lastWaypoint.current = norm
      }
    }
  }

  function handleCourtClick(e: Konva.KonvaEventObject<MouseEvent>) {
    const { type, pendingSourceId } = actionCreation
    if (!type) return

    const pos = e.target.getStage()?.getPointerPosition()
    if (!pos) return
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
      if (dragWasUsed.current) { dragWasUsed.current = false; return }
      addAction({ id: nanoid(), type: 'dribble', playerId: currentState.ball.holderId, toPosition: normPos })
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

    if (type === 'defense-move' && pendingSourceId) {
      addAction({ id: nanoid(), type: 'defense-move', playerId: pendingSourceId, toPosition: normPos })
      return
    }
  }

  function handlePlayerClick(playerId: string) {
    const { type, pendingSourceId } = actionCreation
    if (!type) return

    if (type === 'pass') {
      if (playerId === currentState.ball.holderId) return
      const target = activeSet.players.find(p => p.id === playerId)
      if (!target || target.team === 'defense') return
      const action: Action = { id: nanoid(), type: 'pass', fromId: currentState.ball.holderId, toId: playerId }
      addAction(action)
      return
    }

    if (type === 'cut' && !pendingSourceId) {
      const cutter = activeSet.players.find(p => p.id === playerId)
      if (!cutter || cutter.team === 'defense') return
      setPendingSource(playerId)
      return
    }

    if (type === 'screen' && !pendingSourceId) {
      const screener = activeSet.players.find(p => p.id === playerId)
      if (!screener || screener.team === 'defense') return
      setPendingSource(playerId)
      return
    }

    if (type === 'handoff' && !pendingSourceId) {
      if (playerId === currentState.ball.holderId) return
      const receiver = activeSet.players.find(p => p.id === playerId)
      if (!receiver || receiver.team === 'defense') return
      setPendingSource(playerId)
      return
    }

    if (type === 'defense-move' && !pendingSourceId) {
      const mover = activeSet.players.find(p => p.id === playerId)
      if (!mover || mover.team !== 'defense') return
      setPendingSource(playerId)
      return
    }
  }

  const instructionText = (() => {
    const { type, pendingSourceId } = actionCreation
    if (!type) return null
    if (type === 'pass') return 'Click the player to receive the pass'
    if (type === 'dribble') return 'Click the target position on court'
    if (type === 'shot') return 'Click anywhere to shoot'
    if (type === 'cut') return pendingSourceId ? 'Click the destination on court' : 'Click the player who will cut'
    if (type === 'screen') return pendingSourceId ? 'Click the screen position' : 'Click the player setting the screen'
    if (type === 'handoff') return pendingSourceId ? 'Click the meet position' : 'Click the player to receive the handoff'
    if (type === 'defense-move') return pendingSourceId ? 'Click destination on court' : 'Click defender to move'
    return null
  })()

  const showInstruction = instructionText !== null

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white transition-colors text-sm">← Home</button>
          <span className="text-white font-semibold">{activeSet.name}</span>
        </div>
        <span className="text-slate-400 text-sm">
          {activeSet.courtType === 'half' ? 'Half Court' : 'Full Court'}
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="p-2 border-r border-slate-700">
          <ActionToolbar
            activeType={actionCreation.type}
            ballHolderId={currentState.ball.holderId}
            onSelect={startActionCreation}
            onCancel={cancelAll}
            markingsEnabled={markingsEnabled}
            onToggleMarkings={handleToggleMarkings}
          />
        </div>

        <div className="flex-1 flex items-center justify-center bg-slate-950 overflow-auto p-4">
          <div className="flex flex-col items-center gap-3">
          <div
            className="relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleCourtDrop}
          >
            {showInstruction && (
              <div className="absolute -top-10 left-0 right-0 text-center text-sm text-orange-300 font-medium">
                {instructionText}
                <button onClick={cancelAll} className="ml-3 text-slate-400 hover:text-white text-xs underline">Cancel</button>
              </div>
            )}
            <CourtCanvas
              courtType={activeSet.courtType}
              onStageClick={handleCourtClick}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => { setMousePos(null); isDraggingDribble.current = false }}
            >
              <ActionOverlay
                actions={activeSet.actions}
                initialPositions={activeSet.initialPositions}
                initialBall={activeSet.initialBall}
                activeStep={activeStep}
                courtType={activeSet.courtType}
                markings={activeMarkings}
              />
              <ActionPreview
                actionType={actionCreation.type}
                pendingSourceId={actionCreation.pendingSourceId}
                ballHolderId={currentState.ball.holderId}
                positions={currentState.positions}
                mousePos={mousePos}
                courtType={activeSet.courtType}
                dribbleWaypoints={dribbleWaypoints}
              />
              {/* Marking lines — only when enabled */}
              {markingsEnabled && Object.entries(activeSet.markings ?? {}).map(([defId, offId]) => {
                const dp = currentState.positions[defId]
                const op = currentState.positions[offId]
                if (!dp || !op) return null
                const d = denormalize(dp.x, dp.y, HALF_COURT_W, cH)
                const o = denormalize(op.x, op.y, HALF_COURT_W, cH)
                return (
                  <Line
                    key={defId}
                    points={[d.x, d.y, o.x, o.y]}
                    stroke="#60a5fa" strokeWidth={1.5}
                    dash={[4, 4]} opacity={0.5} listening={false}
                  />
                )
              })}
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
                    draggable={!(actionCreation.type && player.team === 'defense')}
                    onDragEnd={() => {}}
                    onClick={handlePlayerClick}
                  />
                )
              })}
            </CourtCanvas>
          </div>

          {benchPlayers.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 rounded-xl border border-slate-700">
              <span className="text-slate-500 text-xs mr-1">Bench</span>
              {benchPlayers.map(p => (
                <div
                  key={p.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('benchPlayerId', p.id)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-grab select-none"
                  style={{
                    backgroundColor: p.team === 'offense' ? '#f97316' : '#1d4ed8',
                    border: '2px dashed rgba(255,255,255,0.4)',
                    opacity: 0.8,
                  }}
                  title={`${p.team === 'offense' ? 'Offense' : 'Defense'} #${p.number} — drag onto court`}
                >
                  {p.number}
                </div>
              ))}
            </div>
          )}
          </div>
        </div>

        <div className="w-64 flex flex-col border-l border-slate-700">
          <ActionPanel />
        </div>
      </div>

      <PlaybackControls />
    </div>
  )
}
