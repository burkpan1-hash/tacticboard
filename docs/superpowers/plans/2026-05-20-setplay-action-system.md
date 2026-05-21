# SetPlay Action System — Implementation Plan [✅ COMPLETE]

> **Status:** All tasks complete. See implementation notes below for deviations from this plan.

## Implementation Notes (actual vs planned)

- **`ScreenSymbol.tsx` not created** — screen rendering is inside `ActionArrow.tsx` alongside the other 5 types.
- **`players` prop removed** from `ActionArrow` and `ActionOverlay` — unused; positions map is sufficient.
- **`COURT_PADDING_X` click fix** — plan had `nx = pos.x / HALF_COURT_W` but the court group is offset 30px inside Stage, so correct formula is `nx = (pos.x - COURT_PADDING_X) / HALF_COURT_W`.
- **`setActiveSet` step fix** — store now preserves `activeStep` when updating the same set (prevents step resetting to 0 after every action).
- **Action colors moved** to `src/utils/actionColors.ts` — single source used by ActionArrow, ActionPreview, ActionToolbar, ActionCard.
- **New colors**: cut changed from green `#34d399` to pink `#f472b6` (green was indistinguishable from court). All colors updated for distinctiveness.
- **Screen bar enlarged**: `halfLen=22`, `strokeWidth=6`, `strokeLinecap=round` (was 14/3.5).
- **`ActionPreview.tsx` added** (not in plan) — ghost cursor preview while creating an action.
- **`onMouseMove` / `onMouseLeave` added** to `CourtCanvas` for cursor preview.
- **`clearAllActions()` added** to store — "Clear" button in ActionPanel header.
- **✏️ edit button removed** from ActionCard — user preference.
- **`optionText` renamed** to "label" in UI ("Add label" instead of "Option ekle").
- **All UI text in English** — no Turkish strings remain in any component.
- **ActionCard**: player description added ("Pass: #1 → #3"); optionText always visible even when card not active; uses `ACTION_COLORS` hex values (not Tailwind classes) for border + label color.

---

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Prerequisite:** Plan 1 (Foundation) must be complete and passing.

**Goal:** Build the full action system — state engine, 6 action types with distinct visuals, action list panel with edit/delete/undo, option badges (pause-point text labels that appear near the ball holder during animation), and a fully wired EditorPage.

**Architecture:** Core logic lives in `stateEngine.ts` (pure functions, fully tested). All mutable state lives in Zustand store. Canvas elements (arrows, symbols) are Konva shapes rendered declaratively from store state. Action creation is a 2-click flow managed by an `actionCreation` slice in the store.

**Tech Stack:** react-konva (Konva shapes), Zustand (extended store), TypeScript discriminated unions for actions, Vitest (state engine tests)

---

## File Map

| File | Responsibility |
|---|---|
| `src/utils/stateEngine.ts` | Pure functions: `applyAction`, `computeStateAtStep` |
| `src/utils/stateEngine.test.ts` | Full coverage tests for state engine |
| `src/store/usePlayStore.ts` | Extended with action CRUD, option management, creation state |
| `src/components/actions/ActionArrow.tsx` | Konva arrows for Pass, Cut, Dribble, Shot, Handoff |
| `src/components/actions/ScreenSymbol.tsx` | Konva perpendicular-bar symbol for Screen |
| `src/components/actions/ActionOverlay.tsx` | Renders all arrows + symbols for current step |
| `src/components/actions/ActionPanel.tsx` | Right panel: scrollable action list |
| `src/components/actions/ActionCard.tsx` | Single action row with ✏️ ✕ and annotation |
| `src/components/actions/OptionBadge.tsx` | Inline option text add/edit UI inside ActionCard |
| `src/components/toolbar/ActionToolbar.tsx` | Left vertical toolbar: 6 action type buttons |
| `src/components/playback/PlaybackControls.tsx` | ◀ ▶ step-through (stub — animation in Plan 3) |
| `src/pages/EditorPage.tsx` | Full editor wiring |

---

## Task 1: State Engine

