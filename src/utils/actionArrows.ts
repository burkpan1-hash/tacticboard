import { denormalize, HALF_COURT_W, HALF_COURT } from './courtCoords'
import type { Action, NormalizedPosition, PositionMap } from '../models/types'

/** Start/end pixel coordinates of an action's representative arrow, or null if endpoints are unavailable. */
export function arrowLine(
  action: Action,
  positions: PositionMap,
  cH: number,
  basketPxY: number,
): { x1: number; y1: number; x2: number; y2: number } | null {
  const px = (id: string) => { const p = positions[id]; return p ? denormalize(p.x, p.y, HALF_COURT_W, cH) : null }
  const pp = (p: NormalizedPosition) => denormalize(p.x, p.y, HALF_COURT_W, cH)
  switch (action.type) {
    case 'pass':         { const f = px(action.fromId), t = px(action.toId); if (!f || !t) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'cut':          { const f = px(action.playerId), t = pp(action.toPosition); if (!f) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'screen':       { const f = px(action.screenerId), t = pp(action.screenPosition); if (!f) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'shot':         { const f = px(action.shooterId); if (!f) return null; return { x1: f.x, y1: f.y, x2: HALF_COURT.basket.x, y2: basketPxY } }
    case 'handoff':      { const f = px(action.fromId), t = pp(action.meetPosition); if (!f) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'defense-move': { const f = px(action.playerId), t = pp(action.toPosition); if (!f) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'double-team':  { const f = px(action.defender1Id), t = px(action.targetId); if (!f || !t) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'ball-force': {
      const f = px(action.defenderId); const target = positions[action.targetId]
      if (!f || !target) return null
      const tPx = pp(target)
      const DEFENDER_PX = 77
      return { x1: f.x, y1: f.y, x2: tPx.x + Math.cos(action.angle) * DEFENDER_PX, y2: tPx.y + Math.sin(action.angle) * DEFENDER_PX }
    }
    case 'dribble': {
      const f = px(action.playerId); if (!f) return null
      if (action.waypoints && action.waypoints.length > 0) {
        const mid = pp(action.waypoints[Math.floor(action.waypoints.length / 2)])
        return { x1: f.x, y1: f.y, x2: mid.x, y2: mid.y }
      }
      const t = pp(action.toPosition); return { x1: f.x, y1: f.y, x2: t.x, y2: t.y }
    }
  }
}

/** Picks a label anchor near the arrow midpoint, nudged away from nearby players. */
export function smartLabelCenter(
  x1: number, y1: number, x2: number, y2: number,
  playersPx: Array<{ x: number; y: number }>,
): { cx: number; cy: number } {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const perpX = -dy / len, perpY = dx / len

  function minDist(cx: number, cy: number) {
    if (!playersPx.length) return Infinity
    return Math.min(...playersPx.map(p => Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2)))
  }

  let bestCx = mx + perpX * 16, bestCy = my + perpY * 16, bestScore = -1
  for (const offset of [16, 22, 30]) {
    for (const sign of [1, -1] as const) {
      const cx = mx + perpX * offset * sign
      const cy = my + perpY * offset * sign
      const score = minDist(cx, cy)
      if (score > bestScore) { bestScore = score; bestCx = cx; bestCy = cy }
    }
  }
  return { cx: bestCx, cy: bestCy }
}
