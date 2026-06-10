'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  Scan,
  ClipboardList,
  Droplets,
  Sprout,
  Leaf,
  BarChart3,
  Camera,
  Bell,
  Sun,
  Flower2,
  TrendingUp,
  Clock,
} from 'lucide-react'

const features = [
  {
    icon: Scan,
    title: 'Identificación con IA',
    description:
      'Sube una foto y Claude identifica automáticamente la especie, tipo de luz y frecuencia de riego.',
  },
  {
    icon: ClipboardList,
    title: 'Tarjetas coleccionables',
    description:
      'Cada planta tiene su propia tarjeta con gradiente según su tipo: frutal, floral, suculenta y más.',
  },
  {
    icon: Droplets,
    title: 'Alertas de riego',
    description:
      'Nunca olvides regar. Recibe alertas cuando tus plantas necesitan atención.',
  },
  {
    icon: Sprout,
    title: 'Seguimiento de germinación',
    description:
      'Monitorea tus semillas desde la siembra con revisiones configurables y estados en tiempo real.',
  },
  {
    icon: Leaf,
    title: 'Registro de mortalidad',
    description:
      'Documenta qué plantas se perdieron y por qué, para aprender y mejorar tu jardín.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard inteligente',
    description:
      'Vista general en tiempo real: plantas vivas, riegos pendientes y germinaciones activas.',
  },
]

const steps = [
  {
    number: '1',
    icon: Camera,
    title: 'Registra tu planta',
    description: 'Toma una foto o escribe el nombre. La IA hace el resto.',
    preview: 'photo',
  },
  {
    number: '2',
    icon: Scan,
    title: 'La IA la identifica',
    description:
      'Claude analiza la imagen y te dice qué especie es, qué luz necesita y cada cuánto regarla.',
    preview: 'identify',
  },
  {
    number: '3',
    icon: Bell,
    title: 'Recibe alertas',
    description:
      'Tu jardín te avisa cuándo regar, fertilizar o revisar cada planta.',
    preview: 'alert',
  },
]

function StepPreview({ type }: { type: string }) {
  if (type === 'photo') {
    return (
      <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 p-3 max-w-[200px]">
        <div className="w-full h-20 bg-botanical-100 rounded-md flex items-center justify-center mb-2">
          <Camera className="w-6 h-6 text-botanical-500" />
        </div>
        <div className="h-2 bg-gray-200 rounded-full w-3/4" />
        <div className="h-2 bg-gray-100 rounded-full w-1/2 mt-1" />
      </div>
    )
  }
  if (type === 'identify') {
    return (
      <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 p-3 max-w-[200px]">
        <div className="flex items-center gap-2 mb-2">
          <Flower2 className="w-4 h-4 text-botanical-600" />
          <span className="text-xs font-medium text-gray-900">Rosal</span>
        </div>
        <div className="flex flex-wrap gap-1">
          <span className="text-[10px] bg-botanical-100 text-botanical-700 px-2 py-0.5 rounded-full">
            Floral
          </span>
          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            Sol directo
          </span>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            Cada 2d
          </span>
        </div>
      </div>
    )
  }
  return (
    <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 p-3 max-w-[200px]">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 bg-botanical-500 rounded-md flex items-center justify-center">
          <Droplets className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs font-medium text-gray-900">Riego pendiente</span>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-gray-500">
        <Clock className="w-3 h-3" />
        <span>Hace 2 días</span>
      </div>
    </div>
  )
}

