'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase, uploadImage } from '@/lib/supabase'
import { PlantIdentification } from '@/lib/claude'
import { PlantType, LightType, PLANT_TYPE_LABELS, LIGHT_TYPE_LABELS } from '@/types'

export default function NewPlantPage() {
  const router = useRouter()
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

  // Form state
  const [name, setName] = useState('')
  const [commonName, setCommonName] = useState('')
  const [scientificName, setScientificName] = useState('')
  const [plantType, setPlantType] = useState<PlantType>('otro')
  const [lightType, setLightType] = useState<LightType>('sol_pleno')
  const [waterEveryDays, setWaterEveryDays] = useState(3)
  const [tips, setTips] = useState<string[]>([])

  const processImage = async (file: File) => {
    setImageFile(file)
    setError(null)
    setIdentification(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Identify plant with AI
    setIsIdentifying(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/identify', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al identificar la planta')
      }

      const result: PlantIdentification = await response.json()
      setIdentification(result)

      // Pre-fill form
      setCommonName(result.common_name)
      setScientificName(result.scientific_name)
      setPlantType(result.type)
      setLightType(result.light_type)
      setWaterEveryDays(result.water_every_days)
      setTips(result.tips)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al identificar la planta')
    } finally {
      setIsIdentifying(false)
    }
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImage(file)
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
    if (file && file.type.startsWith('image/')) {
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
        body: JSON.stringify({ name: plantNameInput }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al identificar la planta')
      }

      const result: PlantIdentification = await response.json()
      setIdentification(result)
      setCommonName(result.common_name)
      setScientificName(result.scientific_name)
      setPlantType(result.type)
      setLightType(result.light_type)
      setWaterEveryDays(result.water_every_days)
      setTips(result.tips)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al identificar la planta')
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
      setError('El nombre de la planta es requerido')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      let imageUrl = null

      // Upload image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      // Insert plant into database
      const { data, error: insertError } = await supabase
        .from('plants')
        .insert({
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

      // Redirect to plants page
      router.push('/plants')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la planta')
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
    if (cameraInputRef.current) cameraInputRef.current.value = ''
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-6">
          Nueva planta
        </h1>

        {/* Image Upload Section */}
        <div className="mb-6">
          {/* Hidden file inputs */}
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
            accept="image/*"
            className="hidden"
          />

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
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-botanical-600 text-white rounded-xl hover:bg-botanical-700 transition-colors font-medium"
                >
                  Tomar foto
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-botanical-300 text-botanical-700 rounded-xl hover:bg-botanical-50 transition-colors font-medium"
                >
                  Seleccionar archivo
                </button>
              </div>
              <p className="text-sm text-gray-500">
                {isDragging ? 'Suelta la imagen aquí' : 'o arrastra una imagen aquí'}
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Vista previa"
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
            <p className="text-sm text-gray-500 mb-3">¿No reconoces tu planta? Escríbela:</p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="text"
                value={plantNameInput}
                onChange={(e) => setPlantNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTextIdentification()}
                placeholder="Ej: Rosa, Lavanda, Suculenta..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent text-sm"
                disabled={isIdentifyingByName}
              />
              <button
                onClick={handleTextIdentification}
                disabled={isIdentifyingByName || !plantNameInput.trim()}
                className="px-5 py-3 bg-botanical-600 text-white rounded-xl hover:bg-botanical-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isIdentifyingByName ? '...' : 'Buscar'}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isIdentifying && (
          <div className="bg-botanical-50 border border-botanical-200 rounded-2xl p-6 mb-6 text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-lg font-medium text-botanical-800">
              Identificando tu planta...
            </p>
            <p className="text-sm text-botanical-600 mt-1">
              La IA está analizando la foto
            </p>
          </div>
        )}

        {/* Loading State for Text Identification */}
        {isIdentifyingByName && (
          <div className="bg-botanical-50 border border-botanical-200 rounded-2xl p-6 mb-6 text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-lg font-medium text-botanical-800">
              Buscando información sobre {plantNameInput}...
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
              <span className="text-green-600 font-semibold">Identificación completada</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  identification.confidence === 'alta'
                    ? 'bg-green-200 text-green-800'
                    : identification.confidence === 'media'
                    ? 'bg-yellow-200 text-yellow-800'
                    : 'bg-orange-200 text-orange-800'
                }`}
              >
                Confianza: {identification.confidence}
              </span>
            </div>
            <p className="text-sm text-green-700">
              {identification.common_name} ({identification.scientific_name})
            </p>
          </div>
        )}

        {/* Form */}
        {(imagePreview || identification) && !isIdentifying && !isIdentifyingByName && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre personal *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Mi rosita del balcón"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent"
                required
              />
            </div>

            {/* Common Name */}
            <div>
              <label htmlFor="commonName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre común
              </label>
              <input
                type="text"
                id="commonName"
                value={commonName}
                onChange={(e) => setCommonName(e.target.value)}
                placeholder="Ej: Rosa"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent"
              />
            </div>

            {/* Scientific Name */}
            <div>
              <label htmlFor="scientificName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre científico
              </label>
              <input
                type="text"
                id="scientificName"
                value={scientificName}
                onChange={(e) => setScientificName(e.target.value)}
                placeholder="Ej: Rosa gallica"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent italic"
              />
            </div>

            {/* Type and Light */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de planta
                </label>
                <select
                  id="type"
                  value={plantType}
                  onChange={(e) => setPlantType(e.target.value as PlantType)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent"
                >
                  {(Object.keys(PLANT_TYPE_LABELS) as PlantType[]).map((t) => (
                    <option key={t} value={t}>
                      {PLANT_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="light" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de luz
                </label>
                <select
                  id="light"
                  value={lightType}
                  onChange={(e) => setLightType(e.target.value as LightType)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent"
                >
                  {(Object.keys(LIGHT_TYPE_LABELS) as LightType[]).map((l) => (
                    <option key={l} value={l}>
                      {LIGHT_TYPE_LABELS[l]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Water Frequency */}
            <div>
              <label htmlFor="waterDays" className="block text-sm font-medium text-gray-700 mb-1">
                Regar cada (días)
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

            {/* Tips */}
            {tips.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tips de cuidado
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-botanical-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-botanical-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="loading-spinner"></span>
                  Guardando planta...
                </span>
              ) : (
                'Guardar planta'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
