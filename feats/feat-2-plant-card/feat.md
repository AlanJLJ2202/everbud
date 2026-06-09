# feat-2-plant-card

Card de planta estilo Pokémon/Panini con diseño visual orgánico.

## Qué hace

- Renderiza card con foto, nombre, stats y badges
- Aplica gradiente de color según tipo de planta
- Muestra estado de riego (al día / hoy toca / atrasado)
- Es clickeable → lleva a `/plants/[id]`

## Archivos

| Archivo | Rol |
|---------|-----|
| `components/PlantCard.tsx` | Componente React |

## Gradientes por tipo

| Tipo | Colores |
|------|---------|
| frutal | naranja → amarillo |
| floral | rosas → lilas |
| suculenta | verdes → teal |
| aromatica | lavanda → verde |
| otro | neutro terroso |

## Badges

- 🌞 / 🌤 / 👑 según `light_type`
- 💧 "Cada X días" según `water_every_days`
- 🌿 Tipo de planta

## Indicador de riego

| Estado | Color | Texto |
|--------|-------|-------|
| ok | verde | ✓ Al día |
| today | amarillo | 💧 Hoy toca |
| overdue | rojo | ⚠️ Atrasado Xd |

## Props

```typescript
interface PlantCardProps {
  plant: Plant | PlantWithCareStatus
  wateringStatus?: 'ok' | 'today' | 'overdue'
  overdueDays?: number
}
```
