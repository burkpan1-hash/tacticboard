# Export v2 — Deterministic client-side MP4 export

**Date:** 2026-06-13
**Status:** Approved design
**Approach:** A — Off-DOM Konva render, deterministic frame loop

## Problem

The current export (`src/utils/exportAnimation.ts`) captures the **live** Konva
stage in **real time** while playback runs, feeding the WebCodecs encoder
timestamps derived from `performance.now()`. Those non-uniform timestamps
produce a **corrupt MP4** — the file downloads but will not open in players or
social platforms. Export's only purpose is posting clips to social media
(Twitter, YouTube, Instagram, TikTok), so a broken MP4 makes the feature
useless.

## Goals

- Produce a valid, universally playable **MP4 (H.264)** entirely **client-side**
  (no server, no cost).
- Support **multiple aspect ratios** so the same play can be posted to each
  platform separately: 9:16 (TikTok / IG story), 1:1 (IG feed), 16:9
  (Twitter / YouTube).
- Decouple export from real-time playback so backgrounded tabs or slow machines
  cannot corrupt the output.
- Keep the export engine isolated from the editor (this is a from-scratch
  rebuild of the export "backend").

## Non-goals

- Server-side rendering (rejected: cost/complexity for a freemium app).
- WebM fallback (rejected: WebM cannot be posted to the target platforms — this
  was the original failure mode).
- Audio.
- Older browsers without WebCodecs (shown a friendly message instead).

## Key insight

The board's full state at any instant is a **pure function** of
`(step, fraction)`:

- `currentState = computeStateAtStep(actions, step, ...)`
- `toState = computeStateAtStep(actions, step + 1, ...)`
- each player position is interpolated by `fraction` (with drawn-waypoint path
  support), exactly as `EditorPage`'s `displayPositions` does today.

There is **no Konva tween and no wall-clock dependency**. Therefore we can
compute the exact board state for any frame timestamp and render frames
deterministically.

## Architecture — modules

Each module has a single responsibility and is independently testable.

| Module | Responsibility | Depends on |
|--------|----------------|------------|
| `src/utils/frameState.ts` | **Pure**: `computeFrameState(set, step, fraction, basketY, cH)` → interpolated positions + ball + active arrows for that instant. The `displayPositions` logic currently inline in `EditorPage` moves here. | `stateEngine` |
| `src/utils/export/exportScene.ts` | Builds an off-DOM Konva stage + nodes (`buildScene`), and `renderFrame(state)` updates node positions per frame. | `konva` |
| `src/utils/export/composite.ts` | Centers the scene canvas into the target aspect ratio (9:16 / 1:1 / 16:9), fills background, draws watermark. Returns letterbox rect (pure, testable). | none |
| `src/utils/export/encodeMp4.ts` | WebCodecs `VideoEncoder` + `mp4-muxer`. **Monotonic** timestamps (`i * 1e6/FPS`), fixed keyframe interval. | `mp4-muxer` |
| `src/utils/export/exportVideo.ts` | Orchestrator: splits duration into frames, runs the loop, reports progress, supports cancel. | the above |
| `src/components/export/ExportModal.tsx` | UI — rewritten with an aspect-ratio selector. | `exportVideo` |

**Deleted:** `src/utils/exportAnimation.ts` entirely.
**Kept:** the `mp4-muxer` dependency (used correctly this time).

## Frame generation (root-cause fix)

- `totalMs = sum(computeAllStepMs(...))` + **500 ms freeze** at the end so the
  final position is visible.
- `FPS = 30`; `frameCount = ceil(totalMs / 1000 * FPS)`.
- For frame `i`:
  1. `t = i / FPS` seconds → resolve `(step, fraction)` from the per-step
     durations.
  2. `state = computeFrameState(set, step, fraction, ...)`.
  3. `exportScene.renderFrame(state)` → capture scene canvas.
  4. `composite()` → target-aspect canvas.
  5. `encoder.encode(frame, { timestamp: Math.round(i * 1e6 / FPS), keyFrame: i % (FPS*2) === 0 })`.
- Fully decoupled from real time — backgrounded tabs cannot drop/misorder
  frames. The corrupt-MP4 cause (irregular `performance.now()` timestamps) is
  eliminated.

## Output formats & resolution

| Aspect | Resolution | Platform |
|--------|-----------|----------|
| 9:16 | 1080×1920 | TikTok, IG/Reels story |
| 1:1 | 1080×1080 | IG feed |
| 16:9 | 1920×1080 | Twitter, YouTube |

The court is centered into the chosen canvas **preserving its own aspect
ratio**; remaining area is filled with the theme color `#0f172a`. All
dimensions are even (H.264 requirement). H.264 High Profile, ~8–12 Mbps,
30 fps.

## UI (ExportModal)

- Remove the old **1× / 2×** quality selector.
- Add **3 aspect-ratio buttons** (vertical / square / horizontal icons).
- Flow unchanged: select → "Export" → progress bar → download → Pro upsell.
- Progress is **real** (total frame count known up front) — no fake
  `0.85 → 0.99` animation.
- Small low-opacity `basketballtacticboard.com` watermark in the bottom-left
  corner (for social reach; removable).

## Error & unsupported-browser handling

- If `VideoEncoder` is undefined: **no WebM fallback**. Show a clear message:
  *"Video export için Chrome, Edge veya Safari 16.4+ kullan."* Coverage ≈ 95%+
  of modern browsers.
- Encoder error → surface an error message + retry; never emit a silent corrupt
  file.
- Cancel: the loop stops immediately on a `cancelled` flag and closes the
  encoder.

## Testing

- `frameState` and `composite` are pure → unit tests (known input → expected
  positions / letterbox rect).
- `exportVideo` smoke test: export a short play, assert the blob is non-empty,
  is `video/mp4`, and its first frame decodes.

## Migration / scope

1. Add `frameState.ts`; refactor `EditorPage` to consume it (de-duplicates the
   interpolation logic; behavior unchanged).
2. Build the `export/` modules.
3. Rewrite `ExportModal`.
4. Delete `exportAnimation.ts`.
5. Add/update i18n keys for the aspect-ratio selector and the unsupported
   message.
