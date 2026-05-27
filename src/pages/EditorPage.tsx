import { useEffect, useRef, useState } from 'react'
import type Konva from 'konva'
import { useParams, useNavigate } from 'react-router-dom'
import { nanoid } from 'nanoid'
import { Line, Group, Rect, Text, Arrow } from 'react-konva'
import CourtCanvas from '../components/court/CourtCanvas'
import PlayerNode from '../components/players/PlayerNode'
import ActionOverlay from '../components/actions/ActionOverlay'
import ActionPreview from '../components/actions/ActionPreview'
import ActionToolbar from '../components/toolbar/ActionToolbar'
import ActionPanel from '../components/actions/ActionPanel'
import PlaybackControls from '../components/playback/PlaybackControls'
import ExportModal from '../components/export/ExportModal'
import { usePlayStore } from '../store/usePlayStore'
import { computeStateAtStep } from '../utils/stateEngine'
import { denormalize } from '../utils/courtCoords'
import type { Action, NormalizedPosition, Player, PositionMap } from '../models/types'
import { HALF_COURT_W, HALF_COURT_H, FULL_COURT_H, COURT_PADDING_X, COURT_PADDING_Y, HALF_COURT } from '../utils/courtCoords'
import { ACTION_COLORS, ACTION_LABELS } from '../utils/actionColors'

