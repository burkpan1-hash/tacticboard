# SetPlay Foundation — Implementation Plan [✅ TAMAMLANDI]

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** Tüm tasklar tamamlandı. Git: `dcb817b`. Sonraki: Plan 2 (action system).

> **Plan 1 sonrası ek değişiklikler (commit `46d2ed2`):**
> - Savunma dizilimleri 6→8 oldu: 2-1-2 Zone ve 1-2-2 Zone eklendi
> - `FormationPreset.courtOnly?: 'half' | 'full'` alanı eklendi (zone setler yarım korta kilitlendi)
> - Man-to-Man: hücum dizilmişse dinamik konumlandırma (SetupPage.handleFormationSelect)
> - `formations.test.ts`: defense count 6→8 güncellendi
> - Docker ortamı eklendi (Dockerfile, docker-compose.yml, setplay.sh)
> - Hücum dizilimleri yenilendi: Motion ve 2-3 Low → High Post ve Double Post; tümü `courtOnly: 'half'`; koordinatlar uygulamadan kalibre edildi
>
> **Kort canvas iyileştirmeleri (henüz commit edilmedi):**
> - `COURT_PADDING_X = 30` eklendi; Stage 500→560px genişledi, kort + oyuncular `Group x={30}` offset
> - Post çizgileri (block marks): key yanlarında y=100 ve y=135; post dikdörtgenleri: y=50 (restricted arc seviyesi)
> - Üç nokta yayı düzeltmesi: `threeCornerY` 142→144, `angle` 135→136°
> - HalfCourt ve FullCourt (her iki basket ucu) güncellendi

**Goal:** Build the project scaffold, basketball court canvas, draggable player nodes, and formation picker setup flow. End state: user can name a set, choose court type, pick a formation, adjust player positions with drag-and-drop, assign the ball, and press "Hazır" to enter the editor.

**Architecture:** Vite + React + TypeScript SPA. Konva.js renders the court and players on a Canvas element via react-konva. Player positions stored as normalized `{x: 0–1, y: 0–1}` coordinates relative to canvas dimensions — converted to pixels at render time so the layout scales cleanly. Zustand holds global state. react-router-dom handles navigation between Home → Setup → Editor pages.

**Tech Stack:** React 18, TypeScript, Vite 5, react-konva 18, Konva 9, Zustand 4, Tailwind CSS 3, react-router-dom 6, Vitest + jsdom

---

## File Map

