'use client'

import { Weather } from '@/types'
import { useLanguage } from '@/context/LanguageContext'

interface WeatherBadgeProps {
  weather: Weather
  size?: 'sm' | 'md' | 'lg'
}

export default function WeatherBadge({ weather, size = 'md' }: WeatherBadgeProps) {
  const { t } = useLanguage()

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const weatherIcons: Record<Weather, string> = {
    soleado: '☀️',
    nublado: '☁️',
    lluvioso: '🌧',
    ventoso: '💨',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 bg-blue-50 text-blue-800 rounded-full font-medium ${sizeClasses[size]}`}
    >
      <span>{weatherIcons[weather]}</span>
      <span>{t(`weather.${weather}`)}</span>
    </span>
  )
}
