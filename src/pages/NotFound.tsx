import { Link } from 'react-router-dom'
import { MapPinOff, Home } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

export default function NotFound() {
  const { t } = useLanguage()

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center sm:py-24">
      <div className="animate-fade-in">
        <MapPinOff className="mx-auto h-12 w-12 text-muted mb-4 sm:h-16 sm:w-16 sm:mb-6" />
        <h1 className="text-5xl font-bold text-accent mb-3 sm:text-6xl sm:mb-4">404</h1>
        <h2 className="text-lg font-bold mb-2 sm:text-xl">{t('404.title')}</h2>
        <p className="text-muted text-sm mb-6 sm:mb-8">{t('404.desc')}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-darker hover:bg-accent-dim min-h-[44px]"
        >
          <Home className="h-4 w-4" /> {t('404.back')}
        </Link>
      </div>
    </div>
  )
}
