// Muestra un resultado (video o imagen) con enlace para abrirlo/descargarlo.
import { ExternalLink } from 'lucide-react';

export function MediaResult({ url, kind, credits, emptyText }) {
  if (!url) {
    return (
      <div className="empty-stage" style={{ minHeight: 220 }}>
        <p>{emptyText || 'El resultado aparecerá aquí.'}</p>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
      {kind === 'image'
        ? <img src={url} alt="Resultado" style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: 12 }} />
        : <video src={url} controls autoPlay loop playsInline style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: 12 }} />}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {credits != null && <span className="badge-tag cyan">{credits} créditos</span>}
        <a href={url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: 12 }}>
          <ExternalLink size={13} /> Abrir / Descargar
        </a>
      </div>
    </div>
  );
}
