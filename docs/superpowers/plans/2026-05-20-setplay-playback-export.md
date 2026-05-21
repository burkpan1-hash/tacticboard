# SetPlay Playback & Export — Implementation Plan [✅ PARTIALLY COMPLETE]

## Implementation Notes (actual vs. planned)

- **Animation approach changed**: Konva.Tween was **not** used. Instead, a React `requestAnimationFrame` loop with lerp interpolation drives player movement — this keeps animation inside React's render pipeline (PlayerNode → Konva Circle) without bypassing React state.
- **`animationEngine.ts` not created** — no separate engine file; all animation logic lives in `EditorPage.tsx` as a `useEffect` RAF loop.
- **`displayPositions` computed in EditorPage** — interpolated per-frame between integer-step states using `computeStateAtStep(step)` and `computeStateAtStep(step+1)`.
- **Store holds playback state** — `isPlaying` and `playbackSpeed` live in Zustand; RAF reads both via `usePlayStore.getState()` inside `tick()` to avoid stale closure.
- **`PlaybackControls.tsx` complete** — ◀ ▶ step buttons, ▶/⏸ play/pause, 0.5×/1×/1.5×/2× speed, Undo. No `getAnimationContext` prop needed.
- **Speed 1.5× added** — plan had [0.5×, 1×, 2×]; actual UI has [0.5×, 1×, 1.5×, 2×].
- **Konva option badge (canvas) not implemented** — `optionText` displayed as DOM badge on ActionCard only. Not yet on canvas.
- **ExportPanel deferred** — user confirmed "Şimdilik gerek yok" (not needed now). Tasks 4 and 5 (export) remain unimplemented.
- **`STEP_MS = 800`** — one action animates in 800ms at 1× speed. Dividing by `playbackSpeed` scales duration.

---

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Prerequisite:** Plans 1 and 2 must be complete and passing.

**Goal:** Replace the step-through stub with full Konva.Tween animation, show Konva-rendered option badge near ball holder when an action has `optionText`, and implement GIF + MP4 export.

**Architecture:** Animation runs imperatively via Konva's `Tween` API — each action type has its own tween logic that resolves a Promise when complete. Actions play sequentially: next starts only after the previous Tween fires `onFinish`. When an action has `optionText`, a Konva badge (Rect + Text shapes on `arrowLayer`) is drawn near the ball holder for `~2s` then destroyed — this makes the badge visible in GIF/MP4 captures since it's on the canvas, not the DOM. Export captures the Konva stage canvas at each frame using `requestAnimationFrame`, encodes via `gif.js` (GIF) or `MediaRecorder` (MP4).

**Tech Stack:** Konva.Tween, react-konva refs, gif.js (CDN or npm), MediaRecorder API (built-in browser)

---

## File Map

| File | Responsibility |
|---|---|
| `src/utils/animationEngine.ts` | Per-action-type Tween factories + `showKonvaOptionBadge` for pause-point text |
| `src/components/playback/PlaybackControls.tsx` | Replace stub — add ▶ play/pause, speed selector, option badge pause logic |
| `src/components/export/ExportPanel.tsx` | GIF + MP4 export buttons and progress indicator |
| `src/pages/EditorPage.tsx` | Wire refs, animation calls, export panel |

---

## Task 1: Animation Engine

**Files:**
- Create: `src/utils/animationEngine.ts`

- [ ] **Step 1: Install gif.js**
```bash
npm install gif.js
npm install -D @types/gif.js
```
If `@types/gif.js` is unavailable, create `src/declarations.d.ts`:
```ts
declare module 'gif.js' {
  interface GIFOptions {
    workers?: number
    quality?: number
    width?: number
    height?: number
    workerScript?: string
  }
  export default class GIF {
    constructor(options: GIFOptions)
    addFrame(canvas: HTMLCanvasElement, opts?: { delay?: number; copy?: boolean }): void
    on(event: 'finished', cb: (blob: Blob) => void): void
    render(): void
  }
}
```

