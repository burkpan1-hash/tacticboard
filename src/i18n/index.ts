import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import tr from './locales/tr.json'
import es from './locales/es.json'
import it from './locales/it.json'
import fr from './locales/fr.json'
import de from './locales/de.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  // Cast through unknown because i18next's bundled DetectorOptions type omits a few
  // valid runtime options (e.g. cacheUserLanguage) that i18next-browser-languagedetector ships.
  .init({
    resources: {
      en: { translation: en },
      tr: { translation: tr },
      es: { translation: es },
      it: { translation: it },
      fr: { translation: fr },
      de: { translation: de },
    },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'setplay_lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  } as Parameters<typeof i18n.init>[0])

export default i18n
