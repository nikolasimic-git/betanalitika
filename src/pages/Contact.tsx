import { useState } from 'react'
import { Mail, Send, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

export default function Contact() {
  const { t } = useLanguage()
  const [sent, setSent] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const faqs = [
    { q: t('contact.faq1.q'), a: t('contact.faq1.a') },
    { q: t('contact.faq2.q'), a: t('contact.faq2.a') },
    { q: t('contact.faq3.q'), a: t('contact.faq3.a') },
    { q: t('contact.faq4.q'), a: t('contact.faq4.a') },
  ]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-2xl font-bold sm:text-3xl">{t('contact.title')}</h1>
        <p className="mt-2 text-muted text-sm">{t('contact.sub')}</p>
      </div>

      <a
        href="mailto:support@betanalitika.rs"
        className="mb-8 flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-card-hover sm:mb-10 sm:gap-4 sm:p-6 min-h-[44px]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 sm:h-12 sm:w-12">
          <Mail className="h-5 w-5 text-accent sm:h-6 sm:w-6" />
        </div>
        <div>
          <p className="font-semibold text-sm sm:text-base">{t('contact.email.title')}</p>
          <p className="text-xs text-accent sm:text-sm">support@betanalitika.rs</p>
        </div>
      </a>

      <div className="rounded-xl border border-border bg-card p-4 mb-8 sm:p-6 sm:mb-12">
        <h2 className="flex items-center gap-2 text-base font-bold mb-4 sm:text-lg sm:mb-6">
          <MessageCircle className="h-5 w-5 text-accent" />
          {t('contact.form.title')}
        </h2>

        {sent ? (
          <div className="rounded-lg bg-accent/10 p-4 text-center sm:p-6">
            <p className="text-base font-semibold text-accent sm:text-lg">{t('contact.form.sent')}</p>
            <p className="mt-1 text-xs text-muted sm:text-sm">{t('contact.form.sent.sub')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">{t('contact.form.name')}</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-border bg-darker px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
                placeholder={t('contact.form.name.ph')}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">{t('common.email')}</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg border border-border bg-darker px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
                placeholder={t('contact.form.email.ph')}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">{t('contact.form.message')}</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="w-full rounded-lg border border-border bg-darker px-4 py-2.5 text-sm focus:border-accent focus:outline-none resize-none"
                placeholder={t('contact.form.message.ph')}
              />
            </div>
            <button type="submit" className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-darker transition-colors hover:bg-accent-dim min-h-[44px]">
              <Send className="h-4 w-4" /> {t('contact.form.submit')}
            </button>
          </form>
        )}
      </div>

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
