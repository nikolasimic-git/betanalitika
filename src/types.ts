export interface Pick {
  id: string
  matchDate: string
  league: string
  leagueFlag?: string
  homeTeam: string
  awayTeam: string
  kickOff: string
  predictionType: string
  predictionValue: string
  confidence: number // 1-5
  reasoning: string
  odds: number
  bookmaker: string
  affiliateUrl: string
  result: 'pending' | 'won' | 'lost' | 'void'
  isFree: boolean
  locked?: boolean
  isSigurica?: boolean
}

export interface PickStats {
  totalPicks: number
  won: number
  lost: number
  pending: number
  winRate: number
  roi: number
  currentStreak: number
  streakType: 'W' | 'L'
}
