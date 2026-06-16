import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type {
  CourtType, PositionMap, BallState,
  PlaySet, Action, ActionItem, ActionGroup, ActionType, Player, NormalizedPosition, Team,
} from '../models/types'
import { validateGroupAction, validateGroupActions, validateGroupActionType } from '../utils/groupValidation'

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

  // ── Group recording ──────────────────────────────────────────
  isRecordingGroup: boolean
  currentRecordingGroupId: string | null
  groupConflictError: string | null
  startGroupRecording: () => void
  stopGroupRecording: () => void
  clearGroupConflictError: () => void

  // ── Post-hoc grouping ────────────────────────────────────────
  createGroup: (actionIds: string[]) => void
  ungroupGroup: (groupId: string) => void

  // ── Option text ──────────────────────────────────────────────
  setOptionText: (actionId: string, text: string) => void
  setGroupName: (groupId: string, name: string) => void
  setGroupOptionText: (groupId: string, text: string) => void

  // ── Position edits ───────────────────────────────────────────
  updateInitialPosition: (playerId: string, pos: NormalizedPosition) => void

  // ── Bench ────────────────────────────────────────────────────
  addPlayerToCourt: (playerId: string, position: NormalizedPosition) => void
  removePlayerFromCourt: (playerId: string) => void
  setInitialBall: (playerId: string) => void

  // ── Player metadata (jersey number, name) ────────────────────
  updatePlayer: (playerId: string, updates: Partial<Pick<Player, 'number' | 'name' | 'color'>>) => void

  // ── Markings ─────────────────────────────────────────────────
  updateMarkings: (markings: Record<string, string>) => void
  toggleArrowTeam: (team: Team) => void

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

// Returns true if the action involves the given player id
function actionInvolvesPlayer(a: Action, playerId: string): boolean {
  switch (a.type) {
    case 'pass':         return a.fromId === playerId || a.toId === playerId
    case 'dribble':      return a.playerId === playerId
    case 'cut':          return a.playerId === playerId
    case 'screen':       return a.screenerId === playerId
    case 'defense-move': return a.playerId === playerId
    case 'double-team':  return a.defender1Id === playerId || a.defender2Id === playerId || a.targetId === playerId
    case 'ball-force':   return a.defenderId === playerId || a.targetId === playerId
    case 'shot':         return a.shooterId === playerId
    case 'handoff':      return a.fromId === playerId || a.toId === playerId
    default: return false
  }
}

