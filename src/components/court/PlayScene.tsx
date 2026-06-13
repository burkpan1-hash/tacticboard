import { Arrow, Group, Rect, Text } from 'react-konva'
import { useTranslation } from 'react-i18next'
import ActionOverlay from '../actions/ActionOverlay'
import PlayerNode from '../players/PlayerNode'
import { computeStateAtStep } from '../../utils/stateEngine'
import { denormalize, HALF_COURT_W } from '../../utils/courtCoords'
import { arrowLine, smartLabelCenter } from '../../utils/actionArrows'
import { ACTION_COLORS, ACTION_LABEL_KEYS, actionLabelPlayerId } from '../../utils/actionColors'
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
      />

      {/* Growing pass arrows during animation — supports groups */}
      {isPlaying && activeStep < total && (() => {
        const ci = set.actions[activeStep] as ActionItem | undefined
        const stepActions: Action[] = !ci ? [] : ci.type === 'group' ? ci.actions : [ci]
        return stepActions.filter(a => a.type === 'pass').map(action => {
          if (action.type !== 'pass') return null
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
              key={action.id + '-anim'}
              points={[from.x, from.y, end.x, end.y]}
              stroke={color} fill={color}
              strokeWidth={2.5} dash={[10, 6]}
              pointerLength={10} pointerWidth={8}
              listening={false}
            />
          )
        })
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
            draggable={false}
            onDragEnd={() => {}}
          />
        )
      })}

      {/* Action type labels — flattens groups */}
      {set.actions.slice(0, isPlaying ? activeStep + 1 : activeStep).flatMap((item, i) => {
        const stateBefore = computeStateAtStep(
          set.actions, i, set.initialPositions, set.initialBall,
          undefined, basketY, HALF_COURT_W, cH,
        )
        const isLatest = isPlaying ? i === activeStep : i === activeStep - 1
        const actionList = item.type === 'group' ? item.actions : [item]
        return actionList.map(action => {
          const line = arrowLine(action, stateBefore.positions, cH, basketY * cH)
          if (!line) return null
          const playersPx = Object.values(stateBefore.positions).map(p =>
            denormalize(p.x, p.y, HALF_COURT_W, cH)
          )
          const { cx, cy } = smartLabelCenter(line.x1, line.y1, line.x2, line.y2, playersPx)
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
        })
      })}

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