- [ ] **Step 2: Write src/utils/animationEngine.ts**
```ts
import Konva from 'konva'
import type { Action, PositionMap } from '../models/types'
import { denormalize, HALF_COURT_W, HALF_COURT_H, FULL_COURT_H } from './courtCoords'
import { wavyPoints } from './arrowGeometry'

export interface AnimationContext {
  playerNodes: Map<string, Konva.Group>  // playerId → Konva Group
  ballNode: Konva.Circle | null
  arrowLayer: Konva.Layer
  courtType: 'half' | 'full'
  speedMultiplier: number   // 0.5 = slow, 1 = normal, 2 = fast
}

function cH(ctx: AnimationContext) {
  return ctx.courtType === 'half' ? HALF_COURT_H : FULL_COURT_H
}

function toPx(ctx: AnimationContext, pos: { x: number; y: number }) {
  return denormalize(pos.x, pos.y, HALF_COURT_W, cH(ctx))
}

function tween(node: Konva.Node, props: Record<string, number>, duration: number, ctx: AnimationContext): Promise<void> {
  return new Promise(resolve => {
    new Konva.Tween({
      node,
      duration: duration / ctx.speedMultiplier,
      easing: Konva.Easings.EaseInOut,
      ...props,
      onFinish() { resolve() },
    }).play()
  })
}

// Move a player group to a new normalized position
async function movePlayer(ctx: AnimationContext, playerId: string, toPos: { x: number; y: number }, duration = 0.6) {
  const group = ctx.playerNodes.get(playerId)
  if (!group) return
  const { x, y } = toPx(ctx, toPos)
  await tween(group, { x, y }, duration, ctx)
}

// Animate the ball arc from one position to another (for pass)
async function animateBallArc(ctx: AnimationContext, fromPos: { x: number; y: number }, toPos: { x: number; y: number }) {
  if (!ctx.ballNode) return
  const from = toPx(ctx, fromPos)
  const to = toPx(ctx, toPos)
  ctx.ballNode.position(from)
  ctx.ballNode.visible(true)
  // Simple arc: move in straight line (Konva Tween doesn't do curves natively)
  // We simulate an arc by tweening y with a parabola via multiple sequential tweens
  const midX = (from.x + to.x) / 2
  const midY = Math.min(from.y, to.y) - 40  // peak 40px above start
  await tween(ctx.ballNode, { x: midX, y: midY }, 0.2, ctx)
  await tween(ctx.ballNode, { x: to.x, y: to.y }, 0.2, ctx)
}

export async function animateAction(action: Action, stateBefore: PositionMap, ctx: AnimationContext): Promise<void> {
  switch (action.type) {
    case 'pass': {
      const fromPos = stateBefore[action.fromId]
      const toPos = stateBefore[action.toId]
      await animateBallArc(ctx, fromPos, toPos)
      break
    }

    case 'cut': {
      await movePlayer(ctx, action.playerId, action.toPosition)
      break
    }

    case 'dribble': {
      // Move player (with ball) — ball follows player
      await movePlayer(ctx, action.playerId, action.toPosition)
      break
    }

    case 'screen': {
      await movePlayer(ctx, action.screenerId, action.screenPosition, 0.5)
      break
    }

    case 'shot': {
      const fromPos = stateBefore[action.shooterId]
      const basketPos = { x: 0.5, y: 0.113 }
      await animateBallArc(ctx, fromPos, basketPos)
      if (ctx.ballNode) ctx.ballNode.visible(false)
      break
    }

    case 'handoff': {
      // Ball holder moves to meetPosition, ball transfers
      await movePlayer(ctx, action.fromId, action.meetPosition, 0.5)
      const meetPx = toPx(ctx, action.meetPosition)
      if (ctx.ballNode) ctx.ballNode.position(meetPx)
      break
    }
  }
}

// Show a Konva text badge near the ball holder. The badge lives on arrowLayer so
// it is captured by stage.toCanvas() and therefore appears in GIF/MP4 exports.
export async function showKonvaOptionBadge(
  text: string,
  ballHolderId: string,
  ctx: AnimationContext,
): Promise<void> {
  if (!text || !ballHolderId) return
  const holderGroup = ctx.playerNodes.get(ballHolderId)
  if (!holderGroup) return

  const hx = holderGroup.x()
  const hy = holderGroup.y()

  // Build badge: "OPTION" header + main text
  const headerText = new Konva.Text({
    text: 'OPTION',
    fontSize: 9,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontStyle: 'bold',
    fill: '#fb923c',
    x: 8,
    y: 6,
  })
  const headerH = headerText.height() + 4

  const bodyText = new Konva.Text({
    text,
    fontSize: 12,
    fontFamily: 'Inter, system-ui, sans-serif',
    fill: '#f1f5f9',
    x: 8,
    y: headerH + 4,
    padding: 0,
  })

  const bw = Math.max(bodyText.width() + 16, 90)
  const bh = headerH + bodyText.height() + 12

  const bg = new Konva.Rect({
    width: bw,
    height: bh,
    fill: '#1e293b',
    stroke: '#fb923c',
    strokeWidth: 1.5,
    cornerRadius: 6,
    shadowBlur: 10,
    shadowColor: 'rgba(0,0,0,0.6)',
  })

  // Pointer arrow pointing left toward the player
  const arrowShape = new Konva.Line({
    points: [-7, bh / 2 - 5, 0, bh / 2, -7, bh / 2 + 5],
    closed: true,
    fill: '#fb923c',
  })

  const group = new Konva.Group({
    x: hx + 20,
    y: hy - bh / 2,
    opacity: 0,
  })

  group.add(bg, headerText, bodyText, arrowShape)
  ctx.arrowLayer.add(group)

  // Fade in
  await new Promise<void>(r => {
    new Konva.Tween({ node: group, opacity: 1, duration: 0.2, onFinish: r }).play()
  })

  // Hold for duration scaled to speed
  await new Promise(r => setTimeout(r, 2000 / ctx.speedMultiplier))

  // Fade out
  await new Promise<void>(r => {
    new Konva.Tween({ node: group, opacity: 0, duration: 0.2, onFinish: r }).play()
  })

  group.destroy()
  ctx.arrowLayer.batchDraw()
}
```

