// Cinema: un solo video con varios planos (Kling 3.0 multi-plano).
// Cada plano tiene su propia descripción y duración; la suma debe dar 3–15 s.
import { useState } from 'react';
import { Clapperboard, Plus, Trash2, Wand2, Clock } from 'lucide-react';
import { CINEMA_LIMITS as L, VIDEO_MODELS } from '../data/models';
import { useGeneration } from '../hooks/useGeneration';
import { describeState } from '../services/aiService';
import { ImageUpload } from './ImageUpload';
import { MediaResult } from './MediaResult';

const KLING = VIDEO_MODELS.find((m) => m.id === 'kling-3');

const STARTER_SHOTS = [
  { prompt: 'Plano general de una calle de ciudad al amanecer, la cámara avanza lentamente', duration: 3 },
  { prompt: 'Primer plano del rostro de una mujer que sonríe a la cámara, luz suave', duration: 3 },
];

export function CinemaView() {
  const [shots, setShots] = useState(STARTER_SHOTS);
  const [ratio, setRatio] = useState('9:16');
  const [quality, setQuality] = useState('std');
  const [sound, setSound] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [result, setResult] = useState(null);
  const { run, isRunning, state, error } = useGeneration();

  const total = shots.reduce((sum, s) => sum + s.duration, 0);
  const totalOk = total >= L.totalMinSec && total <= L.totalMaxSec;

  // Actualiza un plano creando una copia (sin modificar el arreglo original)
  const updateShot = (index, changes) =>
    setShots((list) => list.map((s, i) => (i === index ? { ...s, ...changes } : s)));
  const addShot = () =>
    setShots((list) => (list.length < L.maxShots ? [...list, { prompt: '', duration: 3 }] : list));
  const removeShot = (index) =>
    setShots((list) => (list.length > 1 ? list.filter((_, i) => i !== index) : list));

  const handleGenerate = async () => {
    setResult(null);
    const summary = shots.map((s) => s.prompt).join(' | ');
    const task = await run(
      { type: 'cinema', shots, ratio, quality, sound, imageUrl },
      { type: 'video', modelName: `Kling 3.0 Cinema (${shots.length} planos)`, prompt: summary }
    );
    if (task) setResult({ url: task.urls[0], credits: task.credits });
  };

  return (
    <div className="ads-studio-container">
      <div className="module-hero-header">
        <div>
          <h2><Clapperboard size={28} color="#06b6d4" /><span>Cinema</span></h2>
          <p>Arma una escena con hasta {L.maxShots} planos. Kling mantiene el mismo estilo y personajes entre planos.</p>
        </div>
      </div>

      <div className="influencer-grid">
        <div className="quanta-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {shots.map((shot, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 12, borderBottom: '1px solid var(--hf-border-subtle)' }}>
              <div className="panel-section-title">
                <span>Plano {i + 1}</span>
                <span style={{ color: 'var(--hf-text-muted)' }}>{shot.prompt.length} / {L.shotMaxChars}</span>
              </div>
              <textarea
                className="prompt-textarea"
                style={{ minHeight: 70 }}
                maxLength={L.shotMaxChars}
                value={shot.prompt}
                onChange={(e) => updateShot(i, { prompt: e.target.value })}
                placeholder="Describe qué se ve y qué hace la cámara en este plano"
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="range" min={L.shotMinSec} max={L.shotMaxSec} value={shot.duration}
                  onChange={(e) => updateShot(i, { duration: Number(e.target.value) })}
                  style={{ flex: 1 }}
                  aria-label={`Duración del plano ${i + 1}`}
                />
                <span className="slider-val-badge">{shot.duration}s</span>
                {shots.length > 1 && (
                  <button type="button" className="chip-btn" aria-label={`Quitar plano ${i + 1}`} onClick={() => removeShot(i)}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}

          <button type="button" className="btn-secondary" onClick={addShot} disabled={shots.length >= L.maxShots} style={{ justifyContent: 'center' }}>
            <Plus size={14} /> Agregar plano
          </button>

          <div className={totalOk ? 'cost-estimate-note' : 'inline-error'}>
            Duración total: <strong>{total}s</strong> (debe estar entre {L.totalMinSec} y {L.totalMaxSec}s)
          </div>

          <ImageUpload label="Imagen del primer plano (opcional)" hint="Si la subes, el video parte de esta foto" imageUrl={imageUrl} onChange={setImageUrl} />

          {!imageUrl && (
            <div>
              <div className="panel-section-title">Formato</div>
              <div className="camera-chips-grid">
                {KLING.ratios.map((r) => (
                  <button key={r} type="button" className={`chip-btn ${ratio === r ? 'active' : ''}`} onClick={() => setRatio(r)}>{r}</button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="panel-section-title">Calidad</div>
            <div className="camera-chips-grid">
              {KLING.qualities.map((q) => (
                <button key={q.id} type="button" className={`chip-btn ${quality === q.id ? 'active' : ''}`} onClick={() => setQuality(q.id)}>{q.label}</button>
              ))}
            </div>
          </div>

          <label className="toggle-row">
            <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} />
            <span>Generar sonido (cuesta más)</span>
          </label>

          {error && <div className="inline-error">{error}</div>}
          <button type="button" className="btn-primary-gradient" onClick={handleGenerate} disabled={isRunning || !totalOk}>
            <Wand2 size={16} />
            <span>{isRunning ? describeState(state) : 'Generar escena'}</span>
          </button>
          <div className="cost-estimate-note">
            <Clock size={13} color="#f59e0b" />
            <span>Se cobra por la suma de los planos. Puede tardar varios minutos.</span>
          </div>
        </div>

        <div className="quanta-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <MediaResult url={result?.url} kind="video" credits={result?.credits} emptyText="Tu escena aparecerá aquí." />
        </div>
      </div>
    </div>
  );
}
