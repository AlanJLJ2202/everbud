import { GardenerLevel, PlantStatus, Rarity, Species } from '@/types'

// Puntos por planta viva según la rareza de su especie
const RARITY_POINTS: Record<Rarity, number> = {
  comun: 10,
  poco_comun: 18,
  rara: 30,
  muy_rara: 50,
  legendaria: 90,
}

// Una planta muerta deja algo de experiencia, pero mucho menos
const DEAD_PLANT_POINTS = 2

// Umbral mínimo de puntos para alcanzar cada nivel
export const LEVEL_THRESHOLDS: Array<{ level: GardenerLevel; minPoints: number }> = [
  { level: 'principiante', minPoints: 0 },
  { level: 'intermedio', minPoints: 60 },
  { level: 'experto', minPoints: 200 },
  { level: 'gran_maestro', minPoints: 500 },
]

export interface GamificationStats {
  level: GardenerLevel
  points: number
  nextLevel: GardenerLevel | null
  pointsToNextLevel: number
  /** 0..1 dentro del tramo del nivel actual */
  progress: number
  alivePlants: number
  deadPlants: number
  uniqueSpecies: number
  rareOrBetter: number
}

type ScorablePlant = {
  status: PlantStatus
  species_id?: string | null
  species?: Pick<Species, 'id' | 'rarity'> | null
}

export function computeGardenerStats(plants: ScorablePlant[]): GamificationStats {
  let points = 0
  let alivePlants = 0
  let deadPlants = 0
  let rareOrBetter = 0
  const speciesIds = new Set<string>()

  for (const plant of plants) {
    const rarity: Rarity = plant.species?.rarity ?? 'comun'
    const speciesKey = plant.species?.id ?? plant.species_id
    if (speciesKey) speciesIds.add(speciesKey)

    if (plant.status === 'alive') {
      alivePlants++
      points += RARITY_POINTS[rarity] ?? RARITY_POINTS.comun
      if (rarity === 'rara' || rarity === 'muy_rara' || rarity === 'legendaria') {
        rareOrBetter++
      }
    } else {
      deadPlants++
      points += DEAD_PLANT_POINTS
    }
  }

  // Bonus por diversidad: +5 por especie distinta
  points += speciesIds.size * 5

  let current = LEVEL_THRESHOLDS[0]
  let next: (typeof LEVEL_THRESHOLDS)[number] | null = null
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i].minPoints) {
      current = LEVEL_THRESHOLDS[i]
      next = LEVEL_THRESHOLDS[i + 1] ?? null
    }
  }

  const progress = next
    ? Math.min(1, (points - current.minPoints) / (next.minPoints - current.minPoints))
    : 1

  return {
    level: current.level,
    points,
    nextLevel: next?.level ?? null,
    pointsToNextLevel: next ? next.minPoints - points : 0,
    progress,
    alivePlants,
    deadPlants,
    uniqueSpecies: speciesIds.size,
    rareOrBetter,
  }
}

export const LEVEL_EMOJI: Record<GardenerLevel, string> = {
  principiante: '🌱',
  intermedio: '🌿',
  experto: '🌳',
  gran_maestro: '🏆',
}
