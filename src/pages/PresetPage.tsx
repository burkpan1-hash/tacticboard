import { useEffect } from 'react'
import { Link, useParams, useNavigate, Navigate } from 'react-router-dom'
import Logo from '../components/ui/Logo'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import { getPreset } from '../data/presets'
import { usePlayStore } from '../store/usePlayStore'
import { primaryLabel } from '../utils/optionLines'

export default function PresetPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const setActiveSet = usePlayStore((s) => s.setActiveSet)
  const setActiveStep = usePlayStore((s) => s.setActiveStep)
  const setActiveOption = usePlayStore((s) => s.setActiveOption)
  const preset = slug ? getPreset(slug) : undefined

  // Per-page title + meta description — real content signal for crawlers.
  useEffect(() => {
    if (!preset) return
    const prevTitle = document.title
    document.title = `${preset.title} — Basketball Tactic Board`
    const meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute('content') ?? null
    meta?.setAttribute('content', preset.description)
    window.scrollTo(0, 0)
    return () => {
      document.title = prevTitle
      if (meta && prevDesc !== null) meta.setAttribute('content', prevDesc)
    }
  }, [preset])

  if (!preset) return <Navigate to="/guides" replace />

  const { article } = preset

  const options = preset.playData.options ?? []

  // Load the preset into the editor with a chosen option active and jump to it.
  // Clone so repeated visits never mutate the shared preset object.
  function openInEditor(optionId: string | null = null) {
    setActiveSet(structuredClone(preset!.playData))
    setActiveOption(optionId)
    // Open at the initial alignment (the setters land on the composed end) so the
    // user sees the set from the start and can press play to watch it unfold.
    setActiveStep(0)
    navigate(`/editor/${preset!.playData.id}`)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/"><Logo size={32} /></Link>
          <LanguageSwitcher />
        </div>

        <nav className="text-sm text-slate-500 mb-4">
          <Link to="/" className="hover:text-orange-400 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/guides" className="hover:text-orange-400 transition-colors">Plays</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">{preset.title}</span>
        </nav>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
            {preset.category}
          </span>
          <span className="text-xs text-slate-500">{preset.readMinutes} min read</span>
        </div>

        <h1 className="text-3xl font-bold mb-4 leading-tight">{preset.title}</h1>

        {/* Playable animation entry point. Inline on-page player comes with the
            full build; for now "Open in Editor" plays the set in the board.
            When the set has options (branching reads), each gets its own button. */}
        <div className="mb-8 bg-gradient-to-br from-orange-500/15 to-slate-800 border border-orange-500/30 rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold text-white mb-1">Watch this play in motion</h2>
          <p className="text-slate-400 text-sm mb-4">
            {options.length > 0
              ? 'This set has multiple options — pick a read to open it on the board and press play.'
              : 'Open the set on the board and press play to see every cut, screen, and pass animate step by step.'}
          </p>
          {options.length === 0 ? (
            <button
              onClick={() => openInEditor(null)}
              className="inline-block px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors"
            >
              Open in Editor &amp; Play →
            </button>
          ) : (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => openInEditor(null)}
                className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors"
              >
                ▶ {primaryLabel(preset.playData)}
              </button>
              {options.map((o) => (
                <button
                  key={o.id}
                  onClick={() => openInEditor(o.id)}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-orange-500 border border-slate-600 hover:border-orange-400 text-white text-sm font-semibold transition-colors"
                >
                  ▶ {o.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-lg text-slate-300 leading-relaxed mb-8">{article.intro}</p>

        <article className="flex flex-col gap-8">
          {article.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-xl font-semibold text-orange-400 mb-3">{section.heading}</h2>
              <div className="flex flex-col gap-3">
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="text-slate-300 leading-relaxed">{p}</p>
                ))}
              </div>
            </section>
          ))}
        </article>

        <section className="mt-10 bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-3">Key Takeaways</h2>
          <ul className="flex flex-col gap-2">
            {article.keyTakeaways.map((t, i) => (
              <li key={i} className="flex gap-2 text-slate-300 leading-relaxed">
                <span className="text-orange-400 shrink-0">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
          <Link to="/guides" className="hover:text-orange-400 transition-colors">← All Plays</Link>
          <span className="mx-3">·</span>
          <Link to="/" className="hover:text-orange-400 transition-colors">Home</Link>
        </div>
      </div>
    </div>
  )
}
