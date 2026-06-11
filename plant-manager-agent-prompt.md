# 🌿 Plant Manager — Agente de Código: Instrucciones Completas

## Contexto del proyecto

Construye una web app personal de gestión de plantas de jardín. Es uso personal (1 usuario), no necesita multi-tenant ni autenticación compleja. El objetivo es funcionalidad primero, con un diseño inspirado en cards tipo Pokémon/Panini — orgánico, botánico, con personalidad visual fuerte.

---

## Stack — NO negociable

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 con App Router y TypeScript |
| Estilos | Tailwind CSS |
| Base de datos | Supabase (PostgreSQL) |
| Storage de imágenes | Supabase Storage (bucket: `plant-images`) |
| IA | Anthropic Claude API (`claude-sonnet-4-20250514`) con vision |
| Hosting target | Vercel (el proyecto debe estar listo para `vercel deploy`) |

---

## Variables de entorno requeridas

Crea el archivo `.env.local` con estas variables (sin valores, solo las keys):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
```

---

## Schema de base de datos

Crea el archivo `supabase/schema.sql` con exactamente este schema:

```sql
-- Plantas
CREATE TABLE plants (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name              text NOT NULL,           -- nombre personal ("Mi rosita")
  common_name       text,                    -- detectado por IA ("Rosa")
  scientific_name   text,                    -- detectado por IA
  type              text,                    -- frutal | floral | suculenta | aromatica | otro
  light_type        text,                    -- sol_pleno | media_sombra | sombra
  water_every_days  int,                     -- cada N días
  tips              text[],                  -- array de 5 tips generados por IA
  image_url         text,                    -- URL de Supabase Storage
  status            text DEFAULT 'alive',    -- alive | dead
  created_at        timestamptz DEFAULT now()
);

-- Log de cuidados diarios
CREATE TABLE care_logs (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id    uuid REFERENCES plants(id) ON DELETE CASCADE,
  care_type   text NOT NULL,   -- riego | fertilizante | poda | revision
  weather     text,            -- soleado | nublado | lluvioso | ventoso
  notes       text,
  logged_at   timestamptz DEFAULT now()
);

-- Germinaciones
CREATE TABLE germinations (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seed_name         text NOT NULL,
  started_at        date NOT NULL,
  check_every_days  int NOT NULL DEFAULT 3,
  last_checked_at   date,
  status            text DEFAULT 'en_curso',  -- en_curso | exitosa | fallida
  notes             text,
  created_at        timestamptz DEFAULT now()
);

-- Registro de muertes
CREATE TABLE death_logs (
  id        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id  uuid REFERENCES plants(id) ON DELETE CASCADE,
  cause     text NOT NULL,  -- sequia | plaga | exceso_agua | frio | enfermedad | otro
  notes     text,
  died_at   date DEFAULT CURRENT_DATE
);
```

---

## Estructura de archivos a generar

```
/
├── app/
│   ├── layout.tsx                     # Layout raíz con nav
│   ├── page.tsx                       # Dashboard: resumen + accesos rápidos
│   ├── plants/
│   │   ├── page.tsx                   # Grid de cards de todas las plantas vivas
│   │   └── [id]/
│   │       └── page.tsx               # Detalle de planta + logs de cuidado
│   ├── new-plant/
│   │   └── page.tsx                   # Formulario: subir foto → IA identifica → confirmar
│   ├── germinations/
│   │   └── page.tsx                   # Lista de germinaciones + estados
│   └── cemetery/
│       └── page.tsx                   # Plantas fallecidas con causa
│
├── components/
│   ├── PlantCard.tsx                  # Card estilo Pokémon/Panini
│   ├── CareLogForm.tsx                # Form de riego/cuidado con clima
│   ├── GerminationCard.tsx            # Card de germinación con días restantes
│   └── WeatherBadge.tsx               # Badge visual del clima
│
├── lib/
│   ├── supabase.ts                    # Cliente de Supabase
│   └── claude.ts                     # Wrapper de Anthropic API
│
├── app/
│   ├── api/identify/route.ts          # POST: recibe imagen → Claude Vision → retorna JSON
│   └── api/tips/route.ts              # POST: recibe nombre planta → retorna tip contextual
│
├── types/
│   └── index.ts                       # Interfaces TypeScript de todas las entidades
│
└── supabase/
    └── schema.sql
