import { computeStateAtStep, type GameState } from './stateEngine'
import { HALF_COURT_W } from './courtCoords'
import type { Action, ActionItem, PlaySet, PositionMap } from '../models/types'

export interface FrameState {
  activeStep: number
  animFraction: number
  isPlaying: boolean
  /** Positions + ball at the discrete activeStep (no interpolation). */
  currentState: GameState
  /**
   * Interpolated positions for this exact instant.
   * Does NOT include editor-side `positionOverrides` (drag previews) —
   * consumers that need those must merge them at the call site (EditorPage does this).
   */
  displayPositions: PositionMap
}

export function computeFrameState(
  set: PlaySet,
  activeStep: number,
  animFraction: number,
  isPlaying: boolean,
  basketY: number,
  cH: number,
  markings?: Record<string, string>,
): FrameState {
  const total = set.actions.length
  const currentState = computeStateAtStep(
    set.actions, activeStep, set.initialPositions, set.initialBall, markings, basketY, HALF_COURT_W, cH,
  )

  let displayPositions: PositionMap
  if (!isPlaying || activeStep >= total) {
    displayPositions = { ...currentState.positions }
  } else {
    const toState = computeStateAtStep(
      set.actions, activeStep + 1, set.initialPositions, set.initialBall, markings, basketY, HALF_COURT_W, cH,
    )
    const t = animFraction
    const currentItem = set.actions[activeStep] as ActionItem | undefined
    const currentStepActions: Action[] = !currentItem ? [] : currentItem.type === 'group' ? currentItem.actions : [currentItem]
    displayPositions = Object.fromEntries(
      Object.keys(currentState.positions).map(id => {
        const from = currentState.positions[id] ?? { x: 0.5, y: 0.5 }
        const to = toState.positions[id] ?? from
        const moverAction = currentStepActions.find(a =>
          (a.type === 'dribble' || a.type === 'cut' || a.type === 'defense-move') &&
          a.playerId === id && a.waypoints && a.waypoints.length > 1,
        )
        if (moverAction && (moverAction.type === 'dribble' || moverAction.type === 'cut' || moverAction.type === 'defense-move') && moverAction.waypoints) {
          const path = [from, ...moverAction.waypoints]
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
      }),
    )
  }

  return { activeStep, animFraction, isPlaying, currentState, displayPositions }
}
