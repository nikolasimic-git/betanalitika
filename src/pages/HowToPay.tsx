import { Bitcoin, Wallet, ArrowRight, Shield, Mail, HelpCircle, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HowToPay() {
  return (
    <div className="animate-fade-in mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">
        <Bitcoin className="inline h-8 w-8 text-gold mr-2" />
        Kako platiti kriptovalutom
      </h1>
      <p className="mt-2 text-muted">Kompletno uputstvo za kupovinu i slanje kripta — čak i ako nikad nisi koristio/la kripto.</p>

      {/* Šta je kripto */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">🪙 Šta je kriptovaluta?</h2>
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted space-y-3">
          <p>Kriptovaluta je digitalni novac koji funkcioniše bez banaka. Najpoznatije su <span className="text-white font-medium">Bitcoin (BTC)</span>, <span className="text-white font-medium">Ethereum (ETH)</span> i <span className="text-white font-medium">Tether (USDT)</span>.</p>
          <p>USDT je tzv. "stablecoin" — uvek vredi $1, pa nema rizika od promene cene. Zato preporučujemo USDT za plaćanje.</p>
        </div>
      </section>

      {/* Binance */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">📱 Kako kupiti kripto na Binance</h2>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Registruj se na Binance', desc: 'Idi na binance.com i klikni "Register". Unesi email i lozinku. Verifikuj identitet (traje 5-10 min).' },
            { step: '2', title: 'Dodaj platnu karticu', desc: 'Idi na "Buy Crypto" → "Credit/Debit Card". Dodaj Visa ili Mastercard karticu.' },
            { step: '3', title: 'Kupi USDT', desc: 'Izaberi "USDT" kao kripto, unesi iznos ($20), potvrdi kupovinu. USDT će se pojaviti u tvom wallet-u.' },
            { step: '4', title: 'Pošalji na našu adresu', desc: 'Idi na "Wallet" → "Withdraw" → izaberi USDT → izaberi TRC-20 mrežu → unesi našu adresu i iznos.' },
          ].map((s, i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-border bg-card p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-sm font-bold">{s.step}</span>
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Coinbase */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">📱 Kako kupiti kripto na Coinbase</h2>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Registruj se na Coinbase', desc: 'Idi na coinbase.com, napravi nalog i verifikuj identitet.' },
            { step: '2', title: 'Dodaj platnu metodu', desc: 'Poveži bankovni račun ili karticu u Payment Methods.' },
            { step: '3', title: 'Kupi USDT ili BTC', desc: 'Klikni "Buy/Sell", izaberi valutu i unesi $20.' },
            { step: '4', title: 'Pošalji na našu adresu', desc: 'Klikni "Send", unesi našu wallet adresu, izaberi odgovarajuću mrežu i potvrdi.' },
          ].map((s, i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-border bg-card p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-sm font-bold">{s.step}</span>
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Wallet adrese */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">
          <Wallet className="inline h-6 w-6 text-accent mr-2" />
          Naše wallet adrese
        </h2>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          {[
            { label: 'USDT (TRC-20) — preporučeno', address: 'TN2Y8vFMkMq4xECrEd3Y6MZpxKAFR7RJoA', note: 'Najniža provizija (~$1)' },
            { label: 'BTC', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', note: 'Provizija $1-5' },
            { label: 'ETH (ERC-20)', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', note: 'Provizija $2-10' },
            { label: 'LTC', address: 'ltc1qhfk2a5v3s7r8x9y0z1w2e3r4t5y6u7i8o9p0', note: 'Provizija ~$0.01' },
          ].map((w, i) => (
            <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
              <p className="font-semibold text-sm">{w.label}</p>
              <p className="font-mono text-xs text-accent mt-1 break-all">{w.address}</p>
              <p className="text-xs text-muted mt-1">{w.note}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm text-muted">
          <p>⚠️ <span className="text-white font-medium">Važno:</span> Uvek proveri da li šalješ na ispravnu mrežu! Npr. USDT mora ići na TRC-20, ne na ERC-20 (osim ako koristiš ETH adresu).</p>
        </div>
      </section>

      {/* Posle uplate */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">
          <Mail className="inline h-6 w-6 text-accent mr-2" />
          Posle uplate
        </h2>
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted space-y-3">
          <p>Pošalji email na <span className="text-accent font-medium">support@betanalitika.rs</span> sa:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Tvoj username na BetAnalitika</li>
            <li>Screenshot transakcije ili TX hash</li>
            <li>Koju kriptovalutu si koristio/la</li>
          </ul>
          <p>Premium se aktivira u roku od <span className="text-white font-medium">1-24 sata</span>.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">
          <HelpCircle className="inline h-6 w-6 text-accent mr-2" />
          Česta pitanja o kripto plaćanju
        </h2>
        {[
          { q: 'Nikad nisam koristio/la kripto. Da li je bezbedno?', a: 'Da. Binance i Coinbase su regulisane platforme sa milionima korisnika. Kupovina kripta karticom je jednako bezbedna kao online kupovina.' },
          { q: 'Koliko traje transakcija?', a: 'USDT na TRC-20: 1-5 minuta. BTC: 10-60 minuta. ETH: 1-5 minuta.' },
          { q: 'Šta ako pošaljem pogrešan iznos?', a: 'Kontaktiraj nas na support@betanalitika.rs. Ako si poslao/la manje, dopuni razliku. Ako više, refundiramo razliku.' },
          { q: 'Da li mogu platiti u dinarima?', a: 'Trenutno prihvatamo samo kripto. Na Binance možeš kupiti kripto bankovnim transferom u RSD.' },
          { q: 'Da li su moji podaci bezbedni?', a: 'Ne čuvamo nikakve podatke o plaćanju. Kripto transakcije su pseudoanonimne — jedino što vidimo je wallet adresa.' },
        ].map((faq, i) => (
          <div key={i} className="border-b border-border py-4">
            <h3 className="font-semibold">{faq.q}</h3>
            <p className="mt-1 text-sm text-muted">{faq.a}</p>
          </div>
        ))}
      </section>

      {/* Kontakt */}
      <section className="mt-12 text-center">
        <div className="rounded-2xl border border-accent/20 bg-accent/5 p-8">
          <Shield className="mx-auto h-10 w-10 text-accent mb-4" />
          <h2 className="text-xl font-bold">Imaš pitanje?</h2>
          <p className="mt-2 text-muted text-sm">Piši nam na <span className="text-accent font-medium">support@betanalitika.rs</span> — odgovaramo u roku od par sati.</p>
          <Link to="/pricing" className="mt-4 inline-flex items-center gap-2 text-accent font-semibold text-sm hover:underline">
            ← Nazad na cene
          </Link>
        </div>
      </section>
    </div>
  )
}
