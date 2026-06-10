import { NextRequest, NextResponse } from 'next/server'
import { generateContextualTip } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plantName, commonName, locale } = body

    if (!plantName) {
      return NextResponse.json(
        { error: locale === 'en' ? 'Plant name required' : 'Se requiere nombre de planta' },
        { status: 400 }
      )
    }

    const tip = await generateContextualTip(plantName, commonName || '', locale || 'es')

    return NextResponse.json({ tip })
  } catch (error) {
    console.error('Error generating tip:', error)
    return NextResponse.json(
      { error: 'Error al generar tip' },
      { status: 500 }
    )
  }
}
