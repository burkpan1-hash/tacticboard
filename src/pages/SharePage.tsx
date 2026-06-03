import { useEffect, useRef, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Arrow, Group, Rect, Text } from 'react-konva'
import { useTranslation } from 'react-i18next'
import { usePlayStore } from '../store/usePlayStore'
import UserButton from '../components/ui/UserButton'
import CourtCanvas from '../components/court/CourtCanvas'
import ActionOverlay from '../components/actions/ActionOverlay'
import PlayerNode from '../components/players/PlayerNode'
import PlaybackControls from '../components/playback/PlaybackControls'
import { computeStateAtStep } from '../utils/stateEngine'
import { denormalize } from '../utils/courtCoords'
import { ACTION_COLORS, ACTION_LABEL_KEYS, actionLabelPlayerId } from '../utils/actionColors'
import {
  HALF_COURT_W, HALF_COURT_H, FULL_COURT_H,
  COURT_PADDING_X, COURT_PADDING_Y, HALF_COURT_PADDING_TOP,
  HALF_COURT,
} from '../utils/courtCoords'
import type { Action, NormalizedPosition, PlaySet, PositionMap } from '../models/types'

const STAGE_W = HALF_COURT_W + 2 * COURT_PADDING_X
const BASKET_PX = HALF_COURT.basket.y                // 42 — basket y inside court, not padding
const STEP_MS = 1600

