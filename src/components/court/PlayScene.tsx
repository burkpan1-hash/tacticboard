import { Group, Rect, Text } from 'react-konva'
import { useTranslation } from 'react-i18next'
import ActionOverlay from '../actions/ActionOverlay'
import GrowingActionArrow from '../actions/GrowingActionArrow'
import PlayerNode from '../players/PlayerNode'
import { computeStateAtStep } from '../../utils/stateEngine'
import { denormalize, HALF_COURT_W } from '../../utils/courtCoords'
import { arrowLine } from '../../utils/actionArrows'
import { placeActionLabel, type Segment } from '../../utils/labelPlacement'
import { ACTION_COLORS, ACTION_LABEL_KEYS, actionLabelPlayerId, actionTeam } from '../../utils/actionColors'
import type { Action, ActionItem, PlaySet } from '../../models/types'
import type { FrameState } from '../../utils/frameState'

interface Props {
  set: PlaySet
  frame: FrameState
  basketY: number
  cH: number
}

export default function PlayScene({ set, frame, basketY, cH }: Props) {
  const { t } = useTranslation()
  const { activeStep, animFraction, isPlaying, currentState, displayPositions } = frame
  const total = set.actions.length
  const isLandscape = set.courtType === 'full'

  return (
    <>
      <ActionOverlay
        actions={set.actions}
        initialPositions={set.initialPositions}
        initialBall={set.initialBall}
        activeStep={activeStep}
        courtType={set.courtType}
        attackBasket={set.attackBasket}
        historyDepth={1}
        hiddenTeams={set.hiddenArrowTeams}
      />

      {/* Growing action arrows during animation — behind the moving player, every action type */}
      {isPlaying && activeStep < total && (() => {
        const ci = set.actions[activeStep] as ActionItem | undefined
        const stepActions: Action[] = !ci ? [] : ci.type === 'group' ? ci.actions : [ci]
        return stepActions
          .filter(action => !set.hiddenArrowTeams?.includes(actionTeam(action)))
          .map(action => (
          <GrowingActionArrow
            key={action.id + '-anim'}
            action={action}
            positions={currentState.positions}
            courtType={set.courtType}
            basketY={basketY}
            progress={animFraction}
          />
        ))
      })()}

      {/* Players */}
      {set.players.map(player => {
        const pos = displayPositions[player.id] ?? { x: 0.5, y: 0.5 }
        return (
          <PlayerNode
            key={player.id}
            player={player}
            position={pos}
            courtType={set.courtType}
            landscape={isLandscape}
            hasBall={currentState.ball.holderId === player.id}
            allPositions={displayPositions}
            draggable={false}
            onDragEnd={() => {}}
          />
        )
      })}

      {/* Action type labels — only the last action, bigger, placed off the arrow */}
      {(() => {
        const sliceEnd = isPlaying ? activeStep + 1 : activeStep
        const sliceStart = Math.max(0, sliceEnd - 1)
        const playerR = Math.round((set.courtType === 'half' ? 17 : 20) * 1.4)
        const visible = set.actions.slice(sliceStart, sliceEnd)
        const allArrows: Segment[] = []
        visible.forEach((item, localIdx) => {
          const gi = sliceStart + localIdx
          const sb = computeStateAtStep(set.actions, gi, set.initialPositions, set.initialBall, undefined, basketY, HALF_COURT_W, cH)
          const al = item.type === 'group' ? item.actions : [item]
          al.filter(a => !set.hiddenArrowTeams?.includes(actionTeam(a))).forEach(a => { const l = arrowLine(a, sb.positions, cH, basketY * cH); if (l) allArrows.push(l) })
        })
        return visible.flatMap((item, localIdx) => {
          const globalIdx = sliceStart + localIdx
          const stateBefore = computeStateAtStep(set.actions, globalIdx, set.initialPositions, set.initialBall, undefined, basketY, HALF_COURT_W, cH)
          const isLatest = isPlaying ? globalIdx === activeStep : globalIdx === activeStep - 1
          const actionList = item.type === 'group' ? item.actions : [item]
          return actionList.filter(action => !set.hiddenArrowTeams?.includes(actionTeam(action))).map(action => {
            const line = arrowLine(action, stateBefore.positions, cH, basketY * cH)
            if (!line) return null
            const playersPx = Object.values(stateBefore.positions).map(p => denormalize(p.x, p.y, HALF_COURT_W, cH))
            const { cx, cy } = placeActionLabel(line, playersPx, allArrows, playerR)
            return (
              <Text
                key={action.id + '-lbl'}
                x={cx} y={cy}
                offsetX={32} offsetY={8}
                width={64}
                rotation={isLandscape ? 90 : 0}
                text={t(ACTION_LABEL_KEYS[action.type])}
                fontSize={13} fontStyle="bold"
                fill={ACTION_COLORS[action.type]}
                stroke="#0f172a" strokeWidth={2.5}
                fillAfterStrokeEnabled
                align="center"
                opacity={isLatest ? 1 : 0.85}
                listening={false}
              />
            )
          })
        })
      })()}

      {/* optionText badge — anchored to the action's primary player, not the ball holder */}
      {(() => {
        const item = set.actions[activeStep - 1]
        const action = item && item.type !== 'group' ? item : null
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
    </>
  )
}
