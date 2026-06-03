import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { nanoid } from 'nanoid'
import { useTranslation } from 'react-i18next'
import CourtCanvas from '../components/court/CourtCanvas'
import PlayerNode from '../components/players/PlayerNode'
import PlayerSetup from '../components/setup/PlayerSetup'
import FormationPicker from '../components/setup/FormationPicker'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import UserButton from '../components/ui/UserButton'
import { usePlayStore } from '../store/usePlayStore'
import type { Player, PositionMap, NormalizedPosition, PlaySet } from '../models/types'
import type { FormationPreset } from '../utils/formations'
import { HALF_COURT_W, FULL_COURT_H, COURT_PADDING_X, COURT_PADDING_Y } from '../utils/courtCoords'

type Step = 'info' | 'positions' | 'ball'

function buildPlayers(offenseCount: number, defenseCount: number): Player[] {
  const players: Player[] = []
  for (let i = 1; i <= offenseCount; i++)
    players.push({ id: `o${i}`, number: i, team: 'offense' })
  for (let i = 1; i <= defenseCount; i++)
    players.push({ id: `d${i}`, number: i, team: 'defense' })
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
  const { t } = useTranslation()
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
    if (!el) return
    const STAGE_W_VAL = HALF_COURT_W + 2 * COURT_PADDING_X
    function updateScale() {
      if (!el) return
      const aw = el.clientWidth - 32
      const ah = el.clientHeight - 16
      if (aw <= 0 || ah <= 0) return
      if (setupDraft.courtType === 'full') {
        setCourtScale(Math.min(aw / (FULL_COURT_H + 2 * COURT_PADDING_Y), ah / STAGE_W_VAL))
      } else {
        setCourtScale(Math.min(1, aw / STAGE_W_VAL))
      }
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

    if (formation.attackBasket) setAttackBasket(formation.attackBasket)
    if (formation.defaultBallHolder) setDraftBall({ holderId: formation.defaultBallHolder })
  }

  function handleReady(noBall = false) {
    const set: PlaySet = {
      id: nanoid(),
      name: setupDraft.name || t('common.untitledPlay'),
      courtType: setupDraft.courtType,
      attackBasket: setupDraft.courtType === 'full' ? attackBasket : undefined,
      players,
      initialPositions: draftPositions,
      initialBall: noBall ? { holderId: '' } : (draftBall ?? { holderId: '' }),
      actions: [],
    }
    saveSet(set)
    navigate(`/editor/${set.id}`)
  }

  if (step === 'info') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white transition-colors text-sm">{t('common.backButton')}</button>
              <h2 className="text-2xl font-bold text-white">{t('setup.newPlayTitle')}</h2>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <UserButton />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">{t('setup.playNameLabel')}</label>
            <input
              value={setupDraft.name}
              onChange={(e) => setSetupDraft({ name: e.target.value })}
              placeholder={t('setup.playNamePlaceholder')}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">{t('setup.courtTypeLabel')}</label>
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
                  {ct === 'half' ? t('common.halfCourt') : t('common.fullCourt')}
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
            {t('common.nextButton')}
          </button>
        </div>
      </div>
    )
  }

  const FlipButton = () => isLandscape ? (
    <button
      onClick={flipCourt}
      title={t('setup.flipTooltip')}
      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors text-xs"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/>
        <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
      </svg>
      {t('common.flipButton')}
    </button>
  ) : null

  if (step === 'positions') {
    return (
      <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-800 border-b border-slate-700">
          <button onClick={() => setStep('info')} className="text-slate-400 hover:text-white transition-colors text-sm shrink-0">{t('common.backButton')}</button>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-white font-semibold text-sm">{t('setup.startingFormationTitle')}</span>
            <FlipButton />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <LanguageSwitcher />
            <UserButton />
            <button
              onClick={() => {
                if (!draftBall) setDraftBall({ holderId: 'o1' })
                setStep('ball')
              }}
              className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-3 sm:px-4 py-1.5 rounded-lg text-sm transition-colors"
            >
              {t('common.nextButton')}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="p-2 md:border-r border-b md:border-b-0 border-slate-700 overflow-x-auto md:overflow-y-auto md:overflow-x-hidden shrink-0">
            <div className="flex flex-row md:flex-col gap-2 md:gap-4 w-max md:w-52">
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
              scale={courtScale}
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
          <p className="text-slate-400 text-sm">{t('setup.positionDragInstruction')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-800 border-b border-slate-700">
        <button onClick={() => setStep('positions')} className="text-slate-400 hover:text-white transition-colors text-sm shrink-0">{t('common.backButton')}</button>
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-2">
            <div className="text-white font-semibold text-sm">{t('setup.assignBallTitle')}</div>
            <FlipButton />
          </div>
          <div className="text-amber-400 text-xs font-medium">{t('setup.assignBallSubtitle')}</div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <LanguageSwitcher />
          <button
            onClick={() => handleReady(true)}
            className="bg-slate-600 hover:bg-slate-500 text-white font-semibold px-2.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm transition-colors"
          >
            {t('setup.noballButton')}
          </button>
          <button
            onClick={() => handleReady(false)}
            className="bg-green-600 hover:bg-green-500 text-white font-bold px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-sm transition-colors"
          >
            {t('setup.readyButton')}
          </button>
        </div>
      </div>

      <div ref={courtAreaRef} className="flex-1 flex items-center justify-center overflow-hidden">
        <CourtCanvas
          courtType={setupDraft.courtType}
          scale={courtScale}
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
