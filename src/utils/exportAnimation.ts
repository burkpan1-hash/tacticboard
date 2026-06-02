import type Konva from 'konva'

// ─── Shared utils ─────────────────────────────────────────────────────────────

/** Save a blob to disk via a real native "Save As" dialog on Chromium-based browsers
 *  (Chrome / Edge / Vivaldi / Opera). Falls back to <a download> on Firefox / Safari.
 *
 *  Why the picker matters here: programmatic <a download> click works most of the time
 *  but occasionally fails silently — the browser logs the download in its UI but never
 *  writes the file to disk, leaving the user staring at a "downloaded" entry that
 *  doesn't exist anywhere. The File System Access API uses a real OS file dialog and
 *  writes the bytes directly via FileSystemWritableFileStream, so the file is
 *  guaranteed to land where the user picked it. */
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
        types: [{
          description: ext.toUpperCase() + ' file',
          accept: { [mime]: [`.${ext}`] },
        }],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return
    } catch (err) {
      // User clicked Cancel — bail without falling through to auto-download.
      if (err instanceof Error && err.name === 'AbortError') return
      // Picker unavailable on this origin / iframe → fall through to <a download>.
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Composite all Konva layers onto a single canvas element (synchronous).
 *  Uses 5-arg drawImage to handle Retina/HiDPI: Konva's internal canvas is
 *  devicePixelRatio × the logical size, but we want the logical size output. */
function composeStage(stage: Konva.Stage): HTMLCanvasElement {
  const w = stage.width(), h = stage.height()
  const out = document.createElement('canvas'); out.width = w; out.height = h
  const ctx = out.getContext('2d')!
  for (const layer of stage.getLayers()) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const src = (layer as any).getCanvas()._canvas as HTMLCanvasElement
    ctx.drawImage(src, 0, 0, w, h)
  }
  return out
}

// ─── Inline GIF encoder (no external deps) ───────────────────────────────────
// Supports 256-color global palette, animation, infinite looping.

function u16le(v: number): Uint8Array {
  return new Uint8Array([v & 0xFF, (v >> 8) & 0xFF])
}

/** GIF-variant LZW compression (always minCode = 8 for 256-color palette). */
function gifLzw(indices: Uint8Array): Uint8Array {
  const clear = 256, eof = 257
  let codeSize = 9, nextCode = 258
  const table = new Map<number, number>()
  const out: number[] = []
  let buf = 0, bits = 0

  function emit(code: number) {
    buf |= code << bits; bits += codeSize
    while (bits >= 8) { out.push(buf & 0xFF); buf >>= 8; bits -= 8 }
  }
  function reset() { table.clear(); codeSize = 9; nextCode = 258 }

  reset(); emit(clear)
  let prefix = indices[0]
  for (let i = 1; i < indices.length; i++) {
    const s = indices[i], key = prefix * 256 + s
    const c = table.get(key)
    if (c !== undefined) {
      prefix = c
    } else {
      emit(prefix)
      if (nextCode <= 4095) {
        table.set(key, nextCode++)
        if (nextCode > (1 << codeSize) && codeSize < 12) codeSize++
      } else {
        emit(clear); reset()
      }
      prefix = s
    }
  }
  emit(prefix); emit(eof)
  if (bits > 0) out.push(buf & 0xFF)
  return new Uint8Array(out)
}

/** Pack raw LZW bytes into GIF sub-blocks (max 255 bytes each). */
function subBlocks(data: Uint8Array): Uint8Array {
  const chunks: Uint8Array[] = []
  for (let off = 0; off < data.length; ) {
    const n = Math.min(255, data.length - off)
    const block = new Uint8Array(1 + n)
    block[0] = n
    block.set(data.subarray(off, off + n), 1)
    chunks.push(block)
    off += n
  }
  return concat([...chunks, new Uint8Array([0])])
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((s, p) => s + p.length, 0)
  const out = new Uint8Array(total); let off = 0
  for (const p of parts) { out.set(p, off); off += p.length }
  return out
}

/**
 * Build an animated GIF from canvas frames.
 * Scales to `scale` factor for reasonable file sizes.
 */
