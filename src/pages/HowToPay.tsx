import { Bitcoin, Wallet, Shield, Mail, HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

export default function HowToPay() {
  const { t } = useLanguage()

  return (
    <div className="animate-fade-in mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">
        <Bitcoin className="inline h-7 w-7 text-gold mr-2 sm:h-8 sm:w-8" />
        {t('howtopay.title')}
      </h1>
      <p className="mt-2 text-muted text-sm">{t('howtopay.sub')}</p>

      <section className="mt-8 sm:mt-12">
        <h2 className="text-xl font-bold mb-4 sm:text-2xl">🪙 {t('howtopay.what.title')}</h2>
        <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted space-y-3 sm:p-6 sm:text-sm">
          <p>{t('howtopay.what.p1')}</p>
          <p>{t('howtopay.what.p2')}</p>
        </div>
      </section>

      <section className="mt-8 sm:mt-12">
        <h2 className="text-xl font-bold mb-4 sm:text-2xl">📱 {t('howtopay.binance.title')}</h2>
        <div className="space-y-3 sm:space-y-4">
          {[
            { step: '1', title: t('howtopay.binance.step1.title'), desc: t('howtopay.binance.step1.desc') },
            { step: '2', title: t('howtopay.binance.step2.title'), desc: t('howtopay.binance.step2.desc') },
            { step: '3', title: t('howtopay.binance.step3.title'), desc: t('howtopay.binance.step3.desc') },
            { step: '4', title: t('howtopay.binance.step4.title'), desc: t('howtopay.binance.step4.desc') },
          ].map((s, i) => (
            <div key={i} className="flex gap-3 rounded-xl border border-border bg-card p-4 sm:gap-4 sm:p-5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-bold sm:h-8 sm:w-8 sm:text-sm">{s.step}</span>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">{s.title}</h3>
                <p className="text-xs text-muted mt-1 sm:text-sm">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 sm:mt-12">
        <h2 className="text-xl font-bold mb-4 sm:text-2xl">📱 {t('howtopay.coinbase.title')}</h2>
        <div className="space-y-3 sm:space-y-4">
          {[
            { step: '1', title: t('howtopay.coinbase.step1.title'), desc: t('howtopay.coinbase.step1.desc') },
            { step: '2', title: t('howtopay.coinbase.step2.title'), desc: t('howtopay.coinbase.step2.desc') },
            { step: '3', title: t('howtopay.coinbase.step3.title'), desc: t('howtopay.coinbase.step3.desc') },
            { step: '4', title: t('howtopay.coinbase.step4.title'), desc: t('howtopay.coinbase.step4.desc') },
          ].map((s, i) => (
            <div key={i} className="flex gap-3 rounded-xl border border-border bg-card p-4 sm:gap-4 sm:p-5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-bold sm:h-8 sm:w-8 sm:text-sm">{s.step}</span>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">{s.title}</h3>
                <p className="text-xs text-muted mt-1 sm:text-sm">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 sm:mt-12">
        <h2 className="text-xl font-bold mb-4 sm:text-2xl">
          <Wallet className="inline h-5 w-5 text-accent mr-2 sm:h-6 sm:w-6" />
          {t('howtopay.wallets.title')}
        </h2>
        <div className="rounded-xl border border-border bg-card p-4 space-y-4 sm:p-6">
          {[
            { label: `USDT (TRC-20) — ${t('howtopay.wallets.recommended')}`, address: 'TN2Y8vFMkMq4xECrEd3Y6MZpxKAFR7RJoA', note: 'Provizija ~$1' },
            { label: 'BTC', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', note: 'Provizija $1-5' },
            { label: 'ETH (ERC-20)', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', note: 'Provizija $2-10' },
            { label: 'LTC', address: 'ltc1qhfk2a5v3s7r8x9y0z1w2e3r4t5y6u7i8o9p0', note: 'Provizija ~$0.01' },
          ].map((w, i) => (
            <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
              <p className="font-semibold text-xs sm:text-sm">{w.label}</p>
              <p className="font-mono text-xs text-accent mt-1 break-all">{w.address}</p>
              <p className="text-xs text-muted mt-1">{w.note}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-gold/30 bg-gold/5 p-3 text-xs text-muted sm:p-4 sm:text-sm">
          <p>⚠️ <span className="text-white font-medium">{t('common.important')}:</span> {t('howtopay.wallets.warning')}</p>
        </div>
      </section>

      <section className="mt-8 sm:mt-12">
        <h2 className="text-xl font-bold mb-4 sm:text-2xl">
          <Mail className="inline h-5 w-5 text-accent mr-2 sm:h-6 sm:w-6" />
          {t('howtopay.after.title')}
        </h2>
        <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted space-y-3 sm:p-6 sm:text-sm">
          <p>{t('howtopay.after.send')} <span className="text-accent font-medium">support@betanalitika.rs</span> {t('howtopay.after.with')}</p>
          <ul className="list-disc list-inside space-y-1">
            <li>{t('howtopay.after.1')}</li>
            <li>{t('howtopay.after.2')}</li>
            <li>{t('howtopay.after.3')}</li>
          </ul>
          <p>{t('howtopay.after.time')}</p>
        </div>
      </section>

      <section className="mt-8 sm:mt-12">
        <h2 className="text-xl font-bold mb-4 sm:text-2xl">
          <HelpCircle className="inline h-5 w-5 text-accent mr-2 sm:h-6 sm:w-6" />
          {t('howtopay.faq.title')}
        </h2>
        {[
          { q: t('howtopay.faq1.q'), a: t('howtopay.faq1.a') },
          { q: t('howtopay.faq2.q'), a: t('howtopay.faq2.a') },
          { q: t('howtopay.faq3.q'), a: t('howtopay.faq3.a') },
          { q: t('howtopay.faq4.q'), a: t('howtopay.faq4.a') },
          { q: t('howtopay.faq5.q'), a: t('howtopay.faq5.a') },
        ].map((faq, i) => (
          <div key={i} className="border-b border-border py-3 sm:py-4">
            <h3 className="font-semibold text-sm">{faq.q}</h3>
            <p className="mt-1 text-xs text-muted sm:text-sm">{faq.a}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 text-center sm:mt-12">
        <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6 sm:p-8">
          <Shield className="mx-auto h-10 w-10 text-accent mb-4" />
          <h2 className="text-lg font-bold sm:text-xl">{t('howtopay.question')}</h2>
          <p className="mt-2 text-muted text-xs sm:text-sm">{t('howtopay.question.sub')}</p>
          <Link to="/pricing" className="mt-4 inline-flex items-center gap-2 text-accent font-semibold text-sm hover:underline min-h-[44px]">
            {t('howtopay.back')}
          </Link>
        </div>
      </section>
    </div>
  )
}
