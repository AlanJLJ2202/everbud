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
type Corner = 'tl' | 'tr' | 'bl' | 'br'

interface BBox { x: number; y: number; w: number; h: number }

interface PlantItem {
  key: string
  identification: PlantIdentification
  nickname: string
  selected: boolean
  existingSpecies: Species | null
  status: 'pending' | 'saving' | 'saved' | 'error'
  color: string
  cropDataUrl?: string
  adjustedBbox?: BBox
}

const TYPE_EMOJI: Record<string, string> = {
  frutal: '🍊', floral: '🌸', suculenta: '🌵', aromatica: '🌿', otro: '🪴',
}
const LIGHT_ICON: Record<string, string> = {
  sol_pleno: '🌞', media_sombra: '🌤', sombra: '🌑',
}
const BBOX_COLORS = [
  '#16a34a', '#2563eb', '#dc2626', '#d97706',
  '#7c3aed', '#0891b2', '#db2777', '#65a30d',
]
const CORNER_CURSOR: Record<Corner, string> = {
  tl: 'nwse-resize', tr: 'nesw-resize', bl: 'nesw-resize', br: 'nwse-resize',
}

function calculateIoU(a: BBox, b: BBox): number {
  const ax2 = a.x + a.w, ay2 = a.y + a.h
  const bx2 = b.x + b.w, by2 = b.y + b.h
  const ix1 = Math.max(a.x, b.x), iy1 = Math.max(a.y, b.y)
  const ix2 = Math.min(ax2, bx2), iy2 = Math.min(ay2, by2)
  if (ix2 < ix1 || iy2 < iy1) return 0
  const intersection = (ix2 - ix1) * (iy2 - iy1)
  const union = a.w * a.h + b.w * b.h - intersection
  return union > 0 ? intersection / union : 0
}