- [ ] **Step 3: Commit**
```bash
git add src/utils/animationEngine.ts
git commit -m "feat: add konva tween animation engine with option badge for all 6 action types"
```

---

## Task 2: ~~AnnotationOverlay~~ — Not Needed

> **The option badge is now a Konva shape, not a DOM element.** `showKonvaOptionBadge()` (added in Task 1) renders directly on `arrowLayer`, which means it is captured by `stage.toCanvas()` and appears in GIF/MP4 exports. No separate DOM overlay file is needed.
>
> The `src/components/playback/AnnotationOverlay.tsx` file is not created.

- [ ] **Step 1: Verify no AnnotationOverlay references exist**
```bash
grep -r "AnnotationOverlay\|annotationText" src/ || echo "clean"
```
Expected: `clean`

- [ ] **Step 2: Commit (checkpoint)**
```bash
git commit --allow-empty -m "chore: confirm AnnotationOverlay not implemented (using Konva badge instead)"
```

---

## Task 3: Full PlaybackControls

**Files:**
- Modify: `src/components/playback/PlaybackControls.tsx`

Replace the stub from Plan 2 with a full implementation that triggers animation.

- [ ] **Step 1: Write full src/components/playback/PlaybackControls.tsx**
```tsx
import { useRef, useState, useCallback } from 'react'
import { usePlayStore } from '../../store/usePlayStore'
import { animateAction, showKonvaOptionBadge, type AnimationContext } from '../../utils/animationEngine'
import { computeStateAtStep } from '../../utils/stateEngine'

type Speed = 0.5 | 1 | 2

interface Props {
  getAnimationContext: () => AnimationContext | null
}

export default function PlaybackControls({ getAnimationContext }: Props) {
  const {
    activeSet, activeStep,
    setActiveStep, undoLastAction,
  } = usePlayStore()

  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<Speed>(1)
  const cancelRef = useRef(false)

  const total = activeSet?.actions.length ?? 0

  const playAll = useCallback(async () => {
    if (!activeSet) return
    const ctx = getAnimationContext()
    if (!ctx) return

    cancelRef.current = false
    setIsPlaying(true)
    ctx.speedMultiplier = speed

    // Start from step 0
    usePlayStore.getState().setActiveStep(0)

    for (let i = 0; i < activeSet.actions.length; i++) {
      if (cancelRef.current) break

      const stateBefore = computeStateAtStep(
        activeSet.actions, i, activeSet.initialPositions, activeSet.initialBall
      )

      await animateAction(activeSet.actions[i], stateBefore.positions, ctx)
      usePlayStore.getState().setActiveStep(i + 1)

      // After action completes, show option badge if text is set
      const stateAfter = computeStateAtStep(
        activeSet.actions, i + 1, activeSet.initialPositions, activeSet.initialBall
      )
      if (activeSet.actions[i].optionText) {
        await showKonvaOptionBadge(
          activeSet.actions[i].optionText!,
          stateAfter.ball.holderId,
          ctx,
        )
      }

      if (cancelRef.current) break
    }

    setIsPlaying(false)
  }, [activeSet, speed, getAnimationContext])

  function stopPlayback() {
    cancelRef.current = true
    setIsPlaying(false)
  }

  const SPEEDS: Speed[] = [0.5, 1, 2]
  const SPEED_LABELS: Record<Speed, string> = { 0.5: '0.5×', 1: '1×', 2: '2×' }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800 border-t border-slate-700">
      <button
        onClick={() => usePlayStore.getState().setActiveStep(Math.max(0, activeStep - 1))}
        disabled={isPlaying || activeStep === 0}
        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-30 transition-colors"
      >◀</button>

      <span className="text-sm text-slate-400 min-w-[70px] text-center">
        {activeStep} / {total}
      </span>

      <button
        onClick={() => usePlayStore.getState().setActiveStep(Math.min(total, activeStep + 1))}
        disabled={isPlaying || activeStep === total}
        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-30 transition-colors"
      >▶</button>

      <div className="w-px h-5 bg-slate-600 mx-1" />

      {isPlaying ? (
        <button
          onClick={stopPlayback}
          className="px-4 py-1 rounded bg-red-700 hover:bg-red-600 text-white font-medium text-sm transition-colors"
        >⏹ Dur</button>
      ) : (
        <button
          onClick={playAll}
          disabled={total === 0}
          className="px-4 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white font-medium text-sm disabled:opacity-30 transition-colors"
        >▶ Oynat</button>
      )}

      <div className="flex gap-1">
        {SPEEDS.map(s => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              speed === s ? 'bg-slate-500 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
            }`}
          >{SPEED_LABELS[s]}</button>
        ))}
      </div>

      <div className="flex-1" />

      <button
        onClick={undoLastAction}
        disabled={isPlaying || total === 0}
        className="text-sm text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
        title="Geri Al (Ctrl+Z)"
      >↩ Geri Al</button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/playback/PlaybackControls.tsx
