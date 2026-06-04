import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from '../components/ui/Logo'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'

const CONTACT_EMAIL = 'support@basketballtacticboard.com'
const LAST_UPDATED = '2026-06-04'

const COPY: Record<'tr' | 'en', { title: string; sections: Array<{ heading: string; body: string }> }> = {
  tr: {
    title: 'İade ve İptal Politikası',
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
}

export default function RefundPage() {
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

        <div className="mt-10 pt-6 border-t border-slate-800 text-center text-sm text-slate-500 space-y-2">
          <div>
            <Link to="/" className="hover:text-orange-400 transition-colors">← Back to Home</Link>
            <span className="mx-3">·</span>
            <Link to="/terms" className="hover:text-orange-400 transition-colors">Terms of Service</Link>
            <span className="mx-3">·</span>
            <Link to="/privacy" className="hover:text-orange-400 transition-colors">Privacy Policy</Link>
          </div>
          <div>Questions? <a href={`mailto:${CONTACT_EMAIL}`} className="text-orange-400 hover:text-orange-300 transition-colors">{CONTACT_EMAIL}</a></div>
        </div>
      </div>
    </div>
  )
}
