# feat-6-germinations

Seguimiento de germinaciones de semillas.

## Qué hace

- Lista germinaciones activas y completadas
- Calcula días transcurridos y próxima revisión
- Badge de urgencia (verde/amarillo/rojo)
- Botón "Revisé hoy" actualiza fecha
- Botones para marcar exitosa/fallida
- Formulario para nueva germinación

## Archivos

| Archivo | Rol |
|---------|-----|
| `app/germinations/page.tsx` | Página principal |
| `components/GerminationCard.tsx` | Card de germinación |

## Card de germinación

| Dato | Cálculo |
|------|---------|
| Días transcurridos | hoy - started_at |
| Próxima revisión | last_checked_at + check_every_days |
| Estado urgencia | días_hasta_revisión: <0 rojo, =0 hoy, >0 verde |

## Acciones

| Botón | Acción |
|-------|--------|
| 🔍 Revisé hoy | Actualiza `last_checked_at` a hoy |
| ✓ Exitosa | Cambia `status` a `exitosa` |
| ✗ Fallida | Cambia `status` a `fallida` |

## Formulario nueva germinación

| Campo | Default | Requerido |
|-------|---------|-----------|
| seed_name | - | ✓ |
| started_at | hoy | |
| check_every_days | 3 | |
| notes | - | |

## Estados de germinación

| Estado | Visual |
|--------|--------|
| en_curso | Botones de acción activos |
| exitosa | Badge verde "✓ Germinación exitosa" |
| fallida | Badge rojo "✗ Germinación fallida" |
