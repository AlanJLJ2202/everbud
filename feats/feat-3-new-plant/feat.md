# feat-3-new-plant

Flujo completo de creación de planta con identificación por IA.

## Qué hace

- Muestra área de upload (click o cámara del celular)
- Al seleccionar foto → POST a `/api/identify` con loading state
- Muestra resultados pre-llenados en formulario editable
- Guarda en Supabase Storage + tabla `plants`
- Redirige a `/plants`

## Archivos

| Archivo | Rol |
|---------|-----|
| `app/new-plant/page.tsx` | Página completa |
| `lib/supabase.ts` | `uploadImage()` helper |

## Flujo UX

```
[Upload foto]
      ↓
[Loading: "Identificando tu planta..."]
      ↓
[Formulario pre-llenado]
  - Nombre personal (requerido)
  - Nombre común (editable)
  - Nombre científico (editable)
  - Tipo (select)
  - Tipo de luz (select)
  - Riego cada X días (número)
  - Tips (editables)
      ↓
[Guardar planta]
      ↓
[Redirect /plants]
```

## Formulario

| Campo | Tipo | Requerido |
|-------|------|-----------|
| name | text | ✓ |
| common_name | text | |
| scientific_name | text | |
| type | select | |
| light_type | select | |
| water_every_days | number | |
| tips | text[] | |

## Storage

- Bucket: `plant-images`
- Path: `plants/{uuid}.{ext}`
- URL pública guardada en `plants.image_url`
