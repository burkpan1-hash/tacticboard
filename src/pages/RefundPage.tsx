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
        heading: '14 Günlük Para İade Garantisi',
        body:
          'Pro aboneliğinizin ilk ödemesinden itibaren 14 gün içinde memnun kalmazsanız tam iade talep ' +
          'edebilirsiniz. İade talebinde bulunmak için support@basketballtacticboard.com adresine e-posta ' +
          'gönderin veya Paddle\'ın müşteri portalından talep oluşturun. İade, orijinal ödeme yönteminize ' +
          '5–10 iş günü içinde yansır.',
      },
      {
        heading: 'Kısmi İade Yapılmaz',
        body:
          'Mevcut fatura döneminin ortasında yapılan iptaller için kısmi iade yapılmaz. Aboneliğinizi iptal ' +
          'ettiğinizde, mevcut ödeme dönemi sonuna kadar Pro özelliklerine erişiminiz devam eder; sonrasında ' +
          'hesabınız otomatik olarak ücretsiz katmana geçer.',
      },
      {
        heading: 'İptal',
        body:
          'Aboneliğinizi istediğiniz zaman hesap ayarlarınızdan veya Paddle müşteri portalından iptal ' +
          'edebilirsiniz. İptal sonrasında tekrar ücret alınmaz. İptal etmeyi unutur ve istemediğiniz bir ' +
          'yenileme ücreti tahsil edilirse, yenileme tarihinden itibaren 7 gün içinde başvurmanız halinde ' +
          'tam iade yaparız.',
      },
      {
        heading: 'İstisna Durumlar',
        body:
          'Teknik bir hata veya hizmet kesintisi nedeniyle Pro özelliklerini kullanamadığınız kanıtlanabilir ' +
          'durumlarda, etkilenen süreyle orantılı bir iade değerlendirilebilir. Her talep ayrı incelenir.',
      },
      {
        heading: 'İade Nasıl Talep Edilir',
        body:
          'support@basketballtacticboard.com adresine "İade Talebi" konusuyla e-posta gönderin. E-postanıza ' +
          'kayıtlı e-posta adresinizi, satın alma tarihini ve iade nedeninizi ekleyin. 2 iş günü içinde ' +
          'dönüş yaparız.',
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
        heading: '14-Day Money-Back Guarantee',
        body:
          'If you are not satisfied with your Pro subscription, you may request a full refund within ' +
          '14 days of your first payment. To request a refund, email support@basketballtacticboard.com ' +
          'or submit a request through Paddle\'s customer portal. Refunds are returned to your original ' +
          'payment method within 5–10 business days.',
      },
      {
        heading: 'No Partial Refunds',
        body:
          'We do not issue partial refunds for cancellations made mid-billing-period. When you cancel, ' +
          'you retain access to Pro features until the end of your current paid period, after which your ' +
          'account automatically downgrades to the free tier.',
      },
      {
        heading: 'Cancellation',
        body:
          'You may cancel your subscription at any time from your account settings or Paddle\'s customer ' +
          'portal. No further charges will be made after cancellation. If you forget to cancel and are ' +
          'charged for an unwanted renewal, we will issue a full refund if you contact us within 7 days ' +
          'of the renewal date.',
      },
      {
        heading: 'Exceptional Cases',
        body:
          'If you were unable to access Pro features due to a verifiable technical error or service ' +
          'outage on our end, a pro-rated refund for the affected period may be considered. Each case ' +
          'is reviewed individually.',
      },
      {
        heading: 'How to Request a Refund',
        body:
          'Email support@basketballtacticboard.com with the subject "Refund Request". Include your ' +
          'registered email address, purchase date, and reason for the refund. We will respond within ' +
          '2 business days.',
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
