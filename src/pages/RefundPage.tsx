import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from '../components/ui/Logo'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'

const CONTACT_EMAIL = 'support@basketballtacticboard.com'
const LAST_UPDATED = '2026-06-04'

type LangKey = 'tr' | 'en' | 'de' | 'es' | 'fr' | 'it'

interface LangCopy {
  title: string
  lastUpdatedLabel: string
  backToHome: string
  termsLink: string
  privacyLink: string
  questionsLabel: string
  sections: Array<{ heading: string; body: string }>
}

const COPY: Record<LangKey, LangCopy> = {
  tr: {
    title: 'İade ve İptal Politikası',
    lastUpdatedLabel: 'Son güncelleme:',
    backToHome: '← Ana Sayfa',
    termsLink: 'Kullanım Koşulları',
    privacyLink: 'Gizlilik Politikası',
    questionsLabel: 'Sorularınız için:',
    sections: [
      {
        heading: 'Genel Bakış',
        body:
          'Basketball Tactic Board Pro abonelikleri Paddle aracılığıyla işlenir. Paddle, kayıtlı bir ödeme ' +
          'işlemcisi ve vergi sorumlusu olarak tüm faturalandırma işlemlerini yönetir. Ödemenizde Paddle ' +
          'ticaret adı görünebilir.',
      },
      {
        heading: 'İade Politikası',
        body:
          'Pro aboneliği dijital bir hizmettir ve satın alma anında tam erişim sağlanır. Bu nedenle ' +
          'tamamlanmış ödemeler için iade yapılmamaktadır. Aboneliğinizi istediğiniz zaman iptal edebilirsiniz; ' +
          'mevcut fatura döneminin sonuna kadar Pro özelliklerini kullanmaya devam edersiniz, sonrasında ' +
          'ücretsiz katmana geçilir.',
      },
      {
        heading: 'Yenileme Hatası İstisnası',
        body:
          'Aboneliğinizi iptal etmeyi unutup istemediğiniz bir yenileme ücreti tahsil edilirse, yenileme ' +
          'tarihinden itibaren 7 gün içinde support@basketballtacticboard.com adresine yazmanız halinde ' +
          'tam iade yapılır. Bu istisna yalnızca bir kez geçerlidir.',
      },
      {
        heading: 'İptal',
        body:
          'Aboneliğinizi istediğiniz zaman hesap ayarlarınızdan veya Paddle müşteri portalından iptal ' +
          'edebilirsiniz. İptal işleminden sonra tekrar ücret alınmaz.',
      },
      {
        heading: 'Teknik Sorun Durumu',
        body:
          'Tarafımızdaki kanıtlanabilir bir teknik hata nedeniyle Pro özelliklerine hiç erişemediyseniz, ' +
          'bu durum ayrıca değerlendirilir. Destek için support@basketballtacticboard.com adresine yazın.',
      },
      {
        heading: 'İletişim',
        body: 'Sorularınız için: ' + CONTACT_EMAIL,
      },
    ],
  },
  en: {
    title: 'Refund & Cancellation Policy',
    lastUpdatedLabel: 'Last updated:',
    backToHome: '← Back to Home',
    termsLink: 'Terms of Service',
    privacyLink: 'Privacy Policy',
    questionsLabel: 'Questions?',
    sections: [
      {
        heading: 'Overview',
        body:
          'Basketball Tactic Board Pro subscriptions are processed through Paddle. Paddle acts as a ' +
          'registered payment processor and Merchant of Record, managing all billing. You may see ' +
          'Paddle\'s name on your payment statement.',
      },
      {
        heading: 'No Refunds',
        body:
          'Pro is a digital service with immediate full access upon purchase. Because of this, completed ' +
          'payments are non-refundable. You may cancel at any time — you keep Pro features until the end ' +
          'of your current billing period, then your account reverts to the free tier.',
      },
      {
        heading: 'Accidental Renewal Exception',
        body:
          'If you forgot to cancel and were charged for an unwanted renewal, email ' +
          'support@basketballtacticboard.com within 7 days of the renewal date and we will issue a full ' +
          'refund. This exception applies once per account.',
      },
      {
        heading: 'Cancellation',
        body:
          'You may cancel your subscription at any time from your account settings or Paddle\'s customer ' +
          'portal. No further charges will be made after cancellation.',
      },
      {
        heading: 'Technical Issues',
        body:
          'If a verifiable technical error on our end prevented you from accessing Pro features entirely, ' +
          'we will review the case individually. Contact support@basketballtacticboard.com with details.',
      },
      {
        heading: 'Contact',
        body: 'Questions? Email ' + CONTACT_EMAIL,
      },
    ],
  },
  de: {
    title: 'Erstattungs- und Stornierungsrichtlinie',
    lastUpdatedLabel: 'Zuletzt aktualisiert:',
    backToHome: '← Zur Startseite',
    termsLink: 'Nutzungsbedingungen',
    privacyLink: 'Datenschutzerklärung',
    questionsLabel: 'Fragen?',
    sections: [
      {
        heading: 'Überblick',
        body:
          'Basketball Tactic Board Pro-Abonnements werden über Paddle abgewickelt. Paddle fungiert als ' +
          'registrierter Zahlungsabwickler und Merchant of Record und verwaltet die gesamte Abrechnung. ' +
          'Auf Ihrem Zahlungsbeleg kann der Name Paddle erscheinen.',
      },
      {
        heading: 'Keine Rückerstattungen',
        body:
          'Pro ist ein digitaler Dienst mit sofortigem Vollzugriff nach dem Kauf. Aus diesem Grund sind ' +
          'abgeschlossene Zahlungen nicht erstattungsfähig. Sie können jederzeit kündigen — Sie behalten die ' +
          'Pro-Funktionen bis zum Ende Ihres aktuellen Abrechnungszeitraums, danach wechselt Ihr Konto zum ' +
          'kostenlosen Tarif.',
      },
      {
        heading: 'Ausnahme bei versehentlicher Verlängerung',
        body:
          'Wenn Sie vergessen haben zu kündigen und eine ungewollte Verlängerungsgebühr berechnet wurde, ' +
          'senden Sie uns innerhalb von 7 Tagen nach dem Verlängerungsdatum eine E-Mail an ' +
          'support@basketballtacticboard.com und wir erstatten den vollen Betrag. Diese Ausnahme gilt einmal pro Konto.',
      },
      {
        heading: 'Kündigung',
        body:
          'Sie können Ihr Abonnement jederzeit über Ihre Kontoeinstellungen oder das Paddle-Kundenportal ' +
          'kündigen. Nach der Kündigung werden keine weiteren Gebühren erhoben.',
      },
      {
        heading: 'Technische Probleme',
        body:
          'Wenn ein nachweisbarer technischer Fehler unsererseits Sie vollständig am Zugriff auf Pro-Funktionen ' +
          'gehindert hat, prüfen wir den Fall individuell. Kontaktieren Sie support@basketballtacticboard.com mit Details.',
      },
      {
        heading: 'Kontakt',
        body: 'Fragen? Schreiben Sie uns: ' + CONTACT_EMAIL,
      },
    ],
  },
  es: {
    title: 'Política de reembolso y cancelación',
    lastUpdatedLabel: 'Última actualización:',
    backToHome: '← Volver al inicio',
    termsLink: 'Términos de servicio',
    privacyLink: 'Política de privacidad',
    questionsLabel: '¿Preguntas?',
    sections: [
      {
        heading: 'Descripción general',
        body:
          'Las suscripciones Pro de Basketball Tactic Board se procesan a través de Paddle. Paddle actúa ' +
          'como procesador de pagos registrado y Merchant of Record, gestionando toda la facturación. ' +
          'Es posible que vea el nombre de Paddle en su extracto de pago.',
      },
      {
        heading: 'Sin reembolsos',
        body:
          'Pro es un servicio digital con acceso completo inmediato tras la compra. Por ello, los pagos ' +
          'completados no son reembolsables. Puede cancelar en cualquier momento — conserva las funciones ' +
          'Pro hasta el final de su período de facturación actual, luego su cuenta vuelve al nivel gratuito.',
      },
      {
        heading: 'Excepción por renovación accidental',
        body:
          'Si olvidó cancelar y se le cobró una renovación no deseada, envíe un correo a ' +
          'support@basketballtacticboard.com dentro de los 7 días siguientes a la fecha de renovación y ' +
          'emitiremos un reembolso completo. Esta excepción se aplica una vez por cuenta.',
      },
      {
        heading: 'Cancelación',
        body:
          'Puede cancelar su suscripción en cualquier momento desde la configuración de su cuenta o el ' +
          'portal de clientes de Paddle. No se realizarán más cargos tras la cancelación.',
      },
      {
        heading: 'Problemas técnicos',
        body:
          'Si un error técnico verificable de nuestra parte le impidió completamente acceder a las funciones ' +
          'Pro, revisaremos el caso individualmente. Contacte a support@basketballtacticboard.com con los detalles.',
      },
      {
        heading: 'Contacto',
        body: '¿Preguntas? Escríbanos a ' + CONTACT_EMAIL,
      },
    ],
  },
  fr: {
    title: 'Politique de remboursement et d\'annulation',
    lastUpdatedLabel: 'Dernière mise à jour :',
    backToHome: '← Retour à l\'accueil',
    termsLink: 'Conditions d\'utilisation',
    privacyLink: 'Politique de confidentialité',
    questionsLabel: 'Des questions ?',
    sections: [
      {
        heading: 'Aperçu',
        body:
          'Les abonnements Pro de Basketball Tactic Board sont traités via Paddle. Paddle agit en tant que ' +
          'processeur de paiement enregistré et Merchant of Record, gérant toute la facturation. Le nom de ' +
          'Paddle peut apparaître sur votre relevé de paiement.',
      },
      {
        heading: 'Aucun remboursement',
        body:
          'Pro est un service numérique avec accès complet immédiat après l\'achat. Pour cette raison, les ' +
          'paiements effectués ne sont pas remboursables. Vous pouvez annuler à tout moment — vous conservez ' +
          'les fonctionnalités Pro jusqu\'à la fin de votre période de facturation en cours, puis votre ' +
          'compte revient au niveau gratuit.',
      },
      {
        heading: 'Exception pour renouvellement accidentel',
        body:
          'Si vous avez oublié d\'annuler et avez été facturé pour un renouvellement non souhaité, envoyez-nous ' +
          'un e-mail à support@basketballtacticboard.com dans les 7 jours suivant la date de renouvellement ' +
          'et nous effectuerons un remboursement complet. Cette exception s\'applique une fois par compte.',
      },
      {
        heading: 'Annulation',
        body:
          'Vous pouvez annuler votre abonnement à tout moment depuis les paramètres de votre compte ou le ' +
          'portail client Paddle. Aucun autre frais ne sera facturé après l\'annulation.',
      },
      {
        heading: 'Problèmes techniques',
        body:
          'Si une erreur technique vérifiable de notre part vous a empêché d\'accéder aux fonctionnalités Pro, ' +
          'nous examinerons le cas individuellement. Contactez support@basketballtacticboard.com avec les détails.',
      },
      {
        heading: 'Contact',
        body: 'Des questions ? Écrivez-nous à ' + CONTACT_EMAIL,
      },
    ],
  },
  it: {
    title: 'Politica di rimborso e cancellazione',
    lastUpdatedLabel: 'Ultimo aggiornamento:',
    backToHome: '← Torna alla home',
    termsLink: 'Termini di servizio',
    privacyLink: 'Informativa sulla privacy',
    questionsLabel: 'Domande?',
    sections: [
      {
        heading: 'Panoramica',
        body:
          'Gli abbonamenti Pro di Basketball Tactic Board vengono elaborati tramite Paddle. Paddle agisce ' +
          'come processore di pagamento registrato e Merchant of Record, gestendo tutta la fatturazione. ' +
          'Il nome di Paddle potrebbe apparire sull\'estratto conto del pagamento.',
      },
      {
        heading: 'Nessun rimborso',
        body:
          'Pro è un servizio digitale con accesso completo immediato all\'acquisto. Per questo motivo, i ' +
          'pagamenti completati non sono rimborsabili. Puoi disdire in qualsiasi momento — mantieni le ' +
          'funzionalità Pro fino alla fine del tuo periodo di fatturazione corrente, poi il tuo account ' +
          'torna al livello gratuito.',
      },
      {
        heading: 'Eccezione per rinnovo accidentale',
        body:
          'Se hai dimenticato di disdire e ti è stato addebitato un rinnovo indesiderato, invia un\'e-mail a ' +
          'support@basketballtacticboard.com entro 7 giorni dalla data di rinnovo e ti rimborseremo ' +
          'l\'intero importo. Questa eccezione si applica una volta per account.',
      },
      {
        heading: 'Cancellazione',
        body:
          'Puoi disdire il tuo abbonamento in qualsiasi momento dalle impostazioni del tuo account o dal ' +
          'portale clienti di Paddle. Nessun ulteriore addebito verrà effettuato dopo la disdetta.',
      },
      {
        heading: 'Problemi tecnici',
        body:
          'Se un errore tecnico verificabile da parte nostra ti ha impedito completamente di accedere alle ' +
          'funzionalità Pro, esamineremo il caso individualmente. Contatta support@basketballtacticboard.com con i dettagli.',
      },
      {
        heading: 'Contatti',
        body: 'Domande? Scrivici a ' + CONTACT_EMAIL,
      },
    ],
  },
}

export default function RefundPage() {
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

        <h1 className="text-3xl font-bold mb-2">{copy.title}</h1>
        <p className="text-slate-500 text-sm mb-8">{copy.lastUpdatedLabel} {LAST_UPDATED}</p>

        <div className="flex flex-col gap-6">
          {copy.sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-lg font-semibold text-orange-400 mb-2">{s.heading}</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 text-center text-sm text-slate-500 space-y-2">
          <div>
            <Link to="/" className="hover:text-orange-400 transition-colors">{copy.backToHome}</Link>
            <span className="mx-3">·</span>
            <Link to="/terms" className="hover:text-orange-400 transition-colors">{copy.termsLink}</Link>
            <span className="mx-3">·</span>
            <Link to="/privacy" className="hover:text-orange-400 transition-colors">{copy.privacyLink}</Link>
          </div>
          <div>{copy.questionsLabel} <a href={`mailto:${CONTACT_EMAIL}`} className="text-orange-400 hover:text-orange-300 transition-colors">{CONTACT_EMAIL}</a></div>
        </div>
      </div>
    </div>
  )
}
