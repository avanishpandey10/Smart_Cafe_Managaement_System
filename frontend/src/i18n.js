import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import hi from './locales/hi.json'
import ta from './locales/ta.json'
import or_lang from './locales/or.json'
import ml from './locales/ml.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ta: { translation: ta },
      or: { translation: or_lang },
      ml: { translation: ml },
    },
    lng: localStorage.getItem('lang') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

// Persist language choice
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('lang', lng)
})

export default i18n