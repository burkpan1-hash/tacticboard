import { Stage, Layer, Group } from 'react-konva'
import type Konva from 'konva'
import type { CourtType } from '../../models/types'
import HalfCourt from './HalfCourt'
import FullCourt from './FullCourt'
import { HALF_COURT_W, HALF_COURT_H, FULL_COURT_H, COURT_PADDING_X, COURT_PADDING_Y, HALF_COURT_PADDING_TOP } from '../../utils/courtCoords'

interface Props {
  courtType: CourtType
  attackBasket?: 'top' | 'bottom'
  children?: React.ReactNode
  stageRef?: React.RefObject<Konva.Stage | null>
  scale?: number
  landscape?: boolean
  onStageClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onMouseMove?: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onMouseDown?: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onMouseUp?: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onMouseLeave?: () => void
}

const STAGE_W = HALF_COURT_W + 2 * COURT_PADDING_X  // 784

export default function CourtCanvas({
  courtType, attackBasket, children, stageRef,
  scale = 1, landscape = false,
  onStageClick, onMouseMove, onMouseDown, onMouseUp, onMouseLeave,
}: Props) {
  const events = { onClick: onStageClick, onMouseMove, onMouseDown, onMouseUp, onMouseLeave }

  // Portrait (half court or non-landscape full court)
  if (!landscape) {
    const height = courtType === 'half' ? HALF_COURT_H : FULL_COURT_H
    const topPad = courtType === 'half' ? HALF_COURT_PADDING_TOP : COURT_PADDING_Y
    return (
      <Stage ref={stageRef} width={STAGE_W * scale} height={(height + topPad + COURT_PADDING_Y) * scale} scaleX={scale} scaleY={scale} {...events}>
        <Layer>
          <Group x={COURT_PADDING_X} y={topPad}>
            {courtType === 'half' ? <HalfCourt /> : <FullCourt attackBasket={attackBasket} />}
          </Group>
        </Layer>
        <Layer>
          <Group x={COURT_PADDING_X} y={topPad}>{children}</Group>
        </Layer>
      </Stage>
    )
  }

  // Landscape: Stage is (FULL_COURT_H + 2*COURT_PADDING_Y) × STAGE_W (rotated dimensions).
  // y={COURT_PADDING_Y} on inner Groups: after -90° rotation, local y → landscape x,
  // shifting baselines inward by COURT_PADDING_Y to make room for OOB zone on both sides.
  return (
    <Stage
      ref={stageRef}
      width={(FULL_COURT_H + 2 * COURT_PADDING_Y) * scale}
      height={STAGE_W * scale}
      scaleX={scale}
      scaleY={scale}
      {...events}
    >
      <Layer>
        <Group y={STAGE_W} rotation={-90}>
          <Group x={COURT_PADDING_X} y={COURT_PADDING_Y}>
            <FullCourt />
          </Group>
        </Group>
      </Layer>
      <Layer>
        <Group y={STAGE_W} rotation={-90}>
          <Group x={COURT_PADDING_X} y={COURT_PADDING_Y}>
            {children}
          </Group>
        </Group>
      </Layer>
    </Stage>
  )
}
