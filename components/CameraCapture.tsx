'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useLanguage } from '@/context/LanguageContext'

type CameraStatus = 'requesting' | 'active' | 'denied' | 'unavailable'

interface CameraCaptureProps {
  onCapture: (file: File) => void
  onClose: () => void
  // Fallback para que el usuario suba un archivo si negó el permiso o no hay cámara
  onUseFileInstead: () => void
}

export default function CameraCapture({ onCapture, onClose, onUseFileInstead }: CameraCaptureProps) {
  const { t } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<CameraStatus>('requesting')

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('unavailable')
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setStatus('active')
      } catch (err) {
        if (cancelled) return
        const name = err instanceof DOMException ? err.name : ''
        // NotAllowedError: el usuario negó el permiso (o la política del navegador lo bloquea)
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          setStatus('denied')
        } else {
          // NotFoundError (sin cámara), NotReadableError (cámara en uso), etc.
          setStatus('unavailable')
        }
      }
    }

    startCamera()

    return () => {
      cancelled = true
      stopStream()
    }
  }, [stopStream])

  const handleCapture = () => {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        stopStream()
        onCapture(new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' }))
      },
      'image/jpeg',
      0.92
    )
  }

  const handleClose = () => {
    stopStream()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-4 max-w-lg w-full">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg font-bold text-gray-900">
            {t('camera.title')}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            aria-label={t('common.cancel')}
          >
            ✕
          </button>
        </div>

        {status === 'requesting' && (
          <div className="py-12 text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">{t('camera.requesting')}</p>
          </div>
        )}

        {status === 'active' && (
          <>
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video mb-4">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={handleCapture}
              className="w-full bg-botanical-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-botanical-700 transition-colors"
            >
              {t('camera.capture')}
            </button>
          </>
        )}

        {(status === 'denied' || status === 'unavailable') && (
          <div className="py-8 text-center">
            <span className="text-5xl block mb-4">{status === 'denied' ? '🔒' : '📷'}</span>
            <p className="text-gray-800 font-medium mb-2">
              {status === 'denied' ? t('camera.denied') : t('camera.unavailable')}
            </p>
            {status === 'denied' && (
              <p className="text-sm text-gray-500 mb-6">{t('camera.deniedHint')}</p>
            )}
            <button
              onClick={() => {
                stopStream()
                onUseFileInstead()
              }}
              className="bg-botanical-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-botanical-700 transition-colors"
            >
              {t('camera.useFileInstead')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
