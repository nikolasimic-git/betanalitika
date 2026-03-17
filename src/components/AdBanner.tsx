import { useEffect, useState } from 'react'

const ads = [
  { emoji: '🎰', title: 'Mozzart Bet', desc: 'Registruj se i dobij bonus 100%' },
  { emoji: '⚡', title: 'MaxBet', desc: 'Najbolje kvote za Premijer Ligu' },
  { emoji: '🏆', title: '1xBet', desc: 'Dnevni besplatni tiketi' },
]

export default function AdBanner() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * ads.length))

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % ads.length), 8000)
    return () => clearInterval(t)
  }, [])

  const ad = ads[index]

  return (
    <div className="relative rounded-xl border border-border bg-card/50 p-4 text-center transition-all">
      <span className="absolute top-2 right-2 text-[10px] text-muted/50 uppercase tracking-wider">Reklama</span>
      <p className="text-2xl mb-1">{ad.emoji}</p>
      <p className="text-sm font-semibold">{ad.title}</p>
      <p className="text-xs text-muted mt-0.5">{ad.desc}</p>
      <button className="mt-3 rounded-lg bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors">
        Saznaj više →
      </button>
    </div>
  )
}
