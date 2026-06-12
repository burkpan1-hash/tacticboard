import type { Action, ActionType } from '../models/types'

export type GroupConflictReason =
  | 'SHOT_IN_GROUP'
  | 'BALL_ACTION_CONFLICT'
  | 'PLAYER_ALREADY_IN_GROUP'

// Returns the offense player IDs involved in an action.
// Defense actions return [] — no offense restrictions apply to them.
function offensePlayersOf(action: Action): string[] {
  switch (action.type) {
    case 'pass':    return [action.fromId, action.toId]
    case 'handoff': return [action.fromId, action.toId]
    case 'dribble': return [action.playerId]
    case 'cut':     return [action.playerId]
    case 'screen':  return [action.screenerId]
    case 'shot':    return [action.shooterId]
    default:        return []
  }
}

function isBallAction(action: Action): boolean {
  return action.type === 'pass' || action.type === 'dribble' || action.type === 'handoff'
}

/**
 * Validate an action TYPE the moment it is selected (before the user picks
 * a target player). Catches ball-action conflicts and shot immediately so
 * the user doesn't waste clicks completing an action that will be rejected.
 *
 * Only ball-level rules apply here; player-occupancy checks require a
 * complete action and are handled in validateGroupAction.
 */
export function validateGroupActionType(
  type: ActionType,
  existingActions: Action[],
): GroupConflictReason | null {
  if (type === 'shot') return 'SHOT_IN_GROUP'
  const isBallType = type === 'pass' || type === 'dribble' || type === 'handoff'
  if (isBallType && existingActions.some(isBallAction)) return 'BALL_ACTION_CONFLICT'
  return null
}

/**
 * Validate whether `newAction` can be added to a group that already
 * contains `existingActions`.
 *
 * Rules (offense only — defense has no restrictions yet):
 *  1. Shot can never be in a group.
 *  2. At most one ball action (pass / dribble / handoff) per group.
 *  3. Each offense player can appear in at most one action per group.
 */
export function validateGroupAction(
  newAction: Action,
  existingActions: Action[],
): GroupConflictReason | null {
  if (newAction.type === 'shot') return 'SHOT_IN_GROUP'

  if (isBallAction(newAction) && existingActions.some(isBallAction))
    return 'BALL_ACTION_CONFLICT'

  const newPlayers = offensePlayersOf(newAction)
  if (newPlayers.length > 0) {
    const occupied = new Set(existingActions.flatMap(offensePlayersOf))
    for (const pid of newPlayers) {
      if (occupied.has(pid)) return 'PLAYER_ALREADY_IN_GROUP'
    }
  }

  return null
}

/**
 * Validate a whole batch of actions to be grouped together at once
 * (used by post-hoc grouping).
 */
export function validateGroupActions(actions: Action[]): GroupConflictReason | null {
  const checked: Action[] = []
  for (const action of actions) {
    const reason = validateGroupAction(action, checked)
    if (reason) return reason
    checked.push(action)
  }
  return null
}
