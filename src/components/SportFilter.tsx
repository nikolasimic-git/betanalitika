interface Props {
  value: string
  onChange: (sport: string) => void
}

const SPORTS = [
  { key: 'all', label: 'Svi sportovi', emoji: '🏟️' },
  { key: 'football', label: 'Fudbal', emoji: '⚽' },
  { key: 'nba', label: 'NBA', emoji: '🏀' },
  { key: 'tennis', label: 'Tenis', emoji: '🎾' },
]

export default function SportFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {SPORTS.map(s => (
        <button
          key={s.key}
          onClick={() => onChange(s.key)}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            value === s.key
              ? 'bg-accent/10 text-accent border border-accent/30'
              : 'text-muted hover:text-white border border-transparent'
          }`}
        >
          <span>{s.emoji}</span> {s.label}
        </button>
      ))}
    </div>
  )
}
