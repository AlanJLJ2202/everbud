# feat-7-cemetery

Cementerio de plantas fallecidas.

## Qué hace

- Fetch plantas con `status = 'dead'`
- Muestra grid de cards con foto en escala de grises
- Overlay oscuro sobre la imagen
- Muestra causa de muerte con emoji
- Fecha de defunción y notas

## Archivos

| Archivo | Rol |
|---------|-----|
| `app/cemetery/page.tsx` | Página principal |

## Visual

- Foto: `grayscale` CSS + overlay `bg-black/30`
- Bordes más suaves (gray-200)
- Fondo de página: gray-50 (no cream)

## Card de cementerio

```
┌─────────────────────┐
│   [foto grayscale]  │
│   ░░░ overlay ░░░   │
├─────────────────────┤
│ Nombre de planta    │
│ 🏜️ Sequía           │
│ Falleció: 08/06/26  │
│ "notas si hay"      │
└─────────────────────┘
```

## Causas y emojis

| Causa | Emoji | Label |
|-------|-------|-------|
| sequia | 🏜️ | Sequía |
| plaga | 🐛 | Plaga |
| exceso_agua | 🌊 | Exceso agua |
| frio | 🧊 | Frío |
| enfermedad | 🦠 | Enfermedad |
| otro | ❓ | Otro |

## Empty state

Si no hay plantas muertas:
- Emoji 🌿
- "El cementerio está vacío"
- "Afortunadamente, ninguna planta ha fallecido"
