// Hook reutilizable para cualquier generación (video, imagen, voz, avatar).
// Hace los 3 pasos: crear la tarea → guardarla en el historial → esperar el resultado.
import { useState, useCallback } from 'react';
import { startGeneration, waitForTask } from '../services/aiService';
import { addHistoryItem, updateHistoryItem } from '../services/history';

export function useGeneration() {
  const [isRunning, setIsRunning] = useState(false);
  const [state, setState] = useState(''); // estado actual de KIE
  const [error, setError] = useState('');

  // params: lo que se envía a /api/generate
  // meta: datos para el historial (tipo, nombre del modelo, prompt)
  // Devuelve la tarea terminada ({ urls, credits, ... }) o null si falló
  const run = useCallback(async (params, meta) => {
    setIsRunning(true);
    setError('');
    setState('waiting');
    let taskId = null;

    try {
      ({ taskId } = await startGeneration(params));
      // Guardamos el taskId de inmediato: si se cierra la página, no se pierde
      addHistoryItem({ taskId, ...meta });

      const task = await waitForTask(taskId, (t) => setState(t.state));
      updateHistoryItem(taskId, { status: 'success', urls: task.urls, credits: task.credits });
      return task;
    } catch (err) {
      setError(err.message || 'Error inesperado.');
      if (taskId) updateHistoryItem(taskId, { status: 'fail', error: err.message });
      return null;
    } finally {
      setIsRunning(false);
    }
  }, []);

  return { run, isRunning, state, error, setError };
}
