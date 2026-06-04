import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from '../components/ui/Logo'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'

type LangKey = 'tr' | 'en' | 'de' | 'es' | 'fr' | 'it'

interface PricingCopy {
  title: string
  subtitle: string
  free: {
    label: string
    period: string
    features: string[]
    adNote: string
    cta: string
  }
  pro: {
    label: string
    period: string
    annual: string
    badge: string
    features: string[]
    cta: string
  }
  footer: {
    terms: string
    refundLink: string
    questions: string
  }
  nav: {
    backToHome: string
  }
}

const COPY: Record<LangKey, PricingCopy> = {
  en: {
    title: 'Simple, transparent pricing',
    subtitle: "Start free. Upgrade when you're ready.",
    free: {
      label: 'Free',
      period: 'forever',
      features: [
        'Full court & half court editor',
        'All action types (pass, cut, screen…)',
        'Animated playback',
        'Share plays via link',
        'GIF export',
        'Up to 10 saved plays',
      ],
      adNote: 'Ads shown',
      cta: 'Get started free',
    },
    pro: {
      label: 'Pro',
      period: '/month',
      annual: 'or $39.99/year (save 33%)',
      badge: 'Most popular',
      features: [
        'Everything in Free',
        'Unlimited saved plays',
        'No ads',
        'Priority support',
        'Early access to new features',
      ],
      cta: 'Start free trial',
    },
    footer: {
      terms: 'Cancel anytime · No refunds · No hidden fees.',
      refundLink: 'Refund policy',
      questions: 'Questions?',
    },
    nav: { backToHome: '← Back to Home' },
  },
  tr: {
    title: 'Sade, şeffaf fiyatlandırma',
    subtitle: 'Ücretsiz başla. Hazır olduğunda yükselt.',
    free: {
      label: 'Ücretsiz',
      period: 'sonsuza kadar',
      features: [
        'Tam saha ve yarı saha editörü',
        'Tüm aksiyon tipleri (pas, kesme, blok…)',
        'Animasyonlu oynatma',
        'Link ile set paylaşımı',
        'GIF dışa aktarma',
        '10 adede kadar kayıtlı set',
      ],
      adNote: 'Reklam gösterilir',
      cta: 'Ücretsiz başla',
    },
    pro: {
      label: 'Pro',
      period: '/ay',
      annual: 'veya $39.99/yıl (%33 tasarruf)',
      badge: 'En popüler',
      features: [
        'Ücretsiz plandaki her şey',
        'Sınırsız kayıtlı set',
        'Reklamsız',
        'Öncelikli destek',
        'Yeni özelliklere erken erişim',
      ],
      cta: 'Denemeyi başlat',
    },
    footer: {
      terms: 'İstediğin zaman iptal et · İade yok · Gizli ücret yok.',
      refundLink: 'İade politikası',
      questions: 'Sorularınız için',
    },
    nav: { backToHome: '← Ana Sayfa' },
  },
  de: {
    title: 'Einfache, transparente Preise',
    subtitle: 'Kostenlos starten. Upgraden wenn Sie bereit sind.',
    free: {
      label: 'Kostenlos',
      period: 'für immer',
      features: [
        'Ganzes und halbes Spielfeld-Editor',
        'Alle Aktionstypen (Pass, Cut, Screen…)',
        'Animierte Wiedergabe',
        'Spielzüge per Link teilen',
        'GIF-Export',
        'Bis zu 10 gespeicherte Spielzüge',
      ],
      adNote: 'Werbung wird angezeigt',
      cta: 'Kostenlos starten',
    },
    pro: {
      label: 'Pro',
      period: '/Monat',
      annual: 'oder 39,99 $/Jahr (33 % sparen)',
      badge: 'Am beliebtesten',
      features: [
        'Alles aus Kostenlos',
        'Unbegrenzte gespeicherte Spielzüge',
        'Keine Werbung',
        'Prioritätssupport',
        'Früher Zugang zu neuen Funktionen',
      ],
      cta: 'Testversion starten',
    },
    footer: {
      terms: 'Jederzeit kündbar · Keine Rückerstattungen · Keine versteckten Gebühren.',
      refundLink: 'Erstattungsrichtlinie',
      questions: 'Fragen?',
    },
    nav: { backToHome: '← Zur Startseite' },
  },
  es: {
    title: 'Precios simples y transparentes',
    subtitle: 'Empieza gratis. Actualiza cuando estés listo.',
    free: {
      label: 'Gratis',
      period: 'para siempre',
      features: [
        'Editor de cancha completa y media cancha',
        'Todos los tipos de acción (pase, corte, bloqueo…)',
        'Reproducción animada',
        'Compartir jugadas por enlace',
        'Exportar GIF',
        'Hasta 10 jugadas guardadas',
      ],
      adNote: 'Se muestran anuncios',
      cta: 'Empezar gratis',
    },
    pro: {
      label: 'Pro',
      period: '/mes',
      annual: 'o $39.99/año (ahorra 33%)',
      badge: 'Más popular',
      features: [
        'Todo lo del plan Gratis',
        'Jugadas guardadas ilimitadas',
        'Sin anuncios',
        'Soporte prioritario',
        'Acceso anticipado a nuevas funciones',
      ],
      cta: 'Iniciar prueba',
    },
    footer: {
      terms: 'Cancela cuando quieras · Sin reembolsos · Sin cargos ocultos.',
      refundLink: 'Política de reembolso',
      questions: '¿Preguntas?',
    },
    nav: { backToHome: '← Volver al inicio' },
  },
  fr: {
    title: 'Tarifs simples et transparents',
    subtitle: 'Commencez gratuitement. Passez à la version supérieure quand vous êtes prêt.',
    free: {
      label: 'Gratuit',
      period: 'pour toujours',
      features: [
        'Éditeur terrain complet et demi-terrain',
        "Tous les types d'action (passe, coupe, écran…)",
        'Lecture animée',
        'Partage de jeux par lien',
        'Export GIF',
        "Jusqu'à 10 jeux sauvegardés",
      ],
      adNote: 'Publicités affichées',
      cta: 'Commencer gratuitement',
    },
    pro: {
      label: 'Pro',
      period: '/mois',
      annual: 'ou 39,99 $/an (économisez 33 %)',
      badge: 'Le plus populaire',
      features: [
        'Tout du plan Gratuit',
        'Jeux sauvegardés illimités',
        'Sans publicités',
        'Support prioritaire',
        'Accès anticipé aux nouvelles fonctionnalités',
      ],
      cta: "Démarrer l'essai",
    },
    footer: {
      terms: 'Annulez à tout moment · Aucun remboursement · Aucuns frais cachés.',
      refundLink: 'Politique de remboursement',
      questions: 'Des questions ?',
    },
    nav: { backToHome: "← Retour à l'accueil" },
  },
  it: {
    title: 'Prezzi semplici e trasparenti',
    subtitle: 'Inizia gratuitamente. Aggiorna quando sei pronto.',
    free: {
      label: 'Gratuito',
      period: 'per sempre',
      features: [
        'Editor campo intero e metà campo',
        'Tutti i tipi di azione (passaggio, taglio, blocco…)',
        'Riproduzione animata',
        'Condivisione giocate tramite link',
        'Esportazione GIF',
        'Fino a 10 giocate salvate',
      ],
      adNote: 'Annunci visualizzati',
      cta: 'Inizia gratuitamente',
    },
    pro: {
      label: 'Pro',
      period: '/mese',
      annual: "o $39,99/anno (risparmia il 33%)",
      badge: 'Il più popolare',
      features: [
        'Tutto del piano Gratuito',
        'Giocate salvate illimitate',
        'Senza pubblicità',
        'Supporto prioritario',
        'Accesso anticipato alle nuove funzionalità',
      ],
      cta: 'Inizia la prova',
    },
    footer: {
      terms: 'Annulla in qualsiasi momento · Nessun rimborso · Nessun costo nascosto.',
      refundLink: 'Politica di rimborso',
      questions: 'Domande?',
    },
    nav: { backToHome: '← Torna alla home' },
  },
}

