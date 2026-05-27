import { create } from 'zustand'
import type {
  CourtType, PositionMap, BallState,
  PlaySet, Action, ActionType, Player, NormalizedPosition,
} from '../models/types'

interface SetupDraft {
  name: string
  courtType: CourtType
  offenseCount: number
  defenseCount: number
}

interface ActionCreation {
  type: ActionType | null
  pendingSourceId: string | null
  editingActionId: string | null
}

interface PlayStoreState {
  // ── Setup ────────────────────────────────────────────────────
  setupDraft: SetupDraft
  setSetupDraft: (draft: Partial<SetupDraft>) => void
  draftPositions: PositionMap
  setDraftPositions: (p: PositionMap) => void
  updateDraftPosition: (id: string, x: number, y: number) => void
  draftBall: BallState | null
  setDraftBall: (b: BallState) => void

  // ── Persistence ──────────────────────────────────────────────
  savedSets: PlaySet[]
  saveSet: (set: PlaySet) => void
  deleteSet: (id: string) => void
  loadSetsFromStorage: () => void

  // ── Editor ───────────────────────────────────────────────────
  activeSet: PlaySet | null
  setActiveSet: (set: PlaySet) => void

  activeStep: number
  setActiveStep: (step: number) => void

  // ── Action CRUD ──────────────────────────────────────────────
  addAction: (action: Action) => void
  deleteAction: (actionId: string) => void
  updateAction: (actionId: string, updated: Action) => void
  clearAllActions: () => void
  undoLastAction: () => void

  // ── Option text ──────────────────────────────────────────────
  setOptionText: (actionId: string, text: string) => void

  // ── Position edits ───────────────────────────────────────────
  updateInitialPosition: (playerId: string, pos: NormalizedPosition) => void

  // ── Bench ────────────────────────────────────────────────────
  addPlayerToCourt: (playerId: string, position: NormalizedPosition) => void

  // ── Markings ─────────────────────────────────────────────────
  updateMarkings: (markings: Record<string, string>) => void

  // ── Action creation UI state ─────────────────────────────────
  actionCreation: ActionCreation
  startActionCreation: (type: ActionType) => void
  setPendingSource: (playerId: string) => void
  cancelActionCreation: () => void

  // ── Court flip ───────────────────────────────────────────────
  flipAttackBasket: () => void

  // ── Playback ─────────────────────────────────────────────────
  isPlaying: boolean
  playbackSpeed: number
  setIsPlaying: (v: boolean) => void
  setPlaybackSpeed: (v: number) => void
}

const EMPTY_CREATION: ActionCreation = {
  type: null, pendingSourceId: null, editingActionId: null,
}

function persistSets(sets: PlaySet[]) {
  localStorage.setItem('setplay_sets', JSON.stringify(sets))
}

