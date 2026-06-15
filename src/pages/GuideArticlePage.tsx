import { useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import Logo from '../components/ui/Logo'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import { getGuide, relatedGuides } from '../data/guides'

export default function GuideArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const guide = slug ? getGuide(slug) : undefined

  // Set document title + meta description from the article (real per-page content
  // for crawlers). Hook runs unconditionally; it is a no-op when guide is missing.
  useEffect(() => {
    if (!guide) return
    const prevTitle = document.title
    document.title = `${guide.title} — Basketball Tactic Board`
    const meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute('content') ?? null
    meta?.setAttribute('content', guide.description)
    window.scrollTo(0, 0)
    return () => {
      document.title = prevTitle
      if (meta && prevDesc !== null) meta.setAttribute('content', prevDesc)
    }
  }, [guide])

  // Unknown slug → send to the guides index rather than a dead end.
  if (!guide) return <Navigate to="/guides" replace />

  const related = relatedGuides(guide.slug)

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
          <Link to="/guides" className="hover:text-orange-400 transition-colors">Guides</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">{guide.title}</span>
        </nav>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
            {guide.category}
          </span>
          <span className="text-xs text-slate-500">{guide.readMinutes} min read</span>
        </div>

        <h1 className="text-3xl font-bold mb-4 leading-tight">{guide.title}</h1>
        <p className="text-lg text-slate-300 leading-relaxed mb-8">{guide.intro}</p>

        <article className="flex flex-col gap-8">
          {guide.sections.map((section, i) => (
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
            {guide.keyTakeaways.map((t, i) => (
              <li key={i} className="flex gap-2 text-slate-300 leading-relaxed">
                <span className="text-orange-400 shrink-0">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Call to action into the actual tool */}
        <div className="mt-8 bg-gradient-to-br from-orange-500/15 to-slate-800 border border-orange-500/30 rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold text-white mb-1">Ready to diagram this play?</h2>
          <p className="text-slate-400 text-sm mb-4">
            Build it on the board, animate it step by step, and share it with your team — free.
          </p>
          <Link
            to="/setup"
            className="inline-block px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors"
          >
            Open the Tactics Board →
          </Link>
        </div>

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">More Guides</h2>
            <div className="flex flex-col gap-3">
              {related.map((g) => (
                <Link
                  key={g.slug}
                  to={`/guides/${g.slug}`}
                  className="block bg-slate-800 hover:bg-slate-800/70 border border-slate-700 hover:border-orange-500/50 rounded-lg px-4 py-3 transition-colors"
                >
                  <span className="text-white font-medium">{g.title}</span>
                  <span className="block text-slate-500 text-xs mt-0.5">{g.category} · {g.readMinutes} min read</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-sm text-slate-500 space-y-2">
          <div>
            <Link to="/guides" className="hover:text-orange-400 transition-colors">← All Guides</Link>
            <span className="mx-3">·</span>
            <Link to="/" className="hover:text-orange-400 transition-colors">Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
