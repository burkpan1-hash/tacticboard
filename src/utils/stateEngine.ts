import type { Action, ActionItem, PositionMap, BallState, NormalizedPosition } from '../models/types'

export interface GameState {
  positions: PositionMap
  ball: BallState
}

// basketY: normalized y of the attack basket (default = half-court top basket)
const DEFAULT_BASKET_Y = 42 / 658

export function computeDoubleTeamPositions(
  defender1Id: string,
  defender2Id: string,
  targetId: string,
  positions: PositionMap,
  basketY: number = DEFAULT_BASKET_Y,
): { p1: NormalizedPosition; p2: NormalizedPosition } | null {
  const target = positions[targetId]
  if (!target) return null

  const GAP = 0.09
  const SIDELINE_THR = 0.15
  const clamp = (v: number) => Math.max(0, Math.min(1, v))

  const dp1 = positions[defender1Id] ?? target
  const dp2 = positions[defender2Id] ?? target

  let p1: NormalizedPosition
  let p2: NormalizedPosition

  const isNearLeft  = target.x < SIDELINE_THR
  const isNearRight = target.x > 1 - SIDELINE_THR

  if (isNearLeft || isNearRight) {
    // Sideline trap: interior pressure + baseline pressure toward the attack basket
    const interiorX = clamp(isNearLeft ? target.x + GAP * 1.2 : target.x - GAP * 1.2)
    const posA = { x: interiorX, y: target.y }
    // Toward the attack basket — direction depends on which end is the basket
    const basketToward = basketY < 0.5 ? clamp(target.y - GAP) : clamp(target.y + GAP)
    const posB = { x: target.x, y: basketToward }

    const d1ToA = Math.hypot(dp1.x - posA.x, dp1.y - posA.y)
    const d1ToB = Math.hypot(dp1.x - posB.x, dp1.y - posB.y)
    if (d1ToA <= d1ToB) { p1 = posA; p2 = posB } else { p1 = posB; p2 = posA }
  } else {
    // Open court: one defender directly between target and basket, one lateral
    const bdx = 0.5 - target.x  // basket x is always 0.5
    const bdy = basketY - target.y
    const bdist = Math.sqrt(bdx * bdx + bdy * bdy) || 1
    const ux = bdx / bdist, uy = bdy / bdist

    // posA: on the direct lane from target toward basket
    const posA = { x: clamp(target.x + ux * GAP), y: clamp(target.y + uy * GAP) }

    // posB: lateral with a basket-direction offset — pick the side closer to a defender
    const posL = { x: clamp(target.x - GAP * 1.2), y: clamp(target.y + uy * GAP * 0.6) }
    const posR = { x: clamp(target.x + GAP * 1.2), y: clamp(target.y + uy * GAP * 0.6) }
    const minDistTo = (pos: NormalizedPosition) => Math.min(
      Math.hypot(dp1.x - pos.x, dp1.y - pos.y),
      Math.hypot(dp2.x - pos.x, dp2.y - pos.y),
    )
    const posB = minDistTo(posL) <= minDistTo(posR) ? posL : posR

    const d1ToA = Math.hypot(dp1.x - posA.x, dp1.y - posA.y)
    const d1ToB = Math.hypot(dp1.x - posB.x, dp1.y - posB.y)
    if (d1ToA <= d1ToB) { p1 = posA; p2 = posB } else { p1 = posB; p2 = posA }
  }

  return { p1, p2 }
}

export function applyAction(
  action: Action,
  state: GameState,
  markings?: Record<string, string>,
  basketY: number = DEFAULT_BASKET_Y,
  courtW = 700,
  courtH = 658,
): GameState {
  const positions = { ...state.positions }
  let ball = { ...state.ball }

  switch (action.type) {
    case 'pass':
      ball = { holderId: action.toId }
      break
    case 'cut':
      positions[action.playerId] = action.toPosition
      break
    case 'dribble':
      positions[action.playerId] = action.toPosition
      break
    case 'screen':
      positions[action.screenerId] = action.screenPosition
      break
    case 'shot':
      ball = { holderId: '' }
      break
    case 'handoff': {
      // receiver stops at meet point, giver continues ~45px past it
      const OVERSHOOT = 0.09
      const fp = state.positions[action.fromId]
      const m = action.meetPosition
      const dx = m.x - fp.x, dy = m.y - fp.y
      const len = Math.sqrt(dx * dx + dy * dy) || 1
      positions[action.fromId] = {
        x: Math.max(0, Math.min(1, m.x + (dx / len) * OVERSHOOT)),
        y: Math.max(0, Math.min(1, m.y + (dy / len) * OVERSHOOT)),
      }
      positions[action.toId] = m
      ball = { holderId: action.toId }
      break
    }
    case 'defense-move':
      positions[action.playerId] = action.toPosition
      break
    case 'double-team': {
      const result = computeDoubleTeamPositions(
        action.defender1Id, action.defender2Id, action.targetId, positions, basketY,
      )
      if (!result) break
      positions[action.defender1Id] = result.p1
      positions[action.defender2Id] = result.p2
      break
    }
    case 'ball-force': {
      const target = positions[action.targetId]
      if (!target) break
      const DEFENDER_PX = 77
      positions[action.defenderId] = {
        x: Math.max(0, Math.min(1, target.x + Math.cos(action.angle) * DEFENDER_PX / courtW)),
        y: Math.max(0, Math.min(1, target.y + Math.sin(action.angle) * DEFENDER_PX / courtH)),
      }
      break
    }
  }

  const baseState = { positions, ball }
  return markings ? applyMarkingsToState(baseState, markings) : baseState
}

