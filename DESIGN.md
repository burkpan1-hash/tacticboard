# SetPlay — Basketball Tactical Board
## Design Spec (güncel: 2026-06-12 — v5)

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
| Framework | React 19 + TypeScript |
| Build | Vite |
| Canvas | react-konva (Konva.js) |
| State | Zustand |
| Styling | Tailwind CSS v4 |
| Routing | react-router-dom v7 (client-side SPA, no SSR/prerender yet) |
| i18n | i18next + react-i18next (6 languages: en, tr, de, es, fr, it) |
| Export | Video (mp4-muxer + MediaRecorder, 30 fps) |
| Backend | Hono (`server/index.ts`) on `@hono/node-server` |
| Auth | better-auth (email/password + Google OAuth), email via Resend |
| Database | PostgreSQL + drizzle-orm |
| Storage | Cloud (Postgres) for signed-in users; localStorage for crash recovery / guests |
| Analytics | Sentry (errors) + PostHog (product) |
| Monetization | Google AdSense (free tier) + Pro subscription |
| Dev env | Docker (`setplay.sh start/stop`) or plain `npm run dev`; API via `npm run server:dev` |

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
| `COURT_PADDING_Y` | `70` | OOB zone above/below baselines (≈5ft at 1.4× scale) |

- **Coordinate system**: normalized `{x: 0–1, y: 0–1}` — y=0 = top baseline, y=1 = bottom baseline (or mid-court for half court)
- **OOB positions**: y slightly outside 0–1 is valid (e.g. `y = -0.03`) — used for inbounders standing behind the baseline. `PlayerNode` clamps drag to `y ∈ [-COURT_PADDING_Y/cH, 1 + COURT_PADDING_Y/cH]`. OOB players render with a dashed yellow ring indicator.
- **OOB drag bounds**: `PlayerNode` has a `dragBoundFunc` that constrains absolute stage position to `[RADIUS, sw-RADIUS] × [RADIUS, sh-RADIUS]` using `stage.width()/stage.scaleX()` and `stage.height()/stage.scaleY()` (logical coords, scale-aware). `onDragEnd` explicitly resets Konva node to `e.target.x(clamped.x)` / `e.target.y(clamped.y)` to prevent stale-state disappearing bug (second drag to same OOB edge).
- **Full court**: landscape display (rotated −90°), uses `FULL_COURT_H` for y normalization
- **`COURT_PADDING_X`**: Stage wider than court; court lines + players inside `Group x={42}`. Click normalization: `nx = (pos.x - COURT_PADDING_X) / HALF_COURT_W`
- **`COURT_PADDING_Y`**: Stage taller/wider by `2×70px`; court inside `Group y={70}`. OOB players remain visible in this black zone. Scale: `courtScale = Math.min(aw / (FULL_COURT_H + 2×COURT_PADDING_Y), ah / STAGE_W)`.

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

### Defense (9)

| ID | Name | Court restriction | Notes |
|---|---|---|---|
| `man-to-man` | Man-to-Man | None | If offense is placed, defenders auto-position near matched offensive player |
| `two-three-zone` | 2-3 Zone | Half only | — |
| `three-two-zone` | 3-2 Zone | Half only | — |
| `one-three-one` | 1-3-1 Zone | Half only | — |
| `two-one-two-zone` | 2-1-2 Zone | Half only | — |
| `one-two-two-zone` | 1-2-2 Zone | Half only | — |
| `one-three-one-press` | 1-3-1 Press | Full only | Inbounder o3 at `x=0.20, y=-0.03` (OOB), `attackBasket: 'bottom'`, `defaultBallHolder: 'o3'`. o1 receives inbound, o2 at mid-court, o4/o5 in offensive half. Positions both offense and defense. |
| `one-two-one-one-press` | 1-2-1-1 Press | Full only | Inbounder o4 at `y = -0.03` (OOB), `attackBasket: 'bottom'`, `defaultBallHolder: 'o4'`. Positions both offense and defense. |

> `FormationPreset.courtOnly?: 'half' | 'full'` — if set, only shown for that court type.
> `FormationPreset.defaultBallHolder?: string` — auto-assigns ball to this player when formation is selected; also auto-skips the "Assign Ball" screen in setup.
> `FormationPreset.attackBasket?: 'top' | 'bottom'` — auto-sets attack direction when formation is selected.

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
| `ball-force` | Defender | Straight line → projected position | Thick perpendicular bar (force direction indicator) | magenta `#d946ef` |