| File | Responsibility |
|---|---|
| `src/models/types.ts` | All TypeScript interfaces and union types |
| `src/utils/courtCoords.ts` | normalize / denormalize position helpers |
| `src/utils/formations.ts` | 12 preset formation coordinate maps |
| `src/store/usePlayStore.ts` | Zustand store — setup state only for this plan |
| `src/components/court/HalfCourt.tsx` | Konva shapes for half-court lines |
| `src/components/court/FullCourt.tsx` | Konva shapes for full-court lines |
| `src/components/court/CourtCanvas.tsx` | Konva Stage + Layer wrapper |
| `src/components/players/PlayerNode.tsx` | Draggable Konva Circle + number label |
| `src/components/actions/BallMarker.tsx` | Small ball indicator on current holder |
| `src/components/setup/FormationPicker.tsx` | Grid of preset formation cards |
| `src/components/setup/PlayerSetup.tsx` | Stepper: offense count → defense count |
| `src/pages/HomePage.tsx` | Saved sets list (stub for this plan) |
| `src/pages/SetupPage.tsx` | Wires PlayerSetup + FormationPicker + CourtCanvas |
| `src/pages/EditorPage.tsx` | Stub — shows "Editor coming in Plan 2" |
| `src/App.tsx` | Router root |

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tailwind.config.js`, `src/index.css`, `src/test-setup.ts`

- [ ] **Step 1: Scaffold Vite project**
```bash
cd "/Users/burakbozkurt/Desktop/basketball board tactics"
npm create vite@latest . -- --template react-ts
```
Expected: package.json, src/main.tsx, index.html created. Answer "yes" if prompted about existing files.

- [ ] **Step 2: Install runtime dependencies**
```bash
npm install react-konva konva zustand react-router-dom
```

- [ ] **Step 3: Install dev dependencies**
```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @types/node tailwindcss postcss autoprefixer
```

- [ ] **Step 4: Init Tailwind**
```bash
npx tailwindcss init -p
```

- [ ] **Step 5: Write tailwind.config.js**
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 6: Write vite.config.ts**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

- [ ] **Step 7: Write src/test-setup.ts**
```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 8: Write src/index.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; }
body {
  margin: 0;
  background: #0f172a;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

- [ ] **Step 9: Add test script to package.json**
In the `scripts` section, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 10: Verify dev server starts**
```bash
npm run dev
```
Expected: "VITE v5.x ready" at http://localhost:5173

- [ ] **Step 11: Init git and commit**
```bash
git init
git add .
git commit -m "feat: scaffold vite react typescript project"
```

---

## Task 2: TypeScript Type Definitions

**Files:**
- Create: `src/models/types.ts`

- [ ] **Step 1: Write src/models/types.ts**
```ts
export type CourtType = 'half' | 'full'
export type Team = 'offense' | 'defense'
export type ActionType = 'pass' | 'cut' | 'dribble' | 'screen' | 'shot' | 'handoff'

export interface NormalizedPosition {
  x: number  // 0–1 relative to canvas width
  y: number  // 0–1 relative to canvas height
}

export type PositionMap = Record<string, NormalizedPosition>

export interface Player {
  id: string          // 'o1'–'o5' offense, 'd1'–'d5' defense
  number: 1 | 2 | 3 | 4 | 5
  team: Team
}

export interface BallState {
  holderId: string
}

// ── Actions ─────────────────────────────────────────
// optionText: if set, animation pauses ~2s after this action completes
// and shows a text badge near the ball holder on the canvas.
export interface PassAction    { id: string; type: 'pass';    fromId: string; toId: string;                                   optionText?: string }
export interface CutAction     { id: string; type: 'cut';     playerId: string; toPosition: NormalizedPosition;               optionText?: string }
export interface DribbleAction { id: string; type: 'dribble'; playerId: string; toPosition: NormalizedPosition;               optionText?: string }
export interface ScreenAction  { id: string; type: 'screen';  screenerId: string; screenPosition: NormalizedPosition;         optionText?: string }
export interface ShotAction    { id: string; type: 'shot';    shooterId: string;                                              optionText?: string }
export interface HandoffAction { id: string; type: 'handoff'; fromId: string; toId: string; meetPosition: NormalizedPosition; optionText?: string }

export type Action =
  | PassAction | CutAction | DribbleAction
  | ScreenAction | ShotAction | HandoffAction

export interface PlaySet {
  id: string
  name: string
  courtType: CourtType
  players: Player[]
  initialPositions: PositionMap
  initialBall: BallState
  actions: Action[]
}
```

- [ ] **Step 2: Commit**
```bash
git add src/models/types.ts
git commit -m "feat: add typescript type definitions"
```

---

## Task 3: Court Coordinate Utilities

**Files:**
- Create: `src/utils/courtCoords.ts`
- Create: `src/utils/courtCoords.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/utils/courtCoords.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { normalize, denormalize, HALF_COURT_W, HALF_COURT_H } from './courtCoords'

describe('normalize', () => {
  it('converts center pixel to (0.5, 0.5)', () => {
    const result = normalize(HALF_COURT_W / 2, HALF_COURT_H / 2, HALF_COURT_W, HALF_COURT_H)
    expect(result).toEqual({ x: 0.5, y: 0.5 })
  })

  it('converts top-left pixel to (0, 0)', () => {
    expect(normalize(0, 0, HALF_COURT_W, HALF_COURT_H)).toEqual({ x: 0, y: 0 })
  })

  it('converts bottom-right pixel to (1, 1)', () => {
    expect(normalize(HALF_COURT_W, HALF_COURT_H, HALF_COURT_W, HALF_COURT_H)).toEqual({ x: 1, y: 1 })
  })
})

describe('denormalize', () => {
  it('converts (0.5, 0.5) to canvas center', () => {
    const result = denormalize(0.5, 0.5, HALF_COURT_W, HALF_COURT_H)
    expect(result).toEqual({ x: HALF_COURT_W / 2, y: HALF_COURT_H / 2 })
  })

  it('is the inverse of normalize', () => {
    const px = { x: 123, y: 89 }
    const norm = normalize(px.x, px.y, HALF_COURT_W, HALF_COURT_H)
    const back = denormalize(norm.x, norm.y, HALF_COURT_W, HALF_COURT_H)
    expect(back.x).toBeCloseTo(px.x)
    expect(back.y).toBeCloseTo(px.y)
  })
})
```

- [ ] **Step 2: Run tests — expect failure**
```bash
npm test
```
Expected: FAIL — "Cannot find module './courtCoords'"

- [ ] **Step 3: Write src/utils/courtCoords.ts**
```ts
import type { NormalizedPosition } from '../models/types'

export const HALF_COURT_W = 500
export const HALF_COURT_H = 470
export const FULL_COURT_W = 500
export const FULL_COURT_H = 940

export function normalize(
  px: number, py: number,
  canvasW: number, canvasH: number
): NormalizedPosition {
  return { x: px / canvasW, y: py / canvasH }
}

export function denormalize(
  nx: number, ny: number,
  canvasW: number, canvasH: number
): { x: number; y: number } {
  return { x: nx * canvasW, y: ny * canvasH }
}

// Half-court key measurements (pixels, for 500×470 canvas)
// Scale: 10px = 1ft (50ft wide, 47ft long)
export const HALF_COURT = {
  W: HALF_COURT_W,
  H: HALF_COURT_H,
  basket:        { x: 250, y: 53  },   // 5.3ft from baseline
  keyLeft:       170,                   // paint left x (16ft wide, centered)
  keyRight:      330,                   // paint right x
  keyBottom:     190,                   // free throw line y (19ft from baseline)
  ftCircle:      { cx: 250, cy: 190, r: 60  },  // 6ft radius
  restricted:    { cx: 250, cy: 53,  r: 40  },  // 4ft restricted arc
  threeCornerX:  { left: 30, right: 470 },       // 3ft from each sideline
  threeCornerY:  142,                            // top of corner-3 straight line
  threeArc:      { cx: 250, cy: 53,  r: 238 },  // 23.8ft 3-point arc
} as const
```

- [ ] **Step 4: Run tests — expect pass**
```bash
npm test
```
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**
```bash
git add src/utils/courtCoords.ts src/utils/courtCoords.test.ts
git commit -m "feat: add court coordinate utilities with tests"
```

---

## Task 4: Formation Data

**Files:**
- Create: `src/utils/formations.ts`
- Create: `src/utils/formations.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/utils/formations.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { OFFENSE_FORMATIONS, DEFENSE_FORMATIONS } from './formations'

describe('formations', () => {
  it('has 6 offense formations', () => {
    expect(OFFENSE_FORMATIONS).toHaveLength(6)
  })

  it('has 6 defense formations', () => {
    expect(DEFENSE_FORMATIONS).toHaveLength(6)
  })

  it('each offense formation has exactly 5 positions', () => {
    OFFENSE_FORMATIONS.forEach(f => {
      expect(Object.keys(f.positions)).toHaveLength(5)
    })
  })

  it('each defense formation has exactly 5 positions', () => {
    DEFENSE_FORMATIONS.forEach(f => {
      expect(Object.keys(f.positions)).toHaveLength(5)
    })
  })

  it('all positions are normalized (0–1)', () => {
    [...OFFENSE_FORMATIONS, ...DEFENSE_FORMATIONS].forEach(f => {
      Object.values(f.positions).forEach(pos => {
        expect(pos.x).toBeGreaterThanOrEqual(0)
        expect(pos.x).toBeLessThanOrEqual(1)
        expect(pos.y).toBeGreaterThanOrEqual(0)
        expect(pos.y).toBeLessThanOrEqual(1)
      })
    })
  })
})
```

- [ ] **Step 2: Run — expect failure**
```bash
npm test
```
Expected: FAIL — "Cannot find module './formations'"

- [ ] **Step 3: Write src/utils/formations.ts**
```ts
import type { PositionMap } from '../models/types'

export interface FormationPreset {
  id: string
  name: string
  positions: PositionMap   // keys: 'o1'–'o5' or 'd1'–'d5'
}

// Positions are normalized (0–1) relative to half-court canvas (500×470)
// y=0 is baseline (top), y=1 is mid-court (bottom)
// Basket is near y=0.11

export const OFFENSE_FORMATIONS: FormationPreset[] = [
  {
    id: 'five-out',
    name: '5-Out',
    positions: {
      o1: { x: 0.50, y: 0.72 },  // top of key
      o2: { x: 0.82, y: 0.55 },  // right wing
      o3: { x: 0.90, y: 0.28 },  // right corner
      o4: { x: 0.10, y: 0.28 },  // left corner
      o5: { x: 0.18, y: 0.55 },  // left wing
    },
  },
  {
    id: 'four-out-one-in',
    name: '4-Out 1-In',
    positions: {
      o1: { x: 0.50, y: 0.74 },
      o2: { x: 0.82, y: 0.55 },
      o3: { x: 0.75, y: 0.24 },
      o4: { x: 0.25, y: 0.24 },
      o5: { x: 0.50, y: 0.18 },  // low post
    },
  },
  {
    id: 'one-four-high',
    name: '1-4 High',
    positions: {
      o1: { x: 0.50, y: 0.76 },
      o2: { x: 0.72, y: 0.52 },
      o3: { x: 0.28, y: 0.52 },
      o4: { x: 0.70, y: 0.40 },  // right elbow
      o5: { x: 0.30, y: 0.40 },  // left elbow
    },
  },
  {
    id: 'two-three-low',
    name: '2-3 Low',
    positions: {
      o1: { x: 0.50, y: 0.76 },
      o2: { x: 0.66, y: 0.66 },
      o3: { x: 0.82, y: 0.18 },
      o4: { x: 0.50, y: 0.13 },
      o5: { x: 0.18, y: 0.18 },
    },
  },
  {
    id: 'motion',
    name: 'Motion',
    positions: {
      o1: { x: 0.50, y: 0.76 },
      o2: { x: 0.80, y: 0.58 },
      o3: { x: 0.88, y: 0.28 },
      o4: { x: 0.12, y: 0.28 },
      o5: { x: 0.20, y: 0.58 },
    },
  },
  {
    id: 'horns',
    name: 'Horns',
    positions: {
      o1: { x: 0.50, y: 0.74 },
      o2: { x: 0.20, y: 0.56 },
      o3: { x: 0.80, y: 0.56 },
      o4: { x: 0.64, y: 0.44 },  // right elbow
      o5: { x: 0.36, y: 0.44 },  // left elbow
    },
  },
]

export const DEFENSE_FORMATIONS: FormationPreset[] = [
  {
    id: 'man-to-man',
    name: 'Man-to-Man',
    positions: {
      d1: { x: 0.50, y: 0.68 },
      d2: { x: 0.78, y: 0.52 },
      d3: { x: 0.88, y: 0.25 },
      d4: { x: 0.12, y: 0.25 },
      d5: { x: 0.22, y: 0.52 },
    },
  },
  {
    id: 'two-three-zone',
    name: '2-3 Zone',
    positions: {
      d1: { x: 0.38, y: 0.62 },
      d2: { x: 0.62, y: 0.62 },
      d3: { x: 0.18, y: 0.26 },
      d4: { x: 0.50, y: 0.18 },
      d5: { x: 0.82, y: 0.26 },
    },
  },
  {
    id: 'three-two-zone',
    name: '3-2 Zone',
    positions: {
      d1: { x: 0.50, y: 0.65 },
      d2: { x: 0.26, y: 0.52 },
      d3: { x: 0.74, y: 0.52 },
      d4: { x: 0.28, y: 0.22 },
      d5: { x: 0.72, y: 0.22 },
    },
  },
  {
    id: 'one-three-one',
    name: '1-3-1',
    positions: {
      d1: { x: 0.50, y: 0.70 },  // top
      d2: { x: 0.20, y: 0.46 },
      d3: { x: 0.50, y: 0.42 },
      d4: { x: 0.80, y: 0.46 },
      d5: { x: 0.50, y: 0.12 },  // baseline
    },
  },
  {
    id: 'full-court-press',
    name: 'Full Court Press',
    positions: {
      d1: { x: 0.50, y: 0.92 },
      d2: { x: 0.22, y: 0.84 },
      d3: { x: 0.78, y: 0.84 },
      d4: { x: 0.34, y: 0.66 },
      d5: { x: 0.66, y: 0.66 },
    },
  },
  {
    id: 'half-court-trap',
    name: 'Half Court Trap',
    positions: {
      d1: { x: 0.50, y: 0.80 },
      d2: { x: 0.26, y: 0.62 },
      d3: { x: 0.74, y: 0.62 },
      d4: { x: 0.34, y: 0.30 },
      d5: { x: 0.66, y: 0.30 },
    },
  },
]
```

- [ ] **Step 4: Run tests — expect pass**
```bash
npm test
```
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**
```bash
git add src/utils/formations.ts src/utils/formations.test.ts
git commit -m "feat: add 12 preset formation definitions with tests"
```

---

## Task 5: Zustand Store (Setup Phase)

**Files:**
- Create: `src/store/usePlayStore.ts`

- [ ] **Step 1: Write src/store/usePlayStore.ts**
```ts
import { create } from 'zustand'
import type { CourtType, Player, PositionMap, BallState, PlaySet } from '../models/types'

interface SetupDraft {
  name: string
  courtType: CourtType
  offenseCount: number
  defenseCount: number
}

interface PlayStoreState {
  // Setup flow
  setupDraft: SetupDraft
  setSetupDraft: (draft: Partial<SetupDraft>) => void

  // Active set (in editor)
  activeSet: PlaySet | null
  setActiveSet: (set: PlaySet) => void

  // Saved sets
  savedSets: PlaySet[]
  saveSet: (set: PlaySet) => void
  deleteSet: (id: string) => void
  loadSetsFromStorage: () => void

  // Initial position editing (during setup phase 2)
  draftPositions: PositionMap
  setDraftPositions: (positions: PositionMap) => void
  updateDraftPosition: (playerId: string, x: number, y: number) => void

  draftBall: BallState | null
  setDraftBall: (ball: BallState) => void
}

export const usePlayStore = create<PlayStoreState>((set, get) => ({
  setupDraft: {
    name: '',
    courtType: 'half',
    offenseCount: 5,
    defenseCount: 0,
  },
  setSetupDraft: (draft) =>
    set((s) => ({ setupDraft: { ...s.setupDraft, ...draft } })),

  activeSet: null,
  setActiveSet: (activeSet) => set({ activeSet }),

  savedSets: [],
  saveSet: (newSet) => {
    set((s) => {
      const existing = s.savedSets.findIndex((s) => s.id === newSet.id)
      const updated =
        existing >= 0
          ? s.savedSets.map((s) => (s.id === newSet.id ? newSet : s))
          : [...s.savedSets, newSet]
      localStorage.setItem('setplay_sets', JSON.stringify(updated))
      return { savedSets: updated }
    })
  },
  deleteSet: (id) => {
    set((s) => {
      const updated = s.savedSets.filter((s) => s.id !== id)
      localStorage.setItem('setplay_sets', JSON.stringify(updated))
      return { savedSets: updated }
    })
  },
  loadSetsFromStorage: () => {
    try {
      const raw = localStorage.getItem('setplay_sets')
      if (raw) set({ savedSets: JSON.parse(raw) })
    } catch {
      // corrupt storage — ignore
    }
  },

  draftPositions: {},
  setDraftPositions: (draftPositions) => set({ draftPositions }),
  updateDraftPosition: (playerId, x, y) =>
    set((s) => ({
      draftPositions: { ...s.draftPositions, [playerId]: { x, y } },
    })),

  draftBall: null,
  setDraftBall: (draftBall) => set({ draftBall }),
}))
```

- [ ] **Step 2: Commit**
```bash
git add src/store/usePlayStore.ts
git commit -m "feat: add zustand store for setup phase"
```

---

## Task 6: App Router + Page Shells

**Files:**
- Modify: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/pages/HomePage.tsx`
- Create: `src/pages/SetupPage.tsx`
- Create: `src/pages/EditorPage.tsx`

- [ ] **Step 1: Write src/main.tsx**
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

- [ ] **Step 2: Write src/App.tsx**
```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SetupPage from './pages/SetupPage'
import EditorPage from './pages/EditorPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/editor/:setId" element={<EditorPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
```

- [ ] **Step 3: Write src/pages/HomePage.tsx**
```tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayStore } from '../store/usePlayStore'

