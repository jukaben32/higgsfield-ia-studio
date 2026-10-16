// Servicio del navegador: habla SOLO con nuestras rutas /api/*.
// Aquí no hay ninguna clave de IA; la clave vive en el servidor.

const PASSWORD_KEY = 'studio_app_password';
const POLL_INTERVAL_MS = 8000; // cada cuánto preguntamos si ya terminó
const MAX_WAIT_MS = 30 * 60 * 1000; // algunos videos tardan más de 10 min

// ---- Contraseña de acceso (solo necesaria si la app está publicada) ----

export function getAppPassword() {
  try {
    return localStorage.getItem(PASSWORD_KEY) || '';
  } catch {
    return '';
  }
}

export function setAppPassword(value) {
  try {
    if (value) localStorage.setItem(PASSWORD_KEY, value);
    else localStorage.removeItem(PASSWORD_KEY);
  } catch {
    // Si el navegador bloquea el almacenamiento, simplemente no se recuerda
  }
}

// ---- Llamada base a nuestra API ----

async function callApi(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const password = getAppPassword();
  if (password) headers['x-app-password'] = password;

  let res;
  try {
    res = await fetch(`/api/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('No hay conexión con el servidor. ¿Está corriendo `npm run dev`?');
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Error del servidor (${res.status})`);
  return json;
}

// ---- Acciones ----

export function getHealth() {
  return callApi('health');
}

// Crea una generación y devuelve { taskId }
export function startGeneration(params) {
  return callApi('generate', { method: 'POST', body: params });
}

export function getTaskStatus(taskId) {
  return callApi(`status?taskId=${encodeURIComponent(taskId)}`);
}

export function generateHooks({ topic, audience }) {
  return callApi('hooks', { method: 'POST', body: { topic, audience } });
}

// Convierte un archivo del usuario en texto base64 y lo sube; devuelve la URL
export async function uploadFile(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
  const { url } = await callApi('upload', { method: 'POST', body: { dataUrl, fileName: file.name } });
  return url;
}

// Espera a que una tarea termine. Llama a onUpdate(estado) en cada consulta.
// Devuelve el estado final (success) o lanza error si falla.
export async function waitForTask(taskId, onUpdate) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < MAX_WAIT_MS) {
    const task = await getTaskStatus(taskId);
    if (onUpdate) onUpdate(task);
    if (task.state === 'success') return task;
    if (task.state === 'fail') throw new Error(task.failMsg || 'La generación falló en KIE.');
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error('Sigue procesando después de 30 minutos. Revísalo más tarde en Historial.');
}

// Texto amigable para cada estado de KIE
export function describeState(state) {
  const labels = {
    waiting: 'En espera…',
    queuing: 'En cola…',
    generating: 'Generando…',
    success: 'Listo',
    fail: 'Falló',
  };
  return labels[state] || 'Procesando…';
}
