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
// Unlike multiWavyPoints (segment-by-segment), this sweeps one smooth sine
// wave along the full arc so short segments don't create cramped zigzags.
export function wavyAlongPath(
  pts: { x: number; y: number }[],
  amplitude = 8,
  wavePeriod = 30,
): number[] {
  if (pts.length < 2) return []

  // Cumulative arc lengths
  const arc: number[] = [0]
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x
    const dy = pts[i].y - pts[i - 1].y
    arc.push(arc[i - 1] + Math.sqrt(dx * dx + dy * dy))
  }
  const total = arc[arc.length - 1]

  const result: number[] = []
  for (let i = 0; i < pts.length; i++) {
    // Local tangent (forward difference, clamp at end)
    const j = Math.min(i + 1, pts.length - 1)
    const k = i > 0 ? i - 1 : 0
    const tx = pts[j].x - pts[k].x
    const ty = pts[j].y - pts[k].y
    const tLen = Math.sqrt(tx * tx + ty * ty) || 1
    const nx = -ty / tLen   // perpendicular to tangent
    const ny =  tx / tLen

    const t = arc[i] / total
    const wave = t < 0.85 ? amplitude * Math.sin((arc[i] / wavePeriod) * 2 * Math.PI) : 0
    result.push(pts[i].x + wave * nx, pts[i].y + wave * ny)
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
