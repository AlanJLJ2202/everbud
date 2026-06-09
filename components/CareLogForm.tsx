'use client'

import { useState } from 'react'
import { Weather, WEATHER_LABELS, WEATHER_ICONS } from '@/types'

interface CareLogFormProps {
  plantId: string
  onSubmit: (data: { care_type: string; weather: Weather; notes: string }) => Promise<void>
  onCancel: () => void
}

export default function CareLogForm({ plantId, onSubmit, onCancel }: CareLogFormProps) {
  const [weather, setWeather] = useState<Weather>('soleado')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit({
        care_type: 'riego',
        weather,
        notes,
      })
    } catch (error) {
      console.error('Error submitting care log:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ¿Cómo está el clima hoy?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(WEATHER_LABELS) as Weather[]).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWeather(w)}
              className={`weather-btn flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                weather === w
                  ? 'border-botanical-500 bg-botanical-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{WEATHER_ICONS[w]}</span>
              <span className="text-sm font-medium">{WEATHER_LABELS[w]}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notas (opcional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="¿Algo notable sobre la planta?"
          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-botanical-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-botanical-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="loading-spinner"></span>
              Guardando...
            </span>
          ) : (
            '💧 Confirmar riego'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
