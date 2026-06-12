import type Konva from 'konva'
import { Muxer, ArrayBufferTarget } from 'mp4-muxer'

// ─── Shared utils ─────────────────────────────────────────────────────────────

export async function downloadBlob(blob: Blob, filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'bin'
  const mimeMap: Record<string, string> = {
    mp4: 'video/mp4', webm: 'video/webm', gif: 'image/gif', png: 'image/png',
  }
  const mime = mimeMap[ext] ?? blob.type ?? 'application/octet-stream'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const picker = (window as any).showSaveFilePicker as
    | ((opts: { suggestedName: string; types: Array<{ description: string; accept: Record<string, string[]> }> }) => Promise<FileSystemFileHandle>)
    | undefined

  if (picker) {
    try {
      const handle = await picker({
        suggestedName: filename,
        types: [{ description: ext.toUpperCase() + ' file', accept: { [mime]: [`.${ext}`] } }],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ─── Public: Export Video ─────────────────────────────────────────────────────

export interface VideoExportHandle { cancel: () => void }

function drawStage(ctx: CanvasRenderingContext2D, stage: Konva.Stage, w: number, h: number) {
  ctx.fillRect(0, 0, w, h)
  for (const layer of stage.getLayers()) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx.drawImage((layer as any).getCanvas()._canvas as HTMLCanvasElement, 0, 0, w, h)
  }
}

export function exportVideo(
  stage: Konva.Stage,
  durationMs: number,
  scale: number,
  onProgress: (p: number) => void,
  onDone: (blob: Blob) => void,
): VideoExportHandle {
  const w = Math.round(stage.width() * scale)
  const h = Math.round(stage.height() * scale)
  const encW = w % 2 === 0 ? w : w + 1
  const encH = h % 2 === 0 ? h : h + 1

  // Bitrate: ~0.12 bits/px/frame, clamped 4–20 Mbps
  const bitrate = Math.min(20_000_000, Math.max(4_000_000,
    Math.round(encW * encH * 30 * 0.12)
  ))

  const offscreen = document.createElement('canvas')
  offscreen.width = encW; offscreen.height = encH
  const ctx = offscreen.getContext('2d', { alpha: false })!
  ctx.fillStyle = '#0f172a'

  let cancelled = false
  let rafId = 0

  // ── WebCodecs path (Chrome / Edge 94+) — standard QuickTime-compatible MP4 ──
  if (typeof VideoEncoder !== 'undefined') {
    const FPS = 30
    const target = new ArrayBufferTarget()
    const muxer = new Muxer({
      target,
      video: { codec: 'avc', width: encW, height: encH, frameRate: FPS },
      fastStart: 'in-memory',
    })

    // Pick H.264 High Profile level that covers the encoded resolution.
    // Baseline 3.1 caps at 1280×720; QuickTime on modern macOS also handles
    // High Profile better than Baseline for non-standard dimensions.
    const codec = encW * encH > 921_600
      ? 'avc1.640033'  // High Profile Level 5.1 — up to 4K (HD 2× export)
      : 'avc1.640028'  // High Profile Level 4.0 — QuickTime safe for ≤2048×1024

    let encoderFailed = false
    const encoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => {
        console.error('[export] VideoEncoder error', e)
        encoderFailed = true
      },
    })
    try {
      encoder.configure({
        codec,
        width: encW,
        height: encH,
        bitrate,
        framerate: FPS,
        latencyMode: 'quality',
        hardwareAcceleration: 'prefer-software',  // software = more spec-compliant SPS/PPS
      })
    } catch (e) {
      console.warn('[export] VideoEncoder.configure failed, falling back to MediaRecorder', e)
      encoderFailed = true
    }

    const t0 = performance.now()
    let frameCount = 0

    function captureFrame() {
      if (cancelled || encoderFailed) return
      const elapsed = performance.now() - t0

      drawStage(ctx, stage, encW, encH)
      const timestamp = Math.round(elapsed * 1000)
      const frame = new VideoFrame(offscreen, { timestamp })
      encoder.encode(frame, { keyFrame: frameCount % (FPS * 2) === 0 })
      frame.close()
      frameCount++

      onProgress(Math.min(0.85, elapsed / durationMs))

      if (elapsed < durationMs + 300) {
        rafId = requestAnimationFrame(captureFrame)
        return
      }

      // Flush: fake-progress 0.85→0.99 so bar isn't frozen
      let fakeP = 0.85
      const fakeInterval = setInterval(() => {
        fakeP = Math.min(0.99, fakeP + 0.02)
        onProgress(fakeP)
      }, 120)

      encoder.flush()
        .then(() => {
          clearInterval(fakeInterval)
          if (cancelled) return
          muxer.finalize()
          const blob = new Blob([target.buffer], { type: 'video/mp4' })
          onProgress(1)
          onDone(blob)
        })
        .catch(e => {
          clearInterval(fakeInterval)
          console.error('[export] flush error', e)
          try { muxer.finalize() } catch { /* noop */ }
          const blob = new Blob([target.buffer], { type: 'video/mp4' })
          if (blob.size > 0) { onProgress(1); onDone(blob) }
        })
    }
    rafId = requestAnimationFrame(captureFrame)

    return {
      cancel: () => {
        cancelled = true
        cancelAnimationFrame(rafId)
        if (encoder.state !== 'closed') encoder.close()
      },
    }
  }

  // ── MediaRecorder fallback (Firefox / Safari) → WebM ─────────────────────
  const mimeType = ['video/webm;codecs=vp9', 'video/webm']
    .find(m => MediaRecorder.isTypeSupported(m)) ?? 'video/webm'

  const stream = offscreen.captureStream(30)
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: bitrate })
  const chunks: Blob[] = []
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
  recorder.onstop = () => {
    cancelAnimationFrame(rafId)
    onDone(new Blob(chunks, { type: mimeType }))
  }
  recorder.start()

  const t0fb = performance.now()
  function draw() {
    if (cancelled) return
    const elapsed = performance.now() - t0fb
    drawStage(ctx, stage, encW, encH)
    onProgress(Math.min(0.99, elapsed / durationMs))
    if (elapsed >= durationMs + 500) { recorder.stop(); return }
    rafId = requestAnimationFrame(draw)
  }
  rafId = requestAnimationFrame(draw)

  return {
    cancel: () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      if (recorder.state !== 'inactive') recorder.stop()
    },
  }
}
