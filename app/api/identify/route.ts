import { NextRequest, NextResponse } from 'next/server'
import { identifyPlant } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File | null
    const locale = (formData.get('locale') as string) || 'es'

    if (!image) {
      return NextResponse.json(
        { error: locale === 'en' ? 'No image provided' : 'No se proporcionó imagen' },
        { status: 400 }
      )
    }

    // Get media type from file
    const mediaType = image.type || 'image/jpeg'

    // Claude Vision solo acepta estos formatos; los HEIC se convierten en el
    // cliente, pero validamos también aquí por si llega algo directo a la API
    const SUPPORTED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!SUPPORTED_MEDIA_TYPES.includes(mediaType)) {
      return NextResponse.json(
        {
          error:
            locale === 'en'
              ? 'Unsupported image format. Please use JPG, PNG, WebP or GIF.'
              : 'Formato de imagen no soportado. Usa JPG, PNG, WebP o GIF.',
        },
        { status: 415 }
      )
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Call Claude Vision to identify the plant
    const identification = await identifyPlant(base64Image, mediaType, locale)

    return NextResponse.json(identification)
  } catch (error) {
    console.error('Error identifying plant:', error)

    if (error instanceof Error && error.message === 'No se pudo identificar la planta') {
      return NextResponse.json(
        { error: 'No se pudo identificar la planta' },
        { status: 422 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
