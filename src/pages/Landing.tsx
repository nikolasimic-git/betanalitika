import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brain, BarChart3, Zap, ChevronRight, Star, TrendingUp, Shield, Clock } from 'lucide-react'
import StatsBar from '../components/StatsBar'
import { fetchStats } from '../api'
import { PickStats } from '../types'
import { useLanguage } from '../contexts/LanguageContext'

export default function Landing() {
  const [stats, setStats] = useState<PickStats | null>(null)
  const { t } = useLanguage()

  useEffect(() => {
    fetchStats().then(setStats).catch(console.error)
  }, [])

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:py-20 md:py-32">
          <div className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-sm text-accent">
            <Zap className="h-4 w-4" />
            {t('landing.badge')}
          </div>
          <h1 className="animate-fade-in-up stagger-1 text-3xl font-extrabold leading-tight sm:text-4xl md:text-6xl">
            {t('landing.h1.1')}<br />
            <span className="text-accent">{t('landing.h1.2')}</span>
          </h1>
          <p className="animate-fade-in-up stagger-2 mx-auto mt-4 max-w-xl text-base text-muted sm:mt-6 sm:text-lg">
            {t('landing.subtitle')}
          </p>
          <div className="animate-fade-in-up stagger-3 mt-6 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:justify-center">
            <Link
              to="/picks"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-base font-semibold text-darker transition-colors hover:bg-accent-dim sm:w-auto sm:text-lg min-h-[48px]"
            >
              {t('landing.cta')} <ChevronRight className="h-5 w-5" />
            </Link>
            <Link
              to="/history"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-8 py-3.5 text-base font-semibold text-muted transition-colors hover:text-white hover:border-muted sm:w-auto sm:text-lg min-h-[48px]"
            >
              {t('landing.track')}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="animate-scale-in stagger-4 mx-auto max-w-4xl px-4 -mt-4 sm:-mt-8">
          <StatsBar stats={stats} />
        </section>
      )}

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">{t('landing.how')}</h2>
        <p className="mt-2 text-center text-muted text-sm sm:text-base">{t('landing.how.sub')}</p>
        <div className="mt-8 grid gap-6 sm:mt-12 sm:grid-cols-3 sm:gap-8">
          {[
            { icon: <BarChart3 className="h-8 w-8 text-accent" />, title: t('landing.step1.title'), desc: t('landing.step1.desc') },
            { icon: <Brain className="h-8 w-8 text-accent" />, title: t('landing.step2.title'), desc: t('landing.step2.desc') },
            { icon: <Zap className="h-8 w-8 text-accent" />, title: t('landing.step3.title'), desc: t('landing.step3.desc') },
          ].map((step, i) => (
            <div key={i} className={`animate-fade-in-up stagger-${i + 1} rounded-xl border border-border bg-card p-6 text-center transition-all duration-300 hover:scale-[1.02] hover:border-accent/40 sm:p-8`}>
              <div className="mb-4 inline-flex rounded-xl bg-accent/10 p-4">{step.icon}</div>
              <h3 className="text-base font-bold sm:text-lg">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {[
            { icon: <Brain className="h-6 w-6" />, title: t('landing.feat1.title'), desc: t('landing.feat1.desc') },
            { icon: <TrendingUp className="h-6 w-6" />, title: t('landing.feat2.title'), desc: t('landing.feat2.desc') },
            { icon: <Shield className="h-6 w-6" />, title: t('landing.feat3.title'), desc: t('landing.feat3.desc') },
            { icon: <Clock className="h-6 w-6" />, title: t('landing.feat4.title'), desc: t('landing.feat4.desc') },
          ].map((f, i) => (
            <div key={i} className={`animate-fade-in-up stagger-${i + 1} flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:bg-card-hover sm:p-5`}>
              <div className="rounded-lg bg-accent/10 p-2 text-accent">{f.icon}</div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">{f.title}</h3>
                <p className="text-xs text-muted sm:text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <h2 className="text-center text-xl font-bold mb-6 sm:text-2xl sm:mb-8">{t('landing.testimonials')}</h2>
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          {[
            { quote: t('landing.t1'), author: 'M.S.' },
            { quote: t('landing.t2'), author: 'D.K.' },
            { quote: t('landing.t3'), author: 'A.J.' },
          ].map((item, i) => (
            <div key={i} className={`animate-fade-in-up stagger-${i + 1} rounded-2xl border border-accent/20 bg-accent/5 p-5 text-center sm:p-6`}>
              <div className="flex items-center justify-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-gold text-gold sm:h-5 sm:w-5" />
                ))}
              </div>
              <blockquote className="text-xs italic text-muted sm:text-sm">"{item.quote}"</blockquote>
              <p className="mt-3 font-semibold text-sm">— {item.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="animate-fade-in mx-auto max-w-4xl px-4 py-8 text-center sm:py-12">
        <h2 className="text-2xl font-bold sm:text-3xl">{t('landing.ready')}</h2>
        <p className="mt-2 text-muted text-sm sm:text-base">{t('landing.ready.sub')}</p>
        <Link
          to="/picks"
          className="animate-pulse-glow mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-base font-semibold text-darker transition-colors hover:bg-accent-dim sm:text-lg min-h-[48px]"
        >
          {t('landing.start')} <ChevronRight className="h-5 w-5" />
        </Link>
      </section>
    </div>
  )
}
