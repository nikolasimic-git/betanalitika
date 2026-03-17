import { BookOpen, Star, TrendingUp, PiggyBank, Brain, Lightbulb, Target, BarChart3, Shield, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HowToUse() {
  return (
    <div className="animate-fade-in mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">
        <BookOpen className="inline h-8 w-8 text-accent mr-2" />
        Kako koristiti BetAnalitika pikove
      </h1>
      <p className="mt-2 text-muted">Kompletno uputstvo za maksimalan profit sa AI pikovima.</p>

      {/* Koraci */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">📋 Korak po korak</h2>
        <div className="space-y-4">
          {[
            { icon: <Target className="h-5 w-5 text-accent" />, title: 'Pogledaj današnje pikove', desc: 'Svaki dan pre podne objavljujemo nove AI pikove. Besplatni korisnici vide 3 pika, Premium korisnici svih 10+.' },
            { icon: <Star className="h-5 w-5 text-gold" />, title: 'Proveri confidence score', desc: 'Svaki pik ima ocenu od 1-5 zvezdica. Veći score = veća sigurnost AI-a u predikciju. Fokusiraj se na 4+ zvezdice.' },
            { icon: <Brain className="h-5 w-5 text-accent" />, title: 'Pročitaj AI obrazloženje', desc: 'Ne igraj pikove naslepo! Obrazloženje objašnjava ZAŠTO je AI izabrao taj pik — forma, statistika, H2H, povrede.' },
            { icon: <BarChart3 className="h-5 w-5 text-accent" />, title: 'Uporedi kvote', desc: 'Prikazujemo kvote sa više kladionica. Uvek igraj tamo gde je kvota najbolja.' },
            { icon: <PiggyBank className="h-5 w-5 text-accent" />, title: 'Odredi ulog', desc: 'Nikad ne stavljaj više od 5% bankrolla na jedan tiket. Konzistentnost je ključ!' },
          ].map((s, i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">{s.icon}</div>
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Confidence Score */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">⭐ Šta znači Confidence Score?</h2>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted mb-4">Confidence score (1-5 zvezdica) pokazuje koliko je AI siguran u predikciju na osnovu analize podataka:</p>
          <div className="space-y-3">
            {[
              { stars: 5, label: 'Izuzetno visoka sigurnost', desc: 'Svi faktori se poklapaju. Retko, ali zlatno.' },
              { stars: 4, label: 'Visoka sigurnost', desc: 'Jaki pokazatelji u korist predikcije. Preporučen ulog.' },
              { stars: 3, label: 'Srednja sigurnost', desc: 'Dobra analiza ali postoje neizvesni faktori. Manji ulog.' },
              { stars: 2, label: 'Niža sigurnost', desc: 'Postoje kontra-argumenti. Samo za iskusne igrače.' },
              { stars: 1, label: 'Rizičan pik', desc: 'Visok rizik, visoka potencijalna zarada. Minimalan ulog.' },
            ].map((c, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="flex shrink-0 gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`h-4 w-4 ${j < c.stars ? 'fill-gold text-gold' : 'text-muted/30'}`} />
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

      {/* Value Betting */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">
          <TrendingUp className="inline h-6 w-6 text-accent mr-2" />
          Šta je Value Betting?
        </h2>
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted space-y-3">
          <p><span className="text-white font-medium">Value betting</span> znači igranje pikova gde je kvota <span className="text-accent">veća</span> nego što bi trebalo da bude prema stvarnoj verovatnoći.</p>
          <p>Primer: Ako AI proceni da tim ima 60% šanse da pobedi, fer kvota je 1.67. Ako kladionica nudi 2.00 — to je <span className="text-accent font-medium">value bet</span>.</p>
          <p>Dugoročno, igranje samo value betova garantuje profit — čak i ako gubiš pojedinačne tikete.</p>
          <p>Naš AI automatski računa <span className="text-white font-medium">value edge</span> — procenat prednosti nad kladionicom. Što je veći edge, bolji je pik.</p>
        </div>
      </section>

      {/* Bankroll Management */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">
          <PiggyBank className="inline h-6 w-6 text-accent mr-2" />
          Bankroll Management
        </h2>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="space-y-4 text-sm text-muted">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 shrink-0 text-accent mt-0.5" />
              <p><span className="text-white font-medium">Zlatno pravilo:</span> Nikad ne stavljaj više od 5% bankrolla na jedan tiket. Ako imaš bankroll od 100€, maksimalan ulog je 5€.</p>
            </div>
            <div className="flex gap-3">
              <Shield className="h-5 w-5 shrink-0 text-accent mt-0.5" />
              <p><span className="text-white font-medium">Flat staking:</span> Igraj isti ulog na svaki pik (npr. uvek 2% bankrolla). Ne povećavaj ulog posle gubitka!</p>
            </div>
            <div className="flex gap-3">
              <Shield className="h-5 w-5 shrink-0 text-accent mt-0.5" />
              <p><span className="text-white font-medium">Bez emotivnog klađenja:</span> Ako si izgubio/la 3 tiketa za redom, ne juri gubitak. AI analizira hladno — i ti treba.</p>
            </div>
            <div className="flex gap-3">
              <Shield className="h-5 w-5 shrink-0 text-accent mt-0.5" />
              <p><span className="text-white font-medium">Vodi evidenciju:</span> Prati sve tikete. Naš Track Record to radi automatski za tebe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Obrazloženje */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">
          <Brain className="inline h-6 w-6 text-accent mr-2" />
          Kako čitati AI obrazloženje
        </h2>
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted space-y-3">
          <p>Svaki pik dolazi sa detaljnim obrazloženjem koje sadrži:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><span className="text-white">Forma timova</span> — poslednjih 5-10 utakmica</li>
            <li><span className="text-white">H2H statistika</span> — istorija međusobnih duela</li>
            <li><span className="text-white">Ključni igrači</span> — povrede, suspenzije, forme</li>
            <li><span className="text-white">Statistički modeli</span> — xG, expected points, itd.</li>
            <li><span className="text-white">Value analiza</span> — zašto je kvota vredna igranja</li>
          </ul>
          <p>Pročitaj obrazloženje pre nego što igraš — razumevanje logike iza pika je ključno za dugoročan uspeh.</p>
        </div>
      </section>

      {/* Tips for Beginners */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">
          <Lightbulb className="inline h-6 w-6 text-gold mr-2" />
          Saveti za početnike
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { tip: 'Počni sa besplatnim pikovima', desc: 'Upoznaj se sa platformom pre nego što kreneš na Premium.' },
            { tip: 'Igraj singles, ne kombinacije', desc: 'Kombinacije dramatično smanjuju šanse za dobitak.' },
            { tip: 'Fokusiraj se na 4-5⭐ pikove', desc: 'Kvalitet uvek iznad kvantiteta.' },
            { tip: 'Budi strpljiv/a', desc: 'Value betting profitira dugoročno. Ne očekuj profit svaki dan.' },
            { tip: 'Ne igraj pod emocijama', desc: 'Alkohol, bes, euforija — sve to kvari odluke.' },
            { tip: 'Postavi dnevni limit', desc: 'Odredi maksimalan dnevni gubitak i drži se toga.' },
          ].map((t, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold text-sm">{t.tip}</h3>
              <p className="text-xs text-muted mt-1">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-12 text-center">
        <Link
          to="/picks"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-lg font-semibold text-darker transition-colors hover:bg-accent-dim"
        >
          Pogledaj današnje pikove <ChevronRight className="h-5 w-5" />
        </Link>
      </section>
    </div>
  )
}
