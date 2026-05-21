# SetPlay — Basketball Tactical Board
## Design Spec

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
| GIF Export | gif.js |
| Video Export | MediaRecorder API |
| Storage (MVP) | localStorage |
| Dev env | Docker (`setplay.sh start/stop`) |

---

## Player Structure

- Offense: numbers 1–5, **orange** (`#F97316`)
- Defense: numbers 1–5, **dark blue** (`#1D4ED8`)
- Setup only asks "how many offense / how many defense"

---

## Court

- **Half Court**: 560×470 px canvas (500px court + 30px `COURT_PADDING_X` each side)
- **Full Court**: 560×940 px canvas
- Coordinate system: normalized `{x: 0–1, y: 0–1}` — y=0 = basket end (top), y=1 = midcourt (bottom)
- `COURT_PADDING_X = 30`: Stage is wider than the court; court lines and players live inside `Group x={30}`. Drag normalization (`node.x() / HALF_COURT_W`) remains intact — Konva `node.x()` returns local coords relative to parent Group.
- **Click normalization in EditorPage**: `nx = (pos.x - COURT_PADDING_X) / HALF_COURT_W` — must subtract 30px because the court group is offset inside the Stage.

### Court Lines

- Three-point arc: center (250, 53), r=238, `angle=136°` (corner-arc junction pixel-precise)
- Corner lines: x=30 / x=470, y=0 to y=144 (matches arc intersection)
- **Post marks (block marks)**: 15px horizontal lines at y=100 and y=135 on both sides of the key
- **Post boxes**: 15×20px outlined rectangles outside the key at restricted-arc level (y=50)
- All lines present in both `HalfCourt` and `FullCourt` (top + bottom ends)

---

## Formations

### Offense (6 — all half-court only)

| ID | Name |
|---|---|
| five-out | 5-Out |
| four-out-one-in | 4-Out 1-In |
| one-four-high | 1-4 High |
| horns | Horns |
| high-post | High Post |
| double-post | Double Post |

### Defense (8)

| ID | Name | Half-court only? | Notes |
|---|---|---|---|
| man-to-man | Man-to-Man | No | If offense is placed, defenders auto-position near their matched offensive player |
| two-three-zone | 2-3 Zone | **Yes** | — |
| three-two-zone | 3-2 Zone | **Yes** | — |
| one-three-one | 1-3-1 Zone | **Yes** | — |
| two-one-two-zone | 2-1-2 Zone | **Yes** | — |
| one-two-two-zone | 1-2-2 Zone | **Yes** | — |
| full-court-press | Full Court Press | No | — |
| half-court-trap | Half Court Trap | No | — |

> `FormationPreset.courtOnly?: 'half' | 'full'` — if set, only shown for that court type.  
> Man-to-Man: if offense is placed, each defender spawns at `oN` position with `y - 0.05` offset.

---

## Action Types (7)

All action labels and UI are in **English**.

| Type | Who | Line style | End symbol | Color |
|---|---|---|---|---|
| Pass | Ball holder | Dashed `- - -` | Arrowhead | amber `#fbbf24` |
| Dribble | Ball holder | Wavy `∿` (or path via waypoints) | Arrowhead | indigo `#818cf8` |
| Cut | Any offense player | Solid | Arrowhead | pink `#f472b6` |
| Screen | Any offense player | Solid | Thick perpendicular bar | sky blue `#38bdf8` |
| Shot | Ball holder | Dashed arc → basket | Crosshair circle | coral red `#f87171` |
| Handoff | Ball holder | Solid | Double bars | orange `#fb923c` |
| Defense Move | Any defense player | Solid | Arrowhead | blue `#60a5fa` |

**Color source of truth:** `src/utils/actionColors.ts` — imported by ActionArrow, ActionPreview, ActionToolbar, and ActionCard. Change once, updates everywhere.

**Screen bar**: `halfLen=22`, `strokeWidth=6`, `strokeLinecap=round` — deliberately large to distinguish from Cut's arrowhead.

---

## Data Model (`src/models/types.ts`)

```typescript
type CourtType = 'half' | 'full'
type Team = 'offense' | 'defense'
type ActionType = 'pass' | 'cut' | 'dribble' | 'screen' | 'shot' | 'handoff' | 'defense-move'

interface NormalizedPosition { x: number; y: number }
type PositionMap = Record<string, NormalizedPosition>

interface Player {
  id: string           // 'o1'–'o5' offense, 'd1'–'d5' defense
  number: 1 | 2 | 3 | 4 | 5
  team: Team
}

interface BallState { holderId: string }

// optionText: optional step label shown as a badge on the ActionCard
interface PassAction         { id: string; type: 'pass';         fromId: string; toId: string; optionText?: string }
interface CutAction          { id: string; type: 'cut';          playerId: string; toPosition: NormalizedPosition; optionText?: string }
interface DribbleAction      { id: string; type: 'dribble';      playerId: string; toPosition: NormalizedPosition; waypoints?: NormalizedPosition[]; optionText?: string }
interface ScreenAction       { id: string; type: 'screen';       screenerId: string; screenPosition: NormalizedPosition; optionText?: string }
interface ShotAction         { id: string; type: 'shot';         shooterId: string; optionText?: string }
interface HandoffAction      { id: string; type: 'handoff';      fromId: string; toId: string; meetPosition: NormalizedPosition; optionText?: string }
interface DefenseMoveAction  { id: string; type: 'defense-move'; playerId: string; toPosition: NormalizedPosition; optionText?: string }

type Action = PassAction | CutAction | DribbleAction | ScreenAction | ShotAction | HandoffAction | DefenseMoveAction

interface PlaySet {
  id: string
  name: string
  courtType: CourtType
  players: Player[]
  initialPositions: PositionMap
  initialBall: BallState
  actions: Action[]             // event sourcing — replayed in order to compute any state
  markings?: Record<string, string>  // defenderId → offensePlayerId (man-to-man assignment)
}
```

