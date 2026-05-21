import { Circle, Text, Group } from 'react-konva'
import type Konva from 'konva'
import type { Player, NormalizedPosition } from '../../models/types'
import { denormalize, HALF_COURT_W, HALF_COURT_H, FULL_COURT_H, COURT_SCALE } from '../../utils/courtCoords'

interface Props {
  player: Player
  position: NormalizedPosition
  courtType: 'half' | 'full'
  hasBall?: boolean
  isSelected?: boolean
  draggable?: boolean
  onDragEnd: (playerId: string, newPos: NormalizedPosition) => void
  onClick?: (playerId: string) => void
}

const OFFENSE_COLOR = '#f97316'
const DEFENSE_COLOR = '#1d4ed8'
const RADIUS = Math.round(20 * COURT_SCALE)

export default function PlayerNode({ player, position, courtType, hasBall, isSelected, draggable = true, onDragEnd, onClick }: Props) {
  const canvasH = courtType === 'half' ? HALF_COURT_H : FULL_COURT_H
  const { x, y } = denormalize(position.x, position.y, HALF_COURT_W, canvasH)
  const fill = player.team === 'offense' ? OFFENSE_COLOR : DEFENSE_COLOR

  function handleDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
    const node = e.target
    onDragEnd(player.id, {
      x: Math.max(0, Math.min(1, node.x() / HALF_COURT_W)),
      y: Math.max(0, Math.min(1, node.y() / canvasH)),
    })
  }

  return (
    <Group
      x={x} y={y}
      draggable={draggable}
      onDragEnd={handleDragEnd}
      onClick={() => onClick?.(player.id)}
    >
      {isSelected && (
        <Circle radius={RADIUS + 5} fill="transparent" stroke="#facc15" strokeWidth={2} />
      )}
      <Circle radius={RADIUS} fill={fill} stroke="white" strokeWidth={2} />
      <Text
        text={String(player.number)}
        fontSize={14} fontStyle="bold"
        fill="white" align="center" verticalAlign="middle"
        x={-RADIUS} y={-RADIUS / 2}
        width={RADIUS * 2}
      />
      {hasBall && (
        <>
          <Circle radius={RADIUS + 7} stroke="#f59e0b" strokeWidth={3} fill="transparent" />
          <Circle x={RADIUS - 5} y={-RADIUS + 5} radius={6} fill="#f59e0b" stroke="white" strokeWidth={1.5} />
        </>
      )}
    </Group>
  )
}