// --- helpers copied from EditorPage ---
function arrowLine(action: Action, positions: PositionMap, cH: number, basketPxY: number): { x1: number; y1: number; x2: number; y2: number } | null {
  const px = (id: string) => { const p = positions[id]; return p ? denormalize(p.x, p.y, HALF_COURT_W, cH) : null }
  const pp = (p: NormalizedPosition) => denormalize(p.x, p.y, HALF_COURT_W, cH)
  switch (action.type) {
    case 'pass':         { const f = px(action.fromId), t = px(action.toId); if (!f || !t) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'cut':          { const f = px(action.playerId), t = pp(action.toPosition); if (!f) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'screen':       { const f = px(action.screenerId), t = pp(action.screenPosition); if (!f) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'shot':         { const f = px(action.shooterId); if (!f) return null; return { x1: f.x, y1: f.y, x2: HALF_COURT.basket.x, y2: basketPxY } }
    case 'handoff':      { const f = px(action.fromId), t = pp(action.meetPosition); if (!f) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'defense-move': { const f = px(action.playerId), t = pp(action.toPosition); if (!f) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'double-team':  { const f = px(action.defender1Id), t = px(action.targetId); if (!f || !t) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'ball-force': {
      const f = px(action.defenderId); const target = positions[action.targetId]
      if (!f || !target) return null
      const tPx = pp(target)
      return { x1: f.x, y1: f.y, x2: tPx.x + Math.cos(action.angle) * 77, y2: tPx.y + Math.sin(action.angle) * 77 }
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
// --- end helpers ---

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { setActiveSet, activeSet, activeStep, isPlaying, setIsPlaying, playbackSpeed } = usePlayStore()
  const [title, setTitle] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  // Scale computation
  const courtAreaRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    function measure() {
      const el = courtAreaRef.current
      if (!el) return
      const { width, height } = el.getBoundingClientRect()
      if (width > 0 && height > 0) setContainerSize({ width, height })
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (courtAreaRef.current) ro.observe(courtAreaRef.current)
    return () => ro.disconnect()
  }, [])

  const scale = useMemo(() => {
    const { width, height } = containerSize
    if (!width || !height || !activeSet) return 1
    if (activeSet.courtType === 'full') {
      const stageW = FULL_COURT_H + 2 * COURT_PADDING_Y
      const stageH = STAGE_W
      return Math.min(1, (width - 8) / stageW, (height - 8) / stageH)
    }
    const stageH = HALF_COURT_H + HALF_COURT_PADDING_TOP + COURT_PADDING_Y
    return Math.min(1, (width - 8) / STAGE_W, (height - 8) / stageH)
  }, [containerSize, activeSet])

  // Smooth playback animation loop (identical to EditorPage)
  const [animFraction, setAnimFraction] = useState(0)
  const animFractionRef = useRef(0)
  const rafRef = useRef<number>(0)
  const lastTsRef = useRef<number>(0)

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
  }, [isPlaying, setIsPlaying, playbackSpeed])

  // Fetch play data
  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null }
        return r.json()
      })
      .then((play) => {
        if (!play) return
        setTitle(play.title)
        setActiveSet(play.data as PlaySet)
      })
      .finally(() => setLoading(false))
  }, [token, setActiveSet])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-slate-400">{t('common.loading')}</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-900">
        <p className="text-slate-400 text-lg">{t('share.notFound')}</p>
        <button onClick={() => navigate('/')} className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-2 rounded-lg">
          {t('share.homeButton')}
        </button>
      </div>
    )
  }

  if (!activeSet) return null

  const cH = activeSet.courtType === 'half' ? HALF_COURT_H : FULL_COURT_H
  const basketY = activeSet.courtType === 'half'
    ? BASKET_PX / HALF_COURT_H
    : (activeSet.attackBasket === 'bottom' ? 1 - BASKET_PX / FULL_COURT_H : BASKET_PX / FULL_COURT_H)
  const total = activeSet.actions.length
  const isLandscape = activeSet.courtType === 'full'

  const currentState = computeStateAtStep(
    activeSet.actions, activeStep, activeSet.initialPositions, activeSet.initialBall,
    undefined, basketY, HALF_COURT_W, cH,
  )

  // Interpolated display positions (identical to EditorPage)
  const displayPositions: PositionMap = (() => {
    if (!isPlaying || activeStep >= total) return currentState.positions
    const toState = computeStateAtStep(
      activeSet.actions, activeStep + 1, activeSet.initialPositions, activeSet.initialBall,
      undefined, basketY, HALF_COURT_W, cH,
    )
    const t = animFraction
    const currentAction = activeSet.actions[activeStep]
    return Object.fromEntries(
      Object.keys(currentState.positions).map(id => {
        const from = currentState.positions[id] ?? { x: 0.5, y: 0.5 }
        const to = toState.positions[id] ?? from
        if (
          (currentAction?.type === 'dribble' || currentAction?.type === 'cut' || currentAction?.type === 'defense-move') &&
          currentAction.playerId === id &&
          currentAction.waypoints && currentAction.waypoints.length > 1
        ) {
          const path = [from, ...currentAction.waypoints]
          const lens: number[] = []
          let pathTotal = 0
          for (let i = 1; i < path.length; i++) {
            const dx = path[i].x - path[i - 1].x
            const dy = path[i].y - path[i - 1].y
            const l = Math.sqrt(dx * dx + dy * dy)
            lens.push(l)
            pathTotal += l
          }
          if (pathTotal === 0) return [id, from]
          const target = t * pathTotal
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

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
        <h1 className="text-white font-semibold truncate mr-4">{title}</h1>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-slate-500 bg-slate-700 px-3 py-1 rounded-full">{t('share.readOnly')}</span>
          <UserButton />
        </div>
      </div>

      <div ref={courtAreaRef} className="flex-1 flex items-center justify-center overflow-hidden bg-slate-950">
        <CourtCanvas
          courtType={activeSet.courtType}
          attackBasket={activeSet.attackBasket}
          scale={scale}
          landscape={isLandscape}
        >
          <ActionOverlay
            actions={activeSet.actions}
            initialPositions={activeSet.initialPositions}
            initialBall={activeSet.initialBall}
            activeStep={activeStep}
            courtType={activeSet.courtType}
            attackBasket={activeSet.attackBasket}
          />

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

          {/* Players */}
          {activeSet.players.map(player => {
            const pos = displayPositions[player.id] ?? { x: 0.5, y: 0.5 }
            return (
              <PlayerNode
                key={player.id}
                player={player}
                position={pos}
                courtType={activeSet.courtType}
                landscape={isLandscape}
                hasBall={currentState.ball.holderId === player.id}
                draggable={false}
                onDragEnd={() => {}}
              />
            )
          })}

          {/* Action type labels */}
          {activeSet.actions.slice(0, isPlaying ? activeStep + 1 : activeStep).map((action, i) => {
            const stateBefore = computeStateAtStep(
              activeSet.actions, i, activeSet.initialPositions, activeSet.initialBall,
              undefined, basketY, HALF_COURT_W, cH,
            )
            const line = arrowLine(action, stateBefore.positions, cH, basketY * cH)
            if (!line) return null
            const playersPx = Object.values(stateBefore.positions).map(p =>
              denormalize(p.x, p.y, HALF_COURT_W, cH)
            )
            const { cx, cy } = smartLabelCenter(line.x1, line.y1, line.x2, line.y2, playersPx)
            const isLatest = isPlaying ? i === activeStep : i === activeStep - 1
            return (
              <Text
                key={action.id + '-lbl'}
                x={cx} y={cy}
                offsetX={25} offsetY={5}
                width={50}
                rotation={isLandscape ? 90 : 0}
                text={t(ACTION_LABEL_KEYS[action.type])}
                fontSize={10} fontStyle="bold"
                fill={ACTION_COLORS[action.type]}
                align="center"
                opacity={isLatest ? 1 : 0.45}
                listening={false}
              />
            )
          })}

          {/* optionText badge — anchored to the action's primary player, not the ball holder */}
          {(() => {
            const action = activeSet.actions[activeStep - 1]
            if (!action?.optionText) return null
            const anchorId = actionLabelPlayerId(action)
            const anchor = displayPositions[anchorId]
            if (!anchor) return null
            const hpx = denormalize(anchor.x, anchor.y, HALF_COURT_W, cH)
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

      <div className="shrink-0">
        <PlaybackControls />
      </div>
    </div>
  )
}