function buildAnimatedGif(
  frames: Array<{ canvas: HTMLCanvasElement; delayMs: number }>,
  scale = 0.55,
): Uint8Array {
  if (frames.length === 0) return new Uint8Array()
  const w = Math.round(frames[0].canvas.width * scale)
  const h = Math.round(frames[0].canvas.height * scale)

  // ── Build 256-color global palette from sampled frames ──────────────────
  const tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h
  const tctx = tmp.getContext('2d')!
  const freq = new Map<number, number>()
  const sIdx = [0, Math.floor(frames.length / 2), frames.length - 1]
  for (const i of sIdx) {
    tctx.drawImage(frames[i].canvas, 0, 0, w, h)
    const px = tctx.getImageData(0, 0, w, h).data
    for (let j = 0; j < px.length; j += 16) {
      // 6-bit per channel quantization → 18-bit key
      const k = ((px[j] >> 2) << 12) | ((px[j+1] >> 2) << 6) | (px[j+2] >> 2)
      freq.set(k, (freq.get(k) ?? 0) + 1)
    }
  }
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 255)
  const pal = new Uint8Array(256 * 3)
  for (let i = 0; i < top.length; i++) {
    const k = top[i][0]
    pal[i*3] = ((k>>12)&0x3F)<<2; pal[i*3+1] = ((k>>6)&0x3F)<<2; pal[i*3+2] = (k&0x3F)<<2
  }

  // ── Typed-array cache: 18-bit key → palette index ────────────────────────
  const cache = new Int16Array(1 << 18).fill(-1)
  function nearest(r: number, g: number, b: number): number {
    const key = ((r>>2)<<12)|((g>>2)<<6)|(b>>2)
    let idx = cache[key]
    if (idx < 0) {
      let best = 0, bestD = Infinity
      for (let j = 0; j < top.length; j++) {
        const dr = r - pal[j*3], dg = g - pal[j*3+1], db = b - pal[j*3+2]
        const d = dr*dr + dg*dg + db*db
        if (d < bestD) { bestD = d; best = j; if (d === 0) break }
      }
      cache[key] = best; idx = best
    }
    return idx
  }

  // ── GIF header ───────────────────────────────────────────────────────────
  const header = concat([
    new Uint8Array([0x47,0x49,0x46,0x38,0x39,0x61]), // "GIF89a"
    u16le(w), u16le(h),
    new Uint8Array([0xF7, 0, 0]), // Global CT 256 colors, BG=0, aspect=0
    pal,
    // Netscape loop-forever extension
    new Uint8Array([
      0x21, 0xFF, 0x0B,
      78,69,84,83,67,65,80,69,50,46,48, // "NETSCAPE2.0"
      3, 1, 0, 0, 0,
    ]),
  ])

  // ── Encode each frame ────────────────────────────────────────────────────
  const frameParts: Uint8Array[] = [header]
  for (const { canvas: c, delayMs } of frames) {
    tctx.drawImage(c, 0, 0, w, h)
    const px = tctx.getImageData(0, 0, w, h).data
    const idx = new Uint8Array(w * h)
    for (let i = 0; i < w * h; i++) idx[i] = nearest(px[i*4], px[i*4+1], px[i*4+2])

    const cs = Math.max(1, Math.round(delayMs / 10))
    frameParts.push(concat([
      new Uint8Array([0x21, 0xF9, 4, 0]), u16le(cs), new Uint8Array([0, 0]), // GCE
      new Uint8Array([0x2C]), u16le(0), u16le(0), u16le(w), u16le(h), new Uint8Array([0]), // Image descriptor
      new Uint8Array([8]),   // LZW min code size
      subBlocks(gifLzw(idx)),
    ]))
  }

  frameParts.push(new Uint8Array([0x3B])) // trailer
  return concat(frameParts)
}

// ─── Public: Export GIF ───────────────────────────────────────────────────────

export interface GifExportHandle { cancel: () => void }

export function exportGif(
  stage: Konva.Stage,
  durationMs: number,
  fps: number,
  scale: number,
  onProgress: (p: number) => void,
  onEncodeProgress: (p: number) => void,
  onDone: (blob: Blob) => void,
): GifExportHandle {
  const frameDelay = Math.round(1000 / fps)
  const frames: Array<{ canvas: HTMLCanvasElement; delayMs: number }> = []
  let elapsed = 0, cancelled = false
  let rafId: number
  let lastCaptureTs = 0

  // RAF-based capture: fires after each browser paint so the Konva canvas
  // always reflects the latest React render (avoids stale-frame issue with setInterval).
  function captureLoop(ts: number) {
    if (cancelled) return
    if (lastCaptureTs === 0) lastCaptureTs = ts

    const sinceLast = ts - lastCaptureTs
    if (sinceLast >= frameDelay) {
      frames.push({ canvas: composeStage(stage), delayMs: frameDelay })
      elapsed += sinceLast
      lastCaptureTs = ts
      onProgress(Math.min(0.9, elapsed / durationMs))

      if (elapsed >= durationMs) {
        onEncodeProgress(0)
        setTimeout(() => {
          if (cancelled) return
          const gif = buildAnimatedGif(frames, scale)
          onEncodeProgress(1)
          onDone(new Blob([gif as BlobPart], { type: 'image/gif' }))
        }, 16)
        return
      }
    }
    rafId = requestAnimationFrame(captureLoop)
  }
  rafId = requestAnimationFrame(captureLoop)

  return { cancel: () => { cancelled = true; cancelAnimationFrame(rafId) } }
}

