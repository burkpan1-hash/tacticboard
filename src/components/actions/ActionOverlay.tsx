import { Group } from 'react-konva'
import ActionArrow from './ActionArrow'
import { computeStateAtStep } from '../../utils/stateEngine'
import type { Action, PositionMap, BallState, CourtType } from '../../models/types'
import { HALF_COURT_H, FULL_COURT_H } from '../../utils/courtCoords'

const BASKET_PX = 42

function getBasketY(courtType: CourtType, attackBasket?: 'top' | 'bottom'): number {
  if (courtType === 'half') return BASKET_PX / HALF_COURT_H
  return attackBasket === 'bottom' ? 1 - BASKET_PX / FULL_COURT_H : BASKET_PX / FULL_COURT_H
}

interface Props {
  actions: Action[]
  initialPositions: PositionMap
  initialBall: BallState
  activeStep: number
  courtType: CourtType
  markings?: Record<string, string>
  attackBasket?: 'top' | 'bottom'
}

export default function ActionOverlay({ actions, initialPositions, initialBall, activeStep, courtType, markings, attackBasket }: Props) {
  const basketY = getBasketY(courtType, attackBasket)
  return (
    <Group>
      {actions.slice(0, activeStep).map((action, i) => {
        const stateBefore = computeStateAtStep(actions, i, initialPositions, initialBall, markings, basketY)
        const isLatest = i === activeStep - 1
        return (
          <Group key={action.id} opacity={isLatest ? 1 : 0.45}>
            <ActionArrow
              action={action}
              positions={stateBefore.positions}
              courtType={courtType}
              basketY={basketY}
            />
          </Group>
        )
      })}
    </Group>
  )
}
