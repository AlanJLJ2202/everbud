'use client'

import { useMemo } from 'react'
import { CareLog, Plant, Weather } from '@/types'
import { calculatePlantStats } from '@/lib/plant-stats'
import { useLanguage } from '@/context/LanguageContext'
import PlantHydrationBar from './PlantHydrationBar'
import PlantTimeline from './PlantTimeline'

interface PlantStatsProps {
  plant: Plant
  careLogs: CareLog[]
}

const WEATHER_EMOJI: Record<Weather, string> = {
  soleado: '☀️',
  nublado: '☁️',
  lluvioso: '🌧',
  ventoso: '💨',
}

const TREND_EMOJI = {
  improving: '📈',
  stable: '➡️',
  declining: '📉',
  insufficient: '📊',
}

export default function PlantStats({ plant, careLogs }: PlantStatsProps) {
  const { t } = useLanguage()

  const stats = useMemo(
    () => calculatePlantStats(careLogs, plant.water_every_days, plant.created_at),
    [careLogs, plant.water_every_days, plant.created_at]
  )

  if (careLogs.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">
        📊 {t('plantStats.title')}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {/* Hydration */}
        {stats.hydration && (
          <div className="col-span-2">
            <PlantHydrationBar stats={stats.hydration} />
          </div>
        )}

        {/* Consistency */}
        <div className="rounded-2xl p-4 bg-white border border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-1">
            {TREND_EMOJI[stats.consistency.trend]} {t('plantStats.consistency')}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.consistency.avgDaysBetweenCares !== null
              ? `${stats.consistency.avgDaysBetweenCares}d`
              : '—'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.consistency.totalCares} {t('plantStats.caresRegistered')}
            {stats.consistency.trend !== 'insufficient' && (
              <span className="ml-1">
                · {t(`plantStats.trend.${stats.consistency.trend}`)}
              </span>
            )}
          </p>
        </div>

        {/* Weather */}
        {stats.weather ? (
          <div className="rounded-2xl p-4 bg-white border border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-1">
              🌤 {t('plantStats.weather')}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {WEATHER_EMOJI[stats.weather.dominant]}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {t(`weather.${stats.weather.dominant}`)} · {t('plantStats.weatherRecords', { count: stats.weather.count })}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl p-4 bg-white border border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-1">
              🌤 {t('plantStats.weather')}
            </p>
            <p className="text-sm text-gray-400 mt-2">{t('plantStats.noWeatherData')}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="col-span-2">
          <PlantTimeline days={stats.timeline} />
        </div>
      </div>
    </div>
  )
}
