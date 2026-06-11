'use client'

import { GamificationStats, LEVEL_EMOJI } from '@/lib/gamification'
import { useLanguage } from '@/context/LanguageContext'

interface GardenerLevelBadgeProps {
  stats: GamificationStats
  compact?: boolean
}

export default function GardenerLevelBadge({ stats, compact = false }: GardenerLevelBadgeProps) {
  const { t } = useLanguage()
  const levelLabel = t(`level.${stats.level}`)

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-botanical-100 text-botanical-800 px-3 py-1 rounded-full text-sm font-semibold">
        <span>{LEVEL_EMOJI[stats.level]}</span>
        {levelLabel}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-2 font-semibold text-gray-900">
          <span className="text-2xl">{LEVEL_EMOJI[stats.level]}</span>
          {levelLabel}
        </span>
        <span className="text-sm font-bold text-botanical-700">
          {t('level.points', { points: stats.points })}
        </span>
      </div>

      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-botanical-400 to-botanical-600 rounded-full transition-all duration-500"
          style={{ width: `${Math.round(stats.progress * 100)}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 mt-1.5">
        {stats.nextLevel
          ? t('level.nextLevel', {
              points: stats.pointsToNextLevel,
              level: t(`level.${stats.nextLevel}`),
            })
          : t('level.maxLevel')}
      </p>
    </div>
  )
}
