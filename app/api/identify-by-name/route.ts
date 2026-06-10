import { NextRequest, NextResponse } from 'next/server'
import { identifyPlantByName } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const { name, locale } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: locale === 'en' ? 'Plant name required' : 'Nombre de planta requerido' },
        { status: 400 }
      )
    }

    const identification = await identifyPlantByName(name.trim(), locale || 'es')
    return NextResponse.json(identification)
  } catch (error) {
    console.error('Error identifying plant by name:', error)

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
