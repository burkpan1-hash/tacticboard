import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link, useParams, useNavigate, Navigate } from 'react-router-dom'
import Logo from '../components/ui/Logo'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import { getPreset, getFamily, familyMembers } from '../data/presets'
import { localizePreset } from '../data/presets/translations'
import { usePlayStore } from '../store/usePlayStore'
import FamilyHubPage from './FamilyHubPage'

export default function PresetPage() {
  const { t, i18n } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const setActiveSet = usePlayStore((s) => s.setActiveSet)
  const setActiveStep = usePlayStore((s) => s.setActiveStep)
  const basePreset = slug ? getPreset(slug) : undefined
  const preset = basePreset ? localizePreset(basePreset, i18n.language.split('-')[0]) : undefined
  // `slug` may name a family instead of one preset — e.g. "ucla-offense" groups
  // the layup/flex/stagger presets under one heading with its own chooser page.
  const family = !preset && slug ? getFamily(slug) : undefined

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

  if (!preset) {
    if (family && slug) return <FamilyHubPage family={family} members={familyMembers(slug)} />
    return <Navigate to="/sets" replace />
  }

  const { article } = preset

  // Load the preset into the editor. Clone so repeated visits never mutate the
  // shared preset object.
  function openInEditor() {
    setActiveSet(structuredClone(preset!.playData))
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
          <Link to="/" className="hover:text-orange-400 transition-colors">{t('sets.nav.home')}</Link>
          <span className="mx-2">/</span>
          <Link to="/sets" className="hover:text-orange-400 transition-colors">{t('sets.nav.plays')}</Link>
          {preset.family && (
            <>
              <span className="mx-2">/</span>
              <Link to={`/sets/${preset.family.slug}`} className="hover:text-orange-400 transition-colors">{preset.family.title}</Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-slate-300">{preset.title}</span>
        </nav>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
            {preset.category}
          </span>
          <span className="text-xs text-slate-500">{t('sets.page.readMinutes', { count: preset.readMinutes })}</span>
        </div>

        <h1 className="text-3xl font-bold mb-4 leading-tight">{preset.title}</h1>

        {/* Playable animation entry point. Inline on-page player comes with the
            full build; for now "Open in Editor" plays the set in the board. */}
        <div className="mb-8 bg-gradient-to-br from-orange-500/15 to-slate-800 border border-orange-500/30 rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold text-white mb-1">{t('sets.page.watchTitle')}</h2>
          <p className="text-slate-400 text-sm mb-4">
            {t('sets.page.watchDesc')}
          </p>
          <button
            onClick={openInEditor}
            className="inline-block px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors"
          >
            {t('sets.page.openButton')}
          </button>
        </div>

        {preset.family && (
          <p className="text-sm text-slate-500 mb-8 -mt-4">
            <Trans
              i18nKey="sets.page.partOf"
              values={{ family: preset.family.title }}
              components={{ 1: <Link to={`/sets/${preset.family.slug}`} className="text-orange-400 hover:text-orange-300 transition-colors" /> }}
            />
          </p>
        )}

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
          <h2 className="text-lg font-semibold text-white mb-3">{t('sets.page.keyTakeaways')}</h2>
          <ul className="flex flex-col gap-2">
            {article.keyTakeaways.map((takeaway, i) => (
              <li key={i} className="flex gap-2 text-slate-300 leading-relaxed">
                <span className="text-orange-400 shrink-0">•</span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
          <Link to="/sets" className="hover:text-orange-400 transition-colors">{t('sets.page.allPlays')}</Link>
          <span className="mx-3">·</span>
          <Link to="/" className="hover:text-orange-400 transition-colors">{t('sets.nav.home')}</Link>
        </div>
      </div>
    </div>
  )
}
