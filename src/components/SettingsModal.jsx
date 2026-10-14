import React, { useState, useEffect } from 'react';
import { Settings, X, Save, Cpu, Key, ShieldCheck, Check } from 'lucide-react';

export function SettingsModal({ isOpen, onClose }) {
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
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings size={20} color="var(--hf-accent-cyan)" />
            <h3 style={{ fontSize: 18 }}>Cluster Compute & Inference Providers</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--hf-text-secondary)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Provider Selector */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>
              Active Inference Provider
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {[
                { id: 'simulator', title: 'GPU Cluster Simulator', desc: 'Real-time studio preview mode' },
                { id: 'fal', title: 'Fal.ai Serverless', desc: 'Wan 2.1 / Seedance endpoints' },
                { id: 'replicate', title: 'Replicate Cloud', desc: 'Wan / Flux / LivePortrait' },
                { id: 'comfyui', title: 'Custom ComfyUI / RunPod', desc: 'Direct WebSocket instance' }
              ].map(item => (
                <div
                  key={item.id}
                  style={{
                    padding: '12px',
                    borderRadius: 10,
                    border: '1px solid',
                    borderColor: provider === item.id ? 'var(--hf-accent-cyan)' : 'var(--hf-border-subtle)',
                    background: provider === item.id ? 'rgba(6, 182, 212, 0.08)' : 'var(--hf-bg-surface-elevated)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setProvider(item.id)}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--hf-text-muted)', marginTop: 2 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Conditional Key Fields */}
          {provider === 'fal' && (
            <div>
              <label style={{ fontSize: 12, color: 'var(--hf-text-secondary)', display: 'block', marginBottom: 6 }}>
                Fal.ai API Key (`FAL_KEY`)
              </label>
              <input 
                type="password" 
                placeholder="falka_..." 
                value={falKey}
                onChange={e => setFalKey(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          )}

          {provider === 'replicate' && (
            <div>
              <label style={{ fontSize: 12, color: 'var(--hf-text-secondary)', display: 'block', marginBottom: 6 }}>
                Replicate API Token (`r8_...`)
              </label>
              <input 
                type="password" 
                placeholder="r8_..." 
                value={replicateKey}
                onChange={e => setReplicateKey(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          )}

          {provider === 'comfyui' && (
            <div>
              <label style={{ fontSize: 12, color: 'var(--hf-text-secondary)', display: 'block', marginBottom: 6 }}>
                ComfyUI Host Address (RunPod or Local)
              </label>
              <input 
                type="text" 
                value={customComfyUrl}
                onChange={e => setCustomComfyUrl(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          )}

          {/* ElevenLabs Key */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--hf-text-secondary)', display: 'block', marginBottom: 6 }}>
              ElevenLabs / Voice Key (Optional for Custom AI Voices)
            </label>
            <input 
              type="password" 
              placeholder="xi-api-key..." 
              value={elevenLabsKey}
              onChange={e => setElevenLabsKey(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              id="save-settings-btn"
              className="btn-primary-gradient" 
              onClick={handleSave}
            >
              {savedSuccess ? <Check size={16} /> : <Save size={16} />}
              <span>{savedSuccess ? 'Settings Saved!' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
