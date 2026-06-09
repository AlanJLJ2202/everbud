import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (_supabase) return _supabase

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase credentials not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    )
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey)
  return _supabase
}

// Proxy object that lazily initializes Supabase on first use
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient()
    const value = (client as any)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})

// Server client for server components and API routes
export function createServerClient() {
  return getSupabaseClient()
}

// Helper to get public URL for a storage file
export function getPublicUrl(path: string): string {
  const client = getSupabaseClient()
  const { data } = client.storage
    .from('plant-images')
    .getPublicUrl(path)
  return data.publicUrl
}

// Helper to upload image to Supabase Storage
export async function uploadImage(file: File): Promise<string> {
  const client = getSupabaseClient()
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
