export interface FitRect { x: number; y: number; w: number; h: number }

/** Largest centered rect of src's aspect ratio that fits inside dst. */
export function computeFitRect(srcW: number, srcH: number, dstW: number, dstH: number): FitRect {
  const scale = Math.min(dstW / srcW, dstH / srcH)
  const w = Math.round(srcW * scale)
  const h = Math.round(srcH * scale)
  return { x: Math.round((dstW - w) / 2), y: Math.round((dstH - h) / 2), w, h }
}

const BG = '#0f172a'
const WATERMARK = 'basketballtacticboard.com'

/** Fills the background, draws the scene letterboxed and centered, stamps the watermark. */
export function drawComposite(
  ctx: CanvasRenderingContext2D,
  src: CanvasImageSource & { width: number; height: number },
  dstW: number,
  dstH: number,
): void {
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, dstW, dstH)
  const r = computeFitRect(src.width, src.height, dstW, dstH)
  ctx.drawImage(src, r.x, r.y, r.w, r.h)

  ctx.save()
  ctx.globalAlpha = 0.5
  ctx.fillStyle = '#ffffff'
  ctx.font = `${Math.round(dstH * 0.018)}px sans-serif`
  ctx.textBaseline = 'bottom'
  ctx.fillText(WATERMARK, Math.round(dstW * 0.02), dstH - Math.round(dstH * 0.02))
  ctx.restore()
}
