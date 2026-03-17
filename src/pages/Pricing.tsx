import { Check, X, Crown, Zap, Bitcoin, Mail, ArrowRight, HelpCircle, Wallet, Clock, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { useLanguage } from '../contexts/LanguageContext'

export default function Pricing() {
  const { isPremium } = useAuth()
  const { t } = useLanguage()

  return (
    <div className="animate-fade-in mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">{t('pricing.title')}</h1>
        <p className="mt-2 text-muted text-sm sm:text-base">{t('pricing.sub')}</p>
      </div>

      {isPremium && (
        <div className="mb-10 max-w-3xl mx-auto rounded-2xl border-2 border-accent/40 bg-accent/5 p-6 text-center sm:p-8">
          <Crown className="mx-auto h-10 w-10 text-gold mb-3" />
          <p className="text-lg font-bold text-accent sm:text-xl">{t('pricing.active')}</p>
          <p className="mt-2 text-muted text-sm">{t('pricing.active.sub')}</p>
        </div>
      )}

      <div className="mb-8 max-w-3xl mx-auto rounded-xl border border-border bg-card p-3 text-center text-xs text-muted sm:p-4 sm:text-sm" dangerouslySetInnerHTML={{ __html: t('pricing.summary') }} />

      <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
        {/* Free */}
        <div className="animate-fade-in-up stagger-1 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-6 w-6 text-accent" />
            <h2 className="text-lg font-bold sm:text-xl">{t('pricing.free')}</h2>
          </div>
          <p className="text-3xl font-extrabold sm:text-4xl">$0<span className="text-base font-normal text-muted sm:text-lg">/mes</span></p>
          <p className="mt-2 text-xs text-muted sm:text-sm">{t('pricing.free.sub')}</p>
          <ul className="mt-6 space-y-3">
            {[
              { ok: true, text: t('pricing.free.feat1') },
              { ok: true, text: t('pricing.free.feat2') },
              { ok: true, text: t('pricing.free.feat3') },
              { ok: true, text: t('pricing.free.feat4') },
              { ok: true, text: t('pricing.free.feat5') },
              { ok: false, text: t('pricing.free.nofeat1') },
              { ok: false, text: t('pricing.free.nofeat2') },
              { ok: false, text: t('pricing.free.nofeat3') },
              { ok: false, text: t('pricing.free.nofeat4') },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-xs sm:text-sm">
                {item.ok ? <Check className="h-4 w-4 text-accent shrink-0" /> : <X className="h-4 w-4 text-muted/40 shrink-0" />}
                <span className={item.ok ? '' : 'text-muted/50'}>{item.text}</span>
              </li>
            ))}
          </ul>
          <Link to="/picks" className="mt-8 block rounded-xl border border-border py-3 text-center text-sm font-semibold text-muted transition-colors hover:text-white hover:border-muted min-h-[44px] leading-[28px]">
            {t('pricing.free.cta')}
          </Link>
        </div>

        {/* Premium */}
        <div className="animate-fade-in-up stagger-2 relative rounded-2xl border-2 border-gold bg-card p-6 transition-transform duration-300 hover:scale-[1.02] sm:p-8">
          <div className="animate-pulse-glow-gold absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-bold text-darker">
            {t('pricing.popular')}
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-6 w-6 text-gold" />
            <h2 className="text-lg font-bold sm:text-xl">Premium</h2>
          </div>
          <p className="text-3xl font-extrabold sm:text-4xl">$20<span className="text-base font-normal text-muted sm:text-lg">/mes</span></p>
          <p className="mt-2 text-xs text-muted sm:text-sm">{t('pricing.crypto.pay')}</p>
          <ul className="mt-6 space-y-3">
            {[
              t('pricing.prem.feat1'), t('pricing.prem.feat2'), t('pricing.prem.feat3'),
              t('pricing.prem.feat4'), t('pricing.prem.feat5'), t('pricing.prem.feat6'),
              t('pricing.prem.feat7'), t('pricing.prem.feat8'), t('pricing.prem.feat9'),
              t('pricing.prem.feat10'), t('pricing.prem.feat11'),
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-2 text-xs sm:text-sm">
                <Check className="h-4 w-4 text-gold shrink-0" /> {text}
              </li>
            ))}
          </ul>
          {isPremium ? (
            <div className="mt-8 block w-full rounded-xl bg-accent/10 border border-accent/30 py-3 text-center text-sm font-bold text-accent min-h-[44px]">
              {t('pricing.premium.active')}
            </div>
          ) : (
            <a href="#kako-platiti" className="mt-8 block w-full rounded-xl bg-gold py-3 text-center text-sm font-bold text-darker transition-colors hover:bg-gold/90 min-h-[44px]">
              {t('pricing.premium.cta')}
            </a>
          )}
          <p className="mt-2 text-center text-xs text-muted">{t('pricing.premium.cancel')}</p>
        </div>
      </div>

      {/* Kako platiti */}
      <div id="kako-platiti" className="mt-16 max-w-3xl mx-auto sm:mt-20">
        <h2 className="text-xl font-bold text-center mb-2 sm:text-2xl">
          <Bitcoin className="inline h-6 w-6 text-gold mr-2" />
          {t('pricing.crypto.title')}
        </h2>
        <p className="text-center text-muted mb-8 text-sm sm:mb-10">{t('pricing.crypto.sub')}</p>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          {[
            { step: '1', icon: <Wallet className="h-5 w-5 text-accent sm:h-6 sm:w-6" />, title: t('pricing.crypto.step1'), desc: t('pricing.crypto.step1.desc') },
            {
              step: '2', icon: <Bitcoin className="h-5 w-5 text-accent sm:h-6 sm:w-6" />, title: t('pricing.crypto.step2'),
              desc: (
                <div className="space-y-1 text-xs mt-2">
                  <p><span className="text-accent font-mono">BTC:</span> <span className="font-mono text-muted select-all cursor-text break-all">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</span></p>
                  <p><span className="text-accent font-mono">ETH:</span> <span className="font-mono text-muted select-all cursor-text break-all">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</span></p>
                  <p><span className="text-accent font-mono">USDT (TRC-20):</span> <span className="font-mono text-muted select-all cursor-text break-all">TN2Y8vFMkMq4xECrEd3Y6MZpxKAFR7RJoA</span></p>
                  <p><span className="text-accent font-mono">LTC:</span> <span className="font-mono text-muted select-all cursor-text break-all">ltc1qhfk2a5v3s7r8x9y0z1w2e3r4t5y6u7i8o9p0</span></p>
                </div>
              ),
            },
            { step: '3', icon: <Mail className="h-5 w-5 text-accent sm:h-6 sm:w-6" />, title: t('pricing.crypto.step3'), desc: t('pricing.crypto.step3.desc') },
            { step: '4', icon: <Clock className="h-5 w-5 text-accent sm:h-6 sm:w-6" />, title: t('pricing.crypto.step4'), desc: t('pricing.crypto.step4.desc') },
          ].map((s, i) => (
            <div key={i} className={`animate-fade-in-up stagger-${i + 1} rounded-xl border border-border bg-card p-4 sm:p-6`}>
              <div className="flex items-center gap-2 mb-3 sm:gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-bold sm:h-8 sm:w-8 sm:text-sm">{s.step}</span>
                {s.icon}
                <h3 className="font-semibold text-sm sm:text-base">{s.title}</h3>
              </div>
              <div className="text-xs text-muted sm:text-sm">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nemaš kripto */}
      <div className="mt-12 max-w-3xl mx-auto rounded-2xl border border-accent/20 bg-accent/5 p-6 sm:mt-16 sm:p-8">
        <h2 className="text-lg font-bold mb-4 sm:text-xl">{t('pricing.nocrypto.title')}</h2>
        <ol className="space-y-3 text-xs text-muted sm:text-sm">
          <li className="flex items-start gap-2">
            <span className="font-bold text-accent">1.</span>
            {t('pricing.nocrypto.1')} <span className="text-white font-medium">Binance</span> / <span className="text-white font-medium">Coinbase</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-accent">2.</span>
            {t('pricing.nocrypto.2')} <span className="text-white font-medium">USDT</span> {t('pricing.nocrypto.2.sub')}
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-accent">3.</span>
            {t('pricing.nocrypto.3')} <span className="text-white font-medium">TRC-20</span> {t('pricing.nocrypto.3.sub')}
          </li>
        </ol>
        <Link to="/how-to-pay" className="mt-6 inline-flex items-center gap-2 text-accent font-semibold text-sm hover:underline min-h-[44px]">
          {t('pricing.guide')} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* FAQ */}
      <div className="mt-12 max-w-2xl mx-auto sm:mt-16">
        <h2 className="text-xl font-bold text-center mb-6 sm:text-2xl sm:mb-8">{t('pricing.faq')}</h2>
        {[
          { q: t('pricing.faq1.q'), a: t('pricing.faq1.a') },
          { q: t('pricing.faq2.q'), a: t('pricing.faq2.a') },
          { q: t('pricing.faq3.q'), a: t('pricing.faq3.a') },
          { q: t('pricing.faq4.q'), a: t('pricing.faq4.a') },
          { q: t('pricing.faq5.q'), a: t('pricing.faq5.a') },
          { q: t('pricing.faq6.q'), a: t('pricing.faq6.a') },
        ].map((faq, i) => (
          <div key={i} className="border-b border-border py-4">
            <h3 className="font-semibold text-sm sm:text-base">{faq.q}</h3>
            <p className="mt-1 text-xs text-muted sm:text-sm">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
