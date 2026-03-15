import { Check, X, Crown, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Pricing() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Izaberi svoj plan</h1>
        <p className="mt-2 text-muted">Počni besplatno, upgrade-uj kad budeš spreman</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
        {/* Free */}
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-6 w-6 text-accent" />
            <h2 className="text-xl font-bold">Besplatno</h2>
          </div>
          <p className="text-4xl font-extrabold">€0<span className="text-lg font-normal text-muted">/mes</span></p>
          <p className="mt-2 text-sm text-muted">Zauvek besplatno. Bez kartice.</p>

          <ul className="mt-6 space-y-3">
            {[
              { ok: true, text: '3 AI pika dnevno' },
              { ok: true, text: 'Confidence score' },
              { ok: true, text: 'AI obrazloženje' },
              { ok: true, text: 'Track record pristup' },
              { ok: false, text: 'Premium pikovi (3+ dnevno)' },
              { ok: false, text: 'Napredna statistika' },
              { ok: false, text: 'Telegram bot notifikacije' },
              { ok: false, text: 'Early access pikovi' },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                {item.ok ? (
                  <Check className="h-4 w-4 text-accent" />
                ) : (
                  <X className="h-4 w-4 text-muted/40" />
                )}
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
        <div className="relative rounded-2xl border-2 border-gold bg-card p-8">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-bold text-darker">
            NAJPOPULARNIJI
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-6 w-6 text-gold" />
            <h2 className="text-xl font-bold">Premium</h2>
          </div>
          <p className="text-4xl font-extrabold">€9.99<span className="text-lg font-normal text-muted">/mes</span></p>
          <p className="mt-2 text-sm text-muted">Otključaj sve pikove i napredne analize</p>

          <ul className="mt-6 space-y-3">
            {[
              'Svi AI pikovi (10+ dnevno)',
              'Confidence score',
              'Detaljno AI obrazloženje',
              'Track record pristup',
              'Napredna statistika (forma, H2H)',
              'Poređenje kvota sa kladionica',
              'Telegram bot notifikacije',
              'Early access pikovi (pre 10h)',
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-gold" />
                {text}
              </li>
            ))}
          </ul>

          <button className="mt-8 w-full rounded-xl bg-gold py-3 text-sm font-bold text-darker transition-colors hover:bg-gold/90">
            Započni Premium — €9.99/mes
          </button>
          <p className="mt-2 text-center text-xs text-muted">Otkaži kad hoćeš. Bez ugovora.</p>
        </div>
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
            q: 'Mogu li otkazati Premium kad hoću?',
            a: 'Da. Otkaži u bilo kom trenutku, bez penala. Premium ostaje aktivan do kraja plaćenog perioda.',
          },
          {
            q: 'Koliko pikova dobijem dnevno?',
            a: 'Besplatni korisnici dobijaju 3 pika. Premium korisnici dobijaju sve pikove (obično 8-12 dnevno).',
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