```

---

## Módulo 1 — Identificación de planta por IA

### API Route: `/api/identify`

Acepta `POST` con `multipart/form-data` que incluye un campo `image` (archivo).

Flujo:
1. Recibe la imagen
2. La convierte a base64
3. Llama a Claude con este prompt exacto:

```
Eres un botánico experto. Analiza esta foto de una planta y responde ÚNICAMENTE
con un objeto JSON válido, sin texto adicional, sin markdown, sin backticks.

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

Si no puedes identificar la planta con certeza, usa confidence: "baja" y da
tu mejor estimación. Los tips deben ser prácticos, cortos (máx 15 palabras cada uno).
```

4. Parsea el JSON de la respuesta
5. Retorna el JSON al frontend

Si el parsing falla, retorna `{ error: "No se pudo identificar la planta" }` con status 422.

### Página `/new-plant`

Flujo UX:
1. El usuario ve un área de drop/click para subir foto (también debe funcionar desde cámara del celular — usar `accept="image/*" capture="environment"`)
2. Al seleccionar la foto, hace POST a `/api/identify` con un loading state ("Identificando tu planta...")
3. Muestra los resultados pre-llenados en un formulario editable:
   - Campo: nombre personal de la planta (texto libre, requerido)
   - Campo editable: nombre común (pre-llenado por IA)
   - Campo editable: nombre científico
   - Select: tipo (pre-seleccionado por IA)
   - Select: tipo de luz (pre-seleccionado)
   - Input número: regar cada X días (pre-llenado)
   - Lista de tips (editables, generados por IA)
4. Botón "Guardar planta" → sube imagen a Supabase Storage → guarda en tabla `plants` → redirige a `/plants`

---

## Módulo 1 — Plant Card (componente `PlantCard.tsx`)

El diseño debe ser una card tipo Pokémon/Panini. Características:

- **Fondo**: gradiente orgánico basado en el `type` de la planta:
  - `frutal` → gradientes cálidos (naranja/amarillo)
  - `floral` → rosas/lilas
  - `suculenta` → verdes/teal
  - `aromatica` → lavanda/verde
  - `otro` → neutro terroso
- **Foto de la planta**: en la mitad superior, con bordes redondeados
- **Nombre personal** en tipografía grande y bold
- **Nombre científico** en itálica pequeña debajo
- **Badges/stats visuales** (estilo stats de Pokémon):
  - 🌞 / 🌤 / 🌑 según `light_type`
  - 💧 "Cada X días" según `water_every_days`
  - 🌿 Tipo de planta
- **Indicador de próximo riego**: calcula si toca regar hoy basándote en el último `care_log` de tipo `riego`. Muestra badge verde ("Al día"), amarillo ("Hoy toca"), o rojo ("Atrasado X días")
- La card debe ser clickeable y llevar a `/plants/[id]`

---

## Módulo 2 — Registro de cuidados

### Página `/plants/[id]`

Muestra:
1. La PlantCard en grande arriba
2. Botón prominente "💧 Registrar riego" → abre modal/form rápido con:
   - Clima del día (soleado / nublado / lluvioso / ventoso) — botones visuales, no select
   - Notas opcionales
   - Botón confirmar → guarda en `care_logs`
3. Sección "Historial" con timeline de los últimos 10 cuidados
4. Botón "⚠️ Esta planta murió" → abre modal para registrar causa → actualiza `status` a `dead` → crea `death_log` → redirige a `/plants`

---

## Módulo 3 — Germinaciones

### Página `/germinations`

Lista todas las germinaciones activas. Para cada una muestra:
- Nombre de la semilla
- Fecha de inicio
- Días transcurridos desde inicio
- Días hasta próxima revisión (calcula: `last_checked_at + check_every_days`, o `started_at + check_every_days` si nunca revisó)
- Badge de urgencia: verde (más de 2 días), amarillo (mañana o hoy), rojo (atrasado)
- Botón "Revisé hoy" → actualiza `last_checked_at` a hoy
- Botón "Marcar como exitosa / fallida"

Formulario para nueva germinación:
- Nombre de la semilla
- Fecha de inicio (default: hoy)
- Revisar cada X días

---

## Módulo 4 — Cementerio

### Página `/cemetery`

Grid de plantas con `status = 'dead'`. Cada card muestra:
- Foto (en escala de grises con overlay oscuro)
- Nombre de la planta
- Causa de muerte con emoji representativo:
  - `sequia` → 🏜️
  - `plaga` → 🐛
  - `exceso_agua` → 🌊
  - `frio` → 🧊
  - `enfermedad` → 🦠
  - `otro` → ❓
- Fecha de muerte
- Notas si las hay

---

## Dashboard principal (página `/`)

Muestra resumen rápido:
- Total de plantas vivas
- Cuántas plantas toca regar hoy (basado en last care_log + water_every_days)
- Cuántas germinaciones requieren revisión hoy o están atrasadas
- Grid de las últimas 3 plantas agregadas
- Acceso rápido: botones a "Nueva planta", "Registrar riego", "Nueva germinación"

---

## Navegación

Nav bar persistente con:
- 🌿 Mis Plantas → `/plants`
- 🌱 Germinaciones → `/germinations`
- ➕ Nueva planta → `/new-plant`
- 💀 Cementerio → `/cemetery`

---

## Diseño visual — directrices

- **Estética**: Botánico-orgánico. Inspirado en guías de campo, herbarios vintage con toques modernos. No minimalista genérico.
- **Tipografía**: Una fuente serif o slab con carácter para títulos (ej: Playfair Display, Lora, o similar via Google Fonts). Sans-serif limpio para body.
- **Colores base**: Verdes profundos, tierras, crema. Acentos según tipo de planta.
- **Texturas**: Usa sutil noise/grain en fondos para dar sensación orgánica.
- **Modo oscuro**: No requerido en MVP.
- **Responsive**: Mobile-first. Las cards deben verse bien en pantalla de celular (1 columna) y en desktop (3-4 columnas grid).

---

## Reglas de implementación

1. **TypeScript estricto**: Tipea todas las entidades. Crea `types/index.ts` con interfaces para `Plant`, `CareLog`, `Germination`, `DeathLog`.
2. **Server Components por defecto**: Usa Client Components (`"use client"`) solo donde haya interactividad (formularios, estados, modals).
3. **Error handling**: Todos los fetch a Supabase y a la API deben tener try/catch con mensajes de error visibles al usuario (no solo console.log).
4. **Loading states**: Toda operación async debe mostrar un estado de carga visual.
5. **Supabase client**: Usa el patrón singleton en `lib/supabase.ts` con `createBrowserClient` para client components y `createServerClient` para server components/API routes.
6. **Imágenes**: Al subir a Supabase Storage, genera un nombre único con `crypto.randomUUID()`. Guarda la URL pública en `plants.image_url`.
7. **No instalar dependencias innecesarias**: Solo las listadas. No agregar Redux, Zustand, React Query ni librerías de UI como shadcn/chakra — solo Tailwind.

---

## Orden de implementación (MVP primero)

Implementa en este orden exacto:

1. Setup del proyecto (`create-next-app`, instalar deps, `.env.local`)
2. `supabase/schema.sql` y `lib/supabase.ts`
3. `lib/claude.ts` y `/api/identify/route.ts`
4. Tipos TypeScript en `types/index.ts`
5. Componente `PlantCard.tsx`
6. Página `/new-plant` completa con flujo de IA
7. Página `/plants` con grid de cards
8. Página `/plants/[id]` con historial y registro de riego
9. Página `/germinations`
10. Página `/cemetery`
11. Dashboard `/` con resumen
12. Nav bar y `layout.tsx`
13. Verificar que `next build` corre sin errores

---

## Entregable final esperado

- Proyecto Next.js completo listo para `vercel deploy`
- Sin errores de TypeScript ni de build
- Todas las páginas funcionando con datos reales de Supabase
- La identificación de plantas por foto funcional con Claude Vision
- README.md con instrucciones de setup en 3 pasos: clonar, agregar `.env.local`, deploy
