import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { nanoid } from 'nanoid'
import CourtCanvas from '../components/court/CourtCanvas'
import PlayerNode from '../components/players/PlayerNode'
import PlayerSetup from '../components/setup/PlayerSetup'
import FormationPicker from '../components/setup/FormationPicker'
import { usePlayStore } from '../store/usePlayStore'
import type { Player, PositionMap, NormalizedPosition, PlaySet } from '../models/types'
import type { FormationPreset } from '../utils/formations'
import { HALF_COURT_W, FULL_COURT_H, COURT_PADDING_X } from '../utils/courtCoords'

type Step = 'info' | 'positions' | 'ball'

function buildPlayers(offenseCount: number, defenseCount: number): Player[] {
  const players: Player[] = []
  for (let i = 1; i <= offenseCount; i++)
    players.push({ id: `o${i}`, number: i as 1|2|3|4|5, team: 'offense' })
  for (let i = 1; i <= defenseCount; i++)
    players.push({ id: `d${i}`, number: i as 1|2|3|4|5, team: 'defense' })
  return players
}

function defaultPositions(players: Player[]): PositionMap {
  const offPlayers = players.filter(p => p.team === 'offense')
  const defPlayers = players.filter(p => p.team === 'defense')
  const map: PositionMap = {}
  offPlayers.forEach((p, i) => {
    map[p.id] = { x: (i + 1) / (offPlayers.length + 1), y: 0.7 }
  })
  defPlayers.forEach((p, i) => {
    map[p.id] = { x: (i + 1) / (defPlayers.length + 1), y: 0.4 }
  })
  return map
}

