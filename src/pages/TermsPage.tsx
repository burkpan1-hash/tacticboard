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
  privacyLink: string
  questionsLabel: string
  sections: Array<{ heading: string; body: string }>
}

const COPY: Record<LangKey, LangCopy> = {
  tr: {
    title: 'Kullanım Koşulları',
    lastUpdatedLabel: 'Son güncelleme:',
    backToHome: '← Ana Sayfa',
    privacyLink: 'Gizlilik Politikası',
    questionsLabel: 'Sorularınız için:',
    sections: [
      {
        heading: 'Hizmet',
        body:
          'Basketball Tactic Board, basketbol antrenör ve oyuncularının takım taktikleri oluşturup ' +
          'paylaşabileceği web tabanlı bir uygulamadır. basketballtacticboard.com üzerinden erişilir.',
      },
      {
        heading: 'Hesap Sorumluluğu',
        body:
          'Hesap oluşturarak gerçek bir e-posta adresi sağladığınızı ve hesabınızla yapılan tüm işlemlerden ' +
          'sorumlu olduğunuzu kabul edersiniz. Şifrenizi gizli tutmalı, paylaşmamalısınız. Hesabın yetkisiz ' +
          'kullanımını fark ederseniz derhal bizi haberdar etmelisiniz.',
      },
      {
        heading: 'İçerik Sahipliği',
        body:
          'Uygulamada oluşturduğunuz oyun şemaları size aittir. Hizmeti sunmak için içeriği depolamak, ' +
          'işlemek ve göstermek için sınırlı bir lisans bize tanırsınız. İçeriğinizi başkalarına satmıyor ' +
          'veya kendi içeriğimiz olarak kullanmıyoruz.',
      },
      {
        heading: 'Ücretsiz ve Pro Tier',
        body:
          'Hizmet, reklam destekli bir ücretsiz tier ve reklamsız bir Pro abonelik tier\'ı sunar. Ücretsiz ' +
          'tier\'da kayıtlı oyun sayısı sınırlıdır. Pro abonelik, ödeme periyodu sonunda otomatik olarak ' +
          'yenilenir; istediğiniz zaman iptal edebilirsiniz. İptal ettiğinizde mevcut periyodun sonuna kadar ' +
          'Pro özelliklerini kullanmaya devam edersiniz.',
      },
      {
        heading: 'Yasak Kullanımlar',
        body:
          'Hizmeti yasalara aykırı, başkalarının haklarını ihlal eden veya teknik altyapımıza zarar veren ' +
          'şekilde kullanmamalısınız. Reverse engineering, otomatik scraping veya hesabımızı kötüye kullanma ' +
          'yasaktır. Bu koşullara uymayan hesaplar uyarısız kapatılabilir.',
      },
      {
        heading: 'Hizmetin Değişikliği veya Sonlandırılması',
        body:
          'Hizmeti dilediğimiz zaman değiştirme, askıya alma veya sonlandırma hakkımız vardır. Önemli ' +
          'değişikliklerde önceden haber veririz. Hizmet sonlandığında verilerinizi dışa aktarmanız için ' +
          'makul bir süre veririz.',
      },
      {
        heading: 'Garanti Reddi',
        body:
          'Hizmet "olduğu gibi" sunulur. Herhangi bir garanti vermiyoruz — hizmetin kesintisiz, hatasız veya ' +
          'tüm gereksinimlerinizi karşılayacağını taahhüt etmiyoruz. Veri kaybı için makul önlemler alıyoruz ' +
          'ama önemli içeriğin kendi yedeğinizi tutmanızı öneririz.',
      },
      {
        heading: 'Yetkili Hukuk',
        body:
          'Bu koşullar Türkiye Cumhuriyeti yasalarına tabidir. Anlaşmazlıklar için yetkili mahkemeler ' +
          'İstanbul mahkemeleridir.',
      },
      {
        heading: 'İletişim',
        body: 'Sorularınız için: ' + CONTACT_EMAIL,
      },
    ],
  },
  en: {
    title: 'Terms of Service',
    lastUpdatedLabel: 'Last updated:',
    backToHome: '← Back to Home',
    privacyLink: 'Privacy Policy',
    questionsLabel: 'Questions?',
    sections: [
      {
        heading: 'The Service',
        body:
          'Basketball Tactic Board is a web-based app for basketball coaches and players to create and ' +
          'share team tactics. Accessed at basketballtacticboard.com.',
      },
      {
        heading: 'Account Responsibility',
        body:
          'By creating an account, you confirm that you have provided a real email address and that you ' +
          'are responsible for all actions taken with your account. You must keep your password secret. ' +
          'Notify us immediately if you become aware of unauthorized account use.',
      },
      {
        heading: 'Content Ownership',
        body:
          'The plays you create in the app are yours. You grant us a limited license to store, process, ' +
          'and display the content for the purpose of providing the service. We do not sell your content ' +
          'or use it as our own.',
      },
      {
        heading: 'Free and Pro Tier',
        body:
          'The service offers an ad-supported free tier and an ad-free Pro subscription tier. The free ' +
          'tier has a cap on the number of saved plays. The Pro subscription auto-renews at the end ' +
          'of each billing period; you can cancel anytime. After cancellation, you keep Pro features until ' +
          'the end of the current billing period.',
      },
      {
        heading: 'Prohibited Use',
        body:
          'You must not use the service in a way that breaks the law, infringes others\' rights, or harms ' +
          'our technical infrastructure. Reverse engineering, automated scraping, or abuse of our systems ' +
          'is prohibited. Accounts that violate these terms may be closed without warning.',
      },
      {
        heading: 'Modification or Termination',
        body:
          'We may change, suspend, or discontinue the service at any time. We will notify you of material ' +
          'changes in advance. If the service is discontinued, we will give you reasonable time to export ' +
          'your data.',
      },
      {
        heading: 'Disclaimer of Warranty',
        body:
          'The service is provided "as is". We make no warranties — we do not promise uninterrupted, ' +
          'error-free service, or that it meets all your requirements. We take reasonable measures to ' +
          'prevent data loss, but we recommend keeping your own backup of important content.',
      },
      {
        heading: 'Governing Law',
        body:
          'These terms are governed by the laws of the Republic of Türkiye. Disputes are subject to the ' +
          'jurisdiction of Istanbul courts.',
      },
      {
        heading: 'Contact',
        body: 'Questions? Email ' + CONTACT_EMAIL,
      },
    ],
  },
  de: {
    title: 'Nutzungsbedingungen',
    lastUpdatedLabel: 'Zuletzt aktualisiert:',
    backToHome: '← Zur Startseite',
    privacyLink: 'Datenschutzerklärung',
    questionsLabel: 'Fragen?',
    sections: [
      {
        heading: 'Der Dienst',
        body:
          'Basketball Tactic Board ist eine webbasierte App für Basketballtrainer und -spieler zum Erstellen ' +
          'und Teilen von Mannschaftstaktiken. Zugang über basketballtacticboard.com.',
      },
      {
        heading: 'Kontoverantwortung',
        body:
          'Mit der Erstellung eines Kontos bestätigen Sie, eine echte E-Mail-Adresse angegeben zu haben und ' +
          'für alle mit Ihrem Konto getätigten Aktionen verantwortlich zu sein. Sie müssen Ihr Passwort ' +
          'geheim halten. Benachrichtigen Sie uns sofort, wenn Sie unbefugte Kontonutzung feststellen.',
      },
      {
        heading: 'Inhaltseigentum',
        body:
          'Die Spielzüge, die Sie in der App erstellen, gehören Ihnen. Sie räumen uns eine begrenzte Lizenz ' +
          'ein, die Inhalte zur Bereitstellung des Dienstes zu speichern, zu verarbeiten und anzuzeigen. ' +
          'Wir verkaufen Ihre Inhalte nicht und verwenden sie nicht als unsere eigenen.',
      },
      {
        heading: 'Kostenloser und Pro-Tarif',
        body:
          'Der Dienst bietet einen werbeunterstützten kostenlosen Tarif und einen werbefreien Pro-Abonnement-Tarif. ' +
          'Im kostenlosen Tarif ist die Anzahl der gespeicherten Spielzüge begrenzt. Das Pro-Abonnement verlängert ' +
          'sich automatisch am Ende jedes Abrechnungszeitraums; Sie können jederzeit kündigen. Nach der Kündigung ' +
          'behalten Sie die Pro-Funktionen bis zum Ende des aktuellen Abrechnungszeitraums.',
      },
      {
        heading: 'Verbotene Nutzung',
        body:
          'Sie dürfen den Dienst nicht auf eine Weise nutzen, die gegen Gesetze verstößt, Rechte anderer verletzt ' +
          'oder unsere technische Infrastruktur schädigt. Reverse Engineering, automatisiertes Scraping oder ' +
          'Missbrauch unserer Systeme ist untersagt. Konten, die gegen diese Bedingungen verstoßen, können ohne ' +
          'Vorwarnung gesperrt werden.',
      },
      {
        heading: 'Änderung oder Beendigung',
        body:
          'Wir können den Dienst jederzeit ändern, aussetzen oder einstellen. Bei wesentlichen Änderungen ' +
          'informieren wir Sie im Voraus. Wenn der Dienst eingestellt wird, geben wir Ihnen angemessene Zeit, ' +
          'Ihre Daten zu exportieren.',
      },
      {
        heading: 'Haftungsausschluss',
        body:
          'Der Dienst wird "wie besehen" bereitgestellt. Wir geben keine Garantien — wir versprechen keinen ' +
          'ununterbrochenen, fehlerfreien Dienst oder dass er all Ihre Anforderungen erfüllt. Wir treffen ' +
          'angemessene Maßnahmen zur Vermeidung von Datenverlust, empfehlen jedoch eigene Backups wichtiger Inhalte.',
      },
      {
        heading: 'Geltendes Recht',
        body:
          'Diese Bedingungen unterliegen dem Recht der Republik Türkei. Streitigkeiten unterliegen der ' +
          'Zuständigkeit der Istanbuler Gerichte.',
      },
      {
        heading: 'Kontakt',
        body: 'Fragen? Schreiben Sie uns: ' + CONTACT_EMAIL,
      },
    ],
  },
  es: {
    title: 'Términos de servicio',
    lastUpdatedLabel: 'Última actualización:',
    backToHome: '← Volver al inicio',
    privacyLink: 'Política de privacidad',
    questionsLabel: '¿Preguntas?',
    sections: [
      {
        heading: 'El servicio',
        body:
          'Basketball Tactic Board es una app web para entrenadores y jugadores de baloncesto para crear y ' +
          'compartir tácticas de equipo. Accesible en basketballtacticboard.com.',
      },
      {
        heading: 'Responsabilidad de la cuenta',
        body:
          'Al crear una cuenta, confirma que ha proporcionado una dirección de correo electrónico real y que ' +
          'es responsable de todas las acciones realizadas con su cuenta. Debe mantener su contraseña en secreto. ' +
          'Notifíquenos inmediatamente si detecta un uso no autorizado de su cuenta.',
      },
      {
        heading: 'Propiedad del contenido',
        body:
          'Las jugadas que crea en la aplicación son suyas. Nos otorga una licencia limitada para almacenar, ' +
          'procesar y mostrar el contenido con el fin de prestar el servicio. No vendemos su contenido ni ' +
          'lo usamos como propio.',
      },
      {
        heading: 'Nivel gratuito y Pro',
        body:
          'El servicio ofrece un nivel gratuito con publicidad y un nivel de suscripción Pro sin publicidad. ' +
          'El nivel gratuito tiene un límite en el número de jugadas guardadas. La suscripción Pro se renueva ' +
          'automáticamente al final de cada período de facturación; puede cancelarla en cualquier momento. ' +
          'Tras la cancelación, conserva las funciones Pro hasta el final del período de facturación actual.',
      },
      {
        heading: 'Uso prohibido',
        body:
          'No debe usar el servicio de manera que infrinja la ley, los derechos de terceros o dañe nuestra ' +
          'infraestructura técnica. Se prohíben la ingeniería inversa, el scraping automatizado o el abuso ' +
          'de nuestros sistemas. Las cuentas que incumplan estos términos pueden ser cerradas sin previo aviso.',
      },
      {
        heading: 'Modificación o terminación',
        body:
          'Podemos modificar, suspender o discontinuar el servicio en cualquier momento. Le notificaremos ' +
          'con antelación sobre cambios importantes. Si el servicio se discontinúa, le daremos tiempo ' +
          'razonable para exportar sus datos.',
      },
      {
        heading: 'Exclusión de garantías',
        body:
          'El servicio se proporciona "tal cual". No ofrecemos garantías — no prometemos un servicio ' +
          'ininterrumpido, sin errores, ni que satisfaga todos sus requisitos. Tomamos medidas razonables ' +
          'para prevenir la pérdida de datos, pero recomendamos mantener su propia copia de seguridad.',
      },
      {
        heading: 'Ley aplicable',
        body:
          'Estos términos se rigen por las leyes de la República de Türkiye. Las disputas están sujetas ' +
          'a la jurisdicción de los tribunales de Estambul.',
      },
      {
        heading: 'Contacto',
        body: '¿Preguntas? Escríbanos a ' + CONTACT_EMAIL,
      },
    ],
  },
  fr: {
    title: 'Conditions d\'utilisation',
    lastUpdatedLabel: 'Dernière mise à jour :',
    backToHome: '← Retour à l\'accueil',
    privacyLink: 'Politique de confidentialité',
    questionsLabel: 'Des questions ?',
    sections: [
      {
        heading: 'Le service',
        body:
          'Basketball Tactic Board est une application web permettant aux entraîneurs et joueurs de basket-ball ' +
          'de créer et partager des tactiques d\'équipe. Accessible sur basketballtacticboard.com.',
      },
      {
        heading: 'Responsabilité du compte',
        body:
          'En créant un compte, vous confirmez avoir fourni une véritable adresse e-mail et être responsable ' +
          'de toutes les actions effectuées avec votre compte. Vous devez garder votre mot de passe secret. ' +
          'Informez-nous immédiatement si vous constatez une utilisation non autorisée de votre compte.',
      },
      {
        heading: 'Propriété du contenu',
        body:
          'Les jeux que vous créez dans l\'application vous appartiennent. Vous nous accordez une licence ' +
          'limitée pour stocker, traiter et afficher le contenu dans le but de fournir le service. Nous ne ' +
          'vendons pas votre contenu et ne l\'utilisons pas comme le nôtre.',
      },
      {
        heading: 'Niveau gratuit et Pro',
        body:
          'Le service propose un niveau gratuit financé par la publicité et un niveau d\'abonnement Pro sans ' +
          'publicité. Le niveau gratuit est limité en nombre de jeux sauvegardés. L\'abonnement Pro se ' +
          'renouvelle automatiquement à la fin de chaque période de facturation ; vous pouvez annuler à tout ' +
          'moment. Après annulation, vous conservez les fonctionnalités Pro jusqu\'à la fin de la période.',
      },
      {
        heading: 'Utilisation interdite',
        body:
          'Vous ne devez pas utiliser le service d\'une manière qui enfreint la loi, porte atteinte aux droits ' +
          'd\'autrui ou nuit à notre infrastructure technique. L\'ingénierie inverse, le scraping automatisé ' +
          'ou l\'abus de nos systèmes est interdit. Les comptes qui enfreignent ces conditions peuvent être ' +
          'fermés sans avertissement.',
      },
      {
        heading: 'Modification ou résiliation',
        body:
          'Nous pouvons modifier, suspendre ou arrêter le service à tout moment. Nous vous informerons à ' +
          'l\'avance des modifications importantes. Si le service est arrêté, nous vous accorderons un délai ' +
          'raisonnable pour exporter vos données.',
      },
      {
        heading: 'Exclusion de garantie',
        body:
          'Le service est fourni "tel quel". Nous ne faisons aucune garantie — nous ne promettons pas un ' +
          'service ininterrompu, sans erreur, ni qu\'il répondra à toutes vos exigences. Nous prenons des ' +
          'mesures raisonnables pour prévenir la perte de données, mais recommandons de conserver vos propres sauvegardes.',
      },
      {
        heading: 'Droit applicable',
        body:
          'Ces conditions sont régies par les lois de la République de Türkiye. Les litiges relèvent de la ' +
          'juridiction des tribunaux d\'Istanbul.',
      },
      {
        heading: 'Contact',
        body: 'Des questions ? Écrivez-nous à ' + CONTACT_EMAIL,
      },
    ],
  },
  it: {
    title: 'Termini di servizio',
    lastUpdatedLabel: 'Ultimo aggiornamento:',
    backToHome: '← Torna alla home',
    privacyLink: 'Informativa sulla privacy',
    questionsLabel: 'Domande?',
    sections: [
      {
        heading: 'Il servizio',
        body:
          'Basketball Tactic Board è un\'app web per allenatori e giocatori di basket per creare e condividere ' +
          'tattiche di squadra. Accessibile su basketballtacticboard.com.',
      },
      {
        heading: 'Responsabilità dell\'account',
        body:
          'Creando un account, confermi di aver fornito un indirizzo e-mail reale e di essere responsabile di ' +
          'tutte le azioni compiute con il tuo account. Devi mantenere la tua password segreta. Avvisaci ' +
          'immediatamente se rilevi un uso non autorizzato del tuo account.',
      },
      {
        heading: 'Proprietà del contenuto',
        body:
          'Le giocate che crei nell\'app sono tue. Ci concedi una licenza limitata per archiviare, elaborare ' +
          'e visualizzare il contenuto al fine di fornire il servizio. Non vendiamo i tuoi contenuti né ' +
          'li utilizziamo come nostri.',
      },
      {
        heading: 'Livello gratuito e Pro',
        body:
          'Il servizio offre un livello gratuito supportato da pubblicità e un livello di abbonamento Pro senza ' +
          'pubblicità. Il livello gratuito ha un limite sul numero di giocate salvate. L\'abbonamento Pro si ' +
          'rinnova automaticamente alla fine di ogni periodo di fatturazione; puoi disdire in qualsiasi momento. ' +
          'Dopo la disdetta, mantieni le funzionalità Pro fino alla fine del periodo corrente.',
      },
      {
        heading: 'Uso vietato',
        body:
          'Non devi utilizzare il servizio in modo da violare la legge, ledere i diritti altrui o danneggiare ' +
          'la nostra infrastruttura tecnica. Sono vietati il reverse engineering, lo scraping automatizzato o ' +
          'l\'abuso dei nostri sistemi. Gli account che violano questi termini possono essere chiusi senza preavviso.',
      },
      {
        heading: 'Modifica o interruzione',
        body:
          'Possiamo modificare, sospendere o interrompere il servizio in qualsiasi momento. Ti informeremo in ' +
          'anticipo delle modifiche sostanziali. Se il servizio viene interrotto, ti daremo un tempo ragionevole ' +
          'per esportare i tuoi dati.',
      },
      {
        heading: 'Esclusione di garanzie',
        body:
          'Il servizio è fornito "così com\'è". Non offriamo garanzie — non promettiamo un servizio ininterrotto, ' +
          'privo di errori, né che soddisfi tutti i tuoi requisiti. Prendiamo misure ragionevoli per prevenire ' +
          'la perdita di dati, ma consigliamo di mantenere un backup personale dei contenuti importanti.',
      },
      {
        heading: 'Legge applicabile',
        body:
          'Questi termini sono regolati dalle leggi della Repubblica di Türkiye. Le controversie sono soggette ' +
          'alla giurisdizione dei tribunali di Istanbul.',
      },
      {
        heading: 'Contatti',
        body: 'Domande? Scrivici a ' + CONTACT_EMAIL,
      },
    ],
  },
}

export default function TermsPage() {
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
            <Link to="/privacy" className="hover:text-orange-400 transition-colors">{copy.privacyLink}</Link>
          </div>
          <div>{copy.questionsLabel} <a href={`mailto:${CONTACT_EMAIL}`} className="text-orange-400 hover:text-orange-300 transition-colors">{CONTACT_EMAIL}</a></div>
        </div>
      </div>
    </div>
  )
}
