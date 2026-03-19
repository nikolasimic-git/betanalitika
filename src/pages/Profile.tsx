import { useAuth } from '../auth'
import { useLanguage } from '../contexts/LanguageContext'
import { Link } from 'react-router-dom'
import { User, Crown, Mail, Shield, ArrowRight } from 'lucide-react'

export default function Profile() {
  const { user, isPremium, isAdmin } = useAuth()
  const { t } = useLanguage()

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:py-20">
        <User className="mx-auto h-12 w-12 text-muted mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t('profile.notlogged')}</h1>
        <p className="text-muted mb-6 text-sm">{t('profile.notlogged.sub')}</p>
        <Link to="/login" className="inline-block rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-darker hover:bg-accent-dim min-h-[44px]">
          {t('profile.login')}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <div className="animate-fade-in space-y-4 sm:space-y-6">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent sm:h-16 sm:w-16">
              <User className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0">
              <h1 className="flex flex-wrap items-center gap-2 text-lg font-bold sm:text-xl">
                <span className="truncate">{user.name}</span>
                {isPremium && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
                    <Crown className="h-3 w-3" /> Premium
                  </span>
                )}
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                    <Shield className="h-3 w-3" /> Admin
                  </span>
                )}
              </h1>
              <p className="flex items-center gap-1.5 text-xs text-muted mt-1 sm:text-sm truncate">
                <Mail className="h-3.5 w-3.5 shrink-0" /> {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-base font-bold mb-3 sm:text-lg sm:mb-4">{t('profile.plan')}</h2>
          {isPremium ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-gold" />
                <span className="font-semibold text-gold">{t('profile.plan.premium')}</span>
              </div>
              <p className="text-xs text-muted mb-1 sm:text-sm">{t('profile.plan.until')}</p>
              <p className="text-xs text-accent mt-3 sm:text-sm">{t('profile.plan.thanks')}</p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted mb-4 sm:text-sm">{t('profile.plan.free')}</p>
              <Link to="/pricing" className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-darker hover:bg-accent-dim min-h-[44px]">
                {t('profile.upgrade')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
