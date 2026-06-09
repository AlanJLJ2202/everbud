'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Plant, DeathLog, DeathCause, DEATH_CAUSE_EMOJI } from '@/types'

interface DeadPlant {
  plant: Plant
  deathLog: DeathLog
}

export default function CemeteryPage() {
  const [deadPlants, setDeadPlants] = useState<DeadPlant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDeadPlants()
  }, [])

  async function fetchDeadPlants() {
    try {
      setLoading(true)
      setError(null)

      // Fetch dead plants
      const { data: plantsData, error: plantsError } = await supabase
        .from('plants')
        .select('*')
        .eq('status', 'dead')
        .order('created_at', { ascending: false })

      if (plantsError) throw new Error(plantsError.message)

      // Fetch death logs for each plant
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
      setError(err instanceof Error ? err.message : 'Error al cargar el cementerio')
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
            💀 Cementerio
          </h1>
          <p className="text-gray-600 mt-1">
            {deadPlants.length} {deadPlants.length === 1 ? 'planta descansando' : 'plantas descansando'}
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
            <p className="text-gray-600">Cargando...</p>
          </div>
        ) : deadPlants.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <span className="text-8xl block mb-6">🌿</span>
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-3">
              El cementerio está vacío
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Afortunadamente, ninguna planta ha fallecido. ¡Sigue cuidando de ellas!
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
                    {/* Dark overlay */}
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
                    <span className="text-2xl">{DEATH_CAUSE_EMOJI[deathLog.cause]}</span>
                    <span className="text-sm text-gray-600 capitalize">
                      {deathLog.cause.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Death Date */}
                  <p className="text-xs text-gray-500">
                    Falleció: {new Date(deathLog.died_at).toLocaleDateString('es-ES')}
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
