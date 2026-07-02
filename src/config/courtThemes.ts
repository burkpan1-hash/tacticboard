// Court color themes. ONLY colors change between themes — geometry, lines, and
// every marking stay identical. `classic` reproduces the original hardcoded
// colors exactly, so it is the safe default (and what the video export uses,
// since ExportStage renders CourtCanvas without a theme prop).
export interface CourtTheme {
  id: string
  label: string
  /** Representative color shown in the theme picker chip. */
  swatch: string
  /** Court lines / markings. */
  line: string
  /** Basket rim (half court). */
  basket: string
  /** Painted lane/key fill. 'transparent' = no paint (classic). */
  key: string
  /** Out-of-bounds background around the court. */
  oob: string
  /** Court floor fill (solid). */
  floor: string
  /** Optional linear gradient [from, to] for the floor (wood sheen). */
  floorGradient?: [string, string]
}

export const COURT_THEMES: Record<string, CourtTheme> = {
  // ── Original look — DO NOT change these values (matches current court + export) ──
  classic: {
    id: 'classic', label: 'Classic', swatch: '#1a3a1a',
    line: '#4ade80', basket: '#f97316', key: 'transparent',
    oob: '#1e2820', floor: '#1a3a1a',
  },
  // ── Realistic warm hardwood + white lines + blue painted lane ──
  hardwood: {
    id: 'hardwood', label: 'Hardwood', swatch: '#d98a3f',
    line: '#ffffff', basket: '#d24d22', key: '#3f6fa3',
    oob: '#8a5526', floor: '#d98a3f', floorGradient: ['#e8ac63', '#c47e34'],
  },
  hardwoodDark: {
    id: 'hardwoodDark', label: 'Hardwood Dark', swatch: '#b06a28',
    line: '#f4efe6', basket: '#c0431d', key: '#345f8c',
    oob: '#5e3c15', floor: '#b06a28', floorGradient: ['#c8843c', '#9a591d'],
  },
  // ── Brand dark + orange (clean, less "digital green") ──
  slate: {
    id: 'slate', label: 'Slate', swatch: '#0f172a',
    line: '#f97316', basket: '#f97316', key: '#1e293b',
    oob: '#0a0e1a', floor: '#0f172a',
  },
}

export const DEFAULT_COURT_THEME = 'classic'
export const COURT_THEME_LIST = Object.values(COURT_THEMES)
