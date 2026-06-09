import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton for client components
let _supabase: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient()
  }
  return _supabase
}

// Proxy for backward compatibility with existing code
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    const client = getSupabase()
    const value = (client as any)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})

export function getPublicUrl(path: string): string {
  const client = getSupabase()
  const { data } = client.storage
    .from('plant-images')
    .getPublicUrl(path)
  return data.publicUrl
}

export async function uploadImage(file: File): Promise<string> {
  const client = getSupabase()
  const fileExt = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`
  const filePath = `plants/${fileName}`

  const { error } = await client.storage
    .from('plant-images')
    .upload(filePath, file)

  if (error) {
    throw new Error(`Error uploading image: ${error.message}`)
  }

  return getPublicUrl(filePath)
}
