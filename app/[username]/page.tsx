import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase-server'
import PublicProfileView from '@/components/PublicProfileView'
import { Plant, Profile } from '@/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { username: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `🌿 @${params.username} — Everbud`,
    description: `Conoce el jardín de @${params.username} en Everbud`,
  }
}

export default async function PublicProfilePage({ params }: PageProps) {
  // Solo usernames válidos (evita rutas raras)
  if (!/^[A-Za-z0-9_]{3,30}$/.test(params.username)) {
    notFound()
  }

  const supabase = await createServerClient()

  // RLS ya oculta perfiles privados a terceros; el dueño puede previsualizar el suyo
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', params.username)
    .maybeSingle()

  if (!profile) {
    notFound()
  }

  const { data: plants } = await supabase
    .from('plants')
    .select('*, species(*)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  return (
    <PublicProfileView
      profile={profile as Profile}
      plants={(plants as Plant[]) || []}
    />
  )
}
