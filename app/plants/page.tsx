'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import PlantCard from '@/components/PlantCard'
import { Plant, PlantWithCareStatus, CareLog } from '@/types'

export default function PlantsPage() {
  const [plants, setPlants] = useState<PlantWithCareStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlants()
  }, [])

  async function fetchPlants() {
    try {
      setLoading(true)
      setError(null)

      // Fetch alive plants
      const { data: plantsData, error: plantsError } = await supabase
        .from('plants')
        .select('*')
        .eq('status', 'alive')
        .order('created_at', { ascending: false })

      if (plantsError) throw new Error(plantsError.message)

      // Fetch last care log for each plant
      const plantsWithStatus: PlantWithCareStatus[] = await Promise.all(
        (plantsData || []).map(async (plant: Plant) => {
          const { data: careLogs } = await supabase
            .from('care_logs')
            .select('*')
            .eq('plant_id', plant.id)
            .eq('care_type', 'riego')
            .order('logged_at', { ascending: false })
            .limit(1)

          const lastWateredAt = careLogs?.[0]?.logged_at || null
          let daysSinceWatering: number | null = null
          let wateringStatus: 'ok' | 'today' | 'overdue' = 'ok'
          let overdueDays = 0

          if (lastWateredAt && plant.water_every_days) {
            const lastWatered = new Date(lastWateredAt)
            const now = new Date()
            daysSinceWatering = Math.floor(
              (now.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24)
            )

            if (daysSinceWatering >= plant.water_every_days) {
              wateringStatus = 'today'
              overdueDays = 0
            }
            if (daysSinceWatering > plant.water_every_days) {
              wateringStatus = 'overdue'
              overdueDays = daysSinceWatering - plant.water_every_days
            }
          } else if (!lastWateredAt && plant.water_every_days) {
            // Never watered
            const created = new Date(plant.created_at)
            const now = new Date()
            const daysSinceCreation = Math.floor(
              (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
            )
            if (daysSinceCreation >= plant.water_every_days) {
              wateringStatus = 'overdue'
              overdueDays = daysSinceCreation
            }
          }

          return {
            ...plant,
            lastWateredAt,
            daysSinceWatering,
            wateringStatus,
            overdueDays,
          }
        })
      )

      setPlants(plantsWithStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar plantas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900">
              🌿 Mis Plantas
            </h1>
            <p className="text-gray-600 mt-1">
              {plants.length} {plants.length === 1 ? 'planta' : 'plantas'} en tu jardín
            </p>
          </div>
          <Link
            href="/new-plant"
            className="bg-botanical-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-botanical-700 transition-colors"
          >
            ➕ Nueva planta
          </Link>
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
            <p className="text-gray-600">Cargando tus plantas...</p>
          </div>
        ) : plants.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <span className="text-8xl block mb-6">🌱</span>
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-3">
              Tu jardín está vacío
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Comienza agregando tu primera planta. Sube una foto y la IA la identificará automáticamente.
            </p>
            <Link
              href="/new-plant"
              className="inline-block bg-botanical-600 text-white px-6 py-3 rounded-xl font-semibold text-lg hover:bg-botanical-700 transition-colors"
            >
              🌱 Agregar primera planta
            </Link>
          </div>
        ) : (
          /* Plants Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {plants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                wateringStatus={plant.wateringStatus}
                overdueDays={plant.overdueDays}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
