import { Group } from 'react-konva'
import ActionArrow from './ActionArrow'
import { computeStateAtStep } from '../../utils/stateEngine'
import type { Action, PositionMap, BallState, CourtType } from '../../models/types'

interface Props {
  actions: Action[]
  initialPositions: PositionMap
  initialBall: BallState
  activeStep: number
  courtType: CourtType
}

export default function ActionOverlay({ actions, initialPositions, initialBall, activeStep, courtType }: Props) {
  return (
    <Group>
      {actions.slice(0, activeStep).map((action, i) => {
        const stateBefore = computeStateAtStep(actions, i, initialPositions, initialBall)
        const isLatest = i === activeStep - 1
        return (
          <Group key={action.id} opacity={isLatest ? 1 : 0.45}>
            <ActionArrow
              action={action}
              positions={stateBefore.positions}
              courtType={courtType}
            />
          </Group>
        )
      })}
    </Group>
  )
}