**Files:**
- Create: `src/utils/stateEngine.ts`
- Create: `src/utils/stateEngine.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/utils/stateEngine.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { applyAction, computeStateAtStep } from './stateEngine'
import type { PositionMap, BallState, Action } from '../models/types'

const P: PositionMap = {
  o1: { x: 0.5, y: 0.7 },
  o2: { x: 0.8, y: 0.5 },
  o3: { x: 0.2, y: 0.5 },
}
const B: BallState = { holderId: 'o1' }

describe('applyAction', () => {
  it('pass: transfers ball, no position change', () => {
    const s = applyAction({ id: '1', type: 'pass', fromId: 'o1', toId: 'o2' }, { positions: P, ball: B })
    expect(s.ball.holderId).toBe('o2')
    expect(s.positions).toEqual(P)
  })

  it('cut: moves player, no ball change', () => {
    const s = applyAction({ id: '1', type: 'cut', playerId: 'o2', toPosition: { x: 0.3, y: 0.3 } }, { positions: P, ball: B })
    expect(s.positions.o2).toEqual({ x: 0.3, y: 0.3 })
    expect(s.positions.o1).toEqual(P.o1)
    expect(s.ball).toEqual(B)
  })

  it('dribble: moves ball holder, ball stays on them', () => {
    const s = applyAction({ id: '1', type: 'dribble', playerId: 'o1', toPosition: { x: 0.6, y: 0.6 } }, { positions: P, ball: B })
    expect(s.positions.o1).toEqual({ x: 0.6, y: 0.6 })
    expect(s.ball.holderId).toBe('o1')
  })

  it('screen: moves screener, no ball change', () => {
    const s = applyAction({ id: '1', type: 'screen', screenerId: 'o3', screenPosition: { x: 0.45, y: 0.45 } }, { positions: P, ball: B })
    expect(s.positions.o3).toEqual({ x: 0.45, y: 0.45 })
    expect(s.ball).toEqual(B)
  })

  it('shot: clears ball holder', () => {
    const s = applyAction({ id: '1', type: 'shot', shooterId: 'o1' }, { positions: P, ball: B })
    expect(s.ball.holderId).toBe('')
    expect(s.positions).toEqual(P)
  })

  it('handoff: moves fromId to meetPosition, transfers ball', () => {
    const s = applyAction({ id: '1', type: 'handoff', fromId: 'o1', toId: 'o2', meetPosition: { x: 0.65, y: 0.6 } }, { positions: P, ball: B })
    expect(s.positions.o1).toEqual({ x: 0.65, y: 0.6 })
    expect(s.ball.holderId).toBe('o2')
  })

  it('does not mutate input state', () => {
    const original = { positions: { ...P, o1: { ...P.o1 } }, ball: { ...B } }
    applyAction({ id: '1', type: 'pass', fromId: 'o1', toId: 'o2' }, original)
    expect(original.ball.holderId).toBe('o1')
  })
})

describe('computeStateAtStep', () => {
  const actions: Action[] = [
    { id: '1', type: 'pass',    fromId: 'o1', toId: 'o2' },
    { id: '2', type: 'dribble', playerId: 'o2', toPosition: { x: 0.5, y: 0.5 } },
    { id: '3', type: 'shot',    shooterId: 'o2' },
  ]

  it('step 0 = initial state', () => {
    const s = computeStateAtStep(actions, 0, P, B)
    expect(s.positions).toEqual(P)
    expect(s.ball).toEqual(B)
  })

  it('step 1: ball moved to o2', () => {
    const s = computeStateAtStep(actions, 1, P, B)
    expect(s.ball.holderId).toBe('o2')
    expect(s.positions.o2).toEqual(P.o2)
  })

  it('step 2: o2 moved, still has ball', () => {
    const s = computeStateAtStep(actions, 2, P, B)
    expect(s.positions.o2).toEqual({ x: 0.5, y: 0.5 })
    expect(s.ball.holderId).toBe('o2')
  })

  it('step 3: ball cleared after shot', () => {
    const s = computeStateAtStep(actions, 3, P, B)
    expect(s.ball.holderId).toBe('')
  })

  it('step beyond actions = final state', () => {
    const s = computeStateAtStep(actions, 99, P, B)
    expect(s.ball.holderId).toBe('')
  })
})
```

- [ ] **Step 2: Run — expect failure**
```bash
npm test
```
Expected: FAIL — "Cannot find module './stateEngine'"

- [ ] **Step 3: Write src/utils/stateEngine.ts**
```ts
import type { Action, PositionMap, BallState } from '../models/types'

export interface GameState {
  positions: PositionMap
  ball: BallState
}

export function applyAction(action: Action, state: GameState): GameState {
  const positions = { ...state.positions }
  let ball = { ...state.ball }

  switch (action.type) {
    case 'pass':
      ball = { holderId: action.toId }
      break
    case 'cut':
      positions[action.playerId] = action.toPosition
      break
    case 'dribble':
      positions[action.playerId] = action.toPosition
      break
    case 'screen':
      positions[action.screenerId] = action.screenPosition
      break
    case 'shot':
      ball = { holderId: '' }
      break
    case 'handoff':
      positions[action.fromId] = action.meetPosition
      ball = { holderId: action.toId }
      break
  }

  return { positions, ball }
}

export function computeStateAtStep(
  actions: Action[],
  step: number,
  initialPositions: PositionMap,
  initialBall: BallState,
): GameState {
  let state: GameState = {
    positions: { ...initialPositions },
    ball: { ...initialBall },
  }
  const limit = Math.min(step, actions.length)
  for (let i = 0; i < limit; i++) {
    state = applyAction(actions[i], state)
  }
  return state
}
```

- [ ] **Step 4: Run — expect pass**
```bash
npm test
```
Expected: all state engine tests PASS

- [ ] **Step 5: Commit**
```bash
git add src/utils/stateEngine.ts src/utils/stateEngine.test.ts
git commit -m "feat: add state engine with full test coverage"
```

---

## Task 2: Extend Zustand Store

**Files:**
- Modify: `src/store/usePlayStore.ts`

