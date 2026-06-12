'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Plant,
  PlantWithCareStatus,
  PlantType,
  Rarity,
} from '@/types'
import { useLanguage } from '@/context/LanguageContext'

interface PlantCardProps {
  plant: Plant | PlantWithCareStatus
  wateringStatus?: 'ok' | 'today' | 'overdue'
  overdueDays?: number
  /** Pasa null para deshabilitar el link (ej. perfil público) */
  href?: string | null
  showWateringBadge?: boolean
}

const TYPE_CODES: Record<string, string> = {
  frutal: 'FRU',
  floral: 'FLO',
  suculenta: 'SUC',
  aromatica: 'ARO',
  otro: 'BUD',
}

const TYPE_EMOJI: Record<string, string> = {
  frutal: '🍊',
  floral: '🌸',
  suculenta: '🌵',
  aromatica: '🌿',
  otro: '🪴',
}

// Número de colección estable derivado del uuid de la planta (1-99)
function getCollectionNumber(id: string): string {
  const num = (parseInt(id.replace(/-/g, '').slice(0, 6), 16) % 99) + 1
  return String(num).padStart(2, '0')
}

export default function PlantCard({
  plant,
  wateringStatus = 'ok',
  overdueDays = 0,
  href,
  showWateringBadge = true,
}: PlantCardProps) {
  const { t } = useLanguage()
  const type: PlantType = plant.type || 'otro'
  const rarity: Rarity = plant.species?.rarity || 'comun'
  const collectionNumber = getCollectionNumber(plant.id)

  const lightTypeIcons: Record<string, string> = {
    sol_pleno: '🌞',
    media_sombra: '🌤',
    sombra: '🌑',
  }

  const lightIcon = plant.light_type ? lightTypeIcons[plant.light_type] : '🌿'
  const lightLabel = plant.light_type
    ? t(`lightType.${plant.light_type}`)
    : t('common.undefined')
  const typeLabel = t(`plantType.${type}`)
  const rarityLabel = t(`rarity.${rarity}`)

  // Estilo Panini: primera palabra light, el resto extra bold
  const nameWords = plant.name.trim().split(/\s+/)
  const firstWord = nameWords.length > 1 ? nameWords[0] : ''
  const restWords = nameWords.length > 1 ? nameWords.slice(1).join(' ') : nameWords[0]

  function getWateringBadge() {
    switch (wateringStatus) {
      case 'ok':
        return (
          <span className="badge-alive px-2 py-0.5 rounded-full text-[10px] font-semibold">
            {t('plantCard.upToDate')}
          </span>
        )
      case 'today':
        return (
          <span className="badge-needs-water px-2 py-0.5 rounded-full text-[10px] font-semibold">
            {t('plantCard.todayDue')}
          </span>
        )
      case 'overdue':
        return (
          <span className="badge-overdue px-2 py-0.5 rounded-full text-[10px] font-semibold">
            {t('plantCard.overdue', { days: overdueDays })}
          </span>
        )
    }
  }

  const card = (
    <article className={`panini-card panini-${type} rarity-${rarity}`}>
      {/* Zona 1 — Header */}
      <header className="panini-header">
        <span className="panini-brand">
          Everbud <span className="font-medium opacity-60">Garden Club</span>.
        </span>
        <span className="panini-badge">
          <span className="panini-badge-code">{TYPE_CODES[type]}</span>
          <span className="panini-badge-num">{collectionNumber}</span>
        </span>
      </header>

      {/* Zonas 2/3 — Número decorativo + foto */}
      <div className="panini-body">
        <svg
          className="panini-deco"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <text x="-6" y="86" fontSize="92">
            {collectionNumber}
          </text>
        </svg>

        <span className="panini-rarity-chip">{rarityLabel}</span>

        {showWateringBadge && (
          <span className="panini-status">{getWateringBadge()}</span>
        )}

        <div className="panini-photo">
          {plant.image_url ? (
            <Image
              src={plant.image_url}
              alt={plant.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-end justify-center pb-4">
              <span className="text-6xl">{TYPE_EMOJI[type]}</span>
            </div>
          )}
        </div>

        <span className="panini-flag">{TYPE_EMOJI[type]}</span>
      </div>

      {/* Zona 4 — Pill de nombre + datos */}
      <div className="panini-pill panini-pill-name">
        <div className="panini-name">
          {firstWord && <span className="panini-name-light">{firstWord} </span>}
          <span className="panini-name-bold">{restWords}</span>
        </div>
        <div className="panini-data">
          💧{' '}
          {plant.water_every_days
            ? t('plantCard.everyDays', { days: plant.water_every_days })
            : t('common.undefined')}{' '}
          | {lightIcon} {lightLabel}
        </div>
      </div>

      {/* Zona 5 — Pill de club (especie) + logo */}
      <div className="panini-pill panini-pill-club">
        <span className="panini-club-name">
          {plant.scientific_name || typeLabel}
        </span>
        <span className="panini-logo">🌿 EVERBUD</span>
      </div>
    </article>
  )

  if (href === null) {
    return card
  }

  return (
    <Link href={href ?? `/plants/${plant.slug ?? plant.id}`} className="block">
      {card}
    </Link>
  )
}
