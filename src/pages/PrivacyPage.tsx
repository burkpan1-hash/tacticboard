import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from '../components/ui/Logo'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'

const CONTACT_EMAIL = 'burkpan1@gmail.com'
const LAST_UPDATED = '2026-06-03'

// Bilingual legal copy — switched by i18n language. Other locales fall back to EN.
// Legal text is kept inline (not in JSON) because the JSON i18n format is awkward
// for multi-paragraph prose, and translating the same paragraph across 6 locales
// without a translator adds risk of meaningful drift in a legal document.
const COPY: Record<'tr' | 'en', { title: string; sections: Array<{ heading: string; body: string }> }> = {
  tr: {
    title: 'Gizlilik Politikası',
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
          'kısa süreli çerezler kullanılır. Yakın gelecekte Google AdSense reklamları eklendiğinde reklam ' +
          'çerezleri de eklenecektir — bu aşamada açık rıza isteyeceğiz.',
      },
      {
        heading: 'Üçüncü Taraf Hizmetler',
        body:
          'Resend (e-posta gönderimi), Sentry (hata takibi), PostHog (analytics), Fly.io (hosting) ve ' +
          'Cloudflare (DNS) gibi hizmetleri kullanırız. Yakında Stripe (ödeme) ve Google AdSense (reklam) ' +
          'eklenecektir. Bu sağlayıcılar yalnızca işlevsel olarak gerekli verileri görür.',
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
          'için Pro aboneliği sunulacaktır. Ödeme bilgileri Stripe tarafından PCI-DSS uyumlu olarak işlenir; ' +
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
          'identify you personally. When Google AdSense ads are added in the near future, ad cookies will ' +
          'also be used — we will request explicit consent at that point.',
      },
      {
        heading: 'Third-Party Services',
        body:
          'We use Resend (email), Sentry (error tracking), PostHog (analytics), Fly.io (hosting), and ' +
          'Cloudflare (DNS). Coming soon: Stripe (payments) and Google AdSense (ads). These providers ' +
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
          'The service is funded by ads for the free tier. A Pro subscription will be offered for users ' +
          'who want to remove ads. Payment information is processed by Stripe in a PCI-DSS-compliant way; ' +
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
}

export default function PrivacyPage() {
  const { i18n } = useTranslation()
  const copy = i18n.language === 'tr' ? COPY.tr : COPY.en

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/"><Logo size={32} /></Link>
          <LanguageSwitcher />
        </div>

        <h1 className="text-3xl font-bold mb-2">{copy.title}</h1>
        <p className="text-slate-500 text-sm mb-8">Last updated: {LAST_UPDATED}</p>

        <div className="flex flex-col gap-6">
          {copy.sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-lg font-semibold text-orange-400 mb-2">{s.heading}</h2>
              <p className="text-slate-300 leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
          <Link to="/" className="hover:text-orange-400 transition-colors">← Back to Home</Link>
          <span className="mx-3">·</span>
          <Link to="/terms" className="hover:text-orange-400 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  )
}