- [ ] **Step 1: Replace src/store/usePlayStore.ts with extended version**
```ts
import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type {
  CourtType, Player, PositionMap, BallState,
  PlaySet, Action, ActionType,
} from '../models/types'

interface SetupDraft {
  name: string
  courtType: CourtType
  offenseCount: number
  defenseCount: number
}

interface ActionCreation {
  type: ActionType | null
  pendingSourceId: string | null   // for Cut/Screen/Handoff: waiting for source click
  editingActionId: string | null
}

interface PlayStoreState {
  // ── Setup ─────────────────────────────────────────────────────
  setupDraft: SetupDraft
  setSetupDraft: (draft: Partial<SetupDraft>) => void
  draftPositions: PositionMap
  setDraftPositions: (p: PositionMap) => void
  updateDraftPosition: (id: string, x: number, y: number) => void
  draftBall: BallState | null
  setDraftBall: (b: BallState) => void

  // ── Persistence ───────────────────────────────────────────────
  savedSets: PlaySet[]
  saveSet: (set: PlaySet) => void
  deleteSet: (id: string) => void
  loadSetsFromStorage: () => void

  // ── Editor ────────────────────────────────────────────────────
  activeSet: PlaySet | null
  setActiveSet: (set: PlaySet) => void

  activeStep: number          // 0 = initial state, n = after action[n-1]
  setActiveStep: (step: number) => void

  // ── Action CRUD ───────────────────────────────────────────────
  addAction: (action: Action) => void
  deleteAction: (actionId: string) => void
  updateAction: (actionId: string, updated: Action) => void
  undoLastAction: () => void

  // ── Option text (pause badge) ─────────────────────────────────
  setOptionText: (actionId: string, text: string) => void

  // ── Action creation UI state ──────────────────────────────────
  actionCreation: ActionCreation
  startActionCreation: (type: ActionType) => void
  setPendingSource: (playerId: string) => void
  cancelActionCreation: () => void
}

const EMPTY_CREATION: ActionCreation = {
  type: null, pendingSourceId: null, editingActionId: null
}

function persistSets(sets: PlaySet[]) {
  localStorage.setItem('setplay_sets', JSON.stringify(sets))
}

export const usePlayStore = create<PlayStoreState>((set, get) => ({
  setupDraft: { name: '', courtType: 'half', offenseCount: 5, defenseCount: 0 },
  setSetupDraft: (draft) => set(s => ({ setupDraft: { ...s.setupDraft, ...draft } })),
  draftPositions: {},
  setDraftPositions: (draftPositions) => set({ draftPositions }),
  updateDraftPosition: (id, x, y) => set(s => ({ draftPositions: { ...s.draftPositions, [id]: { x, y } } })),
  draftBall: null,
  setDraftBall: (draftBall) => set({ draftBall }),

  savedSets: [],
  saveSet: (newSet) => {
    set(s => {
      const idx = s.savedSets.findIndex(x => x.id === newSet.id)
      const updated = idx >= 0
        ? s.savedSets.map(x => x.id === newSet.id ? newSet : x)
        : [...s.savedSets, newSet]
      persistSets(updated)
      return { savedSets: updated }
    })
  },
  deleteSet: (id) => {
    set(s => {
      const updated = s.savedSets.filter(x => x.id !== id)
      persistSets(updated)
      return { savedSets: updated }
    })
  },
  loadSetsFromStorage: () => {
    try {
      const raw = localStorage.getItem('setplay_sets')
      if (raw) set({ savedSets: JSON.parse(raw) })
    } catch { /* corrupt storage */ }
  },

  activeSet: null,
  setActiveSet: (activeSet) => set({ activeSet, activeStep: 0 }),

  activeStep: 0,
  setActiveStep: (activeStep) => set({ activeStep }),

  addAction: (action) => {
    set(s => {
      if (!s.activeSet) return s
      const updated = { ...s.activeSet, actions: [...s.activeSet.actions, action] }
      get().saveSet(updated)
      return { activeSet: updated, activeStep: updated.actions.length, actionCreation: EMPTY_CREATION }
    })
  },

  deleteAction: (actionId) => {
    set(s => {
      if (!s.activeSet) return s
      const updated = { ...s.activeSet, actions: s.activeSet.actions.filter(a => a.id !== actionId) }
      const clampedStep = Math.min(s.activeStep, updated.actions.length)
      get().saveSet(updated)
      return { activeSet: updated, activeStep: clampedStep }
    })
  },

  updateAction: (actionId, updatedAction) => {
    set(s => {
      if (!s.activeSet) return s
      const updated = {
        ...s.activeSet,
        actions: s.activeSet.actions.map(a => a.id === actionId ? updatedAction : a),
      }
      get().saveSet(updated)
      return { activeSet: updated, actionCreation: EMPTY_CREATION }
    })
  },

  undoLastAction: () => {
    set(s => {
      if (!s.activeSet || s.activeSet.actions.length === 0) return s
      const updated = { ...s.activeSet, actions: s.activeSet.actions.slice(0, -1) }
      const newStep = Math.min(s.activeStep, updated.actions.length)
      get().saveSet(updated)
      return { activeSet: updated, activeStep: newStep }
    })
  },

  setOptionText: (actionId, text) => {
    set(s => {
      if (!s.activeSet) return s
      const updated = {
        ...s.activeSet,
        actions: s.activeSet.actions.map(a =>
          a.id === actionId ? { ...a, optionText: text.trim() || undefined } : a
        ),
      }
      get().saveSet(updated)
      return { activeSet: updated }
    })
  },

  actionCreation: EMPTY_CREATION,
  startActionCreation: (type) => set({ actionCreation: { type, pendingSourceId: null, editingActionId: null } }),
  setPendingSource: (playerId) => set(s => ({
    actionCreation: { ...s.actionCreation, pendingSourceId: playerId }
  })),
  cancelActionCreation: () => set({ actionCreation: EMPTY_CREATION }),
}))
```

- [ ] **Step 2: Verify nanoid import**

`nanoid` is already imported at the top of `usePlayStore.ts`. No additional changes needed.

- [ ] **Step 3: Run tests**
```bash
npm test
```
Expected: all previous tests still pass

