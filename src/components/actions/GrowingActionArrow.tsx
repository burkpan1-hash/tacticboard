import { Line, Arrow, Group } from 'react-konva'
import type { Action, PositionMap } from '../../models/types'
import { denormalize, HALF_COURT_W, HALF_COURT_H, FULL_COURT_H, COURT_SCALE, HALF_COURT } from '../../utils/courtCoords'
import { wavyPoints, wavyAlongPath, perpendicularBar } from '../../utils/arrowGeometry'
import { ACTION_COLORS } from '../../utils/actionColors'
import { computeDoubleTeamPositions } from '../../utils/stateEngine'
import { truncatePath, shortenPathEnd, pathLength, type Pt } from '../../utils/growArrow'

interface Props {
  action: Action
  /** Discrete positions at the start of this step (player's pre-action spots). */
  positions: PositionMap
  courtType: 'half' | 'full'
  basketY?: number
  /** Animation fraction 0..1 for the current step. */
  progress: number
}

// Draws an action's arrow growing along its path as the step animates, so it trails the
// moving player instead of popping in fully formed. Each action keeps its characteristic
// look while growing: dribble stays wavy, pass/shot dashed, screen/handoff/ball-force get
// their bars instead of an arrowhead. The finished, fully-decorated arrow is ActionOverlay's.
export default function GrowingActionArrow({ action, positions, courtType, basketY, progress }: Props) {
  const cH = courtType === 'half' ? HALF_COURT_H : FULL_COURT_H
  const PLAYER_RADIUS = Math.round((courtType === 'half' ? 17 : 20) * COURT_SCALE)
  const ARROW_GAP = Math.round(6 * COURT_SCALE)
  const SCREEN_GAP = Math.round(3 * COURT_SCALE)
  const color = ACTION_COLORS[action.type]

  const px = (id: string): Pt | null => positions[id] ? denormalize(positions[id].x, positions[id].y, HALF_COURT_W, cH) : null
  const pp = (p: { x: number; y: number }): Pt => denormalize(p.x, p.y, HALF_COURT_W, cH)

  // Truncate a path to the current progress, then trim `shorten` px off the tip.
  const grow = (full: Pt[], shorten: number): Pt[] | null => {
    const g = shortenPathEnd(truncatePath(full, progress), shorten)
    return g.length >= 2 && pathLength(g) >= 2 ? g : null
  }

  // Line + arrowhead through a flat point list (the shared look for pointed arrows).
  const headedArrow = (flat: number[], dash?: number[]) => {
    const n = flat.length
    return (
      <Group listening={false}>
        <Line points={flat} stroke={color} strokeWidth={2.5} dash={dash} lineJoin="round" />
        <Arrow points={[flat[n - 4], flat[n - 3], flat[n - 2], flat[n - 1]]} stroke={color} fill={color} strokeWidth={2.5} dash={dash} pointerLength={10} pointerWidth={8} />
      </Group>
    )
  }

  switch (action.type) {
    case 'pass': {
      const f = px(action.fromId), t = px(action.toId)
      if (!f || !t) return null
      const g = grow([f, t], PLAYER_RADIUS + ARROW_GAP)
      return g ? headedArrow(g.flatMap(p => [p.x, p.y]), [10, 6]) : null
    }

    case 'shot': {
      const f = px(action.shooterId)
      if (!f) return null
      const by = basketY !== undefined ? basketY * cH : HALF_COURT.basket.y
      const g = grow([f, { x: HALF_COURT.basket.x, y: by }], Math.round(15 * COURT_SCALE))
      return g ? headedArrow(g.flatMap(p => [p.x, p.y]), [10, 6]) : null
    }

    case 'dribble': {
      const f = px(action.playerId)
      if (!f) return null
      const full = action.waypoints?.length ? [f, ...action.waypoints.map(pp), pp(action.toPosition)] : [f, pp(action.toPosition)]
      const g = grow(full, PLAYER_RADIUS + ARROW_GAP)
      if (!g) return null
      // Snake/wavy line — the dribble's signature look.
      const pts = g.length >= 3 ? wavyAlongPath(g) : wavyPoints(g[0].x, g[0].y, g[g.length - 1].x, g[g.length - 1].y)
      return headedArrow(pts)
    }

    case 'cut':
    case 'defense-move': {
      const f = px(action.playerId)
      if (!f) return null
      const full = action.waypoints?.length ? [f, ...action.waypoints.map(pp), pp(action.toPosition)] : [f, pp(action.toPosition)]
      const g = grow(full, PLAYER_RADIUS + ARROW_GAP)
      return g ? headedArrow(g.flatMap(p => [p.x, p.y])) : null
    }

    case 'screen': {
      const f = px(action.screenerId)
      if (!f) return null
      const g = grow([f, pp(action.screenPosition)], SCREEN_GAP)
      if (!g) return null
      const tip = g[g.length - 1], prev = g[g.length - 2]
      const [bx1, by1, bx2, by2] = perpendicularBar(tip.x, tip.y, prev.x, prev.y, 22)
      return (
        <Group listening={false}>
          <Line points={g.flatMap(p => [p.x, p.y])} stroke={color} strokeWidth={2.5} />
          <Line points={[bx1, by1, bx2, by2]} stroke={color} strokeWidth={6} strokeLinecap="round" />
        </Group>
      )
    }

    case 'handoff': {
      const f = px(action.fromId)
      if (!f) return null
      const g = grow([f, pp(action.meetPosition)], 0)
      if (!g) return null
      const tip = g[g.length - 1], prev = g[g.length - 2]
      const [bx1, by1, bx2, by2] = perpendicularBar(tip.x, tip.y, prev.x, prev.y, 10)
      const dx = tip.x - prev.x, dy = tip.y - prev.y, len = Math.hypot(dx, dy) || 1
      const ux = dx / len, uy = dy / len, off = 6
      return (
        <Group listening={false}>
          <Line points={g.flatMap(p => [p.x, p.y])} stroke={color} strokeWidth={2.5} />
          <Line points={[bx1, by1, bx2, by2]} stroke={color} strokeWidth={3} />
          <Line points={[bx1 - ux * off, by1 - uy * off, bx2 - ux * off, by2 - uy * off]} stroke={color} strokeWidth={3} />
        </Group>
      )
    }

    case 'ball-force': {
      const f = px(action.defenderId)
      const tg = positions[action.targetId]
      if (!f || !tg) return null
      const tp = pp(tg)
      const ex = tp.x + Math.cos(action.angle) * 77, ey = tp.y + Math.sin(action.angle) * 77
      const ldx = ex - f.x, ldy = ey - f.y, llen = Math.hypot(ldx, ldy) || 1
      const bow = Math.min(llen * 0.16, 16)
      const mid = { x: (f.x + ex) / 2 - (ldy / llen) * bow, y: (f.y + ey) / 2 + (ldx / llen) * bow }
      const g = grow([f, mid, { x: ex, y: ey }], 0)
      if (!g) return null
      const tip = g[g.length - 1], prev = g[g.length - 2]
      const barHalf = Math.max(12, Math.min(28, llen * 0.28))
      const [bx1, by1, bx2, by2] = perpendicularBar(tip.x, tip.y, prev.x, prev.y, barHalf)
      return (
        <Group listening={false}>
          <Line points={g.flatMap(p => [p.x, p.y])} tension={0.5} stroke={color} strokeWidth={2.5} />
          <Line points={[bx1, by1, bx2, by2]} stroke={color} strokeWidth={6} strokeLinecap="round" />
        </Group>
      )
    }

    case 'double-team': {
      const r = computeDoubleTeamPositions(action.defender1Id, action.defender2Id, action.targetId, positions, basketY)
      const d1 = px(action.defender1Id), d2 = px(action.defender2Id)
      if (!r || !d1 || !d2) return null
      const segs: Pt[][] = [[d1, pp(r.p1)], [d2, pp(r.p2)]]
      return (
        <Group listening={false}>
          {segs.map((seg, i) => {
            const g = grow(seg, PLAYER_RADIUS + ARROW_GAP)
            return g ? <Group key={i}>{headedArrow(g.flatMap(p => [p.x, p.y]))}</Group> : null
          })}
        </Group>
      )
    }
  }
  return null
}
