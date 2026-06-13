import type Konva from 'konva'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../i18n'
import CourtCanvas from '../court/CourtCanvas'
import PlayScene from '../court/PlayScene'
import type { PlaySet } from '../../models/types'
import type { FrameState } from '../../utils/frameState'

/** Render at 2x so downscaling to the target canvas stays crisp. */
export const EXPORT_SCALE = 2

interface Props {
  set: PlaySet
  frame: FrameState
  basketY: number
  cH: number
  stageRef: React.RefObject<Konva.Stage | null>
}

export default function ExportStage({ set, frame, basketY, cH, stageRef }: Props) {
  return (
    <I18nextProvider i18n={i18n}>
      <CourtCanvas
        courtType={set.courtType}
        attackBasket={set.attackBasket}
        scale={EXPORT_SCALE}
        landscape={set.courtType === 'full'}
        stageRef={stageRef}
      >
        <PlayScene set={set} frame={frame} basketY={basketY} cH={cH} />
      </CourtCanvas>
    </I18nextProvider>
  )
}
