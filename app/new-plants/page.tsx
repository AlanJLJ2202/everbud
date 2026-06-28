'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, uploadImage } from '@/lib/supabase'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { PlantIdentification } from '@/lib/claude'
import { prepareImageForUpload, ImageProcessingError } from '@/lib/image'
import CameraCapture from '@/components/CameraCapture'
import { Species } from '@/types'

type Phase = 'upload' | 'identifying' | 'review' | 'saving' | 'done'

interface PlantItem {
  key: string
  identification: PlantIdentification
  nickname: string
  selected: boolean
  existingSpecies: Species | null
  status: 'pending' | 'saving' | 'saved' | 'error'
  color: string
  cropDataUrl?: string
}

const TYPE_EMOJI: Record<string, string> = {
  frutal: '🍊',
  floral: '🌸',
  suculenta: '🌵',
  aromatica: '🌿',
  otro: '🪴',
}

const LIGHT_ICON: Record<string, string> = {
  sol_pleno: '🌞',
  media_sombra: '🌤',
  sombra: '🌑',
}

const BBOX_COLORS = [
  '#16a34a', '#2563eb', '#dc2626', '#d97706',
  '#7c3aed', '#0891b2', '#db2777', '#65a30d',
]

async function cropImageRegion(
  imageDataUrl: string,
  bbox: { x: number; y: number; w: number; h: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('No canvas context'))

      const iw = img.naturalWidth
      const ih = img.naturalHeight

      // 5% padding so the plant doesn't touch the edges
      const padX = bbox.w * iw * 0.05
      const padY = bbox.h * ih * 0.05

      const sx = Math.max(0, bbox.x * iw - padX)
      const sy = Math.max(0, bbox.y * ih - padY)
      const sw = Math.min(iw - sx, bbox.w * iw + padX * 2)
      const sh = Math.min(ih - sy, bbox.h * ih + padY * 2)

      canvas.width = Math.round(sw)
      canvas.height = Math.round(sh)
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = imageDataUrl
  })
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new File([bytes], filename, { type: mime })
}

