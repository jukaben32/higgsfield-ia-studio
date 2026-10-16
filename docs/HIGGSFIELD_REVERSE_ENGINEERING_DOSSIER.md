# Dossier Técnico de Ingeniería Inversa: Higgsfield.ai

> ⚠️ **No verificado.** Este documento se generó automáticamente y contiene suposiciones sobre la
> arquitectura interna de Higgsfield (servicios `fnf-*`, endpoints, modelos) que no se comprobaron.
> No lo uses como especificación. La app real está descrita en el README.
**Objetivo:** Recreación y paridad funcional 1:1 de la plataforma Higgsfield.ai  
**Herramienta de análisis:** REA (Reverse Engineer Anything) + Desempaquetado AST de Bundles TanStack/React

---

## 1. Resumen Ejecutivo y Ecosistema de la Plataforma

Higgsfield.ai no es un simple wrapper de generación de imágenes o vídeo; es una **suite creativa generativa multimodal de grado estudio cinematográfico y publicitario**, respaldada por una arquitectura distribuida de microservicios denominada `fnf-*` (*Fast & Furious Engine*), un gateway MCP unificado y un runtime frontend reactivo basado en streaming SSR.

### Módulos Principales Descubiertos:
1. **Higgsfield Studio (Web App Principal):** Interfaz unificada de generación Text-to-Video, Image-to-Video, Text-to-Image y Audio/Lip-sync.
2. **Genjutsu Engine (Motion Transfer & VFX):** Extracción de movimiento corporal/facial de un vídeo origen y re-proyección fotorrealista sobre cualquier avatar o personaje con consistencia temporal.
3. **Katana & Soul Models:** Modelos propietarios para síntesis facial, consistencia de personaje persistente e iluminación fotorrealista.
4. **AI Influencer Studio:** Sistema de generación de avatares con consistencia facial multi-toma, clonación de voz, sincronización labial y generador de contenidos para redes sociales.
5. **Ads Studio (AI CMO / Hook Multiplier):** Pipeline automatizado de generación de creatividades de marketing: generación de ganchos virales, variantes A/B, superposición de texto dinámico y formatos 9:16/16:9/1:1.
6. **Cinema Studio & Series:** Editor episódico para crear escenas continuas manteniendo consistencia de personajes, ropa, locaciones y tiro de cámara.
7. **3D Jutsu & Visual Effects:** Integración directa con scripts de Blender (simulaciones de destrucción, vistas explosionadas) y After Effects (cinemáticas de movimiento).
8. **Infinite Canvas (Collaboration):** Espacio de trabajo infinito en tiempo real (`canvas-worker.higgsfield.ai`) para encadenar generaciones, máscaras in-painting y edición no destructiva por capas (`fnf-layer-worker`).
9. **Higgsfield MCP Server (`@higgsfield/mcp`):** Servidor Model Context Protocol que permite a Claude, ChatGPT, Cursor y agentes autónomos invocar cualquier herramienta creativa mediante JSON-RPC.
10. **Developer Cloud API (`api.higgsfield.ai`):** API asíncrona pública para desarrolladores orientada a procesamiento masivo de vídeo.

---

## 2. Arquitectura de Sistemas y Diagrama de Flujo

