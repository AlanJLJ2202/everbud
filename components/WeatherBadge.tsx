import { Weather, WEATHER_LABELS, WEATHER_ICONS } from '@/types'

interface WeatherBadgeProps {
  weather: Weather
  size?: 'sm' | 'md' | 'lg'
}

export default function WeatherBadge({ weather, size = 'md' }: WeatherBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 bg-blue-50 text-blue-800 rounded-full font-medium ${sizeClasses[size]}`}
    >
      <span>{WEATHER_ICONS[weather]}</span>
      <span>{WEATHER_LABELS[weather]}</span>
    </span>
  )
}