function DashboardPlaceholder() {
  const plants = [
    {
      name: 'Rosal',
      scientific: 'Rosa × damascena',
      gradient: 'gradient-floral',
      light: '☀️',
      lightLabel: 'Sol directo',
      water: 'Cada 2d',
      type: 'Floral',
      status: 'ok',
      src: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&h=450&fit=crop&crop=center',
    },
    {
      name: 'Basilico',
      scientific: 'Ocimum basilicum',
      gradient: 'gradient-aromatica',
      light: '🌤',
      lightLabel: 'Media sombra',
      water: 'Cada 3d',
      type: 'Aromática',
      status: 'today',
      src: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=600&h=450&fit=crop&crop=center',
    },
    {
      name: 'Aloe Vera',
      scientific: 'Aloe barbadensis',
      gradient: 'gradient-suculenta',
      light: '☀️',
      lightLabel: 'Sol directo',
      water: 'Cada 14d',
      type: 'Suculenta',
      status: 'ok',
      src: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=600&h=450&fit=crop&crop=center',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto mt-16 relative">
      <div className="bg-white rounded-t-2xl shadow-2xl border border-gray-200 border-b-0 overflow-hidden">
        {/* Title bar */}
        <div className="bg-botanical-600 px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-white/80 text-xs ml-2 font-medium">
            everbud.vercel.app/dashboard
          </span>
        </div>

        {/* Dashboard content */}
        <div className="p-6 bg-cream-50">
          {/* Stats row — matches real dashboard */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🌱</span>
                <div>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                  <p className="text-xs text-gray-600">Plantas vivas</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">💧</span>
                <div>
                  <p className="text-2xl font-bold text-botanical-700">3</p>
                  <p className="text-xs text-gray-600">Necesitan riego hoy</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔍</span>
                <div>
                  <p className="text-2xl font-bold text-amber-600">2</p>
                  <p className="text-xs text-gray-600">Germinaciones pendientes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif text-sm font-bold text-gray-900">
              Últimas plantas agregadas
            </h3>
            <span className="text-xs text-botanical-600">Ver todas →</span>
          </div>

          {/* Plant cards — matches PlantCard component */}
          <div className="grid grid-cols-3 gap-4">
            {plants.map((plant) => (
              <div
                key={plant.name}
                className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100"
              >
                {/* Image with gradient border */}
                <div className={`${plant.gradient} p-1`}>
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
                    <Image
                      src={plant.src}
                      alt={plant.name}
                      fill
                      className="object-cover"
                      sizes="250px"
                    />
                    {/* Watering badge */}
                    <div className="absolute top-2 right-2">
                      {plant.status === 'today' ? (
                        <span className="badge-needs-water px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          💧 Hoy toca
                        </span>
                      ) : (
                        <span className="badge-alive px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          ✓ Al día
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3">
                  <h4 className="font-serif text-sm font-bold text-gray-900 mb-0.5">
                    {plant.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 italic mb-2">
                    {plant.scientific}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="flex flex-col items-center p-1.5 bg-gray-50 rounded-lg">
                      <span className="text-sm">{plant.light}</span>
                      <span className="text-[9px] text-gray-600 mt-0.5 text-center leading-tight">
                        {plant.lightLabel}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-1.5 bg-gray-50 rounded-lg">
                      <span className="text-sm">💧</span>
                      <span className="text-[9px] text-gray-600 mt-0.5 text-center leading-tight">
                        {plant.water}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-1.5 bg-gray-50 rounded-lg">
                      <span className="text-sm">🌿</span>
                      <span className="text-[9px] text-gray-600 mt-0.5 text-center leading-tight">
                        {plant.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Fade to cream at bottom */}
      <div className="h-12 bg-gradient-to-b from-white to-cream-50" />
    </div>
  )
}

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
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-botanical-50 via-cream-50 to-white">
        <div className="max-w-6xl mx-auto px-4 pt-20 md:pt-32 pb-0">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-botanical-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sprout className="w-8 h-8 text-botanical-600" />
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Tu jardín inteligente,
              <br />
              <span className="text-botanical-700">siempre bajo control</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
              Gestiona tus plantas con identificación por IA, alertas de riego
              automáticas y un dashboard que te mantiene al día. Nunca más
              olvides regar.
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

          {/* Dashboard placeholder */}
          <DashboardPlaceholder />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para tu jardín
            </h2>
            <p className="text-gray-700 text-lg max-w-2xl">
              Desde la identificación por IA hasta el seguimiento de
              germinaciones. Everbud centraliza el cuidado de tus plantas en un
              solo lugar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all text-left"
                >
                  <div className="w-11 h-11 bg-botanical-50 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-botanical-600" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-gray-700 text-lg max-w-2xl">
              Tres pasos simples para tener tu jardín bajo control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.number} className="text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-botanical-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                      {step.number}
                    </div>
                    <div className="w-10 h-10 bg-botanical-50 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-botanical-600" />
                    </div>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                  <StepPreview type={step.preview} />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-botanical-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sun className="w-7 h-7 text-botanical-600" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Empieza a cuidar tu jardín hoy
          </h2>
          <p className="text-gray-700 text-lg mb-8 max-w-xl mx-auto">
            Únete a Everbud y lleva el control de tus plantas con inteligencia
            artificial. Gratis, sin tarjeta de crédito.
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
