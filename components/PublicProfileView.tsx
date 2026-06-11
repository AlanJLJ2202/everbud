'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plant, Profile, PlantType, Rarity } from '@/types'
import { computeGardenerStats, LEVEL_EMOJI } from '@/lib/gamification'
import { useLanguage } from '@/context/LanguageContext'
import PlantCardModal from '@/components/PlantCardModal'

interface PublicProfileViewProps {
  profile: Profile
  plants: Plant[]
}

/* ── Mini-carta clickeable para la colección pública ── */
const TYPE_CODES: Record<string, string> = {
  frutal: 'FRU', floral: 'FLO', suculenta: 'SUC', aromatica: 'ARO', otro: 'BUD',
}
const TYPE_EMOJI: Record<string, string> = {
  frutal: '🍊', floral: '🌸', suculenta: '🌵', aromatica: '🌿', otro: '🪴',
}

function getCollectionNumber(id: string): string {
  const num = (parseInt(id.replace(/-/g, '').slice(0, 6), 16) % 99) + 1
  return String(num).padStart(2, '0')
}

function CollectionCard({ plant, onClick }: { plant: Plant; onClick: () => void }) {
  const { t } = useLanguage()
  const type: PlantType = plant.type || 'otro'
  const rarity: Rarity = plant.species?.rarity ?? 'comun'
  const collectionNumber = getCollectionNumber(plant.id)
  const nameWords = plant.name.trim().split(/\s+/)
  const firstWord = nameWords.length > 1 ? nameWords[0] : ''
  const restWords = nameWords.length > 1 ? nameWords.slice(1).join(' ') : nameWords[0]

  return (
    <button
      onClick={onClick}
      className={`panini-card panini-${type} rarity-${rarity} collection-card-btn`}
      aria-label={`Ver detalles de ${plant.name}`}
    >
      {/* Header */}
      <header className="panini-header">
        <span className="panini-brand">
          Everbud <span className="font-medium opacity-60">Garden Club</span>.
        </span>
        <span className="panini-badge">
          <span className="panini-badge-code">{TYPE_CODES[type]}</span>
          <span className="panini-badge-num">{collectionNumber}</span>
        </span>
      </header>

      {/* Body */}
      <div className="panini-body">
        <svg
          className="panini-deco"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <text x="-6" y="86" fontSize="92">{collectionNumber}</text>
        </svg>

        <span className="panini-rarity-chip">{t(`rarity.${rarity}`)}</span>

        <div className="panini-photo">
          {plant.image_url ? (
            <Image
              src={plant.image_url}
              alt={plant.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-end justify-center pb-4">
              <span className="text-6xl">{TYPE_EMOJI[type]}</span>
            </div>
          )}
        </div>

        <span className="panini-flag">{TYPE_EMOJI[type]}</span>
      </div>

      {/* Pill nombre */}
      <div className="panini-pill panini-pill-name">
        <div className="panini-name">
          {firstWord && <span className="panini-name-light">{firstWord} </span>}
          <span className="panini-name-bold">{restWords}</span>
        </div>
        <div className="panini-data">
          💧{' '}
          {plant.water_every_days
            ? t('plantCard.everyDays', { days: plant.water_every_days })
            : t('common.undefined')}
        </div>
      </div>

      {/* Pill club */}
      <div className="panini-pill panini-pill-club">
        <span className="panini-club-name">
          {plant.scientific_name || t(`plantType.${type}`)}
        </span>
        <span className="panini-logo">🌿 EVERBUD</span>
      </div>
    </button>
  )
}

/* ── Vista principal del perfil público ── */
export default function PublicProfileView({ profile, plants }: PublicProfileViewProps) {
  const { t, locale } = useLanguage()
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null)

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

        {/* ── Header del perfil ── */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-botanical-400 to-botanical-700 flex items-center justify-center text-white text-4xl font-serif font-bold flex-shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-serif text-3xl font-bold text-gray-900">{displayName}</h1>
              <p className="text-gray-500">@{profile.username}</p>
              {profile.bio && <p className="text-gray-700 mt-2">{profile.bio}</p>}
              <p className="text-xs text-gray-400 mt-1">
                {t('profile.memberSince', { date: memberSince })}
              </p>
            </div>

            {/* Nivel */}
            <div className="text-center flex-shrink-0">
              <span className="text-5xl block">{LEVEL_EMOJI[stats.level]}</span>
              <p className="font-bold text-gray-900 mt-1">{t(`level.${stats.level}`)}</p>
              <p className="text-sm text-botanical-700 font-semibold">
                {t('level.points', { points: stats.points })}
              </p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-6">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-botanical-400 to-botanical-600 rounded-full"
                style={{ width: `${Math.round(stats.progress * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5 text-center">
              {stats.nextLevel
                ? t('level.nextLevel', { points: stats.pointsToNextLevel, level: t(`level.${stats.nextLevel}`) })
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

        {/* ── Colección ── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl font-bold text-gray-900">
            {t('profile.collection')}
          </h2>
          <p className="text-sm text-gray-500">{t('profile.tapCard')}</p>
        </div>

        {alivePlants.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-10 text-center">
            <span className="text-6xl block mb-4">🌱</span>
            <p className="text-gray-600">{t('profile.emptyGarden')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {alivePlants.map((plant) => (
              <CollectionCard
                key={plant.id}
                plant={plant}
                onClick={() => setSelectedPlant(plant)}
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

      {/* ── Modal de carta ── */}
      {selectedPlant && (
        <PlantCardModal
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
        />
      )}
    </div>
  )
}
