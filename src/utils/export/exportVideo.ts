import { createElement } from 'react'
import { flushSync } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import type Konva from 'konva'
import ExportStage from '../../components/export/ExportStage'
import { computeFrameState } from '../frameState'
import { computeAllStepMs } from '../stateEngine'
import { HALF_COURT_H, FULL_COURT_H } from '../courtCoords'
import { createMp4Encoder, isVideoExportSupported } from './encodeMp4'
import { drawComposite } from './composite'
import type { PlaySet } from '../../models/types'

export const ASPECT_PRESETS = {
  '9:16': { w: 1080, h: 1920 },
  '1:1':  { w: 1080, h: 1080 },
  '16:9': { w: 1920, h: 1080 },
} as const
export type AspectKey = keyof typeof ASPECT_PRESETS

const FPS = 30
const END_FREEZE_MS = 500
const BASKET_PX = 42

export interface ExportHandle { cancel: () => void }

/** Errors thrown/reported by the export pipeline. `UNSUPPORTED` => no WebCodecs. */
export class ExportError extends Error {}

export function exportPlayToMp4(
  set: PlaySet,
  aspect: AspectKey,
  onProgress: (p: number) => void,
  onDone: (blob: Blob) => void,
  onError: (err: Error) => void,
): ExportHandle {
  let cancelled = false
  const { w: dstW, h: dstH } = ASPECT_PRESETS[aspect]

  const cH = set.courtType === 'half' ? HALF_COURT_H : FULL_COURT_H
  const basketY = set.courtType === 'half'
    ? BASKET_PX / HALF_COURT_H
    : (set.attackBasket === 'bottom' ? 1 - BASKET_PX / FULL_COURT_H : BASKET_PX / FULL_COURT_H)

  const stepDurations = computeAllStepMs(set.actions, set.initialPositions, set.initialBall, basketY)
  const totalMs = stepDurations.reduce((a, b) => a + b, 0) + END_FREEZE_MS
  const frameCount = Math.max(1, Math.ceil((totalMs / 1000) * FPS))

  // Off-DOM host kept out of view but attached so Konva actually paints.
  const host = document.createElement('div')
  host.style.cssText = 'position:fixed;left:-99999px;top:0;pointer-events:none;'
  document.body.appendChild(host)
  const stageRef: { current: Konva.Stage | null } = { current: null }
  const root: Root = createRoot(host)

  const out = document.createElement('canvas')
  out.width = dstW; out.height = dstH
  const outCtx = out.getContext('2d', { alpha: false })!

  function teardown() {
    try { root.unmount() } catch { /* noop */ }
    host.remove()
  }

  // Map a frame index to (step, fraction within step). Past the last step = end freeze.
  function frameToStep(frameIdx: number): { step: number; fraction: number } {
    let tMs = (frameIdx / FPS) * 1000
    for (let step = 0; step < stepDurations.length; step++) {
      const d = stepDurations[step]
      if (tMs < d) return { step, fraction: d === 0 ? 1 : tMs / d }
      tMs -= d
    }
    return { step: set.actions.length, fraction: 1 }
  }

  async function run() {
    if (!isVideoExportSupported()) {
      teardown()
      onError(new ExportError('UNSUPPORTED'))
      return
    }
    // createMp4Encoder can throw synchronously (RangeError for odd dims, or
    // Error('UNSUPPORTED') when H.264 configure fails) — inside try so it
    // becomes onError(...) with .message preserved (Task 7 maps 'UNSUPPORTED').
    let encoder
    try {
      encoder = createMp4Encoder({ width: dstW, height: dstH, fps: FPS })
    } catch (err) {
      teardown()
      onError(err instanceof Error ? err : new ExportError(String(err)))
      return
    }
    try {
      for (let i = 0; i < frameCount; i++) {
        if (cancelled) {
          // Release the WebCodecs encoder before teardown so it doesn't leak.
          encoder.cancel()
          teardown()
          return
        }
        const { step, fraction } = frameToStep(i)
        const isPlaying = step < set.actions.length
        const frame = computeFrameState(set, step, fraction, isPlaying, basketY, cH)
        flushSync(() => {
          root.render(createElement(ExportStage, { set, frame, basketY, cH, stageRef }))
        })
        const stage = stageRef.current
        if (!stage) throw new ExportError('Export stage failed to mount')
        stage.draw()
        const sceneCanvas = stage.toCanvas() as HTMLCanvasElement
        drawComposite(outCtx, sceneCanvas, dstW, dstH)
        encoder.addFrame(out, i)
        onProgress(Math.min(0.99, (i + 1) / frameCount))
        // Yield so the modal's progress bar can repaint.
        await new Promise(r => setTimeout(r, 0))
      }
      const blob = await encoder.finish()
      teardown()
      if (cancelled) return
      onProgress(1)
      onDone(blob)
    } catch (err) {
      // Release the encoder before teardown on the error path too.
      encoder.cancel()
      teardown()
      onError(err instanceof Error ? err : new ExportError(String(err)))
    }
  }
  void run()

  return { cancel: () => { cancelled = true } }
}