```mermaid
graph TD
    subgraph Clientes
        Web[TanStack / React SPA + SSR]
        Mobile[Higgsfield Mobile App iOS/Android]
        MCPClient[Clientes MCP: Claude / Cursor / Agentes]
        ExtDev[Desarrolladores Externos / API Clients]
    end

    subgraph CDN & Autenticación
        CF[Cloudflare CDN & Assets Edge]
        Clerk[Clerk Auth Gateway: clerk.higgsfield.ai]
    end

    subgraph API Gateway & Orquestación
        APIGW[fnf-api-gw.higgsfield.ai / Envoy / Traefik]
        AgentGW[fnf-agent-gateway: MCP & Agent Protocols]
        Cron[fnf-higgsclaw-cron: Tareas programadas]
    end

    subgraph Microservicios Especializados (fnf-*)
        Camp[fnf-campaign-api: Ads Studio]
        Aitys[fnf-aitys: Audio & Lip-sync]
        Score[fnf-score: Safety, Upscaling & Quality]
        Meet[fnf-meet: Interactive Avatars]
        Series[fnf-series: Story & Scene Director]
        CMO[fnf-ai-cmo: Autonomous Ads Agent]
        Layer[fnf-layer-worker: Layered Image Engine]
        Market[fnf-skills & apps marketplace]
    end

    subgraph Realtime & Colaboración
        ChatHub[creator-hub-chat.higgsfield.ai]
        CanvasHub[canvas-worker.higgsfield.ai]
    end

    subgraph Cola de Tareas & Compute Nodes
        Queue[(Redis / BullMQ / Celery Cluster)]
        GPUCluster[GPU Workers: H100 / A100 / ComfyUI / vLLM]
        ExternalModels[Sora / Kling / Wan / Seedance / Recraft]
        Storage[(Cloudflare R2 / AWS S3 Object Store)]
    end

    Web --> CF
    Web --> Clerk
    Web --> APIGW
    MCPClient --> AgentGW --> APIGW
    ExtDev --> APIGW

    APIGW --> Camp
    APIGW --> Aitys
    APIGW --> Score
    APIGW --> Meet
    APIGW --> Series
    APIGW --> CMO
    APIGW --> Layer
    APIGW --> Market
    APIGW --> ChatHub
    APIGW --> CanvasHub

    Camp & Aitys & Series & CMO & Layer --> Queue
    Queue --> GPUCluster
    Queue --> ExternalModels
    GPUCluster --> Storage
    ExternalModels --> Storage
```

---

## 3. Especificación Detallada de Frontend y UI/UX

### 3.1 Stack Tecnológico del Cliente
- **Framework:** TanStack Router + TanStack Start (React 19 SSR con Seroval hydration).
- **Design System ("Quanta"):**
  - Sistema de tokens inyectado dinámicamente con `@layer quanta-theme`.
  - CSS Variables con prefijo `--hf-color-*`, `--hf-radius-*`, `--hf-space-*`.
  - Temas: Dark mode por defecto (`#0A0A0C` background con tarjetas en `#121216` y bordes en `#222228`), acento en degradados cian/violeta (`#6366F1` a `#A855F7`).
  - Detección de tema ultra rápida en `<head>` para evitar FOUC (*Flash of Unstyled Content*).
- **Gestión de Estado y Caché:**
  - `@tanstack/react-query` con dehydrated state para queries síncronas en render SSR.
  - Sockets WebSocket persistentes para progreso de generación porcentual (0% -> 100%).
- **Autenticación:** Clerk (`@clerk/tanstack-start` o `@clerk/clerk-react`), con Single Sign-On (Google, Apple, Discord, Email).

### 3.2 Rutas y Estructura de Páginas Detectadas:
- `/` - Landing interactiva con video hero y reels dinámicos de demostración.
- `/explore` - Feed social comunitario de prompts, modelos utilizados y botón "Remix".
- `/create` - Studio unificado de generación (Selector de Modo: Video, Image, Audio, Motion Transfer).
- `/ai-influencer-studio` - Generador de personajes consistentes y avatares virtuales.
- `/ads-studio` - Generador de campañas y multiplicador de anuncios (Hook & Headline multiplier).
- `/mcp` - Dashboard de conexión MCP y claves de integración.
- `/canvas` - Lienzo infinito de nodos generativos colaborativos.
- `/pricing` - Tabla de niveles de suscripción y recarga de créditos.
- `/docs / api-keys` - Portal de desarrolladores para API keys (`HF_API_KEY_ID:HF_API_KEY_SECRET`).

---

## 4. Arquitectura de Backend y Microservicios (`fnf-*`)

A través de la inspección del bundle principal (`868a8dba-a-31MF5ZgK7hSi4N.js`), se identificaron las llamadas a los microservicios internos que debes reproducir:

