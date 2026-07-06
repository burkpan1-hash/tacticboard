import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Logo from '../components/ui/Logo'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import { allFamilies } from '../data/presets'
import { localizePreset } from '../data/presets/translations'

// English-only fallback for the build-time prerender script (entry-server.tsx),
// which runs outside any browser i18n context. The live page below renders the
// locale-aware `sets.hub.*` keys instead.
export const PAGE_TITLE = 'Ready-Made Sets — Preset Basketball Plays'
export const PAGE_DESCRIPTION =
  'Ready-made basketball sets, broken down play by play: the setup, the reads, and a playable animation for each one. Open any set on the tactics board and make it your own.'

export default function PresetsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language.split('-')[0]

  // Set document title + meta description for this content page (helps SEO and
  // gives crawlers real, page-specific text content).
  useEffect(() => {
    const prevTitle = document.title
    document.title = t('sets.hub.pageTitle')
    const meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute('content') ?? null
    meta?.setAttribute('content', t('sets.hub.pageDescription'))
    return () => {
      document.title = prevTitle
      if (meta && prevDesc !== null) meta.setAttribute('content', prevDesc)
    }
  }, [t])

  const families = allFamilies()

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/"><Logo size={32} /></Link>
          <LanguageSwitcher />
        </div>

        <nav className="text-sm text-slate-500 mb-4">
          <Link to="/" className="hover:text-orange-400 transition-colors">{t('sets.nav.home')}</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">{t('sets.hub.title')}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-3">{t('sets.hub.title')}</h1>
        <p className="text-slate-300 leading-relaxed mb-8">
          {t('sets.hub.intro')}
        </p>

        <div className="flex flex-col gap-4">
          {families.map(({ family, members }) => {
            const first = localizePreset(members[0], locale)
            return (
              <Link
                key={family.slug}
                to={`/sets/${family.slug}`}
                className="block bg-slate-800 hover:bg-slate-800/70 border border-slate-700 hover:border-orange-500/50 rounded-xl p-5 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                    {first.category}
                  </span>
                  <span className="text-xs text-slate-500">{t('sets.hub.playsCount', { count: members.length })}</span>
                </div>
                <h2 className="text-lg font-semibold text-white group-hover:text-orange-300 transition-colors mb-1">
                  {family.title}
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">{first.description}</p>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
          <Link to="/" className="hover:text-orange-400 transition-colors">{t('sets.hub.backHome')}</Link>
          <span className="mx-3">·</span>
          <Link to="/setup" className="hover:text-orange-400 transition-colors">{t('sets.hub.openBoard')}</Link>
        </div>
      </div>
    </div>
  )
}
