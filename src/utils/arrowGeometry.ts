export function wavyPoints(
  x1: number, y1: number,
  x2: number, y2: number,
  amplitude = 8,
  waves = 3,
): number[] {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 1) return [x1, y1, x2, y2]
  const ux = dx / len
  const uy = dy / len
  const px = -uy
  const py = ux

  const steps = waves * 8
  const pts: number[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    // Leave last 15% straight so arrowhead looks clean
    const wave = t < 0.85 ? amplitude * Math.sin((i / (waves * 8)) * waves * 2 * Math.PI) : 0
    pts.push(x1 + t * dx + wave * px, y1 + t * dy + wave * py)
  }
  return pts
}

// Applies a continuous wavy effect along an arbitrary multi-point path.
// The path is RESAMPLED at a fixed fine step before the sine is applied, so the
// wave never aliases to the input point spacing. (Dribble waypoints are recorded
// every 15px; with the old per-input-point sampling and a 30px wave period, a
// straight drag landed every point on a sine zero-crossing → a dead-straight line.)
export function wavyAlongPath(
  pts: { x: number; y: number }[],
  amplitude = 8,
  wavePeriod = 30,
): number[] {
  if (pts.length < 2) return []

  // Cumulative arc lengths of the input polyline.
  const arc: number[] = [0]
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x
    const dy = pts[i].y - pts[i - 1].y
    arc.push(arc[i - 1] + Math.sqrt(dx * dx + dy * dy))
  }
  const total = arc[arc.length - 1]
  if (total === 0) return [pts[0].x, pts[0].y, pts[pts.length - 1].x, pts[pts.length - 1].y]

  // Resample along the arc at a fine fixed step, independent of input density.
  const STEP = 4
  const samples = Math.max(2, Math.round(total / STEP))
  const result: number[] = []
  let seg = 1
  for (let s = 0; s <= samples; s++) {
    const d = (s / samples) * total
    while (seg < pts.length - 1 && arc[seg] < d) seg++
    const segLen = (arc[seg] - arc[seg - 1]) || 1
    const localT = Math.max(0, Math.min(1, (d - arc[seg - 1]) / segLen))
    const x = pts[seg - 1].x + (pts[seg].x - pts[seg - 1].x) * localT
    const y = pts[seg - 1].y + (pts[seg].y - pts[seg - 1].y) * localT
    // Perpendicular to this segment's direction.
    const tx = pts[seg].x - pts[seg - 1].x
    const ty = pts[seg].y - pts[seg - 1].y
    const tLen = Math.sqrt(tx * tx + ty * ty) || 1
    const nx = -ty / tLen
    const ny =  tx / tLen
    const frac = d / total
    const wave = frac < 0.85 ? amplitude * Math.sin((d / wavePeriod) * 2 * Math.PI) : 0
    result.push(x + wave * nx, y + wave * ny)
  }
  return result
}

export function perpendicularBar(
  x2: number, y2: number,
  x1: number, y1: number,
  halfLen = 14,
): [number, number, number, number] {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 1) return [x2 - halfLen, y2, x2 + halfLen, y2]
  const px = -dy / len
  const py = dx / len
  return [x2 + px * halfLen, y2 + py * halfLen, x2 - px * halfLen, y2 - py * halfLen]
}
