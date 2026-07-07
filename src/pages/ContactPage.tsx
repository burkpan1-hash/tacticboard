import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from '../components/ui/Logo'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'

const CONTACT_EMAIL = 'support@basketballtacticboard.com'

type LangKey = 'tr' | 'en' | 'de' | 'es' | 'fr' | 'it'

interface LangCopy {
  title: string
  intro: string
  emailLabel: string
  reasonsHeading: string
  reasons: string[]
  backToHome: string
  aboutLink: string
}

const COPY: Record<LangKey, LangCopy> = {
  tr: {
    title: 'İletişim',
    intro: 'Sorunuz, bir hata bildiriminiz veya bir öneriniz mi var? Bize aşağıdaki adresten ulaşabilirsiniz.',
    emailLabel: 'E-posta:',
    reasonsHeading: 'Genellikle şu konularda yazılıyor:',
    reasons: [
      'Bir hata veya beklenmedik davranış bildirmek',
      'Hesap, giriş veya abonelik (Pro) ile ilgili sorular',
      'Yeni özellik önerisi',
      'Gizlilik/veri talepleri (KVKK/GDPR)',
    ],
    backToHome: '← Ana Sayfa',
    aboutLink: 'Hakkımızda',
  },
  en: {
    title: 'Contact',
    intro: 'Have a question, a bug to report, or a suggestion? Reach us at the address below.',
    emailLabel: 'Email:',
    reasonsHeading: 'People usually write to us about:',
    reasons: [
      'Reporting a bug or unexpected behavior',
      'Account, sign-in, or Pro subscription questions',
      'Feature requests',
      'Privacy/data requests (GDPR/CCPA)',
    ],
    backToHome: '← Back to Home',
    aboutLink: 'About',
  },
  de: {
    title: 'Kontakt',
    intro: 'Haben Sie eine Frage, einen Fehler zu melden oder einen Vorschlag? Erreichen Sie uns unter der folgenden Adresse.',
    emailLabel: 'E-Mail:',
    reasonsHeading: 'Häufige Themen:',
    reasons: [
      'Einen Fehler oder unerwartetes Verhalten melden',
      'Fragen zu Konto, Anmeldung oder Pro-Abo',
      'Funktionswünsche',
      'Datenschutzanfragen (DSGVO)',
    ],
    backToHome: '← Zur Startseite',
    aboutLink: 'Über uns',
  },
  es: {
    title: 'Contacto',
    intro: '¿Tienes una pregunta, un error que reportar o una sugerencia? Escríbenos a la dirección de abajo.',
    emailLabel: 'Correo electrónico:',
    reasonsHeading: 'Suelen escribirnos para:',
    reasons: [
      'Reportar un error o un comportamiento inesperado',
      'Preguntas sobre la cuenta, el inicio de sesión o la suscripción Pro',
      'Sugerencias de nuevas funciones',
      'Solicitudes de privacidad/datos (GDPR/CCPA)',
    ],
    backToHome: '← Volver al inicio',
    aboutLink: 'Sobre nosotros',
  },
  fr: {
    title: 'Contact',
    intro: 'Une question, un bug à signaler ou une suggestion ? Contactez-nous à l\'adresse ci-dessous.',
    emailLabel: 'E-mail :',
    reasonsHeading: 'On nous écrit généralement pour :',
    reasons: [
      'Signaler un bug ou un comportement inattendu',
      'Des questions sur le compte, la connexion ou l\'abonnement Pro',
      'Des suggestions de fonctionnalités',
      'Des demandes liées à la confidentialité/aux données (RGPD)',
    ],
    backToHome: '← Retour à l\'accueil',
    aboutLink: 'À propos',
  },
  it: {
    title: 'Contatti',
    intro: 'Hai una domanda, un bug da segnalare o un suggerimento? Scrivici all\'indirizzo qui sotto.',
    emailLabel: 'E-mail:',
    reasonsHeading: 'Di solito ci scrivono per:',
    reasons: [
      'Segnalare un bug o un comportamento inatteso',
      'Domande su account, accesso o abbonamento Pro',
      'Richieste di nuove funzionalità',
      'Richieste su privacy/dati (GDPR)',
    ],
    backToHome: '← Torna alla home',
    aboutLink: 'Chi siamo',
  },
}

export default function ContactPage() {
  const { i18n } = useTranslation()
  const lang = i18n.language.slice(0, 2) as LangKey
  const copy = COPY[lang] ?? COPY.en

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/"><Logo size={32} /></Link>
          <LanguageSwitcher />
        </div>

        <h1 className="text-3xl font-bold mb-4">{copy.title}</h1>
        <p className="text-slate-300 leading-relaxed mb-6">{copy.intro}</p>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
          <div className="text-sm text-slate-400 mb-1">{copy.emailLabel}</div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-xl font-semibold text-orange-400 hover:text-orange-300 transition-colors"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-orange-400 mb-3">{copy.reasonsHeading}</h2>
          <ul className="flex flex-col gap-2">
            {copy.reasons.map((reason, i) => (
              <li key={i} className="flex gap-2 text-slate-300 leading-relaxed">
                <span className="text-orange-400 shrink-0">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
          <Link to="/" className="hover:text-orange-400 transition-colors">{copy.backToHome}</Link>
          <span className="mx-3">·</span>
          <Link to="/about" className="hover:text-orange-400 transition-colors">{copy.aboutLink}</Link>
        </div>
      </div>
    </div>
  )
}
