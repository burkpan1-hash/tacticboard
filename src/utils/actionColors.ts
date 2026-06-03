import type { Action, ActionType } from '../models/types'

/**
 * Returns the player most semantically tied to an action — used to anchor the
 * optionText label badge. Previously the badge was always pinned to whoever
 * held the ball after the action, which was wrong for non-ball actions
 * (cut/screen/defense-move/etc) — the label appeared on a player who had
 * nothing to do with what the coach was annotating.
 *
 * Choice rules:
 *  - pass/handoff: receiver (toId) — the new ball location is the action's outcome
 *  - cut/dribble/defense-move: the moving player
 *  - screen: the screener
 *  - shot: the shooter
 *  - double-team: the helper (defender2) — the action's defining participant
 *  - ball-force: the defender doing the forcing
 */
export function actionLabelPlayerId(action: Action): string {
  switch (action.type) {
    case 'pass':         return action.toId
    case 'cut':          return action.playerId
    case 'dribble':      return action.playerId
    case 'screen':       return action.screenerId
    case 'shot':         return action.shooterId
    case 'handoff':      return action.toId
    case 'defense-move': return action.playerId
    case 'double-team':  return action.defender2Id
    case 'ball-force':   return action.defenderId
  }
}

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

export const ACTION_LABEL_KEYS: Record<ActionType, string> = {
  pass:           'action.pass',
  dribble:        'action.dribble',
  cut:            'action.cut',
  screen:         'action.screen',
  shot:           'action.shot',
  handoff:        'action.handoff',
  'defense-move': 'action.defenseMove',
  'double-team':  'action.doubleTeam',
  'ball-force':   'action.ballForce',
}
