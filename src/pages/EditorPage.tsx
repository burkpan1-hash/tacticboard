import { useEffect, useRef, useState } from 'react'
import type Konva from 'konva'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { nanoid } from 'nanoid'
import { useTranslation } from 'react-i18next'
import { Line, Group, Rect, Text, Arrow } from 'react-konva'
import CourtCanvas from '../components/court/CourtCanvas'
import PlayerNode from '../components/players/PlayerNode'
import ActionOverlay from '../components/actions/ActionOverlay'
import ActionPreview from '../components/actions/ActionPreview'
import ActionToolbar from '../components/toolbar/ActionToolbar'
import ActionPanel from '../components/actions/ActionPanel'
import PlaybackControls from '../components/playback/PlaybackControls'
import ExportModal from '../components/export/ExportModal'
import PlayerEditModal from '../components/players/PlayerEditModal'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import UserButton from '../components/ui/UserButton'
import TutorialOverlay from '../components/ui/TutorialOverlay'
import { usePlayStore } from '../store/usePlayStore'
import { computeStateAtStep } from '../utils/stateEngine'
import { denormalize } from '../utils/courtCoords'
import type { Action, ActionType, NormalizedPosition, Player, PlaySet, PositionMap } from '../models/types'
import { HALF_COURT_W, HALF_COURT_H, FULL_COURT_H, COURT_PADDING_X, COURT_PADDING_Y, HALF_COURT_PADDING_TOP, HALF_COURT } from '../utils/courtCoords'
import { ACTION_COLORS, ACTION_LABEL_KEYS, actionLabelPlayerId } from '../utils/actionColors'
import { authClient } from '../lib/authClient'
import { useEditorShortcuts } from '../hooks/useEditorShortcuts'

// Stable signature of the user-visible play state — used for dirty tracking.
// Excludes technical metadata (id, cloudPlayId) that doesn't represent user-authored changes.
function playSignature(s: PlaySet | null | undefined): string {
  if (!s) return ''
  return JSON.stringify({
    name: s.name,
    actions: s.actions,
    initialPositions: s.initialPositions,
    initialBall: s.initialBall,
    markings: s.markings,
    attackBasket: s.attackBasket,
  })
}

