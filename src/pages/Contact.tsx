import { useState } from 'react'
import { MessageCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

export default function Contact() {
  const { t } = useLanguage()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    { q: t('contact.faq1.q'), a: t('contact.faq1.a') },
    { q: t('contact.faq2.q'), a: t('contact.faq2.a') },
    { q: t('contact.faq3.q'), a: t('contact.faq3.a') },
    { q: t('contact.faq4.q'), a: t('contact.faq4.a') },
  ]

  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-2xl font-bold sm:text-3xl">{t('contact.title')}</h1>
        <p className="mt-2 text-muted text-sm">{t('contact.sub')}</p>
      </div>

      <a
        href="https://t.me/N1k0l2"
        target="_blank"
        rel="noopener noreferrer"
        className="mb-8 flex items-center gap-3 rounded-xl border-2 border-accent/30 bg-accent/5 p-5 transition-all hover:bg-accent/10 hover:scale-[1.01] sm:mb-10 sm:gap-4 sm:p-6 min-h-[44px]"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 sm:h-14 sm:w-14">
          <MessageCircle className="h-6 w-6 text-accent sm:h-7 sm:w-7" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-base sm:text-lg">{t('contact.telegram.title')}</p>
          <p className="text-sm text-accent">@N1k0l2</p>
          <p className="text-xs text-muted mt-0.5">{t('contact.telegram.sub')}</p>
        </div>
        <ExternalLink className="h-5 w-5 text-muted shrink-0" />
      </a>

      <div>
        <h2 className="text-lg font-bold mb-4 text-center sm:text-xl sm:mb-6">{t('contact.faq')}</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold hover:bg-card-hover transition-colors min-h-[44px] sm:px-5 sm:py-4"
              >
                {faq.q}
                {openFaq === i ? <ChevronUp className="h-4 w-4 text-muted shrink-0 ml-2" /> : <ChevronDown className="h-4 w-4 text-muted shrink-0 ml-2" />}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-3 text-xs text-muted sm:px-5 sm:pb-4 sm:text-sm">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
