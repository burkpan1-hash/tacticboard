# SetPlay — Basketball Tactical Board
## Design Spec (güncel: 2026-05-27)

**App name:** SetPlay  
**Tagline:** Create. Animate. Share your plays.

---

## Context

A basketball tactical board built from scratch. Competing tools (thehoopsgeek etc.) are overly complex — the main differentiator here is **ease of use**. Target audience: coaches, content creators, analysts, fans.

Working directory: `/Users/burakbozkurt/Desktop/basketball board tactics`

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Canvas | react-konva (Konva.js) |
| State | Zustand |
| Styling | Tailwind CSS v4 |
| Export | PNG (Konva `toDataURL`), GIF (gif.js), Video (MediaRecorder) |
| Storage | localStorage |
| Dev env | Docker (`setplay.sh start/stop`) or plain `npm run dev` |

---

## Player Structure

- Offense: numbers 1–5, **orange** (`#F97316`)
- Defense: numbers 1–5, **dark blue** (`#1D4ED8`)
- Setup asks: how many offense (1–5) / how many defense (0–5)
- **Bench**: players not yet on court appear as dashed circles in a sidebar column; drag onto court to add

---

## Court

| Constant | Value | Notes |
|---|---|---|
| `COURT_SCALE` | `1.4` | All pixel values scaled by this factor |
| `HALF_COURT_W` | `700` | 500 × 1.4 |
| `HALF_COURT_H` | `658` | 470 × 1.4 |
| `FULL_COURT_H` | `1316` | 940 × 1.4 |
| `COURT_PADDING_X` | `42` | 30 × 1.4 — Stage wider than court |

- **Coordinate system**: normalized `{x: 0–1, y: 0–1}` — y=0 = basket end (top), y=1 = mid-court (bottom) for half court
- **Full court**: landscape display (rotated −90°), uses `FULL_COURT_H` for y normalization
- **`COURT_PADDING_X`**: Stage wider than court; court lines + players inside `Group x={42}`. Click normalization: `nx = (pos.x - COURT_PADDING_X) / HALF_COURT_W`

### Court Lines

- Three-point arc: center (350, 74), r=333, `angle=136°` (1.4× scale)
- Corner lines: x=42 / x=658, y=0 to y=202
- **Post marks**: 15px horizontal lines at y=100 and y=135 on both sides of key (scaled)
- **Post boxes**: 15×20px rectangles outside key at restricted-arc level
- All lines present in both `HalfCourt` and `FullCourt`

### Half-court basket position (normalized)

```
basket_x = 350 / 700 = 0.5
basket_y =  42 / 658 ≈ 0.0638
```

### Full-court attack direction

- `attackBasket: 'top' | 'bottom'` — stored in `PlaySet`, only relevant for full court
- `'top'` = offense attacks toward y=0 (small y); attack basket normalized y ≈ 42/1316 ≈ 0.032
- `'bottom'` = offense attacks toward y=1; attack basket normalized y ≈ 1 − 42/1316 ≈ 0.968
- **Flip**: `flipAttackBasket()` in store toggles top↔bottom, mirrors all `initialPositions` and all action target/waypoint coordinates (y = 1−y)
- **ATK arrow bar**: always visible in editor for full-court plays — orange arrow spanning full width above canvas, Flip button below it

---

## Formations

### Offense (6 — half-court only)

| ID | Name |
|---|---|
| `five-out` | 5-Out |
| `four-out-one-in` | 4-Out 1-In |
| `one-four-high` | 1-4 High |
| `horns` | Horns |
| `high-post` | High Post |
| `double-post` | Double Post |

### Defense (8)

| ID | Name | Court restriction | Notes |
|---|---|---|---|
| `man-to-man` | Man-to-Man | None | If offense is placed, defenders auto-position near matched offensive player |
| `two-three-zone` | 2-3 Zone | Half only | — |
| `three-two-zone` | 3-2 Zone | Half only | — |
| `one-three-one` | 1-3-1 Zone | Half only | — |
| `two-one-two-zone` | 2-1-2 Zone | Half only | — |
| `one-two-two-zone` | 1-2-2 Zone | Half only | — |
| `full-court-press` | Full Court Press | None | — |
| `half-court-trap` | Half Court Trap | None | — |

> `FormationPreset.courtOnly?: 'half' | 'full'` — if set, only shown for that court type.

---

## Action Types (9)

All action labels are in **English**. Source of truth: `src/utils/actionColors.ts`.

