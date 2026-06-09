# feat-4-plants-grid

Grid responsivo de cards de plantas vivas.

## Qué hace

- Fetch de todas las plantas con `status = 'alive'`
- Calcula estado de riego para cada planta
- Renderiza grid de `PlantCard` responsivo
- Muestra empty state si no hay plantas

## Archivos

| Archivo | Rol |
|---------|-----|
| `app/plants/page.tsx` | Página principal |

## Grid

- Mobile: 1 columna
- Tablet (sm): 2 columnas
- Desktop (lg): 3 columnas
- Wide (xl): 4 columnas

## Cálculo de riego

```
Si tiene último riego:
  días_desde_riego = hoy - último_riego
  
  Si días_desde_riego > water_every_days → overdue
  Si días_desde_riego = water_every_days → today
  Si días_desde_riego < water_every_days → ok

Si nunca regó:
  días_desde_creación = hoy - created_at
  
  Si días_desde_creación >= water_every_days → overdue
```

## Estados

| Estado | Contenido |
|--------|-----------|
| Loading | Spinner |
| Error | Mensaje rojo |
| Vacío | Emoji + CTA "Agregar primera planta" |
| Con plantas | Grid de PlantCards |
