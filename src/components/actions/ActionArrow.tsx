import { Line, Arrow, Circle, Group } from 'react-konva'
import type { Action, PositionMap } from '../../models/types'
import { denormalize, HALF_COURT_W, HALF_COURT_H, FULL_COURT_H, COURT_SCALE, HALF_COURT } from '../../utils/courtCoords'
import { wavyPoints, wavyAlongPath, perpendicularBar } from '../../utils/arrowGeometry'
import { ACTION_COLORS } from '../../utils/actionColors'

const PLAYER_RADIUS = Math.round(20 * COURT_SCALE)
const ARROW_GAP = Math.round(6 * COURT_SCALE)
const SCREEN_GAP = Math.round(3 * COURT_SCALE)

function shortenEnd(x1: number, y1: number, x2: number, y2: number, d: number): { x: number; y: number } {
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  return { x: x2 - (dx / len) * d, y: y2 - (dy / len) * d }
}

function shortenPathEnd(pts: { x: number; y: number }[], d: number): { x: number; y: number }[] {
  const result = [...pts]
  let rem = d
  while (result.length >= 2 && rem > 0) {
    const last = result[result.length - 1]
    const prev = result[result.length - 2]
    const segLen = Math.hypot(last.x - prev.x, last.y - prev.y)
    if (segLen >= rem) {
      const t = (segLen - rem) / segLen
      result[result.length - 1] = { x: prev.x + (last.x - prev.x) * t, y: prev.y + (last.y - prev.y) * t }
      rem = 0
    } else {
      rem -= segLen
      result.pop()
    }
  }
  return result
}

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
      const end  = shortenEnd(from.x, from.y, to.x, to.y, PLAYER_RADIUS + ARROW_GAP)
      return (
        <Arrow
          points={[from.x, from.y, end.x, end.y]}
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

      if (action.waypoints && action.waypoints.length > 1) {
        const allPx = [from, ...action.waypoints.map(pxPos)]
        const last  = allPx[allPx.length - 1]
        const prev  = allPx[allPx.length - 2]
        const end   = shortenEnd(prev.x, prev.y, last.x, last.y, PLAYER_RADIUS + ARROW_GAP)
        allPx[allPx.length - 1] = end
        const pts = wavyAlongPath(allPx)
        return (
          <Group>
            <Line points={pts} stroke={color} strokeWidth={2.5} />
            <Arrow
              points={[pts[pts.length - 4], pts[pts.length - 3], end.x, end.y]}
              stroke={color} fill={color}
              strokeWidth={2.5} pointerLength={10} pointerWidth={8}
            />
          </Group>
        )
      }

      const end  = shortenEnd(from.x, from.y, to.x, to.y, PLAYER_RADIUS + ARROW_GAP)
      const pts  = wavyPoints(from.x, from.y, end.x, end.y)
      return (
        <Group>
          <Line points={pts} stroke={color} strokeWidth={2.5} />
          <Arrow
            points={[pts[pts.length - 4], pts[pts.length - 3], end.x, end.y]}
            stroke={color} fill={color}
            strokeWidth={2.5} pointerLength={10} pointerWidth={8}
          />
        </Group>
      )
    }

    case 'cut': {
      const from = px(action.playerId)
      const to   = pxPos(action.toPosition)

      if (action.waypoints && action.waypoints.length > 1) {
        const shortened = shortenPathEnd([from, ...action.waypoints.map(pxPos)], PLAYER_RADIUS + ARROW_GAP)
        const pts = shortened.flatMap(p => [p.x, p.y])
        const n = pts.length
        return (
          <Group>
            <Line points={pts} stroke={color} strokeWidth={2.5} lineJoin="round" />
            <Arrow
              points={[pts[n - 4], pts[n - 3], pts[n - 2], pts[n - 1]]}
              stroke={color} fill={color}
              strokeWidth={2.5} pointerLength={10} pointerWidth={8}
            />
          </Group>
        )
      }

      const end = shortenEnd(from.x, from.y, to.x, to.y, PLAYER_RADIUS + ARROW_GAP)
      return (
        <Arrow
          points={[from.x, from.y, end.x, end.y]}
          stroke={color} fill={color}
          strokeWidth={2.5} pointerLength={10} pointerWidth={8}
        />
      )
    }

    case 'screen': {
      const from = px(action.screenerId)
      const to   = pxPos(action.screenPosition)
      const end  = shortenEnd(from.x, from.y, to.x, to.y, PLAYER_RADIUS + SCREEN_GAP)
      const [bx1, by1, bx2, by2] = perpendicularBar(end.x, end.y, from.x, from.y, 22)

      return (
        <Group>
          <Line points={[from.x, from.y, end.x, end.y]} stroke={color} strokeWidth={2.5} />
          <Line points={[bx1, by1, bx2, by2]} stroke={color} strokeWidth={6} strokeLinecap="round" />
        </Group>
      )
    }

    case 'defense-move': {
      const from = px(action.playerId)
      const to   = pxPos(action.toPosition)
      const end  = shortenEnd(from.x, from.y, to.x, to.y, PLAYER_RADIUS + ARROW_GAP)
      return (
        <Arrow
          points={[from.x, from.y, end.x, end.y]}
          stroke={color} fill={color}
          strokeWidth={2.5} pointerLength={10} pointerWidth={8}
        />
      )
    }

    case 'shot': {
      const from = px(action.shooterId)
      const cx = HALF_COURT.basket.x, cy = HALF_COURT.basket.y
      const basketR = Math.round(15 * COURT_SCALE)
      const end = shortenEnd(from.x, from.y, cx, cy, basketR)
      return (
        <Group>
          <Arrow
            points={[from.x, from.y, end.x, end.y]}
            stroke={color} fill={color}
            strokeWidth={2.5} dash={[10, 6]}
            pointerLength={10} pointerWidth={8}
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