export const usePlayStore = create<PlayStoreState>((set, get) => ({
  setupDraft: { name: '', courtType: 'half', offenseCount: 5, defenseCount: 0 },
  setSetupDraft: (draft) => set(s => ({ setupDraft: { ...s.setupDraft, ...draft } })),
  draftPositions: {},
  setDraftPositions: (draftPositions) => set({ draftPositions }),
  updateDraftPosition: (id, x, y) => set(s => ({
    draftPositions: { ...s.draftPositions, [id]: { x, y } },
  })),
  draftBall: null,
  setDraftBall: (draftBall) => set({ draftBall }),

  savedSets: [],
  saveSet: (newSet) => {
    set(s => {
      const idx = s.savedSets.findIndex(x => x.id === newSet.id)
      const updated = idx >= 0
        ? s.savedSets.map(x => x.id === newSet.id ? newSet : x)
        : [...s.savedSets, newSet]
      persistSets(updated)
      return { savedSets: updated }
    })
  },
  deleteSet: (id) => {
    set(s => {
      const updated = s.savedSets.filter(x => x.id !== id)
      persistSets(updated)
      return { savedSets: updated }
    })
  },
  loadSetsFromStorage: () => {
    try {
      const raw = localStorage.getItem('setplay_sets')
      if (raw) set({ savedSets: JSON.parse(raw) })
    } catch { /* corrupt storage */ }
  },

  activeSet: null,
  setActiveSet: (newSet) => set(s => ({
    activeSet: newSet,
    activeStep: s.activeSet?.id !== newSet.id ? 0 : s.activeStep,
  })),

  activeStep: 0,
  setActiveStep: (activeStep) => set({ activeStep }),

  addAction: (action) => {
    set(s => {
      if (!s.activeSet) return s
      const updated = { ...s.activeSet, actions: [...s.activeSet.actions, action] }
      get().saveSet(updated)
      return { activeSet: updated, activeStep: updated.actions.length, actionCreation: EMPTY_CREATION }
    })
  },

  deleteAction: (actionId) => {
    set(s => {
      if (!s.activeSet) return s
      const updated = { ...s.activeSet, actions: s.activeSet.actions.filter(a => a.id !== actionId) }
      const clampedStep = Math.min(s.activeStep, updated.actions.length)
      get().saveSet(updated)
      return { activeSet: updated, activeStep: clampedStep }
    })
  },

  updateAction: (actionId, updatedAction) => {
    set(s => {
      if (!s.activeSet) return s
      const updated = {
        ...s.activeSet,
        actions: s.activeSet.actions.map(a => a.id === actionId ? updatedAction : a),
      }
      get().saveSet(updated)
      return { activeSet: updated, actionCreation: EMPTY_CREATION }
    })
  },

  clearAllActions: () => {
    set(s => {
      if (!s.activeSet) return s
      const updated = { ...s.activeSet, actions: [] }
      get().saveSet(updated)
      return { activeSet: updated, activeStep: 0, actionCreation: EMPTY_CREATION }
    })
  },

  undoLastAction: () => {
    set(s => {
      if (!s.activeSet || s.activeSet.actions.length === 0) return s
      const updated = { ...s.activeSet, actions: s.activeSet.actions.slice(0, -1) }
      const newStep = Math.min(s.activeStep, updated.actions.length)
      get().saveSet(updated)
      return { activeSet: updated, activeStep: newStep, actionCreation: EMPTY_CREATION }
    })
  },

  setOptionText: (actionId, text) => {
    set(s => {
      if (!s.activeSet) return s
      const updated = {
        ...s.activeSet,
        actions: s.activeSet.actions.map(a =>
          a.id === actionId ? { ...a, optionText: text.trim() || undefined } : a
        ),
      }
      get().saveSet(updated)
      return { activeSet: updated }
    })
  },

  updateInitialPosition: (playerId, pos) => {
    set(s => {
      if (!s.activeSet) return s
      const updated = { ...s.activeSet, initialPositions: { ...s.activeSet.initialPositions, [playerId]: pos } }
      get().saveSet(updated)
      return { activeSet: updated }
    })
  },

  addPlayerToCourt: (playerId, position) => {
    set(s => {
      if (!s.activeSet) return s
      const isOffense = playerId.startsWith('o')
      const number = parseInt(playerId.slice(1)) as Player['number']
      const newPlayer: Player = { id: playerId, number, team: isOffense ? 'offense' : 'defense' }
      const updated: PlaySet = {
        ...s.activeSet,
        players: [...s.activeSet.players, newPlayer],
        initialPositions: { ...s.activeSet.initialPositions, [playerId]: position },
      }
      get().saveSet(updated)
      return { activeSet: updated }
    })
  },

  actionCreation: EMPTY_CREATION,
  startActionCreation: (type) => set({ actionCreation: { type, pendingSourceId: null, editingActionId: null } }),
  setPendingSource: (playerId) => set(s => ({
    actionCreation: { ...s.actionCreation, pendingSourceId: playerId },
  })),
  cancelActionCreation: () => set({ actionCreation: EMPTY_CREATION }),

  isPlaying: false,
  playbackSpeed: 1,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),

  updateMarkings: (markings) => {
    set(s => {
      if (!s.activeSet) return s
      const updated: PlaySet = { ...s.activeSet, markings }
      get().saveSet(updated)
      return { activeSet: updated }
    })
  },

  flipAttackBasket: () => {
    set(s => {
      if (!s.activeSet || s.activeSet.courtType !== 'full') return s
      const mirror = (p: NormalizedPosition): NormalizedPosition => ({ x: p.x, y: 1 - p.y })
      const mirrorAction = (action: Action): Action => {
        switch (action.type) {
          case 'cut':
          case 'dribble':
            return { ...action, toPosition: mirror(action.toPosition), waypoints: action.waypoints?.map(mirror) }
          case 'defense-move':
            return { ...action, toPosition: mirror(action.toPosition) }
          case 'screen':
            return { ...action, screenPosition: mirror(action.screenPosition) }
          case 'handoff':
            return { ...action, meetPosition: mirror(action.meetPosition) }
          case 'ball-force':
            return { ...action, forcePosition: mirror(action.forcePosition) }
          default:
            return action
        }
      }
      const updated: PlaySet = {
        ...s.activeSet,
        attackBasket: (s.activeSet.attackBasket ?? 'top') === 'top' ? 'bottom' : 'top',
        initialPositions: Object.fromEntries(
          Object.entries(s.activeSet.initialPositions).map(([id, pos]) => [id, mirror(pos)])
        ),
        actions: s.activeSet.actions.map(mirrorAction),
      }
      get().saveSet(updated)
      return { activeSet: updated }
    })
  },
}))
