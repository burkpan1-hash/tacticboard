import { create } from 'zustand'
import type {
  CourtType, PositionMap, BallState,
  PlaySet, Action, ActionType,
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
  undoLastAction: () => void

  // ── Option text ──────────────────────────────────────────────
  setOptionText: (actionId: string, text: string) => void

  // ── Action creation UI state ─────────────────────────────────
  actionCreation: ActionCreation
  startActionCreation: (type: ActionType) => void
  setPendingSource: (playerId: string) => void
  cancelActionCreation: () => void
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
  setActiveSet: (activeSet) => set({ activeSet, activeStep: 0 }),

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

  undoLastAction: () => {
    set(s => {
      if (!s.activeSet || s.activeSet.actions.length === 0) return s
      const updated = { ...s.activeSet, actions: s.activeSet.actions.slice(0, -1) }
      const newStep = Math.min(s.activeStep, updated.actions.length)
      get().saveSet(updated)
      return { activeSet: updated, activeStep: newStep }
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

  actionCreation: EMPTY_CREATION,
  startActionCreation: (type) => set({ actionCreation: { type, pendingSourceId: null, editingActionId: null } }),
  setPendingSource: (playerId) => set(s => ({
    actionCreation: { ...s.actionCreation, pendingSourceId: playerId },
  })),
  cancelActionCreation: () => set({ actionCreation: EMPTY_CREATION }),
}))