- [ ] **Step 4: Commit**
```bash
git add src/store/usePlayStore.ts
git commit -m "feat: extend store with action CRUD, options, and creation state"
```

---

## Task 3: ActionArrow Component

**Files:**
- Create: `src/components/actions/ActionArrow.tsx`
- Create: `src/utils/arrowGeometry.ts`

- [ ] **Step 1: Write src/utils/arrowGeometry.ts**
```ts
// Generates points for a wavy line (used by Dribble)
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
  const px = -uy   // perpendicular unit vector
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

// Returns the perpendicular bar endpoints for a Screen symbol
export function perpendicularBar(
  x2: number, y2: number,
  x1: number, y1: number,   // direction (from → to)
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
```

- [ ] **Step 2: Write src/components/actions/ActionArrow.tsx**
```tsx
import { Line, Arrow, Circle, Group } from 'react-konva'
import type { Action, Player, PositionMap } from '../../models/types'
import { denormalize, HALF_COURT_W, HALF_COURT_H, FULL_COURT_H } from '../../utils/courtCoords'
import { wavyPoints, perpendicularBar } from '../../utils/arrowGeometry'

interface Props {
  action: Action
  positions: PositionMap   // state BEFORE this action
  players: Player[]
  courtType: 'half' | 'full'
}

const COLORS: Record<string, string> = {
  pass:    '#facc15',  // yellow
  dribble: '#a78bfa',  // violet
  cut:     '#34d399',  // green
  screen:  '#60a5fa',  // blue
  shot:    '#f87171',  // red
  handoff: '#fb923c',  // orange
}

export default function ActionArrow({ action, positions, players: _players, courtType }: Props) {
  const cH = courtType === 'half' ? HALF_COURT_H : FULL_COURT_H
  const color = COLORS[action.type]

  function px(id: string) { return denormalize(positions[id].x, positions[id].y, HALF_COURT_W, cH) }
  function pxPos(pos: { x: number; y: number }) { return denormalize(pos.x, pos.y, HALF_COURT_W, cH) }

  switch (action.type) {
    case 'pass': {
      const from = px(action.fromId)
      const to   = px(action.toId)
      return (
        <Arrow
          points={[from.x, from.y, to.x, to.y]}
          stroke={color} strokeWidth={2.5}
          fill={color}
          dash={[10, 6]}
          pointerLength={10} pointerWidth={8}
        />
      )
    }

    case 'dribble': {
      const from = px(action.playerId)
      const to   = pxPos(action.toPosition)
      const pts  = wavyPoints(from.x, from.y, to.x, to.y)
      return (
        <Group>
          <Line points={pts} stroke={color} strokeWidth={2.5} />
          <Arrow
            points={[pts[pts.length - 4], pts[pts.length - 3], to.x, to.y]}
            stroke={color} fill={color}
            strokeWidth={2.5} pointerLength={10} pointerWidth={8}
          />
        </Group>
      )
    }

    case 'cut': {
      const from = px(action.playerId)
      const to   = pxPos(action.toPosition)
      return (
        <Arrow
          points={[from.x, from.y, to.x, to.y]}
          stroke={color} fill={color}
          strokeWidth={2.5} pointerLength={10} pointerWidth={8}
        />
      )
    }

    case 'screen': {
      const from = px(action.screenerId)
      const to   = pxPos(action.screenPosition)
      const [bx1, by1, bx2, by2] = perpendicularBar(to.x, to.y, from.x, from.y)
      return (
        <Group>
          <Line points={[from.x, from.y, to.x, to.y]} stroke={color} strokeWidth={2.5} />
          <Line points={[bx1, by1, bx2, by2]} stroke={color} strokeWidth={3.5} />
        </Group>
      )
    }

    case 'shot': {
      const from = px(action.shooterId)
      // Shoot toward basket (top center ≈ 0.5, 0.11 normalized)
      const basket = pxPos({ x: 0.5, y: 0.113 })
      const cx = basket.x, cy = basket.y
      return (
        <Group>
          <Arrow
            points={[from.x, from.y, cx, cy]}
            stroke={color} fill={color}
            strokeWidth={2.5} dash={[10, 6]}
            pointerLength={0} pointerWidth={0}
          />
          {/* Crosshair */}
          <Circle x={cx} y={cy} radius={9} stroke={color} strokeWidth={2} fill="transparent" />
          <Line points={[cx - 13, cy, cx + 13, cy]} stroke={color} strokeWidth={2} />
          <Line points={[cx, cy - 13, cx, cy + 13]} stroke={color} strokeWidth={2} />
        </Group>
      )
    }

    case 'handoff': {
      const from = px(action.fromId)
      const meet = pxPos(action.meetPosition)
      // Double-bar at meetPosition
      const [bx1, by1, bx2, by2] = perpendicularBar(meet.x, meet.y, from.x, from.y, 10)
      const dx = meet.x - from.x, dy = meet.y - from.y
      const len = Math.sqrt(dx*dx + dy*dy) || 1
      const ux = dx/len, uy = dy/len
      // Second bar offset slightly along direction
      const off = 6
      return (
        <Group>
          <Arrow
            points={[from.x, from.y, meet.x, meet.y]}
            stroke={color} fill={color}
            strokeWidth={2.5} pointerLength={0} pointerWidth={0}
          />
          <Line points={[bx1, by1, bx2, by2]} stroke={color} strokeWidth={3} />
          <Line points={[bx1 + ux*off, by1 + uy*off, bx2 + ux*off, by2 + uy*off]} stroke={color} strokeWidth={3} />
        </Group>
      )
    }
  }
}
```

