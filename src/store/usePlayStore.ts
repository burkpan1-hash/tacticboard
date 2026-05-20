import { create } from 'zustand'
import type { CourtType, PositionMap, BallState, PlaySet } from '../models/types'

interface SetupDraft {
  name: string
  courtType: CourtType
  offenseCount: number
  defenseCount: number
}

interface PlayStoreState {
  setupDraft: SetupDraft
  setSetupDraft: (draft: Partial<SetupDraft>) => void

  activeSet: PlaySet | null
  setActiveSet: (set: PlaySet) => void

  savedSets: PlaySet[]
  saveSet: (set: PlaySet) => void
  deleteSet: (id: string) => void
  loadSetsFromStorage: () => void

  draftPositions: PositionMap
  setDraftPositions: (positions: PositionMap) => void
  updateDraftPosition: (playerId: string, x: number, y: number) => void

  draftBall: BallState | null
  setDraftBall: (ball: BallState) => void
}

export const usePlayStore = create<PlayStoreState>((set) => ({
  setupDraft: {
    name: '',
    courtType: 'half',
    offenseCount: 5,
    defenseCount: 0,
  },
  setSetupDraft: (draft) =>
    set((s) => ({ setupDraft: { ...s.setupDraft, ...draft } })),

  activeSet: null,
  setActiveSet: (activeSet) => set({ activeSet }),

  savedSets: [],
  saveSet: (newSet) => {
    set((s) => {
      const idx = s.savedSets.findIndex((x) => x.id === newSet.id)
      const updated =
        idx >= 0
          ? s.savedSets.map((x) => (x.id === newSet.id ? newSet : x))
          : [...s.savedSets, newSet]
      localStorage.setItem('setplay_sets', JSON.stringify(updated))
      return { savedSets: updated }
    })
  },
  deleteSet: (id) => {
    set((s) => {
      const updated = s.savedSets.filter((x) => x.id !== id)
      localStorage.setItem('setplay_sets', JSON.stringify(updated))
      return { savedSets: updated }
    })
  },
  loadSetsFromStorage: () => {
    try {
      const raw = localStorage.getItem('setplay_sets')
      if (raw) set({ savedSets: JSON.parse(raw) })
    } catch {
      // corrupt storage — ignore
    }
  },

  draftPositions: {},
  setDraftPositions: (draftPositions) => set({ draftPositions }),
  updateDraftPosition: (playerId, x, y) =>
    set((s) => ({
      draftPositions: { ...s.draftPositions, [playerId]: { x, y } },
    })),

  draftBall: null,
  setDraftBall: (draftBall) => set({ draftBall }),
}))
