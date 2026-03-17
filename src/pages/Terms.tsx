import { AlertTriangle, Shield, Mail } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

export default function Terms() {
  const { t } = useLanguage()

  return (
    <div className="animate-fade-in mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <section className="rounded-2xl border-2 border-danger/30 bg-danger/5 p-5 mb-8 sm:p-8 sm:mb-12">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-7 w-7 text-danger sm:h-8 sm:w-8" />
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">{t('terms.disclaimer')}</h1>
        </div>
        <div className="space-y-4 text-xs text-muted sm:text-sm">
          <p className="text-white font-medium text-sm sm:text-base">{t('terms.disclaimer.intro')}</p>
          <ul className="space-y-3">
            {[t('terms.d1'), t('terms.d2'), t('terms.d3'), t('terms.d4'), t('terms.d5'), t('terms.d6')].map((text, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-danger font-bold shrink-0">•</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Shield className="h-7 w-7 text-accent sm:h-8 sm:w-8" />
          <h2 className="text-xl font-bold sm:text-2xl md:text-3xl">{t('terms.title')}</h2>
        </div>

        <div className="space-y-6 text-xs text-muted sm:space-y-8 sm:text-sm">
          {[
            { title: t('terms.s1.title'), text: t('terms.s1') },
            { title: t('terms.s2.title'), text: t('terms.s2') },
            { title: t('terms.s3.title'), text: t('terms.s3') },
            { title: t('terms.s4.title'), text: t('terms.s4') },
            { title: t('terms.s5.title'), text: t('terms.s5') },
            { title: t('terms.s6.title'), text: t('terms.s6') },
            { title: t('terms.s7.title'), text: t('terms.s7') },
            { title: t('terms.s8.title'), text: t('terms.s8') },
          ].map((section, i) => (
            <div key={i} id={i === 8 ? 'privacy' : undefined}>
              <h3 className="text-base font-semibold text-white mb-2 sm:text-lg">{section.title}</h3>
              <p>{section.text}</p>
            </div>
          ))}

          <div id="privacy">
            <h3 className="text-base font-semibold text-white mb-2 sm:text-lg">{t('terms.s9.title')}</h3>
            <p>{t('terms.s9')}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 mt-6 sm:p-6 sm:mt-8">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5 text-accent" />
              <h3 className="text-base font-semibold text-white sm:text-lg">{t('terms.contact.title')}</h3>
            </div>
            <p>{t('terms.contact')} <span className="text-accent font-medium">support@betanalitika.rs</span></p>
          </div>

          <p className="text-xs text-muted/60 text-center">{t('terms.updated')}</p>
        </div>
      </section>
    </div>
  )
}
