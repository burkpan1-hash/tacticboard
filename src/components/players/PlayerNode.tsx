import { useRef } from 'react'
import { Circle, Text, Group } from 'react-konva'
import type Konva from 'konva'
import type { Player, NormalizedPosition, PositionMap } from '../../models/types'
import { denormalize, HALF_COURT_W, HALF_COURT_H, FULL_COURT_H, COURT_SCALE, COURT_PADDING_X, COURT_PADDING_Y, HALF_COURT_PADDING_TOP } from '../../utils/courtCoords'

interface Props {
  player: Player
  position: NormalizedPosition
  courtType: 'half' | 'full'
  landscape?: boolean
  hasBall?: boolean
  /** Normalized positions of all players (incl. self); lets the name avoid sitting on another player. */
  allPositions?: PositionMap
  showBallDrop?: boolean
  isSelected?: boolean
  draggable?: boolean
  onDragStart?: (playerId: string) => void
  onDragMove?: (playerId: string, pos: NormalizedPosition) => void
  onDragEnd: (playerId: string, newPos: NormalizedPosition) => void
  onClick?: (playerId: string) => void
  onDblClick?: (playerId: string) => void
}

const OFFENSE_COLOR = '#f97316'
const DEFENSE_COLOR = '#1d4ed8'

export default function PlayerNode({ player, position, courtType, landscape, hasBall, allPositions, showBallDrop, isSelected, draggable = true, onDragStart, onDragMove, onDragEnd, onClick, onDblClick }: Props) {
  const canvasH = courtType === 'half' ? HALF_COURT_H : FULL_COURT_H
  const RADIUS = Math.round((courtType === 'half' ? 17 : 20) * COURT_SCALE)
  const FONT_SIZE = courtType === 'half' ? 12 : 14
  const { x, y } = denormalize(position.x, position.y, HALF_COURT_W, canvasH)
  const fill = player.color ?? (player.team === 'offense' ? OFFENSE_COLOR : DEFENSE_COLOR)
  const groupRef = useRef<Konva.Group | null>(null)

  // Allow the player to roam the entire faded OOB padding zone around the court.
  // Clamp at the outer edge of that zone so dropping in the truly black area beyond the
  // stage snaps the player back to a reachable position.
  function norm(node: Konva.Node): NormalizedPosition {
    const maxOobX = COURT_PADDING_X / HALF_COURT_W
    const topPad = courtType === 'half' ? HALF_COURT_PADDING_TOP : COURT_PADDING_Y
    const maxOobYTop = topPad / canvasH
    const maxOobYBot = COURT_PADDING_Y / canvasH
    return {
      x: Math.max(-maxOobX, Math.min(1 + maxOobX, node.x() / HALF_COURT_W)),
      y: Math.max(-maxOobYTop, Math.min(1 + maxOobYBot, node.y() / canvasH)),
    }
  }

  function dragBound(pos: { x: number; y: number }) {
    const stage = groupRef.current?.getStage()
    if (!stage) return pos
    const sw = stage.width(), sh = stage.height()
    let minX = RADIUS, maxX = sw - RADIUS
    let minY = RADIUS, maxY = sh - RADIUS

    // Also clamp to the visible clipping ancestor (so half-court players can't be dragged
    // into the portion of the OOB padding that's hidden behind the editor layout's overflow-hidden).
    const container = stage.container()
    const clipper = container.closest('.overflow-hidden') as HTMLElement | null
    if (clipper) {
      const canvasRect = container.getBoundingClientRect()
      const clipRect = clipper.getBoundingClientRect()
      const visTop    = Math.max(0,  clipRect.top    - canvasRect.top)
      const visBottom = Math.min(sh, clipRect.bottom - canvasRect.top)
      const visLeft   = Math.max(0,  clipRect.left   - canvasRect.left)
      const visRight  = Math.min(sw, clipRect.right  - canvasRect.left)
      minX = Math.max(minX, visLeft   + RADIUS)
      maxX = Math.min(maxX, visRight  - RADIUS)
      minY = Math.max(minY, visTop    + RADIUS)
      maxY = Math.min(maxY, visBottom - RADIUS)
    }

    return {
      x: Math.max(minX, Math.min(maxX, pos.x)),
      y: Math.max(minY, Math.min(maxY, pos.y)),
    }
  }

  // ── Name label placement ────────────────────────────────────────────────────
  // Pick the freest cardinal side so the name doesn't sit on top of another player.
  // Computed in the shared (pre-rotation) court pixel frame, so it's correct for both
  // half-court and the rotated full-court view (overlap is rotation-invariant).
  const NAME_FONT = 13
  const NAME_W = 80
  const NAME_H = 18
  const ringExtra = hasBall ? 8 : 0            // ball ring outer radius ≈ RADIUS + 8.5
  const vDist = RADIUS + ringExtra + 4 + NAME_H / 2
  const hDist = RADIUS + ringExtra + 4 + NAME_W / 2
  const nameSides = [
    { cx: 0,      cy: vDist,  align: 'center' as const }, // below (default)
    { cx: 0,      cy: -vDist, align: 'center' as const }, // above
    { cx: hDist,  cy: 0,      align: 'left'   as const }, // right
    { cx: -hDist, cy: 0,      align: 'right'  as const }, // left
  ]
  const otherCenters = allPositions
    ? Object.entries(allPositions)
        .filter(([id]) => id !== player.id)
        .map(([, p]) => {
          const o = denormalize(p.x, p.y, HALF_COURT_W, canvasH)
          return { dx: o.x - x, dy: o.y - y }
        })
    : []
  const sideClearance = (side: { cx: number; cy: number }) => {
    let minD = Infinity
    for (const o of otherCenters) {
      const d = Math.hypot(side.cx - o.dx, side.cy - o.dy)
      if (d < minD) minD = d
    }
    return minD
  }
  // Default is always "below" (the original spot). Only relocate when the name would
  // overlap another player there; then move to whichever side has the most room
  // (iteration order keeps the below > above > right > left preference on ties).
  const SAFE_DIST = RADIUS + NAME_H / 2 + 2
  let namePos = nameSides[0]
  if (sideClearance(nameSides[0]) < SAFE_DIST) {
    let bestClear = sideClearance(nameSides[0])
    for (const side of nameSides) {
      const c = sideClearance(side)
      if (c > bestClear) { bestClear = c; namePos = side }
    }
  }

  return (
    <Group
      ref={groupRef}
      x={x} y={y}
      draggable={draggable}
      dragBoundFunc={dragBound}
      onDragStart={() => onDragStart?.(player.id)}
      onDragMove={(e) => onDragMove?.(player.id, norm(e.target))}
      onDragEnd={(e) => {
        const newPos = norm(e.target)
        const clamped = denormalize(newPos.x, newPos.y, HALF_COURT_W, canvasH)
        e.target.x(clamped.x)
        e.target.y(clamped.y)
        onDragEnd(player.id, newPos)
      }}
      onClick={() => onClick?.(player.id)}
      onDblClick={() => onDblClick?.(player.id)}
      onTap={() => onClick?.(player.id)}
      onDblTap={() => onDblClick?.(player.id)}
    >
      {isSelected && (
        <Circle radius={RADIUS + 5} fill="transparent" stroke="#facc15" strokeWidth={2} />
      )}
      <Circle radius={RADIUS} fill={fill} stroke="white" strokeWidth={2} />
      {landscape ? (
        // Counter-rotate +90° to cancel the parent Group's -90° rotation — net 0° (upright)
        <Text
          text={String(player.number)}
          fontSize={FONT_SIZE} fontStyle="bold"
          fill="white" align="center" verticalAlign="middle"
          x={0} y={0}
          offsetX={RADIUS} offsetY={RADIUS}
          width={RADIUS * 2} height={RADIUS * 2}
          rotation={90}
        />
      ) : (
        <Text
          text={String(player.number)}
          fontSize={FONT_SIZE} fontStyle="bold"
          fill="white" align="center" verticalAlign="middle"
          x={-RADIUS} y={-RADIUS}
          width={RADIUS * 2} height={RADIUS * 2}
        />
      )}
      {player.name && (
        <Text
          text={player.name}
          fontSize={NAME_FONT} fontStyle="bold"
          fill="white"
          stroke="#0f172a" strokeWidth={3}
          fillAfterStrokeEnabled
          align={namePos.align} verticalAlign="middle"
          width={NAME_W} height={NAME_H}
          offsetX={NAME_W / 2} offsetY={NAME_H / 2}
          x={namePos.cx} y={namePos.cy}
          rotation={landscape ? 90 : 0}
          listening={false}
        />
      )}
      {hasBall && (
        <>
          <Circle radius={RADIUS + 7} stroke="#f59e0b" strokeWidth={3} fill="transparent" />
          <Circle x={RADIUS - 5} y={-RADIUS + 5} radius={6} fill="#f59e0b" stroke="white" strokeWidth={1.5} />
        </>
      )}
      {showBallDrop && !hasBall && (
        <>
          <Circle radius={RADIUS + 7} stroke="#f59e0b" strokeWidth={3} fill="transparent" />
          <Circle x={RADIUS - 5} y={-RADIUS + 5} radius={7} fill="#22c55e" stroke="white" strokeWidth={1.5} />
          <Text text="+" fontSize={9} fontStyle="bold" fill="white"
            x={RADIUS - 5 - 5} y={-RADIUS + 5 - 5} width={10} height={10}
            align="center" verticalAlign="middle" listening={false} />
        </>
      )}
    </Group>
  )
}
