import { Line, Arc, Circle, Rect, Group, Text } from 'react-konva'
import { HALF_COURT, HALF_COURT_W, FULL_COURT_H, COURT_SCALE } from '../../utils/courtCoords'
import { COURT_THEMES, type CourtTheme } from '../../config/courtThemes'

const STROKE_W = 2
const { basket, keyLeft, keyRight, keyBottom, ftCircle, restricted, threeCornerX, threeCornerY, threeArc } = HALF_COURT
const H = FULL_COURT_H
const S = COURT_SCALE

interface Props {
  attackBasket?: 'top' | 'bottom'
  theme?: CourtTheme
}

export default function FullCourt({ attackBasket, theme = COURT_THEMES.classic }: Props) {
  const line = theme.line
  const floorProps = theme.floorGradient
    ? {
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientEndPoint: { x: HALF_COURT_W, y: H },
        fillLinearGradientColorStops: [0, theme.floorGradient[0], 1, theme.floorGradient[1]],
      }
    : { fill: theme.floor }

  const ATK = '#f97316'
  const DEF = '#60a5fa'
  const topColor    = attackBasket === 'top' ? ATK : attackBasket === 'bottom' ? DEF : ATK
  const bottomColor = attackBasket === 'bottom' ? ATK : attackBasket === 'top' ? DEF : ATK
  const topLabel    = attackBasket === 'top' ? 'ATK' : attackBasket === 'bottom' ? 'DEF' : null
  const bottomLabel = attackBasket === 'bottom' ? 'ATK' : attackBasket === 'top' ? 'DEF' : null

  return (
    <>
      <Rect x={0} y={0} width={HALF_COURT_W} height={H} stroke={line} strokeWidth={STROKE_W} {...floorProps} />

      <Line points={[0, H / 2, HALF_COURT_W, H / 2]} stroke={line} strokeWidth={STROKE_W} />
      <Circle x={HALF_COURT_W / 2} y={H / 2} radius={S*60} stroke={line} strokeWidth={STROKE_W} fill="transparent" />

      {/* Top half */}
      <Rect x={keyLeft} y={0} width={keyRight - keyLeft} height={keyBottom} stroke={line} strokeWidth={STROKE_W} fill={theme.key} />
      <Arc x={ftCircle.cx} y={ftCircle.cy} innerRadius={0} outerRadius={ftCircle.r} angle={180} rotation={180} stroke={line} strokeWidth={STROKE_W} fill="transparent" />
      <Arc x={ftCircle.cx} y={ftCircle.cy} innerRadius={0} outerRadius={ftCircle.r} angle={180} rotation={0} stroke={line} strokeWidth={STROKE_W} fill="transparent" dash={[6, 6]} />
      <Arc x={restricted.cx} y={restricted.cy} innerRadius={restricted.r} outerRadius={restricted.r} angle={180} rotation={0} stroke={line} strokeWidth={STROKE_W} />
      <Line points={[threeCornerX.left, 0, threeCornerX.left, threeCornerY]} stroke={line} strokeWidth={STROKE_W} />
      <Line points={[threeCornerX.right, 0, threeCornerX.right, threeCornerY]} stroke={line} strokeWidth={STROKE_W} />
      <Arc x={threeArc.cx} y={threeArc.cy} innerRadius={threeArc.r} outerRadius={threeArc.r} angle={136} rotation={22} stroke={line} strokeWidth={STROKE_W} />
      {/* Block marks — top */}
      <Line points={[keyLeft - S*15, S*100, keyLeft, S*100]} stroke={line} strokeWidth={STROKE_W} />
      <Line points={[keyRight, S*100, keyRight + S*15, S*100]} stroke={line} strokeWidth={STROKE_W} />
      <Line points={[keyLeft - S*15, S*135, keyLeft, S*135]} stroke={line} strokeWidth={STROKE_W} />
      <Line points={[keyRight, S*135, keyRight + S*15, S*135]} stroke={line} strokeWidth={STROKE_W} />
      <Rect x={keyLeft - S*15} y={S*50} width={S*15} height={S*20} stroke={line} strokeWidth={STROKE_W} fill="transparent" />
      <Rect x={keyRight} y={S*50} width={S*15} height={S*20} stroke={line} strokeWidth={STROKE_W} fill="transparent" />
      <Line points={[basket.x - S*30, 0, basket.x + S*30, 0]} stroke={topColor} strokeWidth={3} />
      <Circle x={basket.x} y={basket.y} radius={S*15} stroke={topColor} strokeWidth={2} fill="transparent" />
      {topLabel && (
        <Group x={basket.x} y={basket.y + 72} rotation={90} listening={false}>
          <Text text={topLabel} fill={topColor} fontSize={11} fontStyle="bold"
            offsetX={12} offsetY={7} width={24} height={14} align="center" />
        </Group>
      )}

      {/* Bottom half (mirrored) */}
      <Rect x={keyLeft} y={H - keyBottom} width={keyRight - keyLeft} height={keyBottom} stroke={line} strokeWidth={STROKE_W} fill={theme.key} />
      <Arc x={ftCircle.cx} y={H - ftCircle.cy} innerRadius={0} outerRadius={ftCircle.r} angle={180} rotation={0} stroke={line} strokeWidth={STROKE_W} fill="transparent" />
      <Arc x={ftCircle.cx} y={H - ftCircle.cy} innerRadius={0} outerRadius={ftCircle.r} angle={180} rotation={180} stroke={line} strokeWidth={STROKE_W} fill="transparent" dash={[6, 6]} />
      <Arc x={restricted.cx} y={H - restricted.cy} innerRadius={restricted.r} outerRadius={restricted.r} angle={180} rotation={180} stroke={line} strokeWidth={STROKE_W} />
      <Line points={[threeCornerX.left, H, threeCornerX.left, H - threeCornerY]} stroke={line} strokeWidth={STROKE_W} />
      <Line points={[threeCornerX.right, H, threeCornerX.right, H - threeCornerY]} stroke={line} strokeWidth={STROKE_W} />
      <Arc x={threeArc.cx} y={H - threeArc.cy} innerRadius={threeArc.r} outerRadius={threeArc.r} angle={136} rotation={180 + 22} stroke={line} strokeWidth={STROKE_W} />
      {/* Block marks — bottom */}
      <Line points={[keyLeft - S*15, H - S*100, keyLeft, H - S*100]} stroke={line} strokeWidth={STROKE_W} />
      <Line points={[keyRight, H - S*100, keyRight + S*15, H - S*100]} stroke={line} strokeWidth={STROKE_W} />
      <Line points={[keyLeft - S*15, H - S*135, keyLeft, H - S*135]} stroke={line} strokeWidth={STROKE_W} />
      <Line points={[keyRight, H - S*135, keyRight + S*15, H - S*135]} stroke={line} strokeWidth={STROKE_W} />
      <Rect x={keyLeft - S*15} y={H - S*70} width={S*15} height={S*20} stroke={line} strokeWidth={STROKE_W} fill="transparent" />
      <Rect x={keyRight} y={H - S*70} width={S*15} height={S*20} stroke={line} strokeWidth={STROKE_W} fill="transparent" />
      <Line points={[basket.x - S*30, H, basket.x + S*30, H]} stroke={bottomColor} strokeWidth={3} />
      <Circle x={basket.x} y={H - basket.y} radius={S*15} stroke={bottomColor} strokeWidth={2} fill="transparent" />
      {bottomLabel && (
        <Group x={basket.x} y={H - basket.y - 72} rotation={90} listening={false}>
          <Text text={bottomLabel} fill={bottomColor} fontSize={11} fontStyle="bold"
            offsetX={12} offsetY={7} width={24} height={14} align="center" />
        </Group>
      )}
    </>
  )
}
