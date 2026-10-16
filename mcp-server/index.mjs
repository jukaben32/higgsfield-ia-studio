// Servidor MCP del estudio: permite pedirle a Claude (u otro cliente MCP)
// que genere videos, imágenes y ganchos con KIE.ai. Reutiliza exactamente
// la misma lógica y validaciones que la app web (carpeta server/).
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiActions } from '../server/handlers.js';
import { PublicError } from '../server/kie.js';
import { VIDEO_MODELS, IMAGE_MODELS } from '../src/data/models.js';

// Carga el .env de la raíz del proyecto (KIE_API_KEY) si existe
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  try {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const idx = trimmed.indexOf('=');
      const k = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (k && !process.env[k]) process.env[k] = val;
    }
  } catch (e) {
    console.error('No se pudo leer .env:', e.message);
  }
}

const server = new Server(
  { name: 'higgsfield-studio-mcp', version: '2.0.0' },
  { capabilities: { tools: {} } }
);

const TOOLS = [
  {
    name: 'higgsfield_generate_video',
    description: 'Inicia un video con KIE.ai (Kling, Seedance, Veo 3.1, Wan, Grok, HappyHorse, Hailuo...). Usa higgsfield_list_models para ver las opciones de cada modelo. Consume créditos. Devuelve task_id; luego usa higgsfield_get_status.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Descripción de la escena (el máximo depende del modelo, 1000 a 5000 caracteres).' },
        model: { type: 'string', enum: VIDEO_MODELS.map((m) => m.id), description: 'Por defecto kling-3.' },
        aspect_ratio: { type: 'string', description: '16:9 YouTube, 9:16 Reels/TikTok. Cada modelo acepta una lista distinta; por defecto la primera que permita.' },
        duration: { type: 'number', description: 'Segundos. El rango o la lista exacta depende del modelo (ver higgsfield_list_models). Por defecto 5, o la primera permitida.' },
        quality: { type: 'string', description: 'Depende del modelo (ej. kling-3: std|pro, seedance: 480p|720p|1080p, veo: 720p|1080p|4k). Por defecto la más barata.' },
        sound: { type: 'boolean', description: 'Generar sonido (cuesta más). Por defecto false.' },
        image_url: { type: 'string', description: 'Opcional: URL https de una imagen para animar.' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'higgsfield_generate_image',
    description: 'Inicia una imagen con KIE.ai (Nano Banana 2 o Pro, GPT Image 2, Seedream, Flux 2, Imagen 4, Ideogram...). Consume créditos. Devuelve task_id; luego usa higgsfield_get_status.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Descripción de la imagen.' },
        model: { type: 'string', enum: IMAGE_MODELS.map((m) => m.id), description: 'Por defecto nano-banana-2.' },
        aspect_ratio: { type: 'string', description: 'Depende del modelo. Por defecto 1:1.' },
        quality: { type: 'string', description: 'Depende del modelo (ej. 1K|2K|4K). Por defecto la primera que permita.' },
        image_url: { type: 'string', description: 'Opcional: URL https de una imagen de referencia.' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'higgsfield_upscale',
    description: 'Mejora la calidad de una imagen o un video con Topaz (KIE.ai). Consume créditos. Devuelve task_id.',
    inputSchema: {
      type: 'object',
      properties: {
        kind: { type: 'string', enum: ['image', 'video'] },
        url: { type: 'string', description: 'URL https de la imagen o del video.' },
        factor: { type: 'string', enum: ['1', '2', '4'], description: 'Aumento. Para video: 2 o 4. Por defecto 2.' },
      },
      required: ['kind', 'url'],
    },
  },
  {
    name: 'higgsfield_motion_transfer',
    description: 'Copia el movimiento de un video sobre un personaje (Kling 3.0 Motion Control). Consume créditos. Devuelve task_id.',
    inputSchema: {
      type: 'object',
      properties: {
        image_url: { type: 'string', description: 'URL https de la foto del personaje (se ven cabeza y torso).' },
        video_url: { type: 'string', description: 'URL https del video con el movimiento (3-30 s).' },
        quality: { type: 'string', enum: ['720p', '1080p'] },
        prompt: { type: 'string', description: 'Opcional: descripción de la escena.' },
      },
      required: ['image_url', 'video_url'],
    },
  },
  {
    name: 'higgsfield_get_status',
    description: 'Consulta una generación por task_id. Estados: waiting, queuing, generating, success, fail. Gratis.',
    inputSchema: {
      type: 'object',
      properties: { task_id: { type: 'string' } },
      required: ['task_id'],
    },
  },
  {
    name: 'higgsfield_generate_ad_hooks',
    description: 'Escribe 3 ganchos de anuncio con guion (en español) usando Claude vía KIE.ai.',
    inputSchema: {
      type: 'object',
      properties: {
        product_or_topic: { type: 'string', description: 'Descripción del producto o servicio.' },
        target_audience: { type: 'string', description: 'Público objetivo.' },
      },
      required: ['product_or_topic'],
    },
  },
  {
    name: 'higgsfield_list_models',
    description: 'Lista los modelos reales disponibles en el estudio.',
    inputSchema: { type: 'object', properties: {} },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

// Convierte cada herramienta en la acción correspondiente del servidor
async function runTool(name, args = {}) {
  if (name === 'higgsfield_list_models') {
    const describe = (kind) => (m) => ({
      kind,
      id: m.id,
      name: m.name,
      creator: m.creator,
      desc: m.desc,
      ratios: m.ratios,
      qualities: m.qualities.map((q) => q.id),
      // Solo video:
      ...(kind === 'video' ? {
        durations: m.durations || `${m.minDuration}-${m.maxDuration} s`,
        image: m.image, // optional | required (solo anima una foto)
        sound: m.sound,
      } : { maxRefs: m.maxRefs }),
    });
    return [...VIDEO_MODELS.map(describe('video')), ...IMAGE_MODELS.map(describe('image'))];
  }
  if (name === 'higgsfield_generate_video') {
    const model = VIDEO_MODELS.find((m) => m.id === args.model) || VIDEO_MODELS[0];
    // Valores por defecto que siempre son válidos para el modelo elegido
    const defaultRatio = model.ratios.includes('16:9') ? '16:9' : model.ratios[0];
    const defaultDuration = model.durations ? model.durations[0] : Math.min(Math.max(5, model.minDuration), model.maxDuration);
    return apiActions.generate({
      body: {
        type: 'video',
        model: model.id,
        prompt: args.prompt,
        ratio: args.aspect_ratio || defaultRatio,
        duration: args.duration ?? defaultDuration,
        quality: args.quality || model.qualities[0].id,
        sound: Boolean(args.sound),
        imageUrl: args.image_url,
      },
    });
  }
  if (name === 'higgsfield_generate_image') {
    const model = IMAGE_MODELS.find((m) => m.id === args.model) || IMAGE_MODELS[0];
    return apiActions.generate({
      body: {
        type: 'image',
        model: model.id,
        prompt: args.prompt,
        ratio: args.aspect_ratio || (model.ratios.includes('1:1') ? '1:1' : model.ratios[0]),
        quality: args.quality || model.qualities[0].id,
        imageUrl: args.image_url,
      },
    });
  }
  if (name === 'higgsfield_upscale') {
    return apiActions.generate({
      body: {
        type: 'upscale',
        kind: args.kind,
        factor: args.factor || '2',
        imageUrl: args.kind === 'image' ? args.url : undefined,
        videoUrl: args.kind === 'video' ? args.url : undefined,
      },
    });
  }
  if (name === 'higgsfield_motion_transfer') {
    return apiActions.generate({
      body: {
        type: 'motion',
        imageUrl: args.image_url,
        videoUrl: args.video_url,
        quality: args.quality || '720p',
        prompt: args.prompt,
      },
    });
  }
  if (name === 'higgsfield_get_status') {
    return apiActions.status({ query: { taskId: args.task_id } });
  }
  if (name === 'higgsfield_generate_ad_hooks') {
    return apiActions.hooks({ body: { topic: args.product_or_topic, audience: args.target_audience } });
  }
  throw new PublicError(`Herramienta desconocida: ${name}`);
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    const result = await runTool(name, args);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    const message = err instanceof PublicError ? err.message : 'Error inesperado en el servidor MCP.';
    if (!(err instanceof PublicError)) console.error(err);
    return { isError: true, content: [{ type: 'text', text: message }] };
  }
});

async function main() {
  await server.connect(new StdioServerTransport());
}

main().catch((error) => {
  console.error('Error fatal del servidor MCP:', error);
  process.exit(1);
});
