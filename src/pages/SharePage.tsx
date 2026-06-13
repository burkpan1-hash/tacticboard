import { useEffect, useRef, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePlayStore } from '../store/usePlayStore'
import CourtCanvas from '../components/court/CourtCanvas'
import PlaybackControls from '../components/playback/PlaybackControls'
import { computeFrameState } from '../utils/frameState'
import {
  HALF_COURT_W, HALF_COURT_H, FULL_COURT_H,
  COURT_PADDING_X, COURT_PADDING_Y, HALF_COURT_PADDING_TOP,
  HALF_COURT,
} from '../utils/courtCoords'
import type { PlaySet } from '../models/types'
import UserButton from '../components/ui/UserButton'
import PlayScene from '../components/court/PlayScene'

const STAGE_W = HALF_COURT_W + 2 * COURT_PADDING_X
const BASKET_PX = HALF_COURT.basket.y                // 42 — basket y inside court, not padding
const STEP_MS = 1600


export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { setActiveSet, activeSet, activeStep, isPlaying, setIsPlaying, playbackSpeed } = usePlayStore()
  const [title, setTitle] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  // Scale computation
  const courtAreaRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    function measure() {
      const el = courtAreaRef.current
      if (!el) return
      const { width, height } = el.getBoundingClientRect()
      if (width > 0 && height > 0) setContainerSize({ width, height })
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (courtAreaRef.current) ro.observe(courtAreaRef.current)
    return () => ro.disconnect()
  }, [])

  const scale = useMemo(() => {
    const { width, height } = containerSize
    if (!width || !height || !activeSet) return 1
    if (activeSet.courtType === 'full') {
      const stageW = FULL_COURT_H + 2 * COURT_PADDING_Y
      const stageH = STAGE_W
      return Math.min(1, (width - 8) / stageW, (height - 8) / stageH)
    }
    const stageH = HALF_COURT_H + HALF_COURT_PADDING_TOP + COURT_PADDING_Y
    return Math.min(1, (width - 8) / STAGE_W, (height - 8) / stageH)
  }, [containerSize, activeSet])

  // Smooth playback animation loop (identical to EditorPage)
  const [animFraction, setAnimFraction] = useState(0)
  const animFractionRef = useRef(0)
  const rafRef = useRef<number>(0)
  const lastTsRef = useRef<number>(0)

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current)
      animFractionRef.current = 0
      lastTsRef.current = 0
      setAnimFraction(0)
      return
    }
    const total = usePlayStore.getState().activeSet?.actions.length ?? 0
    if (usePlayStore.getState().activeStep >= total) {
      setIsPlaying(false)
      return
    }
    function tick(ts: number) {
      const dt = lastTsRef.current ? ts - lastTsRef.current : 0
      lastTsRef.current = ts
      const speed = usePlayStore.getState().playbackSpeed
      const next = Math.min(1, animFractionRef.current + dt / (STEP_MS / speed))
      animFractionRef.current = next
      setAnimFraction(next)
      if (next >= 1) {
        const s = usePlayStore.getState()
        const newStep = s.activeStep + 1
        const tot = s.activeSet?.actions.length ?? 0
        s.setActiveStep(newStep)
        animFractionRef.current = 0
        lastTsRef.current = 0
        setAnimFraction(0)
        if (newStep >= tot) { s.setIsPlaying(false); return }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, setIsPlaying, playbackSpeed])

  // Fetch play data
  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null }
        return r.json()
      })
      .then((play) => {
        if (!play) return
        setTitle(play.title)
        setActiveSet(play.data as PlaySet)
      })
      .finally(() => setLoading(false))
  }, [token, setActiveSet])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-slate-400">{t('common.loading')}</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-900">
        <p className="text-slate-400 text-lg">{t('share.notFound')}</p>
        <button onClick={() => navigate('/')} className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-2 rounded-lg">
          {t('share.homeButton')}
        </button>
      </div>
    )
  }

  if (!activeSet) return null

  const cH = activeSet.courtType === 'half' ? HALF_COURT_H : FULL_COURT_H
  const basketY = activeSet.courtType === 'half'
    ? BASKET_PX / HALF_COURT_H
    : (activeSet.attackBasket === 'bottom' ? 1 - BASKET_PX / FULL_COURT_H : BASKET_PX / FULL_COURT_H)
  const frame = computeFrameState(
    activeSet, activeStep, animFraction, isPlaying, basketY, cH,
  )

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
        <h1 className="text-white font-semibold truncate mr-4">{title}</h1>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-slate-500 bg-slate-700 px-3 py-1 rounded-full">{t('common.readOnly')}</span>
          <UserButton />
        </div>
      </div>

      <div ref={courtAreaRef} className="flex-1 flex items-center justify-center overflow-hidden bg-slate-950">
        <CourtCanvas
          courtType={activeSet.courtType}
          attackBasket={activeSet.attackBasket}
          scale={scale}
          landscape={activeSet.courtType === 'full'}
        >
          <PlayScene set={activeSet} frame={frame} basketY={basketY} cH={cH} />
        </CourtCanvas>
      </div>

      <div className="shrink-0">
        <PlaybackControls />
      </div>
    </div>
  )
}
