<div align="center">

# 🌿 Everbud - Plant Manager

**Gestor inteligente de plantas con IA, cartas coleccionables estilo Panini y perfiles públicos**

*Smart plant manager with AI, Panini-style collectible cards and public profiles*

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)
![Claude AI](https://img.shields.io/badge/Claude-AI-D4A853?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)

---

[🇪🇸 Español](#-descripción) · [🇬🇧 English](#-description)

</div>

---

## 🇪🇸 Descripción

**Everbud** es una aplicación web para entusiastas de la jardinería que quieren organizar, monitorear y documentar el cuidado de sus plantas de manera eficiente — y compartirlo con el mundo. Combina identificación por IA, tarjetas coleccionables estilo Panini y un sistema de gamificación que premia la diversidad y rareza de tu colección.

### Problema que resuelve

Los aficionados a la jardinería olvidan cuándo regaron, cuándo fertilizaron o qué semillas están germinando. Everbud centraliza toda esa información con alertas automáticas, historial de cuidados y un perfil público compartible para presumir tu jardín.

### Características principales

- **Cartas estilo Panini** — Cada planta es una estampita coleccionable: ratio 2:3 portrait, número de colección, número gigante decorativo de fondo, foto en arco con borde blanco, badge de rareza y paleta de colores por tipo de planta. Las legendarias tienen borde dorado y brillo holográfico animado.
- **Catálogo global de especies** — La primera vez que alguien registra una especie, sus datos (historia, rareza, familia, origen) se guardan en un registro compartido. Los siguientes usuarios que tengan la misma planta se vinculan automáticamente a ese registro.
- **Historia / About de cada especie** — La IA genera una historia de 3-4 frases con el origen, curiosidades y significado cultural de cada planta. Se guarda una sola vez en el catálogo global.
- **Rareza** — 5 niveles: Común · Poco común · Rara · Muy rara · Legendaria. Afecta el diseño visual de la carta y los puntos de gamificación.
- **Perfil público compartible** — `everbud.vercel.app/<username>` muestra tu colección, nivel de jardinero y estadísticas. Sin necesidad de login para verlo. Tu username es personalizable.
- **Gamificación** — 4 niveles de jardinero: 🌱 Principiante → 🌿 Intermedio → 🌳 Experto → 🏆 Gran Maestro. Los puntos se calculan según la rareza de tus plantas y la diversidad de especies. Barra de progreso visible en el dashboard y en tu perfil público.
- **Identificación por IA** — Sube una foto o escribe el nombre y Claude Vision identifica la especie, tipo, luz, riego, rareza, historia, familia y origen.
- **Registro de cuidados** — Riego, fertilización, poda y revisiones con condiciones climáticas e historial.
- **Seguimiento de germinaciones** — Monitoreo de semillas con alertas de revisión configurables.
- **Cementerio de plantas** — Registro de bajas con causa de muerte.
- **Dashboard inteligente** — Stats en tiempo real, plantas que necesitan riego y tu nivel de jardinero.
- **Multiidioma** — Español e inglés con detección automática del navegador.

## 🇬🇧 Description

**Everbud** is a web application for gardening enthusiasts who want to efficiently organize, monitor and document plant care — and share it with the world. It combines AI identification, Panini-style collectible cards and a gamification system that rewards collection diversity and rarity.

### Problem it solves

Gardening enthusiasts forget when they last watered, fertilized, or which seeds are germinating. Everbud centralizes all that information with automatic alerts, care history and a shareable public profile to show off your garden.

### Key Features

- **Panini-style cards** — Each plant is a collectible sticker: 2:3 portrait ratio, collection number, giant decorative background number, photo in an arch with white border, rarity badge and color palette by plant type. Legendary plants get a golden border and animated holographic shimmer.
- **Global species catalog** — The first time someone registers a species, its data (story, rarity, family, origin) is saved in a shared record. Later users with the same plant are automatically linked to that record.
- **Species Story / About** — The AI generates a 3–4 sentence story with the origin, fun facts and cultural significance of each plant. Saved once in the global catalog.
- **Rarity** — 5 levels: Common · Uncommon · Rare · Very rare · Legendary. Affects card visual design and gamification points.
- **Shareable public profile** — `everbud.vercel.app/<username>` shows your collection, gardener level and stats. No login required to view. Username is customizable.
- **Gamification** — 4 gardener levels: 🌱 Beginner → 🌿 Intermediate → 🌳 Expert → 🏆 Grand Master. Points are calculated based on plant rarity and species diversity. Progress bar visible on the dashboard and public profile.
- **AI Identification** — Upload a photo or type the name and Claude Vision identifies species, type, light, watering, rarity, story, family and origin.
- **Care logging** — Watering, fertilization, pruning and inspections with weather conditions and history.
- **Germination tracking** — Seed monitoring with configurable review alerts.
- **Plant cemetery** — Death registry with cause of death.
- **Smart dashboard** — Real-time stats, plants needing water and your gardener level.
- **Multilingual** — Spanish and English with automatic browser detection.

---

## 🛠️ Stack Tecnológico / Tech Stack

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| **Framework** | Next.js 14 (App Router) | Renderizado híbrido SSR/CSR, routing basado en carpetas |
| **Lenguaje** | TypeScript 5.0 | Tipado estático para mayor robustez del código |
| **Estilos** | Tailwind CSS 3.4 + Barlow Condensed | Utility-first CSS con tipografía condensada estilo Panini |
| **Base de datos** | Supabase (PostgreSQL) | Almacenamiento relacional con Row Level Security |
| **Storage** | Supabase Storage | Imágenes de plantas con acceso público |
| **Autenticación** | Supabase Auth | Registro, sesiones y auto-creación de perfil |
| **IA** | Anthropic Claude API (Vision) | Identificación, rareza, historia y datos botánicos |
| **Hosting** | Vercel | Despliegue continuo con integración Git |
| **Runtime** | React 18 | Interfaz reactiva con hooks |

---

## 🏗️ Arquitectura del Proyecto / Project Structure

```
plant-manager/
├── app/
│   ├── layout.tsx                # Layout raíz con navegación
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Estilos globales, gradientes y estilos Panini
│   ├── [username]/               # Perfil público (everbud.vercel.app/alan)
│   │   └── page.tsx
│   ├── dashboard/                # Dashboard del usuario
│   │   └── page.tsx
│   ├── plants/
│   │   ├── page.tsx              # Grid de cartas Panini
│   │   └── [id]/page.tsx         # Detalle con historia y rareza
│   ├── new-plant/                # Registro con catálogo global
│   │   └── page.tsx
│   ├── germinations/
│   ├── cemetery/
│   ├── login/
│   ├── register/
│   └── api/
│       ├── identify/             # Identificación por imagen (Claude Vision)
│       ├── identify-by-name/     # Identificación por nombre
│       └── tips/
├── components/
│   ├── PlantCard.tsx             # Carta estilo Panini (portrait 2:3, holográfica)
│   ├── GardenerLevelBadge.tsx    # Badge de nivel con barra de progreso
│   ├── ShareProfileButton.tsx    # Modal para compartir y editar username
│   ├── PublicProfileView.tsx     # Vista del perfil público
│   ├── CareLogForm.tsx
│   ├── GerminationCard.tsx
│   ├── WeatherBadge.tsx
│   ├── AuthNav.tsx
│   ├── MobileNav.tsx
│   └── Providers.tsx
├── context/
│   ├── AuthContext.tsx
│   └── LanguageContext.tsx       # i18n (es/en)
├── lib/
│   ├── supabase.ts
│   ├── supabase-server.ts
│   ├── claude.ts                 # Identificación + rareza + historia
│   └── gamification.ts          # Cálculo de puntos y niveles
├── types/
│   └── index.ts                  # Plant, Species, Profile, Rarity, GardenerLevel…
├── messages/
│   ├── es.json
│   └── en.json
├── supabase/
│   ├── schema.sql
│   ├── migration-auth.sql
│   └── migration-species-profiles.sql  # ← ejecutar para nuevas features
└── middleware.ts                 # Auth + rutas de perfil público
```

---

## 🚀 Instalación y Configuración / Installation & Setup

### Prerrequisitos / Prerequisites

- Node.js 18+ y npm
- Cuenta en [Supabase](https://supabase.com)
- API Key de [Anthropic Claude](https://console.anthropic.com)

### 1. Clonar el repositorio / Clone the repository

```bash
git clone https://github.com/AlanJLJ2202/everbud.git
cd everbud
```

### 2. Instalar dependencias / Install dependencies

```bash
npm install
```

### 3. Configurar variables de entorno / Configure environment variables

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
ANTHROPIC_API_KEY=tu-api-key-aqui
```

### 4. Configurar la base de datos / Set up the database

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve al **SQL Editor** y ejecuta los archivos **en este orden**:
   ```
   supabase/schema.sql
   supabase/migration-auth.sql          (si ya tienes usuarios)
   supabase/migration-species-profiles.sql   ← nuevas funciones
   ```
3. En **Storage**, verifica que el bucket `plant-images` exista con acceso público

### 5. Ejecutar en desarrollo / Run in development

```bash
npm run dev
# → http://localhost:3000
```

---

## 📊 Modelo de Datos / Data Model

### Species (catálogo global)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `scientific_name` | TEXT UNIQUE | Nombre científico (índice case-insensitive) |
| `common_name` | TEXT | Nombre común |
| `type` | TEXT | frutal · floral · suculenta · aromatica · otro |
| `rarity` | TEXT | comun · poco_comun · rara · muy_rara · legendaria |
| `story` | TEXT | Historia / About generada por IA |
| `family` | TEXT | Familia botánica (ej. Rosaceae) |
| `origin` | TEXT | Región geográfica de origen |
| `created_by` | UUID | Usuario que lo registró primero |

### Plants (por usuario)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `user_id` | UUID | Usuario propietario |
| `species_id` | UUID | Referencia al catálogo global |
| `name` | TEXT | Nombre personalizado del usuario |
| `status` | TEXT | alive · dead |

### Profiles
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | = auth.users.id |
| `username` | TEXT UNIQUE | URL del perfil público (3-30 chars) |
| `display_name` | TEXT | Nombre a mostrar |
| `is_public` | BOOLEAN | Visibilidad del perfil |

### Care Logs · Germinations · Death Logs
*(sin cambios respecto a la versión anterior)*

---

## 🎮 Sistema de Gamificación / Gamification System

Los puntos se calculan sobre el total de plantas (vivas y muertas) del usuario:

| Rareza | Puntos (viva) | Puntos (muerta) |
|--------|--------------|----------------|
| Común | 10 | 2 |
| Poco común | 18 | 2 |
| Rara | 30 | 2 |
| Muy rara | 50 | 2 |
| Legendaria | 90 | 2 |

**Bonus de diversidad**: +5 pts por cada especie distinta en la colección.

| Nivel | Puntos mínimos |
|-------|---------------|
| 🌱 Principiante | 0 |
| 🌿 Intermedio | 60 |
| 🌳 Experto | 200 |
| 🏆 Gran Maestro | 500 |

---

## 🔒 Seguridad / Security

- **Row Level Security (RLS)**: Cada usuario solo accede a sus propios datos
- **Catálogo global con RLS abierto para lectura**: Cualquiera puede ver el catálogo de especies; solo usuarios autenticados pueden crear registros
- **Perfiles públicos opcionales**: `is_public = false` oculta el perfil completamente a terceros
- **Middleware de autenticación**: Redirección automática a login para rutas privadas; rutas `/<username>` son públicas
- **Variables de entorno**: Credenciales nunca expuestas al cliente

---

## 📦 Scripts Disponibles / Available Scripts

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm start        # Servir producción
npm run lint     # Linter de código
```

---

## 🗺️ Roadmap

- [x] Identificación por IA (imagen y nombre)
- [x] Cartas coleccionables estilo Panini con rareza holográfica
- [x] Catálogo global de especies compartido
- [x] Historia / About generada por IA por especie
- [x] Perfil público compartible (`/username`)
- [x] Sistema de niveles y gamificación
- [x] Multiidioma (es/en)
- [ ] Notificaciones push para recordatorios de riego
- [ ] Modo offline con Service Worker (PWA)
- [ ] Exportación de datos en CSV/PDF
- [ ] Integración con APIs de clima en tiempo real
- [ ] Tests unitarios y de integración

---

## 📄 Licencia / License

Este proyecto está bajo la licencia MIT.
This project is licensed under the MIT License.

---

<div align="center">

**Desarrollado con 💚 para amantes de la jardinería**

*Built with 💚 for gardening enthusiasts*

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github)](https://github.com/AlanJLJ2202/everbud)

</div>