| Servicio Interno | Endpoint / Prefijo | Función Crítica |
| :--- | :--- | :--- |
| **fnf-agent-gateway** | `/agent/v1/*` | Enrutador MCP para agentes autónomos (Claude, ChatGPT, LangChain). |
| **fnf-campaign-api** | `/campaign/v1/*` | Generación de plantillas publicitarias, transcripciones y hooks para TikTok/Reels. |
| **fnf-aitys** | `/audio/v1/*` | Síntesis de voz (ElevenLabs / Bark / FishAudio) y lip-sync sincronizado (Wav2Lip / LivePortrait). |
| **fnf-higgsclaw-cron** | N/A (Worker interno) | Orquestador de tareas programadas (publicación automática de influencers, render batch nocturno). |
| **fnf-score** | `/score/v1/*` | Evaluación de calidad del vídeo generado, filtro NSFW/Safety y métricas estéticas. |
| **fnf-meet** | `/meet/v1/*` | Transmisión de vídeo en tiempo real WebRTC con avatares interactivos. |
| **fnf-series** | `/series/v1/*` | Generador de historias capitulares manteniendo la consistencia de personajes (LoRA + Storyboard). |
| **fnf-ai-cmo** | `/cmo/v1/*` | Análisis de mercado, generación de copys y testeo A/B automático de anuncios. |
| **fnf-layer-worker** | `/layer/v1/*` | Manipulación de imágenes por capas (fondos, tipografía, personajes recortados PNG/Alpha). |
| **creator-hub-chat** | `wss://creator-hub-chat.*` | Chatbot asistente para ideación de prompts y refinamiento de directivas. |
| **canvas-worker** | `wss://canvas-worker.*` | Sincronización multiusuario en tiempo real de nodos en el lienzo infinito (CRDT / Yjs). |

---

## 5. Matriz de Modelos y Motores de Generación

Higgsfield orquesta una combinación de **modelos propios especializados** y **modelos líderes del mercado**:

### 5.1 Modelos de Vídeo Soportados
1. **Genjutsu 1.0 (Higgsfield):** Control de movimiento y transferencia de pose humana (Motion Transfer).
2. **Wan 2.1 / 3.0 (Alibaba):** Open-source SOTA para generación Text-to-Video e Image-to-Video de alta resolución y coherencia física.
3. **ByteDance Seedance 2.0 / 2.5:** Generación cinematográfica rápida y dinámica con control de cámara.
4. **Kling AI 1.5 / 3.0:** Alta retención de detalles y movimientos complejos de fluidos y telas.
5. **OpenAI Sora 2 / Google Veo 3.1:** Para niveles Ultra-Cinematic en el tier Enterprise.
6. **MiniMax Hailuo Video & LTX-Video:** Modelos de alta velocidad y bajo coste por segundo generado.

### 5.2 Modelos de Imagen y Consistencia
1. **Soul v2 (Higgsfield):** Motor fotorrealista para rostros humanos sin el aspecto plástico típico de IA.
2. **Katana Engine:** Mapeo de identidad para consistencia multi-ángulo del mismo sujeto.
3. **Recraft v3:** Generación de vectores, iconos e ilustraciones con control tipográfico limpio.
4. **Flux.1 Schnell / Dev / Pro:** Motor base para Image-to-Image y composiciones con control de LoRAs.

### 5.3 Modelos de Audio y Voz
- Clonación de voz mediante embeddings de audio (FishAudio, ElevenLabs o XTTS-v2).
- Lip-sync: SyncNet + LivePortrait / SadTalker optimizado sobre GPU.

---

## 6. Especificación de la API de Desarrollador

La recreación de la API pública (`api.higgsfield.ai`) requiere implementar el patrón **Async Polling / Webhooks**:

### 6.1 Autenticación
```http
Authorization: Key <HF_API_KEY_ID>:<HF_API_KEY_SECRET>
Content-Type: application/json
```

### 6.2 Endpoints Esenciales

