# feat-9-navigation

Barra de navegación persistente responsiva.

## Qué hace

- Nav sticky en la parte superior
- Logo + links de navegación
- Versión desktop (links horizontales)
- Versión móvil (grid de iconos)

## Archivos

| Archivo | Rol |
|---------|-----|
| `app/layout.tsx` | Layout raíz con nav |

## Links de navegación

| Emoji | Label | Destino |
|-------|-------|---------|
| 🌿 | Mis Plantas | `/plants` |
| 🌱 | Germinaciones | `/germinations` |
| ➕ | Nueva planta | `/new-plant` |
| 💀 | Cementerio | `/cemetery` |

## Layout

```
┌─────────────────────────────────────────┐
│ 🌿 Plant Manager    [nav links desktop] │  ← sticky
├─────────────────────────────────────────┤
│                                         │
│              {children}                 │  ← main content
│                                         │
├─────────────────────────────────────────┤
│     🌿 Plant Manager — Tu jardín...    │  ← footer
└─────────────────────────────────────────┘
```

## Responsive

### Desktop (md+)
- Links horizontales con hover
- Gap-1, padding px-4 py-2

### Mobile (<md)
- Grid 4 columnas
- Iconos grandes + texto pequeño
- Botón hamburger (no implementado aún)

## Estilos

- Fondo: white
- Border bottom: gray-100
- Shadow: shadow-sm
- Sticky top-0 z-50

## Footer

- Fondo white
- Border top gray-100
- Texto centrado: "🌿 Plant Manager — Tu jardín personal con IA"
