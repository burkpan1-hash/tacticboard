import { useEffect, useRef } from 'react'
import type { ActionType } from '../models/types'

export const IS_MAC = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)
export const MOD_KEY = IS_MAC ? '⌘' : 'Ctrl'

export const ACTION_SHORTCUTS: Record<ActionType, string> = {
  pass: 'P',
  dribble: 'D',
  cut: 'C',
  screen: 'R',
  shot: 'S',
  handoff: 'H',
  'defense-move': 'M',
  'double-team': 'T',
  'ball-force': 'F',
}

const KEY_TO_ACTION: Record<string, ActionType> = Object.fromEntries(
  Object.entries(ACTION_SHORTCUTS).map(([type, key]) => [key.toLowerCase(), type as ActionType]),
)

export interface EditorShortcutsOptions {
  enabled?: boolean
  onAction: (type: ActionType) => void
  onCancel: () => void
  onUndo: () => void
  onPlayPause: () => void
  onStepBack: () => void
  onStepForward: () => void
  onGoToStart: () => void
  onGoToEnd: () => void
  onSave?: () => void
  canSave: boolean
  onExport?: () => void
  canExport: boolean
  onShare?: () => void
  canShare: boolean
  onToggleMarkings: () => void
  canToggleMarkings: boolean
  canStartAction: (type: ActionType) => boolean
}

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false
  const tag = el.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if ((el as HTMLElement).isContentEditable) return true
  return false
}

export function useEditorShortcuts(opts: EditorShortcutsOptions) {
  // Use a ref so we don't re-bind the listener on every parent render.
  const optsRef = useRef(opts)
  optsRef.current = opts

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const o = optsRef.current
      if (o.enabled === false) return
      if (isTypingTarget(document.activeElement)) return

      const mod = e.metaKey || e.ctrlKey
      const k = e.key.toLowerCase()

      if (mod) {
        if (k === 'z' && !e.shiftKey) { e.preventDefault(); o.onUndo(); return }
        if (k === 's')                 { e.preventDefault(); if (o.canSave && o.onSave) o.onSave(); return }
        if (k === 'e')                 { e.preventDefault(); if (o.canExport && o.onExport) o.onExport(); return }
        if (k === 'l')                 { e.preventDefault(); if (o.canShare && o.onShare) o.onShare(); return }
        return
      }

      if (e.key === 'Escape')      { o.onCancel(); return }
      if (e.key === ' ')           { e.preventDefault(); o.onPlayPause(); return }
      if (e.key === 'ArrowLeft')   { e.preventDefault(); o.onStepBack(); return }
      if (e.key === 'ArrowRight')  { e.preventDefault(); o.onStepForward(); return }
      if (e.key === 'Home')        { e.preventDefault(); o.onGoToStart(); return }
      if (e.key === 'End')         { e.preventDefault(); o.onGoToEnd(); return }

      if (k === 'k') {
        e.preventDefault()
        if (o.canToggleMarkings) o.onToggleMarkings()
        return
      }

      const actionType = KEY_TO_ACTION[k]
      if (actionType && o.canStartAction(actionType)) {
        e.preventDefault()
        o.onAction(actionType)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
