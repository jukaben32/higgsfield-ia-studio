// Historial de generaciones guardado en el navegador (localStorage).
// Guardamos el taskId apenas se crea la tarea: así, si cierras la página,
// puedes recuperar un video que ya pagaste desde la pestaña Historial.
// Nota: KIE guarda los archivos generados 14 días; descárgalos antes.

const HISTORY_KEY = 'studio_history_v1';
const MAX_ITEMS = 200;
const listeners = new Set();

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveHistory(list) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, MAX_ITEMS)));
  } catch {
    // Almacenamiento lleno o bloqueado: no detenemos la app por esto
  }
  listeners.forEach((fn) => fn(list));
}

// Agrega una entrada nueva al principio (sin modificar la lista original)
export function addHistoryItem(item) {
  const entry = { status: 'waiting', urls: [], credits: null, createdAt: Date.now(), ...item };
  saveHistory([entry, ...loadHistory().filter((h) => h.taskId !== item.taskId)]);
}

// Actualiza una entrada por su taskId (crea una copia con los cambios)
export function updateHistoryItem(taskId, changes) {
  saveHistory(loadHistory().map((h) => (h.taskId === taskId ? { ...h, ...changes } : h)));
}

export function removeHistoryItem(taskId) {
  saveHistory(loadHistory().filter((h) => h.taskId !== taskId));
}

// Permite que la vista de Historial se actualice sola cuando algo cambia
export function subscribeHistory(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