// Filter actions in an ActionItem[], removing references to a player.
// Groups with 0 remaining actions are dropped; groups with 1 are collapsed to a plain action.
function filterItemsForPlayer(items: ActionItem[], playerId: string): ActionItem[] {
  const result: ActionItem[] = []
  for (const item of items) {
    if (item.type === 'group') {
      const kept = item.actions.filter(a => !actionInvolvesPlayer(a, playerId))
      if (kept.length === 0) continue
      if (kept.length === 1) { result.push(kept[0]); continue }
      result.push({ ...item, actions: kept })
    } else {
      if (!actionInvolvesPlayer(item, playerId)) result.push(item)
    }
  }
  return result
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
    activeStep: s.activeSet?.id !== newSet.id ? newSet.actions.length : s.activeStep,
    isRecordingGroup: false,
    currentRecordingGroupId: null,
  })),

  activeStep: 0,
  setActiveStep: (activeStep) => set({ activeStep }),

  isRecordingGroup: false,
  currentRecordingGroupId: null,
  groupConflictError: null,

  clearGroupConflictError: () => set({ groupConflictError: null }),

  addAction: (action) => {
    set(s => {
      if (!s.activeSet) return s
      let updated: PlaySet
      if (s.isRecordingGroup && s.currentRecordingGroupId) {
        // Validate against existing group actions before appending
        const group = s.activeSet.actions.find(
          item => item.type === 'group' && item.id === s.currentRecordingGroupId
        ) as ActionGroup | undefined
        const existingGroupActions = group?.actions ?? []
        const conflict = validateGroupAction(action, existingGroupActions)
        if (conflict) {
          setTimeout(() => get().clearGroupConflictError(), 6000)
          return { groupConflictError: conflict, actionCreation: EMPTY_CREATION }
        }
        updated = {
          ...s.activeSet,
          actions: s.activeSet.actions.map(item =>
            item.type === 'group' && item.id === s.currentRecordingGroupId
              ? { ...item, actions: [...item.actions, action] }
              : item
          ),
        }
        get().saveSet(updated)
        return { activeSet: updated, actionCreation: EMPTY_CREATION }
      }
      updated = { ...s.activeSet, actions: [...s.activeSet.actions, action] }
      get().saveSet(updated)
      return { activeSet: updated, activeStep: updated.actions.length, actionCreation: EMPTY_CREATION }
    })
  },

  deleteAction: (actionId) => {
    set(s => {
      if (!s.activeSet) return s
      const newActions: ActionItem[] = []
      for (const item of s.activeSet.actions) {
        if (item.type === 'group') {
          // Remove the action from inside the group
          const kept = item.actions.filter(a => a.id !== actionId)
          if (kept.length === 0) continue
          if (kept.length === 1) { newActions.push(kept[0]); continue }
          newActions.push({ ...item, actions: kept })
        } else if (item.id !== actionId) {
          newActions.push(item)
        }
      }
      const updated = { ...s.activeSet, actions: newActions }
      const clampedStep = Math.min(s.activeStep, updated.actions.length)
      get().saveSet(updated)
      return { activeSet: updated, activeStep: clampedStep }
    })
  },

  updateAction: (actionId, updatedAction) => {
    set(s => {
      if (!s.activeSet) return s
      const newActions: ActionItem[] = s.activeSet.actions.map(item => {
        if (item.type === 'group') {
          return { ...item, actions: item.actions.map(a => a.id === actionId ? updatedAction : a) }
        }
        return item.id === actionId ? updatedAction : item
      })
      const updated = { ...s.activeSet, actions: newActions }
      get().saveSet(updated)
      return { activeSet: updated, actionCreation: EMPTY_CREATION }
    })
  },

  clearAllActions: () => {
    set(s => {
      if (!s.activeSet) return s
      const updated = { ...s.activeSet, actions: [] }
      get().saveSet(updated)
      return { activeSet: updated, activeStep: 0, actionCreation: EMPTY_CREATION, isRecordingGroup: false, currentRecordingGroupId: null }
    })
  },

  undoLastAction: () => {
    set(s => {
      if (!s.activeSet || s.activeSet.actions.length === 0) return s
      // If recording, undo the last action inside the group
      if (s.isRecordingGroup && s.currentRecordingGroupId) {
        const newActions: ActionItem[] = s.activeSet.actions.map(item => {
          if (item.type === 'group' && item.id === s.currentRecordingGroupId) {
            return { ...item, actions: item.actions.slice(0, -1) }
          }
          return item
        })
        const updated = { ...s.activeSet, actions: newActions }
        get().saveSet(updated)
        return { activeSet: updated, actionCreation: EMPTY_CREATION }
      }
      const updated = { ...s.activeSet, actions: s.activeSet.actions.slice(0, -1) }
      const newStep = Math.min(s.activeStep, updated.actions.length)
      get().saveSet(updated)
      return { activeSet: updated, activeStep: newStep, actionCreation: EMPTY_CREATION }
    })
  },

  startGroupRecording: () => {
    set(s => {
      if (!s.activeSet || s.isRecordingGroup) return s
      const newGroup: ActionGroup = { id: nanoid(), type: 'group', actions: [] }
      const updated = { ...s.activeSet, actions: [...s.activeSet.actions, newGroup] }
      get().saveSet(updated)
      return {
        activeSet: updated,
        activeStep: updated.actions.length,
        isRecordingGroup: true,
        currentRecordingGroupId: newGroup.id,
      }
    })
  },

  stopGroupRecording: () => {
    set(s => {
      if (!s.activeSet || !s.currentRecordingGroupId) return s
      const group = s.activeSet.actions.find(
        item => item.type === 'group' && item.id === s.currentRecordingGroupId
      ) as ActionGroup | undefined

      let newActions: ActionItem[]
      if (!group || group.actions.length === 0) {
        // Empty group — remove it
        newActions = s.activeSet.actions.filter(item => item.id !== s.currentRecordingGroupId)
      } else if (group.actions.length === 1) {
        // Only one action — collapse the group
        newActions = s.activeSet.actions.flatMap(item =>
          item.type === 'group' && item.id === s.currentRecordingGroupId
            ? (item as ActionGroup).actions
            : [item]
        )
      } else {
        newActions = s.activeSet.actions
      }

      const updated = { ...s.activeSet, actions: newActions }
      get().saveSet(updated)
      return {
        activeSet: updated,
        activeStep: updated.actions.length,
        isRecordingGroup: false,
        currentRecordingGroupId: null,
      }
    })
  },

  createGroup: (actionIds) => {
    set(s => {
      if (!s.activeSet || actionIds.length < 2) return s
      const idSet = new Set(actionIds)
      // Only top-level non-group actions can be grouped
      const selectedActions = s.activeSet.actions
        .filter(item => item.type !== 'group' && idSet.has(item.id))
        .map(item => item as Action)

      if (selectedActions.length < 2) return s

      const conflict = validateGroupActions(selectedActions)
      if (conflict) {
        setTimeout(() => get().clearGroupConflictError(), 6000)
        return { groupConflictError: conflict }
      }

      const newGroup: ActionGroup = { id: nanoid(), type: 'group', actions: selectedActions }
      let inserted = false
      const result: ActionItem[] = []
      for (const item of s.activeSet.actions) {
        if (item.type !== 'group' && idSet.has(item.id)) {
          if (!inserted) { result.push(newGroup); inserted = true }
          // skip — now inside the group
        } else {
          result.push(item)
        }
      }

      const updated = { ...s.activeSet, actions: result }
      const newStep = Math.min(s.activeStep, updated.actions.length)
      get().saveSet(updated)
      return { activeSet: updated, activeStep: newStep }
    })
  },

  ungroupGroup: (groupId) => {
    set(s => {
      if (!s.activeSet) return s
      const newActions: ActionItem[] = []
      for (const item of s.activeSet.actions) {
        if (item.type === 'group' && item.id === groupId) {
          newActions.push(...item.actions)
        } else {
          newActions.push(item)
        }
      }
      const updated = { ...s.activeSet, actions: newActions }
      const newStep = Math.min(s.activeStep, updated.actions.length)
      get().saveSet(updated)
      return { activeSet: updated, activeStep: newStep }
    })
  },

  setOptionText: (actionId, text) => {
    set(s => {
      if (!s.activeSet) return s
      const newActions: ActionItem[] = s.activeSet.actions.map(item => {
        if (item.type === 'group') {
          return { ...item, actions: item.actions.map(a =>
            a.id === actionId ? { ...a, optionText: text.trim() || undefined } : a
          )}
        }
        return item.id === actionId ? { ...item, optionText: text.trim() || undefined } : item
      })
      const updated = { ...s.activeSet, actions: newActions }
      get().saveSet(updated)
      return { activeSet: updated }
    })
  },

  setGroupName: (groupId, name) => {
    set(s => {
      if (!s.activeSet) return s
      const newActions: ActionItem[] = s.activeSet.actions.map(item =>
        item.type === 'group' && item.id === groupId
          ? { ...item, name: name.trim() || undefined }
          : item
      )
      const updated = { ...s.activeSet, actions: newActions }
      get().saveSet(updated)
      return { activeSet: updated }
    })
  },

  setGroupOptionText: (groupId, text) => {
    set(s => {
      if (!s.activeSet) return s
      const newActions: ActionItem[] = s.activeSet.actions.map(item =>
        item.type === 'group' && item.id === groupId
          ? { ...item, optionText: text.trim() || undefined }
          : item
      )
      const updated = { ...s.activeSet, actions: newActions }
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
      const number = parseInt(playerId.slice(1))
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

  removePlayerFromCourt: (playerId) => {
    set(s => {
      if (!s.activeSet) return s
      const positions = { ...s.activeSet.initialPositions }
      delete positions[playerId]
      const updated: PlaySet = {
        ...s.activeSet,
        players: s.activeSet.players.filter(p => p.id !== playerId),
        initialPositions: positions,
        initialBall: s.activeSet.initialBall.holderId === playerId ? { holderId: '' } : s.activeSet.initialBall,
        actions: filterItemsForPlayer(s.activeSet.actions, playerId),
      }
      get().saveSet(updated)
      return { activeSet: updated }
    })
  },

  setInitialBall: (playerId) => {
    set(s => {
      if (!s.activeSet) return s
      const updated: PlaySet = { ...s.activeSet, initialBall: { holderId: playerId } }
      get().saveSet(updated)
      return { activeSet: updated }
    })
  },

  updatePlayer: (playerId, updates) => {
    set(s => {
      if (!s.activeSet) return s
      const target = s.activeSet.players.find(p => p.id === playerId)
      if (!target) return s
      // Color is a team-wide setting: changing one player recolors the whole team
      // (offense or defense). Name/number stay per-player.
      const teamColor = updates.color === undefined ? undefined : (updates.color || undefined)
      const players = s.activeSet.players.map(p => {
        const color = (updates.color !== undefined && p.team === target.team) ? teamColor : p.color
        if (p.id !== playerId) return { ...p, color }
        const nextName = updates.name === undefined ? p.name : (updates.name.trim() || undefined)
        const nextNum = updates.number === undefined ? p.number : updates.number
        return { ...p, number: nextNum, name: nextName, color }
      })
      const updated: PlaySet = { ...s.activeSet, players }
      get().saveSet(updated)
      return { activeSet: updated }
    })
  },

  actionCreation: EMPTY_CREATION,
  startActionCreation: (type) => {
    const s = get()
    if (s.isRecordingGroup && s.currentRecordingGroupId) {
      const group = s.activeSet?.actions.find(
        item => item.type === 'group' && item.id === s.currentRecordingGroupId
      ) as ActionGroup | undefined
      const conflict = validateGroupActionType(type, group?.actions ?? [])
      if (conflict) {
        set({ groupConflictError: conflict })
        setTimeout(() => get().clearGroupConflictError(), 6000)
        return
      }
    }
    set({ actionCreation: { type, pendingSourceId: null, editingActionId: null } })
  },
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

  toggleArrowTeam: (team) => {
    set(s => {
      if (!s.activeSet) return s
      const current = s.activeSet.hiddenArrowTeams ?? []
      const next = current.includes(team) ? current.filter(t => t !== team) : [...current, team]
      const updated: PlaySet = { ...s.activeSet, hiddenArrowTeams: next.length ? next : undefined }
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
            return { ...action, toPosition: mirror(action.toPosition), waypoints: action.waypoints?.map(mirror) }
          case 'screen':
            return { ...action, screenPosition: mirror(action.screenPosition) }
          case 'handoff':
            return { ...action, meetPosition: mirror(action.meetPosition) }
          case 'ball-force':
            return { ...action, angle: -action.angle }
          default:
            return action
        }
      }
      const mirrorItem = (item: ActionItem): ActionItem => {
        if (item.type === 'group') return { ...item, actions: item.actions.map(mirrorAction) }
        return mirrorAction(item)
      }
      const updated: PlaySet = {
        ...s.activeSet,
        attackBasket: (s.activeSet.attackBasket ?? 'top') === 'top' ? 'bottom' : 'top',
        initialPositions: Object.fromEntries(
          Object.entries(s.activeSet.initialPositions).map(([id, pos]) => [id, mirror(pos)])
        ),
        actions: s.activeSet.actions.map(mirrorItem),
      }
      get().saveSet(updated)
      return { activeSet: updated }
    })
  },
}))
