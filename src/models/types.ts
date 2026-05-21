export type CourtType = 'half' | 'full'
export type Team = 'offense' | 'defense'
export type ActionType = 'pass' | 'cut' | 'dribble' | 'screen' | 'shot' | 'handoff' | 'defense-move'

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
export interface CutAction          { id: string; type: 'cut';          playerId: string; toPosition: NormalizedPosition;               optionText?: string }
export interface DribbleAction      { id: string; type: 'dribble';      playerId: string; toPosition: NormalizedPosition; waypoints?: NormalizedPosition[]; optionText?: string }
export interface ScreenAction       { id: string; type: 'screen';       screenerId: string; screenPosition: NormalizedPosition;         optionText?: string }
export interface ShotAction         { id: string; type: 'shot';         shooterId: string;                                              optionText?: string }
export interface HandoffAction      { id: string; type: 'handoff';      fromId: string; toId: string; meetPosition: NormalizedPosition; optionText?: string }
export interface DefenseMoveAction  { id: string; type: 'defense-move'; playerId: string; toPosition: NormalizedPosition;               optionText?: string }

export type Action =
  | PassAction | CutAction | DribbleAction
  | ScreenAction | ShotAction | HandoffAction | DefenseMoveAction

export interface PlaySet {
  id: string
  name: string
  courtType: CourtType
  players: Player[]
  initialPositions: PositionMap
  initialBall: BallState
  actions: Action[]
  markings?: Record<string, string>  // defenderId → offensePlayerId
}
