'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import PlantCard from '@/components/PlantCard'
import { Plant } from '@/types'

interface PublicPlantViewProps {
  plant: Plant
  ownerUsername: string | null
  ownerDisplayName: string | null
  isOwnerPublic: boolean
}

export default function PublicPlantView({
  plant,
  ownerUsername,
  ownerDisplayName,
  isOwnerPublic,
}: PublicPlantViewProps) {
  const { t } = useLanguage()
  const species = plant.species

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Aviso solo visible para el dueño con perfil privado (RLS oculta la
            planta a cualquier otra persona en ese caso) */}
        {!isOwnerPublic && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
            <p className="text-sm text-yellow-800">{t('publicPlant.privateNotice')}</p>
          </div>
        )}

        {/* Carta Panini */}
        <div className="mb-6 max-w-xs mx-auto">
          <PlantCard plant={plant} href={null} />
        </div>

        {/* Dueño */}
        {ownerUsername && (
          <p className="text-center text-sm text-gray-500 mb-8">
            {t('publicPlant.by')}{' '}
            <Link
              href={`/${ownerUsername}`}
              className="text-botanical-700 font-medium hover:underline"
            >
              {ownerDisplayName || `@${ownerUsername}`}
            </Link>
            {' · '}
            <Link href={`/${ownerUsername}`} className="text-botanical-600 hover:underline">
              {t('publicPlant.viewGarden')}
            </Link>
          </p>
        )}

        {/* Especie: historia, rareza y ficha */}
        {species && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold text-gray-900">
                {t('publicPlant.story')}
              </h2>
              <span
                className={`rarity-${species.rarity} px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wide`}
                style={{ background: 'var(--panini-rarity)' }}
              >
                {t(`rarity.${species.rarity}`)}
              </span>
            </div>

            {species.story && (
              <p className="text-gray-700 leading-relaxed mb-4">{species.story}</p>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              {species.scientific_name && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">{t('publicPlant.scientificName')}</p>
                  <p className="text-gray-900 font-medium italic">{species.scientific_name}</p>
                </div>
              )}
              {species.family && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">{t('publicPlant.family')}</p>
                  <p className="text-gray-900 font-medium">{species.family}</p>
                </div>
              )}
              {species.origin && (
                <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                  <p className="text-gray-500 text-xs">{t('publicPlant.origin')}</p>
                  <p className="text-gray-900 font-medium">{species.origin}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tips generales de cuidado */}
        {plant.tips && plant.tips.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-4">
              {t('publicPlant.careTips')}
            </h2>
            <ul className="space-y-2">
              {plant.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-botanical-600 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/register"
            className="inline-block bg-botanical-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-botanical-700 transition-colors"
          >
            {t('publicPlant.cta')}
          </Link>
        </div>
      </div>
    </div>
  )
}
