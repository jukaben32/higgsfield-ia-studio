import React, { useState, useEffect } from 'react';
import { Settings, Save, Cpu, Key, ShieldCheck, Check, ExternalLink, AlertCircle } from 'lucide-react';

export function SettingsView({ onClose }) {
  const [provider, setProvider] = useState('simulator');
  const [falKey, setFalKey] = useState('');
  const [replicateKey, setReplicateKey] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [customComfyUrl, setCustomComfyUrl] = useState('http://localhost:8188');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('hf_studio_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.provider) setProvider(parsed.provider);
        if (parsed.falKey) setFalKey(parsed.falKey);
        if (parsed.replicateKey) setReplicateKey(parsed.replicateKey);
        if (parsed.elevenLabsKey) setElevenLabsKey(parsed.elevenLabsKey);
        if (parsed.customComfyUrl) setCustomComfyUrl(parsed.customComfyUrl);
      } catch (e) {}
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('hf_studio_settings', JSON.stringify({
      provider,
      falKey,
      replicateKey,
      elevenLabsKey,
      customComfyUrl
    }));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (onClose) onClose();
    }, 1200);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="module-hero-header">
        <div>
          <h2>
            <Settings size={28} color="#06b6d4" />
            <span>Configuración de Inferencia & Claves de API</span>
          </h2>
          <p>
            Conecta tus proveedores de GPU para generar vídeos reales para YouTube y Publicidad. 
            Tus claves se almacenan localmente y de forma segura en tu navegador.
          </p>
        </div>

        <span className="badge-tag emerald">
          <ShieldCheck size={12} style={{ display: 'inline', marginRight: 4 }} />
          ALMACENAMIENTO LOCAL SEGURO
        </span>
      </div>

      <div className="quanta-card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Provider Selector */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 10, color: '#fff' }}>
            1. Proveedor de Inferencia Activo
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { id: 'simulator', title: 'Simulador de Clúster GPU', desc: 'Previsualización instantánea de estudio (Sin coste)' },
              { id: 'fal', title: '⚡ Fal.ai Serverless (Recomendado)', desc: 'Genera Wan 2.1, Kling, MiniMax y LivePortrait real' },
              { id: 'replicate', title: 'Replicate Cloud', desc: 'Modelos Wan, Flux y LivePortrait alojados' },
              { id: 'comfyui', title: 'ComfyUI Propio / RunPod', desc: 'Instancia dedicada por WebSocket local/remota' }
            ].map(item => (
              <div
                key={item.id}
                style={{
                  padding: '14px',
                  borderRadius: 12,
                  border: '1.5px solid',
                  borderColor: provider === item.id ? 'var(--hf-accent-cyan)' : 'var(--hf-border-subtle)',
                  background: provider === item.id ? 'rgba(6, 182, 212, 0.1)' : 'var(--hf-bg-surface-elevated)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setProvider(item.id)}
              >
                <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'var(--hf-text-secondary)', marginTop: 4 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fal.ai Setup Section */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: 18, borderRadius: 14, border: '1px solid var(--hf-border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Key size={16} color="var(--hf-accent-cyan)" />
              <label style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                Clave API de Fal.ai (`FAL_KEY`)
              </label>
            </div>
            <a 
              href="https://fal.ai/dashboard/keys" 
              target="_blank" 
              rel="noreferrer"
              style={{ fontSize: 12, color: 'var(--hf-accent-cyan)', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Obtener clave en fal.ai <ExternalLink size={12} />
            </a>
          </div>

          <p style={{ fontSize: 12, color: 'var(--hf-text-secondary)', marginBottom: 10 }}>
            Necesaria para generar vídeos 1080p y 4K con Wan 3.0 / 2.1 y Kling. Regístrate en Fal.ai, recarga $5 o $10 USD de saldo y pega tu clave aquí.
          </p>

          <input 
            id="input-fal-key"
            type="password" 
            placeholder="Pega aquí tu clave: Key ... o falka_..." 
            value={falKey}
            onChange={e => setFalKey(e.target.value)}
            style={{ width: '100%', fontSize: 14, fontFamily: 'var(--hf-font-mono)' }}
          />
        </div>

        {/* ElevenLabs Setup Section */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: 18, borderRadius: 14, border: '1px solid var(--hf-border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Key size={16} color="var(--hf-accent-secondary)" />
              <label style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                Clave de ElevenLabs (Opcional - Voces y Avatares)
              </label>
            </div>
            <a 
              href="https://elevenlabs.io" 
              target="_blank" 
              rel="noreferrer"
              style={{ fontSize: 12, color: 'var(--hf-accent-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              ElevenLabs web <ExternalLink size={12} />
            </a>
          </div>

          <p style={{ fontSize: 12, color: 'var(--hf-text-secondary)', marginBottom: 10 }}>
            Para clonar voces y generar narración ultra-realista para tus vídeos y anuncios. (Puedes usar el plan gratuito).
          </p>

          <input 
            id="input-elevenlabs-key"
            type="password" 
            placeholder="Pega aquí tu clave: xi-api-key..." 
            value={elevenLabsKey}
            onChange={e => setElevenLabsKey(e.target.value)}
            style={{ width: '100%', fontSize: 14, fontFamily: 'var(--hf-font-mono)' }}
          />
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--hf-text-muted)' }}>
            💡 Una vez guardada, el botón de generar usará automáticamente tus GPUs de Fal.ai.
          </div>

          <button 
            id="save-settings-full-btn"
            className="btn-primary-gradient" 
            style={{ padding: '12px 28px', fontSize: 14 }}
            onClick={handleSave}
          >
            {savedSuccess ? <Check size={18} /> : <Save size={18} />}
            <span>{savedSuccess ? '¡Configuración Guardada!' : 'Guardar y Activar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