// ─── Public: Export Video (MP4) ───────────────────────────────────────────────

export interface VideoExportHandle { cancel: () => void }

// Lazy-instantiate ffmpeg.wasm and cache the instance for the lifetime of the page.
// `load()` downloads ~5MB of WASM on first call (browser caches it after); subsequent
// exports reuse the same loaded instance for instant remux.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ffmpegInstance: any = null
async function getFFmpeg() {
  if (ffmpegInstance) return ffmpegInstance
  const { FFmpeg } = await import('@ffmpeg/ffmpeg')
  const ffmpeg = new FFmpeg()
  await ffmpeg.load()
  ffmpegInstance = ffmpeg
  return ffmpeg
}

async function remuxFmp4ToStandardMp4(fmp4Blob: Blob): Promise<Blob> {
  const ffmpeg = await getFFmpeg()
  const { fetchFile } = await import('@ffmpeg/util')
  await ffmpeg.writeFile('in.mp4', await fetchFile(fmp4Blob))
  await ffmpeg.exec(['-i', 'in.mp4', '-c', 'copy', '-movflags', '+faststart', 'out.mp4'])
  const data = await ffmpeg.readFile('out.mp4')
  return new Blob([data as BlobPart], { type: 'video/mp4' })
}

export function exportVideo(
  stage: Konva.Stage,
  durationMs: number,
  scale: number,
  onProgress: (p: number) => void,
  onDone: (blob: Blob) => void,
): VideoExportHandle {
  const w = Math.round(stage.width() * scale), h = Math.round(stage.height() * scale)
  const offscreen = document.createElement('canvas'); offscreen.width = w; offscreen.height = h
  const ctx = offscreen.getContext('2d')!

  const mimeType = ['video/mp4', 'video/webm;codecs=vp9', 'video/webm']
    .find(m => MediaRecorder.isTypeSupported(m)) ?? 'video/webm'

  const stream = offscreen.captureStream(30)
  const recorder = new MediaRecorder(stream, { mimeType })
  const chunks: Blob[] = []
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
  recorder.onstop = async () => {
    cancelAnimationFrame(rafId)
    const raw = new Blob(chunks, { type: mimeType })
    // Chromium's MediaRecorder ships fragmented MP4 (fMP4) — valid container, but macOS
    // QuickTime and other native players reject it. Remux through ffmpeg.wasm with
    // `-c copy -movflags +faststart` to produce a standard MP4 with the moov atom at
    // the start of the file. Codec stream is copied (no re-encode), so it's fast and
    // doesn't degrade quality.
    if (mimeType.includes('mp4')) {
      try {
        onDone(await remuxFmp4ToStandardMp4(raw))
        return
      } catch (err) {
        console.warn('[export] ffmpeg remux failed, falling back to raw fMP4', err)
      }
    }
    onDone(raw)
  }
  recorder.start()

  const t0 = performance.now()
  let rafId: number, cancelled = false

  function draw() {
    if (cancelled) return
    const elapsed = performance.now() - t0
    ctx.clearRect(0, 0, w, h)
    for (const layer of stage.getLayers()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ctx.drawImage((layer as any).getCanvas()._canvas as HTMLCanvasElement, 0, 0, w, h)
    }
    onProgress(Math.min(1, elapsed / durationMs))
    if (elapsed >= durationMs + 500) { recorder.stop(); return }
    rafId = requestAnimationFrame(draw)
  }
  rafId = requestAnimationFrame(draw)

  return {
    cancel: () => {
      cancelled = true; cancelAnimationFrame(rafId)
      if (recorder.state !== 'inactive') recorder.stop()
    },
  }
}
