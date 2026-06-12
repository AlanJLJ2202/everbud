# Everbud — Panel de administración para "entrenamiento" del chat

## Aclaración previa: no es fine-tuning, es context engineering

Claude no se reentrena con tus datos. La forma correcta (más barata, inmediata y reversible) de "entrenar" el chat es controlar **lo que entra al contexto en cada request**: instrucciones del equipo + base de conocimiento (RAG) + ejemplos correctivos. Eso es lo que administra este panel. El system prompt base ya está preparado para esto: `buildChatSystemPrompt()` en `lib/chat-system-prompt.ts` acepta `adminInstructions` como parámetro.

---

## 1. Especificación funcional

### 1.1 Acceso
- Rutas bajo `/admin`, visibles solo para usuarios con rol admin.
- Rol en una columna `profiles.role` (`user` | `admin`), validado en el middleware **y** con RLS (nunca confiar solo en el front).

### 1.2 Módulos

**A. Instrucciones del chat (el "carácter" de Bud)**
- Editor de texto de instrucciones adicionales que se inyectan al system prompt (tono, promociones vigentes, correcciones de comportamiento: "no recomiendes fungicida X", "cuando pregunten por feature Y di que llega pronto").
- **Versionadas**: cada guardado crea una versión; una sola activa; rollback con un clic.
- **Playground de prueba**: probar un mensaje contra la versión borrador antes de publicarla (selector de pantalla/planta simulada/idioma).

**B. Base de conocimiento (RAG)**
- Subir documentos: guías de cuidado propias, fichas de especies, FAQs de la app, políticas (PDF, Markdown, texto).
- Pipeline automático al subir: extracción de texto → chunking (~500 tokens) → embeddings → guardado en Postgres con **pgvector** (ya incluido en Supabase).
- Listado con estado (procesando/activo/error), toggle activar/desactivar y eliminar.
- En cada mensaje del chat, el backend recupera los top-k chunks relevantes y los añade al contexto.

**C. Revisión de conversaciones**
- Tabla `chat_conversations` / `chat_messages` con: fecha, pantalla, idioma, planta activa (id), feedback del usuario (👍/👎), flag de rechazo off-topic.
- Filtros: por feedback negativo, por tema, por fecha. Anonimizado por defecto (sin email; user_id ofuscado) — el objetivo es mejorar el bot, no vigilar usuarios.
- Acciones sobre una mala respuesta: **convertir en corrección** (crea una instrucción sugerida en el módulo A) o **convertir en FAQ** (crea un documento en el módulo B).

**D. Métricas**
- Volumen de mensajes/día, % de rechazos off-topic, % feedback positivo, temas más frecuentes, latencia y costo estimado de tokens.

**E. Curaduría del catálogo global**
- Editar `species` generadas por IA (historia, rareza, tips): hoy solo el creador puede corregirlas; el admin debe poder arreglar errores que afectan a todos los usuarios vinculados.

### 1.3 Fuera de alcance (v1)
- Fine-tuning real, A/B testing de prompts, multi-admin con permisos granulares.

---

## 2. Integración con el system prompt del chat

Cada request del chat arma el contexto en este orden (el código ya soporta el paso 2):

```
POST /api/chat
 ├─ 1. buildChatSystemPrompt({ screen, locale, activePlant, ... })   ← base en código (lib/chat-system-prompt.ts)
 ├─ 2. adminInstructions ← SELECT contenido FROM chat_instructions WHERE active   ← módulo A
 ├─ 3. RAG: embedding del mensaje → top-k chunks de knowledge_chunks ← módulo B
 │      (se añaden como bloque "## Conocimiento de Everbud relevante" dentro de adminInstructions)
 ├─ 4. Fotos previas de la planta activa → bloques image (Claude Vision)
 └─ 5. anthropic.messages.create({ system, messages })
        └─ se registra en chat_messages para el módulo C
```

Reglas de precedencia (ya codificadas en el prompt base): las instrucciones del admin **nunca** pueden relajar alcance, privacidad ni seguridad; solo ajustar tono y conocimiento.

---

## 3. Recomendación técnica

| Pieza | Recomendación | Por qué |
|---|---|---|
| UI | Mismas rutas Next.js (`app/admin/*`) | Reusa auth, i18n y componentes; un solo deploy en Vercel |
| Autorización | `profiles.role` + chequeo en middleware + políticas RLS por rol | Defensa en dos capas |
| Vector DB | **pgvector en Supabase** | Cero infra nueva; `match_documents()` vía RPC |
| Embeddings | API de embeddings (p. ej. Voyage) desde una route handler | Claude no expone embeddings; Voyage es el recomendado por Anthropic |
| Procesado de docs | Route handler con streaming + tabla de jobs (`status`) | Subidas grandes no bloquean; reintentos simples |
| Chat LLM | Claude Sonnet (`claude-sonnet-4-...`) igual que `lib/claude.ts` | Coherencia de proveedor y costos |
| Logs de chat | Tablas `chat_conversations`, `chat_messages` con RLS (usuario ve lo suyo, admin todo) | Alimenta módulos C y D |

### Tablas nuevas (resumen)

```sql
profiles            + role text default 'user' check (role in ('user','admin'))
chat_instructions   (id, content, version, is_active, created_by, created_at)
knowledge_documents (id, title, source_type, status, is_active, created_by, created_at)
knowledge_chunks    (id, document_id, content, embedding vector(1024))
chat_conversations  (id, user_id, screen, locale, plant_id, started_at)
chat_messages       (id, conversation_id, role, content, feedback, flagged_offtopic, created_at)
```

### Orden de implementación sugerido
1. `POST /api/chat` con `buildChatSystemPrompt` + logging de mensajes (sin panel todavía).
2. Módulo A (instrucciones versionadas) — máximo impacto, mínimo esfuerzo.
3. Módulo C (revisión + feedback 👍/👎 en el widget del chat).
4. Módulo B (RAG con pgvector).
5. Módulos D y E.
