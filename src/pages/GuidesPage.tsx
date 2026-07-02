import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/ui/Logo'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import { GUIDES } from '../data/guides'

export const PAGE_TITLE = 'Basketball Coaching Guides — Plays, Drills & Strategy'
export const PAGE_DESCRIPTION =
  'Free basketball coaching guides: learn the 2-3 zone defense, the pick and roll, the fast break, and more. Then diagram and animate any play on the Basketball Tactic Board.'

export default function GuidesPage() {
  // Set document title + meta description for this content page (helps SEO and
  // gives crawlers real, page-specific text content).
  useEffect(() => {
    const prevTitle = document.title
    document.title = PAGE_TITLE
    const meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute('content') ?? null
    meta?.setAttribute('content', PAGE_DESCRIPTION)
    return () => {
      document.title = prevTitle
      if (meta && prevDesc !== null) meta.setAttribute('content', prevDesc)
    }
  }, [])

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
          <span className="text-slate-300">Guides</span>
        </nav>

        <h1 className="text-3xl font-bold mb-3">Basketball Coaching Guides</h1>
        <p className="text-slate-300 leading-relaxed mb-2">
          Clear, practical guides on basketball plays, defenses, and strategy — written for coaches and
          players who want to understand <em>why</em> a play works, not just memorize steps. Each guide
          breaks down the setup, the key reads, and the common mistakes to avoid.
        </p>
        <p className="text-slate-400 leading-relaxed mb-8">
          When you are ready to see a play in motion, head to the{' '}
          <Link to="/setup" className="text-orange-400 hover:text-orange-300 transition-colors">tactics board</Link>{' '}
          to diagram, animate, and share it with your team — free, right in your browser.
        </p>

        <div className="flex flex-col gap-4">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              to={`/guides/${guide.slug}`}
              className="block bg-slate-800 hover:bg-slate-800/70 border border-slate-700 hover:border-orange-500/50 rounded-xl p-5 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                  {guide.category}
                </span>
                <span className="text-xs text-slate-500">{guide.readMinutes} min read</span>
              </div>
              <h2 className="text-lg font-semibold text-white group-hover:text-orange-300 transition-colors mb-1">
                {guide.title}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">{guide.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-sm text-slate-500 space-y-2">
          <div>
            <Link to="/" className="hover:text-orange-400 transition-colors">← Back to Home</Link>
            <span className="mx-3">·</span>
            <Link to="/setup" className="hover:text-orange-400 transition-colors">Open the Board</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
