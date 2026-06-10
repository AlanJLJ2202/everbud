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

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Get media type from file
    const mediaType = image.type || 'image/jpeg'

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
