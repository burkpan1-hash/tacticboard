import { Arrow, Line, Circle, Group } from 'react-konva'
import type { ActionType, CourtType, PositionMap, NormalizedPosition } from '../../models/types'
import { denormalize, HALF_COURT_W, HALF_COURT_H, FULL_COURT_H } from '../../utils/courtCoords'
import { wavyPoints, wavyAlongPath, perpendicularBar } from '../../utils/arrowGeometry'
import { ACTION_COLORS } from '../../utils/actionColors'

interface Props {
  actionType: ActionType | null
  pendingSourceId: string | null
  ballHolderId: string
  positions: PositionMap
  mousePos: NormalizedPosition | null
  courtType: CourtType
  basketY?: number
  dribbleWaypoints?: NormalizedPosition[]
  cutWaypoints?: NormalizedPosition[]
  defenseMoveWaypoints?: NormalizedPosition[]
}

const OP = 0.5

export default function ActionPreview({
  actionType, pendingSourceId, ballHolderId, positions, mousePos, courtType, basketY, dribbleWaypoints, cutWaypoints, defenseMoveWaypoints,
}: Props) {
  if (!actionType) return null

  const cH = courtType === 'half' ? HALF_COURT_H : FULL_COURT_H
  const color = ACTION_COLORS[actionType]

  function pxId(id: string) {
    const p = positions[id]
    return p ? denormalize(p.x, p.y, HALF_COURT_W, cH) : null
  }
  function pxN(pos: NormalizedPosition) {
    return denormalize(pos.x, pos.y, HALF_COURT_W, cH)
  }

  switch (actionType) {
    case 'pass': {
      const from = pxId(ballHolderId)
      const to   = mousePos ? pxN(mousePos) : null
      if (!from || !to) return null
      return (
        <Arrow
          points={[from.x, from.y, to.x, to.y]}
          stroke={color} fill={color}
          strokeWidth={2.5} dash={[10, 6]}
          pointerLength={10} pointerWidth={8}
          opacity={OP} listening={false}
        />
      )
    }

    case 'dribble': {
      const from = pxId(ballHolderId)
      const to   = mousePos ? pxN(mousePos) : null
      if (!from || !to) return null

      if (dribbleWaypoints && dribbleWaypoints.length > 1) {
        const allPx = [from, ...dribbleWaypoints.map(pxN), to]
        const pts = wavyAlongPath(allPx)
        return (
          <Group opacity={OP} listening={false}>
            <Line points={pts} stroke={color} strokeWidth={2.5} />
            <Arrow
              points={[pts[pts.length - 4], pts[pts.length - 3], to.x, to.y]}
              stroke={color} fill={color} strokeWidth={2.5}
              pointerLength={10} pointerWidth={8}
            />
          </Group>
        )
      }

      const pts = wavyPoints(from.x, from.y, to.x, to.y)
      return (
        <Group opacity={OP} listening={false}>
          <Line points={pts} stroke={color} strokeWidth={2.5} />
          <Arrow
            points={[pts[pts.length - 4], pts[pts.length - 3], to.x, to.y]}
            stroke={color} fill={color} strokeWidth={2.5}
            pointerLength={10} pointerWidth={8}
          />
        </Group>
      )
    }

    case 'cut': {
      if (!mousePos) return null
      const to = pxN(mousePos)
      if (!pendingSourceId) {
        return (
          <Arrow
            points={[to.x - 22, to.y, to.x, to.y]}
            stroke={color} fill={color}
            strokeWidth={2} pointerLength={8} pointerWidth={6}
            opacity={OP * 0.7} listening={false}
          />
        )
      }
      const from = pxId(pendingSourceId)
      if (!from) return null

      if (cutWaypoints && cutWaypoints.length > 1) {
        const allPx = [from, ...cutWaypoints.map(pxN), to]
        const pts = allPx.flatMap(p => [p.x, p.y])
        return (
          <Group opacity={OP} listening={false}>
            <Line points={pts} stroke={color} strokeWidth={2.5} lineJoin="round" />
            <Arrow
              points={[pts[pts.length - 4], pts[pts.length - 3], to.x, to.y]}
              stroke={color} fill={color}
              strokeWidth={2.5} pointerLength={10} pointerWidth={8}
            />
          </Group>
        )
      }

      return (
        <Arrow
          points={[from.x, from.y, to.x, to.y]}
          stroke={color} fill={color}
          strokeWidth={2.5} pointerLength={10} pointerWidth={8}
          opacity={OP} listening={false}
        />
      )
    }

    case 'screen': {
      if (!mousePos) return null
      const to = pxN(mousePos)
      if (!pendingSourceId) {
        return (
          <Line
            points={[to.x, to.y - 22, to.x, to.y + 22]}
            stroke={color} strokeWidth={6} strokeLinecap="round"
            opacity={OP * 0.7} listening={false}
          />
        )
      }
      const from = pxId(pendingSourceId)
      if (!from) return null
      const [bx1, by1, bx2, by2] = perpendicularBar(to.x, to.y, from.x, from.y, 22)

      return (
        <Group opacity={OP} listening={false}>
          <Line points={[from.x, from.y, to.x, to.y]} stroke={color} strokeWidth={2.5} />
          <Line points={[bx1, by1, bx2, by2]} stroke={color} strokeWidth={6} strokeLinecap="round" />
        </Group>
      )
    }

    case 'defense-move': {
      if (!mousePos) return null
      const to = pxN(mousePos)
      if (!pendingSourceId) {
        return (
          <Arrow
            points={[to.x - 22, to.y, to.x, to.y]}
            stroke={color} fill={color}
            strokeWidth={2} pointerLength={8} pointerWidth={6}
            opacity={OP * 0.7} listening={false}
          />
        )
      }
      const from = pxId(pendingSourceId)
      if (!from) return null

      if (defenseMoveWaypoints && defenseMoveWaypoints.length > 1) {
        const allPx = [from, ...defenseMoveWaypoints.map(pxN), to]
        const pts = allPx.flatMap(p => [p.x, p.y])
        return (
          <Group opacity={OP} listening={false}>
            <Line points={pts} stroke={color} strokeWidth={2.5} lineJoin="round" />
            <Arrow
              points={[pts[pts.length - 4], pts[pts.length - 3], to.x, to.y]}
              stroke={color} fill={color}
              strokeWidth={2.5} pointerLength={10} pointerWidth={8}
            />
          </Group>
        )
      }

      return (
        <Arrow
          points={[from.x, from.y, to.x, to.y]}
          stroke={color} fill={color}
          strokeWidth={2.5} pointerLength={10} pointerWidth={8}
          opacity={OP} listening={false}
        />
      )
    }

    case 'double-team': {
      if (!mousePos) return null
      const to = pxN(mousePos)
      if (!pendingSourceId) {
        return (
          <Arrow
            points={[to.x - 22, to.y, to.x, to.y]}
            stroke={color} fill={color}
            strokeWidth={2} pointerLength={8} pointerWidth={6}
            opacity={OP * 0.7} listening={false}
          />
        )
      }
      const from = pxId(pendingSourceId)
      if (!from) return null
      // Show arrow from first defender to mouse (hovering over second defender)
      return (
        <Arrow
          points={[from.x, from.y, to.x, to.y]}
          stroke={color} fill={color}
          strokeWidth={2.5} pointerLength={10} pointerWidth={8}
          opacity={OP} listening={false}
        />
      )
    }

    case 'ball-force': {
      if (!mousePos) return null
      if (!pendingSourceId) {
        const to = pxN(mousePos)
        return (
          <Line
            points={[to.x - 14, to.y, to.x + 14, to.y]}
            stroke={color} strokeWidth={5} strokeLinecap="round"
            opacity={OP * 0.7} listening={false}
          />
        )
      }
      const from = pxId(pendingSourceId)
      const bhPx = pxId(ballHolderId)
      const mousePx = pxN(mousePos)
      if (!from || !bhPx) return null
      const TIP_PX      = 42
      const DEFENDER_PX = 77
      const angle = Math.atan2(mousePx.y - bhPx.y, mousePx.x - bhPx.x)
      const cx = Math.cos(angle), cy = Math.sin(angle)
      const tipPx    = { x: bhPx.x + cx * TIP_PX,      y: bhPx.y + cy * TIP_PX }
      const defNewPx = { x: bhPx.x + cx * DEFENDER_PX, y: bhPx.y + cy * DEFENDER_PX }
      const ldx = defNewPx.x - from.x, ldy = defNewPx.y - from.y
      const llen = Math.sqrt(ldx * ldx + ldy * ldy) || 1
      const bow = Math.min(llen * 0.16, 16)
      const midX = (from.x + defNewPx.x) / 2 - (ldy / llen) * bow
      const midY = (from.y + defNewPx.y) / 2 + (ldx / llen) * bow
      const barHalf = Math.max(12, Math.min(28, llen * 0.28))
      const [bx1, by1, bx2, by2] = perpendicularBar(tipPx.x, tipPx.y, bhPx.x, bhPx.y, barHalf)
      return (
        <Group opacity={OP} listening={false}>
          <Line points={[from.x, from.y, midX, midY, defNewPx.x, defNewPx.y]} tension={0.5} stroke={color} strokeWidth={2.5} />
          <Line points={[bx1, by1, bx2, by2]} stroke={color} strokeWidth={6} strokeLinecap="round" />
        </Group>
      )
    }

    case 'shot': {
      const from = pxId(ballHolderId)
      if (!from) return null
      const bx = HALF_COURT_W / 2
      const by = basketY !== undefined ? basketY * cH : 42
      return (
        <Group opacity={OP} listening={false}>
          <Arrow
            points={[from.x, from.y, bx, by]}
            stroke={color} fill={color}
            strokeWidth={2.5} dash={[10, 6]}
            pointerLength={0} pointerWidth={0}
          />
          <Circle x={bx} y={by} radius={9} stroke={color} strokeWidth={2} fill="transparent" />
          <Line points={[bx - 13, by, bx + 13, by]} stroke={color} strokeWidth={2} />
          <Line points={[bx, by - 13, bx, by + 13]} stroke={color} strokeWidth={2} />
        </Group>
      )
    }

    case 'handoff': {
      const from = pxId(ballHolderId)
      if (!mousePos || !from) return null
      const to = pxN(mousePos)
      if (!pendingSourceId) {
        return (
          <Group opacity={OP * 0.7} listening={false}>
            <Line points={[to.x - 6, to.y - 12, to.x - 6, to.y + 12]} stroke={color} strokeWidth={2.5} />
            <Line points={[to.x + 6, to.y - 12, to.x + 6, to.y + 12]} stroke={color} strokeWidth={2.5} />
          </Group>
        )
      }
      const [bx1, by1, bx2, by2] = perpendicularBar(to.x, to.y, from.x, from.y, 10)
      const dx = to.x - from.x, dy = to.y - from.y
      const len = Math.sqrt(dx * dx + dy * dy) || 1
      const ux = dx / len, uy = dy / len
      const off = 6
      return (
        <Group opacity={OP} listening={false}>
          <Arrow
            points={[from.x, from.y, to.x, to.y]}
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