export default function SetupPage() {
  const navigate = useNavigate()
  const {
    setupDraft, setSetupDraft,
    draftPositions, setDraftPositions, updateDraftPosition,
    draftBall, setDraftBall,
    saveSet,
  } = usePlayStore()

  const [step, setStep] = useState<Step>('info')
  const [selectedOffFormation, setSelectedOffFormation] = useState<string | undefined>()
  const [selectedDefFormation, setSelectedDefFormation] = useState<string | undefined>()
  const [attackBasket, setAttackBasket] = useState<'top' | 'bottom'>('top')

  const courtAreaRef = useRef<HTMLDivElement>(null)
  const [courtScale, setCourtScale] = useState(1)

  useEffect(() => {
    const el = courtAreaRef.current
    if (!el || setupDraft.courtType !== 'full') return
    const STAGE_W = HALF_COURT_W + 2 * COURT_PADDING_X
    function updateScale() {
      if (!el) return
      const aw = el.clientWidth - 32
      const ah = el.clientHeight - 16
      if (aw > 0 && ah > 0) setCourtScale(Math.min(aw / FULL_COURT_H, ah / STAGE_W))
    }
    updateScale()
    const ro = new ResizeObserver(updateScale)
    ro.observe(el)
    return () => ro.disconnect()
  }, [setupDraft.courtType, step])

  const players = buildPlayers(setupDraft.offenseCount, setupDraft.defenseCount)
  const isLandscape = setupDraft.courtType === 'full'

  function flipCourt() {
    setAttackBasket(prev => prev === 'top' ? 'bottom' : 'top')
    setDraftPositions(Object.fromEntries(
      Object.entries(draftPositions).map(([id, pos]) => [id, { x: pos.x, y: 1 - pos.y }])
    ))
  }

  function handleFormationSelect(team: 'offense' | 'defense', formation: FormationPreset) {
    if (team === 'offense') setSelectedOffFormation(formation.id)
    else setSelectedDefFormation(formation.id)

    if (formation.id === 'custom') return

    if (formation.id === 'man-to-man' && team === 'defense') {
      const hasOffense = Object.keys(draftPositions).some(k => k.startsWith('o'))
      if (hasOffense) {
        const merged = { ...draftPositions }
        for (let i = 1; i <= setupDraft.defenseCount; i++) {
          const offPos = draftPositions[`o${i}`]
          if (offPos) {
            merged[`d${i}`] = { x: offPos.x, y: Math.max(0, offPos.y - 0.05) }
          } else {
            const fallback = formation.positions[`d${i}`]
            if (fallback) merged[`d${i}`] = fallback
          }
        }
        setDraftPositions(merged)
        return
      }
    }

    const merged = { ...draftPositions }
    Object.entries(formation.positions).forEach(([key, pos]) => {
      merged[key] = pos
    })
    setDraftPositions(merged)
  }

  function handleReady() {
    if (!draftBall) {
      alert('Select a player to hold the ball!')
      return
    }
    const set: PlaySet = {
      id: nanoid(),
      name: setupDraft.name || 'Untitled Play',
      courtType: setupDraft.courtType,
      attackBasket: setupDraft.courtType === 'full' ? attackBasket : undefined,
      players,
      initialPositions: draftPositions,
      initialBall: draftBall,
      actions: [],
    }
    saveSet(set)
    navigate(`/editor/${set.id}`)
  }

  if (step === 'info') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-white">New Play</h2>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">Play Name</label>
            <input
              value={setupDraft.name}
              onChange={(e) => setSetupDraft({ name: e.target.value })}
              placeholder="e.g. Horns, Blob, 5-Out Motion"
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">Court Type</label>
            <div className="flex gap-3">
              {(['half', 'full'] as const).map((ct) => (
                <button
                  key={ct}
                  onClick={() => setSetupDraft({ courtType: ct })}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors border ${
                    setupDraft.courtType === ct
                      ? 'bg-orange-500 border-orange-400 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {ct === 'half' ? 'Half Court' : 'Full Court'}
                </button>
              ))}
            </div>
          </div>

          <PlayerSetup
            offenseCount={setupDraft.offenseCount}
            defenseCount={setupDraft.defenseCount}
            onChange={(o, d) => setSetupDraft({ offenseCount: o, defenseCount: d })}
          />

          <button
            onClick={() => {
              setDraftPositions(defaultPositions(players))
              setStep('positions')
            }}
            className="w-full bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    )
  }

  const FlipButton = () => isLandscape ? (
    <button
      onClick={flipCourt}
      title="Flip attack direction"
      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors text-xs"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/>
        <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
      </svg>
      Flip
    </button>
  ) : null

  if (step === 'positions') {
    return (
      <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
          <button onClick={() => setStep('info')} className="text-slate-400 hover:text-white transition-colors text-sm">← Back</button>
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold">Starting Formation</span>
            <FlipButton />
          </div>
          <button
            onClick={() => setStep('ball')}
            className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors"
          >
            Next →
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="p-2 border-r border-slate-700 overflow-y-auto">
            <div className="flex flex-col gap-4 w-52">
              {setupDraft.offenseCount > 0 && (
                <FormationPicker
                  team="offense"
                  courtType={setupDraft.courtType}
                  selectedId={selectedOffFormation}
                  onSelect={(f) => handleFormationSelect('offense', f)}
                />
              )}
              {setupDraft.defenseCount > 0 && (
                <FormationPicker
                  team="defense"
                  courtType={setupDraft.courtType}
                  selectedId={selectedDefFormation}
                  onSelect={(f) => handleFormationSelect('defense', f)}
                />
              )}
            </div>
          </div>

          <div ref={courtAreaRef} className="flex-1 flex items-center justify-center overflow-hidden">
            <CourtCanvas
              courtType={setupDraft.courtType}
              scale={isLandscape ? courtScale : 1}
              landscape={isLandscape}
              attackBasket={isLandscape ? attackBasket : undefined}
            >
              {players.map((p) => {
                const pos: NormalizedPosition = draftPositions[p.id] ?? { x: 0.5, y: 0.5 }
                return (
                  <PlayerNode
                    key={p.id}
                    player={p}
                    position={pos}
                    courtType={setupDraft.courtType}
                    landscape={isLandscape}
                    onDragEnd={(id, newPos) => updateDraftPosition(id, newPos.x, newPos.y)}
                  />
                )
              })}
            </CourtCanvas>
          </div>
        </div>

        <div className="px-4 py-2 bg-slate-800 border-t border-slate-700 text-center">
          <p className="text-slate-400 text-sm">Drag players to adjust their positions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <button onClick={() => setStep('positions')} className="text-slate-400 hover:text-white transition-colors text-sm">← Back</button>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <div className="text-white font-semibold">Assign Ball</div>
            <FlipButton />
          </div>
          <div className="text-slate-400 text-xs">Select who starts with the ball</div>
        </div>
        <button
          onClick={handleReady}
          className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors"
        >
          Ready ✓
        </button>
      </div>

      <div ref={courtAreaRef} className="flex-1 flex items-center justify-center overflow-hidden">
        <CourtCanvas
          courtType={setupDraft.courtType}
          scale={isLandscape ? courtScale : 1}
          landscape={isLandscape}
        >
          {players.map((p) => {
            const pos: NormalizedPosition = draftPositions[p.id] ?? { x: 0.5, y: 0.5 }
            return (
              <PlayerNode
                key={p.id}
                player={p}
                position={pos}
                courtType={setupDraft.courtType}
                landscape={isLandscape}
                hasBall={draftBall?.holderId === p.id}
                isSelected={draftBall?.holderId === p.id}
                onDragEnd={() => {}}
                onClick={p.team === 'offense' ? (id) => setDraftBall({ holderId: id }) : undefined}
              />
            )
          })}
        </CourtCanvas>
      </div>
    </div>
  )
}
