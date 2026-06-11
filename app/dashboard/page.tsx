'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import PlantCard from '@/components/PlantCard'
import GardenerLevelBadge from '@/components/GardenerLevelBadge'
import ShareProfileButton from '@/components/ShareProfileButton'
import { computeGardenerStats, GamificationStats } from '@/lib/gamification'
import { Plant, PlantWithCareStatus } from '@/types'

export default function DashboardPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [plants, setPlants] = useState<PlantWithCareStatus[]>([])
  const [recentPlants, setRecentPlants] = useState<Plant[]>([])
  const [needsWatering, setNeedsWatering] = useState(0)
  const [germinationsDue, setGerminationsDue] = useState(0)
  const [totalPlants, setTotalPlants] = useState(0)
  const [gamification, setGamification] = useState<GamificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || ''

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  async function fetchDashboardData() {
    try {
      setLoading(true)

      const { data: plantsData } = await supabase
        .from('plants')
        .select('*, species(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      const allRows: Plant[] = plantsData || []
      setGamification(computeGardenerStats(allRows))

      const allPlants = allRows.filter((p) => p.status === 'alive')
      setTotalPlants(allPlants.length)
      setRecentPlants(allPlants.slice(0, 3))

      let waterCount = 0
      const plantsWithStatus: PlantWithCareStatus[] = await Promise.all(
        allPlants.map(async (plant: Plant) => {
          const { data: careLogs } = await supabase
            .from('care_logs')
            .select('*')
            .eq('plant_id', plant.id)
            .eq('user_id', user!.id)
            .eq('care_type', 'riego')
            .order('logged_at', { ascending: false })
            .limit(1)

          const lastWateredAt = careLogs?.[0]?.logged_at || null
          let daysSinceWatering: number | null = null
          let wateringStatus: 'ok' | 'today' | 'overdue' = 'ok'
          let overdueDays = 0

          if (plant.water_every_days) {
            if (lastWateredAt) {
              const lastWatered = new Date(lastWateredAt)
              const now = new Date()
              daysSinceWatering = Math.floor(
                (now.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24)
              )

              if (daysSinceWatering >= plant.water_every_days) {
                wateringStatus = 'today'
                waterCount++
              }
              if (daysSinceWatering > plant.water_every_days) {
                wateringStatus = 'overdue'
              }
            } else {
              const created = new Date(plant.created_at)
              const now = new Date()
              const daysSinceCreation = Math.floor(
                (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
              )
              if (daysSinceCreation >= plant.water_every_days) {
                wateringStatus = 'overdue'
                waterCount++
              }
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
      setNeedsWatering(waterCount)

      const { data: germinations } = await supabase
        .from('germinations')
        .select('*')
        .eq('status', 'en_curso')
        .eq('user_id', user!.id)

      let germinationDueCount = 0
      const now = new Date()

      for (const g of germinations || []) {
        const lastChecked = g.last_checked_at ? new Date(g.last_checked_at) : new Date(g.started_at)
        const nextCheck = new Date(lastChecked)
        nextCheck.setDate(nextCheck.getDate() + g.check_every_days)

        if (now >= nextCheck) {
          germinationDueCount++
        }
      }

      setGerminationsDue(germinationDueCount)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-bold text-gray-900">
              {t('dashboard.title')}
            </h1>
            <p className="text-gray-600 mt-2">
              {userName ? t('dashboard.welcome', { name: userName }) : t('dashboard.welcomeDefault')}
            </p>
            <div className="mt-3">
              <ShareProfileButton />
            </div>
          </div>
          {gamification && (
            <div className="sm:w-80 w-full">
              <GardenerLevelBadge stats={gamification} />
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🌱</span>
              <div>
                <p className="text-3xl font-bold text-gray-900">{totalPlants}</p>
                <p className="text-sm text-gray-600">{t('dashboard.livePlants')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <span className="text-4xl">💧</span>
              <div>
                <p className="text-3xl font-bold text-botanical-700">{needsWatering}</p>
                <p className="text-sm text-gray-600">{t('dashboard.needWatering')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🔍</span>
              <div>
                <p className="text-3xl font-bold text-amber-600">{germinationsDue}</p>
                <p className="text-sm text-gray-600">{t('dashboard.pendingGerminations')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            href="/new-plant"
            className="bg-botanical-600 text-white rounded-2xl p-6 text-center hover:bg-botanical-700 transition-colors"
          >
            <span className="text-3xl block mb-2">➕</span>
            <span className="font-semibold">{t('dashboard.newPlant')}</span>
          </Link>
          <Link
            href="/plants"
            className="bg-blue-600 text-white rounded-2xl p-6 text-center hover:bg-blue-700 transition-colors"
          >
            <span className="text-3xl block mb-2">💧</span>
            <span className="font-semibold">{t('dashboard.registerWatering')}</span>
          </Link>
          <Link
            href="/germinations"
            className="bg-amber-600 text-white rounded-2xl p-6 text-center hover:bg-amber-700 transition-colors"
          >
            <span className="text-3xl block mb-2">🌱</span>
            <span className="font-semibold">{t('dashboard.newGermination')}</span>
          </Link>
        </div>

        {/* Recent Plants */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl font-bold text-gray-900">
              {t('dashboard.latestPlants')}
            </h2>
            <Link href="/plants" className="text-botanical-600 hover:underline text-sm">
              {t('dashboard.viewAll')}
            </Link>
          </div>

          {recentPlants.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">
              <span className="text-6xl block mb-4">🌱</span>
              <p className="text-gray-600">{t('dashboard.addFirstPlant')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {recentPlants.map((plant) => {
                const plantWithStatus = plants.find((p) => p.id === plant.id)
                return (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    wateringStatus={plantWithStatus?.wateringStatus || 'ok'}
                    overdueDays={plantWithStatus?.overdueDays || 0}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
