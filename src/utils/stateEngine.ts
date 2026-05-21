import type { Action, PositionMap, BallState } from '../models/types'

export interface GameState {
  positions: PositionMap
  ball: BallState
}

export function applyAction(
  action: Action,
  state: GameState,
  markings?: Record<string, string>,
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
  }

  if (markings) {
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
  }

  return { positions, ball }
}

export function computeStateAtStep(
  actions: Action[],
  step: number,
  initialPositions: PositionMap,
  initialBall: BallState,
  markings?: Record<string, string>,
): GameState {
  let state: GameState = {
    positions: { ...initialPositions },
    ball: { ...initialBall },
  }
  const limit = Math.min(step, actions.length)
  for (let i = 0; i < limit; i++) {
    state = applyAction(actions[i], state, markings)
  }
  return state
}