export default function HomePage() {
  const navigate = useNavigate()
  const { savedSets, deleteSet, loadSetsFromStorage } = usePlayStore()

  useEffect(() => { loadSetsFromStorage() }, [loadSetsFromStorage])

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">SetPlay <span className="text-orange-400">🏀</span></h1>
        <button
          onClick={() => navigate('/setup')}
          className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          + Yeni Set
        </button>
      </div>

      {savedSets.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <div className="text-5xl mb-4">🏀</div>
          <p className="text-lg">Henüz set yok. İlk setini oluştur!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {savedSets.map((s) => (
            <div key={s.id} className="bg-slate-800 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{s.name}</p>
                <p className="text-sm text-slate-400 mt-1">
                  {s.courtType === 'half' ? 'Yarım Kort' : 'Tam Kort'} · {s.actions.length} aksiyon
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/editor/${s.id}`)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Aç
                </button>
                <button
                  onClick={() => { if (confirm('Bu seti silmek istediğinden emin misin?')) deleteSet(s.id) }}
                  className="text-slate-400 hover:text-red-400 px-2 py-2 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Write src/pages/EditorPage.tsx (stub)**
```tsx
export default function EditorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-slate-400">
      <div className="text-center">
        <div className="text-4xl mb-4">🔧</div>
        <p className="text-lg">Editor — Plan 2'de geliyor</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Write src/pages/SetupPage.tsx (stub)**
```tsx
export default function SetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-slate-400">
      <p>Setup — sonraki task'larda tamamlanacak</p>
    </div>
  )
}
```

- [ ] **Step 6: Verify routing**
```bash
npm run dev
```
Navigate to http://localhost:5173 — HomePage renders with "+ Yeni Set" button. Clicking it shows /setup stub.

- [ ] **Step 7: Commit**
```bash
git add src/main.tsx src/App.tsx src/pages/
git commit -m "feat: add app router and page shells"
```

---

## Task 7: Half Court Canvas

**Files:**
- Create: `src/components/court/HalfCourt.tsx`

- [ ] **Step 1: Write src/components/court/HalfCourt.tsx**
```tsx
import { Line, Arc, Circle, Rect } from 'react-konva'
import { HALF_COURT } from '../../utils/courtCoords'

const { basket, keyLeft, keyRight, keyBottom, ftCircle, restricted, threeCornerX, threeCornerY, threeArc } = HALF_COURT

const STROKE = '#4ade80'       // court line color
const STROKE_W = 2

export default function HalfCourt() {
  return (
    <>
      {/* Court outline */}
      <Rect x={0} y={0} width={500} height={470} stroke={STROKE} strokeWidth={STROKE_W} fill="#1a3a1a" />

      {/* Mid-court line */}
      <Line points={[0, 470, 500, 470]} stroke={STROKE} strokeWidth={STROKE_W} />

      {/* Paint / Key */}
      <Rect x={keyLeft} y={0} width={keyRight - keyLeft} height={keyBottom} stroke={STROKE} strokeWidth={STROKE_W} fill="transparent" />

      {/* Free throw circle — top half (inside key) */}
      <Arc
        x={ftCircle.cx} y={ftCircle.cy}
        innerRadius={0} outerRadius={ftCircle.r}
        angle={180} rotation={180}
        stroke={STROKE} strokeWidth={STROKE_W} fill="transparent"
      />
      {/* Free throw circle — bottom half (dashed) */}
      <Arc
        x={ftCircle.cx} y={ftCircle.cy}
        innerRadius={0} outerRadius={ftCircle.r}
        angle={180} rotation={0}
        stroke={STROKE} strokeWidth={STROKE_W} fill="transparent"
        dash={[6, 6]}
      />

      {/* Restricted area arc */}
      <Arc
        x={restricted.cx} y={restricted.cy}
        innerRadius={restricted.r} outerRadius={restricted.r}
        angle={180} rotation={0}
        stroke={STROKE} strokeWidth={STROKE_W}
      />

      {/* 3-point corner lines */}
      <Line points={[threeCornerX.left, 0, threeCornerX.left, threeCornerY]} stroke={STROKE} strokeWidth={STROKE_W} />
      <Line points={[threeCornerX.right, 0, threeCornerX.right, threeCornerY]} stroke={STROKE} strokeWidth={STROKE_W} />

      {/* 3-point arc */}
      <Arc
        x={threeArc.cx} y={threeArc.cy}
        innerRadius={threeArc.r} outerRadius={threeArc.r}
        angle={135} rotation={22}
        stroke={STROKE} strokeWidth={STROKE_W}
      />

      {/* Basket backboard */}
      <Line points={[basket.x - 30, 0, basket.x + 30, 0]} stroke="#f97316" strokeWidth={3} />

      {/* Basket circle */}
      <Circle x={basket.x} y={basket.y} radius={15} stroke="#f97316" strokeWidth={2} fill="transparent" />
    </>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/court/HalfCourt.tsx
git commit -m "feat: add half court canvas shapes"
```

---

## Task 8: Full Court Canvas

**Files:**
- Create: `src/components/court/FullCourt.tsx`

- [ ] **Step 1: Write src/components/court/FullCourt.tsx**
```tsx
import { Line, Arc, Circle, Rect } from 'react-konva'
import { HALF_COURT } from '../../utils/courtCoords'

// Full court = two half courts stacked. Canvas: 500×940.
// Top half: basket at y=53. Bottom half: basket at y=940-53=887.
const STROKE = '#4ade80'
const STROKE_W = 2
const { basket, keyLeft, keyRight, keyBottom, ftCircle, restricted, threeCornerX, threeCornerY, threeArc } = HALF_COURT
const H = 940

export default function FullCourt() {
  return (
    <>
      {/* Court outline */}
      <Rect x={0} y={0} width={500} height={H} stroke={STROKE} strokeWidth={STROKE_W} fill="#1a3a1a" />

      {/* Mid-court line */}
      <Line points={[0, H / 2, 500, H / 2]} stroke={STROKE} strokeWidth={STROKE_W} />

      {/* Mid-court circle */}
      <Circle x={250} y={H / 2} radius={60} stroke={STROKE} strokeWidth={STROKE_W} fill="transparent" />

      {/* ── TOP HALF ── */}
      <Rect x={keyLeft} y={0} width={keyRight - keyLeft} height={keyBottom} stroke={STROKE} strokeWidth={STROKE_W} fill="transparent" />
      <Arc x={ftCircle.cx} y={ftCircle.cy} innerRadius={0} outerRadius={ftCircle.r} angle={180} rotation={180} stroke={STROKE} strokeWidth={STROKE_W} fill="transparent" />
      <Arc x={ftCircle.cx} y={ftCircle.cy} innerRadius={0} outerRadius={ftCircle.r} angle={180} rotation={0} stroke={STROKE} strokeWidth={STROKE_W} fill="transparent" dash={[6, 6]} />
      <Arc x={restricted.cx} y={restricted.cy} innerRadius={restricted.r} outerRadius={restricted.r} angle={180} rotation={0} stroke={STROKE} strokeWidth={STROKE_W} />
      <Line points={[threeCornerX.left, 0, threeCornerX.left, threeCornerY]} stroke={STROKE} strokeWidth={STROKE_W} />
      <Line points={[threeCornerX.right, 0, threeCornerX.right, threeCornerY]} stroke={STROKE} strokeWidth={STROKE_W} />
      <Arc x={threeArc.cx} y={threeArc.cy} innerRadius={threeArc.r} outerRadius={threeArc.r} angle={135} rotation={22} stroke={STROKE} strokeWidth={STROKE_W} />
      <Line points={[basket.x - 30, 0, basket.x + 30, 0]} stroke="#f97316" strokeWidth={3} />
      <Circle x={basket.x} y={basket.y} radius={15} stroke="#f97316" strokeWidth={2} fill="transparent" />

      {/* ── BOTTOM HALF (mirrored: y = H - topY) ── */}
      <Rect x={keyLeft} y={H - keyBottom} width={keyRight - keyLeft} height={keyBottom} stroke={STROKE} strokeWidth={STROKE_W} fill="transparent" />
      <Arc x={ftCircle.cx} y={H - ftCircle.cy} innerRadius={0} outerRadius={ftCircle.r} angle={180} rotation={0} stroke={STROKE} strokeWidth={STROKE_W} fill="transparent" />
      <Arc x={ftCircle.cx} y={H - ftCircle.cy} innerRadius={0} outerRadius={ftCircle.r} angle={180} rotation={180} stroke={STROKE} strokeWidth={STROKE_W} fill="transparent" dash={[6, 6]} />
      <Arc x={restricted.cx} y={H - restricted.cy} innerRadius={restricted.r} outerRadius={restricted.r} angle={180} rotation={180} stroke={STROKE} strokeWidth={STROKE_W} />
      <Line points={[threeCornerX.left, H, threeCornerX.left, H - threeCornerY]} stroke={STROKE} strokeWidth={STROKE_W} />
      <Line points={[threeCornerX.right, H, threeCornerX.right, H - threeCornerY]} stroke={STROKE} strokeWidth={STROKE_W} />
      <Arc x={threeArc.cx} y={H - threeArc.cy} innerRadius={threeArc.r} outerRadius={threeArc.r} angle={135} rotation={180 + 22} stroke={STROKE} strokeWidth={STROKE_W} />
      <Line points={[basket.x - 30, H, basket.x + 30, H]} stroke="#f97316" strokeWidth={3} />
      <Circle x={basket.x} y={H - basket.y} radius={15} stroke="#f97316" strokeWidth={2} fill="transparent" />
    </>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/court/FullCourt.tsx
git commit -m "feat: add full court canvas shapes"
```

---

## Task 9: CourtCanvas Wrapper

**Files:**
- Create: `src/components/court/CourtCanvas.tsx`

- [ ] **Step 1: Write src/components/court/CourtCanvas.tsx**
```tsx
import { Stage, Layer } from 'react-konva'
import type { CourtType } from '../../models/types'
import HalfCourt from './HalfCourt'
import FullCourt from './FullCourt'
import { HALF_COURT_W, HALF_COURT_H, FULL_COURT_H } from '../../utils/courtCoords'

interface Props {
  courtType: CourtType
  children?: React.ReactNode   // players, arrows, etc.
}

export default function CourtCanvas({ courtType, children }: Props) {
  const height = courtType === 'half' ? HALF_COURT_H : FULL_COURT_H

  return (
    <Stage width={HALF_COURT_W} height={height}>
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

- [ ] **Step 2: Commit**
```bash
git add src/components/court/CourtCanvas.tsx
git commit -m "feat: add court canvas wrapper component"
```

---

## Task 10: PlayerNode Component

**Files:**
- Create: `src/components/players/PlayerNode.tsx`

- [ ] **Step 1: Write src/components/players/PlayerNode.tsx**
```tsx
import { Circle, Text, Group } from 'react-konva'
import type Konva from 'konva'
import type { Player, NormalizedPosition } from '../../models/types'
import { denormalize, HALF_COURT_W, HALF_COURT_H, FULL_COURT_H } from '../../utils/courtCoords'

interface Props {
  player: Player
  position: NormalizedPosition
  courtType: 'half' | 'full'
  hasBall?: boolean
  isSelected?: boolean
  onDragEnd: (playerId: string, newPos: NormalizedPosition) => void
  onClick?: (playerId: string) => void
}

const OFFENSE_COLOR = '#f97316'   // orange-500
const DEFENSE_COLOR = '#1d4ed8'   // blue-700
const RADIUS = 20

export default function PlayerNode({ player, position, courtType, hasBall, isSelected, onDragEnd, onClick }: Props) {
  const canvasH = courtType === 'half' ? HALF_COURT_H : FULL_COURT_H
  const { x, y } = denormalize(position.x, position.y, HALF_COURT_W, canvasH)
  const fill = player.team === 'offense' ? OFFENSE_COLOR : DEFENSE_COLOR

  function handleDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
    const node = e.target
    const nx = node.x() / HALF_COURT_W
    const ny = node.y() / canvasH
    onDragEnd(player.id, {
      x: Math.max(0, Math.min(1, nx)),
      y: Math.max(0, Math.min(1, ny)),
    })
  }

  return (
    <Group
      x={x} y={y}
      draggable
      onDragEnd={handleDragEnd}
      onClick={() => onClick?.(player.id)}
    >
      {/* Selection ring */}
      {isSelected && (
        <Circle radius={RADIUS + 5} fill="transparent" stroke="#facc15" strokeWidth={2} />
      )}
      {/* Player circle */}
      <Circle radius={RADIUS} fill={fill} stroke="white" strokeWidth={2} />
      {/* Number label */}
      <Text
        text={String(player.number)}
        fontSize={14} fontStyle="bold"
        fill="white" align="center" verticalAlign="middle"
        x={-RADIUS} y={-RADIUS / 2}
        width={RADIUS * 2}
      />
      {/* Ball indicator */}
      {hasBall && (
        <Circle x={RADIUS - 6} y={-RADIUS + 6} radius={7} fill="#f59e0b" stroke="white" strokeWidth={1.5} />
      )}
    </Group>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/players/PlayerNode.tsx
git commit -m "feat: add draggable player node component"
```

---

## Task 11: FormationPicker Component

**Files:**
- Create: `src/components/setup/FormationPicker.tsx`

- [ ] **Step 1: Write src/components/setup/FormationPicker.tsx**
```tsx
import type { FormationPreset } from '../../utils/formations'
import { OFFENSE_FORMATIONS, DEFENSE_FORMATIONS } from '../../utils/formations'

interface Props {
  team: 'offense' | 'defense'
  onSelect: (formation: FormationPreset) => void
  selectedId?: string
}

export default function FormationPicker({ team, onSelect, selectedId }: Props) {
  const formations = team === 'offense' ? OFFENSE_FORMATIONS : DEFENSE_FORMATIONS

  return (
    <div>
      <p className="text-sm text-slate-400 mb-3">
        {team === 'offense' ? 'Hücum Dizilimi' : 'Savunma Dizilimi'} seç veya elle yerleştir
      </p>
      <div className="grid grid-cols-3 gap-2">
        {formations.map((f) => (
          <button
            key={f.id}
            onClick={() => onSelect(f)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-colors border
              ${selectedId === f.id
                ? 'bg-orange-500 border-orange-400 text-white'
                : 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600'
              }
            `}
          >
            {f.name}
          </button>
        ))}
        <button
          onClick={() => onSelect({ id: 'custom', name: 'Elle Yerleştir', positions: {} })}
          className={`
            px-3 py-2 rounded-lg text-sm font-medium transition-colors border
            ${selectedId === 'custom'
              ? 'bg-slate-500 border-slate-400 text-white'
              : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
            }
          `}
        >
          Elle Yerleştir
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/setup/FormationPicker.tsx
git commit -m "feat: add formation picker component"
```

---

## Task 12: PlayerSetup Component

**Files:**
- Create: `src/components/setup/PlayerSetup.tsx`

- [ ] **Step 1: Write src/components/setup/PlayerSetup.tsx**
```tsx
interface Props {
  offenseCount: number
  defenseCount: number
  onChange: (offense: number, defense: number) => void
}

function CountSelector({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-slate-300 text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors"
        >−</button>
        <span className="text-2xl font-bold text-white w-6 text-center">{value}</span>
        <button
          onClick={() => onChange(Math.min(5, value + 1))}
          className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors"
        >+</button>
      </div>
    </div>
  )
}

export default function PlayerSetup({ offenseCount, defenseCount, onChange }: Props) {
  return (
    <div className="flex gap-10 justify-center">
      <CountSelector
        label="Hücum 🟠"
        value={offenseCount}
        onChange={(v) => onChange(v, defenseCount)}
      />
      <CountSelector
        label="Savunma 🔵"
        value={defenseCount}
        onChange={(v) => onChange(offenseCount, v)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/setup/PlayerSetup.tsx
git commit -m "feat: add player count selector component"
```

---

## Task 13: SetupPage Integration

**Files:**
- Modify: `src/pages/SetupPage.tsx`

- [ ] **Step 1: Write full src/pages/SetupPage.tsx**
```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { nanoid } from 'nanoid' // install below
import CourtCanvas from '../components/court/CourtCanvas'
import PlayerNode from '../components/players/PlayerNode'
import PlayerSetup from '../components/setup/PlayerSetup'
import FormationPicker from '../components/setup/FormationPicker'
import { usePlayStore } from '../store/usePlayStore'
import { OFFENSE_FORMATIONS, DEFENSE_FORMATIONS } from '../utils/formations'
import type { Player, PositionMap, NormalizedPosition, PlaySet } from '../models/types'
import type { FormationPreset } from '../utils/formations'

// Install nanoid first (Step 0)

type Step = 'info' | 'positions' | 'ball'

function buildPlayers(offenseCount: number, defenseCount: number): Player[] {
  const players: Player[] = []
  for (let i = 1; i <= offenseCount; i++)
    players.push({ id: `o${i}`, number: i as 1|2|3|4|5, team: 'offense' })
  for (let i = 1; i <= defenseCount; i++)
    players.push({ id: `d${i}`, number: i as 1|2|3|4|5, team: 'defense' })
  return players
}

function defaultPositions(players: Player[]): PositionMap {
  // Spread players across mid-court if no formation selected
  const offPlayers = players.filter(p => p.team === 'offense')
  const defPlayers = players.filter(p => p.team === 'defense')
  const map: PositionMap = {}
  offPlayers.forEach((p, i) => {
    map[p.id] = { x: (i + 1) / (offPlayers.length + 1), y: 0.7 }
  })
  defPlayers.forEach((p, i) => {
    map[p.id] = { x: (i + 1) / (defPlayers.length + 1), y: 0.4 }
  })
  return map
}

export default function SetupPage() {
  const navigate = useNavigate()
  const { setupDraft, setSetupDraft, draftPositions, setDraftPositions,
          updateDraftPosition, draftBall, setDraftBall, saveSet } = usePlayStore()

  const [step, setStep] = useState<Step>('info')
  const [selectedOffFormation, setSelectedOffFormation] = useState<string | undefined>()
  const [selectedDefFormation, setSelectedDefFormation] = useState<string | undefined>()

  const players = buildPlayers(setupDraft.offenseCount, setupDraft.defenseCount)

  function handleFormationSelect(team: 'offense' | 'defense', formation: FormationPreset) {
    if (team === 'offense') setSelectedOffFormation(formation.id)
    else setSelectedDefFormation(formation.id)

    if (formation.id === 'custom') return

    const merged = { ...draftPositions }
    Object.entries(formation.positions).forEach(([key, pos]) => {
      merged[key] = pos
    })
    setDraftPositions(merged)
  }

  function handleReady() {
    if (!draftBall) {
      alert('Topu bir oyuncuya ver!')
      return
    }
    const set: PlaySet = {
      id: nanoid(),
      name: setupDraft.name || 'İsimsiz Set',
      courtType: setupDraft.courtType,
      players,
      initialPositions: draftPositions,
      initialBall: draftBall,
      actions: [],
    }
    saveSet(set)
    navigate(`/editor/${set.id}`)
  }

  // ── Step: Info ────────────────────────────────────────────────
  if (step === 'info') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-white">Yeni Set</h2>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">Set İsmi</label>
            <input
              value={setupDraft.name}
              onChange={(e) => setSetupDraft({ name: e.target.value })}
              placeholder="örn. Horns, Blob, 5-Out Motion"
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">Kort Tipi</label>
            <div className="flex gap-3">
              {(['half', 'full'] as const).map((ct) => (
                <button
                  key={ct}
                  onClick={() => setSetupDraft({ courtType: ct })}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors border ${
                    setupDraft.courtType === ct
                      ? 'bg-orange-500 border-orange-400 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {ct === 'half' ? 'Yarım Kort' : 'Tam Kort'}
                </button>
              ))}
            </div>
          </div>

          <PlayerSetup
            offenseCount={setupDraft.offenseCount}
            defenseCount={setupDraft.defenseCount}
            onChange={(o, d) => setSetupDraft({ offenseCount: o, defenseCount: d })}
          />

          <button
            onClick={() => {
              setDraftPositions(defaultPositions(players))
              setStep('positions')
            }}
            className="w-full bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            İleri →
          </button>
        </div>
      </div>
    )
  }

  // ── Step: Positions ───────────────────────────────────────────
  if (step === 'positions') {
    return (
      <div className="min-h-screen flex flex-col items-center p-6 gap-6">
        <h2 className="text-xl font-bold text-white">Başlangıç Dizilimi</h2>

        <div className="w-full max-w-sm space-y-4">
          {setupDraft.offenseCount > 0 && (
            <FormationPicker
              team="offense"
              selectedId={selectedOffFormation}
              onSelect={(f) => handleFormationSelect('offense', f)}
            />
          )}
          {setupDraft.defenseCount > 0 && (
            <FormationPicker
              team="defense"
              selectedId={selectedDefFormation}
              onSelect={(f) => handleFormationSelect('defense', f)}
            />
          )}
        </div>

        <CourtCanvas courtType={setupDraft.courtType}>
          {players.map((p) => {
            const pos = draftPositions[p.id] ?? { x: 0.5, y: 0.5 }
            return (
              <PlayerNode
                key={p.id}
                player={p}
                position={pos}
                courtType={setupDraft.courtType}
                onDragEnd={(id, newPos) => updateDraftPosition(id, newPos.x, newPos.y)}
              />
            )
          })}
        </CourtCanvas>

        <p className="text-slate-400 text-sm">Oyuncuları sürükleyerek pozisyonlarını ayarla</p>

        <div className="flex gap-4">
          <button onClick={() => setStep('info')} className="text-slate-400 hover:text-white transition-colors">
            ← Geri
          </button>
          <button
            onClick={() => setStep('ball')}
            className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-2 rounded-xl transition-colors"
          >
            İleri →
          </button>
        </div>
      </div>
    )
  }

  // ── Step: Ball assignment ────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center p-6 gap-6">
      <h2 className="text-xl font-bold text-white">Topu Ver</h2>
      <p className="text-slate-400 text-sm">Başlangıçta topu kimin tutacağını seç</p>

      <CourtCanvas courtType={setupDraft.courtType}>
        {players.map((p) => {
          const pos = draftPositions[p.id] ?? { x: 0.5, y: 0.5 }
          return (
            <PlayerNode
              key={p.id}
              player={p}
              position={pos}
              courtType={setupDraft.courtType}
              hasBall={draftBall?.holderId === p.id}
              isSelected={draftBall?.holderId === p.id}
              onDragEnd={() => {}}
              onClick={(id) => setDraftBall({ holderId: id })}
            />
          )
        })}
      </CourtCanvas>

      <div className="flex gap-4">
        <button onClick={() => setStep('positions')} className="text-slate-400 hover:text-white transition-colors">
          ← Geri
        </button>
        <button
          onClick={handleReady}
          className="bg-green-600 hover:bg-green-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Hazır ✓
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 0 (before Step 1): Install nanoid**
```bash
npm install nanoid
```

- [ ] **Step 2: Verify full setup flow**
```bash
npm run dev
```
Test path:
1. Home page → "+ Yeni Set"
2. Fill set name, choose court type, set player counts
3. Click "İleri" → Formation picker + court appears, players visible
4. Select a formation → players jump to formation positions
5. Drag a player → position updates
6. Click "İleri" → ball assignment screen
7. Click a player → ball indicator appears on that player
8. Click "Hazır" → redirected to editor stub
9. Go back to home → set appears in the list

- [ ] **Step 3: Commit**
```bash
git add src/pages/SetupPage.tsx
git commit -m "feat: complete setup flow with formation picker and court preview"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All items from DESIGN.md Aşama 1 and Aşama 2 are covered. Aşama 3–5 are deferred to Plans 2–3 by design.
- [x] **Placeholder scan:** No TBD/TODO in plan. All steps have actual code.
- [x] **Type consistency:** `Player`, `PositionMap`, `NormalizedPosition`, `PlaySet`, `BallState` used consistently across tasks. `denormalize` signature matches usage in `PlayerNode`.
- [x] **nanoid dependency:** Added as Step 0 in Task 13 before it's used.
- [x] **Formation positions:** Keys `o1–o5` / `d1–d5` match the `buildPlayers()` id generation in SetupPage.
