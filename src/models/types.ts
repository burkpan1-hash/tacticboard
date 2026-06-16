export type CourtType = 'half' | 'full'
export type Team = 'offense' | 'defense'
export type ActionType = 'pass' | 'cut' | 'dribble' | 'screen' | 'shot' | 'handoff' | 'defense-move' | 'double-team' | 'ball-force'

export interface NormalizedPosition {
  x: number  // 0–1 relative to canvas width
  y: number  // 0–1 relative to canvas height
}

export type PositionMap = Record<string, NormalizedPosition>

export interface Player {
  id: string          // 'o1'–'o5' offense, 'd1'–'d5' defense — stable across number/name edits
  number: number      // jersey number (0–99); default derived from id suffix at setup
  team: Team
  name?: string       // optional jersey name shown under the circle (e.g. "Jordan"); blank ⇒ only number shown
  color?: string      // optional marker fill override (hex); blank ⇒ team default (offense orange / defense blue)
}

export interface BallState {
  holderId: string
}

// ── Actions ─────────────────────────────────────────
// optionText: if set, animation pauses ~2s after this action completes
// and shows a text badge near the ball holder on the canvas.
interface ActionBase { id: string; optionText?: string }

export interface PassAction         extends ActionBase { type: 'pass';         fromId: string; toId: string }
export interface CutAction          extends ActionBase { type: 'cut';          playerId: string; toPosition: NormalizedPosition; waypoints?: NormalizedPosition[] }
export interface DribbleAction      extends ActionBase { type: 'dribble';      playerId: string; toPosition: NormalizedPosition; waypoints?: NormalizedPosition[] }
export interface ScreenAction       extends ActionBase { type: 'screen';       screenerId: string; screenPosition: NormalizedPosition }
export interface ShotAction         extends ActionBase { type: 'shot';         shooterId: string }
export interface HandoffAction      extends ActionBase { type: 'handoff';      fromId: string; toId: string; meetPosition: NormalizedPosition }
export interface DefenseMoveAction  extends ActionBase { type: 'defense-move'; playerId: string; toPosition: NormalizedPosition; waypoints?: NormalizedPosition[] }
export interface DoubleTeamAction   extends ActionBase { type: 'double-team';  defender1Id: string; defender2Id: string; targetId: string }
export interface BallForceAction    extends ActionBase { type: 'ball-force';   defenderId: string; targetId: string; angle: number }

export type Action =
  | PassAction | CutAction | DribbleAction
  | ScreenAction | ShotAction | HandoffAction | DefenseMoveAction
  | DoubleTeamAction | BallForceAction

// ── Action Group ─────────────────────────────────────────────────────────────
// A group of actions that all animate simultaneously in a single step.
export interface ActionGroup {
  id: string
  type: 'group'
  name?: string
  optionText?: string
  actions: Action[]
}

export type ActionItem = Action | ActionGroup

export interface PlaySet {
  id: string
  name: string
  courtType: CourtType
  attackBasket?: 'top' | 'bottom'   // full court only — which end offense attacks (y=0=top, y=1=bottom)
  players: Player[]
  initialPositions: PositionMap
  initialBall: BallState
  actions: ActionItem[]
  markings?: Record<string, string>  // defenderId → offensePlayerId
  hiddenArrowTeams?: Team[]  // teams whose action arrows + labels are hidden (players still move)
  cloudPlayId?: string  // server-side play id once persisted — drives PUT-vs-POST in handleSave
}
