'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface ModelStats {
  model: string
  total: number
  corrected: number
  avgIou: number | null
  minIou: number | null
  maxIou: number | null
  registered: number
}

interface SessionRow {
  session_id: string
  model: string
  created_at: string
  plants: number
  corrected: number
  avgIou: number | null
}

interface BenchmarkRow {
  id: string
  session_id: string
  model: string
  plant_index: number
  species_predicted: string | null
  confidence: string | null
  predicted_bbox: { x: number; y: number; w: number; h: number } | null
  corrected_bbox: { x: number; y: number; w: number; h: number } | null
  iou: number | null
  registered: boolean
  created_at: string
}

function iouColor(iou: number | null): string {
  if (iou === null) return 'text-gray-400'
  if (iou >= 0.7) return 'text-emerald-600'
  if (iou >= 0.5) return 'text-amber-500'
  return 'text-red-500'
}

function iouBg(iou: number | null): string {
  if (iou === null) return 'bg-gray-100'
  if (iou >= 0.7) return 'bg-emerald-50 border-emerald-200'
  if (iou >= 0.5) return 'bg-amber-50 border-amber-200'
  return 'bg-red-50 border-red-200'
}

function iouBar(iou: number | null) {
  if (iou === null) return null
  const pct = Math.round(iou * 100)
  const color = iou >= 0.7 ? 'bg-emerald-500' : iou >= 0.5 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
      <div className={`${color} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function BenchmarkPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<BenchmarkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('bbox_benchmark')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data }) => {
        setRows((data as BenchmarkRow[]) ?? [])
        setLoading(false)
      })
  }, [user])

  // Compute per-model stats
  const modelMap = new Map<string, BenchmarkRow[]>()
  rows.forEach(r => {
    if (!modelMap.has(r.model)) modelMap.set(r.model, [])
    modelMap.get(r.model)!.push(r)
  })

  const modelStats: ModelStats[] = Array.from(modelMap.entries()).map(([model, rr]) => {
    const withIou = rr.filter(r => r.iou !== null)
    const ious = withIou.map(r => r.iou as number)
    return {
      model,
      total: rr.length,
      corrected: rr.filter(r => r.corrected_bbox !== null).length,
      avgIou: ious.length ? ious.reduce((a, b) => a + b, 0) / ious.length : null,
      minIou: ious.length ? Math.min(...ious) : null,
      maxIou: ious.length ? Math.max(...ious) : null,
      registered: rr.filter(r => r.registered).length,
    }
  })

  // Group by session for the log
  const sessionMap = new Map<string, BenchmarkRow[]>()
  rows.forEach(r => {
    if (!sessionMap.has(r.session_id)) sessionMap.set(r.session_id, [])
    sessionMap.get(r.session_id)!.push(r)
  })

  const sessions: SessionRow[] = Array.from(sessionMap.entries()).map(([session_id, rr]) => {
    const withIou = rr.filter(r => r.iou !== null)
    const ious = withIou.map(r => r.iou as number)
    return {
      session_id,
      model: rr[0].model,
      created_at: rr[0].created_at,
      plants: rr.length,
      corrected: rr.filter(r => r.corrected_bbox !== null).length,
      avgIou: ious.length ? ious.reduce((a, b) => a + b, 0) / ious.length : null,
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Cargando datos…</div>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6">
        <div className="text-5xl">📊</div>
        <h1 className="text-xl font-semibold text-gray-700">Sin datos aún</h1>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          Registra plantas con la herramienta de jardín múltiple para empezar a acumular métricas de precisión.
        </p>
        <Link href="/new-plants" className="mt-2 bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700">
          Ir a Registrar jardín
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/new-plants" className="text-gray-400 hover:text-gray-600 text-lg">←</Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Benchmark de detección</h1>
            <p className="text-xs text-gray-500">Precisión de bounding boxes por modelo</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">

        {/* Legend */}
        <div className="flex gap-4 text-xs text-gray-500 justify-end">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> IoU ≥ 0.70 bueno</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> 0.50–0.70 aceptable</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> &lt; 0.50 pobre</span>
        </div>

        {/* Per-model cards */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Por modelo</h2>
          <div className="grid gap-3">
            {modelStats.map(s => (
              <div key={s.model} className={`rounded-xl border p-4 ${iouBg(s.avgIou)}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm font-semibold text-gray-800">{s.model}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {s.total} predicciones · {s.corrected} corregidas ({s.total > 0 ? Math.round(s.corrected / s.total * 100) : 0}%)
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-2xl font-bold tabular-nums ${iouColor(s.avgIou)}`}>
                      {s.avgIou !== null ? s.avgIou.toFixed(2) : '—'}
                    </p>
                    <p className="text-xs text-gray-400">IoU promedio</p>
                  </div>
                </div>
                {iouBar(s.avgIou)}
                {s.corrected > 0 && s.minIou !== null && s.maxIou !== null && (
                  <p className="text-xs text-gray-400 mt-2">
                    Rango: {s.minIou.toFixed(2)} – {s.maxIou.toFixed(2)} · {s.registered} plantas registradas
                  </p>
                )}
                {s.corrected === 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    Sin correcciones aún — ajusta esquinas en la pantalla de jardín para generar métricas
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Session log */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Historial de sesiones ({sessions.length})
          </h2>
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.session_id} className="bg-white rounded-xl border overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
                  onClick={() => setExpandedSession(prev => prev === s.session_id ? null : s.session_id)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{formatDate(s.created_at)}</p>
                    <p className="text-xs text-gray-400">
                      {s.plants} plantas · {s.corrected} corregidas · <span className="font-mono">{s.model}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.avgIou !== null ? (
                      <span className={`text-sm font-bold tabular-nums ${iouColor(s.avgIou)}`}>
                        {s.avgIou.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">sin IoU</span>
                    )}
                    <span className="text-gray-300 text-xs">{expandedSession === s.session_id ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expandedSession === s.session_id && (
                  <div className="border-t divide-y">
                    {rows
                      .filter(r => r.session_id === s.session_id)
                      .sort((a, b) => a.plant_index - b.plant_index)
                      .map(r => (
                        <div key={r.id} className="px-4 py-2.5 grid grid-cols-[auto_1fr_auto] gap-x-3 items-center">
                          <span className="text-lg">{r.registered ? '✅' : '⬜'}</span>
                          <div>
                            <p className="text-sm text-gray-700 font-medium truncate">
                              {r.species_predicted ?? 'Desconocida'}
                            </p>
                            <p className="text-xs text-gray-400">
                              Confianza: {r.confidence ?? '—'} · {r.corrected_bbox ? 'corregida' : 'sin corrección'}
                            </p>
                            {r.predicted_bbox && (
                              <p className="text-xs font-mono text-gray-300 mt-0.5">
                                pred: x{r.predicted_bbox.x.toFixed(2)} y{r.predicted_bbox.y.toFixed(2)} {r.predicted_bbox.w.toFixed(2)}×{r.predicted_bbox.h.toFixed(2)}
                              </p>
                            )}
                            {r.corrected_bbox && (
                              <p className="text-xs font-mono text-gray-400 mt-0.5">
                                corr: x{r.corrected_bbox.x.toFixed(2)} y{r.corrected_bbox.y.toFixed(2)} {r.corrected_bbox.w.toFixed(2)}×{r.corrected_bbox.h.toFixed(2)}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            {r.iou !== null ? (
                              <>
                                <span className={`text-sm font-bold tabular-nums ${iouColor(r.iou)}`}>
                                  {r.iou.toFixed(2)}
                                </span>
                                <p className="text-xs text-gray-400">IoU</p>
                              </>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Explainer */}
        <section className="bg-white rounded-xl border p-4 text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-700 mb-2">¿Qué es IoU?</p>
          <p><strong>IoU</strong> (Intersection over Union) mide qué tan bien el modelo ubicó la planta en la imagen. Compara el rectángulo que predijo Claude con el rectángulo que tú ajustaste manualmente.</p>
          <p className="mt-1"><strong>1.0</strong> = superposición perfecta · <strong>0.0</strong> = sin superposición</p>
          <p className="mt-1">Para que aparezca un valor de IoU, necesitas ajustar las esquinas del recuadro en la pantalla de registro de jardín.</p>
        </section>

      </div>
    </div>
  )
}
