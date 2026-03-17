import { TrendingUp, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="animate-fade-in bg-darker mt-16">
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 */}
          <div>
            <div className="flex items-center gap-2 text-lg font-bold mb-3">
              <TrendingUp className="h-5 w-5 text-accent" />
              Bet<span className="text-accent">Analitika</span>
            </div>
            <p className="text-sm text-muted">{t('footer.desc')}</p>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-semibold text-sm mb-3">{t('footer.links')}</h3>
            <div className="flex flex-col gap-2 text-sm text-muted">
              <Link to="/picks" className="transition-colors duration-200 hover:text-accent">{t('nav.picks')}</Link>
              <Link to="/history" className="transition-colors duration-200 hover:text-accent">{t('nav.results')}</Link>
              <Link to="/pricing" className="transition-colors duration-200 hover:text-accent">{t('nav.premium')}</Link>
              <Link to="/how-to-use" className="transition-colors duration-200 hover:text-accent">{t('nav.guide')}</Link>
            </div>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-semibold text-sm mb-3">{t('footer.support')}</h3>
            <div className="flex flex-col gap-2 text-sm text-muted">
              <Link to="/contact" className="transition-colors duration-200 hover:text-accent">{t('nav.contact')}</Link>
              <Link to="/how-to-pay" className="transition-colors duration-200 hover:text-accent">{t('footer.howpay')}</Link>
              <Link to="/terms" className="transition-colors duration-200 hover:text-accent">{t('footer.terms')}</Link>
              <Link to="/terms#privacy" className="transition-colors duration-200 hover:text-accent">{t('footer.privacy')}</Link>
            </div>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="font-semibold text-sm mb-3">{t('footer.contact')}</h3>
            <a href="mailto:support@betanalitika.rs" className="flex items-center gap-2 text-sm text-accent transition-colors duration-200 hover:text-accent-dim">
              <Mail className="h-4 w-4" />
              support@betanalitika.rs
            </a>
            <p className="mt-3 text-xs text-muted">{t('footer.respond')}</p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 space-y-4 text-center">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-2 text-xs text-muted max-w-lg mx-auto">
            {t('footer.disclaimer')}
          </div>
          <p className="text-xs text-muted/60">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
