'use client'

import { HydrationStats } from '@/lib/plant-stats'
import { useLanguage } from '@/context/LanguageContext'

interface PlantHydrationBarProps {
  stats: HydrationStats
}

export default function PlantHydrationBar({ stats }: PlantHydrationBarProps) {
  const { t } = useLanguage()

  const statusColors = {
    healthy: { bar: 'bg-botanical-500', text: 'text-botanical-700', bg: 'bg-botanical-50' },
    warning: { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
    critical: { bar: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
  }

  const colors = statusColors[stats.status]

  return (
    <div className={`rounded-2xl p-4 ${colors.bg} border border-gray-100`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          💧 {t('plantStats.hydration')}
        </span>
        <span className={`text-sm font-bold ${colors.text}`}>
          {Math.round(stats.percentage)}%
        </span>
      </div>

      <div className="w-full h-3 bg-white/80 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
          style={{ width: `${stats.percentage}%` }}
        />
      </div>

      <p className="text-xs text-gray-500">
        {stats.daysSinceLastWater !== null
          ? t('plantStats.daysSinceWater', { days: stats.daysSinceLastWater })
          : t('plantStats.noWaterData')}
      </p>
    </div>
  )
}
