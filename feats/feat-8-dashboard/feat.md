# feat-8-dashboard

Dashboard principal con resumen del jardín.

## Qué hace

- Muestra stats: plantas vivas, riego hoy, germinaciones pendientes
- Botones de acceso rápido
- Grid de últimas 3 plantas agregadas

## Archivos

| Archivo | Rol |
|---------|-----|
| `app/page.tsx` | Página principal |

## Stats cards

| Stat | Icono | Color |
|------|-------|-------|
| Plantas vivas | 🌱 | Negro |
| Necesitan riego hoy | 💧 | Botanical |
| Germinaciones pendientes | 🔍 | Amber |

## Accesos rápidos

| Botón | Destino | Color |
|-------|---------|-------|
| ➕ Nueva planta | `/new-plant` | Botanical |
| 💧 Registrar riego | `/plants` | Blue |
| 🌱 Nueva germinación | `/germinations` | Amber |

## Últimas plantas

- Muestra las 3 más recientes (`created_at` DESC)
- Usa `PlantCard` con wateringStatus
- Link "Ver todas →" a `/plants`

## Cálculo de riego

Misma lógica que `feat-4-plants-grid`:
- Cuenta plantas donde `días_desde_riego >= water_every_days`
- O plantas nunca regadas con `días_desde_creación >= water_every_days`

## Cálculo de germinaciones pendientes

```
Para cada germinación con status = 'en_curso':
  next_check = last_checked_at + check_every_days
  Si hoy >= next_check → pendiente++
```
