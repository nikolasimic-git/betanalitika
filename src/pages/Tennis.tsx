import { Link } from 'react-router-dom'
import { Bell, ArrowLeft } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

export default function Tennis() {
  const { t } = useLanguage()

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:py-24">
      <div className="animate-fade-in">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-accent/10 text-5xl sm:h-28 sm:w-28 sm:text-6xl">
          🎾
        </div>
        <h1 className="mb-3 text-3xl font-bold sm:text-4xl">
          {t('tennis.title')}
        </h1>
        <div className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
          {t('tennis.coming_soon')}
        </div>
        <p className="mb-8 text-muted text-sm sm:text-base">
          {t('tennis.desc')}
        </p>

        {/* Notification placeholder */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <Bell className="mx-auto mb-3 h-6 w-6 text-accent" />
          <p className="mb-1 text-sm font-semibold">{t('tennis.notify')}</p>
          <p className="text-xs text-muted">{t('tennis.notify_sub')}</p>
        </div>

        <Link
          to="/picks"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-darker hover:bg-accent-dim min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" /> {t('tennis.back')}
        </Link>
      </div>
    </div>
  )
}
