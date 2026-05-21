import { Line, Arc, Circle, Rect } from 'react-konva'
import { HALF_COURT } from '../../utils/courtCoords'

const { basket, keyLeft, keyRight, keyBottom, ftCircle, restricted, threeCornerX, threeCornerY, threeArc } = HALF_COURT

const STROKE = '#4ade80'
const STROKE_W = 2

export default function HalfCourt() {
  return (
    <>
      <Rect x={0} y={0} width={500} height={470} stroke={STROKE} strokeWidth={STROKE_W} fill="#1a3a1a" />

      <Line points={[0, 470, 500, 470]} stroke={STROKE} strokeWidth={STROKE_W} />

      <Rect x={keyLeft} y={0} width={keyRight - keyLeft} height={keyBottom} stroke={STROKE} strokeWidth={STROKE_W} fill="transparent" />

      <Arc
        x={ftCircle.cx} y={ftCircle.cy}
        innerRadius={0} outerRadius={ftCircle.r}
        angle={180} rotation={180}
        stroke={STROKE} strokeWidth={STROKE_W} fill="transparent"
      />
      <Arc
        x={ftCircle.cx} y={ftCircle.cy}
        innerRadius={0} outerRadius={ftCircle.r}
        angle={180} rotation={0}
        stroke={STROKE} strokeWidth={STROKE_W} fill="transparent"
        dash={[6, 6]}
      />

      <Arc
        x={restricted.cx} y={restricted.cy}
        innerRadius={restricted.r} outerRadius={restricted.r}
        angle={180} rotation={0}
        stroke={STROKE} strokeWidth={STROKE_W}
      />

      <Line points={[threeCornerX.left, 0, threeCornerX.left, threeCornerY]} stroke={STROKE} strokeWidth={STROKE_W} />
      <Line points={[threeCornerX.right, 0, threeCornerX.right, threeCornerY]} stroke={STROKE} strokeWidth={STROKE_W} />

      <Arc
        x={threeArc.cx} y={threeArc.cy}
        innerRadius={threeArc.r} outerRadius={threeArc.r}
        angle={136} rotation={22}
        stroke={STROKE} strokeWidth={STROKE_W}
      />

      {/* Block marks — low post and mid post (moved away from restricted arc) */}
      <Line points={[keyLeft - 15, 100, keyLeft, 100]} stroke={STROKE} strokeWidth={STROKE_W} />
      <Line points={[keyRight, 100, keyRight + 15, 100]} stroke={STROKE} strokeWidth={STROKE_W} />
      <Line points={[keyLeft - 15, 135, keyLeft, 135]} stroke={STROKE} strokeWidth={STROKE_W} />
      <Line points={[keyRight, 135, keyRight + 15, 135]} stroke={STROKE} strokeWidth={STROKE_W} />

      {/* Post rectangles at restricted arc level */}
      <Rect x={keyLeft - 15} y={50} width={15} height={20} stroke={STROKE} strokeWidth={STROKE_W} fill="transparent" />
      <Rect x={keyRight} y={50} width={15} height={20} stroke={STROKE} strokeWidth={STROKE_W} fill="transparent" />

      <Line points={[basket.x - 30, 0, basket.x + 30, 0]} stroke="#f97316" strokeWidth={3} />
      <Circle x={basket.x} y={basket.y} radius={15} stroke="#f97316" strokeWidth={2} fill="transparent" />
    </>
  )
}
