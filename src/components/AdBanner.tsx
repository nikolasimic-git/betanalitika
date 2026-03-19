import { useEffect, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'

interface Ad {
  id: string
  title: string
  description_sr: string
  description_en: string
  emoji: string | null
  image_url: string | null
  link_url: string | null
  placement: string
  priority: number
}

const fallbackAds: Ad[] = [
  { id: 'f1', title: 'Kladi se odgovorno', description_sr: 'Klađenje može biti zabavno ali igraj odgovorno. 18+', description_en: 'Betting can be fun but play responsibly. 18+', emoji: '🎯', image_url: null, link_url: null, placement: 'banner', priority: 1 },
  { id: 'f2', title: 'BetAnalitika Premium', description_sr: 'Otključaj sve AI pikove sa Premium planom', description_en: 'Unlock all AI picks with Premium plan', emoji: '💎', image_url: null, link_url: null, placement: 'banner', priority: 1 },
  { id: 'f3', title: 'Igraj pametno', description_sr: 'AI analizira, ti odlučuješ.', description_en: 'AI analyzes, you decide.', emoji: '🧠', image_url: null, link_url: null, placement: 'banner', priority: 1 },
]

export default function AdBanner({ placement = 'banner' }: { placement?: string }) {
  const [ads, setAds] = useState<Ad[]>(fallbackAds)
  const [index, setIndex] = useState(() => Math.floor(Math.random() * 3))
  const { lang, t } = useLanguage()

  useEffect(() => {
    supabase
      .from('ads')
      .select('*')
      .eq('is_active', true)
      .eq('placement', placement)
      .order('priority', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) setAds(data as Ad[])
      })
      .catch(() => {}) // graceful fallback
  }, [placement])

  useEffect(() => {
    if (ads.length <= 1) return
    const timer = setInterval(() => setIndex(i => (i + 1) % ads.length), 8000)
    return () => clearInterval(timer)
  }, [ads.length])

  const ad = ads[index % ads.length]
  if (!ad) return null
  const desc = lang === 'en' ? ad.description_en : ad.description_sr

  return (
    <div className="relative rounded-xl border border-border bg-card/50 p-4 text-center transition-all">
      <span className="absolute top-2 right-2 text-[10px] text-muted/50 uppercase tracking-wider">{t('ad.label')}</span>
      {ad.image_url ? (
        <img src={ad.image_url} alt={ad.title} className="mx-auto mb-2 max-h-16 rounded-lg object-contain" />
      ) : (
        <p className="text-2xl mb-1">{ad.emoji || '🎯'}</p>
      )}
      <p className="text-sm font-semibold">{ad.title}</p>
      <p className="text-xs text-muted mt-0.5">{desc}</p>
      {ad.link_url ? (
        <a href={ad.link_url} target="_blank" rel="noopener noreferrer"
          className="mt-3 inline-block rounded-lg bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors min-h-[44px] leading-[44px]">
          {t('ad.more')}
        </a>
      ) : (
        <button className="mt-3 rounded-lg bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors min-h-[44px]">
          {t('ad.more')}
        </button>
      )}
    </div>
  )
}
