export interface Pt { x: number; y: number }

/** Sub-polyline from the start up to `frac` (0..1) of the path's total arc length. */
export function truncatePath(pts: Pt[], frac: number): Pt[] {
  if (pts.length < 2) return pts.map(p => ({ ...p }))
  const f = Math.max(0, Math.min(1, frac))
  const segLen: number[] = []
  let total = 0
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
    segLen.push(l); total += l
  }
  if (total === 0) return [{ ...pts[0] }]
  let target = total * f
  if (target <= 0) return [{ ...pts[0] }]
  const out: Pt[] = [{ ...pts[0] }]
  for (let i = 0; i < segLen.length; i++) {
    if (segLen[i] >= target) {
      const t = segLen[i] === 0 ? 0 : target / segLen[i]
      out.push({ x: pts[i].x + (pts[i + 1].x - pts[i].x) * t, y: pts[i].y + (pts[i + 1].y - pts[i].y) * t })
      return out
    }
    target -= segLen[i]
    out.push({ ...pts[i + 1] })
  }
  return out
}

/** Trim `d` px off the end of a polyline so an arrowhead can sit short of the target. */
export function shortenPathEnd(pts: Pt[], d: number): Pt[] {
  const out = pts.map(p => ({ ...p }))
  let rem = d
  while (out.length >= 2 && rem > 0) {
    const last = out[out.length - 1], prev = out[out.length - 2]
    const segLen = Math.hypot(last.x - prev.x, last.y - prev.y)
    if (segLen >= rem) {
      const t = (segLen - rem) / segLen
      out[out.length - 1] = { x: prev.x + (last.x - prev.x) * t, y: prev.y + (last.y - prev.y) * t }
      rem = 0
    } else {
      rem -= segLen
      out.pop()
    }
  }
  return out
}

/** Total arc length of a polyline. */
export function pathLength(pts: Pt[]): number {
  let total = 0
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
  return total
}