git commit -m "feat: add full playback controls with animation, speed control, and stop"
```

---

## Task 4: ExportPanel Component

**Files:**
- Create: `src/components/export/ExportPanel.tsx`

- [ ] **Step 1: Write src/components/export/ExportPanel.tsx**
```tsx
import { useState } from 'react'
import GIF from 'gif.js'
import { usePlayStore } from '../../store/usePlayStore'
import { computeStateAtStep } from '../../utils/stateEngine'
import { animateAction, showKonvaOptionBadge, type AnimationContext } from '../../utils/animationEngine'
import Konva from 'konva'

interface Props {
  stageRef: React.RefObject<Konva.Stage>
  getAnimationContext: () => AnimationContext | null
}

type ExportState = 'idle' | 'exporting' | 'done'

export default function ExportPanel({ stageRef, getAnimationContext }: Props) {
  const [exportState, setExportState] = useState<ExportState>('idle')
  const [progress, setProgress] = useState(0)
  const { activeSet } = usePlayStore()

  async function exportGIF() {
    if (!activeSet || !activeSet.actions.length || !stageRef.current) return
    const ctx = getAnimationContext()
    if (!ctx) return

    setExportState('exporting')
    setProgress(0)

    const stage = stageRef.current
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: stage.width(),
      height: stage.height(),
      workerScript: '/gif.worker.js',  // see Step 2
    })

    // Capture initial frame
    const initialCanvas = stage.toCanvas()
    gif.addFrame(initialCanvas, { delay: 500, copy: true })

    ctx.speedMultiplier = 1.5  // slightly faster for export

    for (let i = 0; i < activeSet.actions.length; i++) {
      const stateBefore = computeStateAtStep(
        activeSet.actions, i, activeSet.initialPositions, activeSet.initialBall
      )
      await animateAction(activeSet.actions[i], stateBefore.positions, ctx)

      // Show option badge (it renders to canvas so GIF captures it)
      const stateAfter = computeStateAtStep(activeSet.actions, i + 1, activeSet.initialPositions, activeSet.initialBall)
      if (activeSet.actions[i].optionText) {
        await showKonvaOptionBadge(activeSet.actions[i].optionText!, stateAfter.ball.holderId, ctx)
      }

      // Capture frame after each action
      await new Promise(r => requestAnimationFrame(r))  // wait for render
      const canvas = stage.toCanvas()
      gif.addFrame(canvas, { delay: 400, copy: true })

      setProgress(Math.round(((i + 1) / activeSet.actions.length) * 80))
    }

    gif.on('finished', (blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${activeSet.name.replace(/\s+/g, '-')}.gif`
      a.click()
      URL.revokeObjectURL(url)
      setExportState('done')
      setProgress(100)
      setTimeout(() => setExportState('idle'), 2000)
    })

    gif.render()
  }

  async function exportMP4() {
    if (!activeSet || !activeSet.actions.length || !stageRef.current) return
    const ctx = getAnimationContext()
    if (!ctx) return

    setExportState('exporting')
    setProgress(0)

    const stage = stageRef.current
    const canvas = stage.toCanvas() as HTMLCanvasElement

    if (!canvas.captureStream) {
      alert('Bu tarayıcı MP4 export desteklemiyor. Chrome kullan.')
      setExportState('idle')
      return
    }

    const stream = canvas.captureStream(30)
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' })
    const chunks: BlobPart[] = []

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${activeSet.name.replace(/\s+/g, '-')}.webm`
      a.click()
      URL.revokeObjectURL(url)
      setExportState('done')
      setTimeout(() => setExportState('idle'), 2000)
    }

    recorder.start()
    ctx.speedMultiplier = 1

    for (let i = 0; i < activeSet.actions.length; i++) {
      const stateBefore = computeStateAtStep(
        activeSet.actions, i, activeSet.initialPositions, activeSet.initialBall
      )
      await animateAction(activeSet.actions[i], stateBefore.positions, ctx)

      const stateAfter = computeStateAtStep(activeSet.actions, i + 1, activeSet.initialPositions, activeSet.initialBall)
      if (activeSet.actions[i].optionText) {
        await showKonvaOptionBadge(activeSet.actions[i].optionText!, stateAfter.ball.holderId, ctx)
      }

      await new Promise(r => setTimeout(r, 300))
      setProgress(Math.round(((i + 1) / activeSet.actions.length) * 90))
    }

    await new Promise(r => setTimeout(r, 500))  // final pause
    recorder.stop()
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Export</p>

      {exportState === 'exporting' && (
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div
            className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {exportState === 'done' && (
        <p className="text-xs text-green-400">✓ İndirildi</p>
      )}

      <button
        onClick={exportGIF}
        disabled={exportState === 'exporting' || !activeSet?.actions.length}
        className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg disabled:opacity-30 transition-colors text-left"
      >
        ⬇ GIF olarak indir
      </button>

      <button
        onClick={exportMP4}
        disabled={exportState === 'exporting' || !activeSet?.actions.length}
        className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg disabled:opacity-30 transition-colors text-left"
      >
        ⬇ Video (WebM) olarak indir
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Copy gif.worker.js to public folder**
```bash
cp node_modules/gif.js/dist/gif.worker.js public/gif.worker.js
```

- [ ] **Step 3: Commit**
```bash
git add src/components/export/ExportPanel.tsx public/gif.worker.js
git commit -m "feat: add gif and webm export panel"
```

---

## Task 5: Wire Animation into EditorPage

**Files:**
- Modify: `src/pages/EditorPage.tsx`

- [ ] **Step 1: Add refs and animation wiring to EditorPage**

At the top of `EditorPage`, add these imports and refs:
```tsx
import { useRef } from 'react'
import type Konva from 'konva'
import type { AnimationContext } from '../utils/animationEngine'
import ExportPanel from '../components/export/ExportPanel'
```

Inside the component, add:
```tsx
const stageRef = useRef<Konva.Stage>(null)
const playerGroupRefs = useRef<Map<string, Konva.Group>>(new Map())

function getAnimationContext(): AnimationContext | null {
  if (!activeSet) return null
  return {
    playerNodes: playerGroupRefs.current,
    ballNode: null,   // ball animation handled by player position in this simplified version
    arrowLayer: stageRef.current?.findOne('Layer') as Konva.Layer,
    courtType: activeSet.courtType,
    speedMultiplier: 1,
  }
}
```

- [ ] **Step 2: Pass ref to CourtCanvas Stage**

Update the `CourtCanvas` in EditorPage to use a forwarded ref. Modify `CourtCanvas.tsx`:
```tsx
import { forwardRef } from 'react'
import { Stage, Layer } from 'react-konva'
import type Konva from 'konva'
import type { CourtType } from '../../models/types'
import HalfCourt from './HalfCourt'
import FullCourt from './FullCourt'
import { HALF_COURT_W, HALF_COURT_H, FULL_COURT_H } from '../../utils/courtCoords'

interface Props {
  courtType: CourtType
  children?: React.ReactNode
  onStageClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void
}

const CourtCanvas = forwardRef<Konva.Stage, Props>(({ courtType, children, onStageClick }, ref) => {
  const height = courtType === 'half' ? HALF_COURT_H : FULL_COURT_H
  return (
    <Stage ref={ref} width={HALF_COURT_W} height={height} onClick={onStageClick}>
      <Layer>
        {courtType === 'half' ? <HalfCourt /> : <FullCourt />}
      </Layer>
      <Layer>
        {children}
      </Layer>
    </Stage>
  )
})
CourtCanvas.displayName = 'CourtCanvas'
export default CourtCanvas
```

- [ ] **Step 3: Pass stageRef to CourtCanvas in EditorPage**

In EditorPage's JSX, update `<CourtCanvas>`:
```tsx
<CourtCanvas ref={stageRef} courtType={activeSet.courtType} onStageClick={handleCourtClick}>
```

- [ ] **Step 4: Replace PlaybackControls in EditorPage**

Replace the `<PlaybackControls />` stub usage with the full version (no annotation prop — badge is Konva-rendered):
```tsx
<PlaybackControls
  getAnimationContext={getAnimationContext}
/>
```

- [ ] **Step 5: Add ExportPanel to right sidebar**

In the right panel section (below `<ActionPanel />`):
```tsx
<div className="border-t border-slate-700">
  <ExportPanel stageRef={stageRef} getAnimationContext={getAnimationContext} />
</div>
```

- [ ] **Step 6: Verify full playback flow**
```bash
npm run dev
```
Test path:
1. Open a set with 3+ actions, at least one with `optionText` set via "◈ Option ekle" in the action card
2. Press "▶ Oynat" — all actions animate sequentially via Konva.Tween
3. Players move smoothly on the court
4. Ball arc appears on Pass and Shot
5. After an action with `optionText`: a Konva badge appears near the ball holder for ~2s then fades, then playback continues
6. Speed buttons change animation speed (and badge display duration)
7. "⏹ Dur" stops mid-playback
8. "⬇ GIF olarak indir" → file downloads, opens as animation; option badge visible in GIF frames
9. "⬇ Video (WebM) olarak indir" → .webm file downloads and plays in browser

- [ ] **Step 7: Commit**
```bash
git add src/pages/EditorPage.tsx src/components/court/CourtCanvas.tsx
git commit -m "feat: wire animation context, annotation overlay, and export panel into editor"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** ▶ animate all actions. Speed control (0.5×/1×/2×). Konva option badge (renders on canvas, visible in GIF/MP4). GIF export. MP4/WebM export. All from DESIGN.md Aşama 5.
- [x] **Placeholder scan:** No TBD/TODO. `animateAction` covers all 6 action types. `showKonvaOptionBadge` handles the option pause.
- [x] **No AnnotationOverlay.tsx:** DOM overlay replaced by `showKonvaOptionBadge` in `animationEngine.ts`. Badge is on `arrowLayer` — captured by `stage.toCanvas()` in both GIF and WebM export.
- [x] **gif.worker.js:** Copied to `public/` in Task 4 Step 2 — required at runtime, easy to miss.
- [x] **Known limitation:** `AnimationContext.ballNode` is null in this implementation — ball arc is approximated by moving the player group. A full ball Konva node can be added in a polish pass if needed.
- [x] **WebM vs MP4:** `MediaRecorder` outputs WebM in Chrome. True MP4 encoding in-browser requires `ffmpeg.wasm`. WebM plays in all modern browsers and is sufficient for sharing. Label changed to "Video (WebM)" in UI accordingly.