| Type | Who | Line style | End symbol | Color |
|---|---|---|---|---|
| `pass` | Ball holder | Dashed `- - -` | Arrowhead | amber `#fbbf24` |
| `dribble` | Ball holder | Wavy `∿` (or drawn path via waypoints) | Arrowhead | indigo `#818cf8` |
| `cut` | Any offense | Solid (or drawn path via waypoints) | Arrowhead | pink `#f472b6` |
| `screen` | Any offense | Solid | Thick perpendicular bar | sky `#38bdf8` |
| `shot` | Ball holder | Dashed arc → basket | Crosshair circle | coral `#f87171` |
| `handoff` | Ball holder | Solid | Double bars at meet point | orange `#fb923c` |
| `defense-move` | Any defense | Solid | Arrowhead | blue `#60a5fa` |
| `double-team` | 2 defenders | Two arrows → trap positions | Arrowhead | purple `#7c3aed` |
| `ball-force` | Defender | Curved line | Arrowhead | magenta `#d946ef` |

**Waypoints**: `dribble` and `cut` support an optional `waypoints: NormalizedPosition[]` array for drawn paths. Enabled both via drag on court (tool mode) and via player drag auto-action.

**Screen bar**: `halfLen=22`, `strokeWidth=6`, `strokeLinecap=round`.

### Double-team positioning logic (`computeDoubleTeamPositions`)

Exported from `stateEngine.ts`. Accepts `basketY` (normalized y of the attack basket) for correct direction on full court.

- **Near sideline** (`x < 0.15` or `x > 0.85`): one defender from interior (lateral), one from baseline (toward basket)
- **Open court**: one defender directly between target and basket, one lateral with basket-side offset
- Both defenders assigned to the position they're closest to

**Arrow rendering**: arrows go FROM each defender TO their computed trap position (not to the target). One arrow visually shows the baseline trap, one shows the lateral trap.

---

## Data Model (`src/models/types.ts`)

```typescript
type CourtType = 'half' | 'full'
type Team = 'offense' | 'defense'
type ActionType =
  | 'pass' | 'cut' | 'dribble' | 'screen' | 'shot'
  | 'handoff' | 'defense-move' | 'double-team' | 'ball-force'

interface NormalizedPosition { x: number; y: number }
type PositionMap = Record<string, NormalizedPosition>

interface Player {
  id: string           // 'o1'–'o5' offense, 'd1'–'d5' defense
  number: 1 | 2 | 3 | 4 | 5
  team: Team
}

interface BallState { holderId: string }

interface PassAction        { id: string; type: 'pass';        fromId: string; toId: string; optionText?: string }
interface CutAction         { id: string; type: 'cut';         playerId: string; toPosition: NormalizedPosition; waypoints?: NormalizedPosition[]; optionText?: string }
interface DribbleAction     { id: string; type: 'dribble';     playerId: string; toPosition: NormalizedPosition; waypoints?: NormalizedPosition[]; optionText?: string }
interface ScreenAction      { id: string; type: 'screen';      screenerId: string; screenPosition: NormalizedPosition; optionText?: string }
interface ShotAction        { id: string; type: 'shot';        shooterId: string; optionText?: string }
interface HandoffAction     { id: string; type: 'handoff';     fromId: string; toId: string; meetPosition: NormalizedPosition; optionText?: string }
interface DefenseMoveAction { id: string; type: 'defense-move'; playerId: string; toPosition: NormalizedPosition; optionText?: string }
interface DoubleTeamAction  { id: string; type: 'double-team'; defender1Id: string; defender2Id: string; targetId: string; optionText?: string }
interface BallForceAction   { id: string; type: 'ball-force';  defenderId: string; forcePosition: NormalizedPosition; optionText?: string }

type Action =
  | PassAction | CutAction | DribbleAction | ScreenAction | ShotAction
  | HandoffAction | DefenseMoveAction | DoubleTeamAction | BallForceAction

interface PlaySet {
  id: string
  name: string
  courtType: CourtType
  attackBasket?: 'top' | 'bottom'      // full court only; undefined → half court
  players: Player[]
  initialPositions: PositionMap
  initialBall: BallState
  actions: Action[]                    // event sourcing — replayed in order to compute any state
  markings?: Record<string, string>    // defenderId → offensePlayerId (man-to-man assignment)
}
```

---

## User Flow

### Phase 1 — Create New Play ✅
- Name the play
- Choose court type: Half / Full
- Choose offense (1–5) + defense (0–5) count

### Phase 2 — Starting Formation ✅
- Pick formation (filtered by court type) for offense and/or defense
- **Full court**: Flip button sets `attackBasket` and mirrors all positions (y = 1−y)
- Fine-tune with drag-and-drop
- Assign ball to an offense player → "Ready ✓"

