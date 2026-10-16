// Historial: todo lo que generaste, guardado en este navegador.
// Si cerraste la página mientras algo se generaba, aquí puedes recuperarlo.
import React, { useState, useEffect } from 'react';
import { History, RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import { loadHistory, subscribeHistory, updateHistoryItem, removeHistoryItem } from '../services/history';
import { getTaskStatus, describeState } from '../services/aiService';

// Vista previa según el tipo de archivo
function Preview({ item }) {
  const url = item.urls?.[0];
  if (!url) return null;
  if (item.type === 'video') return <video src={url} controls playsInline preload="metadata" />;
  if (item.type === 'audio') return <audio src={url} controls style={{ width: '100%', padding: 12 }} />;
  return <img src={url} alt={item.prompt?.slice(0, 60) || 'Imagen generada'} loading="lazy" />;
}

function HistoryCard({ item }) {
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState('');
  const isPending = item.status !== 'success' && item.status !== 'fail';

  // Pregunta a KIE cómo va esta tarea y guarda la respuesta
  const handleCheck = async () => {
    setIsChecking(true);
    setCheckError('');
    try {
      const task = await getTaskStatus(item.taskId);
      updateHistoryItem(item.taskId, {
        status: task.state,
        urls: task.urls,
        credits: task.credits,
        error: task.failMsg || undefined,
      });
    } catch (err) {
      setCheckError(err.message);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="gallery-card">
      <Preview item={item} />
      <div className="gallery-card-overlay">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge-tag cyan">{item.modelName}</span>
          <span className={`badge-tag ${item.status === 'fail' ? 'rose' : item.status === 'success' ? 'emerald' : 'amber'}`}>
            {describeState(item.status)}
          </span>
        </div>
        <div className="gallery-prompt-text">{item.prompt?.slice(0, 160)}</div>
        <div style={{ fontSize: 11, color: 'var(--hf-text-muted)' }}>
          {new Date(item.createdAt).toLocaleString('es-DO')}
          {item.credits != null && ` · ${item.credits} créditos`}
        </div>
        {item.error && <div className="inline-error">{item.error}</div>}
        {checkError && <div className="inline-error">{checkError}</div>}

        <div style={{ display: 'flex', gap: 8 }}>
          {isPending && (
            <button type="button" className="btn-secondary" style={{ fontSize: 12 }} onClick={handleCheck} disabled={isChecking}>
              <RefreshCw size={13} /> {isChecking ? 'Revisando…' : 'Revisar estado'}
            </button>
          )}
          {item.urls?.[0] && (
            <a href={item.urls[0]} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: 12 }}>
              <ExternalLink size={13} /> Abrir
            </a>
          )}
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: 12, marginLeft: 'auto' }}
            aria-label="Quitar del historial"
            onClick={() => window.confirm('¿Quitar esta entrada del historial? (El archivo no se borra de KIE)') && removeHistoryItem(item.taskId)}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function HistoryView() {
  const [items, setItems] = useState(loadHistory);

  // Nos suscribimos para que la lista se actualice sola
  useEffect(() => subscribeHistory(setItems), []);

  return (
    <div className="explore-container">
      <div className="module-hero-header">
        <div>
          <h2>
            <History size={28} color="#06b6d4" />
            <span>Historial</span>
          </h2>
          <p>
            Todo lo que generas queda aquí (solo en este navegador). KIE guarda los archivos 14 días:
            descarga lo que quieras conservar.
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-stage" style={{ minHeight: 260 }}>
          <History size={36} />
          <p>Todavía no has generado nada. Empieza en la pestaña Studio.</p>
        </div>
      ) : (
        <div className="gallery-masonry">
          {items.map((item) => <HistoryCard key={item.taskId} item={item} />)}
        </div>
      )}
    </div>
  );
}
