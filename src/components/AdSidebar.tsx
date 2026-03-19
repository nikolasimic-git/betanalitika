import { useEffect, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'
import AdBanner from './AdBanner'

interface Ad {
  id: string
  title: string
  description_sr: string
  description_en: string
  emoji: string | null
  image_url: string | null
  link_url: string | null
}

export default function AdSidebar() {
  const [sidebarAds, setSidebarAds] = useState<Ad[]>([])
  const { lang, t } = useLanguage()

  useEffect(() => {
    supabase
      .from('ads')
      .select('*')
      .eq('is_active', true)
      .eq('placement', 'sidebar')
      .order('priority', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data && data.length > 0) setSidebarAds(data as Ad[])
      })
      // graceful fallback on error
  }, [])

  // If we have dedicated sidebar ads from DB, render them directly
  if (sidebarAds.length > 0) {
    return (
      <div className="hidden lg:block space-y-4 sticky top-24">
        {sidebarAds.map(ad => {
          const desc = lang === 'en' ? ad.description_en : ad.description_sr
          return (
            <div key={ad.id} className="relative rounded-xl border border-border bg-card/50 p-4 text-center transition-all">
              <span className="absolute top-2 right-2 text-[10px] text-muted/50 uppercase tracking-wider">{t('ad.label')}</span>
              {ad.image_url ? (
                <img src={ad.image_url} alt={ad.title} className="mx-auto mb-2 max-h-16 rounded-lg object-contain" />
              ) : (
                <p className="text-2xl mb-1">{ad.emoji || '🎯'}</p>
              )}
              <p className="text-sm font-semibold">{ad.title}</p>
              <p className="text-xs text-muted mt-0.5">{desc}</p>
              {ad.link_url && (
                <a href={ad.link_url} target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-block rounded-lg bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors min-h-[44px] leading-[44px]">
                  {t('ad.more')}
                </a>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Fallback: use rotating banner ads
  return (
    <div className="hidden lg:block space-y-4 sticky top-24">
      <AdBanner />
      <AdBanner />
      <AdBanner />
    </div>
  )
}
