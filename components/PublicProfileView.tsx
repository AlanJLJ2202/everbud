'use client'

import Link from 'next/link'
import { Plant, Profile } from '@/types'
import { computeGardenerStats, LEVEL_EMOJI } from '@/lib/gamification'
import { useLanguage } from '@/context/LanguageContext'
import PlantCard from '@/components/PlantCard'

interface PublicProfileViewProps {
  profile: Profile
  plants: Plant[]
}

export default function PublicProfileView({ profile, plants }: PublicProfileViewProps) {
  const { t, locale } = useLanguage()
  const stats = computeGardenerStats(plants)
  const alivePlants = plants.filter((p) => p.status === 'alive')
  const displayName = profile.display_name || profile.username
  const dateLocale = locale === 'es' ? 'es-ES' : 'en-US'
  const memberSince = new Date(profile.created_at).toLocaleDateString(dateLocale, {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-botanical-400 to-botanical-700 flex items-center justify-center text-white text-4xl font-serif font-bold flex-shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-serif text-3xl font-bold text-gray-900">
                {displayName}
              </h1>
              <p className="text-gray-500">@{profile.username}</p>
              {profile.bio && <p className="text-gray-700 mt-2">{profile.bio}</p>}
              <p className="text-xs text-gray-400 mt-1">
                {t('profile.memberSince', { date: memberSince })}
              </p>
            </div>

            {/* Level */}
            <div className="text-center">
              <span className="text-5xl block">{LEVEL_EMOJI[stats.level]}</span>
              <p className="font-bold text-gray-900 mt-1">{t(`level.${stats.level}`)}</p>
              <p className="text-sm text-botanical-700 font-semibold">
                {t('level.points', { points: stats.points })}
              </p>
            </div>
          </div>

          {/* Progress to next level */}
          <div className="mt-6">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-botanical-400 to-botanical-600 rounded-full"
                style={{ width: `${Math.round(stats.progress * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5 text-center">
              {stats.nextLevel
                ? t('level.nextLevel', {
                    points: stats.pointsToNextLevel,
                    level: t(`level.${stats.nextLevel}`),
                  })
                : t('level.maxLevel')}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center bg-cream-50 rounded-xl py-3">
              <p className="text-2xl font-bold text-gray-900">{stats.alivePlants}</p>
              <p className="text-xs text-gray-600">{t('profile.plants')}</p>
            </div>
            <div className="text-center bg-cream-50 rounded-xl py-3">
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueSpecies}</p>
              <p className="text-xs text-gray-600">{t('profile.species')}</p>
            </div>
            <div className="text-center bg-cream-50 rounded-xl py-3">
              <p className="text-2xl font-bold text-gray-900">{stats.rareOrBetter}</p>
              <p className="text-xs text-gray-600">{t('profile.rarePlants')}</p>
            </div>
          </div>
        </div>

        {/* Collection */}
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-4">
          {t('profile.collection')}
        </h2>

        {alivePlants.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-10 text-center">
            <span className="text-6xl block mb-4">🌱</span>
            <p className="text-gray-600">{t('profile.emptyGarden')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {alivePlants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                href={null}
                showWateringBadge={false}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12 pb-4">
          <p className="text-gray-600 mb-3">{t('profile.joinCta')}</p>
          <Link
            href="/register"
            className="inline-block bg-botanical-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-botanical-700 transition-colors"
          >
            {t('profile.joinButton')}
          </Link>
        </div>
      </div>
    </div>
  )
}
