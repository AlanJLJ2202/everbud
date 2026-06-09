<div align="center">

# 🌿 Everbud - Plant Manager

**Gestor inteligente de plantas de jardín con identificación por IA**

*Smart garden plant manager with AI-powered identification*

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)

---

[🇪🇸 Español](#-descripción) · [🇬🇧 English](#-description)

</div>

---

## 🇪🇸 Descripción

**Everbud - Plant Manager** es una aplicación web diseñada para entusiastas de la jardinería que desean organizar, monitorear y documentar el cuidado de sus plantas de manera eficiente. La aplicación resuelve el problema del seguimiento desorganizado de cuidados (riego, fertilización, poda) mediante una interfaz visual intuitiva con tarjetas de estilo coleccionable y capacidades de identificación automática impulsadas por inteligencia artificial.

### Problema que resuelve

Los aficionados a la jardinería frecuentemente olvidan cuándo regaron por última vez sus plantas, cuándo fertilizaron o qué semillas están germinando. Everbud - Plant Manager centraliza toda esta información en un dashboard visual con alertas automáticas y registros históricos.

### Características principales

- **Identificación por IA**: Sube una foto y Claude Vision identifica automáticamente la especie, tipo, requisitos de luz y frecuencia de riego
- **Tarjetas coleccionables**: Diseño visual inspirado en tarjetas Pokémon/Panini con gradientes por tipo de planta
- **Registro de cuidados**: Sistema completo de logging para riego, fertilización, poda y revisiones con registro de condiciones climáticas
- **Seguimiento de germinaciones**: Monitoreo de semillas con alertas de revisión configurables
- **Cementerio de plantas**: Registro de plantas fallecidas con causa de muerte y análisis
- **Dashboard inteligente**: Vista general con estadísticas en tiempo real y plantas que necesitan atención
- **Autenticación segura**: Sistema de registro e inicio de sesión con Supabase Auth y Row Level Security

## 🇬🇧 Description

**Everbud - Plant Manager** is a web application designed for gardening enthusiasts who want to efficiently organize, monitor, and document plant care. The application solves the problem of disorganized care tracking (watering, fertilization, pruning) through an intuitive visual interface with collectible-style cards and AI-powered automatic identification capabilities.

### Problem it solves

Gardening enthusiasts frequently forget when they last watered their plants, when they fertilized, or which seeds are germinating. Everbud - Plant Manager centralizes all this information in a visual dashboard with automatic alerts and historical records.

### Key Features

- **AI Identification**: Upload a photo and Claude Vision automatically identifies the species, type, light requirements, and watering frequency
- **Collectible Cards**: Visual design inspired by Pokémon/Panini cards with plant-type-based gradients
- **Care Logging**: Complete logging system for watering, fertilization, pruning, and inspections with weather condition tracking
- **Germination Tracking**: Seed monitoring with configurable review alerts
- **Plant Cemetery**: Deceased plant registry with cause of death and analysis
- **Smart Dashboard**: Real-time overview with statistics and plants needing attention
- **Secure Authentication**: Registration and login system with Supabase Auth and Row Level Security

---

<!--
## 📸 Screenshots

<div align="center">

### Dashboard Principal / Main Dashboard
![Dashboard](./screenshots/dashboard.png)

### Tarjetas de Plantas / Plant Cards
![Plant Cards](./screenshots/plant-cards.png)

### Identificación por IA / AI Identification
![AI Identification](./screenshots/ai-identification.png)

### Registro de Cuidados / Care Logging
![Care Log](./screenshots/care-log.png)

</div>
-->

---

## 🛠️ Stack Tecnológico / Tech Stack

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| **Framework** | Next.js 14 (App Router) | Renderizado híbrido SSR/CSR, routing basado en carpetas |
| **Lenguaje** | TypeScript 5.0 | Tipado estático para mayor robustez del código |
| **Estilos** | Tailwind CSS 3.4 | Utility-first CSS con paleta de colores botánica personalizada |
| **Base de datos** | Supabase (PostgreSQL) | almacenamiento relacional con Row Level Security |
| **Storage** | Supabase Storage | Almacenamiento de imágenes de plantas con acceso público |
| **Autenticación** | Supabase Auth | Registro, inicio de sesión y gestión de sesiones |
| **IA** | Anthropic Claude API (Vision) | Identificación de plantas mediante análisis de imágenes |
| **Hosting** | Vercel | Despliegue continuo con integración Git |
| **Runtime** | React 18 | Interfaz de usuario reactiva con hooks |

---

## 🏗️ Arquitectura del Proyecto / Project Structure

```
plant-manager/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Layout raíz con navegación
│   ├── page.tsx                  # Dashboard principal
│   ├── globals.css               # Estilos globales y animaciones
│   ├── plants/                   # Módulo de plantas
│   │   ├── page.tsx              # Grid de plantas
│   │   └── [id]/                 # Detalle de planta individual
│   │       └── page.tsx
│   ├── new-plant/                # Creación de planta con IA
│   │   └── page.tsx
│   ├── germinations/             # Seguimiento de germinaciones
│   │   └── page.tsx
│   ├── cemetery/                 # Cementerio de plantas
│   │   └── page.tsx
│   ├── login/                    # Autenticación
│   │   └── page.tsx
│   ├── register/                 # Registro de usuarios
│   │   └── page.tsx
│   └── api/                      # API Routes
│       └── auth/                 # Endpoints de autenticación
├── components/                   # Componentes reutilizables
│   ├── PlantCard.tsx             # Tarjeta estilo Pokémon/Panini
│   ├── CareLogForm.tsx           # Formulario de registro de cuidados
│   ├── GerminationCard.tsx       # Tarjeta de germinación
│   ├── WeatherBadge.tsx          # Badge de condiciones climáticas
│   ├── UserMenu.tsx              # Menú de usuario
│   └── Providers.tsx             # Context providers
├── context/                      # React Context
│   └── AuthContext.tsx           # Contexto de autenticación
├── lib/                          # Utilidades y configuración
│   ├── supabase.ts               # Cliente Supabase (browser)
│   ├── supabase-server.ts        # Cliente Supabase (server)
│   └── claude.ts                 # Wrapper de Anthropic API
├── types/                        # Definiciones TypeScript
│   └── index.ts                  # Interfaces y tipos del dominio
├── feats/                        # Features organizadas por módulo
│   ├── feat-1-identify/          # Identificación por IA
│   ├── feat-2-plant-card/        # Tarjetas de plantas
│   ├── feat-3-new-plant/         # Creación de plantas
│   ├── feat-4-plants-grid/       # Grid de plantas
│   ├── feat-5-plant-detail/      # Detalle de planta
│   ├── feat-6-germinations/      # Germinaciones
│   ├── feat-7-cemetery/          # Cementerio
│   ├── feat-8-dashboard/         # Dashboard
│   ├── feat-9-navigation/        # Navegación
│   └── feat-10-auth/             # Autenticación
├── supabase/                     # Configuración de base de datos
│   ├── schema.sql                # Schema principal
│   └── migration-auth.sql        # Migraciones de autenticación
├── middleware.ts                  # Middleware de autenticación
├── tailwind.config.ts            # Configuración de Tailwind
├── tsconfig.json                 # Configuración de TypeScript
└── next.config.mjs               # Configuración de Next.js
```

---

## 🚀 Instalación y Configuración / Installation & Setup

### Prerrequisitos / Prerequisites

- Node.js 18+ y npm
- Cuenta en [Supabase](https://supabase.com)
- API Key de [Anthropic Claude](https://console.anthropic.com)

### 1. Clonar el repositorio / Clone the repository

```bash
git clone https://github.com/tu-usuario/plant-manager.git
cd plant-manager
```

### 2. Instalar dependencias / Install dependencies

```bash
npm install
```

### 3. Configurar variables de entorno / Configure environment variables

Crea un archivo `.env.local` en la raíz del proyecto / Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Anthropic
ANTHROPIC_API_KEY=tu-api-key-aqui
```

### 4. Configurar la base de datos / Set up the database

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Ve al **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`
3. En **Storage**, crea un bucket llamado `plant-images` con acceso público

### 5. Ejecutar en desarrollo / Run in development

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

The application will be available at `http://localhost:3000`

---

## 📊 Modelo de Datos / Data Model

### Plants
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `user_id` | UUID | Referencia al usuario propietario |
| `name` | TEXT | Nombre personalizado |
| `common_name` | TEXT | Nombre común (IA) |
| `scientific_name` | TEXT | Nombre científico (IA) |
| `type` | TEXT | Tipo: frutal, floral, suculenta, aromatica, otro |
| `light_type` | TEXT | Luz: sol_pleno, media_sombra, sombra |
| `water_every_days` | INT | Frecuencia de riego en días |
| `tips` | TEXT[] | Consejos de cuidado (IA) |
| `image_url` | TEXT | URL de imagen en Storage |
| `status` | TEXT | Estado: alive, dead |

### Care Logs
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `care_type` | TEXT | Tipo: riego, fertilizante, poda, revision |
| `weather` | TEXT | Clima: soleado, nublado, lluvioso, ventoso |
| `notes` | TEXT | Notas adicionales |

### Germinations
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `seed_name` | TEXT | Nombre de la semilla |
| `started_at` | DATE | Fecha de inicio |
| `check_every_days` | INT | Frecuencia de revisión |
| `status` | TEXT | Estado: en_curso, exitosa, fallida |

---

## 🔒 Seguridad / Security

- **Row Level Security (RLS)**: Todos los datos están protegidos por políticas RLS en Supabase, asegurando que cada usuario solo acceda a sus propios datos
- **Middleware de autenticación**: Redirección automática a login para rutas protegidas
- **Variables de entorno**: Las credenciales sensibles nunca se exponen al cliente
- **Storage con políticas**: Las imágenes son de solo lectura pública, pero solo usuarios autenticados pueden subir

---

## 📦 Scripts Disponibles / Available Scripts

```bash
npm run dev      # Servidor de desarrollo / Development server
npm run build    # Build de producción / Production build
npm start        # Servir producción / Serve production
npm run lint     # Linter de código / Code linting
```

---

## 🗺️ Roadmap

- [ ] Notificaciones push para recordatorios de riego
- [ ] Modo offline con Service Worker
- [ ] Exportación de datos en CSV/PDF
- [ ] Integración con APIs de clima en tiempo real
- [ ] Soporte multiidioma (i18n)
- [ ] Tests unitarios y de integración
- [ ] PWA (Progressive Web App)

---

## 📄 Licencia / License

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](./LICENSE) para más detalles.

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Desarrollado con 💚 para amantes de la jardinería**

*Built with 💚 for gardening enthusiasts*

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github)](https://github.com/tu-usuario/plant-manager)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/tu-perfil)

</div>
