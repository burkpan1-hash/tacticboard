import type { PositionMap } from '../models/types'

export interface FormationPreset {
  id: string
  name: string
  positions: PositionMap   // keys: 'o1'–'o5' or 'd1'–'d5'
}

// Positions are normalized (0–1) relative to half-court canvas (500×470)
// y=0 is baseline (top), y=1 is mid-court (bottom)

export const OFFENSE_FORMATIONS: FormationPreset[] = [
  {
    id: 'five-out',
    name: '5-Out',
    positions: {
      o1: { x: 0.50, y: 0.72 },
      o2: { x: 0.82, y: 0.55 },
      o3: { x: 0.90, y: 0.28 },
      o4: { x: 0.10, y: 0.28 },
      o5: { x: 0.18, y: 0.55 },
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
      o5: { x: 0.50, y: 0.18 },
    },
  },
  {
    id: 'one-four-high',
    name: '1-4 High',
    positions: {
      o1: { x: 0.50, y: 0.76 },
      o2: { x: 0.72, y: 0.52 },
      o3: { x: 0.28, y: 0.52 },
      o4: { x: 0.70, y: 0.40 },
      o5: { x: 0.30, y: 0.40 },
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
      o4: { x: 0.64, y: 0.44 },
      o5: { x: 0.36, y: 0.44 },
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
      d1: { x: 0.50, y: 0.70 },
      d2: { x: 0.20, y: 0.46 },
      d3: { x: 0.50, y: 0.42 },
      d4: { x: 0.80, y: 0.46 },
      d5: { x: 0.50, y: 0.12 },
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
