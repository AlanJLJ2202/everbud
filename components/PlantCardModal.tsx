'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { Plant, PlantType, Rarity } from '@/types'
import { useLanguage } from '@/context/LanguageContext'

interface PlantCardModalProps {
  plant: Plant
  onClose: () => void
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

const RARITY_COLORS: Record<Rarity, string> = {
  comun: '#6b7280',
  poco_comun: '#16a34a',
  rara: '#2563eb',
  muy_rara: '#9333ea',
  legendaria: '#d97706',
}

function getCollectionNumber(id: string): string {
  const num = (parseInt(id.replace(/-/g, '').slice(0, 6), 16) % 99) + 1
  return String(num).padStart(2, '0')
}

export default function PlantCardModal({ plant, onClose }: PlantCardModalProps) {
  const { t } = useLanguage()
  const overlayRef = useRef<HTMLDivElement>(null)
  const type: PlantType = plant.type || 'otro'
  const rarity: Rarity = plant.species?.rarity ?? 'comun'
  const collectionNumber = getCollectionNumber(plant.id)

  const lightTypeIcons: Record<string, string> = {
    sol_pleno: '🌞',
    media_sombra: '🌤',
    sombra: '🌑',
  }
  const lightIcon = plant.light_type ? lightTypeIcons[plant.light_type] : '🌿'
  const typeLabel = t(`plantType.${type}`)
  const rarityLabel = t(`rarity.${rarity}`)
  const rarityColor = RARITY_COLORS[rarity]

  // Nombre split estilo Panini
  const nameWords = plant.name.trim().split(/\s+/)
  const firstWord = nameWords.length > 1 ? nameWords[0] : ''
  const restWords = nameWords.length > 1 ? nameWords.slice(1).join(' ') : nameWords[0]

  // Cerrar con Escape o click en backdrop
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="panini-modal-overlay"
      role="dialog"
      aria-modal="true"
    >
      {/* ─── CARTA ANIMADA ─── */}
      <div className="panini-modal-card-wrap">
        <article className={`panini-card panini-${type} rarity-${rarity} panini-modal-card`}>
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

          {/* Body: deco + foto */}
          <div className="panini-body">
            <svg
              className="panini-deco"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <text x="-6" y="86" fontSize="92">{collectionNumber}</text>
            </svg>

            <span className="panini-rarity-chip">{rarityLabel}</span>

            <div className="panini-photo">
              {plant.image_url ? (
                <Image
                  src={plant.image_url}
                  alt={plant.name}
                  fill
                  className="object-cover"
                  sizes="320px"
                />
              ) : (
                <div className="w-full h-full flex items-end justify-center pb-4">
                  <span className="text-7xl">{TYPE_EMOJI[type]}</span>
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
                : t('common.undefined')}{' '}
              | {lightIcon} {t(`lightType.${plant.light_type}`) || t('common.undefined')}
            </div>
          </div>

          {/* Pill club */}
          <div className="panini-pill panini-pill-club">
            <span className="panini-club-name">
              {plant.scientific_name || typeLabel}
            </span>
            <span className="panini-logo">🌿 EVERBUD</span>
          </div>
        </article>
      </div>

      {/* ─── PANEL DE INFO ─── */}
      <div className="panini-modal-info">
        <button
          onClick={onClose}
          className="panini-modal-close"
          aria-label="Cerrar"
        >
          ✕
        </button>

        {/* Nombre y rareza */}
        <div className="mb-5">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
            {plant.name}
          </h2>
          {plant.scientific_name && (
            <p className="text-white/60 italic text-sm mt-0.5">{plant.scientific_name}</p>
          )}
          <span
            className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
            style={{ background: rarityColor }}
          >
            {rarityLabel}
          </span>
        </div>

        {/* Ficha técnica */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="panini-info-chip">
            <span className="panini-info-label">{t('plantDetail.type') || 'Tipo'}</span>
            <span className="panini-info-value">{TYPE_EMOJI[type]} {typeLabel}</span>
          </div>
          <div className="panini-info-chip">
            <span className="panini-info-label">{t('newPlant.lightType')}</span>
            <span className="panini-info-value">{lightIcon} {t(`lightType.${plant.light_type}`) || '—'}</span>
          </div>
          <div className="panini-info-chip">
            <span className="panini-info-label">💧 {t('newPlant.waterDays')}</span>
            <span className="panini-info-value">
              {plant.water_every_days
                ? t('plantCard.everyDays', { days: plant.water_every_days })
                : '—'}
            </span>
          </div>
          {plant.species?.family && (
            <div className="panini-info-chip">
              <span className="panini-info-label">{t('plantDetail.family')}</span>
              <span className="panini-info-value">{plant.species.family}</span>
            </div>
          )}
          {plant.species?.origin && (
            <div className="panini-info-chip col-span-2">
              <span className="panini-info-label">🌍 {t('plantDetail.origin')}</span>
              <span className="panini-info-value">{plant.species.origin}</span>
            </div>
          )}
        </div>

        {/* Historia */}
        {plant.species?.story && (
          <div className="mb-5">
            <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
              📖 {t('plantDetail.story')}
            </h3>
            <p className="text-white/85 text-sm leading-relaxed">
              {plant.species.story}
            </p>
          </div>
        )}

        {/* Tips */}
        {plant.tips && plant.tips.length > 0 && (
          <div>
            <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
              💡 {t('plantDetail.careTips')}
            </h3>
            <ul className="space-y-1.5">
              {plant.tips.slice(0, 4).map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-white/80 text-sm">
                  <span className="text-white/40 mt-0.5 flex-shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
