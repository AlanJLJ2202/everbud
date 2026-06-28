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
  rarity: 'comun' | 'poco_comun' | 'rara' | 'muy_rara' | 'legendaria'
  story: string
  family: string
  origin: string
  confidence: 'alta' | 'media' | 'baja'
  bbox?: { x: number; y: number; w: number; h: number }
}

const VALID_RARITIES = ['comun', 'poco_comun', 'rara', 'muy_rara', 'legendaria']

function normalizeIdentification(result: PlantIdentification): PlantIdentification {
  if (!result.rarity || !VALID_RARITIES.includes(result.rarity)) {
    result.rarity = 'comun'
  }
  result.story = result.story || ''
  result.family = result.family || ''
  result.origin = result.origin || ''
  return result
}

const localeInstructions: Record<string, string> = {
  en: 'Respond in English. The common_name and tips must be in English.',
  es: 'Responde en español. El common_name y los tips deben estar en español.',
}

export async function identifyPlant(base64Image: string, mediaType: string, locale: string = 'es'): Promise<PlantIdentification> {
  const langInstruction = localeInstructions[locale] || localeInstructions.es

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1600,
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

${langInstruction}

El JSON debe tener exactamente estas keys:
{
  "common_name": "nombre común de la planta",
  "scientific_name": "nombre científico",
  "type": "uno de: frutal | floral | suculenta | aromatica | otro",
  "light_type": "uno de: sol_pleno | media_sombra | sombra",
  "water_every_days": número entero de días entre riegos,
  "tips": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"],
  "rarity": "uno de: comun | poco_comun | rara | muy_rara | legendaria",
  "story": "historia breve de la especie (3-4 frases): origen, curiosidades, usos o significado cultural",
  "family": "familia botánica (ej. Rosaceae)",
  "origin": "región geográfica de origen",
  "confidence": "alta | media | baja"
}

IMPORTANTE: Los valores de "type", "light_type", "rarity" y "confidence" DEBEN estar en español (son valores del sistema). Solo "common_name", "tips", "story" y "origin" deben estar en el idioma indicado.

Para "rarity" evalúa qué tan común es la especie como planta de cultivo doméstico: comun (se ve en cualquier casa), poco_comun, rara, muy_rara, legendaria (extremadamente difícil de conseguir o en peligro).

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

  let jsonText = content.text.trim()

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

    if (!result.common_name || !result.type || !result.light_type || !result.water_every_days) {
      throw new Error('Missing required fields in identification result')
    }

    if (!result.tips || !Array.isArray(result.tips)) {
      result.tips = []
    }

    return normalizeIdentification(result)
  } catch (parseError) {
    console.error('Failed to parse Claude response:', jsonText)
    throw new Error('No se pudo identificar la planta')
  }
}

