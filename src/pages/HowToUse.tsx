import { BookOpen, Star, TrendingUp, PiggyBank, Brain, Lightbulb, Target, BarChart3, Shield, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

export default function HowToUse() {
  const { t } = useLanguage()

  return (
    <div className="animate-fade-in mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">
        <BookOpen className="inline h-7 w-7 text-accent mr-2 sm:h-8 sm:w-8" />
        {t('howtouse.title')}
      </h1>
      <p className="mt-2 text-muted text-sm">{t('howtouse.sub')}</p>

      <section className="mt-8 sm:mt-12">
        <h2 className="text-xl font-bold mb-4 sm:text-2xl sm:mb-6">📋 {t('howtouse.steps')}</h2>
        <div className="space-y-3 sm:space-y-4">
          {[
            { icon: <Target className="h-5 w-5 text-accent" />, title: t('howtouse.step1.title'), desc: t('howtouse.step1.desc') },
            { icon: <Star className="h-5 w-5 text-gold" />, title: t('howtouse.step2.title'), desc: t('howtouse.step2.desc') },
            { icon: <Brain className="h-5 w-5 text-accent" />, title: t('howtouse.step3.title'), desc: t('howtouse.step3.desc') },
            { icon: <BarChart3 className="h-5 w-5 text-accent" />, title: t('howtouse.step4.title'), desc: t('howtouse.step4.desc') },
            { icon: <PiggyBank className="h-5 w-5 text-accent" />, title: t('howtouse.step5.title'), desc: t('howtouse.step5.desc') },
          ].map((s, i) => (
            <div key={i} className="flex gap-3 rounded-xl border border-border bg-card p-4 sm:gap-4 sm:p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 sm:h-10 sm:w-10">{s.icon}</div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">{s.title}</h3>
                <p className="text-xs text-muted mt-1 sm:text-sm">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 sm:mt-12">
        <h2 className="text-xl font-bold mb-4 sm:text-2xl">⭐ {t('howtouse.confidence.title')}</h2>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <p className="text-xs text-muted mb-4 sm:text-sm">{t('howtouse.confidence.desc')}</p>
          <div className="space-y-3">
            {[
              { stars: 5, label: t('howtouse.conf5'), desc: t('howtouse.conf5.desc') },
              { stars: 4, label: t('howtouse.conf4'), desc: t('howtouse.conf4.desc') },
              { stars: 3, label: t('howtouse.conf3'), desc: t('howtouse.conf3.desc') },
              { stars: 2, label: t('howtouse.conf2'), desc: t('howtouse.conf2.desc') },
              { stars: 1, label: t('howtouse.conf1'), desc: t('howtouse.conf1.desc') },
            ].map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-xs sm:gap-3 sm:text-sm">
                <div className="flex shrink-0 gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${j < c.stars ? 'fill-gold text-gold' : 'text-muted/30'}`} />
                  ))}
                </div>
                <div>
                  <span className="font-medium">{c.label}</span>
                  <span className="text-muted"> — {c.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 sm:mt-12">
        <h2 className="text-xl font-bold mb-4 sm:text-2xl">
          <TrendingUp className="inline h-5 w-5 text-accent mr-2 sm:h-6 sm:w-6" />
          {t('howtouse.value.title')}
        </h2>
        <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted space-y-3 sm:p-6 sm:text-sm">
          <p>{t('howtouse.value.p1')}</p>
          <p>{t('howtouse.value.p2')}</p>
          <p>{t('howtouse.value.p3')}</p>
          <p>{t('howtouse.value.p4')}</p>
        </div>
      </section>

      <section className="mt-8 sm:mt-12">
        <h2 className="text-xl font-bold mb-4 sm:text-2xl">
          <PiggyBank className="inline h-5 w-5 text-accent mr-2 sm:h-6 sm:w-6" />
          {t('howtouse.bankroll.title')}
        </h2>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="space-y-3 text-xs text-muted sm:space-y-4 sm:text-sm">
            {[t('howtouse.bankroll.1'), t('howtouse.bankroll.2'), t('howtouse.bankroll.3'), t('howtouse.bankroll.4')].map((text, i) => (
              <div key={i} className="flex gap-2 sm:gap-3">
                <Shield className="h-4 w-4 shrink-0 text-accent mt-0.5 sm:h-5 sm:w-5" />
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 sm:mt-12">
        <h2 className="text-xl font-bold mb-4 sm:text-2xl">
          <Brain className="inline h-5 w-5 text-accent mr-2 sm:h-6 sm:w-6" />
          {t('howtouse.ai.title')}
        </h2>
        <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted space-y-3 sm:p-6 sm:text-sm">
          <p>{t('howtouse.ai.intro')}</p>
          <ul className="list-disc list-inside space-y-1">
            <li>{t('howtouse.ai.1')}</li>
            <li>{t('howtouse.ai.2')}</li>
            <li>{t('howtouse.ai.3')}</li>
            <li>{t('howtouse.ai.4')}</li>
            <li>{t('howtouse.ai.5')}</li>
          </ul>
          <p>{t('howtouse.ai.outro')}</p>
        </div>
      </section>

      <section className="mt-8 sm:mt-12">
        <h2 className="text-xl font-bold mb-4 sm:text-2xl">
          <Lightbulb className="inline h-5 w-5 text-gold mr-2 sm:h-6 sm:w-6" />
          {t('howtouse.tips.title')}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {[
            { tip: t('howtouse.tip1'), desc: t('howtouse.tip1.desc') },
            { tip: t('howtouse.tip2'), desc: t('howtouse.tip2.desc') },
            { tip: t('howtouse.tip3'), desc: t('howtouse.tip3.desc') },
            { tip: t('howtouse.tip4'), desc: t('howtouse.tip4.desc') },
            { tip: t('howtouse.tip5'), desc: t('howtouse.tip5.desc') },
            { tip: t('howtouse.tip6'), desc: t('howtouse.tip6.desc') },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <h3 className="font-semibold text-xs sm:text-sm">{item.tip}</h3>
              <p className="text-xs text-muted mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 text-center sm:mt-12">
        <Link
          to="/picks"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-base font-semibold text-darker transition-colors hover:bg-accent-dim sm:text-lg min-h-[48px]"
        >
          {t('howtouse.cta')} <ChevronRight className="h-5 w-5" />
        </Link>
      </section>
    </div>
  )
}
