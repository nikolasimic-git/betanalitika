import { Check, X, Crown, Zap, Bitcoin, Mail, ArrowRight, HelpCircle, Wallet, Clock, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Pricing() {
  const { isPremium, user } = useAuth()

  return (
    <div className="animate-fade-in mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Izaberi svoj plan</h1>
        <p className="mt-2 text-muted">Počni besplatno, upgrade-uj kad budeš spreman</p>
      </div>

      {/* Premium user banner */}
      {isPremium && (
        <div className="mb-10 max-w-3xl mx-auto rounded-2xl border-2 border-accent/40 bg-accent/5 p-8 text-center">
          <Crown className="mx-auto h-10 w-10 text-gold mb-3" />
          <p className="text-xl font-bold text-accent">✅ Ti si Premium korisnik!</p>
          <p className="mt-2 text-muted">Uživaj u svim pikovima, uključujući Super Pik i svih 11 dnevnih pikova.</p>
        </div>
      )}

      {/* Picks summary */}
      <div className="mb-10 max-w-3xl mx-auto rounded-xl border border-border bg-card p-4 text-center text-sm text-muted">
        Ukupno <span className="text-white font-semibold">11 pikova dnevno</span>: 3 besplatna + 1 Super Pik + 7 premium
      </div>

      <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
        {/* Free */}
        <div className="animate-fade-in-up stagger-1 rounded-2xl border border-border bg-card p-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-6 w-6 text-accent" />
            <h2 className="text-xl font-bold">Besplatno</h2>
          </div>
          <p className="text-4xl font-extrabold">$0<span className="text-lg font-normal text-muted">/mes</span></p>
          <p className="mt-2 text-sm text-muted">Zauvek besplatno. Bez obaveze.</p>

          <ul className="mt-6 space-y-3">
            {[
              { ok: true, text: '3 AI pika dnevno' },
              { ok: true, text: 'Confidence score' },
              { ok: true, text: 'AI obrazloženje' },
              { ok: true, text: 'Track record (poslednja 3 dana)' },
              { ok: true, text: 'Sa reklamama' },
              { ok: false, text: 'Premium pikovi (10+ dnevno)' },
              { ok: false, text: '🎯 Sigurica pik (90%+ prolaznost)' },
              { ok: false, text: 'Bez reklama' },
              { ok: false, text: 'Kompletna istorija rezultata' },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                {item.ok ? <Check className="h-4 w-4 text-accent" /> : <X className="h-4 w-4 text-muted/40" />}
                <span className={item.ok ? '' : 'text-muted/50'}>{item.text}</span>
              </li>
            ))}
          </ul>

          <Link
            to="/picks"
            className="mt-8 block rounded-xl border border-border py-3 text-center text-sm font-semibold text-muted transition-colors hover:text-white hover:border-muted"
          >
            Koristi besplatno
          </Link>
        </div>

        {/* Premium */}
        <div className="animate-fade-in-up stagger-2 relative rounded-2xl border-2 border-gold bg-card p-8 transition-transform duration-300 hover:scale-[1.02]">
          <div className="animate-pulse-glow-gold absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-bold text-darker">
            NAJPOPULARNIJI
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-6 w-6 text-gold" />
            <h2 className="text-xl font-bold">Premium</h2>
          </div>
          <p className="text-4xl font-extrabold">$20<span className="text-lg font-normal text-muted">/mes</span></p>
          <p className="mt-2 text-sm text-muted">Plaćanje isključivo kriptovalutom</p>

          <ul className="mt-6 space-y-3">
            {[
              'Svi AI pikovi (10+ dnevno)',
              '🎯 Sigurica pik (90%+ prolaznost)',
              '75%+ Win Rate',
              'Detaljno AI obrazloženje za svaki pik',
              'Value betting analiza',
              'Bez reklama',
              'Kompletna istorija rezultata',
              'Poređenje kvota sa 5+ kladionica',
              'Telegram notifikacije za nove pikove',
              'Early access pikovi (pre ostalih)',
              'Prioritetna podrška',
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-gold" />
                {text}
              </li>
            ))}
          </ul>

          {isPremium ? (
            <div className="mt-8 block w-full rounded-xl bg-accent/10 border border-accent/30 py-3 text-center text-sm font-bold text-accent">
              ✅ Aktivan Premium
            </div>
          ) : (
            <a
              href="#kako-platiti"
              className="mt-8 block w-full rounded-xl bg-gold py-3 text-center text-sm font-bold text-darker transition-colors hover:bg-gold/90"
            >
              Započni Premium — $20/mes
            </a>
          )}
          <p className="mt-2 text-center text-xs text-muted">Otkaži kad hoćeš. Bez ugovora.</p>
        </div>
      </div>

      {/* Kako platiti */}
      <div id="kako-platiti" className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-2">
          <Bitcoin className="inline h-6 w-6 text-gold mr-2" />
          Kako platiti kriptovalutom
        </h2>
        <p className="text-center text-muted mb-10">Jednostavan proces u 4 koraka</p>

        <div className="grid gap-6 sm:grid-cols-2">
          {[
            {
              step: '1',
              icon: <Wallet className="h-6 w-6 text-accent" />,
              title: 'Izaberi kriptovalutu',
              desc: 'Prihvatamo BTC, ETH, USDT i LTC.',
            },
            {
              step: '2',
              icon: <Bitcoin className="h-6 w-6 text-accent" />,
              title: 'Pošalji $20 na našu adresu',
              desc: (
                <div className="space-y-1 text-xs mt-2">
                  <p><span className="text-accent font-mono">BTC:</span> <span className="font-mono text-muted select-all cursor-text">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</span></p>
                  <p><span className="text-accent font-mono">ETH:</span> <span className="font-mono text-muted select-all cursor-text">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</span></p>
                  <p><span className="text-accent font-mono">USDT (TRC-20):</span> <span className="font-mono text-muted select-all cursor-text">TN2Y8vFMkMq4xECrEd3Y6MZpxKAFR7RJoA</span></p>
                  <p><span className="text-accent font-mono">LTC:</span> <span className="font-mono text-muted select-all cursor-text">ltc1qhfk2a5v3s7r8x9y0z1w2e3r4t5y6u7i8o9p0</span></p>
                </div>
              ),
            },
            {
              step: '3',
              icon: <Mail className="h-6 w-6 text-accent" />,
              title: 'Pošalji potvrdu',
              desc: 'Pošalji screenshot ili TX hash na support@betanalitika.rs sa tvojim username-om.',
            },
            {
              step: '4',
              icon: <Clock className="h-6 w-6 text-accent" />,
              title: 'Premium se aktivira',
              desc: 'Aktivacija u roku od 1-24h nakon potvrde uplate.',
            },
          ].map((s, i) => (
            <div key={i} className={`animate-fade-in-up stagger-${i + 1} rounded-xl border border-border bg-card p-6`}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`animate-scale-in stagger-${i + 1} flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent text-sm font-bold`}>{s.step}</span>
                {s.icon}
                <h3 className="font-semibold">{s.title}</h3>
              </div>
              <div className="text-sm text-muted">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nemaš kripto */}
      <div className="mt-16 max-w-3xl mx-auto rounded-2xl border border-accent/20 bg-accent/5 p-8">
        <h2 className="text-xl font-bold mb-4">💡 Nemaš kripto? Evo kako da počneš:</h2>
        <ol className="space-y-3 text-sm text-muted">
          <li className="flex items-start gap-2">
            <span className="font-bold text-accent">1.</span>
            Registruj se na <span className="text-white font-medium">Binance</span> ili <span className="text-white font-medium">Coinbase</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-accent">2.</span>
            Kupi <span className="text-white font-medium">USDT</span> (najlakše za početnike) karticom
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-accent">3.</span>
            Pošalji USDT na našu <span className="text-white font-medium">TRC-20</span> adresu
          </li>
        </ol>
        <Link
          to="/how-to-pay"
          className="mt-6 inline-flex items-center gap-2 text-accent font-semibold text-sm hover:underline"
        >
          Detaljno uputstvo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Česta pitanja</h2>
        {[
          {
            q: 'Da li su pikovi garantovani?',
            a: 'Ne. Nijedan pik nije garancija. AI analizira statistiku i daje procenu — konačna odluka je uvek tvoja. Klađenje nosi rizik.',
          },
          {
            q: 'Kako AI generiše pikove?',
            a: 'Koristimo napredne AI modele koji analiziraju formu timova, H2H statistiku, povrede, vremenske uslove i desetine drugih faktora.',
          },
          {
            q: 'Zašto samo kripto plaćanje?',
            a: 'Kripto plaćanje omogućava niže provizije, brže transakcije i veću privatnost. Ne čuvamo podatke o karticama jer ih ne koristimo.',
          },
          {
            q: 'Mogu li otkazati Premium kad hoću?',
            a: 'Da. Premium traje mesec dana od aktivacije. Jednostavno ne obnavljaj sledeći mesec.',
          },
          {
            q: 'Koliko pikova dobijem dnevno?',
            a: 'Besplatni korisnici dobijaju 3 pika dnevno. Premium korisnici dobijaju svih 11 pikova: 3 besplatna + 1 Super Pik + 7 premium.',
          },
          {
            q: 'Koja kriptovaluta je najlakša za slanje?',
            a: 'USDT na TRC-20 mreži — najniže provizije (~$1) i najbrža potvrda. Pogledajte naš vodič za detalje.',
          },
        ].map((faq, i) => (
          <div key={i} className="border-b border-border py-4">
            <h3 className="font-semibold">{faq.q}</h3>
            <p className="mt-1 text-sm text-muted">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
