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
