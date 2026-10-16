// Cliente de KIE.ai — SOLO se ejecuta en el servidor (funciones de Vercel,
// servidor de desarrollo de Vite o el servidor MCP). La clave KIE_API_KEY
// se lee de las variables de entorno y nunca se envía al navegador.

const KIE_API_BASE = 'https://api.kie.ai';
const KIE_UPLOAD_BASE = 'https://kieai.redpandaai.co';

// Error con un mensaje apto para mostrar al usuario (sin datos sensibles)
export class PublicError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

// Lee la clave; si falta, avisa con un mensaje claro en español
function getApiKey() {
  const key = process.env.KIE_API_KEY;
  if (!key) {
    throw new PublicError('Falta KIE_API_KEY. Agrégala en el archivo .env (local) o en las variables de Vercel.', 500);
  }
  return key;
}

// Traduce los códigos de error de KIE a mensajes entendibles
function explainKieCode(code, msg) {
  const known = {
    401: 'La clave de KIE no es válida. Revisa KIE_API_KEY.',
    402: 'No tienes créditos suficientes en KIE. Recarga en kie.ai.',
    429: 'Demasiadas solicitudes seguidas. Espera un momento y vuelve a intentar.',
    455: 'KIE está en mantenimiento. Intenta más tarde.',
  };
  return known[code] || `KIE respondió: ${msg || 'error desconocido'} (código ${code})`;
}

// Llamada genérica a KIE. KIE responde HTTP 200 incluso con error,
// por eso revisamos el campo "code" del cuerpo.
async function kieFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const json = await res.json().catch(() => null);
  if (!json) {
    throw new PublicError(`KIE no devolvió una respuesta válida (HTTP ${res.status}).`, 502);
  }
  if (json.code !== undefined && json.code !== 200) {
    throw new PublicError(explainKieCode(json.code, json.msg), 502);
  }
  return json;
}

// Crea una tarea (imagen, video, voz, avatar) y devuelve su taskId
export async function createTask(model, input) {
  const json = await kieFetch(`${KIE_API_BASE}/api/v1/jobs/createTask`, {
    method: 'POST',
    body: JSON.stringify({ model, input }),
  });
  const taskId = json.data?.taskId;
  if (!taskId) throw new PublicError('KIE no devolvió un taskId.', 502);
  return taskId;
}

// Consulta el estado de una tarea y lo devuelve simplificado
export async function getTask(taskId) {
  const json = await kieFetch(
    `${KIE_API_BASE}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
    { method: 'GET' }
  );
  const data = json.data || {};

  // resultJson viene como texto JSON; lo convertimos a objeto con cuidado
  let urls = [];
  if (data.resultJson) {
    try {
      urls = JSON.parse(data.resultJson).resultUrls || [];
    } catch {
      urls = [];
    }
  }

  return {
    taskId: data.taskId || taskId,
    model: data.model || '',
    state: data.state || 'waiting', // waiting | queuing | generating | success | fail
    urls,
    failMsg: data.failMsg || '',
    credits: data.creditsConsumed ?? null,
  };
}

// Sube un archivo (imagen o audio) en base64 y devuelve su URL pública.
// Los archivos subidos se borran solos a las 24 horas.
export async function uploadBase64(dataUrl, fileName) {
  const json = await kieFetch(`${KIE_UPLOAD_BASE}/api/file-base64-upload`, {
    method: 'POST',
    body: JSON.stringify({ base64Data: dataUrl, uploadPath: 'studio-uploads', fileName }),
  });
  const url = json.data?.downloadUrl;
  if (!url) throw new PublicError('La subida no devolvió una URL.', 502);
  return url;
}

// Saldo de créditos de la cuenta de KIE
export async function getCredits() {
  const json = await kieFetch(`${KIE_API_BASE}/api/v1/chat/credit`, { method: 'GET' });
  return typeof json.data === 'number' ? json.data : null;
}

// Pregunta a Claude (vía KIE, misma clave) y devuelve el texto de la respuesta
export async function askClaude({ model, system, prompt, maxTokens = 2000 }) {
  const res = await fetch(`${KIE_API_BASE}/claude/v1/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      system,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      stream: false,
    }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json) {
    const detail = json?.error?.message || json?.msg || `HTTP ${res.status}`;
    throw new PublicError(`El modelo de texto falló: ${detail}`, 502);
  }
  if (json.code !== undefined && json.code !== 200) {
    throw new PublicError(explainKieCode(json.code, json.msg), 502);
  }

  // Unimos todos los bloques de texto de la respuesta
  const blocks = Array.isArray(json.content) ? json.content : [];
  return blocks.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
}
