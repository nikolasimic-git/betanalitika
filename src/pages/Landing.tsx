import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brain, BarChart3, Zap, ChevronRight, Star, TrendingUp, Shield, Clock } from 'lucide-react'
import StatsBar from '../components/StatsBar'
import { fetchStats } from '../api'
import { PickStats } from '../types'

export default function Landing() {
  const [stats, setStats] = useState<PickStats | null>(null)

  useEffect(() => {
    fetchStats().then(setStats).catch(console.error)
  }, [])

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:py-32">
          <div className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-sm text-accent">
            <Zap className="h-4 w-4" />
            AI-powered predikcije
          </div>
          <h1 className="animate-fade-in-up stagger-1 text-4xl font-extrabold leading-tight sm:text-6xl">
            AI analizira.<br />
            <span className="text-accent">Ti odlučuješ.</span>
          </h1>
          <p className="animate-fade-in-up stagger-2 mx-auto mt-6 max-w-xl text-lg text-muted">
            Svaki dan analiziramo stotine utakmica pomoću veštačke inteligencije.
            Dobij pametne pikove sa detaljnim obrazloženjem — besplatno.
          </p>
          <div className="animate-fade-in-up stagger-3 mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/picks"
              className="flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-lg font-semibold text-darker transition-colors hover:bg-accent-dim"
            >
              Vidi današnje pikove <ChevronRight className="h-5 w-5" />
            </Link>
            <Link
              to="/history"
              className="flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-lg font-semibold text-muted transition-colors hover:text-white hover:border-muted"
            >
              Pogledaj track record
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="animate-scale-in stagger-4 mx-auto max-w-4xl px-4 -mt-8">
          <StatsBar stats={stats} />
        </section>
      )}

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold">Kako radi?</h2>
        <p className="mt-2 text-center text-muted">Tri koraka do pametnijeg klađenja</p>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {[
            {
              icon: <BarChart3 className="h-8 w-8 text-accent" />,
              title: 'Prikupljamo podatke',
              desc: 'Forme timova, H2H statistika, golovi, posedi, povrede — sve na jednom mestu za 1200+ liga.',
            },
            {
              icon: <Brain className="h-8 w-8 text-accent" />,
              title: 'AI analizira',
              desc: 'Naš AI model analizira hiljade podataka i pronalazi obrasce koje ljudsko oko ne vidi.',
            },
            {
              icon: <Zap className="h-8 w-8 text-accent" />,
              title: 'Ti dobijaš pikove',
              desc: 'Svaki pik dolazi sa obrazloženjem, confidence nivoom i najboljom kvotom. Jednostavno.',
            },
          ].map((step, i) => (
            <div key={i} className={`animate-fade-in-up stagger-${i + 1} rounded-xl border border-border bg-card p-8 text-center transition-all duration-300 hover:scale-[1.02] hover:border-accent/40`}>
              <div className="mb-4 inline-flex rounded-xl bg-accent/10 p-4">{step.icon}</div>
              <h3 className="text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <Brain className="h-6 w-6" />, title: 'AI Predikcije', desc: 'Napredni modeli analiziraju statistiku' },
            { icon: <TrendingUp className="h-6 w-6" />, title: '75%+ Win Rate', desc: 'Dokazan track record sa transparentnim rezultatima' },
            { icon: <Shield className="h-6 w-6" />, title: 'Verifikovano', desc: 'Svaki pik se automatski verifikuje' },
            { icon: <Clock className="h-6 w-6" />, title: 'Svaki dan', desc: 'Novi pikovi svakog dana pre podne' },
          ].map((f, i) => (
            <div key={i} className={`animate-fade-in-up stagger-${i + 1} flex items-start gap-3 rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:bg-card-hover`}>
              <div className="rounded-lg bg-accent/10 p-2 text-accent">{f.icon}</div>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-center text-2xl font-bold mb-8">Šta kažu naši korisnici</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { quote: 'Koristim BetAnalitiku 2 meseca — profit od prvog dana. AI obrazloženja su na drugom nivou.', author: 'M.S.' },
            { quote: 'Probao sam 5 tipster sajtova, ovo je jedini koji zapravo radi. 75% win rate nije šala.', author: 'D.K.' },
            { quote: 'Premium se isplati već posle prve nedelje. Kvalitet pikova je neuporediv.', author: 'A.J.' },
          ].map((t, i) => (
            <div key={i} className={`animate-fade-in-up stagger-${i + 1} rounded-2xl border border-accent/20 bg-accent/5 p-6 text-center`}>
              <div className="flex items-center justify-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-5 w-5 fill-gold text-gold" />
                ))}
              </div>
              <blockquote className="text-sm italic text-muted">"{t.quote}"</blockquote>
              <p className="mt-3 font-semibold text-sm">— {t.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="animate-fade-in mx-auto max-w-4xl px-4 py-12 text-center">
        <h2 className="text-3xl font-bold">Spreman za pametnije klađenje?</h2>
        <p className="mt-2 text-muted">3 besplatna pika svaki dan. Bez kartice, bez obaveze.</p>
        <Link
          to="/picks"
          className="animate-pulse-glow mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-lg font-semibold text-darker transition-colors hover:bg-accent-dim"
        >
          Počni besplatno <ChevronRight className="h-5 w-5" />
        </Link>
      </section>
    </div>
  )
}
