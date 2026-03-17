import { useEffect, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const ads = [
  { emoji: '🎰', title: 'Mozzart Bet', desc: { sr: 'Registruj se i dobij bonus 100%', en: 'Register and get 100% bonus' } },
  { emoji: '⚡', title: 'MaxBet', desc: { sr: 'Najbolje kvote za Premijer Ligu', en: 'Best odds for Premier League' } },
  { emoji: '🏆', title: '1xBet', desc: { sr: 'Dnevni besplatni tiketi', en: 'Daily free tickets' } },
]

export default function AdBanner() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * ads.length))
  const { lang, t } = useLanguage()

  useEffect(() => {
    const timer = setInterval(() => setIndex(i => (i + 1) % ads.length), 8000)
    return () => clearInterval(timer)
  }, [])

  const ad = ads[index]

  return (
    <div className="relative rounded-xl border border-border bg-card/50 p-4 text-center transition-all">
      <span className="absolute top-2 right-2 text-[10px] text-muted/50 uppercase tracking-wider">{t('ad.label')}</span>
      <p className="text-2xl mb-1">{ad.emoji}</p>
      <p className="text-sm font-semibold">{ad.title}</p>
      <p className="text-xs text-muted mt-0.5">{ad.desc[lang]}</p>
      <button className="mt-3 rounded-lg bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors min-h-[44px]">
        {t('ad.more')}
      </button>
    </div>
  )
}
