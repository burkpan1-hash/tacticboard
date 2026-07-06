import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Logo from '../components/ui/Logo'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import type { Preset, PresetFamily } from '../data/presets'
import { localizePreset } from '../data/presets/translations'

interface Props {
  family: PresetFamily
  members: Preset[]
}

// Renders when a `/sets/:slug` URL names a family (e.g. "ucla-offense") rather
// than one preset — a chooser between the standalone plays that share it.
export default function FamilyHubPage({ family, members }: Props) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language.split('-')[0]
  const localizedMembers = members.map((m) => localizePreset(m, locale))

  useEffect(() => {
    const prevTitle = document.title
    document.title = `${family.title} — Basketball Tactic Board`
    const meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute('content') ?? null
    meta?.setAttribute('content', t('sets.family.metaDescription', { count: members.length, family: family.title }))
    window.scrollTo(0, 0)
    return () => {
      document.title = prevTitle
      if (meta && prevDesc !== null) meta.setAttribute('content', prevDesc)
    }
  }, [family, members.length, t])

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
          <Link to="/sets" className="hover:text-orange-400 transition-colors">{t('sets.nav.plays')}</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">{family.title}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-3">{family.title}</h1>
        <p className="text-slate-300 leading-relaxed mb-8">
          {t('sets.family.description', { count: members.length })}
        </p>

        <div className="flex flex-col gap-4">
          {localizedMembers.map((preset) => (
            <Link
              key={preset.slug}
              to={`/sets/${preset.slug}`}
              className="block bg-slate-800 hover:bg-slate-800/70 border border-slate-700 hover:border-orange-500/50 rounded-xl p-5 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                  {preset.category}
                </span>
                <span className="text-xs text-slate-500">{t('sets.page.readMinutes', { count: preset.readMinutes })}</span>
              </div>
              <h2 className="text-lg font-semibold text-white group-hover:text-orange-300 transition-colors mb-1">
                {preset.title}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">{preset.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
          <Link to="/sets" className="hover:text-orange-400 transition-colors">{t('sets.family.allPlays')}</Link>
          <span className="mx-3">·</span>
          <Link to="/" className="hover:text-orange-400 transition-colors">{t('sets.nav.home')}</Link>
        </div>
      </div>
    </div>
  )
}
