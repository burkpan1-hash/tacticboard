import type { ActionType } from '../models/types'

export const ACTION_COLORS: Record<ActionType, string> = {
  pass:    '#fbbf24',  // amber
  dribble: '#818cf8',  // indigo
  cut:     '#f472b6',  // pink  (changed from green — too close to court)
  screen:  '#38bdf8',  // sky blue
  shot:    '#f87171',  // coral red
  handoff: '#fb923c',  // orange
}
