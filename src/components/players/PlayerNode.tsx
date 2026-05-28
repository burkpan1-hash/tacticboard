import { useRef } from 'react'
import { Circle, Text, Group } from 'react-konva'
import type Konva from 'konva'
import type { Player, NormalizedPosition } from '../../models/types'
import { denormalize, HALF_COURT_W, HALF_COURT_H, FULL_COURT_H, COURT_SCALE, COURT_PADDING_Y } from '../../utils/courtCoords'

interface Props {
  player: Player
  position: NormalizedPosition
  courtType: 'half' | 'full'
  landscape?: boolean
  hasBall?: boolean
  showBallDrop?: boolean
  isSelected?: boolean
  draggable?: boolean
  onDragStart?: (playerId: string) => void
  onDragMove?: (playerId: string, pos: NormalizedPosition) => void
  onDragEnd: (playerId: string, newPos: NormalizedPosition) => void
  onClick?: (playerId: string) => void
}

const OFFENSE_COLOR = '#f97316'
const DEFENSE_COLOR = '#1d4ed8'

export default function PlayerNode({ player, position, courtType, landscape, hasBall, showBallDrop, isSelected, draggable = true, onDragStart, onDragMove, onDragEnd, onClick }: Props) {
  const canvasH = courtType === 'half' ? HALF_COURT_H : FULL_COURT_H
  const RADIUS = Math.round((courtType === 'half' ? 17 : 20) * COURT_SCALE)
  const FONT_SIZE = courtType === 'half' ? 12 : 14
  const { x, y } = denormalize(position.x, position.y, HALF_COURT_W, canvasH)
  const fill = player.team === 'offense' ? OFFENSE_COLOR : DEFENSE_COLOR
  const groupRef = useRef<Konva.Group | null>(null)

  function norm(node: Konva.Node): NormalizedPosition {
    const maxOobY = COURT_PADDING_Y / canvasH
    return {
      x: Math.max(0, Math.min(1, node.x() / HALF_COURT_W)),
      y: Math.max(-maxOobY, Math.min(1 + maxOobY, node.y() / canvasH)),
    }
  }

  function dragBound(pos: { x: number; y: number }) {
    const stage = groupRef.current?.getStage()
    if (!stage) return pos
    const sw = stage.width(), sh = stage.height()
    return {
      x: Math.max(RADIUS, Math.min(sw - RADIUS, pos.x)),
      y: Math.max(RADIUS, Math.min(sh - RADIUS, pos.y)),
    }
  }

  return (
    <Group
      ref={groupRef}
      x={x} y={y}
      draggable={draggable}
      dragBoundFunc={dragBound}
      onDragStart={() => onDragStart?.(player.id)}
      onDragMove={(e) => onDragMove?.(player.id, norm(e.target))}
      onDragEnd={(e) => {
        const newPos = norm(e.target)
        const clamped = denormalize(newPos.x, newPos.y, HALF_COURT_W, canvasH)
        e.target.x(clamped.x)
        e.target.y(clamped.y)
        onDragEnd(player.id, newPos)
      }}
      onClick={() => onClick?.(player.id)}
    >
      {(position.y < 0 || position.y > 1) && (
        <Circle radius={RADIUS + 8} stroke="#facc15" strokeWidth={2} dash={[5, 4]} fill="transparent" />
      )}
      {isSelected && (
        <Circle radius={RADIUS + 5} fill="transparent" stroke="#facc15" strokeWidth={2} />
      )}
      <Circle radius={RADIUS} fill={fill} stroke="white" strokeWidth={2} />
      {landscape ? (
        // Counter-rotate +90° to cancel the parent Group's -90° rotation — net 0° (upright)
        <Text
          text={String(player.number)}
          fontSize={FONT_SIZE} fontStyle="bold"
          fill="white" align="center" verticalAlign="middle"
          x={0} y={0}
          offsetX={RADIUS} offsetY={RADIUS}
          width={RADIUS * 2} height={RADIUS * 2}
          rotation={90}
        />
      ) : (
        <Text
          text={String(player.number)}
          fontSize={FONT_SIZE} fontStyle="bold"
          fill="white" align="center" verticalAlign="middle"
          x={-RADIUS} y={-RADIUS}
          width={RADIUS * 2} height={RADIUS * 2}
        />
      )}
      {hasBall && (
        <>
          <Circle radius={RADIUS + 7} stroke="#f59e0b" strokeWidth={3} fill="transparent" />
          <Circle x={RADIUS - 5} y={-RADIUS + 5} radius={6} fill="#f59e0b" stroke="white" strokeWidth={1.5} />
        </>
      )}
      {showBallDrop && !hasBall && (
        <>
          <Circle radius={RADIUS + 7} stroke="#f59e0b" strokeWidth={3} fill="transparent" />
          <Circle x={RADIUS - 5} y={-RADIUS + 5} radius={7} fill="#22c55e" stroke="white" strokeWidth={1.5} />
          <Text text="+" fontSize={9} fontStyle="bold" fill="white"
            x={RADIUS - 5 - 5} y={-RADIUS + 5 - 5} width={10} height={10}
            align="center" verticalAlign="middle" listening={false} />
        </>
      )}
    </Group>
  )
}
