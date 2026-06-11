export type PlantType = 'frutal' | 'floral' | 'suculenta' | 'aromatica' | 'otro'
export type LightType = 'sol_pleno' | 'media_sombra' | 'sombra'
export type PlantStatus = 'alive' | 'dead'
export type CareType = 'riego' | 'fertilizante' | 'poda' | 'revision'
export type Weather = 'soleado' | 'nublado' | 'lluvioso' | 'ventoso'
export type GerminationStatus = 'en_curso' | 'exitosa' | 'fallida'
export type DeathCause = 'sequia' | 'plaga' | 'exceso_agua' | 'frio' | 'enfermedad' | 'otro'

export interface Plant {
  id: string
  user_id: string
  name: string
  common_name: string | null
  scientific_name: string | null
  type: PlantType | null
  light_type: LightType | null
  water_every_days: number | null
  tips: string[] | null
  image_url: string | null
  status: PlantStatus
  created_at: string
}

export interface CareLog {
  id: string
  user_id: string
  plant_id: string
  care_type: CareType
  weather: Weather | null
  notes: string | null
  logged_at: string
}

export interface Germination {
  id: string
  user_id: string
  seed_name: string
  started_at: string
  check_every_days: number
  last_checked_at: string | null
  status: GerminationStatus
  notes: string | null
  created_at: string
}

export interface DeathLog {
  id: string
  user_id: string
  plant_id: string
  cause: DeathCause
  notes: string | null
  died_at: string
}

// Extended types for UI
export interface PlantWithCareStatus extends Plant {
  lastWateredAt: string | null
  daysSinceWatering: number | null
  wateringStatus: 'ok' | 'today' | 'overdue'
  overdueDays: number
}

export interface GerminationWithStatus extends Germination {
  daysElapsed: number
  daysUntilCheck: number
  checkStatus: 'ok' | 'today' | 'overdue'
}
