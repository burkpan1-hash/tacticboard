import { useState, useRef, useEffect } from 'react'
import { COURT_THEME_LIST } from '../../config/courtThemes'
import { useCourtThemeStore } from '../../store/useCourtTheme'

export default function CourtThemeSwitcher() {
  const themeId = useCourtThemeStore((s) => s.themeId)
  const setThemeId = useCourtThemeStore((s) => s.setThemeId)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = COURT_THEME_LIST.find(t => t.id === themeId) ?? COURT_THEME_LIST[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title="Court theme"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
      >
        <span className="w-4 h-4 rounded border border-white/30" style={{ background: current.swatch }} />
        <svg className="w-3 h-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-gray-900 border border-white/10 shadow-2xl z-50 overflow-hidden">
          {COURT_THEME_LIST.map(th => (
            <button
              key={th.id}
              onClick={() => { setThemeId(th.id); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                th.id === themeId ? 'bg-indigo-600 text-white' : 'text-gray-200 hover:bg-white/10'
              }`}
            >
              <span className="w-4 h-4 rounded border border-white/30 shrink-0" style={{ background: th.swatch }} />
              <span>{th.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
