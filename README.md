# 🎬 Betha IA Studio

Estudio personal para crear videos, imágenes, avatares que hablan y guiones de anuncios
con IA, usando **una sola clave de [KIE.ai](https://kie.ai)**.

> Inspirado en la experiencia de Higgsfield.ai, pero **no es una copia ni tiene relación con Higgsfield**.
> Los modelos propios de Higgsfield (Soul, Genjutsu, Katana…) no están incluidos.

## ✅ Qué hace de verdad

| Pestaña | Qué hace | Modelo (vía KIE.ai) |
|---|---|---|
| **Studio → Video** | Texto → video, o foto → video (16:9, 9:16, 1:1, 3–15 s, con o sin sonido) | Kling 3.0 · Seedance 2.0 Fast |
| **Studio → Imagen** | Miniaturas, portadas y creativos, con foto de referencia opcional | Nano Banana 2 |
| **Cinema** | Un video con hasta 5 planos (3–15 s en total), con foto inicial opcional | Kling 3.0 multi-plano |
| **Herramientas → Mejorar calidad** | Aumenta x2/x4 la resolución de una imagen o un video | Topaz |
| **Herramientas → Copiar movimiento** | Aplica el movimiento de un video a tu personaje | Kling 3.0 Motion Control |
| **Herramientas → Reemplazar personaje** | Cambia a la persona de un video por la de tu foto | Wan 2.2 Animate Replace |
| **Studio → Efectos VFX** | 9 efectos listos (derretirse, fuego, flotar, explosión…) para tus videos | Kling / Seedance |
| **Studio → Plantillas de imagen** | Probador virtual, mismo personaje en otra escena, producto en escena | Nano Banana 2 |
| **Avatar** | Foto + guion → voz → video del personaje hablando con labios sincronizados | ElevenLabs Multilingual v2 + Kling AI Avatar |
| **Ganchos y guiones** | 3 ganchos de anuncio con guion en español; se pueden mandar al Avatar | Claude Haiku 4.5 |
| **Historial** | Guarda cada generación (en este navegador) para recuperarla y descargarla | — |
| **Configuración** | Estado de la clave, saldo real de créditos y contraseña de acceso | — |

Cada generación **consume créditos de KIE**. Los precios están en [kie.ai/pricing](https://kie.ai/pricing).
KIE guarda los archivos generados **14 días** y las imágenes que subes **24 horas**: descarga lo que quieras conservar.

## 🚀 Cómo usarlo en tu PC (paso a paso)

1. Instala las dependencias (solo la primera vez):
   ```bash
   npm install
   ```
2. Copia `.env.example` como `.env` y escribe tu clave de KIE:
   ```
   KIE_API_KEY=<tu clave de kie.ai/api-key>
   ```
3. Arranca la app:
   ```bash
   npm run dev
   ```
4. Abre **http://localhost:5173**. En *Configuración* deberías ver "La clave de KIE está configurada" y tu saldo.

## 🔒 Seguridad

- La clave de KIE **solo vive en el servidor** (carpeta `server/`). El navegador habla con `/api/*`, nunca con KIE directamente.
- Nunca pongas claves en variables que empiecen con `VITE_`: esas se copian dentro de la página y cualquiera podría verlas.
- Si publicas en Vercel, **define `APP_PASSWORD`**. Sin ella la app publicada se niega a generar (para que nadie gaste tus créditos).

## ☁️ Publicar en Vercel (opcional)

1. Importa el repositorio en Vercel.
2. En *Settings → Environment Variables* agrega `KIE_API_KEY` y `APP_PASSWORD`.
3. Despliega. Las funciones de `api/` se publican solas.
4. Abre la app, ve a *Configuración* y escribe tu contraseña.

Límite: en Vercel las imágenes que subes deben pesar **menos de 3 MB**.

## 🤖 Usarlo desde Claude (servidor MCP)

`mcp-server/index.mjs` expone estas herramientas (lee `KIE_API_KEY` del `.env`):

- `higgsfield_generate_video` y `higgsfield_generate_image` → devuelven un `taskId`
- `higgsfield_upscale` y `higgsfield_motion_transfer`
- `higgsfield_get_status` → consulta el resultado (gratis)
- `higgsfield_generate_ad_hooks` → 3 ganchos con guion
- `higgsfield_list_models` → modelos disponibles

## ✅ Pruebas

`npm test` revisa que los pedidos a KIE se armen y se validen bien. No llama a KIE ni gasta créditos.

## 🗂️ Estructura

```
api/[route].js        Función de Vercel (usa server/handlers.js)
server/kie.js         Cliente de KIE.ai (aquí se usa la clave)
server/buildTask.js   Valida y arma el pedido para cada modelo
server/handlers.js    Lógica de /api/generate, status, upload, hooks, health
server/vitePlugin.js  Hace que /api/* funcione con `npm run dev`
src/data/models.js    Catálogo de modelos (sin claves)
src/components/       Pantallas (Studio, Avatar, Ganchos, Historial, Configuración)
mcp-server/           Servidor MCP para Claude
```

## 📚 Nota sobre el dossier

`docs/HIGGSFIELD_REVERSE_ENGINEERING_DOSSIER.md` es material de investigación **no verificado**:
describe servicios internos de Higgsfield que no se pudieron comprobar. No lo uses como especificación.
