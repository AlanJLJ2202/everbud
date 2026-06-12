'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase, uploadImage } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { PlantIdentification } from '@/lib/claude'
import { prepareImageForUpload, ImageProcessingError } from '@/lib/image'
import CameraCapture from '@/components/CameraCapture'
import { PlantType, LightType, Rarity, Species } from '@/types'

export default function NewPlantPage() {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const { user } = useAuth()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isIdentifying, setIsIdentifying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [identification, setIdentification] = useState<PlantIdentification | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [plantNameInput, setPlantNameInput] = useState('')
  const [isIdentifyingByName, setIsIdentifyingByName] = useState(false)
  const [showCamera, setShowCamera] = useState(false)

  const [name, setName] = useState('')
  const [commonName, setCommonName] = useState('')
  const [scientificName, setScientificName] = useState('')
  const [plantType, setPlantType] = useState<PlantType>('otro')
  const [lightType, setLightType] = useState<LightType>('sol_pleno')
  const [waterEveryDays, setWaterEveryDays] = useState(3)
  const [tips, setTips] = useState<string[]>([])
  const [rarity, setRarity] = useState<Rarity>('comun')
  const [story, setStory] = useState('')
  const [family, setFamily] = useState('')
  const [origin, setOrigin] = useState('')
  const [existingSpecies, setExistingSpecies] = useState<Species | null>(null)

  const plantTypeLabels: Record<PlantType, string> = {
    frutal: t('plantType.frutal'),
    floral: t('plantType.floral'),
    suculenta: t('plantType.suculenta'),
    aromatica: t('plantType.aromatica'),
    otro: t('plantType.otro'),
  }

  const lightTypeLabels: Record<LightType, string> = {
    sol_pleno: t('lightType.sol_pleno'),
    media_sombra: t('lightType.media_sombra'),
    sombra: t('lightType.sombra'),
  }

  const rarityLabels: Record<Rarity, string> = {
    comun: t('rarity.comun'),
    poco_comun: t('rarity.poco_comun'),
    rara: t('rarity.rara'),
    muy_rara: t('rarity.muy_rara'),
    legendaria: t('rarity.legendaria'),
  }

  // Aplica el resultado de la IA; si la especie ya existe en el catálogo
  // global de Everbud, usa esos datos y solo se vinculará al guardar
  const applyIdentification = async (result: PlantIdentification) => {
    setIdentification(result)

    let species: Species | null = null
    if (result.scientific_name) {
      const { data } = await supabase
        .from('species')
        .select('*')
        .ilike('scientific_name', result.scientific_name.trim())
        .maybeSingle()
      species = (data as Species | null) || null
    }
    setExistingSpecies(species)

    if (species) {
      setCommonName(species.common_name || result.common_name)
      setScientificName(species.scientific_name)
      setPlantType(species.type || result.type)
      setLightType(species.light_type || result.light_type)
      setWaterEveryDays(species.water_every_days || result.water_every_days)
      setTips(species.tips && species.tips.length > 0 ? species.tips : result.tips)
      setRarity(species.rarity || result.rarity)
      setStory(species.story || result.story)
      setFamily(species.family || result.family)
      setOrigin(species.origin || result.origin)
    } else {
      setCommonName(result.common_name)
      setScientificName(result.scientific_name)
      setPlantType(result.type)
      setLightType(result.light_type)
      setWaterEveryDays(result.water_every_days)
      setTips(result.tips)
      setRarity(result.rarity)
      setStory(result.story)
      setFamily(result.family)
      setOrigin(result.origin)
    }
  }

  const imageErrorMessages: Record<string, string> = {
    unsupported_format: t('newPlant.errorUnsupportedFormat'),
    heic_conversion_failed: t('newPlant.errorHeicConversion'),
    file_too_large: t('newPlant.errorFileTooLarge'),
  }

  const processImage = async (rawFile: File) => {
    setError(null)
    setIdentification(null)
    setIsIdentifying(true)

    let file: File
    try {
      // Valida formato/tamaño y convierte HEIC (iPhone) a JPEG
      file = await prepareImageForUpload(rawFile)
    } catch (err) {
      setIsIdentifying(false)
      setError(
        err instanceof ImageProcessingError
          ? imageErrorMessages[err.code]
          : t('newPlant.errorIdentify')
      )
      return
    }

    setImageFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('locale', locale)

      const response = await fetch('/api/identify', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t('newPlant.errorIdentify'))
      }

      const result: PlantIdentification = await response.json()
      await applyIdentification(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('newPlant.errorIdentify'))
    } finally {
      setIsIdentifying(false)
    }
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }

  // En móvil el input con capture abre la app de cámara nativa (el SO gestiona
  // el permiso); en desktop usamos getUserMedia con UI propia para el permiso
  const handleTakePhoto = () => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
    if (isTouchDevice || !navigator.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click()
    } else {
      setShowCamera(true)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    // No filtrar por file.type aquí: los HEIC suelen llegar con type vacío
    // y prepareImageForUpload ya valida y convierte lo que haga falta
    if (file) {
      processImage(file)
    }
  }

  const handleTextIdentification = async () => {
    if (!plantNameInput.trim()) return

    setIsIdentifyingByName(true)
    setError(null)

    try {
      const response = await fetch('/api/identify-by-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: plantNameInput, locale }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t('newPlant.errorIdentify'))
      }

      const result: PlantIdentification = await response.json()
      await applyIdentification(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('newPlant.errorIdentify'))
    } finally {
      setIsIdentifyingByName(false)
    }
  }

  const handleTipChange = (index: number, value: string) => {
    const newTips = [...tips]
    newTips[index] = value
    setTips(newTips)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError(t('newPlant.errorNameRequired'))
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      let imageUrl = null

      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      // Vincular al registro global de especies, o crearlo si es la primera vez
      let speciesId: string | null = existingSpecies?.id ?? null

      if (!speciesId && scientificName.trim()) {
        const { data: newSpecies, error: speciesError } = await supabase
          .from('species')
          .insert({
            scientific_name: scientificName.trim(),
            common_name: commonName.trim() || null,
            type: plantType,
            light_type: lightType,
            water_every_days: waterEveryDays,
            tips: tips.filter((t) => t.trim()),
            rarity,
            story: story.trim() || null,
            family: family.trim() || null,
            origin: origin.trim() || null,
            image_url: imageUrl,
            created_by: user!.id,
          })
          .select()
          .single()

        if (speciesError) {
          // 23505 = otro usuario registró la especie primero: vincular a la existente
          if (speciesError.code === '23505') {
            const { data: raced } = await supabase
              .from('species')
              .select('id')
              .ilike('scientific_name', scientificName.trim())
              .maybeSingle()
            speciesId = raced?.id ?? null
          } else {
            throw new Error(speciesError.message)
          }
        } else {
          speciesId = newSpecies.id
        }
      }

      const { data, error: insertError } = await supabase
        .from('plants')
        .insert({
          user_id: user!.id,
          species_id: speciesId,
          name: name.trim(),
          common_name: commonName.trim() || null,
          scientific_name: scientificName.trim() || null,
          type: plantType,
          light_type: lightType,
          water_every_days: waterEveryDays,
          tips: tips.filter((t) => t.trim()),
          image_url: imageUrl,
          status: 'alive',
        })
        .select()
        .single()

      if (insertError) {
        throw new Error(insertError.message)
      }

      router.push('/plants')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('newPlant.errorSave'))
    } finally {
      setIsSaving(false)
    }
  }

  const resetAll = () => {
    setImagePreview(null)
    setImageFile(null)
    setIdentification(null)
    setPlantNameInput('')
    setError(null)
    setExistingSpecies(null)
    setRarity('comun')
    setStory('')
    setFamily('')
    setOrigin('')
    if (cameraInputRef.current) cameraInputRef.current.value = ''
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const confidenceLabels: Record<string, string> = {
    alta: t('confidence.alta'),
    media: t('confidence.media'),
    baja: t('confidence.baja'),
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-6">
          {t('newPlant.title')}
        </h1>

        {/* Image Upload Section */}
        <div className="mb-6">
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleCameraCapture}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,.heic,.heif"
            className="hidden"
          />

          {showCamera && (
            <CameraCapture
              onCapture={(file) => {
                setShowCamera(false)
                processImage(file)
              }}
              onClose={() => setShowCamera(false)}
              onUseFileInstead={() => {
                setShowCamera(false)
                fileInputRef.current?.click()
              }}
            />
          )}

          {!imagePreview ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${
                isDragging
                  ? 'border-botanical-500 bg-botanical-50'
                  : 'border-botanical-300 hover:border-botanical-500'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-center gap-3 mb-4">
                <button
                  onClick={handleTakePhoto}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-botanical-600 text-white rounded-xl hover:bg-botanical-700 transition-colors font-medium"
                >
                  {t('newPlant.takePhoto')}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-botanical-300 text-botanical-700 rounded-xl hover:bg-botanical-50 transition-colors font-medium"
                >
                  {t('newPlant.selectFile')}
                </button>
              </div>
              <p className="text-sm text-gray-500">
                {isDragging ? t('newPlant.dropImage') : t('newPlant.dragImage')}
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                onClick={resetAll}
                className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-md hover:bg-white"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Text Identification Section */}
        {!imagePreview && (
          <div className="mb-8 text-center">
            <p className="text-sm text-gray-500 mb-3">{t('newPlant.cantRecognize')}</p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="text"
                value={plantNameInput}
                onChange={(e) => setPlantNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTextIdentification()}
                placeholder={t('newPlant.searchPlaceholder')}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent text-sm"
                disabled={isIdentifyingByName}
              />
              <button
                onClick={handleTextIdentification}
                disabled={isIdentifyingByName || !plantNameInput.trim()}
                className="px-5 py-3 bg-botanical-600 text-white rounded-xl hover:bg-botanical-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isIdentifyingByName ? '...' : t('newPlant.searching')}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isIdentifying && (
          <div className="bg-botanical-50 border border-botanical-200 rounded-2xl p-6 mb-6 text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-lg font-medium text-botanical-800">
              {t('newPlant.identifying')}
            </p>
            <p className="text-sm text-botanical-600 mt-1">
              {t('newPlant.analyzing')}
            </p>
          </div>
        )}

        {/* Loading State for Text Identification */}
        {isIdentifyingByName && (
          <div className="bg-botanical-50 border border-botanical-200 rounded-2xl p-6 mb-6 text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-lg font-medium text-botanical-800">
              {t('newPlant.searchingInfo', { name: plantNameInput })}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Identification Result */}
        {identification && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-600 font-semibold">{t('newPlant.identified')}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  identification.confidence === 'alta'
                    ? 'bg-green-200 text-green-800'
                    : identification.confidence === 'media'
                    ? 'bg-yellow-200 text-yellow-800'
                    : 'bg-orange-200 text-orange-800'
                }`}
              >
                {t('newPlant.confidence', { level: confidenceLabels[identification.confidence] || identification.confidence })}
              </span>
            </div>
            <p className="text-sm text-green-700">
              {identification.common_name} ({identification.scientific_name})
            </p>
            {existingSpecies && (
              <p className="text-sm text-green-800 mt-2 flex items-center gap-1">
                <span>📚</span> {t('newPlant.speciesExists')}
              </p>
            )}
          </div>
        )}

        {/* Form */}
        {(imagePreview || identification) && !isIdentifying && !isIdentifyingByName && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('newPlant.personalName')}
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('newPlant.personalNamePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="commonName" className="block text-sm font-medium text-gray-700 mb-1">
                {t('newPlant.commonName')}
              </label>
              <input
                type="text"
                id="commonName"
                value={commonName}
                onChange={(e) => setCommonName(e.target.value)}
                placeholder={t('newPlant.commonNamePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="scientificName" className="block text-sm font-medium text-gray-700 mb-1">
                {t('newPlant.scientificName')}
              </label>
              <input
                type="text"
                id="scientificName"
                value={scientificName}
                onChange={(e) => setScientificName(e.target.value)}
                placeholder={t('newPlant.scientificNamePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent italic"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('newPlant.plantType')}
                </label>
                <select
                  id="type"
                  value={plantType}
                  onChange={(e) => setPlantType(e.target.value as PlantType)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent"
                >
                  {(Object.keys(plantTypeLabels) as PlantType[]).map((pt) => (
                    <option key={pt} value={pt}>
                      {plantTypeLabels[pt]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="light" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('newPlant.lightType')}
                </label>
                <select
                  id="light"
                  value={lightType}
                  onChange={(e) => setLightType(e.target.value as LightType)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent"
                >
                  {(Object.keys(lightTypeLabels) as LightType[]).map((lt) => (
                    <option key={lt} value={lt}>
                      {lightTypeLabels[lt]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="waterDays" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('newPlant.waterDays')}
                </label>
                <input
                  type="number"
                  id="waterDays"
                  value={waterEveryDays}
                  onChange={(e) => setWaterEveryDays(parseInt(e.target.value) || 1)}
                  min={1}
                  max={30}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="rarity" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('newPlant.rarity')}
                </label>
                <select
                  id="rarity"
                  value={rarity}
                  onChange={(e) => setRarity(e.target.value as Rarity)}
                  disabled={!!existingSpecies}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                >
                  {(Object.keys(rarityLabels) as Rarity[]).map((r) => (
                    <option key={r} value={r}>
                      {rarityLabels[r]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="story" className="block text-sm font-medium text-gray-700 mb-1">
                {t('newPlant.story')}
              </label>
              <textarea
                id="story"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                disabled={!!existingSpecies}
                placeholder={t('newPlant.storyPlaceholder')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent resize-none text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
              {existingSpecies && (
                <p className="text-xs text-gray-500 mt-1">{t('newPlant.speciesLocked')}</p>
              )}
            </div>

            {tips.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('newPlant.careTips')}
                </label>
                <div className="space-y-2">
                  {tips.map((tip, index) => (
                    <input
                      key={index}
                      type="text"
                      value={tip}
                      onChange={(e) => handleTipChange(index, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent text-sm"
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-botanical-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-botanical-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="loading-spinner"></span>
                  {t('newPlant.saving')}
                </span>
              ) : (
                t('newPlant.savePlant')
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
