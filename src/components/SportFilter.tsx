import { useLanguage } from '../contexts/LanguageContext'

interface Props {
  value: string
  onChange: (sport: string) => void
}

const SPORTS = [
  { key: 'all', labelKey: 'sport.all' as const, emoji: '🏟️' },
  { key: 'football', labelKey: 'sport.football' as const, emoji: '⚽' },
  { key: 'nba', labelKey: 'sport.nba' as const, emoji: '🏀' },
  { key: 'tennis', labelKey: 'sport.tennis' as const, emoji: '🎾' },
]

export default function SportFilter({ value, onChange }: Props) {
  const { t } = useLanguage()

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      {SPORTS.map(s => (
        <button
          key={s.key}
          onClick={() => onChange(s.key)}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${
            value === s.key
              ? 'bg-accent/10 text-accent border border-accent/30'
              : 'text-muted hover:text-white border border-transparent'
          }`}
        >
          <span>{s.emoji}</span> {t(s.labelKey)}
        </button>
      ))}
    </div>
  )
}
