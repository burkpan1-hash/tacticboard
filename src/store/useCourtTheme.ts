import { create } from 'zustand'
import { COURT_THEMES, DEFAULT_COURT_THEME, type CourtTheme } from '../config/courtThemes'

const STORAGE_KEY = 'setplay_court_theme'

function loadId(): string {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v && COURT_THEMES[v]) return v
  } catch { /* ignore (SSR / blocked storage) */ }
  return DEFAULT_COURT_THEME
}

interface State {
  themeId: string
  setThemeId: (id: string) => void
}

export const useCourtThemeStore = create<State>((set) => ({
  themeId: loadId(),
  setThemeId: (id) => {
    try { localStorage.setItem(STORAGE_KEY, id) } catch { /* ignore */ }
    set({ themeId: id })
  },
}))

/** Resolved theme object for the current selection. */
export function useCourtTheme(): CourtTheme {
  const id = useCourtThemeStore((s) => s.themeId)
  return COURT_THEMES[id] ?? COURT_THEMES[DEFAULT_COURT_THEME]
}