### Phase 3 — Add Actions ✅
- Select action type from toolbar (left side); ATK / DEF tabs
- 2-click flow: source → destination (or 1-click for Pass/Dribble/Shot)
- **Dribble / Cut**: hold mouse down and drag on court to draw a curved path (waypoints captured every 15px)
- **Ghost preview**: while hovering with action selected, a colored ghost arrow follows cursor
- Action added → `activeStep` jumps to new action index
- **Instruction bar**: context text above canvas (e.g. "Click second defender to trap")
- **Cancel**: Escape key or "Cancel" link in instruction bar

### Phase 4 — Action Management ✅
- ✕ delete with confirmation
- **Clear All** in panel header (with confirmation)
- Ctrl+Z / Cmd+Z undo
- Click any action card → court shows state at that step
- **Action labels**: each card shows type + player description
- **Step label** (`optionText`): optional badge text per action; inline edit on card

### Phase 5 — Player Drag in Editor ✅
- **Step 0 or player has no actions**: drag updates `initialPositions`
- **Step > 0, player has recorded actions, no action in progress**: drag auto-inserts:
  - Ball holder → `dribble` (with waypoints if path was drawn)
  - Other offense → `cut` (with waypoints)
  - Defense → `defense-move`
- **Action creation in progress**: drag sets a `positionOverride` (visual only, not saved)
- `positionOverrides` cleared on every `activeStep` change
- Past arrows are immutable — only future actions use the dragged position

### Phase 6 — Full Court Direction ✅
- ATK arrow bar always visible above canvas for full court plays
- Orange arrow with "ATK" label showing which direction offense is attacking
- Flip button toggles `attackBasket` top↔bottom, mirrors all positions and action coordinates

### Phase 7 — Animation & Playback ✅
- ▶ Play → sequence animates via RAF + lerp (60 fps), `STEP_MS = 1600`
- ⏸ Pause / ◀ ▶ step navigation
- Speed: 0.5× / 1× / 1.5× / 2×
- Dribble/cut with waypoints: arc-length parameterized interpolation for uniform speed
- Pass: growing arrow animation during playback
- Auto-stops at last action

### Phase 8 — Export ✅
- Export button in PlaybackControls → opens `ExportModal`
- PNG: `stage.toDataURL()` snapshot of current view
- GIF: frame capture via gif.js, renders all steps
- Video: MediaRecorder captures canvas during RAF playback

### Phase 9 — Bench & Markings ✅
- **Bench column**: players not on court appear as draggable dashed circles; drag onto canvas to add
- **Markings toggle**: button in toolbar activates man-to-man coverage lines (defender → assigned offensive player)

---

## Zustand Store (`src/store/usePlayStore.ts`)

Key behavior notes:
- `setActiveSet(newSet)`: resets `activeStep` to 0 **only** when switching to a different set
- `addAction(action)`: sets `activeStep` to new `actions.length`
- `clearAllActions()`: resets actions and step to 0
- `deleteAction(id)`: clamps step to new length
- `undoLastAction()`: removes last action, clamps step
- `updateInitialPosition(playerId, pos)`: updates stored `initialPositions` (used by player drag at step 0)
- `addPlayerToCourt(playerId, position)`: moves a bench player onto court with given position
- `updateMarkings(markings)`: saves man-to-man assignments
- `flipAttackBasket()`: full-court only — toggles top↔bottom, mirrors all positions and action waypoints/targets
- `setOptionText(actionId, text)`: updates optional step label
- **Playback state** (`isPlaying`, `playbackSpeed`): RAF loop reads via `usePlayStore.getState()` to avoid stale closure

---

## State Engine (`src/utils/stateEngine.ts`)

Pure functions, no side effects.

```typescript
applyAction(action, state, markings?, basketY?) → GameState
computeStateAtStep(actions, step, initialPositions, initialBall, markings?, basketY?) → GameState
computeDoubleTeamPositions(d1Id, d2Id, targetId, positions, basketY?) → { p1, p2 } | null
```

- `basketY` defaults to `42/658` (half-court basket normalized y). Must be passed correctly for full court: `42/1316` (top basket) or `1 − 42/1316` (bottom basket).
- `computeDoubleTeamPositions` is exported and used by both `applyAction` and `ActionArrow` so positioning logic is shared.

### `applyAction` effects by type

| Action | Position change | Ball change |
|---|---|---|
| `pass` | — | holderId = toId |
| `cut` | player → toPosition | — |
| `dribble` | player → toPosition | — |
| `screen` | screener → screenPosition | — |
| `shot` | — | holderId = '' |
| `handoff` | fromId overshoots meetPosition by 0.09; toId = meetPosition | holderId = toId |
| `defense-move` | player → toPosition | — |
| `double-team` | d1 → p1, d2 → p2 (via `computeDoubleTeamPositions`) | — |
| `ball-force` | defender → forcePosition | — |
| (markings) | each defender moves to `OFFSET=0.12` toward basket from assigned player | — |

