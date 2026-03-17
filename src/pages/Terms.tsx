import { AlertTriangle, Shield, Mail } from 'lucide-react'

export default function Terms() {
  return (
    <div className="animate-fade-in mx-auto max-w-4xl px-4 py-12">
      {/* Disclaimer */}
      <section className="rounded-2xl border-2 border-danger/30 bg-danger/5 p-8 mb-12">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-8 w-8 text-danger" />
          <h1 className="text-2xl font-bold sm:text-3xl">Odricanje od odgovornosti</h1>
        </div>
        <div className="space-y-4 text-sm text-muted">
          <p className="text-white font-medium text-base">⚠️ VAŽNO — Pročitajte pre korišćenja sajta</p>
          <ul className="space-y-3">
            <li className="flex gap-2">
              <span className="text-danger font-bold">•</span>
              <span><span className="text-white font-medium">BetAnalitika ne garantuje profit.</span> Naši AI pikovi su bazirani na statističkoj analizi, ali nijedan rezultat nije garantovan.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-danger font-bold">•</span>
              <span><span className="text-white font-medium">Klađenje nosi finansijski rizik.</span> Možete izgubiti deo ili celokupan uloženi novac.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-danger font-bold">•</span>
              <span><span className="text-white font-medium">Korisnik je isključivo odgovoran za svoje odluke.</span> Konačna odluka o klađenju je uvek vaša.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-danger font-bold">•</span>
              <span><span className="text-white font-medium">Mi pružamo AI analizu, NE finansijski savet.</span> BetAnalitika nije licencirani finansijski savetnik.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-danger font-bold">•</span>
              <span><span className="text-white font-medium">Ne snosimo odgovornost za gubitke.</span> BetAnalitika nije odgovorna za bilo kakve finansijske gubitke nastale korišćenjem naših pikova.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-danger font-bold">•</span>
              <span><span className="text-white font-medium">Samo za osobe starije od 18 godina.</span> Klađenje je zabranjeno za maloletnike. 18+</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Uslovi korišćenja */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-accent" />
          <h2 className="text-2xl font-bold sm:text-3xl">Uslovi korišćenja</h2>
        </div>

        <div className="space-y-8 text-sm text-muted">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">1. Opis usluge</h3>
            <p>BetAnalitika je platforma koja koristi veštačku inteligenciju za analizu sportskih događaja i generisanje predikcija (pikova). Naša usluga uključuje AI-generisane pikove sa obrazloženjem, confidence score, poređenje kvota i statističku analizu.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">2. Registracija i nalog</h3>
            <p>Za korišćenje besplatnih funkcija potrebna je registracija sa validnom email adresom. Korisnik je odgovoran za bezbednost svog naloga i lozinke. Jedan korisnik može imati samo jedan nalog.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">3. Premium pretplata i plaćanje</h3>
            <p>Premium pretplata košta $20 mesečno i plaća se isključivo kriptovalutom (BTC, ETH, USDT, LTC). Pretplata traje 30 dana od datuma aktivacije. Aktivacija se vrši ručno nakon potvrde uplate.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">4. Otkazivanje</h3>
            <p>Premium pretplata se ne obnavlja automatski. Jednostavno ne vršite novu uplatu po isteku perioda. Refundacija nije moguća nakon aktivacije Premium naloga.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">5. Zabrana redistribucije pikova</h3>
            <p>Zabranjeno je deljenje, kopiranje, prodavanje ili redistribucija Premium pikova bez pisane saglasnosti BetAnalitike. Kršenje ove odredbe rezultira trajnim blokiranjem naloga bez refundacije.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">6. Intelektualna svojina</h3>
            <p>Sav sadržaj na BetAnalitika platformi — uključujući AI algoritme, pikove, analize, dizajn i tekstove — je zaštićen autorskim pravima i predstavlja intelektualnu svojinu BetAnalitike.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">7. Ograničenje odgovornosti</h3>
            <p>BetAnalitika ne snosi odgovornost za: finansijske gubitke nastale korišćenjem pikova, nedostupnost servisa, greške u AI analizi, promene kvota kod kladionica, ili bilo kakvu štetu nastalu korišćenjem platforme.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">8. Promena uslova</h3>
            <p>Zadržavamo pravo izmene ovih uslova u bilo kom trenutku. Korisnici će biti obavešteni o značajnim promenama putem emaila ili obaveštenja na sajtu. Nastavak korišćenja platforme nakon izmena znači prihvatanje novih uslova.</p>
          </div>

          <div id="privacy">
            <h3 className="text-lg font-semibold text-white mb-2">9. Politika privatnosti</h3>
            <p>Prikupljamo minimalne podatke neophodne za funkcionisanje servisa: email adresu, korisničko ime i podatke o pretplati. Ne čuvamo podatke o plaćanju (kripto transakcije). Ne delimo vaše podatke sa trećim stranama. Koristimo kolačiće za funkcionisanje sesija.</p>
          </div>

          {/* Kontakt */}
          <div className="rounded-xl border border-border bg-card p-6 mt-8">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-semibold text-white">Kontakt</h3>
            </div>
            <p>Za sva pitanja u vezi sa uslovima korišćenja, kontaktirajte nas na: <span className="text-accent font-medium">support@betanalitika.rs</span></p>
          </div>

          <p className="text-xs text-muted/60 text-center">Poslednja izmena: mart 2026.</p>
        </div>
      </section>
    </div>
  )
}
