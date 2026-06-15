export interface Segment { x1: number; y1: number; x2: number; y2: number }

/** Distance from a point to a line segment. */
export function pointSegDist(px: number, py: number, s: Segment): number {
  const dx = s.x2 - s.x1, dy = s.y2 - s.y1
  const l2 = dx * dx + dy * dy
  let t = l2 === 0 ? 0 : ((px - s.x1) * dx + (py - s.y1) * dy) / l2
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (s.x1 + t * dx), py - (s.y1 + t * dy))
}

/**
 * Position an action label near its arrow: ALWAYS offset off the arrow line (never on top of
 * it), choosing the spot closest to the arrow that stays clear of players and every visible
 * arrow (including its own). Falls back to the roomiest spot when everything is crowded.
 */
export function placeActionLabel(
  arrow: Segment,
  players: Array<{ x: number; y: number }>,
  arrows: Segment[],            // all visible arrow segments, including this action's own
  playerR: number,
): { cx: number; cy: number } {
  const mx = (arrow.x1 + arrow.x2) / 2, my = (arrow.y1 + arrow.y2) / 2
  const dx = arrow.x2 - arrow.x1, dy = arrow.y2 - arrow.y1
  const len = Math.hypot(dx, dy) || 1
  const perpX = -dy / len, perpY = dx / len
  const CLEAR_PLAYER = playerR + 8
  const CLEAR_ARROW = 14
  // No 0 offset — the label must never sit on the arrow. Try both sides, closest first.
  const offsets = [20, -20, 30, -30, 42, -42, 56, -56]
  const cands = offsets.map(off => {
    const cx = mx + perpX * off, cy = my + perpY * off
    let minP = Infinity
    for (const p of players) minP = Math.min(minP, Math.hypot(cx - p.x, cy - p.y))
    let minA = Infinity
    for (const a of arrows) minA = Math.min(minA, pointSegDist(cx, cy, a))
    const clear = minP >= CLEAR_PLAYER && minA >= CLEAR_ARROW
    return { off, cx, cy, clear, score: Math.min(minP - CLEAR_PLAYER, minA - CLEAR_ARROW) }
  })
  const clear = cands.filter(c => c.clear)
  if (clear.length) {
    // Prefer the spot nearest the arrow; break ties toward the roomier side.
    clear.sort((a, b) => Math.abs(a.off) - Math.abs(b.off) || b.score - a.score)
    return { cx: clear[0].cx, cy: clear[0].cy }
  }
  // Nothing fully clear — take the least-bad spot.
  cands.sort((a, b) => b.score - a.score)
  return { cx: cands[0].cx, cy: cands[0].cy }
}
