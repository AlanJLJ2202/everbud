import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase-server'
import PublicPlantView from '@/components/PublicPlantView'
import { Plant } from '@/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { slug: string }
}

// Página pública de una planta: /p/monstera-deliciosa-8f14e4
// Muestra solo generalidades (foto, especie, historia, rareza, tips) — nunca
// el kardex de cuidados ni datos del usuario más allá de su username público.
// RLS solo expone la planta si el perfil del dueño es público.

async function fetchPlant(slug: string) {
  const supabase = await createServerClient()
  const { data: plant } = await supabase
    .from('plants')
    .select('*, species(*)')
    .eq('slug', slug)
    .maybeSingle()
  return plant as Plant | null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const plant = await fetchPlant(params.slug)
  if (!plant) {
    return { title: '🌿 Everbud' }
  }

  const speciesName = plant.species?.common_name || plant.common_name || plant.name
  const description =
    plant.species?.story ||
    `Conoce esta ${speciesName} en Everbud, el gestor inteligente de plantas con IA`

  return {
    title: `🌿 ${plant.name} (${speciesName}) — Everbud`,
    description,
    openGraph: {
      title: `🌿 ${plant.name} — Everbud`,
      description,
      ...(plant.image_url ? { images: [{ url: plant.image_url }] } : {}),
    },
  }
}

export default async function PublicPlantPage({ params }: PageProps) {
  const plant = await fetchPlant(params.slug)

  if (!plant) {
    notFound()
  }

  const supabase = await createServerClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, is_public')
    .eq('id', plant.user_id)
    .maybeSingle()

  return (
    <PublicPlantView
      plant={plant}
      ownerUsername={profile?.username ?? null}
      ownerDisplayName={profile?.display_name ?? null}
      isOwnerPublic={profile?.is_public ?? false}
    />
  )
}
