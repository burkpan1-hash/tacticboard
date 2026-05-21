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
