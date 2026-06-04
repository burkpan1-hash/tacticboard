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
  questionsLabel: string
  sections: Array<{ heading: string; body: string }>
}

const COPY: Record<LangKey, LangCopy> = {
  tr: {
    title: 'Gizlilik Politikası',
    lastUpdatedLabel: 'Son güncelleme:',
    backToHome: '← Ana Sayfa',
    termsLink: 'Kullanım Koşulları',
    questionsLabel: 'Sorularınız için:',
    sections: [
      {
        heading: 'Toplanan Bilgiler',
        body:
          'Hesap oluşturduğunuzda e-posta adresinizi ve şifrenizi (şifrelenmiş olarak) saklarız. ' +
          'Uygulamada oluşturduğunuz oyun şemaları sunucumuzda hesabınıza bağlı olarak depolanır. ' +
          'Site kullanımına dair anonim analytics verisi (sayfa görüntüleme, hangi özelliklerin kullanıldığı) ' +
          'toplarız. Hata takibi için kullanıcı eylemlerine ait teknik kayıtlar (stack trace, tarayıcı bilgisi) tutulur.',
      },
      {
        heading: 'Bilgiler Nasıl Kullanılır',
        body:
          'E-posta adresiniz yalnızca giriş, doğrulama, parola sıfırlama ve hizmetle ilgili önemli ' +
          'bildirimler için kullanılır. Pazarlama e-postası göndermeyiz (siz onaylamadıkça). Oyun ' +
          'şemalarınız sizin özelinizdir; sadece sizin ve paylaştığınız linkle erişen kişilerin görmesi içindir.',
      },
      {
        heading: 'Çerezler ve İzleme',
        body:
          'Oturum yönetimi için zorunlu çerezler kullanırız. Analytics için yine kullanıcıyı tanımlamayan ' +
          'kısa süreli çerezler kullanılır. Google AdSense reklamları eklendiğinde reklam ' +
          'çerezleri de eklenecektir — bu aşamada açık rıza isteyeceğiz.',
      },
      {
        heading: 'Üçüncü Taraf Hizmetler',
        body:
          'Resend (e-posta gönderimi), Sentry (hata takibi), PostHog (analytics), Fly.io (hosting) ve ' +
          'Cloudflare (DNS) hizmetlerini kullanırız. Paddle (ödeme) ve Google AdSense (reklam) de ' +
          'kullanılmaktadır. Bu sağlayıcılar yalnızca işlevsel olarak gerekli verileri görür.',
      },
      {
        heading: 'Verinizi Silme Hakkı',
        body:
          'Hesabınızı istediğiniz zaman silebilirsiniz; tüm verileriniz (oyunlar, hesap bilgileri) silinir. ' +
          'KVKK/GDPR kapsamındaki haklarınızı kullanmak için ' + CONTACT_EMAIL + ' adresinden bize ulaşın.',
      },
      {
        heading: 'Reklamlar ve Abonelik',
        body:
          'Hizmet, ücretsiz tier için reklamlarla finanse edilir. Reklamları kaldırmak isteyen kullanıcılar ' +
          'için Pro aboneliği sunulmaktadır. Ödeme bilgileri Paddle tarafından PCI-DSS uyumlu olarak işlenir; ' +
          'kredi kartı bilgilerinizi biz görmeyiz.',
      },
      {
        heading: 'Politika Değişiklikleri',
        body:
          'Bu politikayı güncellersek, son güncelleme tarihini değiştiririz ve önemli değişiklikler için ' +
          'e-posta ile bilgilendiririz.',
      },
      {
        heading: 'İletişim',
        body: 'Sorularınız için: ' + CONTACT_EMAIL,
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    lastUpdatedLabel: 'Last updated:',
    backToHome: '← Back to Home',
    termsLink: 'Terms of Service',
    questionsLabel: 'Questions?',
    sections: [
      {
        heading: 'Information We Collect',
        body:
          'When you create an account, we store your email address and password (hashed). The plays you ' +
          'create in the app are stored on our server linked to your account. We collect anonymous usage ' +
          'analytics (page views, which features are used). For error tracking, we keep technical logs of ' +
          'user actions (stack traces, browser info).',
      },
      {
        heading: 'How We Use Information',
        body:
          'Your email is used only for sign-in, verification, password reset, and important service ' +
          'notifications. We do not send marketing emails (unless you opt in). Your plays are private to ' +
          'you and to anyone you share a link with.',
      },
      {
        heading: 'Cookies and Tracking',
        body:
          'We use essential cookies for session management. Analytics uses short-lived cookies that do not ' +
          'identify you personally. Ad cookies are used for Google AdSense — we request explicit consent ' +
          'via the cookie consent banner.',
      },
      {
        heading: 'Third-Party Services',
        body:
          'We use Resend (email), Sentry (error tracking), PostHog (analytics), Fly.io (hosting), and ' +
          'Cloudflare (DNS). We also use Paddle (payments) and Google AdSense (ads). These providers ' +
          'only see data that is functionally necessary.',
      },
      {
        heading: 'Your Right to Delete',
        body:
          'You can delete your account at any time; all your data (plays, account info) will be removed. ' +
          'To exercise your GDPR/CCPA rights, contact us at ' + CONTACT_EMAIL + '.',
      },
      {
        heading: 'Ads and Subscription',
        body:
          'The service is funded by ads for the free tier. A Pro subscription is available for users ' +
          'who want to remove ads. Payment information is processed by Paddle in a PCI-DSS-compliant way; ' +
          'we never see your credit card details.',
      },
      {
        heading: 'Changes to This Policy',
        body:
          'If we update this policy, we will change the last-updated date and notify you by email for ' +
          'material changes.',
      },
      {
        heading: 'Contact',
        body: 'Questions? Email ' + CONTACT_EMAIL,
      },
    ],
  },
  de: {
    title: 'Datenschutzerklärung',
    lastUpdatedLabel: 'Zuletzt aktualisiert:',
    backToHome: '← Zur Startseite',
    termsLink: 'Nutzungsbedingungen',
    questionsLabel: 'Fragen?',
    sections: [
      {
        heading: 'Gesammelte Informationen',
        body:
          'Bei der Kontoerstellung speichern wir Ihre E-Mail-Adresse und Ihr Passwort (verschlüsselt). ' +
          'Die von Ihnen erstellten Spielzüge werden auf unserem Server mit Ihrem Konto verknüpft gespeichert. ' +
          'Wir erfassen anonyme Nutzungsstatistiken (Seitenaufrufe, genutzte Funktionen). Für die Fehlerverfolgung ' +
          'werden technische Protokolle (Stack-Traces, Browser-Informationen) gespeichert.',
      },
      {
        heading: 'Verwendung der Informationen',
        body:
          'Ihre E-Mail-Adresse wird ausschließlich für Anmeldung, Verifizierung, Passwort-Zurücksetzung und ' +
          'wichtige Dienstmitteilungen verwendet. Wir versenden keine Marketing-E-Mails (außer mit Ihrer Zustimmung). ' +
          'Ihre Spielzüge sind privat und nur für Sie und Personen sichtbar, mit denen Sie einen Link teilen.',
      },
      {
        heading: 'Cookies und Tracking',
        body:
          'Wir verwenden notwendige Cookies für das Session-Management. Analytics verwendet kurzlebige Cookies, ' +
          'die Sie nicht persönlich identifizieren. Für Google AdSense werden Werbe-Cookies verwendet — ' +
          'wir holen Ihre ausdrückliche Zustimmung über das Cookie-Banner ein.',
      },
      {
        heading: 'Drittanbieter-Dienste',
        body:
          'Wir nutzen Resend (E-Mail), Sentry (Fehlerverfolgung), PostHog (Analytics), Fly.io (Hosting) und ' +
          'Cloudflare (DNS). Außerdem verwenden wir Paddle (Zahlungen) und Google AdSense (Werbung). ' +
          'Diese Anbieter sehen nur die funktional notwendigen Daten.',
      },
      {
        heading: 'Ihr Recht auf Löschung',
        body:
          'Sie können Ihr Konto jederzeit löschen; alle Ihre Daten (Spielzüge, Kontoinformationen) werden entfernt. ' +
          'Um Ihre DSGVO-Rechte geltend zu machen, kontaktieren Sie uns unter ' + CONTACT_EMAIL + '.',
      },
      {
        heading: 'Werbung und Abonnement',
        body:
          'Der Dienst wird durch Werbung für den kostenlosen Tarif finanziert. Für Nutzer, die Werbung entfernen ' +
          'möchten, wird ein Pro-Abonnement angeboten. Zahlungsinformationen werden PCI-DSS-konform von Paddle ' +
          'verarbeitet; wir sehen Ihre Kreditkartendaten nie.',
      },
      {
        heading: 'Änderungen dieser Richtlinie',
        body:
          'Wenn wir diese Richtlinie aktualisieren, ändern wir das Datum der letzten Aktualisierung und ' +
          'informieren Sie per E-Mail über wesentliche Änderungen.',
      },
      {
        heading: 'Kontakt',
        body: 'Fragen? Schreiben Sie uns: ' + CONTACT_EMAIL,
      },
    ],
  },
  es: {
    title: 'Política de privacidad',
    lastUpdatedLabel: 'Última actualización:',
    backToHome: '← Volver al inicio',
    termsLink: 'Términos de servicio',
    questionsLabel: '¿Preguntas?',
    sections: [
      {
        heading: 'Información que recopilamos',
        body:
          'Al crear una cuenta, almacenamos su dirección de correo electrónico y contraseña (cifrada). ' +
          'Las jugadas que crea en la aplicación se almacenan en nuestro servidor vinculadas a su cuenta. ' +
          'Recopilamos análisis de uso anónimos (vistas de página, funciones utilizadas). Para el seguimiento ' +
          'de errores, mantenemos registros técnicos de acciones del usuario (trazas de pila, información del navegador).',
      },
      {
        heading: 'Cómo usamos la información',
        body:
          'Su correo electrónico se utiliza únicamente para inicio de sesión, verificación, restablecimiento de ' +
          'contraseña y notificaciones importantes del servicio. No enviamos correos de marketing (salvo que ' +
          'lo autorice). Sus jugadas son privadas — accesibles solo por usted y quienes accedan mediante un enlace.',
      },
      {
        heading: 'Cookies y seguimiento',
        body:
          'Usamos cookies esenciales para la gestión de sesiones. Los análisis utilizan cookies de corta duración ' +
          'que no lo identifican personalmente. Para Google AdSense se usan cookies publicitarias — ' +
          'solicitamos su consentimiento explícito a través del banner de cookies.',
      },
      {
        heading: 'Servicios de terceros',
        body:
          'Utilizamos Resend (correo), Sentry (seguimiento de errores), PostHog (análisis), Fly.io (alojamiento) ' +
          'y Cloudflare (DNS). También usamos Paddle (pagos) y Google AdSense (anuncios). ' +
          'Estos proveedores solo ven los datos funcionalmente necesarios.',
      },
      {
        heading: 'Su derecho a eliminar',
        body:
          'Puede eliminar su cuenta en cualquier momento; todos sus datos (jugadas, información de cuenta) ' +
          'serán eliminados. Para ejercer sus derechos GDPR/CCPA, contáctenos en ' + CONTACT_EMAIL + '.',
      },
      {
        heading: 'Anuncios y suscripción',
        body:
          'El servicio se financia con publicidad para el nivel gratuito. Se ofrece una suscripción Pro para ' +
          'usuarios que deseen eliminar los anuncios. La información de pago es procesada por Paddle de forma ' +
          'compatible con PCI-DSS; nunca vemos los datos de su tarjeta de crédito.',
      },
      {
        heading: 'Cambios en esta política',
        body:
          'Si actualizamos esta política, cambiaremos la fecha de última actualización y le notificaremos ' +
          'por correo electrónico sobre cambios importantes.',
      },
      {
        heading: 'Contacto',
        body: '¿Preguntas? Escríbanos a ' + CONTACT_EMAIL,
      },
    ],
  },
  fr: {
    title: 'Politique de confidentialité',
    lastUpdatedLabel: 'Dernière mise à jour :',
    backToHome: '← Retour à l\'accueil',
    termsLink: 'Conditions d\'utilisation',
    questionsLabel: 'Des questions ?',
    sections: [
      {
        heading: 'Informations collectées',
        body:
          'Lors de la création d\'un compte, nous stockons votre adresse e-mail et votre mot de passe (haché). ' +
          'Les jeux que vous créez dans l\'application sont stockés sur notre serveur et liés à votre compte. ' +
          'Nous collectons des analyses d\'utilisation anonymes (pages vues, fonctionnalités utilisées). ' +
          'Pour le suivi des erreurs, nous conservons des journaux techniques des actions des utilisateurs.',
      },
      {
        heading: 'Utilisation des informations',
        body:
          'Votre adresse e-mail est utilisée uniquement pour la connexion, la vérification, la réinitialisation ' +
          'du mot de passe et les notifications importantes du service. Nous n\'envoyons pas d\'e-mails ' +
          'marketing (sauf si vous y consentez). Vos jeux sont privés — accessibles uniquement par vous ' +
          'et les personnes avec qui vous partagez un lien.',
      },
      {
        heading: 'Cookies et suivi',
        body:
          'Nous utilisons des cookies essentiels pour la gestion des sessions. Les analyses utilisent des ' +
          'cookies de courte durée qui ne vous identifient pas personnellement. Pour Google AdSense, des ' +
          'cookies publicitaires sont utilisés — nous demandons votre consentement explicite via la bannière.',
      },
      {
        heading: 'Services tiers',
        body:
          'Nous utilisons Resend (e-mail), Sentry (suivi des erreurs), PostHog (analyses), Fly.io (hébergement) ' +
          'et Cloudflare (DNS). Nous utilisons également Paddle (paiements) et Google AdSense (publicités). ' +
          'Ces fournisseurs ne voient que les données fonctionnellement nécessaires.',
      },
      {
        heading: 'Votre droit à la suppression',
        body:
          'Vous pouvez supprimer votre compte à tout moment ; toutes vos données (jeux, informations de compte) ' +
          'seront supprimées. Pour exercer vos droits RGPD/CCPA, contactez-nous à ' + CONTACT_EMAIL + '.',
      },
      {
        heading: 'Publicités et abonnement',
        body:
          'Le service est financé par des publicités pour le niveau gratuit. Un abonnement Pro est proposé ' +
          'aux utilisateurs souhaitant supprimer les publicités. Les informations de paiement sont traitées ' +
          'par Paddle de manière conforme PCI-DSS ; nous ne voyons jamais vos coordonnées bancaires.',
      },
      {
        heading: 'Modifications de cette politique',
        body:
          'Si nous mettons à jour cette politique, nous changerons la date de dernière mise à jour et vous ' +
          'informerons par e-mail des modifications importantes.',
      },
      {
        heading: 'Contact',
        body: 'Des questions ? Écrivez-nous à ' + CONTACT_EMAIL,
      },
    ],
  },
  it: {
    title: 'Informativa sulla privacy',
    lastUpdatedLabel: 'Ultimo aggiornamento:',
    backToHome: '← Torna alla home',
    termsLink: 'Termini di servizio',
    questionsLabel: 'Domande?',
    sections: [
      {
        heading: 'Informazioni raccolte',
        body:
          'Quando crei un account, memorizziamo il tuo indirizzo e-mail e la tua password (cifrata). ' +
          'Le giocate che crei nell\'app vengono salvate sul nostro server collegate al tuo account. ' +
          'Raccogliamo statistiche d\'uso anonime (visualizzazioni di pagina, funzionalità utilizzate). ' +
          'Per il tracciamento degli errori, conserviamo log tecnici delle azioni degli utenti.',
      },
      {
        heading: 'Utilizzo delle informazioni',
        body:
          'Il tuo indirizzo e-mail viene utilizzato solo per l\'accesso, la verifica, il recupero della ' +
          'password e le notifiche importanti del servizio. Non inviamo e-mail di marketing (salvo tuo ' +
          'consenso). Le tue giocate sono private — visibili solo a te e alle persone con cui condividi un link.',
      },
      {
        heading: 'Cookie e tracciamento',
        body:
          'Utilizziamo cookie essenziali per la gestione delle sessioni. Le analisi usano cookie di breve ' +
          'durata che non ti identificano personalmente. Per Google AdSense vengono utilizzati cookie ' +
          'pubblicitari — richiediamo il tuo consenso esplicito tramite il banner dei cookie.',
      },
      {
        heading: 'Servizi di terze parti',
        body:
          'Utilizziamo Resend (e-mail), Sentry (tracciamento errori), PostHog (analisi), Fly.io (hosting) ' +
          'e Cloudflare (DNS). Utilizziamo anche Paddle (pagamenti) e Google AdSense (pubblicità). ' +
          'Questi fornitori vedono solo i dati funzionalmente necessari.',
      },
      {
        heading: 'Il tuo diritto alla cancellazione',
        body:
          'Puoi eliminare il tuo account in qualsiasi momento; tutti i tuoi dati (giocate, informazioni ' +
          'account) verranno rimossi. Per esercitare i tuoi diritti GDPR/CCPA, contattaci all\'indirizzo ' + CONTACT_EMAIL + '.',
      },
      {
        heading: 'Pubblicità e abbonamento',
        body:
          'Il servizio è finanziato dalla pubblicità per il livello gratuito. È disponibile un abbonamento ' +
          'Pro per gli utenti che desiderano rimuovere le pubblicità. Le informazioni di pagamento vengono ' +
          'elaborate da Paddle in modo conforme PCI-DSS; non vediamo mai i dati della tua carta di credito.',
      },
      {
        heading: 'Modifiche a questa informativa',
        body:
          'Se aggiorniamo questa informativa, cambieremo la data dell\'ultimo aggiornamento e ti informeremo ' +
          'via e-mail delle modifiche sostanziali.',
      },
      {
        heading: 'Contatti',
        body: 'Domande? Scrivici a ' + CONTACT_EMAIL,
      },
    ],
  },
}

export default function PrivacyPage() {
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
              <p className="text-slate-300 leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 text-center text-sm text-slate-500 space-y-2">
          <div>
            <Link to="/" className="hover:text-orange-400 transition-colors">{copy.backToHome}</Link>
            <span className="mx-3">·</span>
            <Link to="/terms" className="hover:text-orange-400 transition-colors">{copy.termsLink}</Link>
          </div>
          <div>{copy.questionsLabel} <a href={`mailto:${CONTACT_EMAIL}`} className="text-orange-400 hover:text-orange-300 transition-colors">{CONTACT_EMAIL}</a></div>
        </div>
      </div>
    </div>
  )
}
