import { Circle, Text, Group } from 'react-konva'
import type Konva from 'konva'
import type { Player, NormalizedPosition } from '../../models/types'
import { denormalize, HALF_COURT_W, HALF_COURT_H, FULL_COURT_H, COURT_SCALE } from '../../utils/courtCoords'

interface Props {
  player: Player
  position: NormalizedPosition
  courtType: 'half' | 'full'
  landscape?: boolean
  hasBall?: boolean
  isSelected?: boolean
  draggable?: boolean
  onDragStart?: (playerId: string) => void
  onDragMove?: (playerId: string, pos: NormalizedPosition) => void
  onDragEnd: (playerId: string, newPos: NormalizedPosition) => void
  onClick?: (playerId: string) => void
}

const OFFENSE_COLOR = '#f97316'
const DEFENSE_COLOR = '#1d4ed8'
const RADIUS = Math.round(20 * COURT_SCALE)

export default function PlayerNode({ player, position, courtType, landscape, hasBall, isSelected, draggable = true, onDragStart, onDragMove, onDragEnd, onClick }: Props) {
  const canvasH = courtType === 'half' ? HALF_COURT_H : FULL_COURT_H
  const { x, y } = denormalize(position.x, position.y, HALF_COURT_W, canvasH)
  const fill = player.team === 'offense' ? OFFENSE_COLOR : DEFENSE_COLOR

  function norm(node: Konva.Node): NormalizedPosition {
    return {
      x: Math.max(0, Math.min(1, node.x() / HALF_COURT_W)),
      y: Math.max(0, Math.min(1, node.y() / canvasH)),
    }
  }

  return (
    <Group
      x={x} y={y}
      draggable={draggable}
      onDragStart={() => onDragStart?.(player.id)}
      onDragMove={(e) => onDragMove?.(player.id, norm(e.target))}
      onDragEnd={(e) => onDragEnd(player.id, norm(e.target))}
      onClick={() => onClick?.(player.id)}
    >
      {isSelected && (
        <Circle radius={RADIUS + 5} fill="transparent" stroke="#facc15" strokeWidth={2} />
      )}
      <Circle radius={RADIUS} fill={fill} stroke="white" strokeWidth={2} />
      {landscape ? (
        // Counter-rotate +90° to cancel the parent Group's -90° rotation — net 0° (upright)
        <Text
          text={String(player.number)}
          fontSize={14} fontStyle="bold"
          fill="white" align="center" verticalAlign="middle"
          x={0} y={0}
          offsetX={RADIUS} offsetY={RADIUS}
          width={RADIUS * 2} height={RADIUS * 2}
          rotation={90}
        />
      ) : (
        <Text
          text={String(player.number)}
          fontSize={14} fontStyle="bold"
          fill="white" align="center" verticalAlign="middle"
          x={-RADIUS} y={-RADIUS / 2}
          width={RADIUS * 2}
        />
      )}
      {hasBall && (
        <>
          <Circle radius={RADIUS + 7} stroke="#f59e0b" strokeWidth={3} fill="transparent" />
          <Circle x={RADIUS - 5} y={-RADIUS + 5} radius={6} fill="#f59e0b" stroke="white" strokeWidth={1.5} />
        </>
      )}
    </Group>
  )
}
