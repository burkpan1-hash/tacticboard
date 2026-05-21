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

## Action Types (6)

All action labels and UI are in **English**.

| Type | Who | Line style | End symbol | Color |
|---|---|---|---|---|
| Pass | Ball holder | Dashed `- - -` | Arrowhead | amber `#fbbf24` |
| Dribble | Ball holder | Wavy `∿` | Arrowhead | indigo `#818cf8` |
| Cut | Any player | Solid | Arrowhead | pink `#f472b6` |
| Screen | Any player | Solid | Thick perpendicular bar | sky blue `#38bdf8` |
| Shot | Ball holder | Dashed arc → basket | Crosshair circle | coral red `#f87171` |
| Handoff | Ball holder | Solid | Double bars | orange `#fb923c` |

**Color source of truth:** `src/utils/actionColors.ts` — imported by ActionArrow, ActionPreview, ActionToolbar, and ActionCard. Change once, updates everywhere.

**Screen bar**: `halfLen=22`, `strokeWidth=6`, `strokeLinecap=round` — deliberately large to distinguish from Cut's arrowhead.

---

## Data Model (`src/models/types.ts`)

```typescript
type CourtType = 'half' | 'full'
type Team = 'offense' | 'defense'
type ActionType = 'pass' | 'cut' | 'dribble' | 'screen' | 'shot' | 'handoff'

interface NormalizedPosition { x: number; y: number }
type PositionMap = Record<string, NormalizedPosition>

interface Player {
  id: string           // 'o1'–'o5' offense, 'd1'–'d5' defense
  number: 1 | 2 | 3 | 4 | 5
  team: Team
}

interface BallState { holderId: string }

// optionText: optional step label shown as a badge near the ball holder during animation
interface PassAction    { id: string; type: 'pass';    fromId: string; toId: string; optionText?: string }
interface CutAction     { id: string; type: 'cut';     playerId: string; toPosition: NormalizedPosition; optionText?: string }
interface DribbleAction { id: string; type: 'dribble'; playerId: string; toPosition: NormalizedPosition; optionText?: string }
interface ScreenAction  { id: string; type: 'screen';  screenerId: string; screenPosition: NormalizedPosition; optionText?: string }
interface ShotAction    { id: string; type: 'shot';    shooterId: string; optionText?: string }
interface HandoffAction { id: string; type: 'handoff'; fromId: string; toId: string; meetPosition: NormalizedPosition; optionText?: string }

type Action = PassAction | CutAction | DribbleAction | ScreenAction | ShotAction | HandoffAction

interface PlaySet {
  id: string
  name: string
  courtType: CourtType
  players: Player[]
  initialPositions: PositionMap
  initialBall: BallState
  actions: Action[]   // event sourcing — replayed in order to compute any state
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

### Phase 5 — Animation & Export (Plan 3)
- ▶ Play → full action sequence plays with Konva.Tween animation
- optionText badge → Konva shape on canvas (included in GIF/MP4)
- Speed: Slow / Normal / Fast
- Export: **GIF** or **MP4**

---

## Zustand Store (`src/store/usePlayStore.ts`)

Key behavior notes:
- `setActiveSet(newSet)`: resets `activeStep` to 0 **only** when switching to a different set. Updating the same set (e.g. after addAction triggers savedSets change → useEffect) preserves current step.
- `addAction(action)`: sets `activeStep` to the new `actions.length` (jumps to latest).
- `clearAllActions()`: resets actions array and `activeStep` to 0.
- `deleteAction(id)`: clamps `activeStep` to new length if needed.
- `undoLastAction()`: removes last action, clamps step.

---

## Folder Structure

```
src/
  models/
    types.ts                  ✅
  store/
    usePlayStore.ts           ✅
  utils/
    stateEngine.ts            ✅  pure: applyAction, computeStateAtStep
    stateEngine.test.ts       ✅  22 tests, all passing
    formations.ts             ✅  6 offense + 8 defense formations
    courtCoords.ts            ✅  normalize/denormalize, COURT_PADDING_X
    arrowGeometry.ts          ✅  wavyPoints, perpendicularBar
    actionColors.ts           ✅  single source of truth for 6 action colors
  components/
    court/
      CourtCanvas.tsx         ✅  Stage + Layer, onStageClick + onMouseMove + onMouseLeave
      HalfCourt.tsx           ✅
      FullCourt.tsx           ✅
    players/
      PlayerNode.tsx          ✅  draggable Konva Circle + label
    actions/
      ActionArrow.tsx         ✅  6 visual styles, imports from actionColors.ts
      ActionOverlay.tsx       ✅  renders all arrows up to activeStep
      ActionPreview.tsx       ✅  ghost cursor preview while creating an action
      ActionPanel.tsx         ✅  right panel: action list + Clear All
      ActionCard.tsx          ✅  card with delete confirm, player info, optionText badge
      OptionBadge.tsx         ✅  inline add/edit for step label; closes on blur
    toolbar/
      ActionToolbar.tsx       ✅  6 SVG icon buttons, colored from actionColors.ts
    setup/
      PlayerSetup.tsx         ✅
      FormationPicker.tsx     ✅  filtered by courtType
    playback/
      PlaybackControls.tsx    ✅  ◀ ▶ step-through + Undo button
    export/
      ExportPanel.tsx         ← Plan 3
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
| Plan 2 | State engine, 6 action types, editor page | ✅ Complete |
| Plan 3 | Animation, playback, GIF/MP4 export | Pending |

---

## Out of Scope for MVP

- User accounts / cloud storage
- Community / Publish feature
- Real-time collaboration
