import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from '../components/ui/Logo'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'

const CONTACT_EMAIL = 'support@basketballtacticboard.com'
const LAST_UPDATED = '2026-06-03'

const COPY: Record<'tr' | 'en', { title: string; sections: Array<{ heading: string; body: string }> }> = {
  tr: {
    title: 'Kullanım Koşulları',
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
          'tier\'da kayıtlı oyun sayısı sınırlı olabilir. Pro abonelik, ödeme periyodu sonunda otomatik olarak ' +
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
          'tier may have a cap on the number of saved plays. The Pro subscription auto-renews at the end ' +
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
}

export default function TermsPage() {
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
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
          <Link to="/" className="hover:text-orange-400 transition-colors">← Back to Home</Link>
          <span className="mx-3">·</span>
          <Link to="/privacy" className="hover:text-orange-400 transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
}
