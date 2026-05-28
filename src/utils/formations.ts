import type { PositionMap } from '../models/types'

export interface FormationPreset {
  id: string
  name: string
  nameKey: string
  positions: PositionMap   // keys: 'o1'–'o5' or 'd1'–'d5' or both
  courtOnly?: 'half' | 'full'
  defaultBallHolder?: string         // auto-assign ball to this player when formation is selected
  attackBasket?: 'top' | 'bottom'   // auto-set attack direction when formation is selected
}

// Positions are normalized relative to court canvas (500×470 half-court, 500×940 full-court)
// y=0 is top baseline, y=1 is bottom baseline (or mid-court for half)
// y slightly outside 0–1 is allowed for out-of-bounds inbound positions

export const OFFENSE_FORMATIONS: FormationPreset[] = [
  {
    id: 'five-out',
    name: '5-Out',
    nameKey: 'formation.fiveOut',
    courtOnly: 'half',
    positions: {
      o1: { x: 0.50, y: 0.72 },
      o2: { x: 0.91, y: 0.54 },
      o3: { x: 0.09, y: 0.54 },
      o4: { x: 0.96, y: 0.15 },
      o5: { x: 0.04, y: 0.15 },
    },
  },
  {
    id: 'four-out-one-in',
    name: '4-Out 1-In',
    nameKey: 'formation.fourOutOneIn',
    courtOnly: 'half',
    positions: {
      o1: { x: 0.35, y: 0.69 },
      o2: { x: 0.65, y: 0.69 },
      o3: { x: 0.05, y: 0.41 },
      o4: { x: 0.90, y: 0.40 },
      o5: { x: 0.33, y: 0.16 },
    },
  },
  {
    id: 'one-four-high',
    name: '1-4 High',
    nameKey: 'formation.oneFourHigh',
    courtOnly: 'half',
    positions: {
      o1: { x: 0.50, y: 0.76 },
      o2: { x: 0.96, y: 0.48 },
      o3: { x: 0.04, y: 0.48 },
      o4: { x: 0.34, y: 0.48 },
      o5: { x: 0.66, y: 0.48 },
    },
  },
  {
    id: 'horns',
    name: 'Horns',
    nameKey: 'formation.horns',
    courtOnly: 'half',
    positions: {
      o1: { x: 0.50, y: 0.72 },
      o2: { x: 0.04, y: 0.11 },
      o3: { x: 0.96, y: 0.11 },
      o4: { x: 0.35, y: 0.54 },
      o5: { x: 0.65, y: 0.54 },
    },
  },
  {
    id: 'high-post',
    name: 'High Post',
    nameKey: 'formation.highPost',
    courtOnly: 'half',
    positions: {
      o1: { x: 0.32, y: 0.76 },
      o2: { x: 0.68, y: 0.76 },
      o3: { x: 0.06, y: 0.48 },
      o4: { x: 0.94, y: 0.48 },
      o5: { x: 0.50, y: 0.54 },
    },
  },
  {
    id: 'double-post',
    name: 'Double Post',
    nameKey: 'formation.doublePost',
    courtOnly: 'half',
    positions: {
      o1: { x: 0.50, y: 0.73 },
      o2: { x: 0.94, y: 0.48 },
      o3: { x: 0.06, y: 0.48 },
      o4: { x: 0.33, y: 0.18 },
      o5: { x: 0.67, y: 0.18 },
    },
  },
]

export const DEFENSE_FORMATIONS: FormationPreset[] = [
  {
    id: 'man-to-man',
    name: 'Man-to-Man',
    nameKey: 'formation.manToMan',
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
    nameKey: 'formation.twoThreeZone',
    courtOnly: 'half',
    positions: {
      d1: { x: 0.35, y: 0.40 },
      d2: { x: 0.65, y: 0.40 },
      d3: { x: 0.23, y: 0.18 },
      d4: { x: 0.50, y: 0.18 },
      d5: { x: 0.77, y: 0.18 },
    },
  },
  {
    id: 'three-two-zone',
    name: '3-2 Zone',
    nameKey: 'formation.threeZoneTwo',
    courtOnly: 'half',
    positions: {
      d1: { x: 0.50, y: 0.40 },
      d2: { x: 0.22, y: 0.40 },
      d3: { x: 0.78, y: 0.40 },
      d4: { x: 0.34, y: 0.17 },
      d5: { x: 0.66, y: 0.17 },
    },
  },
  {
    id: 'one-three-one',
    name: '1-3-1 Zone',
    nameKey: 'formation.oneThreeOneZone',
    courtOnly: 'half',
    positions: {
      d1: { x: 0.50, y: 0.55 },
      d2: { x: 0.79, y: 0.32 },
      d3: { x: 0.21, y: 0.32 },
      d4: { x: 0.50, y: 0.19 },
      d5: { x: 0.50, y: 0.32 },
    },
  },
  {
    id: 'two-one-two-zone',
    name: '2-1-2 Zone',
    nameKey: 'formation.twoOneTwoZone',
    courtOnly: 'half',
    positions: {
      d1: { x: 0.34, y: 0.46 },
      d2: { x: 0.66, y: 0.46 },
      d3: { x: 0.66, y: 0.15 },
      d4: { x: 0.34, y: 0.15 },
      d5: { x: 0.50, y: 0.29 },
    },
  },
  {
    id: 'one-two-two-zone',
    name: '1-2-2 Zone',
    nameKey: 'formation.oneTwoTwoZone',
    courtOnly: 'half',
    positions: {
      d1: { x: 0.50, y: 0.52 },
      d2: { x: 0.32, y: 0.36 },
      d3: { x: 0.68, y: 0.36 },
      d4: { x: 0.32, y: 0.15 },
      d5: { x: 0.68, y: 0.15 },
    },
  },
  {
    id: 'one-three-one-press',
    name: '1-3-1 Press',
    nameKey: 'formation.oneThreeOnePress',
    courtOnly: 'full',
    attackBasket: 'bottom',
    defaultBallHolder: 'o3',
    positions: {
      d1: { x: 0.50, y: 0.78 },
      d2: { x: 0.50, y: 0.46 },
      d3: { x: 0.86, y: 0.50 },
      d4: { x: 0.14, y: 0.50 },
      d5: { x: 0.50, y: 0.22 },
      o3: { x: 0.20, y: -0.03 },
      o1: { x: 0.25, y: 0.13 },
      o2: { x: 0.50, y: 0.50 },
      o4: { x: 0.75, y: 0.76 },
      o5: { x: 0.25, y: 0.76 },
    },
  },
  {
    id: 'one-two-one-one-press',
    name: '1-2-1-1 Press',
    nameKey: 'formation.oneTwoOneOnePress',
    courtOnly: 'full',
    attackBasket: 'bottom',
    defaultBallHolder: 'o4',
    positions: {
      d1: { x: 0.50, y: 0.12 },
      d2: { x: 0.20, y: 0.28 },
      d3: { x: 0.80, y: 0.28 },
      d4: { x: 0.50, y: 0.42 },
      d5: { x: 0.50, y: 0.75 },
      o4: { x: 0.50, y: -0.03 },
      o1: { x: 0.18, y: 0.20 },
      o2: { x: 0.82, y: 0.20 },
      o3: { x: 0.50, y: 0.38 },
      o5: { x: 0.50, y: 0.60 },
    },
  },
]
