import { useState } from 'react'
import { Mail, Send, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  { q: 'Kako da aktiviram Premium?', a: 'Pošalji kripto uplatu i kontaktiraj nas sa potvrdom.' },
  { q: 'Koliko traje aktivacija?', a: 'Premium se aktivira u roku od 1-24h nakon potvrde uplate.' },
  { q: 'Mogu li dobiti refund?', a: 'Da, u roku od 7 dana ako nisi zadovoljan.' },
  { q: 'Kako da otkazem Premium?', a: 'Pošalji email na support@betanalitika.rs.' },
]

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Kontaktiraj nas</h1>
        <p className="mt-2 text-muted">Imaš pitanje? Pošalji nam poruku i odgovorićemo u roku od 24h.</p>
      </div>

      {/* Email Card */}
      <a
        href="mailto:support@betanalitika.rs"
        className="mb-10 flex items-center gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:bg-card-hover"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
          <Mail className="h-6 w-6 text-accent" />
        </div>
        <div>
          <p className="font-semibold">Email podrška</p>
          <p className="text-sm text-accent">support@betanalitika.rs</p>
        </div>
      </a>

      {/* Contact Form */}
      <div className="rounded-xl border border-border bg-card p-6 mb-12">
        <h2 className="flex items-center gap-2 text-lg font-bold mb-6">
          <MessageCircle className="h-5 w-5 text-accent" />
          Pošalji poruku
        </h2>

        {sent ? (
          <div className="rounded-lg bg-accent/10 p-6 text-center">
            <p className="text-lg font-semibold text-accent">✅ Poruka poslata!</p>
            <p className="mt-1 text-sm text-muted">Odgovorićemo ti u roku od 24h.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">Ime</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-border bg-darker px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
                placeholder="Tvoje ime"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg border border-border bg-darker px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
                placeholder="tvoj@email.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">Poruka</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="w-full rounded-lg border border-border bg-darker px-4 py-2.5 text-sm focus:border-accent focus:outline-none resize-none"
                placeholder="Kako ti možemo pomoći?"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-darker transition-colors hover:bg-accent-dim"
            >
              <Send className="h-4 w-4" /> Pošalji
            </button>
          </form>
        )}
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-xl font-bold mb-6 text-center">Česta pitanja</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold hover:bg-card-hover transition-colors"
              >
                {faq.q}
                {openFaq === i ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-muted">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
