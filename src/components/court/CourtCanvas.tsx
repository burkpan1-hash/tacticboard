import { Stage, Layer } from 'react-konva'
import type { CourtType } from '../../models/types'
import HalfCourt from './HalfCourt'
import FullCourt from './FullCourt'
import { HALF_COURT_W, HALF_COURT_H, FULL_COURT_H } from '../../utils/courtCoords'

interface Props {
  courtType: CourtType
  children?: React.ReactNode
}

export default function CourtCanvas({ courtType, children }: Props) {
  const height = courtType === 'half' ? HALF_COURT_H : FULL_COURT_H

  return (
    <Stage width={HALF_COURT_W} height={height}>
      <Layer>
        {courtType === 'half' ? <HalfCourt /> : <FullCourt />}
      </Layer>
      <Layer>
        {children}
      </Layer>
    </Stage>
  )
}
