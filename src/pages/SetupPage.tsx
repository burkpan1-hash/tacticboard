import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { nanoid } from 'nanoid'
import CourtCanvas from '../components/court/CourtCanvas'
import PlayerNode from '../components/players/PlayerNode'
import PlayerSetup from '../components/setup/PlayerSetup'
import FormationPicker from '../components/setup/FormationPicker'
import { usePlayStore } from '../store/usePlayStore'
import type { Player, PositionMap, NormalizedPosition, PlaySet } from '../models/types'
import type { FormationPreset } from '../utils/formations'

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

  const players = buildPlayers(setupDraft.offenseCount, setupDraft.defenseCount)

  function handleFormationSelect(team: 'offense' | 'defense', formation: FormationPreset) {
    if (team === 'offense') setSelectedOffFormation(formation.id)
    else setSelectedDefFormation(formation.id)

    if (formation.id === 'custom') return

    const merged = { ...draftPositions }
    Object.entries(formation.positions).forEach(([key, pos]) => {
      merged[key] = pos
    })
    setDraftPositions(merged)
  }

  function handleReady() {
    if (!draftBall) {
      alert('Topu bir oyuncuya ver!')
      return
    }
    const set: PlaySet = {
      id: nanoid(),
      name: setupDraft.name || 'İsimsiz Set',
      courtType: setupDraft.courtType,
      players,
      initialPositions: draftPositions,
      initialBall: draftBall,
      actions: [],
    }
    saveSet(set)
    navigate(`/editor/${set.id}`)
  }

  // ── Step: Info ────────────────────────────────────────────────
  if (step === 'info') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-white">Yeni Set</h2>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">Set İsmi</label>
            <input
              value={setupDraft.name}
              onChange={(e) => setSetupDraft({ name: e.target.value })}
              placeholder="örn. Horns, Blob, 5-Out Motion"
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">Kort Tipi</label>
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
                  {ct === 'half' ? 'Yarım Kort' : 'Tam Kort'}
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
            İleri →
          </button>
        </div>
      </div>
    )
  }

  // ── Step: Positions ───────────────────────────────────────────
  if (step === 'positions') {
    return (
      <div className="min-h-screen flex flex-col items-center p-6 gap-6">
        <h2 className="text-xl font-bold text-white">Başlangıç Dizilimi</h2>

        <div className="w-full max-w-sm space-y-4">
          {setupDraft.offenseCount > 0 && (
            <FormationPicker
              team="offense"
              selectedId={selectedOffFormation}
              onSelect={(f) => handleFormationSelect('offense', f)}
            />
          )}
          {setupDraft.defenseCount > 0 && (
            <FormationPicker
              team="defense"
              selectedId={selectedDefFormation}
              onSelect={(f) => handleFormationSelect('defense', f)}
            />
          )}
        </div>

        <CourtCanvas courtType={setupDraft.courtType}>
          {players.map((p) => {
            const pos: NormalizedPosition = draftPositions[p.id] ?? { x: 0.5, y: 0.5 }
            return (
              <PlayerNode
                key={p.id}
                player={p}
                position={pos}
                courtType={setupDraft.courtType}
                onDragEnd={(id, newPos) => updateDraftPosition(id, newPos.x, newPos.y)}
              />
            )
          })}
        </CourtCanvas>

        <p className="text-slate-400 text-sm">Oyuncuları sürükleyerek pozisyonlarını ayarla</p>

        <div className="flex gap-4">
          <button onClick={() => setStep('info')} className="text-slate-400 hover:text-white transition-colors">
            ← Geri
          </button>
          <button
            onClick={() => setStep('ball')}
            className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-2 rounded-xl transition-colors"
          >
            İleri →
          </button>
        </div>
      </div>
    )
  }

  // ── Step: Ball assignment ────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center p-6 gap-6">
      <h2 className="text-xl font-bold text-white">Topu Ver</h2>
      <p className="text-slate-400 text-sm">Başlangıçta topu kimin tutacağını seç</p>

      <CourtCanvas courtType={setupDraft.courtType}>
        {players.map((p) => {
          const pos: NormalizedPosition = draftPositions[p.id] ?? { x: 0.5, y: 0.5 }
          return (
            <PlayerNode
              key={p.id}
              player={p}
              position={pos}
              courtType={setupDraft.courtType}
              hasBall={draftBall?.holderId === p.id}
              isSelected={draftBall?.holderId === p.id}
              onDragEnd={() => {}}
              onClick={(id) => setDraftBall({ holderId: id })}
            />
          )
        })}
      </CourtCanvas>

      <div className="flex gap-4">
        <button onClick={() => setStep('positions')} className="text-slate-400 hover:text-white transition-colors">
          ← Geri
        </button>
        <button
          onClick={handleReady}
          className="bg-green-600 hover:bg-green-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Hazır ✓
        </button>
      </div>
    </div>
  )
}
