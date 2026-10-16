// Studio: genera VIDEOS (desde texto o desde una imagen) e IMÁGENES con KIE.ai.
import React, { useState } from 'react';
import { Video, Image as ImageIcon, Wand2, ExternalLink, Clock } from 'lucide-react';
import { VIDEO_MODELS, IMAGE_MODELS, VFX_PRESETS, IMAGE_TEMPLATES } from '../data/models';
import { useGeneration } from '../hooks/useGeneration';
import { describeState } from '../services/aiService';
import { ImageUpload } from './ImageUpload';

const DEFAULT_PROMPT = 'Plano cinematográfico de una emprendedora latina presentando su marca frente a la cámara en una oficina moderna con luz natural, cámara acercándose lentamente';

// Lista de opciones tipo "chip" (para modelos, formatos y calidades)
function ChipGroup({ options, value, onChange }) {
  return (
    <div className="camera-chips-grid">
      {options.map((o) => (
        <button key={o.id} type="button" className={`chip-btn ${value === o.id ? 'active' : ''}`} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Muestra el resultado (video o imagen) o un mensaje cuando aún no hay nada
function ResultStage({ result, mode }) {
  if (!result) {
    return (
      <div className="empty-stage">
        {mode === 'video' ? <Video size={40} /> : <ImageIcon size={40} />}
        <p>Tu {mode === 'video' ? 'video' : 'imagen'} aparecerá aquí.</p>
        <p style={{ fontSize: 12 }}>Todo lo que generes queda guardado en la pestaña Historial.</p>
      </div>
    );
  }
  const url = result.urls[0];
  return result.type === 'video'
    ? <video src={url} className="rendered-media" controls autoPlay loop playsInline />
    : <img src={url} className="rendered-media" alt="Imagen generada" />;
}

export function StudioView() {
  const [mode, setMode] = useState('video'); // 'video' | 'image'
  const [modelId, setModelId] = useState(VIDEO_MODELS[0].id);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrl2, setImageUrl2] = useState(''); // segunda referencia (ej. la prenda)
  const [effectId, setEffectId] = useState(''); // efecto VFX elegido
  const [templateHint, setTemplateHint] = useState('');
  const [ratio, setRatio] = useState('9:16');
  const [duration, setDuration] = useState(5);
  const [quality, setQuality] = useState(VIDEO_MODELS[0].qualities[0].id);
  const [sound, setSound] = useState(false);
  const [result, setResult] = useState(null);
  const { run, isRunning, state, error } = useGeneration();

  const models = mode === 'video' ? VIDEO_MODELS : IMAGE_MODELS;
  const model = models.find((m) => m.id === modelId) || models[0];

  // Al cambiar de modelo, ajustamos valores para que siempre sean válidos
  const selectModel = (m) => {
    setModelId(m.id);
    setQuality(m.qualities[0].id);
    if (!m.ratios.includes(ratio)) setRatio(m.ratios[0]);
    if (m.minDuration) setDuration((d) => Math.min(Math.max(d, m.minDuration), m.maxDuration));
  };

  const switchMode = (next) => {
    setMode(next);
    setEffectId('');
    setTemplateHint('');
    selectModel(next === 'video' ? VIDEO_MODELS[0] : IMAGE_MODELS[0]);
  };

  const handleGenerate = async () => {
    // El efecto VFX se agrega al final de la descripción
    const effect = VFX_PRESETS.find((e) => e.id === effectId);
    const finalPrompt = effect ? `${prompt.trim()}. ${effect.text}` : prompt;
    const params = mode === 'video'
      ? { type: 'video', model: model.id, prompt: finalPrompt, imageUrl, ratio, duration, quality, sound }
      : { type: 'image', model: model.id, prompt, imageUrls: [imageUrl, imageUrl2].filter(Boolean), ratio, quality };
    const task = await run(params, { type: mode, modelName: model.name, prompt });
    if (task) setResult({ ...task, type: mode });
  };

  // Kling usa el formato de la foto cuando hay imagen, así que ocultamos el selector
  const showRatio = !(mode === 'video' && model.id === 'kling-3' && imageUrl);

  return (
    <div className="studio-layout">
      <aside className="studio-sidebar">
        <div>
          <div className="panel-section-title">¿Qué quieres crear?</div>
          <div className="mode-switcher">
            <button type="button" className={`mode-btn ${mode === 'video' ? 'active' : ''}`} onClick={() => switchMode('video')}>
              <Video size={14} /> Video
            </button>
            <button type="button" className={`mode-btn ${mode === 'image' ? 'active' : ''}`} onClick={() => switchMode('image')}>
              <ImageIcon size={14} /> Imagen
            </button>
          </div>
        </div>

        <div>
          <div className="panel-section-title">Modelo</div>
          {models.map((m) => (
            <div key={m.id} className={`model-option-item ${model.id === m.id ? 'selected' : ''}`} onClick={() => selectModel(m)}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: 'var(--hf-text-muted)' }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <ImageUpload
          label={mode === 'video' ? 'Imagen inicial (opcional)' : 'Imagen de referencia (opcional)'}
          hint={mode === 'video' ? 'Súbela para animar una foto (imagen → video)' : 'Ej.: tu producto o tu logo'}
          imageUrl={imageUrl}
          onChange={setImageUrl}
        />

        {mode === 'image' && (
          <ImageUpload
            label="Segunda referencia (opcional)"
            hint="Ej.: la prenda o el producto"
            imageUrl={imageUrl2}
            onChange={setImageUrl2}
          />
        )}

        {mode === 'image' && (
          <div>
            <div className="panel-section-title">Plantillas</div>
            <div className="camera-chips-grid">
              {IMAGE_TEMPLATES.map((t) => (
                <button key={t.id} type="button" className="chip-btn" onClick={() => { setPrompt(t.prompt); setTemplateHint(t.hint); }}>
                  {t.label}
                </button>
              ))}
            </div>
            {templateHint && <div style={{ fontSize: 11, color: 'var(--hf-text-muted)', marginTop: 6 }}>{templateHint}</div>}
          </div>
        )}

        {mode === 'video' && (
          <div>
            <div className="panel-section-title">Efecto VFX (opcional)</div>
            <div className="camera-chips-grid">
              {VFX_PRESETS.map((e) => (
                <button key={e.id} type="button" className={`chip-btn ${effectId === e.id ? 'active' : ''}`} onClick={() => setEffectId(effectId === e.id ? '' : e.id)}>
                  {e.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="prompt-container">
          <div className="panel-section-title">
            <span>Descripción</span>
            <span style={{ color: 'var(--hf-text-muted)' }}>{prompt.length} / 2500</span>
          </div>
          <textarea
            className="prompt-textarea"
            maxLength={2500}
            placeholder="Describe la escena: quién aparece, qué hace, lugar, luz y movimiento de cámara…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        {showRatio && (
          <div>
            <div className="panel-section-title">Formato</div>
            <ChipGroup options={model.ratios.map((r) => ({ id: r, label: r }))} value={ratio} onChange={setRatio} />
          </div>
        )}

        <div>
          <div className="panel-section-title">Calidad</div>
          <ChipGroup options={model.qualities} value={quality} onChange={setQuality} />
        </div>

        {mode === 'video' && (
          <>
            <div className="param-slider-group">
              <div className="slider-label-row">
                <span style={{ color: 'var(--hf-text-secondary)' }}>Duración</span>
                <span className="slider-val-badge">{duration}s</span>
              </div>
              <input type="range" min={model.minDuration} max={model.maxDuration} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </div>
            <label className="toggle-row">
              <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} />
              <span>Generar sonido (cuesta más)</span>
            </label>
          </>
        )}

        <div className="generate-action-wrap">
          {error && <div className="inline-error">{error}</div>}
          <button type="button" className="btn-primary-gradient btn-generate-main" onClick={handleGenerate} disabled={isRunning}>
            <Wand2 size={18} />
            <span>{isRunning ? describeState(state) : `Generar con ${model.name}`}</span>
          </button>
          <div className="cost-estimate-note">
            <Clock size={13} color="#f59e0b" />
            <span>Consume créditos de KIE. Los videos tardan de 1 a 10 minutos.</span>
          </div>
        </div>
      </aside>

      <main className="studio-stage">
        <div className="stage-topbar">
          <div className="media-specs">
            <span style={{ color: '#fff', fontWeight: 600 }}>{result ? result.model : 'Sin resultado todavía'}</span>
            {result?.credits != null && <span className="badge-tag cyan">{result.credits} créditos</span>}
          </div>
          {result && (
            <a href={result.urls[0]} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
              <ExternalLink size={13} /> Abrir / Descargar
            </a>
          )}
        </div>

        <div className="stage-viewport">
          <div className="video-player-frame">
            <ResultStage result={result} mode={mode} />
          </div>

          {isRunning && (
            <div className="generating-overlay">
              <div className="generating-modal-card">
                <div className="spinner-pulse-ring" />
                <h3 style={{ fontSize: 18, marginBottom: 4 }}>{describeState(state)}</h3>
                <p style={{ fontSize: 13, color: 'var(--hf-text-secondary)' }}>
                  Puedes cambiar de pestaña; el resultado también quedará en Historial.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
