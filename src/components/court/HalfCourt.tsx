import { Line, Arc, Circle, Rect } from 'react-konva'
import { HALF_COURT, HALF_COURT_W, HALF_COURT_H, COURT_SCALE } from '../../utils/courtCoords'
import { COURT_THEMES, type CourtTheme } from '../../config/courtThemes'

const { basket, keyLeft, keyRight, keyBottom, ftCircle, restricted, threeCornerX, threeCornerY, threeArc } = HALF_COURT

const STROKE_W = 2
const S = COURT_SCALE

interface Props {
  theme?: CourtTheme
}

export default function HalfCourt({ theme = COURT_THEMES.classic }: Props) {
  const line = theme.line
  const floorProps = theme.floorGradient
    ? {
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientEndPoint: { x: HALF_COURT_W, y: HALF_COURT_H },
        fillLinearGradientColorStops: [0, theme.floorGradient[0], 1, theme.floorGradient[1]],
      }
    : { fill: theme.floor }

  return (
    <>
      <Rect x={0} y={0} width={HALF_COURT_W} height={HALF_COURT_H} stroke={line} strokeWidth={STROKE_W} {...floorProps} />

      <Line points={[0, HALF_COURT_H, HALF_COURT_W, HALF_COURT_H]} stroke={line} strokeWidth={STROKE_W} />

      <Rect x={keyLeft} y={0} width={keyRight - keyLeft} height={keyBottom} stroke={line} strokeWidth={STROKE_W} fill={theme.key} />

      <Arc
        x={ftCircle.cx} y={ftCircle.cy}
        innerRadius={0} outerRadius={ftCircle.r}
        angle={180} rotation={180}
        stroke={line} strokeWidth={STROKE_W} fill="transparent"
      />
      <Arc
        x={ftCircle.cx} y={ftCircle.cy}
        innerRadius={0} outerRadius={ftCircle.r}
        angle={180} rotation={0}
        stroke={line} strokeWidth={STROKE_W} fill="transparent"
        dash={[6, 6]}
      />

      <Arc
        x={restricted.cx} y={restricted.cy}
        innerRadius={restricted.r} outerRadius={restricted.r}
        angle={180} rotation={0}
        stroke={line} strokeWidth={STROKE_W}
      />

      <Line points={[threeCornerX.left, 0, threeCornerX.left, threeCornerY]} stroke={line} strokeWidth={STROKE_W} />
      <Line points={[threeCornerX.right, 0, threeCornerX.right, threeCornerY]} stroke={line} strokeWidth={STROKE_W} />

      <Arc
        x={threeArc.cx} y={threeArc.cy}
        innerRadius={threeArc.r} outerRadius={threeArc.r}
        angle={136} rotation={22}
        stroke={line} strokeWidth={STROKE_W}
      />

      {/* Block marks */}
      <Line points={[keyLeft - S*15, S*100, keyLeft, S*100]} stroke={line} strokeWidth={STROKE_W} />
      <Line points={[keyRight, S*100, keyRight + S*15, S*100]} stroke={line} strokeWidth={STROKE_W} />
      <Line points={[keyLeft - S*15, S*135, keyLeft, S*135]} stroke={line} strokeWidth={STROKE_W} />
      <Line points={[keyRight, S*135, keyRight + S*15, S*135]} stroke={line} strokeWidth={STROKE_W} />

      {/* Post rectangles */}
      <Rect x={keyLeft - S*15} y={S*50} width={S*15} height={S*20} stroke={line} strokeWidth={STROKE_W} fill="transparent" />
      <Rect x={keyRight} y={S*50} width={S*15} height={S*20} stroke={line} strokeWidth={STROKE_W} fill="transparent" />

      <Line points={[basket.x - S*30, 0, basket.x + S*30, 0]} stroke={theme.basket} strokeWidth={3} />
      <Circle x={basket.x} y={basket.y} radius={S*15} stroke={theme.basket} strokeWidth={2} fill="transparent" />
    </>
  )
}