---

## User Flow (MVP)

### Phase 1 — Create New Play ✅
- Name the play
- Choose court type: Half / Full
- Choose offense (1–5) + defense (0–5) count

### Phase 2 — Starting Formation ✅
- Pick offense and/or defense formation (filtered by court type)
- Man-to-Man: auto-positions defenders near their matched offensive player
- Fine-tune with drag-and-drop
- Assign ball to a player → "Ready ✓"

### Phase 3 — Add Actions ✅
- Select action type from toolbar (left side)
- 2-click flow: source → target (or 1-click for Pass/Dribble/Shot)
- **Cursor preview**: while hovering court with an action selected, a ghost arrow/symbol follows the cursor in the action's color, showing what the result will look like
- Action added → `activeStep` jumps to the new action automatically
- Player positions update after each action (event sourcing)

### Phase 4 — Action Management ✅
- ✕ delete with confirmation ("Sure? Yes / No")
- **Clear All** button in panel header (with confirmation)
- Ctrl+Z / Cmd+Z undo
- Click any action card → court shows state at that step
- **Action labels**: each card shows type + player info (e.g. "Pass: #1 → #3")
- **Step label** (`optionText`): optional text per action; shown as small badge on card and will appear during animation (Plan 3)
- All action names in English: Pass, Dribble, Cut, Screen, Shot, Handoff

### Phase 5 — Animation & Playback ✅ (Export deferred)
- ▶ Play → full action sequence animates via React RAF + lerp interpolation (60 fps)
- ⏸ Pause / ◀ ▶ step navigation
- Speed: 0.5× / 1× / 1.5× / 2× buttons
- Players interpolate smoothly between integer step positions
- Playback auto-stops at last action; restarting from end resets to step 0
- Export (GIF / MP4): explicitly deferred — not implemented

---

## Zustand Store (`src/store/usePlayStore.ts`)

Key behavior notes:
- `setActiveSet(newSet)`: resets `activeStep` to 0 **only** when switching to a different set. Updating the same set (e.g. after addAction triggers savedSets change → useEffect) preserves current step.
- `addAction(action)`: sets `activeStep` to the new `actions.length` (jumps to latest).
- `clearAllActions()`: resets actions array and `activeStep` to 0.
- `deleteAction(id)`: clamps `activeStep` to new length if needed.
- `undoLastAction()`: removes last action, clamps step.
- **Playback state** (`isPlaying`, `playbackSpeed`): live in the store; RAF loop in `EditorPage` reads both via `usePlayStore.getState()` to avoid stale closure.
- `updateMarkings(markings)`: saves man-to-man defense assignments (defenderId → offensePlayerId).

---

## Folder Structure

```
src/
  models/
    types.ts                  ✅
  store/
    usePlayStore.ts           ✅
  utils/
    stateEngine.ts            ✅  pure: applyAction, computeStateAtStep (handles defense-move + markings)
    stateEngine.test.ts       ✅  22 tests, all passing
    formations.ts             ✅  6 offense + 8 defense formations
    courtCoords.ts            ✅  normalize/denormalize, COURT_PADDING_X
    arrowGeometry.ts          ✅  wavyPoints, perpendicularBar
    actionColors.ts           ✅  single source of truth for 7 action colors
  components/
    court/
      CourtCanvas.tsx         ✅  Stage + Layer, onStageClick + onMouseMove + onMouseLeave
      HalfCourt.tsx           ✅
      FullCourt.tsx           ✅
    players/
      PlayerNode.tsx          ✅  draggable Konva Circle + label
    actions/
      ActionArrow.tsx         ✅  7 visual styles (incl. defense-move), imports from actionColors.ts
      ActionOverlay.tsx       ✅  renders all arrows up to activeStep
      ActionPreview.tsx       ✅  ghost cursor preview while creating an action
      ActionPanel.tsx         ✅  right panel: action list + Clear All
      ActionCard.tsx          ✅  card with delete confirm, player info, optionText badge
      OptionBadge.tsx         ✅  inline add/edit for step label; closes on blur
    toolbar/
      ActionToolbar.tsx       ✅  ATK/DEF tab switcher + 6 offense tools + defense-move + markings toggle
    setup/
      PlayerSetup.tsx         ✅
      FormationPicker.tsx     ✅  filtered by courtType
    playback/
      PlaybackControls.tsx    ✅  ◀ ▶ step-through, ▶/⏸ play/pause, 0.5×/1×/1.5×/2× speed, Undo
  pages/
    HomePage.tsx              ✅
    EditorPage.tsx            ✅
    SetupPage.tsx             ✅
  App.tsx                     ✅
  main.tsx                    ✅
setplay.sh                    ✅  Docker/npm start+stop script
Dockerfile                    ✅
docker-compose.yml            ✅
```

---

## Dev Environment

```bash
./setplay.sh start   # Docker if available, otherwise npm dev server
./setplay.sh stop    # Stop all services
```

App: `http://localhost:5173`

---

## Phase Status

| Phase | Content | Status |
|---|---|---|
| Plan 1 | Scaffold, court canvas, setup flow, formations | ✅ Complete |
| Plan 2 | State engine, 7 action types (incl. defense-move), editor page, markings | ✅ Complete |
| Plan 3 | Animation (RAF + lerp), speed control, play/pause | ✅ Complete |
| Plan 3 (export) | GIF / MP4 export | Deferred |

---

## Out of Scope for MVP

- User accounts / cloud storage
- Community / Publish feature
- Real-time collaboration
