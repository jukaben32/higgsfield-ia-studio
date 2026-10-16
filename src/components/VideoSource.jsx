// Elegir un video de entrada: pegar un enlace https o escoger uno de tu Historial.
// (Los videos pesan demasiado para subirlos desde aquí, por eso se usa un enlace.)
import { useState, useEffect } from 'react';
import { loadHistory, subscribeHistory } from '../services/history';

// Videos ya terminados en el historial, listos para reutilizar
function readHistoryVideos() {
  return loadHistory().filter((h) => h.type === 'video' && h.status === 'success' && h.urls?.[0]);
}

export function VideoSource({ label, hint, value, onChange }) {
  const [videos, setVideos] = useState(readHistoryVideos);

  // Si el historial cambia (termina una generación), actualizamos la lista
  useEffect(() => subscribeHistory(() => setVideos(readHistoryVideos())), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="panel-section-title"><span>{label}</span></div>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        placeholder="Pega aquí el enlace https del video (.mp4)"
        style={{ width: '100%' }}
      />
      {videos.length > 0 && (
        <select value="" onChange={(e) => e.target.value && onChange(e.target.value)} style={{ width: '100%' }}>
          <option value="">…o elige uno de tu Historial</option>
          {videos.map((v) => (
            <option key={v.taskId} value={v.urls[0]}>
              {v.modelName} — {(v.prompt || '').slice(0, 50)}
            </option>
          ))}
        </select>
      )}
      {hint && <div style={{ fontSize: 11, color: 'var(--hf-text-muted)' }}>{hint}</div>}
    </div>
  );
}
