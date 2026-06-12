import { CareLog, CareType, Weather } from '@/types'

export interface PlantStatsData {
  hydration: HydrationStats | null
  consistency: ConsistencyStats
  weather: WeatherStats | null
  timeline: TimelineDay[]
}

export interface HydrationStats {
  percentage: number
  daysSinceLastWater: number | null
  status: 'healthy' | 'warning' | 'critical'
}

export interface ConsistencyStats {
  avgDaysBetweenCares: number | null
  totalCares: number
  trend: 'improving' | 'stable' | 'declining' | 'insufficient'
}

export interface WeatherStats {
  dominant: Weather
  count: number
  distribution: Record<Weather, number>
}

export interface TimelineDay {
  date: string
  careTypes: CareType[]
}

const CARE_TYPE_COLORS: Record<CareType, string> = {
  riego: '#3b82f6',
  fertilizante: '#22c55e',
  poda: '#f59e0b',
  revision: '#8b5cf6',
}

export function calculatePlantStats(
  careLogs: CareLog[],
  waterEveryDays: number | null,
  plantCreatedAt: string
): PlantStatsData {
  const sortedLogs = [...careLogs].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  )

  return {
    hydration: calculateHydration(sortedLogs, waterEveryDays, plantCreatedAt),
    consistency: calculateConsistency(sortedLogs),
    weather: calculateWeatherStats(sortedLogs),
    timeline: buildTimeline(sortedLogs, 30),
  }
}

function calculateHydration(
  sortedLogs: CareLog[],
  waterEveryDays: number | null,
  plantCreatedAt: string
): HydrationStats | null {
  if (!waterEveryDays) return null

  const lastWater = sortedLogs.find((l) => l.care_type === 'riego')
  const now = new Date()

  let daysSinceLastWater: number
  if (lastWater) {
    daysSinceLastWater = Math.floor(
      (now.getTime() - new Date(lastWater.logged_at).getTime()) / (1000 * 60 * 60 * 24)
    )
  } else {
    daysSinceLastWater = Math.floor(
      (now.getTime() - new Date(plantCreatedAt).getTime()) / (1000 * 60 * 60 * 24)
    )
  }

  const percentage = Math.max(
    0,
    Math.min(100, ((waterEveryDays - daysSinceLastWater) / waterEveryDays) * 100)
  )

  let status: 'healthy' | 'warning' | 'critical'
  if (percentage > 50) status = 'healthy'
  else if (percentage > 20) status = 'warning'
  else status = 'critical'

  return { percentage, daysSinceLastWater, status }
}

function calculateConsistency(sortedLogs: CareLog[]): ConsistencyStats {
  if (sortedLogs.length < 2) {
    return {
      avgDaysBetweenCares: null,
      totalCares: sortedLogs.length,
      trend: 'insufficient',
    }
  }

  const dates = sortedLogs.map((l) => new Date(l.logged_at).getTime())
  const gaps: number[] = []
  for (let i = 0; i < dates.length - 1; i++) {
    gaps.push(Math.floor((dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24)))
  }

  const avgDaysBetweenCares = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)

  let trend: 'improving' | 'stable' | 'declining' = 'stable'
  if (gaps.length >= 4) {
    const mid = Math.floor(gaps.length / 2)
    const recentAvg = gaps.slice(0, mid).reduce((a, b) => a + b, 0) / mid
    const olderAvg = gaps.slice(mid).reduce((a, b) => a + b, 0) / (gaps.length - mid)
    if (recentAvg < olderAvg * 0.85) trend = 'improving'
    else if (recentAvg > olderAvg * 1.15) trend = 'declining'
  }

  return { avgDaysBetweenCares, totalCares: sortedLogs.length, trend }
}

function calculateWeatherStats(sortedLogs: CareLog[]): WeatherStats | null {
  const withWeather = sortedLogs.filter((l) => l.weather)
  if (withWeather.length === 0) return null

  const distribution: Record<Weather, number> = {
    soleado: 0,
    nublado: 0,
    lluvioso: 0,
    ventoso: 0,
  }

  for (const log of withWeather) {
    if (log.weather) distribution[log.weather]++
  }

  const dominant = (Object.entries(distribution) as [Weather, number][]).sort(
    (a, b) => b[1] - a[1]
  )[0][0]

  return { dominant, count: withWeather.length, distribution }
}

function buildTimeline(sortedLogs: CareLog[], days: number): TimelineDay[] {
  const today = new Date()
  const timeline: TimelineDay[] = []

  const logsByDate = new Map<string, CareType[]>()
  for (const log of sortedLogs) {
    const dateKey = new Date(log.logged_at).toISOString().split('T')[0]
    if (!logsByDate.has(dateKey)) logsByDate.set(dateKey, [])
    logsByDate.get(dateKey)!.push(log.care_type)
  }

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateKey = d.toISOString().split('T')[0]
    timeline.push({
      date: dateKey,
      careTypes: logsByDate.get(dateKey) || [],
    })
  }

  return timeline
}

export const CARE_TYPE_COLORS_MAP = CARE_TYPE_COLORS
