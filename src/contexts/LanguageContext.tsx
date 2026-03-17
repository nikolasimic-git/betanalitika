import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { translations, Lang, TranslationKey } from '../i18n'

interface LanguageCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageCtx | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('ba_lang')
    return (saved === 'en' || saved === 'sr') ? saved : 'sr'
  })

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem('ba_lang', l)
  }, [])

  const t = useCallback((key: TranslationKey): string => {
    const entry = translations[key]
    if (!entry) return key
    return entry[lang] || entry['sr'] || key
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be within LanguageProvider')
  return ctx
}