export default function NewPlantsPage() {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<Phase>('upload')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [plants, setPlants] = useState<PlantItem[]>([])
  const [savingCurrent, setSavingCurrent] = useState(0)
  const [savingTotal, setSavingTotal] = useState(0)
  const [savedCount, setSavedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const imageErrorMessages: Record<string, string> = {
    unsupported_format: t('newPlant.errorUnsupportedFormat'),
    heic_conversion_failed: t('newPlant.errorHeicConversion'),
    file_too_large: t('newPlant.errorFileTooLarge'),
  }

  const processImage = async (rawFile: File) => {
    setError(null)
    setPhase('identifying')

    let file: File
    try {
      file = await prepareImageForUpload(rawFile)
    } catch (err) {
      setPhase('upload')
      setError(
        err instanceof ImageProcessingError
          ? imageErrorMessages[err.code]
          : t('newPlants.errorIdentify')
      )
      return
    }

    // Read to data URL (needed for Canvas cropping later)
    const imageDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    setImagePreview(imageDataUrl)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('locale', locale)

      const response = await fetch('/api/identify-multiple', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t('newPlants.errorIdentify'))
      }

      const results: PlantIdentification[] = await response.json()

      // Fetch species data and compute crops in parallel
      const [speciesResults, cropUrls] = await Promise.all([
        Promise.all(
          results.map(async (r) => {
            if (!r.scientific_name?.trim()) return null
            const { data } = await supabase
              .from('species')
              .select('*')
              .ilike('scientific_name', r.scientific_name.trim())
              .maybeSingle()
            return (data as Species | null) || null
          })
        ),
        Promise.all(
          results.map(async (r) => {
            if (!r.bbox) return undefined
            try {
              return await cropImageRegion(imageDataUrl, r.bbox)
            } catch {
              return undefined
            }
          })
        ),
      ])

      setPlants(
        results.map((r, i) => ({
          key: crypto.randomUUID(),
          identification: r,
          nickname: r.common_name,
          selected: true,
          existingSpecies: speciesResults[i],
          status: 'pending',
          color: BBOX_COLORS[i % BBOX_COLORS.length],
          cropDataUrl: cropUrls[i],
        }))
      )
      setPhase('review')
    } catch (err) {
      setPhase('upload')
      setImagePreview(null)
      setError(err instanceof Error ? err.message : t('newPlants.errorIdentify'))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processImage(file)
  }

  const handleTakePhoto = () => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
    if (isTouchDevice || !navigator.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click()
    } else {
      setShowCamera(true)
    }
  }

  const toggleAll = () => {
    const allSelected = plants.every((p) => p.selected)
    setPlants((prev) => prev.map((p) => ({ ...p, selected: !allSelected })))
  }

  const togglePlant = (key: string) => {
    setPlants((prev) =>
      prev.map((p) => (p.key === key ? { ...p, selected: !p.selected } : p))
    )
  }

  const setNickname = (key: string, value: string) => {
    setPlants((prev) =>
      prev.map((p) => (p.key === key ? { ...p, nickname: value } : p))
    )
  }

  const handleSaveAll = async () => {
    const selected = plants.filter((p) => p.selected)
    if (selected.length === 0) {
      setError(t('newPlants.noneSelected'))
      return
    }

    setPhase('saving')
    setError(null)
    setSavingTotal(selected.length)
    let saved = 0

    for (let i = 0; i < selected.length; i++) {
      setSavingCurrent(i + 1)
      const item = selected[i]
      const r = item.identification

      try {
        // Upload individual crop if available
        let imageUrl: string | null = null
        if (item.cropDataUrl) {
          try {
            const cropFile = dataUrlToFile(item.cropDataUrl, `${item.key.slice(0, 8)}.jpg`)
            imageUrl = await uploadImage(cropFile)
          } catch {
            // Continue without image if upload fails
          }
        }

        let speciesId: string | null = item.existingSpecies?.id ?? null

        if (!speciesId && r.scientific_name?.trim()) {
          const { data: newSpecies, error: speciesError } = await supabase
            .from('species')
            .insert({
              scientific_name: r.scientific_name.trim(),
              common_name: r.common_name.trim() || null,
              type: r.type,
              light_type: r.light_type,
              water_every_days: r.water_every_days,
              tips: r.tips.filter((tip) => tip.trim()),
              rarity: r.rarity,
              story: r.story?.trim() || null,
              family: r.family?.trim() || null,
              origin: r.origin?.trim() || null,
              image_url: imageUrl,
              created_by: user!.id,
            })
            .select()
            .single()

          if (speciesError) {
            if (speciesError.code === '23505') {
              const { data: raced } = await supabase
                .from('species')
                .select('id')
                .ilike('scientific_name', r.scientific_name.trim())
                .maybeSingle()
              speciesId = raced?.id ?? null
            } else {
              throw new Error(speciesError.message)
            }
          } else {
            speciesId = newSpecies.id
          }
        }

        const { error: insertError } = await supabase.from('plants').insert({
          user_id: user!.id,
          species_id: speciesId,
          name: item.nickname.trim() || r.common_name,
          common_name: r.common_name.trim() || null,
          scientific_name: r.scientific_name?.trim() || null,
          type: r.type,
          light_type: r.light_type,
          water_every_days: r.water_every_days,
          tips: r.tips.filter((tip) => tip.trim()),
          image_url: imageUrl,
          status: 'alive',
        })

        if (insertError) throw new Error(insertError.message)

        saved++
        setPlants((prev) =>
          prev.map((p) => (p.key === item.key ? { ...p, status: 'saved' } : p))
        )
      } catch {
        setPlants((prev) =>
          prev.map((p) => (p.key === item.key ? { ...p, status: 'error' } : p))
        )
      }
    }

    setSavedCount(saved)
    setPhase('done')
  }

  const resetAll = () => {
    setPhase('upload')
    setImagePreview(null)
    setPlants([])
    setError(null)
    setSavedCount(0)
    setSavingCurrent(0)
    setSavingTotal(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const selectedCount = plants.filter((p) => p.selected).length
  const allSelected = plants.length > 0 && plants.every((p) => p.selected)
  const hasBboxes = plants.some((p) => p.identification.bbox)

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            {t('newPlants.title')}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{t('newPlants.subtitle')}</p>
        </div>

        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileSelect}
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

        {/* Upload phase */}
        {phase === 'upload' && (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${
                isDragging
                  ? 'border-botanical-500 bg-botanical-50'
                  : 'border-botanical-300 hover:border-botanical-500'
              }`}
            >
              <p className="text-4xl mb-4">🌿🌸🌵</p>
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

            <p className="text-center text-sm text-gray-400 mt-6">
              {t('newPlants.singlePlantLabel')}{' '}
              <Link href="/new-plant" className="text-botanical-600 hover:underline">
                {t('newPlants.singlePlantLink')}
              </Link>
            </p>
          </>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mt-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Identifying phase */}
        {phase === 'identifying' && (
          <div className="mt-4">
            {imagePreview && (
              <div className="w-full rounded-2xl overflow-hidden mb-6">
                <img src={imagePreview} alt="Preview" className="w-full h-auto block" />
              </div>
            )}
            <div className="bg-botanical-50 border border-botanical-200 rounded-2xl p-8 text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-lg font-medium text-botanical-800">
                {t('newPlants.identifying')}
              </p>
              <p className="text-sm text-botanical-600 mt-1">
                {t('newPlants.analyzingDesc')}
              </p>
            </div>
          </div>
        )}

        {/* Review phase */}
        {phase === 'review' && (
          <div className="mt-4">
            {/* Garden image with bbox overlays */}
            {imagePreview && (
              <div className="relative w-full mb-6 rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={imagePreview}
                  alt="Garden preview"
                  className="w-full h-auto block"
                />
                {hasBboxes && plants.map((item, idx) => {
                  const bb = item.identification.bbox
                  if (!bb) return null
                  return (
                    <div
                      key={item.key}
                      style={{
                        position: 'absolute',
                        left: `${bb.x * 100}%`,
                        top: `${bb.y * 100}%`,
                        width: `${bb.w * 100}%`,
                        height: `${bb.h * 100}%`,
                        border: `2px solid ${item.color}`,
                        borderRadius: '6px',
                        opacity: item.selected ? 1 : 0.35,
                        transition: 'opacity 0.2s',
                        pointerEvents: 'none',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: '-1px',
                          left: '-1px',
                          background: item.color,
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          lineHeight: '18px',
                        }}
                      >
                        {idx + 1}
                      </span>
                    </div>
                  )
                })}
                <button
                  onClick={resetAll}
                  className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-md hover:bg-white text-sm"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-800">
                {t('newPlants.foundPlants', { count: plants.length })}
              </p>
              <button
                onClick={toggleAll}
                className="text-sm text-botanical-600 hover:underline"
              >
                {allSelected ? t('newPlants.deselectAll') : t('newPlants.selectAll')}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {plants.map((item, idx) => {
                const r = item.identification
                const confidenceColor =
                  r.confidence === 'alta'
                    ? 'bg-green-100 text-green-800'
                    : r.confidence === 'media'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-orange-100 text-orange-800'

                return (
                  <div
                    key={item.key}
                    className={`rounded-2xl border-2 p-4 transition-all ${
                      item.selected
                        ? 'bg-white shadow-sm'
                        : 'bg-gray-50 opacity-60'
                    }`}
                    style={{ borderColor: item.selected ? item.color : '#e5e7eb' }}
                  >
                    {/* Header: crop/emoji + info + checkbox */}
                    <div className="flex items-start gap-3 mb-3">
                      {/* Crop thumbnail or emoji */}
                      {item.cropDataUrl ? (
                        <img
                          src={item.cropDataUrl}
                          alt={r.common_name}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-3xl">
                          {TYPE_EMOJI[r.type] || '🪴'}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        {/* Number badge + name */}
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: item.color }}
                          >
                            {idx + 1}
                          </span>
                          <p className="font-semibold text-gray-900 truncate text-sm">
                            {r.common_name}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 italic truncate">
                          {r.scientific_name}
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => togglePlant(item.key)}
                        className="mt-1 h-5 w-5 rounded flex-shrink-0 cursor-pointer accent-botanical-600"
                      />
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${confidenceColor}`}>
                        {t('newPlants.confidence', { level: t(`confidence.${r.confidence}`) })}
                      </span>
                      {item.existingSpecies && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {t('newPlants.existsInCatalog')}
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {LIGHT_ICON[r.light_type]} {t(`lightType.${r.light_type}`)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        💧 {r.water_every_days}d
                      </span>
                    </div>

                    {/* Nickname input */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        {t('newPlants.nickname')}
                      </label>
                      <input
                        type="text"
                        value={item.nickname}
                        onChange={(e) => setNickname(item.key, e.target.value)}
                        placeholder={t('newPlants.nicknamePlaceholder')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-botanical-500 focus:border-transparent"
                        disabled={!item.selected}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {selectedCount > 0 ? (
              <button
                onClick={handleSaveAll}
                className="w-full bg-botanical-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-botanical-700 transition-colors"
              >
                {t('newPlants.registerSelected', { count: selectedCount })}
              </button>
            ) : (
              <p className="text-center text-gray-500 text-sm mt-2">
                {t('newPlants.noneSelected')}
              </p>
            )}
          </div>
        )}

        {/* Saving phase */}
        {phase === 'saving' && (
          <div className="mt-8 bg-botanical-50 border border-botanical-200 rounded-2xl p-8 text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-lg font-medium text-botanical-800">
              {t('newPlants.saving', { current: savingCurrent, total: savingTotal })}
            </p>
            <div className="mt-4 bg-botanical-200 rounded-full h-2">
              <div
                className="bg-botanical-600 h-2 rounded-full transition-all"
                style={{ width: `${(savingCurrent / savingTotal) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Done phase */}
        {phase === 'done' && (
          <div className="mt-8 text-center">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-6">
              <p className="text-4xl mb-3">🌿</p>
              <p className="text-xl font-semibold text-green-800">
                {t('newPlants.savedAll', { count: savedCount })}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={resetAll}
                className="px-6 py-3 bg-white border border-botanical-300 text-botanical-700 rounded-xl hover:bg-botanical-50 transition-colors font-medium"
              >
                {t('newPlants.retryPhoto')}
              </button>
              <button
                onClick={() => { router.push('/plants'); router.refresh() }}
                className="px-6 py-3 bg-botanical-600 text-white rounded-xl hover:bg-botanical-700 transition-colors font-medium"
              >
                {t('newPlants.goToPlants')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