- [ ] **Step 3: Commit**
```bash
git add src/utils/arrowGeometry.ts src/components/actions/ActionArrow.tsx
git commit -m "feat: add action arrow components with 6 visual styles"
```

---

## Task 4: ActionOverlay Component

**Files:**
- Create: `src/components/actions/ActionOverlay.tsx`

Renders all arrows for the steps up to and including `activeStep`. Each action is shown in a slightly faded style except the most recently added one.

- [ ] **Step 1: Write src/components/actions/ActionOverlay.tsx**
```tsx
import { Group } from 'react-konva'
import ActionArrow from './ActionArrow'
import { computeStateAtStep } from '../../utils/stateEngine'
import type { Action, Player, PositionMap, BallState, CourtType } from '../../models/types'

interface Props {
  actions: Action[]
  players: Player[]
  initialPositions: PositionMap
  initialBall: BallState
  activeStep: number
  courtType: CourtType
}

export default function ActionOverlay({ actions, players, initialPositions, initialBall, activeStep, courtType }: Props) {
  return (
    <Group>
      {actions.slice(0, activeStep).map((action, i) => {
        const stateBefore = computeStateAtStep(actions, i, initialPositions, initialBall)
        const isLatest = i === activeStep - 1
        return (
          <Group key={action.id} opacity={isLatest ? 1 : 0.45}>
            <ActionArrow
              action={action}
              positions={stateBefore.positions}
              players={players}
              courtType={courtType}
            />
          </Group>
        )
      })}
    </Group>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/actions/ActionOverlay.tsx
git commit -m "feat: add action overlay rendering all arrows up to active step"
```

---

## Task 5: ActionToolbar Component

**Files:**
- Create: `src/components/toolbar/ActionToolbar.tsx`