---

## Folder Structure

```
src/
  models/
    types.ts                  ✅  ActionType union (9 types), PlaySet with attackBasket
  store/
    usePlayStore.ts           ✅  full CRUD + flipAttackBasket, updateInitialPosition, addPlayerToCourt
  utils/
    stateEngine.ts            ✅  applyAction, computeStateAtStep, computeDoubleTeamPositions (exported)
    stateEngine.test.ts       ✅  state engine tests
    formations.ts             ✅  6 offense + 8 defense formations
    courtCoords.ts            ✅  COURT_SCALE=1.4, normalize/denormalize, HALF_COURT constants
    arrowGeometry.ts          ✅  wavyPoints, wavyAlongPath, perpendicularBar
    actionColors.ts           ✅  ACTION_COLORS + ACTION_LABELS for 9 action types
  components/
    court/
      CourtCanvas.tsx         ✅  Stage + Layer, landscape mode, event handlers
      HalfCourt.tsx           ✅  1.4× scaled court lines
      FullCourt.tsx           ✅  two half-courts stacked, attackBasket rotation
    players/
      PlayerNode.tsx          ✅  onDragStart/onDragMove/onDragEnd + landscape rotation fix
    actions/
      ActionArrow.tsx         ✅  9 visual styles; double-team arrows go to trap positions; basketY prop
      ActionOverlay.tsx       ✅  renders arrows up to activeStep; passes attackBasket → basketY
      ActionPreview.tsx       ✅  ghost cursor preview; dribble/cut waypoint paths
      ActionPanel.tsx         ✅  right panel: action list + Clear All
      ActionCard.tsx          ✅  delete confirm, player description, optionText badge
      OptionBadge.tsx         ✅  inline add/edit for step label
    toolbar/
      ActionToolbar.tsx       ✅  ATK/DEF tabs; 7 offense tools + 3 defense tools; markings toggle
    setup/
      PlayerSetup.tsx         ✅
      FormationPicker.tsx     ✅  filtered by courtType
    playback/
      PlaybackControls.tsx    ✅  ◀ ▶ play/pause, speed, Undo, Export button
    export/
      ExportModal.tsx         ✅  PNG / GIF / Video export
  pages/
    HomePage.tsx              ✅
    EditorPage.tsx            ✅  full editor; positionOverrides, player-drag auto-action, ATK bar
    SetupPage.tsx             ✅  Flip button in formation + ball steps (full court only)
  App.tsx                     ✅
  main.tsx                    ✅
setplay.sh                    ✅  Docker/npm start+stop
Dockerfile                    ✅
docker-compose.yml            ✅
```

---

## Dev Environment

```bash
./setplay.sh start   # Docker if available, otherwise npm dev
./setplay.sh stop    # Stop all
```

App: `http://localhost:5173`

---

## Phase Status

| Phase | Content | Status |
|---|---|---|
| Plan 1 | Scaffold, court canvas (1.4× scale), setup flow, 6+8 formations | ✅ |
| Plan 2 | State engine, 7 action types, editor, markings | ✅ |
| Plan 3 | Animation (RAF + lerp), speed control, play/pause, export modal | ✅ |
| Post-plan | Double-team + ball-force actions | ✅ |
| Post-plan | Full-court attack direction (ATK bar, flip, basket-aware positioning) | ✅ |
| Post-plan | Player drag auto-action (dribble/cut/defense-move with waypoints) | ✅ |
| Post-plan | Bench drag-onto-court, positionOverrides for past-arrow immutability | ✅ |

---

## Key Design Decisions

### Past arrows are immutable
When a player is dragged in the editor after step 0, past arrows must not move. Solution: `positionOverrides` is local React state (not in Zustand) — used only for rendering and `ActionPreview`. The state engine (used for arrow computation) always reads from `initialPositions` + applied actions. Overrides are cleared on every `activeStep` change.

### Player drag at step > 0 inserts an action
If the dragged player has any recorded actions, the drag auto-creates a move action (dribble/cut/defense-move). If the player has zero actions, `initialPositions` is updated instead (safe for repositioning before any play is recorded). The drag path is captured as waypoints (15px sampling).

### basketY threading
`computeStateAtStep`, `applyAction`, and `computeDoubleTeamPositions` all accept an optional `basketY` parameter. This is computed once in `EditorPage` from `courtType` + `attackBasket` and threaded to all callers including `ActionOverlay` and `ActionArrow`.

---

## Out of Scope for MVP

- User accounts / cloud storage
- Community / Publish feature
- Real-time collaboration