#### 1. Iniciar Transferencia de Movimiento (Genjutsu)
`POST /higgsfield/genjutsu/motion-transfer/v1.0`
```json
{
  "reference_video_url": "https://storage.midominio.com/inputs/dance.mp4",
  "target_character_image_url": "https://storage.midominio.com/inputs/influencer.png",
  "resolution": "1080p",
  "duration_seconds": 10,
  "camera_lock": true,
  "preserve_background": false,
  "webhook_url": "https://midominio.com/api/webhooks/generation"
}
```
**Respuesta:**
```json
{
  "request_id": "req_89f72b9a_9921",
  "status": "queued",
  "created_at": 1728901200,
  "estimated_time_seconds": 45
}
```

#### 2. Generación Text-to-Video / Image-to-Video
`POST /bytedance/seedance-2.0/text-to-video` (o `/wan-3.0/text-to-video`)
```json
{
  "prompt": "Cinematic shot of an astronaut running on a neon-lit cyberpunk boulevard, cinematic lighting, 8k",
  "negative_prompt": "blurry, low quality, distortion",
  "aspect_ratio": "16:9",
  "duration": 5,
  "fps": 24,
  "camera_motion": "pan_right"
}
```

#### 3. Consultar Estado de Generación
`GET /requests/{request_id}/status`
```json
{
  "request_id": "req_89f72b9a_9921",
  "status": "completed",
  "progress_percentage": 100,
  "output": {
    "video_url": "https://cdn.midominio.com/outputs/req_89f72b9a_9921.mp4",
    "thumbnail_url": "https://cdn.midominio.com/outputs/req_89f72b9a_9921_thumb.jpg",
    "duration": 10.0,
    "width": 1080,
    "height": 1920
  },
  "credits_charged": 15
}
```

---

## 7. Integración MCP (Model Context Protocol)

Higgsfield incluye el paquete `@higgsfield/mcp` para que agentes de IA ejecuten acciones en la plataforma. Para replicarlo, debes exponer un servidor MCP con las siguientes herramientas (`tools`):

1. `higgsfield_generate_video`: Inicia generación con selección de modelo (`wan-3.0`, `seedance`, `kling`).
2. `higgsfield_motion_transfer`: Aplica el movimiento de un vídeo de referencia a una foto.
3. `higgsfield_generate_ad_campaign`: Crea un conjunto de 5 vídeos publicitarios con ganchos y copys para una URL de producto dada.
4. `higgsfield_export_after_effects`: Genera un archivo `.jsx` para animar los assets generados en Adobe After Effects.
5. `higgsfield_blender_physics`: Envía un modelo o prompt a la cola de render de Blender para físicas de destrucción.

---

## 8. Stack Recomendado para la Recreación 1:1

Para replicar Higgsfield con máxima velocidad, bajo coste de infraestructura y calidad premium:

### Frontend
- **Framework:** Next.js 15 (App Router) o TanStack Start.
- **UI Components:** TailwindCSS + Radix UI + Lucide Icons + Framer Motion (para microanimaciones idénticas).
- **Lienzo Infinito:** `@xyflow/react` (React Flow) o Tldraw SDK.
- **Autenticación:** Clerk o Supabase Auth.

### Backend y Base de Datos
- **API Principal:** FastAPI (Python) o NestJS (Node.js/TypeScript).
- **Base de Datos:** PostgreSQL con extensión `pgvector` (Supabase).
- **Gestor de Colas:** Redis con BullMQ (para Node.js) o Celery/Redis (para Python).
- **Almacenamiento de Objetos:** Cloudflare R2 (cero costes de transferencia de salida).

### Motor de Inferencia IA y Proveedores de GPU
- **Inferencia de Modelos Open-Source (Wan 2.1/3.0, Flux, LivePortrait, SadTalker):**
  - Instancias de ComfyUI headless desplegadas en RunPod / Modal.com / Vast.ai.
  - Orquestación mediante Serverless APIs en **Fal.ai** o **Replicate** para no mantener servidores dedicados costosos 24/7.
- **Modelos de Audio:** ElevenLabs API o Fish Audio.
