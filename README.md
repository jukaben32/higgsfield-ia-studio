# 🎬 Higgsfield AI Studio // Aether Core v3.0

> **Suite Creativa Generativa Multimodal de Grado Cinematográfico y Publicitario**  
> Recreación e ingeniería inversa con paridad funcional 1:1 de la plataforma [Higgsfield.ai](https://higgsfield.ai/).

![Higgsfield AI Studio](https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Características Principales

### 1. 🎬 Generative Studio (Text-to-Video & Image-to-Video)
- **Modelos de Difusión SOTA Integrados:**
  - `Wan 3.0 Pro` (1080p Cinema, física de fluidos e iluminación natural)
  - `ByteDance Seedance 2.5` (Movimientos de acción ultra rápidos y dinámicos)
  - `Kling 3.0 Ultra` (Hiperrealismo humano y simulación de telas)
  - `Higgsfield Soul v2` (Retratos sin textura plástica y micro-expresiones)
  - `Sora 2 / Veo 3.1` (Master de estudio cinematográfico)
- **Controles de Cámara 3D:** FPV Drone Orbit, Crash Zoom 4K, Low Angle Hero, Dutch Angle, Anamorphic Pan.
- **Aspect Ratios:** `16:9` (Cine), `9:16` (TikTok/Reels), `1:1` (Square), `4:5` (Social).
- **Simulador de Orquestación `fnf-*`:** Pipeline multi-fase en tiempo real (Latent Denoising -> Temporal Vectors -> 4K Neural Super-Resolution -> Dolby Audio Sync).

### 2. ⚡ Genjutsu Engine (Motion Transfer & VFX Retargeting)
- Extracción de postura con malla esquelética **DWPose (240 keypoints)**.
- Retargeting cinemático de movimiento sobre avatares y personajes manteniendo consistencia facial y física de ropa.
- Conmutador de composición: Síntesis de escena latente vs. preservación del plato original.

### 3. 👤 AI Influencer Studio
- Anclaje y consistencia de identidad facial persistente en múltiples tomas.
- Generador de guiones virales para TikTok, YouTube Shorts e Instagram Reels.
- Motor de voz neuronal y clonación con soporte para perfiles de ElevenLabs y Fish Audio.
- Visualizador interactivo de ondas de audio y sincronización labial (*fnf-aitys*).

### 4. 📢 Ads Studio (AI CMO & Hook Multiplier)
- Ingesta de URLs de productos e-commerce (Shopify, Amazon, Landing Pages).
- Multiplicador de ganchos de alto CTR con 3 marcos psicológicos:
  - *Problem / Pain Agitation* (Marco de dolor)
  - *Curiosity Gap / Pattern Interrupt* (Interrupción de patrón)
  - *Secret Hack / Social Proof* (Prueba social)
- Previsualizador multiformato con tipografía dinámica superpuesta.

### 5. 🎨 Infinite Canvas (Workflow Graph Engine)
- Lienzo visual basado en grafos interactivos (`canvas-worker.higgsfield.ai`).
- Enlace de nodos: `Prompt Directive -> Genjutsu Pose -> Diffusion Compute -> Audio Lip-sync -> Master 4K`.

### 6. 🌐 Community Explore & 1-Click Remix
- Feed social con filtros (*Cinematic, Genjutsu, Cyberpunk, Fashion*).
- Botón **1-Click Remix** para clonar prompts, vectores de cámara y semillas latentes directamente en el Studio.

### 7. 🔌 Developer Cloud API & Servidor MCP (`@higgsfield/mcp`)
- Servidor nativo **Model Context Protocol (MCP)** para controlar el estudio desde Claude, Cursor, ChatGPT y agentes autónomos.
- Probador interactivo de llamadas **JSON-RPC 2.0**.
- Gestor de API Keys (`HF_API_KEY_ID:HF_API_KEY_SECRET`) y snippets en cURL, Python SDK y configuración MCP.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19 + Vite (Fast HMR)
- **Design System ("Quanta"):** Vanilla CSS con tokens de tema oscuro profundo (`#07070a`), degradados violeta/cian y micro-animaciones.
- **Tipografía:** Google Fonts (`Outfit`, `Plus Jakarta Sans`, `JetBrains Mono`).
- **Iconografía:** Lucide React Icons.
- **Motor de Inferencia:** Arquitectura plug-and-play compatible con Fal.ai, Replicate, RunPod y ComfyUI local.

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js v18 o superior
- npm v9 o superior

### Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/jukaben32/higgsfield-ia-studio.git
cd higgsfield-ia-studio

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

Abre en tu navegador: **`http://localhost:5173`**

### Compilación para Producción

```bash
npm run build
npm run preview
```

---

## 📚 Documentación Técnica e Ingeniería Inversa

Para consultar la investigación técnica exhaustiva, contratos de endpoints, arquitectura de microservicios (`fnf-*`) y análisis de bundles AST, consulta:  
👉 **[Dossier de Ingeniería Inversa (docs/HIGGSFIELD_REVERSE_ENGINEERING_DOSSIER.md)](./docs/HIGGSFIELD_REVERSE_ENGINEERING_DOSSIER.md)**

---

## 📄 Licencia

MIT License © 2026 Higgsfield AI Studio Contributors.
