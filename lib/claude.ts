import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface PlantIdentification {
  common_name: string
  scientific_name: string
  type: 'frutal' | 'floral' | 'suculenta' | 'aromatica' | 'otro'
  light_type: 'sol_pleno' | 'media_sombra' | 'sombra'
  water_every_days: number
  tips: string[]
  confidence: 'alta' | 'media' | 'baja'
}

export async function identifyPlant(base64Image: string, mediaType: string): Promise<PlantIdentification> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: `Eres un botánico experto. Analiza esta foto de una planta y responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin backticks.

El JSON debe tener exactamente estas keys:
{
  "common_name": "nombre común de la planta en español",
  "scientific_name": "nombre científico",
  "type": "uno de: frutal | floral | suculenta | aromatica | otro",
  "light_type": "uno de: sol_pleno | media_sombra | sombra",
  "water_every_days": número entero de días entre riegos,
  "tips": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"],
  "confidence": "alta | media | baja"
}

Si no puedes identificar la planta con certeza, usa confidence: "baja" y da tu mejor estimación. Los tips deben ser prácticos, cortos (máx 15 palabras cada uno).`,
          },
        ],
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  // Extract JSON from response, handling potential markdown wrapping
  let jsonText = content.text.trim()

  // Remove markdown code block if present
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.slice(7)
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.slice(3)
  }
  if (jsonText.endsWith('```')) {
    jsonText = jsonText.slice(0, -3)
  }
  jsonText = jsonText.trim()

  try {
    const result = JSON.parse(jsonText) as PlantIdentification

    // Validate required fields
    if (!result.common_name || !result.type || !result.light_type || !result.water_every_days) {
      throw new Error('Missing required fields in identification result')
    }

    // Ensure tips array exists
    if (!result.tips || !Array.isArray(result.tips)) {
      result.tips = []
    }

    return result
  } catch (parseError) {
    console.error('Failed to parse Claude response:', jsonText)
    throw new Error('No se pudo identificar la planta')
  }
}

export async function generateContextualTip(plantName: string, commonName: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Dame un tip de cuidado contextual y útil para la planta "${plantName}" (nombre común: ${commonName}). 
Responde ÚNICAMENTE con el tip, sin texto adicional. Máximo 15 palabras.`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  return content.text.trim()
}
