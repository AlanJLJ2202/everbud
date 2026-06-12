'use client'

import { TimelineDay, CARE_TYPE_COLORS_MAP } from '@/lib/plant-stats'
import { CareType } from '@/types'

interface PlantTimelineProps {
  days: TimelineDay[]
}

const CARE_EMOJI: Record<CareType, string> = {
  riego: '💧',
  fertilizante: '🌱',
  poda: '✂️',
  revision: '🔍',
}

export default function PlantTimeline({ days }: PlantTimelineProps) {
  if (days.length === 0) return null

  const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

  return (
    <div className="rounded-2xl p-4 bg-white border border-gray-100">
      <p className="text-sm font-medium text-gray-700 mb-3">
        📅 Últimos 30 días
      </p>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const date = new Date(day.date + 'T12:00:00')
          const dayOfWeek = dayNames[date.getDay()]
          const dayNum = date.getDate()
          const hasCares = day.careTypes.length > 0
          const primaryCare = day.careTypes[0]

          return (
            <div key={day.date} className="flex flex-col items-center gap-0.5">
              {i < 7 && (
                <span className="text-[10px] text-gray-400 font-medium">{dayOfWeek}</span>
              )}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-medium transition-colors ${
                  hasCares
                    ? 'text-white'
                    : 'bg-gray-50 text-gray-400'
                }`}
                style={
                  hasCares
                    ? { backgroundColor: CARE_TYPE_COLORS_MAP[primaryCare] }
                    : undefined
                }
                title={
                  hasCares
                    ? `${dayNum}: ${day.careTypes.map((c) => CARE_EMOJI[c]).join(' ')}`
                    : `${dayNum}`
                }
              >
                {hasCares ? CARE_EMOJI[primaryCare] : dayNum}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
        {(Object.entries(CARE_EMOJI) as [CareType, string][]).map(([type, emoji]) => (
          <div key={type} className="flex items-center gap-1">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: CARE_TYPE_COLORS_MAP[type] }}
            />
            <span className="text-[10px] text-gray-500 capitalize">{emoji}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
