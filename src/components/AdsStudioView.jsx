// Ganchos y guiones: describes tu producto/servicio y la IA (Claude vía KIE)
// escribe 3 ganchos de anuncio con guion. Puedes mandar uno al Avatar.
import React, { useState } from 'react';
import { Megaphone, Sparkles, Copy, Check, Users } from 'lucide-react';
import { generateHooks } from '../services/aiService';

export function AdsStudioView({ onUseScript }) {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [hooks, setHooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await generateHooks({ topic, audience });
      setHooks(data.hooks);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (hook, idx) => {
    try {
      await navigator.clipboard.writeText(`${hook.headline}\n\n${hook.script}`);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      setError('No se pudo copiar. Selecciona el texto y cópialo a mano.');
    }
  };

  return (
    <div className="ads-studio-container">
      <div className="module-hero-header">
        <div>
          <h2>
            <Megaphone size={28} color="#06b6d4" />
            <span>Ganchos y guiones con IA</span>
          </h2>
          <p>
            Describe tu producto o servicio y a quién va dirigido. La IA escribe 3 ganchos distintos
            con su guion listo para grabar o para dárselo a tu avatar.
          </p>
        </div>
      </div>

      <div className="quanta-card" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <textarea
          className="prompt-textarea"
          style={{ minHeight: 100 }}
          maxLength={2000}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ej.: Agencia que crea videos con IA para negocios locales en República Dominicana. Entregamos 10 videos al mes desde RD$15,000…"
        />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            value={audience}
            maxLength={300}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="Público objetivo. Ej.: dueños de restaurantes y salones de belleza"
            style={{ flex: 1, minWidth: 240 }}
          />
          <button type="button" className="btn-primary-gradient" onClick={handleGenerate} disabled={isLoading}>
            <Sparkles size={16} />
            <span>{isLoading ? 'Escribiendo ganchos…' : 'Crear 3 ganchos'}</span>
          </button>
        </div>
        {error && <div className="inline-error">{error}</div>}
      </div>

      {hooks.length > 0 && (
        <div className="hooks-grid">
          {hooks.map((hook, idx) => (
            <div key={idx} className="hook-card">
              <div className="hook-card-header">
                <span className="badge-tag cyan">{hook.framework}</span>
                <span style={{ fontSize: 11, color: 'var(--hf-text-muted)' }}>Opción {idx + 1}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.4, color: '#fff' }}>“{hook.headline}”</div>
              <div className="hook-script-preview">{hook.script}</div>
              <div style={{ fontSize: 12, color: 'var(--hf-text-muted)' }}>🎬 {hook.visual}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }} onClick={() => handleCopy(hook, idx)}>
                  {copiedIdx === idx ? <Check size={13} /> : <Copy size={13} />} {copiedIdx === idx ? 'Copiado' : 'Copiar'}
                </button>
                <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }} onClick={() => onUseScript(hook.script)}>
                  <Users size={13} /> Usar en Avatar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
