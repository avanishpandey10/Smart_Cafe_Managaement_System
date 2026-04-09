import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हि' },
  { code: 'ta', label: 'த' },
  { code: 'or', label: 'ଓ' },
  { code: 'ml', label: 'മ' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language

  return (
    <div className="flex items-center gap-0.5 bg-dark-400 rounded-lg p-0.5 border border-cafe-100">
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
            current === lang.code
              ? 'bg-cafe-100 text-cafe-900 shadow-sm'
              : 'text-cafe-400 hover:text-cafe-700'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}