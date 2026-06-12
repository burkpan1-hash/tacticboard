import { Group } from 'react-konva'
import ActionArrow from './ActionArrow'
import { computeStateAtStep } from '../../utils/stateEngine'
import type { ActionItem, PositionMap, BallState, CourtType } from '../../models/types'
import { HALF_COURT_W, HALF_COURT_H, FULL_COURT_H } from '../../utils/courtCoords'

const BASKET_PX = 42

function getBasketY(courtType: CourtType, attackBasket?: 'top' | 'bottom'): number {
  if (courtType === 'half') return BASKET_PX / HALF_COURT_H
  return attackBasket === 'bottom' ? 1 - BASKET_PX / FULL_COURT_H : BASKET_PX / FULL_COURT_H
}

interface Props {
  actions: ActionItem[]
  initialPositions: PositionMap
  initialBall: BallState
  activeStep: number
  courtType: CourtType
  markings?: Record<string, string>
  attackBasket?: 'top' | 'bottom'
}

export default function ActionOverlay({ actions, initialPositions, initialBall, activeStep, courtType, markings, attackBasket }: Props) {
  const basketY = getBasketY(courtType, attackBasket)
  const courtH = courtType === 'half' ? HALF_COURT_H : FULL_COURT_H
  return (
    <Group>
      {actions.slice(Math.max(0, activeStep - 2), activeStep).flatMap((item, localIdx) => {
        const globalIdx = Math.max(0, activeStep - 2) + localIdx
        const stateBefore = computeStateAtStep(actions, globalIdx, initialPositions, initialBall, markings, basketY, HALF_COURT_W, courtH)
        const isLatest = globalIdx === activeStep - 1
        const actionList = item.type === 'group' ? item.actions : [item]
        return actionList.map(action => (
          <Group key={action.id} opacity={isLatest ? 1 : 0.25}>
            <ActionArrow
              action={action}
              positions={stateBefore.positions}
              courtType={courtType}
              basketY={basketY}
            />
          </Group>
        ))
      })}
    </Group>
  )
}
