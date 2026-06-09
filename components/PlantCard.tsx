'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Plant,
  PlantWithCareStatus,
  PlantType,
  PLANT_TYPE_LABELS,
  LIGHT_TYPE_LABELS,
  LIGHT_TYPE_ICONS,
} from '@/types'

interface PlantCardProps {
  plant: Plant | PlantWithCareStatus
  wateringStatus?: 'ok' | 'today' | 'overdue'
  overdueDays?: number
}

function getGradientClass(type: PlantType | null): string {
  switch (type) {
    case 'frutal':
      return 'gradient-frutal'
    case 'floral':
      return 'gradient-floral'
    case 'suculenta':
      return 'gradient-suculenta'
    case 'aromatica':
      return 'gradient-aromatica'
    default:
      return 'gradient-otro'
  }
}

function getWateringBadge(status: 'ok' | 'today' | 'overdue', overdueDays: number) {
  switch (status) {
    case 'ok':
      return (
        <span className="badge-alive px-2 py-1 rounded-full text-xs font-semibold">
          ✓ Al día
        </span>
      )
    case 'today':
      return (
        <span className="badge-needs-water px-2 py-1 rounded-full text-xs font-semibold">
          💧 Hoy toca
        </span>
      )
    case 'overdue':
      return (
        <span className="badge-overdue px-2 py-1 rounded-full text-xs font-semibold">
          ⚠️ Atrasado {overdueDays}d
        </span>
      )
  }
}

export default function PlantCard({ plant, wateringStatus = 'ok', overdueDays = 0 }: PlantCardProps) {
  const gradientClass = getGradientClass(plant.type)
  const lightIcon = plant.light_type ? LIGHT_TYPE_ICONS[plant.light_type] : '🌿'
  const lightLabel = plant.light_type ? LIGHT_TYPE_LABELS[plant.light_type] : 'Sin definir'
  const typeLabel = plant.type ? PLANT_TYPE_LABELS[plant.type] : 'Otro'

  return (
    <Link href={`/plants/${plant.id}`} className="block">
      <div className="plant-card grain-overlay bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
        {/* Image Section with Gradient */}
        <div className={`relative ${gradientClass} p-1`}>
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
            {plant.image_url ? (
              <Image
                src={plant.image_url}
                alt={plant.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-6xl">🌿</span>
              </div>
            )}
          </div>

          {/* Watering Status Badge */}
          <div className="absolute top-3 right-3">
            {getWateringBadge(wateringStatus, overdueDays)}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Plant Name */}
          <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">
            {plant.name}
          </h3>

          {/* Scientific Name */}
          {plant.scientific_name && (
            <p className="text-sm text-gray-500 italic mb-3">
              {plant.scientific_name}
            </p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* Light Type */}
            <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-lg">{lightIcon}</span>
              <span className="text-[10px] text-gray-600 mt-1 text-center leading-tight">
                {lightLabel}
              </span>
            </div>

            {/* Water Frequency */}
            <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-lg">💧</span>
              <span className="text-[10px] text-gray-600 mt-1 text-center leading-tight">
                {plant.water_every_days ? `Cada ${plant.water_every_days}d` : 'Sin definir'}
              </span>
            </div>

            {/* Plant Type */}
            <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-lg">🌿</span>
              <span className="text-[10px] text-gray-600 mt-1 text-center leading-tight">
                {typeLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
