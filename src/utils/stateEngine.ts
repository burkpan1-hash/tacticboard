import type { Action, PositionMap, BallState } from '../models/types'

export interface GameState {
  positions: PositionMap
  ball: BallState
}

export function applyAction(action: Action, state: GameState): GameState {
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
    case 'handoff':
      positions[action.fromId] = action.meetPosition
      ball = { holderId: action.toId }
      break
  }

  return { positions, ball }
}

export function computeStateAtStep(
  actions: Action[],
  step: number,
  initialPositions: PositionMap,
  initialBall: BallState,
): GameState {
  let state: GameState = {
    positions: { ...initialPositions },
    ball: { ...initialBall },
  }
  const limit = Math.min(step, actions.length)
  for (let i = 0; i < limit; i++) {
    state = applyAction(actions[i], state)
  }
  return state
}