// Returns the start/end pixel coords of the arrow's direction vector (for label placement)
function arrowLine(action: Action, positions: PositionMap, cH: number, basketPxY: number): { x1: number; y1: number; x2: number; y2: number } | null {
  const px = (id: string) => { const p = positions[id]; return p ? denormalize(p.x, p.y, HALF_COURT_W, cH) : null }
  const pp = (p: NormalizedPosition) => denormalize(p.x, p.y, HALF_COURT_W, cH)
  switch (action.type) {
    case 'pass':        { const f = px(action.fromId), t = px(action.toId); if (!f || !t) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'cut':         { const f = px(action.playerId), t = pp(action.toPosition); if (!f) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'screen':      { const f = px(action.screenerId), t = pp(action.screenPosition); if (!f) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'shot':        { const f = px(action.shooterId); if (!f) return null; return { x1: f.x, y1: f.y, x2: HALF_COURT.basket.x, y2: basketPxY } }
    case 'handoff':     { const f = px(action.fromId), t = pp(action.meetPosition); if (!f) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'defense-move':{ const f = px(action.playerId), t = pp(action.toPosition); if (!f) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'double-team': { const f = px(action.defender1Id), t = px(action.targetId); if (!f || !t) return null; return { x1: f.x, y1: f.y, x2: t.x, y2: t.y } }
    case 'ball-force': {
      const f = px(action.defenderId); const target = positions[action.targetId]
      if (!f || !target) return null
      const DEFENDER_PX = 77
      const tPx = pp(target)
      return { x1: f.x, y1: f.y, x2: tPx.x + Math.cos(action.angle) * DEFENDER_PX, y2: tPx.y + Math.sin(action.angle) * DEFENDER_PX }
    }
    case 'dribble': {
      const f = px(action.playerId); if (!f) return null
      if (action.waypoints && action.waypoints.length > 0) {
        const mid = pp(action.waypoints[Math.floor(action.waypoints.length / 2)])
        return { x1: f.x, y1: f.y, x2: mid.x, y2: mid.y }
      }
      const t = pp(action.toPosition); return { x1: f.x, y1: f.y, x2: t.x, y2: t.y }
    }
  }
}

// Pick the candidate position (midpoint ± perpendicular offset) farthest from all players
function smartLabelCenter(
  x1: number, y1: number, x2: number, y2: number,
  playersPx: Array<{ x: number; y: number }>,
): { cx: number; cy: number } {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const perpX = -dy / len, perpY = dx / len

  function minDist(cx: number, cy: number) {
    if (!playersPx.length) return Infinity
    return Math.min(...playersPx.map(p => Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2)))
  }

  let bestCx = mx + perpX * 16, bestCy = my + perpY * 16, bestScore = -1
  for (const offset of [16, 22, 30]) {
    for (const sign of [1, -1] as const) {
      const cx = mx + perpX * offset * sign
      const cy = my + perpY * offset * sign
      const score = minDist(cx, cy)
      if (score > bestScore) { bestScore = score; bestCx = cx; bestCy = cy }
    }
  }
  return { cx: bestCx, cy: bestCy }
}

export default function EditorPage() {
  const { t } = useTranslation()
  const { setId } = useParams<{ setId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isCloudPlay = searchParams.get('cloud') === '1'
  const {
    savedSets, activeSet, setActiveSet,
    activeStep,
    actionCreation, startActionCreation, setPendingSource, cancelActionCreation,
    addAction, addPlayerToCourt, removePlayerFromCourt, setInitialBall, updateInitialPosition, updateMarkings, saveSet, updatePlayer,
    flipAttackBasket,
    isPlaying, setIsPlaying,
  } = usePlayStore()

  const courtAreaRef = useRef<HTMLDivElement>(null)
  const benchRef = useRef<HTMLDivElement>(null)
  const lastMousePos = useRef({ x: 0, y: 0 })
  const [courtScale, setCourtScale] = useState(1)
  const [markingsEnabled, setMarkingsEnabled] = useState(false)
  const [mousePos, setMousePos] = useState<NormalizedPosition | null>(null)
  const [animFraction, setAnimFraction] = useState(0)
  const animFractionRef = useRef(0)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)
  // Signature of the last persisted state — drives isDirty across name, actions, positions,
  // markings, and attack basket (not just action count).
  const [savedSignature, setSavedSignature] = useState<string>(playSignature(activeSet))
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveDialogName, setSaveDialogName] = useState('')
  const { data: session } = authClient.useSession()
  // Server-side play id once known. Drives create-vs-update branching in handleSave.
  // Sources, in priority order:
  //   1. URL flag (/editor/:id?cloud=1) — when arriving from MyPlaysPage
  //   2. activeSet.cloudPlayId — persisted in localStorage from a previous save
  //   3. null — fresh play, never persisted
  const [cloudPlayId, setCloudPlayId] = useState<string | null>(
    (isCloudPlay && setId) ? setId : (activeSet?.cloudPlayId ?? null)
  )
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [shareCopied, setShareCopied] = useState(false)

  function startNameEdit() {
    setNameInput(activeSet!.name)
    setEditingName(true)
    setTimeout(() => nameInputRef.current?.select(), 0)
  }

  const isDirty = !!activeSet && playSignature(activeSet) !== savedSignature

  async function handleSave() {
    if (!session) {
      if (activeSet) sessionStorage.setItem('setplay_pending', JSON.stringify(activeSet))
      navigate('/register')
      return
    }
    if (!activeSet) return
    setSaveStatus('saving')
    try {
      const url = cloudPlayId ? `/api/plays/${cloudPlayId}` : '/api/plays'
      const method = cloudPlayId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: activeSet.name, data: activeSet }),
      })
      if (!res.ok) { setSaveStatus('error'); return }
      let persisted = activeSet
      if (method === 'POST') {
        const saved = await res.json() as { id: string }
        setCloudPlayId(saved.id)
        // Persist the cloud id inside the local play so reloads still map to the same DB row
        persisted = { ...activeSet, cloudPlayId: saved.id }
        saveSet(persisted)
        setActiveSet(persisted)
      }
      setSavedSignature(playSignature(persisted))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
    }
  }

  async function handleCloudShare() {
    if (!activeSet) return
    let shareToken: string
    if (session) {
      // Logged-in: save to user's account then share
      const res = await fetch('/api/plays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: activeSet.name, data: activeSet }),
      })
      const play = await res.json()
      const shareRes = await fetch(`/api/plays/${play.id}/share`, { method: 'POST' })
      shareToken = (await shareRes.json()).shareToken
    } else {
      // Anonymous: save as guest play
      const res = await fetch('/api/share-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: activeSet.name, data: activeSet }),
      })
      shareToken = (await res.json()).shareToken
    }
    await navigator.clipboard.writeText(`${window.location.origin}/share/${shareToken}`)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  function handleNavigateHome() {
    cancelActionCreation()
    // No actions or already saved (not dirty) → skip the save-before-leaving dialog
    if (!activeSet || activeSet.actions.length === 0 || !isDirty) { navigate('/'); return }
    setSaveDialogName(activeSet.name)
    setSaveDialogOpen(true)
  }

  async function handleSaveAndExit(name: string) {
    if (!activeSet) return
    const updated = { ...activeSet, name: name.trim() || activeSet.name }
    if (!session) {
      sessionStorage.setItem('setplay_pending', JSON.stringify(updated))
      navigate('/register')
      return
    }
    try {
      const url = cloudPlayId ? `/api/plays/${cloudPlayId}` : '/api/plays'
      const method = cloudPlayId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: updated.name, data: updated }),
      })
      // If this was a first-time save, persist the new cloud id locally so reopening this
      // local set finds the same DB row instead of creating yet another duplicate.
      if (res.ok && method === 'POST') {
        const saved = await res.json() as { id: string }
        saveSet({ ...updated, cloudPlayId: saved.id })
      }
    } finally {
      setSaveDialogOpen(false)
      navigate('/')
    }
  }

  function commitNameEdit() {
    const trimmed = nameInput.trim()
    if (trimmed) {
      const updated = { ...activeSet!, name: trimmed }
      saveSet(updated)
      setActiveSet(updated)
    }
    setEditingName(false)
  }
  const stageRef = useRef<Konva.Stage | null>(null)
  const [showExport, setShowExport] = useState(false)
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null)
  const rafRef = useRef(0)
  const lastTsRef = useRef(0)
  const STEP_MS = 1600
  const [positionOverrides, setPositionOverrides] = useState<PositionMap>({})
  const playerDragWaypoints = useRef<NormalizedPosition[]>([])
  const lastPlayerDragPt = useRef<NormalizedPosition | null>(null)
  const playerDragHadPath = useRef(false)
  const [dribbleWaypoints, setDribbleWaypoints] = useState<NormalizedPosition[]>([])
  const isDraggingDribble = useRef(false)
  const dragWasUsed = useRef(false)
  const [cutWaypoints, setCutWaypoints] = useState<NormalizedPosition[]>([])
  const isDraggingCut = useRef(false)
  const cutDragWasUsed = useRef(false)
  const [defenseMoveWaypoints, setDefenseMoveWaypoints] = useState<NormalizedPosition[]>([])
  const isDraggingDefenseMove = useRef(false)
  const defenseMoveWasUsed = useRef(false)
  const lastWaypoint = useRef<NormalizedPosition | null>(null)
  const SAMPLE_DIST = 15
  const [benchHoverPlayer, setBenchHoverPlayer] = useState<Player | null>(null)
  const [isDraggingBall, setIsDraggingBall] = useState(false)
  const [ballDragHoverId, setBallDragHoverId] = useState<string | null>(null)
  // Tracks which cloud id we've already attempted to fetch — prevents re-fetch loop since the
  // loaded play's local id won't match the URL's cloud id (so activeSet?.id === setId stays false).
  const fetchedCloudIdRef = useRef<string | null>(null)

  const cH = activeSet?.courtType === 'half' ? HALF_COURT_H : FULL_COURT_H
  const atkLeft = activeSet?.courtType === 'full' ? (activeSet.attackBasket ?? 'top') === 'top' : false
  const BASKET_PX = 42
  const basketY = activeSet?.courtType === 'full'
    ? (activeSet.attackBasket === 'bottom' ? 1 - BASKET_PX / FULL_COURT_H : BASKET_PX / FULL_COURT_H)
    : BASKET_PX / HALF_COURT_H


  useEffect(() => {
    // Cloud-loaded play: fetch from server (URL's setId is the cloud id, not the local set id)
    if (isCloudPlay && setId) {
      if (activeSet?.cloudPlayId === setId) return
      if (fetchedCloudIdRef.current === setId) return
      fetchedCloudIdRef.current = setId
      fetch(`/api/plays/${setId}`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(play => {
          if (!play?.data) return
          // play.title is the authoritative name (HomePage rename PUTs title only, not data.name).
          // Carry cloudPlayId so subsequent saves PUT instead of POST.
          setActiveSet({ ...play.data, name: play.title, cloudPlayId: play.id })
        })
      return
    }

    if (activeSet?.id === setId) return
    const found = savedSets.find(s => s.id === setId)
    if (found) setActiveSet(found)
    else usePlayStore.getState().loadSetsFromStorage()
  }, [setId, savedSets, setActiveSet, activeSet, isCloudPlay])

  // Snap the saved-signature baseline whenever a different play loads (so an existing cloud
  // play starts in a clean !isDirty state instead of erroneously dirty).
  useEffect(() => {
    if (activeSet) setSavedSignature(playSignature(activeSet))
  }, [activeSet?.id])

  // Resync cloudPlayId when navigating between plays (e.g. /editor/A → /editor/B?cloud=1)
  // or when the loaded play has a persisted cloudPlayId from a prior save.
  useEffect(() => {
    if (isCloudPlay && setId) setCloudPlayId(setId)
    else if (activeSet?.cloudPlayId) setCloudPlayId(activeSet.cloudPlayId)
    else setCloudPlayId(null)
    setSaveStatus('idle')
  }, [setId, isCloudPlay, activeSet?.id, activeSet?.cloudPlayId])

  // Mirror the disabled logic from ActionToolbar so keyboard cannot start an action
  // the user can't start with a click (e.g., shot without ball, defense action without defenders)
  const hasDefenders = (activeSet?.players ?? []).some(p => p.team === 'defense')
  function canStartAction(type: ActionType): boolean {
    if (!activeSet) return false
    if (hasShotActionFromStore()) return false
    const isDefense = type === 'defense-move' || type === 'double-team' || type === 'ball-force'
    if (isDefense) return hasDefenders
    const requiresBall: Record<ActionType, boolean> = {
      pass: true, dribble: true, shot: true, handoff: true,
      cut: false, screen: false,
      'defense-move': false, 'double-team': false, 'ball-force': false,
    }
    if (requiresBall[type] && !currentStateBallHolder()) return false
    return true
  }
  // Lazy reads — these need the latest values at the moment the shortcut fires.
  function hasShotActionFromStore(): boolean {
    return !!usePlayStore.getState().activeSet?.actions.some(a => a.type === 'shot')
  }
  function currentStateBallHolder(): string {
    const s = usePlayStore.getState()
    const set = s.activeSet
    if (!set) return ''
    const state = computeStateAtStep(
      set.actions, s.activeStep, set.initialPositions, set.initialBall, undefined,
      set.courtType === 'full'
        ? (set.attackBasket === 'bottom' ? 1 - 42 / FULL_COURT_H : 42 / FULL_COURT_H)
        : 42 / HALF_COURT_H,
      HALF_COURT_W,
      set.courtType === 'half' ? HALF_COURT_H : FULL_COURT_H,
    )
    return state.ball.holderId
  }

  useEditorShortcuts({
    enabled: !!activeSet,
    onAction: (type) => {
      if (actionCreation.type === type) cancelAll()
      else startActionCreation(type)
    },
    onCancel: () => cancelAll(),
    onUndo: () => usePlayStore.getState().undoLastAction(),
    onPlayPause: () => {
      const s = usePlayStore.getState()
      const tot = s.activeSet?.actions.length ?? 0
      if (tot === 0) return
      if (s.isPlaying) { s.setIsPlaying(false); return }
      if (s.activeStep >= tot) s.setActiveStep(0)
      s.setIsPlaying(true)
    },
    onStepBack: () => {
      const s = usePlayStore.getState()
      if (s.isPlaying) return
      s.setActiveStep(Math.max(0, s.activeStep - 1))
    },
    onStepForward: () => {
      const s = usePlayStore.getState()
      if (s.isPlaying) return
      const tot = s.activeSet?.actions.length ?? 0
      s.setActiveStep(Math.min(tot, s.activeStep + 1))
    },
    onGoToStart: () => {
      const s = usePlayStore.getState()
      if (s.isPlaying) return
      s.setActiveStep(0)
    },
    onGoToEnd: () => {
      const s = usePlayStore.getState()
      if (s.isPlaying) return
      const tot = s.activeSet?.actions.length ?? 0
      s.setActiveStep(tot)
    },
    onSave: () => handleSave(),
    canSave: !!activeSet && activeSet.actions.length > 0 && isDirty,
    onExport: () => setShowExport(true),
    canExport: !!activeSet && activeSet.actions.length > 0 && !isPlaying,
    onShare: () => handleCloudShare(),
    canShare: !!activeSet && activeSet.actions.length > 0,
    onToggleMarkings: () => handleToggleMarkings(),
    canToggleMarkings: hasDefenders,
    canStartAction,
  })

  useEffect(() => {
    if (!actionCreation.type) setMousePos(null)
  }, [actionCreation.type])

  useEffect(() => {
    setPositionOverrides({})
  }, [activeStep])

  useEffect(() => {
    const handler = (e: MouseEvent) => { lastMousePos.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  useEffect(() => {
    const el = courtAreaRef.current
    if (!el) return
    const STAGE_W_VAL = HALF_COURT_W + 2 * COURT_PADDING_X
    function updateScale() {
      if (!el) return
      const aw = el.clientWidth - 32
      const ah = el.clientHeight - 16
      if (aw <= 0 || ah <= 0) return
      if (activeSet?.courtType === 'full') {
        setCourtScale(Math.min(aw / (FULL_COURT_H + 2 * COURT_PADDING_Y), ah / STAGE_W_VAL))
      } else {
        setCourtScale(Math.min(1, aw / STAGE_W_VAL))
      }
    }
    updateScale()
    const ro = new ResizeObserver(updateScale)
    ro.observe(el)
    return () => ro.disconnect()
  }, [activeSet?.courtType])

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
  }, [isPlaying, setIsPlaying])

  if (!activeSet) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <p>{t('common.loading')}</p>
      </div>
    )
  }

  const activeMarkings = markingsEnabled ? (activeSet.markings ?? {}) : undefined
  const currentState = computeStateAtStep(
    activeSet.actions, activeStep, activeSet.initialPositions, activeSet.initialBall, activeMarkings, basketY, HALF_COURT_W, cH
  )
  const total = activeSet.actions.length
  const hasShotAction = activeSet.actions.some(a => a.type === 'shot')

  const effectivePositions: PositionMap = { ...currentState.positions, ...positionOverrides }

  const displayPositions = (() => {
    if (!isPlaying || activeStep >= total) return effectivePositions
    const toState = computeStateAtStep(
      activeSet.actions, activeStep + 1, activeSet.initialPositions, activeSet.initialBall, activeMarkings, basketY, HALF_COURT_W, cH
    )
    const t = animFraction
    const currentAction = activeSet.actions[activeStep]

    return Object.fromEntries(
      Object.keys(currentState.positions).map(id => {
        const from = currentState.positions[id] ?? { x: 0.5, y: 0.5 }
        const to = toState.positions[id] ?? from

        // Follow drawn waypoint path for dribble, cut, or defense-move
        if (
          (currentAction?.type === 'dribble' || currentAction?.type === 'cut' || currentAction?.type === 'defense-move') &&
          currentAction.playerId === id &&
          currentAction.waypoints && currentAction.waypoints.length > 1
        ) {
          const path = [from, ...currentAction.waypoints]
          // Arc-length parameterization for uniform speed along path
          const lens: number[] = []
          let total = 0
          for (let i = 1; i < path.length; i++) {
            const dx = path[i].x - path[i - 1].x
            const dy = path[i].y - path[i - 1].y
            const l = Math.sqrt(dx * dx + dy * dy)
            lens.push(l)
            total += l
          }
          if (total === 0) return [id, from]
          const target = t * total
          let acc = 0
          for (let i = 0; i < lens.length; i++) {
            if (acc + lens[i] >= target) {
              const localT = lens[i] === 0 ? 0 : (target - acc) / lens[i]
              return [id, {
                x: path[i].x + (path[i + 1].x - path[i].x) * localT,
                y: path[i].y + (path[i + 1].y - path[i].y) * localT,
              }]
            }
            acc += lens[i]
          }
          return [id, path[path.length - 1]]
        }

        return [id, { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t }]
      })
    )
  })()

  const inPlayIds = new Set(activeSet.players.map(p => p.id))
  const allBenchPlayers: Player[] = []
  for (let n = 1; n <= 5; n++) {
    allBenchPlayers.push({ id: `o${n}`, number: n, team: 'offense' })
    allBenchPlayers.push({ id: `d${n}`, number: n, team: 'defense' })
  }

  function cancelAll() {
    cancelActionCreation()
  }

  function handleToggleMarkings() {
    if (!activeSet) return
    if (markingsEnabled) {
      setMarkingsEnabled(false)
    } else {
      // Ensure d1↔o1 … assignments exist before enabling
      if (Object.keys(activeSet.markings ?? {}).length === 0) {
        const newMarkings: Record<string, string> = {}
        const defPlayers = activeSet.players.filter(p => p.team === 'defense')
        const offPlayers = activeSet.players.filter(p => p.team === 'offense')
        for (const def of defPlayers) {
          const match = offPlayers.find(o => o.number === def.number)
          if (match) newMarkings[def.id] = match.id
        }
        updateMarkings(newMarkings)
      }
      setMarkingsEnabled(true)
    }
  }

  function handleCourtDrop(e: React.DragEvent<HTMLDivElement>) {
    if (!activeSet) return
    e.preventDefault()
    const pid = e.dataTransfer.getData('benchPlayerId')
    const isBall = e.dataTransfer.getData('benchBall') === 'true'
    const rect = e.currentTarget.getBoundingClientRect()

    let dropNorm: { x: number; y: number }
    if (activeSet.courtType === 'full') {
      const STAGE_W = HALF_COURT_W + 2 * COURT_PADDING_X
      const kx = (e.clientX - rect.left) / courtScale
      const ky = (e.clientY - rect.top) / courtScale
      dropNorm = { x: Math.max(0.02, Math.min(0.98, (STAGE_W - ky - COURT_PADDING_X) / HALF_COURT_W)), y: Math.max(-0.05, Math.min(1.05, (kx - COURT_PADDING_Y) / FULL_COURT_H)) }
    } else {
      const cx = (e.clientX - rect.left) / courtScale
      const cy = (e.clientY - rect.top) / courtScale
      dropNorm = { x: Math.max(0.02, Math.min(0.98, (cx - COURT_PADDING_X) / HALF_COURT_W)), y: Math.max(-0.05, Math.min(1.05, (cy - HALF_COURT_PADDING_TOP) / cH)) }
    }

    if (isBall) {
      let closestId: string | null = null, minDist = Infinity
      for (const player of (activeSet?.players ?? [])) {
        if (player.team !== 'offense') continue
        const pos = currentState.positions[player.id]
        if (!pos) continue
        const dx = (pos.x - dropNorm.x) * HALF_COURT_W
        const dy = (pos.y - dropNorm.y) * cH
        const d = dx * dx + dy * dy
        if (d < minDist) { minDist = d; closestId = player.id }
      }
      if (closestId) setInitialBall(closestId)
      return
    }

    if (!pid) return
    addPlayerToCourt(pid, dropNorm)
  }

  function normFromEvent(e: Konva.KonvaEventObject<MouseEvent>): NormalizedPosition | null {
    if (!activeSet) return null
    const pos = e.target.getStage()?.getPointerPosition()
    if (!pos) return null
    if (activeSet.courtType === 'full') {
      const STAGE_W = HALF_COURT_W + 2 * COURT_PADDING_X
      const sx = STAGE_W - pos.y / courtScale
      const sy = (pos.x / courtScale) - COURT_PADDING_Y
      return { x: (sx - COURT_PADDING_X) / HALF_COURT_W, y: sy / FULL_COURT_H }
    }
    return { x: (pos.x / courtScale - COURT_PADDING_X) / HALF_COURT_W, y: (pos.y / courtScale - HALF_COURT_PADDING_TOP) / cH }
  }

  function handleMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    const norm = normFromEvent(e)
    if (!norm) return
    if (actionCreation.type === 'dribble') {
      isDraggingDribble.current = true
      dragWasUsed.current = false
      lastWaypoint.current = norm
      setDribbleWaypoints([])
    } else if (actionCreation.type === 'cut' && actionCreation.pendingSourceId) {
      isDraggingCut.current = true
      cutDragWasUsed.current = false
      lastWaypoint.current = norm
      setCutWaypoints([])
    } else if (actionCreation.type === 'defense-move' && actionCreation.pendingSourceId) {
      isDraggingDefenseMove.current = true
      defenseMoveWasUsed.current = false
      lastWaypoint.current = norm
      setDefenseMoveWaypoints([])
    }
  }

  function handleMouseUp(_e: Konva.KonvaEventObject<MouseEvent>) {
    if (isDraggingDribble.current && actionCreation.type === 'dribble') {
      isDraggingDribble.current = false
      if (dragWasUsed.current && dribbleWaypoints.length > 2) {
        const last = dribbleWaypoints[dribbleWaypoints.length - 1]
        addAction({ id: nanoid(), type: 'dribble', playerId: currentState.ball.holderId, toPosition: last, waypoints: dribbleWaypoints })
      }
      setDribbleWaypoints([])
      lastWaypoint.current = null
    }
    if (isDraggingCut.current && actionCreation.type === 'cut' && actionCreation.pendingSourceId) {
      isDraggingCut.current = false
      if (cutDragWasUsed.current && cutWaypoints.length > 2) {
        const last = cutWaypoints[cutWaypoints.length - 1]
        addAction({ id: nanoid(), type: 'cut', playerId: actionCreation.pendingSourceId, toPosition: last, waypoints: cutWaypoints })
      }
      setCutWaypoints([])
      lastWaypoint.current = null
    }
    if (isDraggingDefenseMove.current && actionCreation.type === 'defense-move' && actionCreation.pendingSourceId) {
      isDraggingDefenseMove.current = false
      if (defenseMoveWasUsed.current && defenseMoveWaypoints.length > 2) {
        const last = defenseMoveWaypoints[defenseMoveWaypoints.length - 1]
        addAction({ id: nanoid(), type: 'defense-move', playerId: actionCreation.pendingSourceId, toPosition: last, waypoints: defenseMoveWaypoints })
      }
      setDefenseMoveWaypoints([])
      lastWaypoint.current = null
    }
  }

  function handleMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    if (!actionCreation.type) return
    const norm = normFromEvent(e)
    if (!norm) return
    setMousePos(norm)

    if (isDraggingDribble.current && actionCreation.type === 'dribble' && lastWaypoint.current) {
      const last = lastWaypoint.current
      const dx = (norm.x - last.x) * HALF_COURT_W
      const dy = (norm.y - last.y) * cH
      if (Math.sqrt(dx * dx + dy * dy) >= SAMPLE_DIST) {
        dragWasUsed.current = true
        setDribbleWaypoints(prev => [...prev, norm])
        lastWaypoint.current = norm
      }
    }
    if (isDraggingCut.current && actionCreation.type === 'cut' && lastWaypoint.current) {
      const last = lastWaypoint.current
      const dx = (norm.x - last.x) * HALF_COURT_W
      const dy = (norm.y - last.y) * cH
      if (Math.sqrt(dx * dx + dy * dy) >= SAMPLE_DIST) {
        cutDragWasUsed.current = true
        setCutWaypoints(prev => [...prev, norm])
        lastWaypoint.current = norm
      }
    }
    if (isDraggingDefenseMove.current && actionCreation.type === 'defense-move' && lastWaypoint.current) {
      const last = lastWaypoint.current
      const dx = (norm.x - last.x) * HALF_COURT_W
      const dy = (norm.y - last.y) * cH
      if (Math.sqrt(dx * dx + dy * dy) >= SAMPLE_DIST) {
        defenseMoveWasUsed.current = true
        setDefenseMoveWaypoints(prev => [...prev, norm])
        lastWaypoint.current = norm
      }
    }
  }

  function handleCourtClick(e: Konva.KonvaEventObject<MouseEvent>) {
    const { type, pendingSourceId } = actionCreation
    if (!type) return

    const normPos = normFromEvent(e)
    if (!normPos) return

    if (type === 'shot') {
      const action: Action = { id: nanoid(), type: 'shot', shooterId: currentState.ball.holderId }
      addAction(action)
      return
    }

    if (type === 'dribble') {
      if (dragWasUsed.current) { dragWasUsed.current = false; return }
      addAction({ id: nanoid(), type: 'dribble', playerId: currentState.ball.holderId, toPosition: normPos })
      return
    }

    if (type === 'cut' && pendingSourceId) {
      if (cutDragWasUsed.current) { cutDragWasUsed.current = false; return }
      addAction({ id: nanoid(), type: 'cut', playerId: pendingSourceId, toPosition: normPos })
      return
    }

    if (type === 'screen' && pendingSourceId) {
      const action: Action = { id: nanoid(), type: 'screen', screenerId: pendingSourceId, screenPosition: normPos }
      addAction(action)
      return
    }

    if (type === 'handoff' && pendingSourceId) {
      const action: Action = {
        id: nanoid(), type: 'handoff',
        fromId: currentState.ball.holderId, toId: pendingSourceId, meetPosition: normPos,
      }
      addAction(action)
      return
    }

    if (type === 'defense-move' && pendingSourceId) {
      if (defenseMoveWasUsed.current) { defenseMoveWasUsed.current = false; return }
      addAction({ id: nanoid(), type: 'defense-move', playerId: pendingSourceId, toPosition: normPos })
      return
    }

    if (type === 'ball-force' && pendingSourceId) {
      const targetId = currentState.ball.holderId
      const target = currentState.positions[targetId]
      if (!target) return
      const targetPxCoords = denormalize(target.x, target.y, HALF_COURT_W, cH)
      const clickPxCoords  = denormalize(normPos.x, normPos.y, HALF_COURT_W, cH)
      const angle = Math.atan2(clickPxCoords.y - targetPxCoords.y, clickPxCoords.x - targetPxCoords.x)
      addAction({ id: nanoid(), type: 'ball-force', defenderId: pendingSourceId, targetId, angle })
      return
    }
  }

  function handlePlayerClick(playerId: string) {
    if (!activeSet) return
    const { type, pendingSourceId } = actionCreation
    if (!type) {
      const ballOnCourt = activeSet?.players.some(p => p.id === currentState.ball.holderId)
      if (!ballOnCourt) {
        const p = activeSet?.players.find(p => p.id === playerId)
        if (p && p.team === 'offense') setInitialBall(playerId)
      }
      return
    }

    if (type === 'pass') {
      if (playerId === currentState.ball.holderId) return
      const target = activeSet.players.find(p => p.id === playerId)
      if (!target || target.team === 'defense') return
      const action: Action = { id: nanoid(), type: 'pass', fromId: currentState.ball.holderId, toId: playerId }
      addAction(action)
      return
    }

    if (type === 'cut' && !pendingSourceId) {
      const cutter = activeSet.players.find(p => p.id === playerId)
      if (!cutter || cutter.team === 'defense') return
      setPendingSource(playerId)
      return
    }

    if (type === 'screen' && !pendingSourceId) {
      const screener = activeSet.players.find(p => p.id === playerId)
      if (!screener || screener.team === 'defense') return
      setPendingSource(playerId)
      return
    }

    if (type === 'handoff' && !pendingSourceId) {
      if (playerId === currentState.ball.holderId) return
      const receiver = activeSet.players.find(p => p.id === playerId)
      if (!receiver || receiver.team === 'defense') return
      setPendingSource(playerId)
      return
    }

    if (type === 'defense-move' && !pendingSourceId) {
      const mover = activeSet.players.find(p => p.id === playerId)
      if (!mover || mover.team !== 'defense') return
      setPendingSource(playerId)
      return
    }

    if (type === 'ball-force' && !pendingSourceId) {
      const mover = activeSet.players.find(p => p.id === playerId)
      if (!mover || mover.team !== 'defense') return
      setPendingSource(playerId)
      return
    }

    if (type === 'double-team' && !pendingSourceId) {
      const mover = activeSet.players.find(p => p.id === playerId)
      if (!mover || mover.team !== 'defense') return
      setPendingSource(playerId)
      return
    }

    if (type === 'double-team' && pendingSourceId && playerId !== pendingSourceId) {
      const mover = activeSet.players.find(p => p.id === playerId)
      if (!mover || mover.team !== 'defense') return
      addAction({
        id: nanoid(), type: 'double-team',
        defender1Id: pendingSourceId,
        defender2Id: playerId,
        targetId: currentState.ball.holderId,
      })
      return
    }
  }

  const instructionText = (() => {
    const { type, pendingSourceId } = actionCreation
    if (!type) return null
    if (type === 'pass') return t('editor.instructions.pass')
    if (type === 'dribble') return t('editor.instructions.dribble')
    if (type === 'shot') return t('editor.instructions.shot')
    if (type === 'cut') return pendingSourceId ? t('editor.instructions.cutPosition') : t('editor.instructions.cutPlayer')
    if (type === 'screen') return pendingSourceId ? t('editor.instructions.screenPosition') : t('editor.instructions.screenPlayer')
    if (type === 'handoff') return pendingSourceId ? t('editor.instructions.handoffPosition') : t('editor.instructions.handoffPlayer')
    if (type === 'defense-move') return pendingSourceId ? t('editor.instructions.defenseMovePosition') : t('editor.instructions.defenseMovePlayer')
    if (type === 'double-team') return pendingSourceId ? t('editor.instructions.doubleTeamSecond') : t('editor.instructions.doubleTeamFirst')
    if (type === 'ball-force') return pendingSourceId ? t('editor.instructions.ballForceDirection') : t('editor.instructions.ballForcePlayer')
    return null
  })()

  const showInstruction = instructionText !== null

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button onClick={handleNavigateHome} className="text-slate-400 hover:text-white transition-colors text-sm shrink-0">{t('common.backButton')}</button>
          {editingName ? (
            <input
              ref={nameInputRef}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={commitNameEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitNameEdit()
                if (e.key === 'Escape') setEditingName(false)
              }}
              className="bg-slate-700 text-white rounded px-2 py-0.5 outline-none focus:ring-2 focus:ring-orange-500 font-semibold text-sm min-w-0 w-32 sm:w-auto"
            />
          ) : (
            <span
              className="text-white font-semibold cursor-text hover:text-orange-300 transition-colors truncate max-w-[120px] sm:max-w-none"
              title={t('editor.renamePlayTooltip')}
              onClick={startNameEdit}
            >{activeSet.name}</span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="hidden sm:block text-slate-400 text-sm">
            {activeSet.courtType === 'half' ? t('common.halfCourt') : t('common.fullCourt')}
          </span>
          <LanguageSwitcher />
          <UserButton />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div id="tutorial-toolbar" className="hidden md:block p-2 border-r border-slate-700 overflow-y-auto shrink-0">
          <ActionToolbar
            activeType={actionCreation.type}
            ballHolderId={currentState.ball.holderId}
            hasDefenders={(activeSet?.players ?? []).some(p => p.team === 'defense')}
            onSelect={startActionCreation}
            onCancel={cancelAll}
            markingsEnabled={markingsEnabled}
            onToggleMarkings={handleToggleMarkings}
            gameOver={hasShotAction}
          />
        </div>

        <div className="flex-1 flex flex-col bg-slate-950 overflow-x-hidden">
          <div className="flex flex-col items-center flex-shrink-0">
            {/* Instruction text — only when action is active */}
            <div className="h-8 flex items-center justify-center">
              {showInstruction && (
                <div className="text-sm text-orange-300 font-medium flex items-center gap-2">
                  {instructionText}
                  <button onClick={cancelAll} className="ml-3 text-slate-400 hover:text-white text-xs underline">{t('common.cancelButton')}</button>
                </div>
              )}
            </div>

            {/* Full-court direction bar — always visible */}
            {activeSet.courtType === 'full' && (
              <div className="flex flex-col items-center w-full px-5 pb-2 gap-1">
                {atkLeft ? (
                  <div className="flex items-center w-full text-orange-500">
                    <span className="text-[11px] font-bold mr-1 whitespace-nowrap">{t('editor.attackDirection')}</span>
                    <svg width="7" height="9" viewBox="0 0 7 9" fill="currentColor"><path d="M7 0L0 4.5L7 9z"/></svg>
                    <div className="flex-1 h-0.5 bg-orange-500 opacity-60"/>
                  </div>
                ) : (
                  <div className="flex items-center w-full text-orange-500">
                    <div className="flex-1 h-0.5 bg-orange-500 opacity-60"/>
                    <svg width="7" height="9" viewBox="0 0 7 9" fill="currentColor"><path d="M0 0L7 4.5L0 9z"/></svg>
                    <span className="text-[11px] font-bold ml-1 whitespace-nowrap">{t('editor.attackDirection')}</span>
                  </div>
                )}
                {/* Flip below the arrows */}
                <button
                  onClick={flipAttackBasket}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-xs transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/>
                    <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
                  </svg>
                  {t('common.flipButton')}
                </button>
              </div>
            )}
          </div>
          <div id="tutorial-court" ref={courtAreaRef} className="relative flex-1 flex items-center justify-center px-2 sm:px-4 overflow-hidden">
          <div className={`flex flex-col md:flex-row gap-2 md:gap-3 items-center ${activeSet.courtType === 'full' ? 'md:items-center' : 'md:items-end'}`}>
          <div
            className="relative"
            onDragOver={(e) => {
              e.preventDefault()
              if (!isDraggingBall) return
              const rect = e.currentTarget.getBoundingClientRect()
              let nx: number, ny: number
              if (activeSet.courtType === 'full') {
                const STAGE_W = HALF_COURT_W + 2 * COURT_PADDING_X
                const kx = (e.clientX - rect.left) / courtScale
                const ky = (e.clientY - rect.top) / courtScale
                nx = (STAGE_W - ky - COURT_PADDING_X) / HALF_COURT_W
                ny = (kx - COURT_PADDING_Y) / FULL_COURT_H
              } else {
                const bcx = (e.clientX - rect.left) / courtScale
                const bcy = (e.clientY - rect.top) / courtScale
                nx = (bcx - COURT_PADDING_X) / HALF_COURT_W
                ny = (bcy - HALF_COURT_PADDING_TOP) / cH
              }
              let closest: string | null = null, minD = Infinity
              for (const p of (activeSet?.players ?? [])) {
                if (p.team !== 'offense') continue
                const pos = currentState.positions[p.id]
                if (!pos) continue
                const dx = (pos.x - nx) * HALF_COURT_W, dy = (pos.y - ny) * cH
                const d = dx * dx + dy * dy
                if (d < minD) { minD = d; closest = p.id }
              }
              setBallDragHoverId(minD < 35 * 35 ? closest : null)
            }}
            onDragLeave={() => setBallDragHoverId(null)}
            onDrop={handleCourtDrop}
          >
            <CourtCanvas
              courtType={activeSet.courtType}
              stageRef={stageRef}
              scale={courtScale}
              landscape={activeSet.courtType === 'full'}
              attackBasket={activeSet.attackBasket}
              onStageClick={handleCourtClick}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => { setMousePos(null); isDraggingDribble.current = false; isDraggingCut.current = false; isDraggingDefenseMove.current = false }}
            >
              <ActionOverlay
                actions={activeSet.actions}
                initialPositions={activeSet.initialPositions}
                initialBall={activeSet.initialBall}
                activeStep={activeStep}
                courtType={activeSet.courtType}
                markings={activeMarkings}
                attackBasket={activeSet.attackBasket}
              />
              <ActionPreview
                actionType={actionCreation.type}
                pendingSourceId={actionCreation.pendingSourceId}
                ballHolderId={currentState.ball.holderId}
                positions={effectivePositions}
                mousePos={mousePos}
                courtType={activeSet.courtType}
                basketY={basketY}
                dribbleWaypoints={dribbleWaypoints}
                cutWaypoints={cutWaypoints}
                defenseMoveWaypoints={defenseMoveWaypoints}
              />
              {/* Marking lines — only when enabled */}
              {markingsEnabled && Object.entries(activeSet.markings ?? {}).map(([defId, offId]) => {
                const dp = effectivePositions[defId]
                const op = effectivePositions[offId]
                if (!dp || !op) return null
                const d = denormalize(dp.x, dp.y, HALF_COURT_W, cH)
                const o = denormalize(op.x, op.y, HALF_COURT_W, cH)
                return (
                  <Line
                    key={defId}
                    points={[d.x, d.y, o.x, o.y]}
                    stroke="#60a5fa" strokeWidth={1.5}
                    dash={[4, 4]} opacity={0.5} listening={false}
                  />
                )
              })}

              {/* Growing pass arrow during animation */}
              {(() => {
                if (!isPlaying || activeStep >= total) return null
                const action = activeSet.actions[activeStep]
                if (action?.type !== 'pass') return null
                const fromPos = currentState.positions[action.fromId]
                const toPos = currentState.positions[action.toId]
                if (!fromPos || !toPos) return null
                const from = denormalize(fromPos.x, fromPos.y, HALF_COURT_W, cH)
                const to   = denormalize(toPos.x, toPos.y, HALF_COURT_W, cH)
                const PLAYER_R = Math.round(20 * 1.4)
                const ARROW_G  = Math.round(6 * 1.4)
                const gap = PLAYER_R + ARROW_G
                const dxF = to.x - from.x, dyF = to.y - from.y
                const lenF = Math.sqrt(dxF * dxF + dyF * dyF) || 1
                const finalEnd = { x: to.x - (dxF / lenF) * gap, y: to.y - (dyF / lenF) * gap }
                const rawTipX  = from.x + (to.x - from.x) * animFraction
                const rawTipY  = from.y + (to.y - from.y) * animFraction
                const rawDist   = Math.hypot(rawTipX - from.x, rawTipY - from.y)
                const finalDist = Math.hypot(finalEnd.x - from.x, finalEnd.y - from.y)
                const end = rawDist < finalDist ? { x: rawTipX, y: rawTipY } : finalEnd
                const color = ACTION_COLORS['pass']
                return (
                  <Arrow
                    points={[from.x, from.y, end.x, end.y]}
                    stroke={color} fill={color}
                    strokeWidth={2.5} dash={[10, 6]}
                    pointerLength={10} pointerWidth={8}
                    listening={false}
                  />
                )
              })()}

              {/* Players — rendered above arrows */}
              {activeSet.players.map(player => {
                const pos = displayPositions[player.id] ?? { x: 0.5, y: 0.5 }
                return (
                  <PlayerNode
                    key={player.id}
                    player={player}
                    position={pos}
                    courtType={activeSet.courtType}
                    landscape={activeSet.courtType === 'full'}
                    hasBall={currentState.ball.holderId === player.id}
                    showBallDrop={ballDragHoverId === player.id}
                    isSelected={actionCreation.pendingSourceId === player.id}
                    draggable={!(actionCreation.type && player.team === 'defense')}
                    onDragStart={() => {
                      playerDragWaypoints.current = []
                      lastPlayerDragPt.current = null
                      playerDragHadPath.current = false
                      setBenchHoverPlayer(null)
                    }}
                    onDragMove={(id, pos) => {
                      const last = lastPlayerDragPt.current
                      if (!last) { lastPlayerDragPt.current = pos; return }
                      const dx = (pos.x - last.x) * HALF_COURT_W
                      const dy = (pos.y - last.y) * cH
                      if (Math.sqrt(dx * dx + dy * dy) >= SAMPLE_DIST) {
                        playerDragHadPath.current = true
                        playerDragWaypoints.current.push(pos)
                        lastPlayerDragPt.current = pos
                      }
                      const bench = benchRef.current
                      if (bench) {
                        const rect = bench.getBoundingClientRect()
                        const { x, y } = lastMousePos.current
                        const over = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
                        setBenchHoverPlayer(over ? (activeSet.players.find(p => p.id === id) ?? null) : null)
                      }
                    }}
                    onDragEnd={(id, newPos) => {
                      setBenchHoverPlayer(null)
                      const bench = benchRef.current
                      if (bench) {
                        const rect = bench.getBoundingClientRect()
                        const { x, y } = lastMousePos.current
                        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                          removePlayerFromCourt(id)
                          return
                        }
                      }
                      if (activeStep === 0 || activeSet.actions.length === 0) {
                        updateInitialPosition(id, newPos)
                        return
                      }
                      if (actionCreation.type) {
                        setPositionOverrides(prev => ({ ...prev, [id]: newPos }))
                        return
                      }
                      const player = activeSet.players.find(p => p.id === id)
                      if (!player) return
                      const startPos = currentState.positions[id]
                      if (startPos) {
                        const dx = (newPos.x - startPos.x) * HALF_COURT_W
                        const dy = (newPos.y - startPos.y) * cH
                        if (Math.sqrt(dx * dx + dy * dy) < 50) return
                      }
                      const waypoints = playerDragHadPath.current && playerDragWaypoints.current.length > 2
                        ? [...playerDragWaypoints.current]
                        : undefined
                      if (player.team === 'defense') {
                        addAction({ id: nanoid(), type: 'defense-move', playerId: id, toPosition: newPos, waypoints })
                      } else if (currentState.ball.holderId === id) {
                        addAction({ id: nanoid(), type: 'dribble', playerId: id, toPosition: newPos, waypoints })
                      } else {
                        addAction({ id: nanoid(), type: 'cut', playerId: id, toPosition: newPos, waypoints })
                      }
                    }}
                    onClick={handlePlayerClick}
                    onDblClick={(id) => {
                      // Only let the user edit a player's identity when not mid-action;
                      // double-click during action creation would conflict with click-to-select flows.
                      if (actionCreation.type) return
                      setEditingPlayerId(id)
                    }}
                  />
                )
              })}

              {/* Action type labels — rendered last (above players) with smart placement */}
              {activeSet.actions.slice(0, isPlaying ? activeStep + 1 : activeStep).map((action, i) => {
                const stateBefore = computeStateAtStep(
                  activeSet.actions, i, activeSet.initialPositions, activeSet.initialBall, activeMarkings, basketY, HALF_COURT_W, cH
                )
                const line = arrowLine(action, stateBefore.positions, cH, basketY * cH)
                if (!line) return null
                const playersPx = Object.values(stateBefore.positions).map(p =>
                  denormalize(p.x, p.y, HALF_COURT_W, cH)
                )
                const { cx, cy } = smartLabelCenter(line.x1, line.y1, line.x2, line.y2, playersPx)
                const isLatest = isPlaying ? i === activeStep : i === activeStep - 1
                const isLandscape = activeSet.courtType === 'full'
                return (
                  <Text
                    key={action.id + '-lbl'}
                    x={cx} y={cy}
                    offsetX={25} offsetY={5}
                    width={50}
                    rotation={isLandscape ? 90 : 0}
                    text={t(ACTION_LABEL_KEYS[action.type])}
                    fontSize={10} fontStyle="bold"
                    fill={ACTION_COLORS[action.type]}
                    align="center"
                    opacity={isLatest ? 1 : 0.45}
                    listening={false}
                  />
                )
              })}

              {/* optionText badge — rendered topmost, above labels and players */}
              {(() => {
                const action = activeSet.actions[activeStep - 1]
                if (!action?.optionText) return null
                // Anchor to the player tied to the action, not the ball holder —
                // labels on cut/screen/defense actions used to land on the wrong player.
                const anchorId = actionLabelPlayerId(action)
                const anchor = displayPositions[anchorId]
                if (!anchor) return null
                const hpx = denormalize(anchor.x, anchor.y, HALF_COURT_W, cH)
                const W = Math.min(Math.max(action.optionText.length * 7 + 16, 60), 140)
                const H = 20
                return (
                  <Group x={hpx.x + 24} y={hpx.y - H / 2} listening={false}>
                    <Rect width={W} height={H} fill="#1e293b" cornerRadius={4}
                      stroke="#fb923c" strokeWidth={1.5} shadowBlur={6} shadowColor="rgba(0,0,0,0.5)" />
                    <Text text={action.optionText} width={W} height={H}
                      fontSize={10} fontStyle="bold" fill="#f1f5f9"
                      align="center" verticalAlign="middle" listening={false} />
                  </Group>
                )
              })()}
            </CourtCanvas>
          </div>

          {activeSet.courtType !== 'full' && (
            <div ref={benchRef} className="flex flex-row md:flex-col items-center gap-1.5 md:gap-2 px-2 py-2 md:py-3 bg-slate-800/60 rounded-xl border border-slate-700 overflow-x-auto md:overflow-x-visible md:overflow-y-auto order-last md:order-none md:self-center max-h-none md:max-h-[80vh] w-full md:w-auto">
              <span className="text-slate-500 text-xs shrink-0">{t('editor.benchLabel')}</span>
              {!activeSet.players.some(p => p.id === currentState.ball.holderId) && (
                <div
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('benchBall', 'true')
                    setIsDraggingBall(true)
                    const ghost = document.createElement('div')
                    ghost.style.cssText = 'position:fixed;top:-200px;left:-200px;font-size:28px;line-height:1;'
                    ghost.textContent = '🏀'
                    document.body.appendChild(ghost)
                    e.dataTransfer.setDragImage(ghost, 14, 14)
                    requestAnimationFrame(() => document.body.removeChild(ghost))
                  }}
                  onDragEnd={() => { setIsDraggingBall(false); setBallDragHoverId(null) }}
                  className="w-9 h-9 rounded-full flex items-center justify-center cursor-grab select-none bg-amber-500/20 border-2 border-amber-400 shrink-0"
                  style={{ fontSize: 20 }}
                  title={t('editor.ballDragTooltip')}
                >
                  🏀
                </div>
              )}
              {allBenchPlayers.filter(p => !inPlayIds.has(p.id) || p.id === benchHoverPlayer?.id).map(p => {
                const isHover = p.id === benchHoverPlayer?.id
                return isHover ? (
                  <div key={p.id} className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold select-none"
                      style={{ backgroundColor: p.team === 'offense' ? '#f97316' : '#1d4ed8', border: '2px dashed rgba(255,255,255,0.6)', opacity: 0.9 }}>
                      {p.number}
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center font-bold leading-none" style={{ fontSize: 12 }}>+</div>
                  </div>
                ) : (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('benchPlayerId', p.id)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-grab select-none shrink-0"
                    style={{ backgroundColor: p.team === 'offense' ? '#f97316' : '#1d4ed8', border: '2px dashed rgba(255,255,255,0.4)', opacity: 0.8 }}
                    title={p.team === 'offense' ? t('editor.offensePlayerDragTooltip', { num: p.number }) : t('editor.defensePlayerDragTooltip', { num: p.number })}
                  >
                    {p.number}
                  </div>
                )
              })}
            </div>
          )}
          </div>
          {activeSet.courtType === 'full' && (
            <div ref={benchRef} className={`absolute ${atkLeft ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-2 px-2 py-3 bg-slate-800/90 rounded-xl border border-slate-700 overflow-y-auto max-h-[80vh]`}>
              <span className="text-slate-500 text-xs">{t('editor.benchLabel')}</span>
              {!activeSet.players.some(p => p.id === currentState.ball.holderId) && (
                <div
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('benchBall', 'true')
                    setIsDraggingBall(true)
                    const ghost = document.createElement('div')
                    ghost.style.cssText = 'position:fixed;top:-200px;left:-200px;font-size:28px;line-height:1;'
                    ghost.textContent = '🏀'
                    document.body.appendChild(ghost)
                    e.dataTransfer.setDragImage(ghost, 14, 14)
                    requestAnimationFrame(() => document.body.removeChild(ghost))
                  }}
                  onDragEnd={() => { setIsDraggingBall(false); setBallDragHoverId(null) }}
                  className="w-9 h-9 rounded-full flex items-center justify-center cursor-grab select-none bg-amber-500/20 border-2 border-amber-400 shrink-0"
                  style={{ fontSize: 20 }}
                  title={t('editor.ballDragTooltip')}
                >
                  🏀
                </div>
              )}
              {allBenchPlayers.filter(p => !inPlayIds.has(p.id) || p.id === benchHoverPlayer?.id).map(p => {
                const isHover = p.id === benchHoverPlayer?.id
                return isHover ? (
                  <div key={p.id} className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold select-none"
                      style={{ backgroundColor: p.team === 'offense' ? '#f97316' : '#1d4ed8', border: '2px dashed rgba(255,255,255,0.6)', opacity: 0.9 }}>
                      {p.number}
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center font-bold leading-none" style={{ fontSize: 12 }}>+</div>
                  </div>
                ) : (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('benchPlayerId', p.id)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-grab select-none shrink-0"
                    style={{ backgroundColor: p.team === 'offense' ? '#f97316' : '#1d4ed8', border: '2px dashed rgba(255,255,255,0.4)', opacity: 0.8 }}
                    title={p.team === 'offense' ? t('editor.offensePlayerDragTooltip', { num: p.number }) : t('editor.defensePlayerDragTooltip', { num: p.number })}
                  >
                    {p.number}
                  </div>
                )
              })}
            </div>
          )}
          </div>
        </div>

        <div className="hidden md:flex w-64 flex-col border-l border-slate-700">
          <ActionPanel />
        </div>
      </div>

      {/* Mobile bottom action toolbar — replaces the left sidebar on small screens */}
      <div id="tutorial-toolbar-mobile" className="md:hidden">
        <ActionToolbar
          layout="horizontal"
          activeType={actionCreation.type}
          ballHolderId={currentState.ball.holderId}
          hasDefenders={(activeSet?.players ?? []).some(p => p.team === 'defense')}
          onSelect={startActionCreation}
          onCancel={cancelAll}
          markingsEnabled={markingsEnabled}
          onToggleMarkings={handleToggleMarkings}
          gameOver={hasShotAction}
        />
      </div>


      <div id="tutorial-playback">
        <PlaybackControls
          onExport={() => setShowExport(true)}
          onSave={handleSave}
          canSave={activeSet.actions.length > 0 && isDirty}
          saveStatus={saveStatus}
          onShare={handleCloudShare}
          shareCopied={shareCopied}
        />
      </div>

      {saveDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 w-80 flex flex-col gap-4 shadow-2xl">
            <p className="text-white font-semibold text-center">{t('editor.saveBeforeLeaving')}</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-xs font-medium px-0.5 flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                {t('editor.saveDialogPlayNameLabel')}
              </label>
              <input
                value={saveDialogName}
                onChange={(e) => setSaveDialogName(e.target.value)}
                placeholder={t('common.untitledPlay')}
                className="w-full bg-slate-700/80 text-white font-semibold rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-500 border border-slate-600 focus:border-orange-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleSaveAndExit(saveDialogName)}
                className="w-full py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors"
              >{t('editor.saveAndExitButton')}</button>
              <button
                onClick={() => { setSaveDialogOpen(false); navigate('/') }}
                className="w-full py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors"
              >{t('editor.dontSaveButton')}</button>
              <button
                onClick={() => setSaveDialogOpen(false)}
                className="w-full py-2 text-slate-400 hover:text-white transition-colors text-sm"
              >{t('common.cancelButton')}</button>
            </div>
          </div>
        </div>
      )}

      {showExport && (
        <ExportModal
          stageRef={stageRef}
          stepMs={STEP_MS}
          onClose={() => setShowExport(false)}
        />
      )}

      {editingPlayerId && (() => {
        const player = activeSet.players.find(p => p.id === editingPlayerId)
        if (!player) return null
        return (
          <PlayerEditModal
            player={player}
            onSave={(updates) => updatePlayer(player.id, updates)}
            onClose={() => setEditingPlayerId(null)}
          />
        )
      })()}

      <TutorialOverlay />
    </div>
  )
}
