'use client'

import { Germination, GerminationWithStatus } from '@/types'

interface GerminationCardProps {
  germination: Germination | GerminationWithStatus
  onCheckToday: (id: string) => Promise<void>
  onMarkExitosa: (id: string) => Promise<void>
  onMarkFallida: (id: string) => Promise<void>
}

function getCheckStatusBadge(status: 'ok' | 'today' | 'overdue') {
  switch (status) {
    case 'ok':
      return (
        <span className="badge-alive px-2 py-1 rounded-full text-xs font-semibold">
          ✓ Al día
        </span>
      )
    case 'today':
      return (
        <span className="badge-needs-water px-2 py-1 rounded-full text-xs font-semibold">
          🔍 Revisar hoy
        </span>
      )
    case 'overdue':
      return (
        <span className="badge-overdue px-2 py-1 rounded-full text-xs font-semibold">
          ⚠️ Atrasado
        </span>
      )
  }
}

export default function GerminationCard({
  germination,
  onCheckToday,
  onMarkExitosa,
  onMarkFallida,
}: GerminationCardProps) {
  const isEnCurso = germination.status === 'en_curso'
  const daysElapsed = 'daysElapsed' in germination
    ? (germination as GerminationWithStatus).daysElapsed
    : Math.floor(
        (new Date().getTime() - new Date(germination.started_at).getTime()) / (1000 * 60 * 60 * 24)
      )

  const checkStatus = 'checkStatus' in germination
    ? (germination as GerminationWithStatus).checkStatus
    : 'ok'

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-serif text-lg font-bold text-gray-900">
            {germination.seed_name}
          </h3>
          <p className="text-sm text-gray-500">
            Iniciado: {new Date(germination.started_at).toLocaleDateString('es-ES')}
          </p>
        </div>
        {isEnCurso && getCheckStatusBadge(checkStatus)}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-2xl font-bold text-botanical-700">{daysElapsed}</p>
          <p className="text-xs text-gray-600">días transcurridos</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-2xl font-bold text-botanical-700">
            {germination.check_every_days}
          </p>
          <p className="text-xs text-gray-600">días entre revisiones</p>
        </div>
      </div>

      {germination.notes && (
        <p className="text-sm text-gray-600 mb-3 italic">
          &ldquo;{germination.notes}&rdquo;
        </p>
      )}

      {isEnCurso && (
        <div className="flex gap-2">
          <button
            onClick={() => onCheckToday(germination.id)}
            className="flex-1 bg-botanical-600 text-white py-2 px-3 rounded-xl text-sm font-semibold hover:bg-botanical-700 transition-colors"
          >
            🔍 Revisé hoy
          </button>
          <button
            onClick={() => onMarkExitosa(germination.id)}
            className="flex-1 bg-green-100 text-green-800 py-2 px-3 rounded-xl text-sm font-semibold hover:bg-green-200 transition-colors"
          >
            ✓ Exitosa
          </button>
          <button
            onClick={() => onMarkFallida(germination.id)}
            className="flex-1 bg-red-100 text-red-800 py-2 px-3 rounded-xl text-sm font-semibold hover:bg-red-200 transition-colors"
          >
            ✗ Fallida
          </button>
        </div>
      )}

      {!isEnCurso && (
        <div
          className={`text-center py-2 rounded-xl font-semibold ${
            germination.status === 'exitosa'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {germination.status === 'exitosa' ? '✓ Germinación exitosa' : '✗ Germinación fallida'}
        </div>
      )}
    </div>
  )
}
