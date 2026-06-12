// Validación y normalización de imágenes antes de enviarlas a /api/identify
// y a Supabase Storage. Claude Vision solo acepta JPEG, PNG, GIF y WebP, así
// que los HEIC/HEIF de iPhone se convierten a JPEG en el cliente.

export const SUPPORTED_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

export const MAX_IMAGE_BYTES = 20 * 1024 * 1024 // 20 MB

export type ImageErrorCode =
  | 'unsupported_format'
  | 'heic_conversion_failed'
  | 'file_too_large'

export class ImageProcessingError extends Error {
  code: ImageErrorCode

  constructor(code: ImageErrorCode) {
    super(code)
    this.name = 'ImageProcessingError'
    this.code = code
  }
}

// El MIME type no es confiable para HEIC: Safari reporta image/heic, pero
// Chrome/Windows suele dejar file.type vacío. Se revisa también la extensión
// y los magic bytes del contenedor ISO-BMFF ("ftypheic", "ftypmif1", etc.)
const HEIC_BRANDS = ['heic', 'heix', 'hevc', 'heim', 'heis', 'hevm', 'hevs', 'mif1', 'msf1']

export async function isHeicFile(file: File): Promise<boolean> {
  if (/^image\/hei[cf]/i.test(file.type)) return true
  if (/\.(heic|heif)$/i.test(file.name)) return true

  try {
    const header = new Uint8Array(await file.slice(0, 12).arrayBuffer())
    if (header.length < 12) return false
    const boxType = String.fromCharCode(...Array.from(header.subarray(4, 8)))
    const brand = String.fromCharCode(...Array.from(header.subarray(8, 12)))
    return boxType === 'ftyp' && HEIC_BRANDS.includes(brand.toLowerCase())
  } catch {
    return false
  }
}

async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    // Import dinámico: heic2any pesa ~1 MB (wasm) y solo se carga si hace falta
    const heic2any = (await import('heic2any')).default
    const converted = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    })
    const blob = Array.isArray(converted) ? converted[0] : converted
    const baseName = file.name.replace(/\.(heic|heif)$/i, '') || 'photo'
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' })
  } catch {
    throw new ImageProcessingError('heic_conversion_failed')
  }
}

/**
 * Valida el archivo y devuelve uno listo para subir/identificar.
 * - HEIC/HEIF → se convierte a JPEG
 * - Formatos no soportados o archivos gigantes → ImageProcessingError
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ImageProcessingError('file_too_large')
  }

  if (await isHeicFile(file)) {
    return convertHeicToJpeg(file)
  }

  if (!SUPPORTED_MEDIA_TYPES.includes(file.type as (typeof SUPPORTED_MEDIA_TYPES)[number])) {
    throw new ImageProcessingError('unsupported_format')
  }

  return file
}