async function cropImageRegion(imageDataUrl: string, bbox: BBox): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('No canvas context'))
      const iw = img.naturalWidth, ih = img.naturalHeight
      const padX = bbox.w * iw * 0.04, padY = bbox.h * ih * 0.04
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
  const imageRef = useRef<HTMLImageElement>(null)
  const draggingRef = useRef<{ plantKey: string; corner: Corner } | null>(null)
  const sessionIdRef = useRef<string>(crypto.randomUUID())

  const [phase, setPhase] = useState<Phase>('upload')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [plants, setPlantsState] = useState<PlantItem[]>([])
  // Keep a ref in sync so drag closures always see current state
  const plantsRef = useRef<PlantItem[]>([])
  const setPlants = (updater: PlantItem[] | ((prev: PlantItem[]) => PlantItem[])) => {
    setPlantsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      plantsRef.current = next
      return next
    })
  }
  const [benchmarkIds, setBenchmarkIds] = useState<Record<string, string>>({})
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
    sessionIdRef.current = crypto.randomUUID()

    let file: File
    try {
      file = await prepareImageForUpload(rawFile)
    } catch (err) {
      setPhase('upload')
      setError(err instanceof ImageProcessingError ? imageErrorMessages[err.code] : t('newPlants.errorIdentify'))
      return
    }

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

      const response = await fetch('/api/identify-multiple', { method: 'POST', body: formData })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t('newPlants.errorIdentify'))
      }
      const results: PlantIdentification[] = await response.json()

      const [speciesResults, cropUrls] = await Promise.all([
        Promise.all(results.map(async (r) => {
          if (!r.scientific_name?.trim()) return null
          const { data } = await supabase
            .from('species').select('*').ilike('scientific_name', r.scientific_name.trim()).maybeSingle()
          return (data as Species | null) || null
        })),
        Promise.all(results.map(async (r) => {
          if (!r.bbox) return undefined
          try { return await cropImageRegion(imageDataUrl, r.bbox) } catch { return undefined }
        })),
      ])

      const items: PlantItem[] = results.map((r, i) => ({
        key: crypto.randomUUID(),
        identification: r,
        nickname: r.common_name,
        selected: true,
        existingSpecies: speciesResults[i],
        status: 'pending',
        color: BBOX_COLORS[i % BBOX_COLORS.length],
        cropDataUrl: cropUrls[i],
      }))

      setPlants(items)
      setPhase('review')

      // Log predictions to benchmark table (only plants that have bboxes)
      const bboxItems = items.filter(item => item.identification.bbox)
      if (bboxItems.length > 0) {
        const { data: rows } = await supabase.from('bbox_benchmark').insert(
          bboxItems.map((item, i) => ({
            user_id: user!.id,
            session_id: sessionIdRef.current,
            model: 'claude-sonnet-4-6',
            plant_index: items.indexOf(item),
            species_predicted: item.identification.scientific_name || null,
            confidence: item.identification.confidence,
            predicted_bbox: item.identification.bbox,
          }))
        ).select('id, plant_index')

        if (rows) {
          const idMap: Record<string, string> = {}
          rows.forEach(row => {
            const item = items[row.plant_index]
            if (item) idMap[item.key] = row.id
          })
          setBenchmarkIds(idMap)
        }
      }
    } catch (err) {
      setPhase('upload')
      setImagePreview(null)
      setError(err instanceof Error ? err.message : t('newPlants.errorIdentify'))
    }
  }

  // Drag handlers for corner handles
  const startDrag = (e: React.PointerEvent, plantKey: string, corner: Corner) => {
    e.preventDefault()
    e.stopPropagation()
    draggingRef.current = { plantKey, corner }

    const onMove = (ev: PointerEvent) => {
      if (!draggingRef.current || !imageRef.current) return
      const { plantKey: pk, corner: c } = draggingRef.current
      const rect = imageRef.current.getBoundingClientRect()
      const nx = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
      const ny = Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height))
      const MIN = 0.02

      setPlantsState(prev => {
        const next = prev.map(p => {
          if (p.key !== pk) return p
          const bb = { ...(p.adjustedBbox ?? p.identification.bbox ?? { x: 0, y: 0, w: 1, h: 1 }) }
          switch (c) {
            case 'tl': { const r = bb.x + bb.w, b = bb.y + bb.h; bb.x = Math.min(nx, r - MIN); bb.y = Math.min(ny, b - MIN); bb.w = r - bb.x; bb.h = b - bb.y; break }
            case 'tr': { const b = bb.y + bb.h; bb.y = Math.min(ny, b - MIN); bb.w = Math.max(MIN, nx - bb.x); bb.h = b - bb.y; break }
            case 'bl': { const r = bb.x + bb.w; bb.x = Math.min(nx, r - MIN); bb.w = r - bb.x; bb.h = Math.max(MIN, ny - bb.y); break }
            case 'br': { bb.w = Math.max(MIN, nx - bb.x); bb.h = Math.max(MIN, ny - bb.y); break }
          }
          return { ...p, adjustedBbox: bb }
        })
        plantsRef.current = next
        return next
      })
    }

    const onUp = () => {
      const pk = draggingRef.current?.plantKey
      draggingRef.current = null
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)

      if (!pk) return

      // Recompute crop and log correction to benchmark
      const item = plantsRef.current.find(p => p.key === pk)
      if (!item || !imagePreview) return

      const originalBbox = item.identification.bbox
      const adjustedBbox = item.adjustedBbox

      if (adjustedBbox) {
        // Recompute crop preview
        cropImageRegion(imagePreview, adjustedBbox)
          .then(cropUrl => {
            setPlantsState(p2 => {
              const next = p2.map(p => p.key === pk ? { ...p, cropDataUrl: cropUrl } : p)
              plantsRef.current = next
              return next
            })
          })
          .catch(() => {})

        // Update benchmark with correction + IoU
        const benchmarkId = benchmarkIds[pk]
        if (benchmarkId && originalBbox) {
          const iou = calculateIoU(originalBbox, adjustedBbox)
          supabase.from('bbox_benchmark')
            .update({ corrected_bbox: adjustedBbox, iou })
            .eq('id', benchmarkId)
            .then(() => {})
        }
      }
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processImage(file)
  }
  const handleTakePhoto = () => {
    const touch = window.matchMedia('(pointer: coarse)').matches
    if (touch || !navigator.mediaDevices?.getUserMedia) cameraInputRef.current?.click()
    else setShowCamera(true)
  }
  const toggleAll = () => {
    const all = plants.every(p => p.selected)
    setPlants(prev => prev.map(p => ({ ...p, selected: !all })))
  }
  const togglePlant = (key: string) => setPlants(prev => prev.map(p => p.key === key ? { ...p, selected: !p.selected } : p))
  const setNickname = (key: string, value: string) => setPlants(prev => prev.map(p => p.key === key ? { ...p, nickname: value } : p))

  const handleSaveAll = async () => {
    const selected = plants.filter(p => p.selected)
    if (selected.length === 0) { setError(t('newPlants.noneSelected')); return }

    setPhase('saving')
    setError(null)
    setSavingTotal(selected.length)
    let saved = 0

    for (let i = 0; i < selected.length; i++) {
      setSavingCurrent(i + 1)
      const item = selected[i]
      const r = item.identification

      try {
        let imageUrl: string | null = null
        if (item.cropDataUrl) {
          try {
            const cropFile = dataUrlToFile(item.cropDataUrl, `${item.key.slice(0, 8)}.jpg`)
            imageUrl = await uploadImage(cropFile)
          } catch { /* continue without image */ }
        }

        let speciesId: string | null = item.existingSpecies?.id ?? null
        if (!speciesId && r.scientific_name?.trim()) {
          const { data: newSpecies, error: speciesError } = await supabase
            .from('species')
            .insert({
              scientific_name: r.scientific_name.trim(),
              common_name: r.common_name.trim() || null,
              type: r.type, light_type: r.light_type,
              water_every_days: r.water_every_days,
              tips: r.tips.filter(tip => tip.trim()),
              rarity: r.rarity,
              story: r.story?.trim() || null,
              family: r.family?.trim() || null,
              origin: r.origin?.trim() || null,
              image_url: imageUrl,
              created_by: user!.id,
            })
            .select().single()

          if (speciesError) {
            if (speciesError.code === '23505') {
              const { data: raced } = await supabase.from('species').select('id')
                .ilike('scientific_name', r.scientific_name.trim()).maybeSingle()
              speciesId = raced?.id ?? null
            } else throw new Error(speciesError.message)
          } else speciesId = newSpecies.id
        }

        const { error: insertError } = await supabase.from('plants').insert({
          user_id: user!.id, species_id: speciesId,
          name: item.nickname.trim() || r.common_name,
          common_name: r.common_name.trim() || null,
          scientific_name: r.scientific_name?.trim() || null,
          type: r.type, light_type: r.light_type,
          water_every_days: r.water_every_days,
          tips: r.tips.filter(tip => tip.trim()),
          image_url: imageUrl, status: 'alive',
        })
        if (insertError) throw new Error(insertError.message)

        // Mark benchmark row as registered
        const benchmarkId = benchmarkIds[item.key]
        if (benchmarkId) {
          supabase.from('bbox_benchmark').update({ registered: true }).eq('id', benchmarkId).then(() => {})
        }

        saved++
        setPlants(prev => prev.map(p => p.key === item.key ? { ...p, status: 'saved' } : p))
      } catch {
        setPlants(prev => prev.map(p => p.key === item.key ? { ...p, status: 'error' } : p))
      }
    }

    setSavedCount(saved)
    setPhase('done')
  }

  const resetAll = () => {
    setPhase('upload'); setImagePreview(null); setPlants([])
    setError(null); setSavedCount(0); setSavingCurrent(0); setSavingTotal(0)
    setBenchmarkIds({})
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const selectedCount = plants.filter(p => p.selected).length
  const allSelected = plants.length > 0 && plants.every(p => p.selected)
  const hasBboxes = plants.some(p => p.identification.bbox)

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900">{t('newPlants.title')}</h1>
            <p className="text-gray-500 mt-1 text-sm">{t('newPlants.subtitle')}</p>
          </div>
          <Link href="/benchmark" className="text-xs text-gray-400 hover:text-botanical-600 mt-1">
            📊 Benchmark
          </Link>
        </div>

        <input type="file" ref={cameraInputRef} onChange={handleFileSelect} accept="image/*" capture="environment" className="hidden" />
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,.heic,.heif" className="hidden" />

        {showCamera && (
          <CameraCapture
            onCapture={file => { setShowCamera(false); processImage(file) }}
            onClose={() => setShowCamera(false)}
            onUseFileInstead={() => { setShowCamera(false); fileInputRef.current?.click() }}
          />
        )}

        {/* Upload */}
        {phase === 'upload' && (
          <>
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={e => { e.preventDefault(); setIsDragging(false) }}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${isDragging ? 'border-botanical-500 bg-botanical-50' : 'border-botanical-300 hover:border-botanical-500'}`}
            >
              <p className="text-4xl mb-4">🌿🌸🌵</p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 mb-4">
                <button onClick={handleTakePhoto} className="flex items-center justify-center gap-2 px-6 py-3 bg-botanical-600 text-white rounded-xl hover:bg-botanical-700 transition-colors font-medium">
                  {t('newPlant.takePhoto')}
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-botanical-300 text-botanical-700 rounded-xl hover:bg-botanical-50 transition-colors font-medium">
                  {t('newPlant.selectFile')}
                </button>
              </div>
              <p className="text-sm text-gray-500">{isDragging ? t('newPlant.dropImage') : t('newPlant.dragImage')}</p>
            </div>
            <p className="text-center text-sm text-gray-400 mt-6">
              {t('newPlants.singlePlantLabel')}{' '}
              <Link href="/new-plant" className="text-botanical-600 hover:underline">{t('newPlants.singlePlantLink')}</Link>
            </p>
          </>
        )}

        {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mt-4"><p className="text-red-800">{error}</p></div>}

        {/* Identifying */}
        {phase === 'identifying' && (
          <div className="mt-4">
            {imagePreview && <div className="w-full rounded-2xl overflow-hidden mb-6"><img src={imagePreview} alt="Preview" className="w-full h-auto block" /></div>}
            <div className="bg-botanical-50 border border-botanical-200 rounded-2xl p-8 text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-lg font-medium text-botanical-800">{t('newPlants.identifying')}</p>
              <p className="text-sm text-botanical-600 mt-1">{t('newPlants.analyzingDesc')}</p>
            </div>
          </div>
        )}

        {/* Review */}
        {phase === 'review' && (
          <div className="mt-4">
            {/* Garden image with draggable bbox overlays */}
            {imagePreview && (
              <div className="relative w-full mb-2 rounded-2xl overflow-hidden shadow-sm select-none">
                <img
                  ref={imageRef}
                  src={imagePreview}
                  alt="Garden preview"
                  className="w-full h-auto block"
                  draggable={false}
                />
                {hasBboxes && plants.map((item, idx) => {
                  const bb = item.adjustedBbox ?? item.identification.bbox
                  if (!bb) return null
                  return (
                    <div
                      key={item.key}
                      style={{
                        position: 'absolute',
                        left: `${bb.x * 100}%`, top: `${bb.y * 100}%`,
                        width: `${bb.w * 100}%`, height: `${bb.h * 100}%`,
                        border: `2px solid ${item.color}`,
                        borderRadius: 6,
                        opacity: item.selected ? 1 : 0.3,
                        transition: 'opacity 0.2s',
                        userSelect: 'none',
                      }}
                    >
                      {/* Number label */}
                      <span style={{
                        position: 'absolute', top: -1, left: -1,
                        background: item.color, color: 'white',
                        fontSize: 11, fontWeight: 700,
                        padding: '1px 6px', borderRadius: 3, lineHeight: '18px',
                        pointerEvents: 'none',
                      }}>
                        {idx + 1}
                      </span>

                      {/* Corner handles */}
                      {(['tl', 'tr', 'bl', 'br'] as Corner[]).map(corner => (
                        <div
                          key={corner}
                          onPointerDown={e => startDrag(e, item.key, corner)}
                          style={{
                            position: 'absolute', width: 16, height: 16,
                            borderRadius: '50%', background: 'white',
                            border: `2.5px solid ${item.color}`,
                            cursor: CORNER_CURSOR[corner],
                            touchAction: 'none',
                            ...(corner === 'tl' ? { top: -8, left: -8 }
                              : corner === 'tr' ? { top: -8, right: -8 }
                              : corner === 'bl' ? { bottom: -8, left: -8 }
                              :                   { bottom: -8, right: -8 }),
                          }}
                        />
                      ))}
                    </div>
                  )
                })}
                <button onClick={resetAll} className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-md hover:bg-white text-sm">✕</button>
              </div>
            )}

            {hasBboxes && (
              <p className="text-xs text-gray-400 text-center mb-4">{t('newPlants.adjustHint')}</p>
            )}

            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-800">{t('newPlants.foundPlants', { count: plants.length })}</p>
              <button onClick={toggleAll} className="text-sm text-botanical-600 hover:underline">
                {allSelected ? t('newPlants.deselectAll') : t('newPlants.selectAll')}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {plants.map((item, idx) => {
                const r = item.identification
                const confidenceColor = r.confidence === 'alta' ? 'bg-green-100 text-green-800'
                  : r.confidence === 'media' ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-orange-100 text-orange-800'
                const isAdjusted = !!item.adjustedBbox

                return (
                  <div
                    key={item.key}
                    className={`rounded-2xl border-2 p-4 transition-all ${item.selected ? 'bg-white shadow-sm' : 'bg-gray-50 opacity-60'}`}
                    style={{ borderColor: item.selected ? item.color : '#e5e7eb' }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {item.cropDataUrl ? (
                        <img src={item.cropDataUrl} alt={r.common_name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-3xl">
                          {TYPE_EMOJI[r.type] || '🪴'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: item.color }}>
                            {idx + 1}
                          </span>
                          <p className="font-semibold text-gray-900 truncate text-sm">{r.common_name}</p>
                        </div>
                        <p className="text-xs text-gray-500 italic truncate">{r.scientific_name}</p>
                      </div>
                      <input
                        type="checkbox" checked={item.selected}
                        onChange={() => togglePlant(item.key)}
                        className="mt-1 h-5 w-5 rounded flex-shrink-0 cursor-pointer accent-botanical-600"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${confidenceColor}`}>
                        {t('newPlants.confidence', { level: t(`confidence.${r.confidence}`) })}
                      </span>
                      {item.existingSpecies && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">{t('newPlants.existsInCatalog')}</span>
                      )}
                      {isAdjusted && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">{t('newPlants.adjusted')}</span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {LIGHT_ICON[r.light_type]} {t(`lightType.${r.light_type}`)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">💧 {r.water_every_days}d</span>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('newPlants.nickname')}</label>
                      <input
                        type="text" value={item.nickname}
                        onChange={e => setNickname(item.key, e.target.value)}
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
              <button onClick={handleSaveAll} className="w-full bg-botanical-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-botanical-700 transition-colors">
                {t('newPlants.registerSelected', { count: selectedCount })}
              </button>
            ) : (
              <p className="text-center text-gray-500 text-sm mt-2">{t('newPlants.noneSelected')}</p>
            )}
          </div>
        )}

        {/* Saving */}
        {phase === 'saving' && (
          <div className="mt-8 bg-botanical-50 border border-botanical-200 rounded-2xl p-8 text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-lg font-medium text-botanical-800">
              {t('newPlants.saving', { current: savingCurrent, total: savingTotal })}
            </p>
            <div className="mt-4 bg-botanical-200 rounded-full h-2">
              <div className="bg-botanical-600 h-2 rounded-full transition-all" style={{ width: `${(savingCurrent / savingTotal) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Done */}
        {phase === 'done' && (
          <div className="mt-8 text-center">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-6">
              <p className="text-4xl mb-3">🌿</p>
              <p className="text-xl font-semibold text-green-800">{t('newPlants.savedAll', { count: savedCount })}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={resetAll} className="px-6 py-3 bg-white border border-botanical-300 text-botanical-700 rounded-xl hover:bg-botanical-50 transition-colors font-medium">
                {t('newPlants.retryPhoto')}
              </button>
              <button onClick={() => { router.push('/plants'); router.refresh() }} className="px-6 py-3 bg-botanical-600 text-white rounded-xl hover:bg-botanical-700 transition-colors font-medium">
                {t('newPlants.goToPlants')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