function applyMarkingsToState(
  state: GameState,
  markings: Record<string, string>,
): GameState {
  const positions = { ...state.positions }
  const BASKET = { x: 0.5, y: 0.1128 }
  const OFFSET = 0.12
  for (const [defId, offId] of Object.entries(markings)) {
    const op = positions[offId]
    if (!op) continue
    const dx = BASKET.x - op.x
    const dy = BASKET.y - op.y
    const len = Math.sqrt(dx * dx + dy * dy)
    const ux = len < 0.05 ? 0 : dx / len
    const uy = len < 0.05 ? 1 : dy / len
    positions[defId] = {
      x: Math.max(0.02, Math.min(0.98, op.x + ux * OFFSET)),
      y: Math.max(0.02, Math.min(0.98, op.y + uy * OFFSET)),
    }
  }
  return { ...state, positions }
}

function applyStep(
  item: ActionItem,
  state: GameState,
  markings?: Record<string, string>,
  basketY: number = DEFAULT_BASKET_Y,
  courtW = 700,
  courtH = 658,
): GameState {
  if (item.type === 'group') {
    let s = state
    for (const action of item.actions) {
      s = applyAction(action, s, markings, basketY, courtW, courtH)
    }
    return s
  }
  return applyAction(item, state, markings, basketY, courtW, courtH)
}

// ── Duration computation ─────────────────────────────────────────────────────

function ndist(a: NormalizedPosition, b: NormalizedPosition): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function pathLen(start: NormalizedPosition, waypoints: NormalizedPosition[] | undefined, end: NormalizedPosition): number {
  const pts = [start, ...(waypoints ?? []), end]
  let d = 0
  for (let i = 1; i < pts.length; i++) d += ndist(pts[i - 1], pts[i])
  return d
}

function singleActionDist(action: Action, positions: PositionMap, ball: BallState, basketY: number): number {
  switch (action.type) {
    case 'cut':
    case 'dribble':
    case 'defense-move': {
      const from = positions[action.playerId]
      return from ? pathLen(from, action.waypoints, action.toPosition) : 0.15
    }
    case 'pass': {
      const from = positions[ball.holderId] ?? positions[action.fromId]
      const to = positions[action.toId]
      return (from && to) ? ndist(from, to) : 0.20
    }
    case 'shot': {
      const from = positions[action.shooterId]
      return from ? ndist(from, { x: 0.5, y: basketY }) : 0.20
    }
    case 'screen': {
      const from = positions[action.screenerId]
      return from ? ndist(from, action.screenPosition) : 0.10
    }
    case 'handoff': {
      const from = positions[action.fromId]
      return from ? ndist(from, action.meetPosition) : 0.15
    }
    case 'double-team': return 0.15
    case 'ball-force':  return 0.12
    default: return 0.15
  }
}

const STEP_MS_MIN   = 600
const STEP_MS_MAX   = 2400
const STEP_MS_SCALE = 4500

function computeStepMsForItem(item: ActionItem, positions: PositionMap, ball: BallState, basketY: number): number {
  const d = item.type === 'group'
    ? Math.max(0.05, ...item.actions.map(a => singleActionDist(a, positions, ball, basketY)))
    : singleActionDist(item, positions, ball, basketY)
  return Math.round(Math.min(STEP_MS_MAX, Math.max(STEP_MS_MIN, d * STEP_MS_SCALE)))
}

export function computeAllStepMs(
  actions: ActionItem[],
  initialPositions: PositionMap,
  initialBall: BallState,
  basketY: number,
): number[] {
  let state: GameState = { positions: { ...initialPositions }, ball: { ...initialBall } }
  return actions.map(item => {
    const ms = computeStepMsForItem(item, state.positions, state.ball, basketY)
    state = applyStep(item, state, undefined, basketY)
    return ms
  })
}

export function computeStateAtStep(
  actions: ActionItem[],
  step: number,
  initialPositions: PositionMap,
  initialBall: BallState,
  markings?: Record<string, string>,
  basketY: number = DEFAULT_BASKET_Y,
  courtW = 700,
  courtH = 658,
): GameState {
  let state: GameState = {
    positions: { ...initialPositions },
    ball: { ...initialBall },
  }
  // Apply markings to initial state so defenders are positioned at step 0
  if (markings && Object.keys(markings).length > 0) {
    state = applyMarkingsToState(state, markings)
  }
  const limit = Math.min(step, actions.length)
  for (let i = 0; i < limit; i++) {
    state = applyStep(actions[i], state, markings, basketY, courtW, courtH)
  }
  return state
}
