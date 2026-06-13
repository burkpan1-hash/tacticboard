import { Muxer, ArrayBufferTarget } from 'mp4-muxer'

/** True when the browser can encode H.264 via WebCodecs. */
export function isVideoExportSupported(): boolean {
  return typeof VideoEncoder !== 'undefined' && typeof VideoFrame !== 'undefined'
}

export interface EncoderOpts { width: number; height: number; fps: number; bitrate?: number }

export interface Mp4Encoder {
  addFrame(canvas: HTMLCanvasElement, frameIndex: number): void
  finish(): Promise<Blob>
  cancel(): void
}

export function createMp4Encoder({ width, height, fps, bitrate }: EncoderOpts): Mp4Encoder {
  if ((width & 1) || (height & 1)) throw new RangeError('H.264 requires even width and height')
  // ~0.12 bits/px/frame, clamped to 4–20 Mbps
  const br = bitrate ?? Math.min(20_000_000, Math.max(4_000_000, Math.round(width * height * fps * 0.12)))
  const target = new ArrayBufferTarget()
  const muxer = new Muxer({
    target,
    video: { codec: 'avc', width, height, frameRate: fps },
    fastStart: 'in-memory',
  })
  // High Profile L5.1 above 1280x720-equivalent, else L4.0 — QuickTime-safe.
  const codec = width * height > 921_600 ? 'avc1.640033' : 'avc1.640028'

  let encError: Error | null = null
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => { encError = e instanceof Error ? e : new Error(String(e)) },
  })
  try {
    encoder.configure({
      codec, width, height, bitrate: br, framerate: fps,
      latencyMode: 'quality',
      hardwareAcceleration: 'prefer-software', // more spec-compliant SPS/PPS
    })
  } catch {
    throw new Error('UNSUPPORTED')
  }

  const usPerFrame = 1_000_000 / fps
  const keyFrameInterval = Math.max(1, Math.round(fps * 2))
  return {
    addFrame(canvas, frameIndex) {
      if (encError) throw encError
      // MONOTONIC, evenly spaced timestamps — the root-cause fix for corrupt MP4.
      const timestamp = Math.round(frameIndex * usPerFrame)
      const vf = new VideoFrame(canvas, { timestamp, duration: Math.round(usPerFrame) })
      encoder.encode(vf, { keyFrame: frameIndex % keyFrameInterval === 0 })
      vf.close()
    },
    async finish() {
      try {
        await encoder.flush()
        if (encError) throw encError
        muxer.finalize()
        return new Blob([target.buffer], { type: 'video/mp4' })
      } finally {
        if (encoder.state !== 'closed') encoder.close()
      }
    },
    cancel() {
      if (encoder.state !== 'closed') encoder.close()
    },
  }
}
