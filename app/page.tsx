'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
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

function StepPreview({ type }: { type: string }) {
  const { t } = useLanguage()

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
            {t('landing.previewIdentify')}
          </span>
          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            {t('landing.previewIdentifyLight')}
          </span>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {t('landing.previewIdentifyWater')}
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
        <span className="text-xs font-medium text-gray-900">{t('landing.previewAlertTitle')}</span>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-gray-500">
        <Clock className="w-3 h-3" />
        <span>{t('landing.previewAlertTime')}</span>
      </div>
    </div>
  )
}

function DashboardPlaceholder() {
  const { t } = useLanguage()

  const plants = [
    {
      name: 'Rosal',
      scientific: 'Rosa × damascena',
      gradient: 'gradient-floral',
      light: '☀️',
      lightLabel: t('landing.previewIdentifyLight'),
      water: t('landing.previewIdentifyWater'),
      type: t('landing.previewIdentify'),
      status: 'ok',
      src: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&h=450&fit=crop&crop=center',
    },
    {
      name: 'Basilico',
      scientific: 'Ocimum basilicum',
      gradient: 'gradient-aromatica',
      light: '🌤',
      lightLabel: t('lightType.media_sombra'),
      water: 'Cada 3d',
      type: t('plantType.aromatica'),
      status: 'today',
      src: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=600&h=450&fit=crop&crop=center',
    },
    {
      name: 'Aloe Vera',
      scientific: 'Aloe barbadensis',
      gradient: 'gradient-suculenta',
      light: '☀️',
      lightLabel: t('landing.previewIdentifyLight'),
      water: 'Cada 14d',
      type: t('plantType.suculenta'),
      status: 'ok',
      src: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=600&h=450&fit=crop&crop=center',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto mt-10 md:mt-16 relative px-2 sm:px-0">
      <div className="bg-white rounded-t-2xl shadow-2xl border border-gray-200 border-b-0 overflow-hidden">
        {/* Title bar */}
        <div className="bg-botanical-600 px-3 sm:px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-white/80 text-[10px] sm:text-xs ml-2 font-medium truncate">
            everbud.vercel.app/dashboard
          </span>
        </div>

        {/* Dashboard content */}
        <div className="p-3 sm:p-6 bg-cream-50">
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">🌱</span>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">12</p>
                  <p className="text-[10px] sm:text-xs text-gray-600">{t('dashboard.livePlants')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">💧</span>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-botanical-700">3</p>
                  <p className="text-[10px] sm:text-xs text-gray-600">{t('dashboard.needWatering')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">🔍</span>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-amber-600">2</p>
                  <p className="text-[10px] sm:text-xs text-gray-600">{t('dashboard.pendingGerminations')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section header */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="font-serif text-xs sm:text-sm font-bold text-gray-900">
              {t('dashboard.latestPlants')}
            </h3>
            <span className="text-[10px] sm:text-xs text-botanical-600">{t('dashboard.viewAll')}</span>
          </div>

          {/* Plant cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {plants.map((plant) => (
              <div
                key={plant.name}
                className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100"
              >
                <div className={`${plant.gradient} p-1`}>
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
                    <Image
                      src={plant.src}
                      alt={plant.name}
                      fill
                      className="object-cover"
                      sizes="250px"
                    />
                    <div className="absolute top-2 right-2">
                      {plant.status === 'today' ? (
                        <span className="badge-needs-water px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          💧 {t('plantCard.todayDue')}
                        </span>
                      ) : (
                        <span className="badge-alive px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          ✓ {t('plantCard.upToDate')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-2 sm:p-3">
                  <h4 className="font-serif text-xs sm:text-sm font-bold text-gray-900 mb-0.5">
                    {plant.name}
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 italic mb-1.5 sm:mb-2">
                    {plant.scientific}
                  </p>
                  <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
                    <div className="flex flex-col items-center p-1 sm:p-1.5 bg-gray-50 rounded-lg">
                      <span className="text-xs sm:text-sm">{plant.light}</span>
                      <span className="text-[8px] sm:text-[9px] text-gray-600 mt-0.5 text-center leading-tight">
                        {plant.lightLabel}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-1 sm:p-1.5 bg-gray-50 rounded-lg">
                      <span className="text-xs sm:text-sm">💧</span>
                      <span className="text-[8px] sm:text-[9px] text-gray-600 mt-0.5 text-center leading-tight">
                        {plant.water}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-1 sm:p-1.5 bg-gray-50 rounded-lg">
                      <span className="text-xs sm:text-sm">🌿</span>
                      <span className="text-[8px] sm:text-[9px] text-gray-600 mt-0.5 text-center leading-tight">
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
      <div className="h-8 sm:h-12 bg-gradient-to-b from-white to-cream-50" />
    </div>
  )
}

export default function LandingPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const features = [
    { icon: Scan, title: t('landing.feature1Title'), description: t('landing.feature1Desc') },
    { icon: ClipboardList, title: t('landing.feature2Title'), description: t('landing.feature2Desc') },
    { icon: Droplets, title: t('landing.feature3Title'), description: t('landing.feature3Desc') },
    { icon: Sprout, title: t('landing.feature4Title'), description: t('landing.feature4Desc') },
    { icon: Leaf, title: t('landing.feature5Title'), description: t('landing.feature5Desc') },
    { icon: BarChart3, title: t('landing.feature6Title'), description: t('landing.feature6Desc') },
  ]

  const steps = [
    { number: '1', icon: Camera, title: t('landing.step1Title'), description: t('landing.step1Desc'), preview: 'photo' },
    { number: '2', icon: Scan, title: t('landing.step2Title'), description: t('landing.step2Desc'), preview: 'identify' },
    { number: '3', icon: Bell, title: t('landing.step3Title'), description: t('landing.step3Desc'), preview: 'alert' },
  ]

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
        <div className="max-w-6xl mx-auto px-4 pt-16 md:pt-32 pb-0">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-botanical-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Sprout className="w-6 h-6 sm:w-8 sm:h-8 text-botanical-600" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              {t('landing.heroTitle1')}
              <br />
              <span className="text-botanical-700">{t('landing.heroTitle2')}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-6 md:mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('landing.heroDescription')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-botanical-600 hover:bg-botanical-700 text-white font-semibold py-3.5 px-8 rounded-xl transition-colors text-base"
              >
                {t('landing.ctaRegister')}
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-8 rounded-xl transition-colors text-base"
              >
                {t('landing.ctaLogin')}
              </Link>
            </div>
          </div>

          {/* Dashboard placeholder */}
          <DashboardPlaceholder />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 md:mb-14">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t('landing.featuresTitle')}
            </h2>
            <p className="text-gray-700 text-base sm:text-lg max-w-2xl">
              {t('landing.featuresDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6 hover:shadow-lg hover:-translate-y-1 transition-all text-left"
                >
                  <div className="w-9 h-9 sm:w-11 sm:h-11 bg-botanical-50 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-botanical-600" />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 md:mb-14">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t('landing.howItWorksTitle')}
            </h2>
            <p className="text-gray-700 text-base sm:text-lg max-w-2xl">
              {t('landing.howItWorksDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.number} className="text-left">
                  <div className="flex items-center gap-3 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-botanical-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                      {step.number}
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-botanical-50 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-botanical-600" />
                    </div>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed max-w-xs">
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
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-botanical-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Sun className="w-6 h-6 sm:w-7 sm:h-7 text-botanical-600" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            {t('landing.finalCtaTitle')}
          </h2>
          <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 max-w-xl mx-auto">
            {t('landing.finalCtaDescription')}
          </p>
          <Link
            href="/register"
            className="inline-block w-full sm:w-auto bg-botanical-600 hover:bg-botanical-700 text-white font-semibold py-3.5 px-10 rounded-xl transition-colors text-base"
          >
            {t('landing.finalCtaButton')}
          </Link>
        </div>
      </section>
    </div>
  )
}
