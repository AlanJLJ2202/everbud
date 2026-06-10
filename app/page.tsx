'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const features = [
  {
    emoji: '🤖',
    title: 'Identificación con IA',
    description: 'Sube una foto y Claude identifica automáticamente la especie, tipo de luz y frecuencia de riego.',
  },
  {
    emoji: '📋',
    title: 'Tarjetas coleccionables',
    description: 'Cada planta tiene su propia tarjeta con gradiente según su tipo: frutal, floral, suculenta y más.',
  },
  {
    emoji: '💧',
    title: 'Alertas de riego',
    description: 'Nunca olvides regar. Recibe alertas cuando tus plantas necesitan atención.',
  },
  {
    emoji: '🌱',
    title: 'Seguimiento de germinación',
    description: 'Monitorea tus semillas desde la siembra con revisiones configurables y estados en tiempo real.',
  },
  {
    emoji: '💀',
    title: 'Registro de mortalidad',
    description: 'Documenta qué plantas se perdieron y por qué, para aprender y mejorar tu jardín.',
  },
  {
    emoji: '📊',
    title: 'Dashboard inteligente',
    description: 'Vista general en tiempo real: plantas vivas, riegos pendientes y germinaciones activas.',
  },
]

const steps = [
  {
    number: '1',
    emoji: '📸',
    title: 'Registra tu planta',
    description: 'Toma una foto o escribe el nombre. La IA hace el resto.',
  },
  {
    number: '2',
    emoji: '🔍',
    title: 'La IA la identifica',
    description: 'Claude analiza la imagen y te dice qué especie es, qué luz necesita y cada cuánto regarla.',
  },
  {
    number: '3',
    emoji: '🔔',
    title: 'Recibe alertas',
    description: 'Tu jardín te avisa cuándo regar, fertilizar o revisar cada planta.',
  },
]

export default function LandingPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.replace('/dashboard')
    }
  }, [user, router])

  if (user) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-6xl md:text-7xl block mb-6">🌿</span>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Tu jardín inteligente,
              <br />
              <span className="text-botanical-700">siempre bajo control</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Gestiona tus plantas con identificación por IA, alertas de riego automáticas
              y un dashboard que te mantiene al día. Nunca más olvides regar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-botanical-600 hover:bg-botanical-700 text-white font-semibold py-3.5 px-8 rounded-xl transition-colors text-base"
              >
                Registrarse gratis
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-8 rounded-xl transition-colors text-base"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative gradient blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-botanical-100 rounded-full blur-3xl opacity-30 -z-10" />
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para tu jardín
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Desde la identificación por IA hasta el seguimiento de germinaciones.
              Everbud centraliza el cuidado de tus plantas en un solo lugar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
              >
                <span className="text-4xl block mb-4">{feature.emoji}</span>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Tres pasos simples para tener tu jardín bajo control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-16 h-16 bg-botanical-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <span className="text-3xl">{step.emoji}</span>
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 bg-botanical-600 text-white rounded-full text-sm font-bold mb-3">
                  {step.number}
                </div>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-5xl block mb-6">🌻</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Empieza a cuidar tu jardín hoy
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
            Únete a Everbud y lleva el control de tus plantas con inteligencia artificial.
            Gratis, sin tarjeta de crédito.
          </p>
          <Link
            href="/register"
            className="inline-block bg-botanical-600 hover:bg-botanical-700 text-white font-semibold py-3.5 px-10 rounded-xl transition-colors text-base"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </section>
    </div>
  )
}
