'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'
import { Plant, DeathLog, DeathCause } from '@/types'

interface DeadPlant {
  plant: Plant
  deathLog: DeathLog
}

export default function CemeteryPage() {
  const { t, locale } = useLanguage()
  const [deadPlants, setDeadPlants] = useState<DeadPlant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const deathCauseEmoji: Record<DeathCause, string> = {
    sequia: '🏜️',
    plaga: '🐛',
    exceso_agua: '🌊',
    frio: '🧊',
    enfermedad: '🦠',
    otro: '❓',
  }

  const deathCauseLabels: Record<DeathCause, string> = {
    sequia: t('deathCause.sequia'),
    plaga: t('deathCause.plaga'),
    exceso_agua: t('deathCause.exceso_agua'),
    frio: t('deathCause.frio'),
    enfermedad: t('deathCause.enfermedad'),
    otro: t('deathCause.otro'),
  }

  const dateLocale = locale === 'es' ? 'es-ES' : 'en-US'

  useEffect(() => {
    fetchDeadPlants()
  }, [])

  async function fetchDeadPlants() {
    try {
      setLoading(true)
      setError(null)

      const { data: plantsData, error: plantsError } = await supabase
        .from('plants')
        .select('*')
        .eq('status', 'dead')
        .order('created_at', { ascending: false })

      if (plantsError) throw new Error(plantsError.message)

      const deadPlantsData: DeadPlant[] = await Promise.all(
        (plantsData || []).map(async (plant: Plant) => {
          const { data: deathLogs } = await supabase
            .from('death_logs')
            .select('*')
            .eq('plant_id', plant.id)
            .order('died_at', { ascending: false })
            .limit(1)

          return {
            plant,
            deathLog: deathLogs?.[0] || {
              id: '',
              plant_id: plant.id,
              cause: 'otro' as DeathCause,
              notes: null,
              died_at: new Date().toISOString(),
            },
          }
        })
      )

      setDeadPlants(deadPlantsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('cemetery.errorLoading'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            {t('cemetery.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {deadPlants.length} {t('cemetery.plantCount')}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="loading-spinner mb-4"></div>
            <p className="text-gray-600">{t('cemetery.loading')}</p>
          </div>
        ) : deadPlants.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <span className="text-8xl block mb-6">🌿</span>
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-3">
              {t('cemetery.emptyTitle')}
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              {t('cemetery.emptyDesc')}
            </p>
          </div>
        ) : (
          /* Dead Plants Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {deadPlants.map(({ plant, deathLog }) => (
              <div
                key={plant.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200"
              >
                {/* Image with grayscale */}
                <div className="relative">
                  <div className="relative w-full aspect-[4/3]">
                    {plant.image_url ? (
                      <Image
                        src={plant.image_url}
                        alt={plant.name}
                        fill
                        className="object-cover grayscale"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-6xl grayscale">🌿</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30"></div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-serif text-lg font-bold text-gray-900 mb-1">
                    {plant.name}
                  </h3>

                  {/* Death Cause */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{deathCauseEmoji[deathLog.cause]}</span>
                    <span className="text-sm text-gray-600">
                      {deathCauseLabels[deathLog.cause]}
                    </span>
                  </div>

                  {/* Death Date */}
                  <p className="text-xs text-gray-500">
                    {t('cemetery.diedOn', { date: new Date(deathLog.died_at).toLocaleDateString(dateLocale) })}
                  </p>

                  {/* Notes */}
                  {deathLog.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      &ldquo;{deathLog.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