export default function PricingPage() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const lang = i18n.language.slice(0, 2) as LangKey
  const c = COPY[lang] ?? COPY.en

  return (
    <div className="min-h-screen p-6 sm:p-12 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <button onClick={() => navigate('/')}><Logo /></button>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white text-sm transition-colors">{c.nav.backToHome}</button>
        </div>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">{c.title}</h1>
        <p className="text-slate-400 text-lg">{c.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Free */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 flex flex-col">
          <div className="mb-6">
            <div className="text-slate-400 text-sm font-semibold uppercase tracking-wide mb-2">{c.free.label}</div>
            <div className="text-5xl font-bold text-white">$0</div>
            <div className="text-slate-500 text-sm mt-1">{c.free.period}</div>
          </div>
          <ul className="flex flex-col gap-3 text-sm text-slate-300 flex-1 mb-8">
            {c.free.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2"><span className="text-green-400">✓</span> {f}</li>
            ))}
            <li className="flex items-center gap-2"><span className="text-slate-500">–</span> <span className="text-slate-500">{c.free.adNote}</span></li>
          </ul>
          <button
            onClick={() => navigate('/register')}
            className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
          >
            {c.free.cta}
          </button>
        </div>

        {/* Pro */}
        <div className="bg-slate-800 rounded-2xl p-8 border-2 border-orange-500 flex flex-col relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
            {c.pro.badge}
          </div>
          <div className="mb-6">
            <div className="text-orange-400 text-sm font-semibold uppercase tracking-wide mb-2">{c.pro.label}</div>
            <div className="flex items-end gap-2">
              <div className="text-5xl font-bold text-white">$4.99</div>
              <div className="text-slate-400 text-sm mb-2">{c.pro.period}</div>
            </div>
            <div className="text-slate-500 text-sm mt-1">{c.pro.annual}</div>
          </div>
          <ul className="flex flex-col gap-3 text-sm text-slate-300 flex-1 mb-8">
            {c.pro.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-green-400">✓</span> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate('/register')}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold transition-colors shadow-lg shadow-orange-500/30"
          >
            {c.pro.cta}
          </button>
        </div>
      </div>

      <p className="text-center text-slate-500 text-xs mt-10">
        {c.footer.terms}{' '}
        <a href="/refund" className="hover:text-orange-400 transition-colors">{c.footer.refundLink}</a>
        {' · '}
        {c.footer.questions} <a href="mailto:support@basketballtacticboard.com" className="text-orange-400 hover:text-orange-300">support@basketballtacticboard.com</a>
      </p>
    </div>
  )
}
