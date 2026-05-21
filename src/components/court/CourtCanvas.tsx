import { Stage, Layer, Group } from 'react-konva'
import type { CourtType } from '../../models/types'
import HalfCourt from './HalfCourt'
import FullCourt from './FullCourt'
import { HALF_COURT_W, HALF_COURT_H, FULL_COURT_H, COURT_PADDING_X } from '../../utils/courtCoords'

interface Props {
  courtType: CourtType
  children?: React.ReactNode
}

export default function CourtCanvas({ courtType, children }: Props) {
  const height = courtType === 'half' ? HALF_COURT_H : FULL_COURT_H

  return (
    <Stage width={HALF_COURT_W + 2 * COURT_PADDING_X} height={height}>
      <Layer>
        <Group x={COURT_PADDING_X}>
          {courtType === 'half' ? <HalfCourt /> : <FullCourt />}
        </Group>
      </Layer>
      <Layer>
        <Group x={COURT_PADDING_X}>
          {children}
        </Group>
      </Layer>
    </Stage>
  )
}