**Waypoints**: `dribble` and `cut` support an optional `waypoints: NormalizedPosition[]` array for drawn paths. Enabled both via drag on court (tool mode) and via player drag auto-action.

**Screen bar**: `halfLen=22`, `strokeWidth=6`, `strokeLinecap=round`.

### Double-team positioning logic (`computeDoubleTeamPositions`)

Exported from `stateEngine.ts`. Accepts `basketY` (normalized y of the attack basket) for correct direction on full court.

- **Near sideline** (`x < 0.15` or `x > 0.85`): one defender from interior (lateral), one from baseline (toward basket)
- **Open court**: one defender directly between target and basket, one lateral with basket-side offset
- Both defenders assigned to the position they're closest to

**Arrow rendering**: arrows go FROM each defender TO their computed trap position (not to the target). One arrow visually shows the baseline trap, one shows the lateral trap.

---

## Action Groups

A **group** bundles multiple actions that animate **simultaneously in a single playback step** (e.g. a pass + a cut + a screen all happening together). Rendered by `src/components/actions/GroupCard.tsx`; validation in `src/utils/groupValidation.ts`.

### Two ways to create a group

- **Recording mode** (`startGroupRecording` / `stopGroupRecording` in the store): toolbar "⏺ Group" starts recording; every new action created goes into the open group until "⏹ Stop". Each appended action is validated immediately.
- **Post-hoc grouping** (`createGroup(actionIds)`): select existing actions in the panel, then "Group ✓" bundles them.

### Group rules (`groupValidation.ts` — offense only; defense unrestricted)

1. **Shot can never be in a group** (`SHOT_IN_GROUP`).
2. **At most one ball action** (pass / dribble / handoff) per group (`BALL_ACTION_CONFLICT`).
3. **Each offense player appears in at most one action** per group (`PLAYER_ALREADY_IN_GROUP`).

- `validateGroupActionType(type, existing)`: cheap pre-check the moment a tool is selected (catches shot + ball-action conflict before the user wastes clicks).
- `validateGroupAction(newAction, existing)`: full check including player-occupancy once the action is complete.
- `validateGroupActions(actions)`: batch validation for post-hoc grouping.
- Conflicts surface as `groupConflictError` in the store and auto-clear after ~6s.

### Lifecycle

- `ungroupGroup(groupId)`: dissolves a group back into individual actions.
- `setGroupName` / `setGroupOptionText`: editable group label + step badge.
- **Normalization**: groups left with **0** actions are dropped; groups left with **1** action collapse back to a plain action.

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
interface BallForceAction   { id: string; type: 'ball-force';  defenderId: string; targetId: string; angle: number; optionText?: string }
// angle: radians from ball handler center → click point (force direction)

type Action =
  | PassAction | CutAction | DribbleAction | ScreenAction | ShotAction
  | HandoffAction | DefenseMoveAction | DoubleTeamAction | BallForceAction

// All concrete action interfaces now extend `ActionBase { id; optionText? }`.

// ── Action Group ──
// A group of actions that all animate simultaneously in a single step.
interface ActionGroup {
  id: string
  type: 'group'
  name?: string
  optionText?: string
  actions: Action[]
}

type ActionItem = Action | ActionGroup   // a timeline entry: a single action OR a group

