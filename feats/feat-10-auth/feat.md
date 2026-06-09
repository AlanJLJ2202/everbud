# feat-10-auth

Sistema de autenticación completo con Supabase Auth.

## Qué hace

- Login con email/password y Google OAuth
- Registro con nombre, email y contraseña
- Protección de rutas via middleware (redirect a /login si no autenticado)
- Persistencia de sesión via cookies (SSR-compatible)
- Menú de usuario en navbar con logout
- RLS por usuario en todas las tablas (cada usuario solo ve sus datos)

## Archivos

| Archivo | Rol |
|---------|-----|
| `lib/supabase.ts` | Cliente browser con `@supabase/ssr` |
| `lib/supabase-server.ts` | Cliente server para middleware/cookies |
| `middleware.ts` | Protección de rutas + refresh de sesión |
| `context/AuthContext.tsx` | Estado global de auth (user, session, signUp, signIn, signOut) |
| `components/Providers.tsx` | Wrapper client para el layout |
| `components/UserMenu.tsx` | Dropdown de usuario en navbar |
| `app/login/page.tsx` | Pantalla de login |
| `app/register/page.tsx` | Pantalla de registro |
| `app/layout.tsx` | Layout raíz envuelto con AuthProvider |
| `app/page.tsx` | Dashboard con saludo personalizado |
| `supabase/schema.sql` | Schema actualizado con user_id + RLS |
| `supabase/migration-auth.sql` | Migración para DB existente |

## Flujo de autenticación

```
Usuario abre la app
  ↓
Middleware verifica cookie de Supabase
  ↓
¿Tiene sesión válida?
  ├── NO → redirect a /login
  │         ├── Inicia sesión → redirect a /
  │         └── Va a /register → se registra → email de confirmación → login
  └── SÍ → carga la app normalmente
```

## Rutas

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login` | Público | Inicio de sesión |
| `/register` | Público | Crear cuenta |
| `/` | Protegido | Dashboard |
| `/plants` | Protegido | Grid de plantas |
| `/plants/[id]` | Protegido | Detalle de planta |
| `/new-plant` | Protegido | Agregar planta |
| `/germinations` | Protegido | Germinaciones |
| `/cemetery` | Protegido | Cementerio |

## Métodos de autenticación

### Email + Password
- Registro: nombre, email, contraseña (mínimo 6 caracteres)
- Login: email + contraseña
- Supabase envía email de confirmación al registrarse

### Google OAuth
- Botón "Continuar con Google" en login y registro
- Flujo: app → Google → Supabase callback → app
- Crea usuario automáticamente con metadata (nombre, avatar)

## Componentes

### UserMenu
- Avatar circular con inicial del nombre
- Dropdown con nombre, email y botón "Cerrar sesión"
- Cierra al hacer clic fuera

### Login / Register
- Formulario centrado con estilos del design system
- Errores inline (email duplicado, credenciales incorrectas)
- Pantalla de éxito post-registro ("Revisa tu email")
- Botón de Google OAuth con logo oficial

## RLS (Row Level Security)

Todas las tablas tienen políticas por usuario:

```sql
-- Ejemplo en plants
CREATE POLICY "Users can view own plants" ON plants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plants" ON plants
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

Tablas afectadas: `plants`, `care_logs`, `germinations`, `death_logs`

## Dependencias

- `@supabase/ssr` — cliente SSR-compatible para Next.js
- `@supabase/supabase-js` — cliente Supabase (ya existente)

## Configuración requerida

### Supabase
1. Ejecutar `supabase/migration-auth.sql` en SQL Editor
2. Activar Google Provider en Authentication → Providers
3. Configurar Site URL: `http://localhost:3000`

### Google Cloud Console
1. Crear OAuth 2.0 Client ID (Aplicación web)
2. Authorized redirect URI: `https://<project>.supabase.co/auth/v1/callback`

### next.config.mjs
- Agregar hostname de Supabase Storage en `images.remotePatterns`

## Diseño

- Sigue el design system existente (botanical greens, cream background)
- Cards redondeadas (rounded-2xl) con sombra sutil
- Inputs con focus ring botanical-500
- Botón principal: bg-botanical-600
- Tipografía: Playfair Display (títulos) + Inter (cuerpo)
