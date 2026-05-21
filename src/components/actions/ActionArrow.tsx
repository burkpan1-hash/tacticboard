import { Line, Arrow, Circle, Group } from 'react-konva'
import type { Action, PositionMap } from '../../models/types'
import { denormalize, HALF_COURT_W, HALF_COURT_H, FULL_COURT_H } from '../../utils/courtCoords'
import { wavyPoints, perpendicularBar } from '../../utils/arrowGeometry'
import { ACTION_COLORS } from '../../utils/actionColors'

interface Props {
  action: Action
  positions: PositionMap
  courtType: 'half' | 'full'
}

export default function ActionArrow({ action, positions, courtType }: Props) {
  const cH = courtType === 'half' ? HALF_COURT_H : FULL_COURT_H
  const color = ACTION_COLORS[action.type]

  function px(id: string) { return denormalize(positions[id].x, positions[id].y, HALF_COURT_W, cH) }
  function pxPos(pos: { x: number; y: number }) { return denormalize(pos.x, pos.y, HALF_COURT_W, cH) }

  switch (action.type) {
    case 'pass': {
      const from = px(action.fromId)
      const to   = px(action.toId)
      return (
        <Arrow
          points={[from.x, from.y, to.x, to.y]}
          stroke={color} strokeWidth={2.5}
          fill={color}
          dash={[10, 6]}
          pointerLength={10} pointerWidth={8}
        />
      )
    }

    case 'dribble': {
      const from = px(action.playerId)
      const to   = pxPos(action.toPosition)
      const pts  = wavyPoints(from.x, from.y, to.x, to.y)
      return (
        <Group>
          <Line points={pts} stroke={color} strokeWidth={2.5} />
          <Arrow
            points={[pts[pts.length - 4], pts[pts.length - 3], to.x, to.y]}
            stroke={color} fill={color}
            strokeWidth={2.5} pointerLength={10} pointerWidth={8}
          />
        </Group>
      )
    }

    case 'cut': {
      const from = px(action.playerId)
      const to   = pxPos(action.toPosition)
      return (
        <Arrow
          points={[from.x, from.y, to.x, to.y]}
          stroke={color} fill={color}
          strokeWidth={2.5} pointerLength={10} pointerWidth={8}
        />
      )
    }

    case 'screen': {
      const from = px(action.screenerId)
      const to   = pxPos(action.screenPosition)
      const [bx1, by1, bx2, by2] = perpendicularBar(to.x, to.y, from.x, from.y, 22)
      return (
        <Group>
          <Line points={[from.x, from.y, to.x, to.y]} stroke={color} strokeWidth={2.5} />
          <Line points={[bx1, by1, bx2, by2]} stroke={color} strokeWidth={6} strokeLinecap="round" />
        </Group>
      )
    }

    case 'shot': {
      const from = px(action.shooterId)
      const basket = pxPos({ x: 0.5, y: 0.113 })
      const cx = basket.x, cy = basket.y
      return (
        <Group>
          <Arrow
            points={[from.x, from.y, cx, cy]}
            stroke={color} fill={color}
            strokeWidth={2.5} dash={[10, 6]}
            pointerLength={0} pointerWidth={0}
          />
          <Circle x={cx} y={cy} radius={9} stroke={color} strokeWidth={2} fill="transparent" />
          <Line points={[cx - 13, cy, cx + 13, cy]} stroke={color} strokeWidth={2} />
          <Line points={[cx, cy - 13, cx, cy + 13]} stroke={color} strokeWidth={2} />
        </Group>
      )
    }

    case 'handoff': {
      const from = px(action.fromId)
      const meet = pxPos(action.meetPosition)
      const [bx1, by1, bx2, by2] = perpendicularBar(meet.x, meet.y, from.x, from.y, 10)
      const dx = meet.x - from.x, dy = meet.y - from.y
      const len = Math.sqrt(dx * dx + dy * dy) || 1
      const ux = dx / len, uy = dy / len
      const off = 6
      return (
        <Group>
          <Arrow
            points={[from.x, from.y, meet.x, meet.y]}
            stroke={color} fill={color}
            strokeWidth={2.5} pointerLength={0} pointerWidth={0}
          />
          <Line points={[bx1, by1, bx2, by2]} stroke={color} strokeWidth={3} />
          <Line points={[bx1 + ux * off, by1 + uy * off, bx2 + ux * off, by2 + uy * off]} stroke={color} strokeWidth={3} />
        </Group>
      )
    }
  }
}
