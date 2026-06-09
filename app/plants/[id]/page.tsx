'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import PlantCard from '@/components/PlantCard'
import CareLogForm from '@/components/CareLogForm'
import WeatherBadge from '@/components/WeatherBadge'
import {
  Plant,
  CareLog,
  DeathCause,
  PlantWithCareStatus,
  CARE_TYPE_LABELS,
  CARE_TYPE_ICONS,
  DEATH_CAUSE_EMOJI,
  Weather,
} from '@/types'

export default function PlantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const plantId = params.id as string

  const [plant, setPlant] = useState<Plant | null>(null)
  const [careLogs, setCareLogs] = useState<CareLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCareForm, setShowCareForm] = useState(false)
  const [showDeathModal, setShowDeathModal] = useState(false)
  const [deathCause, setDeathCause] = useState<DeathCause>('sequia')
  const [deathNotes, setDeathNotes] = useState('')
  const [isRecordingDeath, setIsRecordingDeath] = useState(false)

  useEffect(() => {
    fetchPlantData()
  }, [plantId])

  async function fetchPlantData() {
    try {
      setLoading(true)
      setError(null)

      // Fetch plant
      const { data: plantData, error: plantError } = await supabase
        .from('plants')
        .select('*')
        .eq('id', plantId)
        .single()

      if (plantError) throw new Error(plantError.message)
      setPlant(plantData)

      // Fetch care logs
      const { data: logsData, error: logsError } = await supabase
        .from('care_logs')
        .select('*')
        .eq('plant_id', plantId)
        .order('logged_at', { ascending: false })
        .limit(10)

      if (logsError) throw new Error(logsError.message)
      setCareLogs(logsData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la planta')
    } finally {
      setLoading(false)
    }
  }

  async function handleCareSubmit(data: { care_type: string; weather: Weather; notes: string }) {
    const { error } = await supabase.from('care_logs').insert({
      plant_id: plantId,
      care_type: data.care_type,
      weather: data.weather,
      notes: data.notes || null,
    })

    if (error) throw new Error(error.message)

    setShowCareForm(false)
    fetchPlantData()
  }

  async function handleRecordDeath() {
    setIsRecordingDeath(true)
    try {
      // Create death log
      const { error: deathError } = await supabase.from('death_logs').insert({
        plant_id: plantId,
        cause: deathCause,
        notes: deathNotes || null,
      })

      if (deathError) throw new Error(deathError.message)

      // Update plant status
      const { error: updateError } = await supabase
        .from('plants')
        .update({ status: 'dead' })
        .eq('id', plantId)

      if (updateError) throw new Error(updateError.message)

      router.push('/plants')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar la muerte')
    } finally {
      setIsRecordingDeath(false)
    }
  }

  function getWateringStatus(): 'ok' | 'today' | 'overdue' {
    if (!plant?.water_every_days) return 'ok'

    const lastWatered = careLogs.find((log) => log.care_type === 'riego')
    if (!lastWatered) {
      const created = new Date(plant.created_at)
      const now = new Date()
      const daysSinceCreation = Math.floor(
        (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      )
      return daysSinceCreation >= plant.water_every_days ? 'overdue' : 'ok'
    }

    const lastWateredDate = new Date(lastWatered.logged_at)
    const now = new Date()
    const daysSince = Math.floor(
      (now.getTime() - lastWateredDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSince > plant.water_every_days) return 'overdue'
    if (daysSince >= plant.water_every_days) return 'today'
    return 'ok'
  }

  function getOverdueDays(): number {
    if (!plant?.water_every_days) return 0

    const lastWatered = careLogs.find((log) => log.care_type === 'riego')
    if (!lastWatered) {
      const created = new Date(plant.created_at)
      const now = new Date()
      return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    }

    const lastWateredDate = new Date(lastWatered.logged_at)
    const now = new Date()
    const daysSince = Math.floor(
      (now.getTime() - lastWateredDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    return Math.max(0, daysSince - plant.water_every_days)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (error || !plant) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">😕</span>
          <p className="text-gray-600">{error || 'Planta no encontrada'}</p>
          <Link href="/plants" className="text-botanical-600 hover:underline mt-4 block">
            ← Volver a mis plantas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link href="/plants" className="text-botanical-600 hover:underline mb-6 inline-block">
          ← Volver a mis plantas
        </Link>

        {/* Plant Card Large */}
        <div className="mb-8">
          <PlantCard
            plant={plant}
            wateringStatus={getWateringStatus()}
            overdueDays={getOverdueDays()}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setShowCareForm(true)}
            className="flex-1 bg-botanical-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-botanical-700 transition-colors"
          >
            💧 Registrar riego
          </button>
          <button
            onClick={() => setShowDeathModal(true)}
            className="bg-red-100 text-red-800 py-3 px-4 rounded-xl font-semibold hover:bg-red-200 transition-colors"
          >
            ⚠️ Murió
          </button>
        </div>

        {/* Care Log Form */}
        {showCareForm && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-4">
              Registrar riego
            </h2>
            <CareLogForm
              plantId={plantId}
              onSubmit={handleCareSubmit}
              onCancel={() => setShowCareForm(false)}
            />
          </div>
        )}

        {/* Death Modal */}
        {showDeathModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h2 className="font-serif text-xl font-bold text-gray-900 mb-4">
                Registrar fallecimiento
              </h2>
              <p className="text-gray-600 mb-4">
                Lamentamos la pérdida de {plant.name}. ¿Cuál fue la causa?
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {(Object.keys(DEATH_CAUSE_EMOJI) as DeathCause[]).map((cause) => (
                  <button
                    key={cause}
                    onClick={() => setDeathCause(cause)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      deathCause === cause
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span>{DEATH_CAUSE_EMOJI[cause]}</span>
                    <span className="text-sm capitalize">{cause.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>

              <textarea
                value={deathNotes}
                onChange={(e) => setDeathNotes(e.target.value)}
                placeholder="Notas adicionales (opcional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl mb-4 resize-none"
                rows={3}
              />

              <div className="flex gap-2">
                <button
                  onClick={handleRecordDeath}
                  disabled={isRecordingDeath}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isRecordingDeath ? 'Registrando...' : 'Confirmar fallecimiento'}
                </button>
                <button
                  onClick={() => setShowDeathModal(false)}
                  className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        {plant.tips && plant.tips.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-4">
              💡 Tips de cuidado
            </h2>
            <ul className="space-y-2">
              {plant.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-botanical-600 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Care History */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-4">
            📋 Historial de cuidados
          </h2>

          {careLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay registros de cuidado aún
            </p>
          ) : (
            <div className="space-y-4">
              {careLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
                >
                  <span className="text-2xl">{CARE_TYPE_ICONS[log.care_type]}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {CARE_TYPE_LABELS[log.care_type]}
                      </span>
                      {log.weather && <WeatherBadge weather={log.weather} size="sm" />}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(log.logged_at).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    {log.notes && (
                      <p className="text-sm text-gray-600 mt-1 italic">{log.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
