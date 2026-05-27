import type { ActionType } from '../models/types'

export const ACTION_COLORS: Record<ActionType, string> = {
  pass:           '#fbbf24',  // amber
  dribble:        '#818cf8',  // indigo
  cut:            '#f472b6',  // pink
  screen:         '#38bdf8',  // sky blue
  shot:           '#f87171',  // coral red
  handoff:        '#fb923c',  // orange
  'defense-move': '#60a5fa',  // light blue
  'double-team':  '#7c3aed',  // violet
  'ball-force':   '#d946ef',  // magenta
}

export const ACTION_LABELS: Record<ActionType, string> = {
  pass:           'Pass',
  dribble:        'Dribble',
  cut:            'Cut',
  screen:         'Screen',
  shot:           'Shot',
  handoff:        'Handoff',
  'defense-move': 'Move',
  'double-team':  'Double',
  'ball-force':   'Force',
}
