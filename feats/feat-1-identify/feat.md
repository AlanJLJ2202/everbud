# feat-1-identify

Identificación de plantas por IA usando Claude Vision.

## Qué hace

- Recibe una foto de planta via POST multipart/form-data
- Convierte la imagen a base64
- Envía a Claude Vision con prompt de botánico experto
- Retorna JSON con: nombre común, científico, tipo, luz, riego, tips, confianza

## Archivos

| Archivo | Rol |
|---------|-----|
| `app/api/identify/route.ts` | API endpoint POST |
| `lib/claude.ts` | Wrapper Anthropic SDK |

## Endpoint

```
POST /api/identify
Content-Type: multipart/form-data
Body: { image: File }

Response: {
  common_name: string,
  scientific_name: string,
  type: "frutal" | "floral" | "suculenta" | "aromatica" | "otro",
  light_type: "sol_pleno" | "media_sombra" | "sombra",
  water_every_days: number,
  tips: string[],
  confidence: "alta" | "media" | "baja"
}
```

## Errores

- 400: No se proporcionó imagen
- 422: No se pudo identificar la planta (parsing falló)
- 500: Error interno

## Dependencias

- `@anthropic-ai/sdk`
- Model: `claude-sonnet-4-20250514` con vision
