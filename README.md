# 🌿 Plant Manager

Gestor de plantas de jardín personal con identificación por IA. Diseño inspirado en cards tipo Pokémon/Panini.

## Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **IA**: Anthropic Claude API (Vision)
- **Hosting**: Vercel

## Setup en 3 pasos

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd plant-manager
npm install
```

### 2. Configurar variables de entorno

Crea `.env.local` con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
ANTHROPIC_API_KEY=tu-api-key
```

### 3. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. En el SQL Editor, ejecuta el contenido de `supabase/schema.sql`
3. En Storage, crea un bucket llamado `plant-images` con acceso público

### 4. Deploy

```bash
vercel deploy
```

## Estructura del proyecto

```
├── app/
│   ├── layout.tsx          # Layout raíz con nav
│   ├── page.tsx            # Dashboard principal
│   ├── plants/             # Grid de plantas
│   ├── plants/[id]/        # Detalle de planta
│   ├── new-plant/          # Nueva planta con IA
│   ├── germinations/       # Germinaciones
│   └── cemetery/           # Cementerio
├── components/
│   ├── PlantCard.tsx       # Card estilo Pokémon/Panini
│   ├── CareLogForm.tsx     # Form de riego
│   ├── GerminationCard.tsx # Card de germinación
│   └── WeatherBadge.tsx    # Badge de clima
├── lib/
│   ├── supabase.ts         # Cliente Supabase
│   └── claude.ts           # Wrapper Anthropic
├── types/
│   └── index.ts            # Interfaces TypeScript
└── supabase/
    └── schema.sql          # Schema de base de datos
```

## Funcionalidades

- **Identificación por IA**: Sube una foto y Claude identifica la planta
- **Cards Pokémon/Panini**: Diseño visual con gradientes por tipo de planta
- **Registro de cuidados**: Riego, fertilizante, poda con registro de clima
- **Germinaciones**: Seguimiento de semillas con alertas de revisión
- **Cementerio**: Registro de plantas fallecidas con causa

## Scripts

```bash
npm run dev      # Desarrollo
npm run build    # Build de producción
npm start        # Servir producción
```