- [ ] **Step 1: Write src/components/toolbar/ActionToolbar.tsx**
```tsx
import type { ActionType } from '../../models/types'

interface ToolDef {
  type: ActionType
  label: string
  icon: string
  requiresBall: boolean
}

const TOOLS: ToolDef[] = [
  { type: 'pass',    label: 'Pas',     icon: '- - →',   requiresBall: true  },
  { type: 'dribble', label: 'Dribble', icon: '∿→',      requiresBall: true  },
  { type: 'cut',     label: 'Kesme',   icon: '→',        requiresBall: false },
  { type: 'screen',  label: 'Ekran',   icon: '—⊣',      requiresBall: false },
  { type: 'shot',    label: 'Şut',     icon: '---⊕',     requiresBall: true  },
  { type: 'handoff', label: 'Handoff', icon: '—╋╋',     requiresBall: true  },
]

interface Props {
  activeType: ActionType | null
  ballHolderId: string
  onSelect: (type: ActionType) => void
  onCancel: () => void
}

export default function ActionToolbar({ activeType, ballHolderId, onSelect, onCancel }: Props) {
  return (
    <div className="flex flex-col gap-2 p-2 bg-slate-800 rounded-xl border border-slate-700">
      {TOOLS.map(t => {
        const disabled = t.requiresBall && !ballHolderId
        const active = activeType === t.type
        return (
          <button
            key={t.type}
            title={t.label}
            disabled={disabled}
            onClick={() => active ? onCancel() : onSelect(t.type)}
            className={`
              flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors
              ${active ? 'bg-orange-500 text-white' : ''}
              ${!active && !disabled ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : ''}
              ${disabled ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-500' : ''}
            `}
          >
            <span className="font-mono text-base leading-none">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/toolbar/ActionToolbar.tsx
git commit -m "feat: add action toolbar with 6 action type buttons"
```

---

## Task 6: ActionPanel + ActionCard + OptionBadge

**Files:**
- Create: `src/components/actions/OptionBadge.tsx`
- Create: `src/components/actions/ActionCard.tsx`
- Create: `src/components/actions/ActionPanel.tsx`

- [ ] **Step 1: Write src/components/actions/OptionBadge.tsx**

Inline add/edit UI for `action.optionText`. Used inside ActionCard (expanded state).

```tsx
import { useState } from 'react'

interface Props {
  text: string | undefined
  onChange: (text: string) => void
}

export default function OptionBadge({ text, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(text ?? '')

  if (!editing && !text) {
    return (
      <button
        onClick={() => { setDraft(''); setEditing(true) }}
        className="text-xs text-orange-500 hover:text-orange-400 mt-1.5 flex items-center gap-1 transition-colors"
      >
        <span>◈</span> Option ekle
      </button>
    )
  }

  if (!editing) {
    return (
      <div className="mt-1.5 flex items-start gap-1.5">
        <div
          onClick={() => { setDraft(text ?? ''); setEditing(true) }}
          className="flex-1 text-xs text-orange-300 bg-orange-950/40 border border-orange-800/40 rounded px-2 py-1 cursor-pointer hover:bg-orange-950/60 transition-colors"
        >
          <span className="opacity-60 mr-1">◈</span>{text}
        </div>
        <button
          onClick={() => onChange('')}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors"
        >✕</button>
      </div>
    )
  }

  return (
    <div className="mt-1.5 flex gap-1">
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { onChange(draft); setEditing(false) }
          if (e.key === 'Escape') setEditing(false)
        }}
        placeholder="örn. Boşsan şut at — Enter ile kaydet"
        className="flex-1 text-xs bg-slate-700 text-white rounded px-2 py-1 outline-none focus:ring-1 focus:ring-orange-500 placeholder-slate-500"
      />
      <button
        onClick={() => { onChange(draft); setEditing(false) }}
        className="text-xs bg-orange-600 hover:bg-orange-500 text-white rounded px-2 transition-colors"
      >✓</button>
      <button
        onClick={() => setEditing(false)}
        className="text-xs text-slate-400 hover:text-white transition-colors"
      >✕</button>
    </div>
  )
}
```

- [ ] **Step 2: Write src/components/actions/ActionCard.tsx**
```tsx
import { useState } from 'react'
import OptionBadge from './OptionBadge'
import type { Action } from '../../models/types'

const ACTION_LABELS: Record<string, string> = {
  pass: 'Pas', dribble: 'Dribble', cut: 'Kesme',
  screen: 'Ekran', shot: 'Şut', handoff: 'Handoff',
}
const ACTION_COLORS: Record<string, string> = {
  pass: 'border-yellow-500', dribble: 'border-violet-500',
  cut: 'border-green-500', screen: 'border-blue-500',
  shot: 'border-red-500', handoff: 'border-orange-500',
}

interface Props {
  index: number
  action: Action
  isActive: boolean
  onClick: () => void
  onDelete: () => void
  onEdit: () => void
  onOptionTextChange: (text: string) => void
}

export default function ActionCard({
  index, action, isActive,
  onClick, onDelete, onEdit, onOptionTextChange,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div
      className={`
        rounded-lg border-l-4 cursor-pointer transition-colors
        ${ACTION_COLORS[action.type]}
        ${isActive ? 'bg-slate-600' : 'bg-slate-700/60 hover:bg-slate-700'}
      `}
      onClick={onClick}
    >
      {/* Header row — always visible */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-medium text-white">
          <span className="text-slate-400 text-xs mr-2">{index + 1}.</span>
          {ACTION_LABELS[action.type]}
        </span>

        {!confirmDelete ? (
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <button onClick={onEdit} title="Düzenle"
              className="text-slate-400 hover:text-white text-sm px-1 transition-colors">✏️</button>
            <button onClick={() => setConfirmDelete(true)} title="Sil"
              className="text-slate-400 hover:text-red-400 text-sm px-1 transition-colors">✕</button>
          </div>
        ) : (
          <div className="flex gap-1 items-center" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-red-300">Emin misin?</span>
            <button onClick={onDelete}
              className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-0.5 rounded transition-colors">Evet</button>
            <button onClick={() => setConfirmDelete(false)}
              className="text-xs text-slate-400 hover:text-white transition-colors">Hayır</button>
          </div>
        )}
      </div>

      {/* Expanded section — option badge, only when card is active */}
      {isActive && (
        <div className="px-3 pb-2 border-t border-slate-600/50" onClick={e => e.stopPropagation()}>
          <OptionBadge
            text={action.optionText}
            onChange={onOptionTextChange}
          />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Write src/components/actions/ActionPanel.tsx**
```tsx
import ActionCard from './ActionCard'
import { usePlayStore } from '../../store/usePlayStore'

export default function ActionPanel() {
  const {
    activeSet, activeStep,
    setActiveStep, deleteAction, startActionCreation, setOptionText,
  } = usePlayStore()

  if (!activeSet) return null

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700">
      <div className="p-3 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300">
          Aksiyonlar <span className="text-slate-500">({activeSet.actions.length})</span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeSet.actions.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">
            Aksiyon eklemek için sol araç çubuğundan bir tip seç
          </p>
        )}

        {activeSet.actions.map((action, i) => (
          <ActionCard
            key={action.id}
            index={i}
            action={action}
            isActive={activeStep === i + 1}
            onClick={() => setActiveStep(i + 1)}
            onDelete={() => deleteAction(action.id)}
            onEdit={() => startActionCreation(action.type)}
            onOptionTextChange={(text) => setOptionText(action.id, text)}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**
```bash
git add src/components/actions/OptionBadge.tsx src/components/actions/ActionCard.tsx src/components/actions/ActionPanel.tsx
git commit -m "feat: add action panel with cards, delete confirmation, and option badges"
```

---

## Task 7: ~~OptionTabs~~ — Not Needed

> **The Option system was simplified.** `PlaySet` now has a single `actions: Action[]` sequence. Each action optionally carries `optionText?: string`. The `OptionTabs` component and the multi-option concept are not implemented. Skip this task entirely.
>
> The `src/components/options/` directory is not created.

- [ ] **Step 1: Verify no OptionTabs references exist**
```bash
grep -r "OptionTabs\|activeOptionId\|addOption\|deleteOption" src/ || echo "clean"
```
Expected: `clean` (no matches)

- [ ] **Step 2: Commit (nothing to add — just a checkpoint)**
```bash
git commit --allow-empty -m "chore: confirm OptionTabs not implemented (simplified option model)"
```

---

## Task 8: PlaybackControls Stub

**Files:**
- Create: `src/components/playback/PlaybackControls.tsx`

Step-through only (no animation yet — Plan 3 adds Konva.Tween).

- [ ] **Step 1: Write src/components/playback/PlaybackControls.tsx**
```tsx
import { usePlayStore } from '../../store/usePlayStore'

export default function PlaybackControls() {
  const { activeSet, activeStep, setActiveStep, undoLastAction } = usePlayStore()

  const total = activeSet?.actions.length ?? 0

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800 border-t border-slate-700">
      <button
        onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
        disabled={activeStep === 0}
        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-30 transition-colors"
      >◀</button>

      <span className="text-sm text-slate-400 min-w-[80px] text-center">
        {activeStep} / {total}
      </span>

      <button
        onClick={() => setActiveStep(Math.min(total, activeStep + 1))}
        disabled={activeStep === total}
        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-30 transition-colors"
      >▶</button>

      <div className="flex-1" />

      <button
        onClick={undoLastAction}
        disabled={total === 0}
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
git commit -m "feat: add playback controls stub with step navigation"
```

---

## Task 9: EditorPage — Full Implementation

**Files:**
- Modify: `src/pages/EditorPage.tsx`

- [ ] **Step 1: Write full src/pages/EditorPage.tsx**
```tsx
import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { nanoid } from 'nanoid'
import type Konva from 'konva'
import CourtCanvas from '../components/court/CourtCanvas'
import PlayerNode from '../components/players/PlayerNode'
import ActionOverlay from '../components/actions/ActionOverlay'
import ActionToolbar from '../components/toolbar/ActionToolbar'
import ActionPanel from '../components/actions/ActionPanel'
import PlaybackControls from '../components/playback/PlaybackControls'
import { usePlayStore } from '../store/usePlayStore'
import { computeStateAtStep } from '../utils/stateEngine'
import type { Action, NormalizedPosition } from '../models/types'
import { HALF_COURT_W, HALF_COURT_H, FULL_COURT_H } from '../utils/courtCoords'

export default function EditorPage() {
  const { setId } = useParams<{ setId: string }>()
  const navigate = useNavigate()
  const {
    savedSets, activeSet, setActiveSet,
    activeStep,
    actionCreation, startActionCreation, setPendingSource, cancelActionCreation,
    addAction,
  } = usePlayStore()

  // Load set from storage on mount
  useEffect(() => {
    const found = savedSets.find(s => s.id === setId)
    if (found) { setActiveSet(found) }
    else { usePlayStore.getState().loadSetsFromStorage() }
  }, [setId, savedSets, setActiveSet])

  // Ctrl+Z undo
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        usePlayStore.getState().undoLastAction()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!activeSet) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <p>Set yükleniyor...</p>
      </div>
    )
  }

  const currentState = computeStateAtStep(
    activeSet.actions, activeStep, activeSet.initialPositions, activeSet.initialBall
  )
  const cH = activeSet.courtType === 'half' ? HALF_COURT_H : FULL_COURT_H

  // Handle clicks on court (for position targets in Cut/Screen/Dribble/Handoff)
  function handleCourtClick(e: Konva.KonvaEventObject<MouseEvent>) {
    const { type, pendingSourceId } = actionCreation
    if (!type) return

    const pos = e.target.getStage()?.getPointerPosition()
    if (!pos) return
    const nx = pos.x / HALF_COURT_W
    const ny = pos.y / cH
    const normPos: NormalizedPosition = { x: nx, y: ny }

    if (type === 'shot') {
      const action: Action = { id: nanoid(), type: 'shot', shooterId: currentState.ball.holderId }
      addAction(action)
      return
    }

    if (type === 'dribble') {
      const action: Action = { id: nanoid(), type: 'dribble', playerId: currentState.ball.holderId, toPosition: normPos }
      addAction(action)
      return
    }

    if (type === 'cut' && pendingSourceId) {
      const action: Action = { id: nanoid(), type: 'cut', playerId: pendingSourceId, toPosition: normPos }
      addAction(action)
      return
    }

    if (type === 'screen' && pendingSourceId) {
      const action: Action = { id: nanoid(), type: 'screen', screenerId: pendingSourceId, screenPosition: normPos }
      addAction(action)
      return
    }

    if (type === 'handoff' && pendingSourceId) {
      const action: Action = { id: nanoid(), type: 'handoff', fromId: currentState.ball.holderId, toId: pendingSourceId, meetPosition: normPos }
      addAction(action)
      return
    }
  }

  // Handle click on a player circle
  function handlePlayerClick(playerId: string) {
    const { type, pendingSourceId } = actionCreation
    if (!type) return

    if (type === 'pass') {
      if (playerId === currentState.ball.holderId) return  // can't pass to self
      const action: Action = { id: nanoid(), type: 'pass', fromId: currentState.ball.holderId, toId: playerId }
      addAction(action)
      return
    }

    if (type === 'cut' && !pendingSourceId) {
      setPendingSource(playerId)
      return
    }

    if (type === 'screen' && !pendingSourceId) {
      setPendingSource(playerId)
      return
    }

    if (type === 'handoff' && !pendingSourceId) {
      if (playerId === currentState.ball.holderId) return  // can't handoff to self
      setPendingSource(playerId)  // pendingSourceId = the receiver
      return
    }
  }

  const instructionText = (() => {
    const { type, pendingSourceId } = actionCreation
    if (!type) return null
    if (type === 'pass') return 'Topu alacak oyuncuya tıkla'
    if (type === 'dribble') return 'Kortta hedefe tıkla'
    if (type === 'shot') return 'Şut için kortta herhangi yere tıkla'
    if (type === 'cut') return pendingSourceId ? 'Kortta hedefe tıkla' : 'Keseceği oyuncuya tıkla'
    if (type === 'screen') return pendingSourceId ? 'Ekran kurulacak yere tıkla' : 'Ekran kuracak oyuncuya tıkla'
    if (type === 'handoff') return pendingSourceId ? 'Handoff noktasına tıkla' : 'Topu alacak oyuncuya tıkla'
    return null
  })()

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white transition-colors text-sm">← Ana Sayfa</button>
          <span className="text-white font-semibold">{activeSet.name}</span>
        </div>
        <span className="text-slate-400 text-sm">
          {activeSet.courtType === 'half' ? 'Yarım Kort' : 'Tam Kort'}
        </span>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left toolbar */}
        <div className="p-2 border-r border-slate-700">
          <ActionToolbar
            activeType={actionCreation.type}
            ballHolderId={currentState.ball.holderId}
            onSelect={startActionCreation}
            onCancel={cancelActionCreation}
          />
        </div>

        {/* Court */}
        <div className="flex-1 flex items-center justify-center bg-slate-950 overflow-auto p-4">
          <div className="relative">
            {instructionText && (
              <div className="absolute -top-10 left-0 right-0 text-center text-sm text-orange-300 font-medium">
                {instructionText}
                <button onClick={cancelActionCreation} className="ml-3 text-slate-400 hover:text-white text-xs underline">İptal</button>
              </div>
            )}
            <CourtCanvas courtType={activeSet.courtType} onStageClick={handleCourtClick}>
              {/* Action arrows layer */}
              <ActionOverlay
                actions={activeSet.actions}
                players={activeSet.players}
                initialPositions={activeSet.initialPositions}
                initialBall={activeSet.initialBall}
                activeStep={activeStep}
                courtType={activeSet.courtType}
              />
              {/* Players */}
              {activeSet.players.map(player => {
                const pos = currentState.positions[player.id] ?? { x: 0.5, y: 0.5 }
                return (
                  <PlayerNode
                    key={player.id}
                    player={player}
                    position={pos}
                    courtType={activeSet.courtType}
                    hasBall={currentState.ball.holderId === player.id}
                    isSelected={actionCreation.pendingSourceId === player.id}
                    onDragEnd={() => {}}
                    onClick={handlePlayerClick}
                  />
                )
              })}
            </CourtCanvas>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-64 flex flex-col border-l border-slate-700">
          <ActionPanel />
        </div>
      </div>

      {/* Bottom playback */}
      <PlaybackControls />
    </div>
  )
}
```

- [ ] **Step 2: Update CourtCanvas to accept onStageClick prop**

Modify `src/components/court/CourtCanvas.tsx` to accept an optional click handler:
```tsx
import { Stage, Layer } from 'react-konva'
import type { CourtType } from '../../models/types'
import type Konva from 'konva'
import HalfCourt from './HalfCourt'
import FullCourt from './FullCourt'
import { HALF_COURT_W, HALF_COURT_H, FULL_COURT_H } from '../../utils/courtCoords'

interface Props {
  courtType: CourtType
  children?: React.ReactNode
  onStageClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void
}

export default function CourtCanvas({ courtType, children, onStageClick }: Props) {
  const height = courtType === 'half' ? HALF_COURT_H : FULL_COURT_H
  return (
    <Stage width={HALF_COURT_W} height={height} onClick={onStageClick}>
      <Layer>
        {courtType === 'half' ? <HalfCourt /> : <FullCourt />}
      </Layer>
      <Layer>
        {children}
      </Layer>
    </Stage>
  )
}
```

- [ ] **Step 3: Verify full editor flow**
```bash
npm run dev
```
Test path:
1. Create a set → goes to editor
2. Select "Pas" in toolbar → instruction appears → click a player → pass arrow drawn, ball transfers
3. Select "Dribble" → click court position → wavy arrow appears, player moved
4. Select "Kesme" → click source player → click court position → arrow drawn
5. Select "Ekran" → click screener → click position → screen symbol (⊣) drawn
6. Select "Şut" → click anywhere → crosshair appears, ball cleared
7. Action list shows all 5 actions with correct labels
8. Click an action card → kort shows state at that step, OptionBadge "◈ Option ekle" appears
9. Click "◈ Option ekle" → type text → Enter → orange badge appears on card
10. Click ✕ on an action → confirm dialog → click Evet → action removed
11. Press ← / → in playback controls to step through
12. Press Ctrl+Z → last action removed

- [ ] **Step 4: Commit**
```bash
git add src/pages/EditorPage.tsx src/components/court/CourtCanvas.tsx
git commit -m "feat: complete editor page with action creation, arrows, and panel"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All 6 action types implemented. Action panel with ✏️ and ✕. Delete confirmation. Ctrl+Z undo. `optionText` badge on each action card. Ball constraint on toolbar. No OptionTabs (simplified model).
- [x] **Placeholder scan:** No TBD/TODO. All components have real implementations.
- [x] **Type consistency:** `applyAction` / `computeStateAtStep` parameter types match `GameState`, `PositionMap`, `BallState` from types.ts. `ActionArrow` and `ActionOverlay` use same `Action[]` type. `ActionOverlay` receives `actions: Action[]` (not `option: PlayOption`).
- [x] **Edit flow note:** Clicking ✏️ currently calls `startActionCreation(action.type)` which starts a new creation flow appending to end. Full in-place edit (`updateAction`) is wired in the store but the UI for replacing a specific action mid-list is deferred to a polish pass — it requires knowing which action index to replace. The current behavior is a known simplification.