// Returns the start/end pixel coords of the arrow's direction vector (for label placement)
function arrowLine(action: Action, positions: PositionMap, cH: number): { x1: number; y1: number; x2: number; y2: number } | null {
  const px = (id: string) => { const p = positions[id]; return p ? denormalize(p.x, p.y, HALF_COURT_W, cH) : null }
  const pp = (p: NormalizedPosition) => denormalize(p.x, p.y, HALF_COURT_W, cH)
  switch (action.type) {
    case 'pass':        { const f = px(action.fromId), t = px(action.toId); if (!f || !t) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'cut':         { const f = px(action.playerId), t = pp(action.toPosition); if (!f) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'screen':      { const f = px(action.screenerId), t = pp(action.screenPosition); if (!f) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'shot':        { const f = px(action.shooterId); if (!f) return null; return { x1: f.x, y1: f.y, x2: HALF_COURT.basket.x, y2: HALF_COURT.basket.y } }
    case 'handoff':     { const f = px(action.fromId), t = pp(action.meetPosition); if (!f) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'defense-move':{ const f = px(action.playerId), t = pp(action.toPosition); if (!f) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'double-team': { const f = px(action.defender1Id), t = px(action.targetId); if (!f || !t) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'ball-force': {
      const f = px(action.defenderId); const target = positions[action.targetId]
      if (!f || !target) return null
      const DEFENDER_DIST = 0.11
      const t = pp({ x: Math.max(0, Math.min(1, target.x + Math.cos(action.angle) * DEFENDER_DIST)), y: Math.max(0, Math.min(1, target.y + Math.sin(action.angle) * DEFENDER_DIST)) })
      return { x1: f.x, y1: f.y, x2: t.x, y2: t.y }
    }
    case 'dribble': {
      const f = px(action.playerId); if (!f) return null
      if (action.waypoints && action.waypoints.length > 0) {
        const mid = pp(action.waypoints[Math.floor(action.waypoints.length / 2)])
        return { x1: f.x, y1: f.y, x2: mid.x, y2: mid.y }
      }
      const t = pp(action.toPosition); return { x1: f.x, y1: f.y, x2: t.x, y2: t.y }
    }
  }
}

// Pick the candidate position (midpoint ± perpendicular offset) farthest from all players
function smartLabelCenter(
  x1: number, y1: number, x2: number, y2: number,
  playersPx: Array<{ x: number; y: number }>,
): { cx: number; cy: number } {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const perpX = -dy / len, perpY = dx / len

  function minDist(cx: number, cy: number) {
    if (!playersPx.length) return Infinity
    return Math.min(...playersPx.map(p => Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2)))
  }

  let bestCx = mx + perpX * 16, bestCy = my + perpY * 16, bestScore = -1
  for (const offset of [16, 22, 30]) {
    for (const sign of [1, -1] as const) {
      const cx = mx + perpX * offset * sign
      const cy = my + perpY * offset * sign
      const score = minDist(cx, cy)
      if (score > bestScore) { bestScore = score; bestCx = cx; bestCy = cy }
    }
  }
  return { cx: bestCx, cy: bestCy }
}

export default function EditorPage() {
  const { setId } = useParams<{ setId: string }>()
  const navigate = useNavigate()
  const {
    savedSets, activeSet, setActiveSet,
    activeStep,
    actionCreation, startActionCreation, setPendingSource, cancelActionCreation,
    addAction, addPlayerToCourt, updateInitialPosition, updateMarkings, saveSet,
    flipAttackBasket,
    isPlaying, setIsPlaying,
  } = usePlayStore()

  const courtAreaRef = useRef<HTMLDivElement>(null)
  const [courtScale, setCourtScale] = useState(1)
  const [markingsEnabled, setMarkingsEnabled] = useState(false)
  const [mousePos, setMousePos] = useState<NormalizedPosition | null>(null)
  const [animFraction, setAnimFraction] = useState(0)
  const animFractionRef = useRef(0)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)

  function startNameEdit() {
    setNameInput(activeSet.name)
    setEditingName(true)
    setTimeout(() => nameInputRef.current?.select(), 0)
  }

  function commitNameEdit() {
    const trimmed = nameInput.trim()
    if (trimmed) saveSet({ ...activeSet, name: trimmed })
    setEditingName(false)
  }
  const stageRef = useRef<Konva.Stage | null>(null)
  const [showExport, setShowExport] = useState(false)
  const rafRef = useRef(0)
  const lastTsRef = useRef(0)
  const STEP_MS = 1600
  const [positionOverrides, setPositionOverrides] = useState<PositionMap>({})
  const playerDragWaypoints = useRef<NormalizedPosition[]>([])
  const lastPlayerDragPt = useRef<NormalizedPosition | null>(null)
  const playerDragHadPath = useRef(false)
  const [dribbleWaypoints, setDribbleWaypoints] = useState<NormalizedPosition[]>([])
  const isDraggingDribble = useRef(false)
  const dragWasUsed = useRef(false)
  const [cutWaypoints, setCutWaypoints] = useState<NormalizedPosition[]>([])
  const isDraggingCut = useRef(false)
  const cutDragWasUsed = useRef(false)
  const lastWaypoint = useRef<NormalizedPosition | null>(null)
  const SAMPLE_DIST = 15

  const cH = activeSet?.courtType === 'half' ? HALF_COURT_H : FULL_COURT_H
  const atkLeft = activeSet?.courtType === 'full' ? (activeSet.attackBasket ?? 'top') === 'top' : false
  const BASKET_PX = 42
  const basketY = activeSet?.courtType === 'full'
    ? (activeSet.attackBasket === 'bottom' ? 1 - BASKET_PX / FULL_COURT_H : BASKET_PX / FULL_COURT_H)
    : BASKET_PX / HALF_COURT_H


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
      if (e.key === 'Escape') cancelAll()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!actionCreation.type) setMousePos(null)
  }, [actionCreation.type])

  useEffect(() => {
    setPositionOverrides({})
  }, [activeStep])

  useEffect(() => {
    const el = courtAreaRef.current
    if (!el || activeSet?.courtType !== 'full') return
    const STAGE_W = HALF_COURT_W + 2 * COURT_PADDING_X
    function updateScale() {
      if (!el) return
      const aw = el.clientWidth - 32
      const ah = el.clientHeight - 16
      if (aw > 0 && ah > 0) setCourtScale(Math.min(aw / (FULL_COURT_H + 2 * COURT_PADDING_Y), ah / STAGE_W))
    }
    updateScale()
    const ro = new ResizeObserver(updateScale)
    ro.observe(el)
    return () => ro.disconnect()
  }, [activeSet?.courtType])

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current)
      animFractionRef.current = 0
      lastTsRef.current = 0
      setAnimFraction(0)
      return
    }
    const total = usePlayStore.getState().activeSet?.actions.length ?? 0
    if (usePlayStore.getState().activeStep >= total) {
      setIsPlaying(false)
      return
    }
    function tick(ts: number) {
      const dt = lastTsRef.current ? ts - lastTsRef.current : 0
      lastTsRef.current = ts
      const speed = usePlayStore.getState().playbackSpeed
      const next = Math.min(1, animFractionRef.current + dt / (STEP_MS / speed))
      animFractionRef.current = next
      setAnimFraction(next)
      if (next >= 1) {
        const s = usePlayStore.getState()
        const newStep = s.activeStep + 1
        const tot = s.activeSet?.actions.length ?? 0
        s.setActiveStep(newStep)
        animFractionRef.current = 0
        lastTsRef.current = 0
        setAnimFraction(0)
        if (newStep >= tot) { s.setIsPlaying(false); return }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, setIsPlaying])

  if (!activeSet) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <p>Loading...</p>
      </div>
    )
  }

  const activeMarkings = markingsEnabled ? (activeSet.markings ?? {}) : undefined
  const currentState = computeStateAtStep(
    activeSet.actions, activeStep, activeSet.initialPositions, activeSet.initialBall, activeMarkings, basketY
  )
  const total = activeSet.actions.length

  const effectivePositions: PositionMap = { ...currentState.positions, ...positionOverrides }

  const displayPositions = (() => {
    if (!isPlaying || activeStep >= total) return effectivePositions
    const toState = computeStateAtStep(
      activeSet.actions, activeStep + 1, activeSet.initialPositions, activeSet.initialBall, activeMarkings, basketY
    )
    const t = animFraction
    const currentAction = activeSet.actions[activeStep]

    return Object.fromEntries(
      Object.keys(currentState.positions).map(id => {
        const from = currentState.positions[id] ?? { x: 0.5, y: 0.5 }
        const to = toState.positions[id] ?? from

        // Follow drawn waypoint path for dribble or cut
        if (
          (currentAction?.type === 'dribble' || currentAction?.type === 'cut') &&
          currentAction.playerId === id &&
          currentAction.waypoints && currentAction.waypoints.length > 1
        ) {
          const path = [from, ...currentAction.waypoints]
          // Arc-length parameterization for uniform speed along path
          const lens: number[] = []
          let total = 0
          for (let i = 1; i < path.length; i++) {
            const dx = path[i].x - path[i - 1].x
            const dy = path[i].y - path[i - 1].y
            const l = Math.sqrt(dx * dx + dy * dy)
            lens.push(l)
            total += l
          }
          if (total === 0) return [id, from]
          const target = t * total
          let acc = 0
          for (let i = 0; i < lens.length; i++) {
            if (acc + lens[i] >= target) {
              const localT = lens[i] === 0 ? 0 : (target - acc) / lens[i]
              return [id, {
                x: path[i].x + (path[i + 1].x - path[i].x) * localT,
                y: path[i].y + (path[i + 1].y - path[i].y) * localT,
              }]
            }
            acc += lens[i]
          }
          return [id, path[path.length - 1]]
        }

        return [id, { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t }]
      })
    )
  })()

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
    if (activeSet.courtType === 'full') {
      const STAGE_W = HALF_COURT_W + 2 * COURT_PADDING_X
      const kx = (e.clientX - rect.left) / courtScale
      const ky = (e.clientY - rect.top) / courtScale
      const x = Math.max(0.02, Math.min(0.98, (STAGE_W - ky - COURT_PADDING_X) / HALF_COURT_W))
      const y = Math.max(-0.05, Math.min(1.05, (kx - COURT_PADDING_Y) / FULL_COURT_H))
      addPlayerToCourt(pid, { x, y })
      return
    }
    const x = Math.max(0.02, Math.min(0.98, (e.clientX - rect.left - COURT_PADDING_X) / HALF_COURT_W))
    const y = Math.max(-0.05, Math.min(1.05, (e.clientY - rect.top - COURT_PADDING_Y) / cH))
    addPlayerToCourt(pid, { x, y })
  }

  function normFromEvent(e: Konva.KonvaEventObject<MouseEvent>): NormalizedPosition | null {
    const pos = e.target.getStage()?.getPointerPosition()
    if (!pos) return null
    if (activeSet.courtType === 'full') {
      const STAGE_W = HALF_COURT_W + 2 * COURT_PADDING_X
      // pos is in CSS pixels; divide by courtScale to get Stage logical coords
      const sx = STAGE_W - pos.y / courtScale
      const sy = (pos.x / courtScale) - COURT_PADDING_Y
      return { x: (sx - COURT_PADDING_X) / HALF_COURT_W, y: sy / FULL_COURT_H }
    }
    return { x: (pos.x - COURT_PADDING_X) / HALF_COURT_W, y: (pos.y - COURT_PADDING_Y) / cH }
  }

  function handleMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    const norm = normFromEvent(e)
    if (!norm) return
    if (actionCreation.type === 'dribble') {
      isDraggingDribble.current = true
      dragWasUsed.current = false
      lastWaypoint.current = norm
      setDribbleWaypoints([])
    } else if (actionCreation.type === 'cut' && actionCreation.pendingSourceId) {
      isDraggingCut.current = true
      cutDragWasUsed.current = false
      lastWaypoint.current = norm
      setCutWaypoints([])
    }
  }

  function handleMouseUp(e: Konva.KonvaEventObject<MouseEvent>) {
    if (isDraggingDribble.current && actionCreation.type === 'dribble') {
      isDraggingDribble.current = false
      if (dragWasUsed.current && dribbleWaypoints.length > 2) {
        const last = dribbleWaypoints[dribbleWaypoints.length - 1]
        addAction({ id: nanoid(), type: 'dribble', playerId: currentState.ball.holderId, toPosition: last, waypoints: dribbleWaypoints })
      }
      setDribbleWaypoints([])
      lastWaypoint.current = null
    }
    if (isDraggingCut.current && actionCreation.type === 'cut' && actionCreation.pendingSourceId) {
      isDraggingCut.current = false
      if (cutDragWasUsed.current && cutWaypoints.length > 2) {
        const last = cutWaypoints[cutWaypoints.length - 1]
        addAction({ id: nanoid(), type: 'cut', playerId: actionCreation.pendingSourceId, toPosition: last, waypoints: cutWaypoints })
      }
      setCutWaypoints([])
      lastWaypoint.current = null
    }
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
    if (isDraggingCut.current && actionCreation.type === 'cut' && lastWaypoint.current) {
      const last = lastWaypoint.current
      const dx = (norm.x - last.x) * HALF_COURT_W
      const dy = (norm.y - last.y) * cH
      if (Math.sqrt(dx * dx + dy * dy) >= SAMPLE_DIST) {
        cutDragWasUsed.current = true
        setCutWaypoints(prev => [...prev, norm])
        lastWaypoint.current = norm
      }
    }
  }

  function handleCourtClick(e: Konva.KonvaEventObject<MouseEvent>) {
    const { type, pendingSourceId } = actionCreation
    if (!type) return

    const normPos = normFromEvent(e)
    if (!normPos) return

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
      if (cutDragWasUsed.current) { cutDragWasUsed.current = false; return }
      addAction({ id: nanoid(), type: 'cut', playerId: pendingSourceId, toPosition: normPos })
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

    if (type === 'ball-force' && pendingSourceId) {
      const targetId = currentState.ball.holderId
      const target = currentState.positions[targetId]
      if (!target) return
      const angle = Math.atan2(normPos.y - target.y, normPos.x - target.x)
      addAction({ id: nanoid(), type: 'ball-force', defenderId: pendingSourceId, targetId, angle })
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

    if (type === 'ball-force' && !pendingSourceId) {
      const mover = activeSet.players.find(p => p.id === playerId)
      if (!mover || mover.team !== 'defense') return
      setPendingSource(playerId)
      return
    }

    if (type === 'double-team' && !pendingSourceId) {
      const mover = activeSet.players.find(p => p.id === playerId)
      if (!mover || mover.team !== 'defense') return
      setPendingSource(playerId)
      return
    }

    if (type === 'double-team' && pendingSourceId && playerId !== pendingSourceId) {
      const mover = activeSet.players.find(p => p.id === playerId)
      if (!mover || mover.team !== 'defense') return
      addAction({
        id: nanoid(), type: 'double-team',
        defender1Id: pendingSourceId,
        defender2Id: playerId,
        targetId: currentState.ball.holderId,
      })
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
    if (type === 'double-team') return pendingSourceId ? 'Click second defender to trap' : 'Click first defender for double team'
    if (type === 'ball-force') return pendingSourceId ? 'Click a side of the ball handler to force' : 'Click defender to apply ball force'
    return null
  })()

  const showInstruction = instructionText !== null

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white transition-colors text-sm">← Home</button>
          {editingName ? (
            <input
              ref={nameInputRef}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={commitNameEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitNameEdit()
                if (e.key === 'Escape') setEditingName(false)
              }}
              className="bg-slate-700 text-white rounded px-2 py-0.5 outline-none focus:ring-2 focus:ring-orange-500 font-semibold text-sm"
            />
          ) : (
            <span
              className="text-white font-semibold cursor-text hover:text-orange-300 transition-colors"
              title="Click to rename"
              onClick={startNameEdit}
            >{activeSet.name}</span>
          )}
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

        <div className="flex-1 flex flex-col bg-slate-950 overflow-x-hidden">
          <div className="flex flex-col items-center flex-shrink-0">
            {/* Instruction text — only when action is active */}
            <div className="h-8 flex items-center justify-center">
              {showInstruction && (
                <div className="text-sm text-orange-300 font-medium flex items-center gap-2">
                  {instructionText}
                  <button onClick={cancelAll} className="ml-3 text-slate-400 hover:text-white text-xs underline">Cancel</button>
                </div>
              )}
            </div>

            {/* Full-court direction bar — always visible */}
            {activeSet.courtType === 'full' && (
              <div className="flex flex-col items-center w-full px-5 pb-2 gap-1">
                {atkLeft ? (
                  <div className="flex items-center w-full text-orange-500">
                    <span className="text-[11px] font-bold mr-1 whitespace-nowrap">ATK</span>
                    <svg width="7" height="9" viewBox="0 0 7 9" fill="currentColor"><path d="M7 0L0 4.5L7 9z"/></svg>
                    <div className="flex-1 h-0.5 bg-orange-500 opacity-60"/>
                  </div>
                ) : (
                  <div className="flex items-center w-full text-orange-500">
                    <div className="flex-1 h-0.5 bg-orange-500 opacity-60"/>
                    <svg width="7" height="9" viewBox="0 0 7 9" fill="currentColor"><path d="M0 0L7 4.5L0 9z"/></svg>
                    <span className="text-[11px] font-bold ml-1 whitespace-nowrap">ATK</span>
                  </div>
                )}
                {/* Flip below the arrows */}
                <button
                  onClick={flipAttackBasket}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-xs transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/>
                    <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
                  </svg>
                  Flip
                </button>
              </div>
            )}
          </div>
          <div ref={courtAreaRef} className="flex-1 flex items-center justify-center px-4 overflow-hidden">
          <div className={`flex flex-row gap-3 ${activeSet.courtType === 'full' ? 'items-center' : 'items-end'}`}>
          <div
            className="relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleCourtDrop}
          >
            <CourtCanvas
              courtType={activeSet.courtType}
              stageRef={stageRef}
              scale={activeSet.courtType === 'full' ? courtScale : 1}
              landscape={activeSet.courtType === 'full'}
              attackBasket={activeSet.attackBasket}
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
                attackBasket={activeSet.attackBasket}
              />
              <ActionPreview
                actionType={actionCreation.type}
                pendingSourceId={actionCreation.pendingSourceId}
                ballHolderId={currentState.ball.holderId}
                positions={effectivePositions}
                mousePos={mousePos}
                courtType={activeSet.courtType}
                dribbleWaypoints={dribbleWaypoints}
                cutWaypoints={cutWaypoints}
              />
              {/* Marking lines — only when enabled */}
              {markingsEnabled && Object.entries(activeSet.markings ?? {}).map(([defId, offId]) => {
                const dp = effectivePositions[defId]
                const op = effectivePositions[offId]
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

              {/* Growing pass arrow during animation */}
              {(() => {
                if (!isPlaying || activeStep >= total) return null
                const action = activeSet.actions[activeStep]
                if (action?.type !== 'pass') return null
                const fromPos = currentState.positions[action.fromId]
                const toPos = currentState.positions[action.toId]
                if (!fromPos || !toPos) return null
                const from = denormalize(fromPos.x, fromPos.y, HALF_COURT_W, cH)
                const to   = denormalize(toPos.x, toPos.y, HALF_COURT_W, cH)
                const PLAYER_R = Math.round(20 * 1.4)
                const ARROW_G  = Math.round(6 * 1.4)
                const gap = PLAYER_R + ARROW_G
                const dxF = to.x - from.x, dyF = to.y - from.y
                const lenF = Math.sqrt(dxF * dxF + dyF * dyF) || 1
                const finalEnd = { x: to.x - (dxF / lenF) * gap, y: to.y - (dyF / lenF) * gap }
                const rawTipX  = from.x + (to.x - from.x) * animFraction
                const rawTipY  = from.y + (to.y - from.y) * animFraction
                const rawDist   = Math.hypot(rawTipX - from.x, rawTipY - from.y)
                const finalDist = Math.hypot(finalEnd.x - from.x, finalEnd.y - from.y)
                const end = rawDist < finalDist ? { x: rawTipX, y: rawTipY } : finalEnd
                const color = ACTION_COLORS['pass']
                return (
                  <Arrow
                    points={[from.x, from.y, end.x, end.y]}
                    stroke={color} fill={color}
                    strokeWidth={2.5} dash={[10, 6]}
                    pointerLength={10} pointerWidth={8}
                    listening={false}
                  />
                )
              })()}

              {/* Players — rendered above arrows */}
              {activeSet.players.map(player => {
                const pos = displayPositions[player.id] ?? { x: 0.5, y: 0.5 }
                return (
                  <PlayerNode
                    key={player.id}
                    player={player}
                    position={pos}
                    courtType={activeSet.courtType}
                    landscape={activeSet.courtType === 'full'}
                    hasBall={currentState.ball.holderId === player.id}
                    isSelected={actionCreation.pendingSourceId === player.id}
                    draggable={!(actionCreation.type && player.team === 'defense')}
                    onDragStart={() => {
                      playerDragWaypoints.current = []
                      lastPlayerDragPt.current = null
                      playerDragHadPath.current = false
                    }}
                    onDragMove={(_id, pos) => {
                      const last = lastPlayerDragPt.current
                      if (!last) { lastPlayerDragPt.current = pos; return }
                      const dx = (pos.x - last.x) * HALF_COURT_W
                      const dy = (pos.y - last.y) * cH
                      if (Math.sqrt(dx * dx + dy * dy) >= SAMPLE_DIST) {
                        playerDragHadPath.current = true
                        playerDragWaypoints.current.push(pos)
                        lastPlayerDragPt.current = pos
                      }
                    }}
                    onDragEnd={(id, newPos) => {
                      const hasActions = activeSet.actions.some(a => {
                        switch (a.type) {
                          case 'pass': return a.fromId === id || a.toId === id
                          case 'cut': case 'dribble': case 'defense-move': return a.playerId === id
                          case 'screen': return a.screenerId === id
                          case 'shot': return a.shooterId === id
                          case 'handoff': return a.fromId === id || a.toId === id
                          case 'double-team': return a.defender1Id === id || a.defender2Id === id || a.targetId === id
                          case 'ball-force': return a.defenderId === id
                          default: return false
                        }
                      })
                      if (activeStep === 0 || !hasActions) {
                        updateInitialPosition(id, newPos)
                        return
                      }
                      if (actionCreation.type) {
                        setPositionOverrides(prev => ({ ...prev, [id]: newPos }))
                        return
                      }
                      const player = activeSet.players.find(p => p.id === id)
                      if (!player) return
                      const waypoints = playerDragHadPath.current && playerDragWaypoints.current.length > 2
                        ? [...playerDragWaypoints.current]
                        : undefined
                      if (player.team === 'defense') {
                        addAction({ id: nanoid(), type: 'defense-move', playerId: id, toPosition: newPos })
                      } else if (currentState.ball.holderId === id) {
                        addAction({ id: nanoid(), type: 'dribble', playerId: id, toPosition: newPos, waypoints })
                      } else {
                        addAction({ id: nanoid(), type: 'cut', playerId: id, toPosition: newPos, waypoints })
                      }
                    }}
                    onClick={handlePlayerClick}
                  />
                )
              })}

              {/* Action type labels — rendered last (above players) with smart placement */}
              {activeSet.actions.slice(0, isPlaying ? activeStep + 1 : activeStep).map((action, i) => {
                const stateBefore = computeStateAtStep(
                  activeSet.actions, i, activeSet.initialPositions, activeSet.initialBall, activeMarkings, basketY
                )
                const line = arrowLine(action, stateBefore.positions, cH)
                if (!line) return null
                const playersPx = Object.values(stateBefore.positions).map(p =>
                  denormalize(p.x, p.y, HALF_COURT_W, cH)
                )
                const { cx, cy } = smartLabelCenter(line.x1, line.y1, line.x2, line.y2, playersPx)
                const isLatest = isPlaying ? i === activeStep : i === activeStep - 1
                const isLandscape = activeSet.courtType === 'full'
                return (
                  <Text
                    key={action.id + '-lbl'}
                    x={cx} y={cy}
                    offsetX={25} offsetY={5}
                    width={50}
                    rotation={isLandscape ? 90 : 0}
                    text={ACTION_LABELS[action.type]}
                    fontSize={10} fontStyle="bold"
                    fill={ACTION_COLORS[action.type]}
                    align="center"
                    opacity={isLatest ? 1 : 0.45}
                    listening={false}
                  />
                )
              })}

              {/* optionText badge — rendered topmost, above labels and players */}
              {(() => {
                const action = activeSet.actions[activeStep - 1]
                if (!action?.optionText) return null
                const holder = displayPositions[currentState.ball.holderId]
                if (!holder) return null
                const hpx = denormalize(holder.x, holder.y, HALF_COURT_W, cH)
                const W = Math.min(Math.max(action.optionText.length * 7 + 16, 60), 140)
                const H = 20
                return (
                  <Group x={hpx.x + 24} y={hpx.y - H / 2} listening={false}>
                    <Rect width={W} height={H} fill="#1e293b" cornerRadius={4}
                      stroke="#fb923c" strokeWidth={1.5} shadowBlur={6} shadowColor="rgba(0,0,0,0.5)" />
                    <Text text={action.optionText} width={W} height={H}
                      fontSize={10} fontStyle="bold" fill="#f1f5f9"
                      align="center" verticalAlign="middle" listening={false} />
                  </Group>
                )
              })()}
            </CourtCanvas>
          </div>

          {benchPlayers.length > 0 && (
            <div className="flex flex-col items-center gap-2 px-2 py-3 bg-slate-800/60 rounded-xl border border-slate-700">
              <span className="text-slate-500 text-xs">Bench</span>
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
        </div>

        <div className="w-64 flex flex-col border-l border-slate-700">
          <ActionPanel />
        </div>
      </div>

      <PlaybackControls onExport={() => setShowExport(true)} />

      {showExport && (
        <ExportModal
          stageRef={stageRef}
          stepMs={STEP_MS}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}
