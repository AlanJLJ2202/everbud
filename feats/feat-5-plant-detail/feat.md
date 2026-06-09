# feat-5-plant-detail

Detalle de planta con historial de cuidados y acciones.

## Qué hace

- Muestra PlantCard en grande
- Botón "💧 Registrar riego" → modal con clima
- Sección historial (últimos 10 cuidados)
- Botón "⚠️ Esta planta murió" → modal de defunción
- Tips de cuidado si existen

## Archivos

| Archivo | Rol |
|---------|-----|
| `app/plants/[id]/page.tsx` | Página de detalle |
| `components/CareLogForm.tsx` | Form de riego |
| `components/WeatherBadge.tsx` | Badge de clima |

## Secciones

### 1. Card grande
PlantCard con wateringStatus calculado.

### 2. Acciones
- 💧 Registrar riego (abre form)
- ⚠️ Murió (abre modal de defunción)

### 3. Form de riego
- Botones de clima (soleado/nublado/lluvioso/ventoso)
- Notas opcionales
- Guarda en `care_logs` con `care_type = 'riego'`

### 4. Tips
Lista de tips si la planta tiene.

### 5. Historial
Timeline de últimos 10 cuidados con:
- Tipo de cuidado + emoji
- Badge de clima
- Fecha
- Notas

### 6. Modal de muerte
- Selección de causa (emoji + label)
- Notas opcionales
- Crea `death_log`
- Actualiza `plants.status = 'dead'`
- Redirige a `/plants`

## Causas de muerte

| Causa | Emoji |
|-------|-------|
| sequia | 🏜️ |
| plaga | 🐛 |
| exceso_agua | 🌊 |
| frio | 🧊 |
| enfermedad | 🦠 |
| otro | ❓ |