interface PlaySet {
  id: string
  name: string
  courtType: CourtType
  attackBasket?: 'top' | 'bottom'      // full court only; undefined → half court
  players: Player[]
  initialPositions: PositionMap
  initialBall: BallState
  actions: ActionItem[]                // event sourcing — replayed in order; entries may be single actions or groups
  markings?: Record<string, string>    // defenderId → offensePlayerId (man-to-man assignment)
  cloudPlayId?: string                 // server-side play id once persisted — drives PUT-vs-POST in handleSave
}
```

---

## User Flow

### Phase 1 — Create New Play ✅
- Name the play
- Choose court type: Half / Full
- Choose offense (1–5) + defense (0–5) count
- **"← Back" button** on the info step navigates to home (`/`)

### Phase 2 — Starting Formation ✅
- Pick formation (filtered by court type) for offense and/or defense
- **Full court**: Flip button sets `attackBasket` and mirrors all positions (y = 1−y)
- Formation with `defaultBallHolder` (e.g. 1-2-1-1 Press): auto-assigns ball and sets `attackBasket`; "Next →" becomes "Ready ✓" and skips the ball assignment screen
- Fine-tune with drag-and-drop (OOB positions allowed for inbounders)
- Assign ball to an offense player → "Ready ✓" (skipped if ball already assigned by formation)

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
- **Step 0 or no actions on court yet**: drag updates `initialPositions`
- **Step > 0 and at least 1 action exists on court, no action in progress**: drag auto-inserts:
  - Ball holder → `dribble` (with waypoints if path was drawn)
  - Other offense → `cut` (with waypoints)
  - Defense → `defense-move`
- **Minimum drag distance**: 50px — drags shorter than 50px are ignored (no action created, player snaps back)
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
- Export button in PlaybackControls (orange, next to Save) → opens `ExportModal`
- PNG: `stage.toDataURL()` snapshot of current view
- GIF: frame capture via gif.js, renders all steps
- Video: MediaRecorder captures canvas during RAF playback

### Phase 10 — Save System ✅
- **Explicit Save**: play is only committed to `savedSets` when user clicks Save (requires ≥ 1 action)
- **Save button**: in PlaybackControls bar, orange when unsaved changes exist, grey "Saved" when up to date
- **Unsaved state tracking**: `savedActionCount` tracks action count at last explicit save; `isDirty = actions.length !== savedActionCount`
- **Snapshot ref**: `savedSnapshotRef` stores the last explicitly saved version of the set; initialized on set load via `useEffect`, updated on every Save
- **Confirmation dialog** on "← Home" when `isDirty && actions.length > 0`:
  - "Save & Exit" → saves + navigates
  - "Don't Save" → restores `savedSets` AND `activeSet` to snapshot, then navigates
  - "Cancel" → stays in editor
- **Empty set cleanup**: navigating home with 0 actions deletes the set from `savedSets`

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
| `ball-force` | defender → projected position (angle-based, 0.11 away from ball handler) | — |
| (markings) | each defender moves to `OFFSET=0.12` toward basket from assigned player | — |

---

## Backend, Auth & Cloud (`server/`)

Hono API (`server/index.ts`) served by `@hono/node-server`; in production it also static-serves the built `dist/` with an SPA fallback.

- **Auth**: better-auth handles `/api/auth/**` (email/password + Google OAuth). `/api/auth-config` tells the frontend which providers are wired (hides the Google button when unconfigured). Email (verification / password reset) via Resend. Client wrapper: `src/lib/authClient.ts` (`authClient.useSession()`).
- **Plays API** (`server/routes/plays.ts`, mounted at `/api/plays`): authenticated CRUD for a user's saved plays. Free tier capped at **10 saved plays** (`FREE_PLAY_LIMIT` in HomePage); exceeding it opens the upgrade modal.
- **Cloud save**: `PlaySet.cloudPlayId` drives PUT-vs-POST on save — first save POSTs (creates), subsequent saves PUT (update) the same server record.
- **Sharing**: `POST /api/plays/:id/share` mints a `shareToken`; public read at `/share/:token`. Anonymous users can publish via `POST /api/share-public` → stored in a separate `guestPlays` table. Public viewer is `src/pages/SharePage.tsx` (read-only playback). `ShareInterstitialModal` shows a countdown while the link is generated.
- **DB**: PostgreSQL via drizzle-orm (`server/db/`); `npm run db:push` syncs schema.

---

## Internationalization

- i18next + react-i18next, browser language detection. Locale files: `src/i18n/locales/{en,tr,de,es,fr,it}.json` (6 languages).
- All user-facing UI strings are keyed (e.g. `home.*`, `setup.*`, `editor.*`, `actionPanel.*`, `export.*`). Action/formation **type labels** stay English (source of truth: `actionColors.ts` / `formations.ts`).
- `LanguageSwitcher` component lets users change language at runtime.

---

## Monetization & Landing

Freemium model (decision 2026-06-03): free tier with ads, paid **Pro** subscription (unlimited saves, no ads, video export).

- **AdSense**: `src/components/ui/AdSlot.tsx` renders display units; the loader script is injected only on content pages (currently HomePage). **Policy note**: ads must appear only on content-rich pages, never on tool/auth/dead-end screens — see the AdSense compliance plan in `.claude/plans/`. Site is a client-rendered SPA, so crawler-visible content / prerendering is the key open item for AdSense approval.
- **Landing page**: logged-out HomePage shows a content-rich landing (hero, feature grid, "how it works", use cases) so the homepage carries real publisher content; logged-in users see their cloud plays dashboard.
- **Content pages**: `PricingPage`, `PrivacyPage`, `TermsPage`, `RefundPage` (all i18n, legal/credibility + conversion content). No-refund policy with accidental-renewal exception; Paddle as Merchant of Record.

---

## Folder Structure

```
src/
  models/
    types.ts                  ✅  ActionType union (9 types), PlaySet with attackBasket
  store/
    usePlayStore.ts           ✅  full CRUD + flipAttackBasket, updateInitialPosition, addPlayerToCourt
  utils/
    stateEngine.ts            ✅  applyAction, computeStateAtStep, computeDoubleTeamPositions (group-aware)
    stateEngine.test.ts       ✅  state engine tests
    groupValidation.ts        ✅  group conflict rules (shot / ball-action / player-occupancy)
    formations.ts             ✅  6 offense + 8 defense formations
    courtCoords.ts            ✅  COURT_SCALE=1.4, normalize/denormalize, HALF_COURT constants
    arrowGeometry.ts          ✅  wavyPoints, wavyAlongPath, perpendicularBar
    actionColors.ts           ✅  ACTION_COLORS + ACTION_LABELS for 9 action types
    frameState.ts             ✅  pure computeFrameState (interpolated positions per instant; shared by SharePage + export)
    actionArrows.ts           ✅  shared arrowLine + smartLabelCenter geometry
    export/
      composite.ts            ✅  letterbox fit + dark bg + watermark
      encodeMp4.ts            ✅  WebCodecs VideoEncoder + mp4-muxer, monotonic timestamps
      exportVideo.ts          ✅  deterministic off-DOM frame loop (9:16 / 1:1 / 16:9)
      downloadBlob.ts         ✅  File System Access API + anchor fallback
  components/
    court/
      CourtCanvas.tsx         ✅  Stage + Layer, landscape mode, event handlers
      HalfCourt.tsx           ✅  1.4× scaled court lines
      PlayScene.tsx           ✅  read-only scene (arrows + players + labels) from a FrameState; shared by SharePage + export
      FullCourt.tsx           ✅  two half-courts stacked, attackBasket rotation
    players/
      PlayerNode.tsx          ✅  onDragStart/onDragMove/onDragEnd + landscape rotation fix; dragBoundFunc (scale-aware logical bounds); explicit position reset in onDragEnd to prevent stale-state OOB disappear
    actions/
      ActionArrow.tsx         ✅  9 visual styles; double-team arrows go to trap positions; basketY prop
      ActionOverlay.tsx       ✅  renders arrows up to activeStep; passes attackBasket → basketY
      ActionPreview.tsx       ✅  ghost cursor preview; dribble/cut waypoint paths
      ActionPanel.tsx         ✅  right panel: action list + Clear All; group record/stop, post-hoc grouping, conflict banner
      ActionCard.tsx          ✅  delete confirm, player description, optionText badge, group-select checkbox
      GroupCard.tsx           ✅  renders an ActionGroup (header, nested actions, name + optionText edit, ungroup)
      OptionBadge.tsx         ✅  inline add/edit for step label
    toolbar/
      ActionToolbar.tsx       ✅  ATK/DEF tabs; 6 offense tools + 3 defense tools; `hasDefenders` prop disables DEF tools when no defenders on court; markings toggle
    setup/
      PlayerSetup.tsx         ✅
      FormationPicker.tsx     ✅  filtered by courtType
    playback/
      PlaybackControls.tsx    ✅  ◀ ▶ play/pause, speed, Undo, Save + Export buttons (both orange)
    export/
      ExportModal.tsx         ✅  aspect selector (9:16/1:1/16:9), real progress, mp4 30 fps
      ExportStage.tsx         ✅  off-DOM CourtCanvas + PlayScene at 2× for frame capture
    ui/
      AdSlot.tsx              ✅  AdSense display unit (content pages only)
      ShareInterstitialModal.tsx ✅  share-link generation + countdown
      LanguageSwitcher.tsx    ✅  runtime language switch
      UpgradeModal.tsx / CookieConsentBanner.tsx ✅
  pages/
    HomePage.tsx              ✅  logged-out landing (content) + logged-in cloud dashboard
    EditorPage.tsx            ✅  full editor; positionOverrides, player-drag auto-action, ATK bar, groups
    SetupPage.tsx             ✅  Flip button in formation + ball steps (full court only); "← Back" to home on info step
    SharePage.tsx             ✅  public read-only play viewer
    PricingPage / PrivacyPage / TermsPage / RefundPage  ✅  content + legal (i18n)
    LoginPage / RegisterPage / VerifyEmailPage / ForgotPasswordPage / ResetPasswordPage  ✅  auth flow
    NotFoundPage.tsx          ✅
  lib/
    authClient.ts             ✅  better-auth React client (useSession)
  i18n/
    locales/{en,tr,de,es,fr,it}.json  ✅  6 languages
  App.tsx                     ✅  routes (14)
  main.tsx                    ✅
server/
  index.ts                    ✅  Hono API + static serve; auth, share, plays
  auth.ts / db/ / routes/plays.ts   ✅  better-auth, drizzle schema/client, plays CRUD
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
| Post-plan | OOB player support (COURT_PADDING_Y=70, dashed ring, inbounder positions) | ✅ |
| Post-plan | 1-2-1-1 Press formation with OOB inbounder + auto ball assignment | ✅ |
| Post-plan | Ball-force rework: angle+targetId model, bar visual instead of curved arrow | ✅ |
| Post-plan | 1-3-1 Press offense positions (inbounder o3 OOB, press-break alignment) | ✅ |
| Post-plan | Explicit Save system: Save button, unsaved tracking, confirmation dialog, snapshot restore | ✅ |
| Post-plan | Player drag auto-action: triggers only after ≥1 court action; 50px minimum drag threshold | ✅ |
| Post-plan | ActionPanel auto-scroll to bottom on new action | ✅ |
| Post-plan | OOB drag fix: `dragBoundFunc` + explicit Konva position reset; prevents player disappearing on repeated OOB drags | ✅ |
| Post-plan | Setup info step: "← Back" navigation to home | ✅ |
| Post-plan | DEF toolbar disabled (`hasDefenders`) when no defenders on court | ✅ |
| Phase 2 | Auth (better-auth, Google OAuth, email verify/reset via Resend) + cloud save (Hono + Postgres) | ✅ |
| Post-plan | Public sharing: share tokens, guest plays, read-only SharePage, interstitial modal | ✅ |
| Post-plan | i18n: 6 languages (en, tr, de, es, fr, it) | ✅ |
| Post-plan | Video export reworked to mp4-muxer (30 fps) | ✅ |
| Post-plan | Monetization: AdSense + Pro tier, content landing page, pricing/legal pages | ✅ |
| Post-plan | **Action groups**: record/post-hoc grouping, conflict validation, simultaneous playback | ✅ |
| Open | AdSense approval: SSR/prerender + per-route meta + content/blog layer (see `.claude/plans/`) | ⏳ |

---

## Key Design Decisions

### Past arrows are immutable
When a player is dragged in the editor after step 0, past arrows must not move. Solution: `positionOverrides` is local React state (not in Zustand) — used only for rendering and `ActionPreview`. The state engine (used for arrow computation) always reads from `initialPositions` + applied actions. Overrides are cleared on every `activeStep` change.

### Player drag auto-action
If at least one action exists anywhere on the court AND the drag distance exceeds 50px, the drag auto-creates a move action (dribble/cut/defense-move). If no actions exist yet OR the drag is too short, `initialPositions` is updated instead. The drag path is captured as waypoints (15px sampling). The 50px threshold prevents accidental micro-drags (e.g. when adjusting a double-team or screen position) from creating unintended actions.

### Explicit Save
The store's `addAction` / `updateAction` etc. auto-persist changes to localStorage (crash recovery), but the official `savedSets` list (shown on home) requires an explicit Save. `savedSnapshotRef` holds the last saved version; "Don't Save" in the exit dialog restores both `savedSets` and `activeSet` to that snapshot, ensuring the user truly discards changes.

### basketY threading
`computeStateAtStep`, `applyAction`, and `computeDoubleTeamPositions` all accept an optional `basketY` parameter. This is computed once in `EditorPage` from `courtType` + `attackBasket` and threaded to all callers including `ActionOverlay` and `ActionArrow`.

---

## Out of Scope (current)

- Community / public play library / Publish feature
- Real-time collaboration
- Native mobile app (mobile web layout was reverted — see backlog)
- Multi-language prerendering + hreflang (English prerender first for AdSense)

> Shipped since MVP: user accounts, cloud storage, and public link sharing are now live (see Backend, Auth & Cloud).
