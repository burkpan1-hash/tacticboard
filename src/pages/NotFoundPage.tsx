import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from '../components/ui/Logo'
import { useNoIndex } from '../hooks/useNoIndex'

const COPY: Record<'tr' | 'en', { title: string; subtitle: string; cta: string }> = {
  tr: {
    title: 'Bu basket boş geldi',
    subtitle: 'Aradığın sayfa bulunamadı — belki taşındı, silindi ya da linkte bir typo var.',
    cta: 'Ana Sayfaya Dön',
  },
  en: {
    title: 'Air ball',
    subtitle: 'The page you\'re looking for doesn\'t exist — maybe it moved, was deleted, or there\'s a typo in the link.',
    cta: 'Back to Home',
  },
}

export default function NotFoundPage() {
  const { i18n } = useTranslation()
  const copy = i18n.language === 'tr' ? COPY.tr : COPY.en
  useNoIndex()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100 p-6">
      <div className="mb-8"><Logo size={40} /></div>

      <div className="text-7xl mb-4 select-none" aria-hidden>🏀</div>
      <p className="text-6xl font-bold text-orange-400 mb-2 tracking-tight">404</p>
      <h1 className="text-2xl font-bold mb-3 text-center">{copy.title}</h1>
      <p className="text-slate-400 text-center max-w-md leading-relaxed mb-8">{copy.subtitle}</p>

      <Link
        to="/"
        className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors"
      >
        {copy.cta}
      </Link>
    </div>
  )
}
