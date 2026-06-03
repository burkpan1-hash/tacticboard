import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'btb_cookie_consent'  // 'accepted' | 'declined' | absent
const CHANGE_EVENT = 'btb-consent-changed'

export type ConsentState = 'accepted' | 'declined' | 'unset'

export function getConsent(): ConsentState {
  if (typeof localStorage === 'undefined') return 'unset'
  const v = localStorage.getItem(STORAGE_KEY)
  if (v === 'accepted' || v === 'declined') return v
  return 'unset'
}

export function setConsent(state: 'accepted' | 'declined') {
  localStorage.setItem(STORAGE_KEY, state)
  // Notify in-page listeners (analytics init, ad loader) without forcing a reload.
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: state }))
}

export function onConsentChange(handler: (state: ConsentState) => void): () => void {
  const wrapper = (e: Event) => handler((e as CustomEvent).detail as ConsentState)
  window.addEventListener(CHANGE_EVENT, wrapper)
  return () => window.removeEventListener(CHANGE_EVENT, wrapper)
}

const COPY: Record<'tr' | 'en', { message: string; accept: string; decline: string; learnMore: string }> = {
  tr: {
    message:
      'Bu site, hizmeti sunmak için zorunlu çerezler kullanır. Site kullanımını anlamak için ' +
      'opsiyonel analytics çerezleri kullanmamızı kabul eder misin? Reklamlar eklendiğinde ayrıca soracağız.',
    accept: 'Kabul Et',
    decline: 'Yalnızca Zorunlu',
    learnMore: 'Detay',
  },
  en: {
    message:
      'This site uses essential cookies to provide the service. Will you allow optional analytics ' +
      'cookies so we can understand how the site is used? We will ask separately when ads are added.',
    accept: 'Accept',
    decline: 'Essential Only',
    learnMore: 'Learn more',
  },
}

export default function CookieConsentBanner() {
  const { i18n } = useTranslation()
  const [visible, setVisible] = useState(false)
  const copy = i18n.language === 'tr' ? COPY.tr : COPY.en

  useEffect(() => {
    if (getConsent() === 'unset') setVisible(true)
  }, [])

  if (!visible) return null

  function handle(choice: 'accepted' | 'declined') {
    setConsent(choice)
    setVisible(false)
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] bg-slate-900/95 backdrop-blur border-t border-slate-700 shadow-2xl">
      <div className="max-w-5xl mx-auto p-4 flex flex-col md:flex-row md:items-center gap-3">
        <p className="text-sm text-slate-300 flex-1 leading-relaxed">
          {copy.message}{' '}
          <Link to="/privacy" className="text-orange-400 hover:underline whitespace-nowrap">
            {copy.learnMore}
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handle('declined')}
            className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            {copy.decline}
          </button>
          <button
            onClick={() => handle('accepted')}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium transition-colors"
          >
            {copy.accept}
          </button>
        </div>
      </div>
    </div>
  )
}
