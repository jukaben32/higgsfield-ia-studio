// Lógica de cada ruta /api/*. No depende de Vercel ni de Vite: recibe
// { method, headers, body, query } y devuelve { status, json }.
// Así el mismo código sirve en local (npm run dev) y publicado en Vercel.
import { createHash, timingSafeEqual } from 'node:crypto';
import { PublicError, createTask, getTask, uploadBase64, getCredits, askClaude } from './kie.js';
import { buildTask } from './buildTask.js';
import { TEXT_MODEL } from '../src/data/models.js';

// Vercel acepta cuerpos de hasta ~4.5 MB; dejamos margen (≈ archivo de 3 MB)
const MAX_UPLOAD_CHARS = 4_000_000;
const UPLOAD_PATTERN = /^data:(image\/(png|jpeg|webp)|audio\/(mpeg|mp3|wav|x-wav|mp4|aac|ogg));base64,/;
const TASK_ID_PATTERN = /^[A-Za-z0-9_.-]{4,120}$/;

// ---- Contraseña de acceso ----
// Si publicas la app, cualquiera con el enlace podría gastar tus créditos.
// Por eso, en Vercel exigimos APP_PASSWORD. En tu PC (local) es opcional.

function sameSecret(a, b) {
  // Comparamos los hash para que ambos tengan el mismo largo y el tiempo sea constante
  const ha = createHash('sha256').update(String(a)).digest();
  const hb = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

function checkAccess(headers) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    if (process.env.VERCEL) {
      throw new PublicError('Configura APP_PASSWORD en Vercel antes de usar la app publicada.', 503);
    }
    return; // En local sin contraseña: permitido
  }
  const given = headers['x-app-password'] || '';
  if (!given || !sameSecret(given, expected)) {
    throw new PublicError('Contraseña de acceso incorrecta. Escríbela en Configuración.', 401);
  }
}

// ---- Rutas ----

async function generate({ body }) {
  const { kieModel, input } = buildTask(body);
  const taskId = await createTask(kieModel, input);
  return { taskId };
}

async function status({ query }) {
  const taskId = String(query.taskId || '');
  if (!TASK_ID_PATTERN.test(taskId)) throw new PublicError('taskId no válido.');
  return getTask(taskId);
}

async function upload({ body }) {
  const dataUrl = body?.dataUrl;
  if (typeof dataUrl !== 'string' || !UPLOAD_PATTERN.test(dataUrl)) {
    throw new PublicError('Solo se aceptan imágenes PNG, JPG o WEBP, o audios MP3/WAV.');
  }
  if (dataUrl.length > MAX_UPLOAD_CHARS) {
    throw new PublicError('El archivo es muy grande. Usa uno de menos de 3 MB.', 413);
  }
  // Nombre de archivo seguro: solo letras, números, puntos y guiones
  const safeName = String(body.fileName || 'archivo').replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 80);
  const url = await uploadBase64(dataUrl, `${Date.now()}-${safeName}`);
  return { url };
}

// Estado del servidor. El saldo solo se muestra a quien tenga acceso
// (contraseña correcta, o sin contraseña en local): no se regala a cualquiera con el enlace.
async function health({ headers }) {
  const kieConfigured = Boolean(process.env.KIE_API_KEY);
  const passwordRequired = Boolean(process.env.APP_PASSWORD || process.env.VERCEL);

  let hasAccess = true;
  try {
    checkAccess(headers || {});
  } catch {
    hasAccess = false;
  }

  let credits = null;
  if (kieConfigured && hasAccess) {
    // Si falla el saldo no rompemos la página; solo no lo mostramos
    credits = await getCredits().catch(() => null);
  }
  return { kieConfigured, passwordRequired, authorized: hasAccess, credits };
}

// Instrucciones para que Claude escriba ganchos de anuncio en JSON
const HOOKS_SYSTEM = `Eres un copywriter experto en anuncios de video cortos (TikTok, Reels, YouTube Shorts) para el mercado latino.
Responde SOLO con un arreglo JSON válido de exactamente 3 objetos, sin texto antes ni después.
Cada objeto: {"framework": string, "headline": string, "script": string, "visual": string}.
- framework: uno distinto por gancho: "Problema / Dolor", "Curiosidad / Romper el patrón", "Prueba social / Secreto".
- headline: texto en pantalla, máximo 12 palabras.
- script: guion hablado de 20 a 35 segundos, natural, en primera persona, que termine con una llamada a la acción.
- visual: indicación breve de cómo debe verse el video.`;

function parseHooks(text) {
  // Tomamos desde el primer "[" hasta el último "]" por si el modelo agrega texto
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1) throw new PublicError('La IA no devolvió ganchos en el formato esperado. Intenta de nuevo.', 502);
  try {
    const list = JSON.parse(text.slice(start, end + 1));
    return list.slice(0, 3).map((h) => ({
      framework: String(h.framework || ''),
      headline: String(h.headline || ''),
      script: String(h.script || ''),
      visual: String(h.visual || ''),
    }));
  } catch {
    throw new PublicError('La IA devolvió un formato inválido. Intenta de nuevo.', 502);
  }
}

async function hooks({ body }) {
  const topic = typeof body?.topic === 'string' ? body.topic.trim() : '';
  if (topic.length < 5 || topic.length > 2000) {
    throw new PublicError('Describe tu producto o servicio (entre 5 y 2000 caracteres).');
  }
  const audience = typeof body.audience === 'string' ? body.audience.trim().slice(0, 300) : '';
  const prompt = `Producto o servicio:\n${topic}\n\nPúblico objetivo: ${audience || 'no especificado'}\n\nEscribe los 3 ganchos en español.`;
  const text = await askClaude({ model: TEXT_MODEL, system: HOOKS_SYSTEM, prompt });
  return { hooks: parseHooks(text) };
}

// Acciones reutilizables sin pasar por HTTP (las usa el servidor MCP)
export const apiActions = { generate, status, hooks };

const ROUTES = {
  generate: { method: 'POST', run: generate },
  status: { method: 'GET', run: status },
  upload: { method: 'POST', run: upload },
  hooks: { method: 'POST', run: hooks },
  health: { method: 'GET', run: health, public: true },
};

// Punto de entrada único: valida método y acceso, ejecuta y atrapa errores
export async function handleApi(name, req) {
  const route = ROUTES[name];
  if (!route) return { status: 404, json: { error: 'Ruta no encontrada.' } };
  if (req.method !== route.method) return { status: 405, json: { error: 'Método no permitido.' } };

  try {
    if (!route.public) checkAccess(req.headers || {});
    const json = await route.run(req);
    return { status: 200, json };
  } catch (err) {
    if (err instanceof PublicError) return { status: err.status, json: { error: err.message } };
    // Error inesperado: lo registramos en el servidor pero no mostramos detalles internos
    console.error(`[api/${name}]`, err);
    return { status: 500, json: { error: 'Error inesperado en el servidor. Revisa la consola.' } };
  }
}
