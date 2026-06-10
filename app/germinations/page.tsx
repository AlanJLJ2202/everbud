'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'
import GerminationCard from '@/components/GerminationCard'
import { Germination, GerminationWithStatus } from '@/types'

export default function GerminationsPage() {
  const { t } = useLanguage()
  const [germinations, setGerminations] = useState<GerminationWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [seedName, setSeedName] = useState('')
  const [startedAt, setStartedAt] = useState(new Date().toISOString().split('T')[0])
  const [checkEveryDays, setCheckEveryDays] = useState(3)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchGerminations()
  }, [])

  async function fetchGerminations() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('germinations')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw new Error(fetchError.message)

      const germinationsWithStatus: GerminationWithStatus[] = (data || []).map((g) => {
        const now = new Date()
        const startDate = new Date(g.started_at)
        const daysElapsed = Math.floor(
          (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        const lastChecked = g.last_checked_at ? new Date(g.last_checked_at) : startDate
        const nextCheckDate = new Date(lastChecked)
        nextCheckDate.setDate(nextCheckDate.getDate() + g.check_every_days)

        const daysUntilCheck = Math.floor(
          (nextCheckDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        let checkStatus: 'ok' | 'today' | 'overdue' = 'ok'
        if (daysUntilCheck < 0) checkStatus = 'overdue'
        else if (daysUntilCheck === 0) checkStatus = 'today'

        return {
          ...g,
          daysElapsed,
          daysUntilCheck,
          checkStatus,
        }
      })

      setGerminations(germinationsWithStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('germinations.errorLoading'))
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!seedName.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('germinations').insert({
        seed_name: seedName.trim(),
        started_at: startedAt,
        check_every_days: checkEveryDays,
        notes: notes.trim() || null,
      })

      if (error) throw new Error(error.message)

      setSeedName('')
      setStartedAt(new Date().toISOString().split('T')[0])
      setCheckEveryDays(3)
      setNotes('')
      setShowForm(false)
      fetchGerminations()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('germinations.errorCreate'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCheckToday(id: string) {
    const { error } = await supabase
      .from('germinations')
      .update({ last_checked_at: new Date().toISOString().split('T')[0] })
      .eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      fetchGerminations()
    }
  }

  async function handleMarkExitosa(id: string) {
    const { error } = await supabase
      .from('germinations')
      .update({ status: 'exitosa' })
      .eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      fetchGerminations()
    }
  }

  async function handleMarkFallida(id: string) {
    const { error } = await supabase
      .from('germinations')
      .update({ status: 'fallida' })
      .eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      fetchGerminations()
    }
  }

  const activeGerminations = germinations.filter((g) => g.status === 'en_curso')
  const completedGerminations = germinations.filter((g) => g.status !== 'en_curso')

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900">
              {t('germinations.title')}
            </h1>
            <p className="text-gray-600 mt-1">
              {activeGerminations.length} {t('germinations.activeCount')}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-botanical-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-botanical-700 transition-colors"
          >
            {t('germinations.newGermination')}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* New Germination Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-4">
              {t('germinations.formTitle')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="seedName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('germinations.seedName')}
                </label>
                <input
                  type="text"
                  id="seedName"
                  value={seedName}
                  onChange={(e) => setSeedName(e.target.value)}
                  placeholder={t('germinations.seedNamePlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startedAt" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('germinations.startDate')}
                  </label>
                  <input
                    type="date"
                    id="startedAt"
                    value={startedAt}
                    onChange={(e) => setStartedAt(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="checkDays" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('germinations.checkDays')}
                  </label>
                  <input
                    type="number"
                    id="checkDays"
                    value={checkEveryDays}
                    onChange={(e) => setCheckEveryDays(parseInt(e.target.value) || 1)}
                    min={1}
                    max={14}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('germinations.notes')}
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('germinations.notesPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent resize-none"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-botanical-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-botanical-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? t('germinations.creating') : t('germinations.createButton')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="loading-spinner mb-4"></div>
            <p className="text-gray-600">{t('germinations.loading')}</p>
          </div>
        ) : germinations.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <span className="text-8xl block mb-6">🌱</span>
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-3">
              {t('germinations.emptyTitle')}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {t('germinations.emptyDesc')}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-block bg-botanical-600 text-white px-6 py-3 rounded-xl font-semibold text-lg hover:bg-botanical-700 transition-colors"
            >
              {t('germinations.createFirst')}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Germinations */}
            {activeGerminations.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-bold text-gray-900 mb-4">
                  {t('germinations.active')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeGerminations.map((g) => (
                    <GerminationCard
                      key={g.id}
                      germination={g}
                      onCheckToday={handleCheckToday}
                      onMarkExitosa={handleMarkExitosa}
                      onMarkFallida={handleMarkFallida}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Germinations */}
            {completedGerminations.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-bold text-gray-900 mb-4">
                  {t('germinations.completed')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedGerminations.map((g) => (
                    <GerminationCard
                      key={g.id}
                      germination={g}
                      onCheckToday={handleCheckToday}
                      onMarkExitosa={handleMarkExitosa}
                      onMarkFallida={handleMarkFallida}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