export async function identifyPlantByName(plantName: string, locale: string = 'es'): Promise<PlantIdentification> {
  const langInstruction = localeInstructions[locale] || localeInstructions.es

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1600,
    messages: [
      {
        role: 'user',
        content: `Eres un botánico experto. Proporciona información detallada sobre la planta "${plantName}". Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin backticks.

${langInstruction}

El JSON debe tener exactamente estas keys:
{
  "common_name": "nombre común de la planta",
  "scientific_name": "nombre científico",
  "type": "uno de: frutal | floral | suculenta | aromatica | otro",
  "light_type": "uno de: sol_pleno | media_sombra | sombra",
  "water_every_days": número entero de días entre riegos,
  "tips": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"],
  "rarity": "uno de: comun | poco_comun | rara | muy_rara | legendaria",
  "story": "historia breve de la especie (3-4 frases): origen, curiosidades, usos o significado cultural",
  "family": "familia botánica (ej. Rosaceae)",
  "origin": "región geográfica de origen",
  "confidence": "alta"
}

IMPORTANTE: Los valores de "type", "light_type", "rarity" y "confidence" DEBEN estar en español (son valores del sistema). Solo "common_name", "tips", "story" y "origin" deben estar en el idioma indicado.

Para "rarity" evalúa qué tan común es la especie como planta de cultivo doméstico: comun (se ve en cualquier casa), poco_comun, rara, muy_rara, legendaria (extremadamente difícil de conseguir o en peligro).

Si no estás seguro de la planta, usa confidence: "media" o "baja". Los tips deben ser prácticos, cortos (máx 15 palabras cada uno).`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  let jsonText = content.text.trim()

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

    if (!result.common_name || !result.type || !result.light_type || !result.water_every_days) {
      throw new Error('Missing required fields in identification result')
    }

    if (!result.tips || !Array.isArray(result.tips)) {
      result.tips = []
    }

    return normalizeIdentification(result)
  } catch (parseError) {
    console.error('Failed to parse Claude response:', jsonText)
    throw new Error('No se pudo identificar la planta')
  }
}

export async function identifyMultiplePlants(base64Image: string, mediaType: string, locale: string = 'es'): Promise<PlantIdentification[]> {
  const langInstruction = localeInstructions[locale] || localeInstructions.es

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
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
            text: `Eres un botánico experto. Analiza esta foto e identifica TODAS las plantas visibles, incluso si son difíciles de distinguir. Haz el máximo esfuerzo para encontrarlas todas.

${langInstruction}

Responde ÚNICAMENTE con un array JSON válido (sin texto adicional, sin markdown, sin backticks). Si solo hay una planta, responde con un array de un elemento.

Cada elemento del array debe tener exactamente estas keys:
{
  "common_name": "nombre común de la planta",
  "scientific_name": "nombre científico",
  "type": "uno de: frutal | floral | suculenta | aromatica | otro",
  "light_type": "uno de: sol_pleno | media_sombra | sombra",
  "water_every_days": número entero de días entre riegos,
  "tips": ["tip 1", "tip 2", "tip 3"],
  "rarity": "uno de: comun | poco_comun | rara | muy_rara | legendaria",
  "story": "historia breve de la especie (2-3 frases): origen, curiosidades o usos",
  "family": "familia botánica (ej. Rosaceae)",
  "origin": "región geográfica de origen",
  "confidence": "alta | media | baja",
  "bbox": {"x": fracción_0_a_1_borde_izquierdo, "y": fracción_0_a_1_borde_superior, "w": fracción_0_a_1_ancho, "h": fracción_0_a_1_alto}
}

IMPORTANTE: Los valores de "type", "light_type", "rarity" y "confidence" DEBEN estar en español. Solo "common_name", "tips", "story" y "origin" deben estar en el idioma indicado.

Para "rarity" evalúa qué tan común es como planta de cultivo doméstico. Los tips deben ser prácticos y cortos (máx 15 palabras cada uno). Si no puedes identificar una planta con certeza, usa confidence "baja" y da tu mejor estimación.

Para "bbox" indica las coordenadas normalizadas (0 a 1) del rectángulo mínimo que encierra a cada planta INCLUYENDO su maceta o contenedor, pero EXCLUYENDO el suelo, la pared y cualquier espacio vacío alrededor. El borde inferior del bbox debe coincidir con la base de la maceta, no con el suelo debajo. Sé conservador: es mejor que el bbox sea ligeramente pequeño a que incluya área vacía. x=0 es el borde izquierdo de la imagen, y=0 es el borde superior.`,
          },
        ],
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  let jsonText = content.text.trim()
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
    const results = JSON.parse(jsonText)
    if (!Array.isArray(results) || results.length === 0) {
      throw new Error('Expected non-empty array')
    }
    return (results as PlantIdentification[]).map(normalizeIdentification)
  } catch (parseError) {
    console.error('Failed to parse Claude multi-plant response:', jsonText)
    throw new Error('No se pudo identificar las plantas')
  }
}

export async function generateContextualTip(plantName: string, commonName: string, locale: string = 'es'): Promise<string> {
  const langInstruction = locale === 'en'
    ? 'Respond in English. Maximum 15 words.'
    : 'Responde en español. Máximo 15 palabras.'

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Dame un tip de cuidado contextual y útil para la planta "${plantName}" (nombre común: ${commonName}). 
Responde ÚNICAMENTE con el tip, sin texto adicional. ${langInstruction}`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  return content.text.trim()
}
