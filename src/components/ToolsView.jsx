// Herramientas de edición: mejorar calidad (Topaz), copiar movimiento (Kling)
// y reemplazar el personaje de un video (Wan Animate).
import { useState } from 'react';
import { Sparkles, Move, UserRoundCog, Wand2, Clock } from 'lucide-react';
import { UPSCALE_FACTORS, MOTION_MODEL, REPLACE_MODEL } from '../data/models';
import { useGeneration } from '../hooks/useGeneration';
import { describeState } from '../services/aiService';
import { ImageUpload } from './ImageUpload';
import { VideoSource } from './VideoSource';
import { MediaResult } from './MediaResult';

const TOOLS = [
  { id: 'upscale', label: 'Mejorar calidad', icon: Sparkles, desc: 'Aumenta la resolución y nitidez de una imagen o de un video (Topaz).' },
  { id: 'motion', label: 'Copiar movimiento', icon: Move, desc: 'Toma el movimiento de un video y se lo aplica a tu personaje (Kling 3.0 Motion Control).' },
  { id: 'replace', label: 'Reemplazar personaje', icon: UserRoundCog, desc: 'Cambia a la persona de un video por la de tu foto (Wan 2.2 Animate).' },
];

// Opciones tipo "chip" reutilizables
function Chips({ options, value, onChange }) {
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

export function ToolsView() {
  const [tool, setTool] = useState('upscale');
  const [kind, setKind] = useState('image'); // upscale: image | video
  const [factor, setFactor] = useState('2');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [quality, setQuality] = useState('720p');
  const [orientation, setOrientation] = useState('video');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const { run, isRunning, state, error, setError } = useGeneration();

  const info = TOOLS.find((t) => t.id === tool);

  // Al cambiar de herramienta limpiamos el resultado y los valores que dependen de ella
  const selectTool = (id) => {
    setTool(id);
    setResult(null);
    setError('');
    setQuality(id === 'replace' ? REPLACE_MODEL.resolutions[0] : MOTION_MODEL.modes[0]);
  };

  const selectKind = (next) => {
    setKind(next);
    setResult(null);
    if (!UPSCALE_FACTORS[next].includes(factor)) setFactor('2');
  };

  const handleRun = async () => {
    setResult(null);
    let params;
    let meta;
    if (tool === 'upscale') {
      params = { type: 'upscale', kind, factor, imageUrl, videoUrl };
      meta = { type: kind, modelName: `Topaz ${kind === 'image' ? 'imagen' : 'video'} x${factor}`, prompt: `Mejorar calidad x${factor}` };
    } else if (tool === 'motion') {
      params = { type: 'motion', imageUrl, videoUrl, quality, orientation, prompt };
      meta = { type: 'video', modelName: 'Kling 3.0 Motion Control', prompt: prompt || 'Copiar movimiento' };
    } else {
      params = { type: 'replace', imageUrl, videoUrl, quality };
      meta = { type: 'video', modelName: 'Wan 2.2 Animate Replace', prompt: 'Reemplazar personaje en video' };
    }
    const task = await run(params, meta);
    if (task) setResult({ url: task.urls[0], kind: meta.type, credits: task.credits });
  };

  const needsImage = tool !== 'upscale' || kind === 'image';
  const needsVideo = tool !== 'upscale' || kind === 'video';

  return (
    <div className="ads-studio-container">
      <div className="module-hero-header">
        <div>
          <h2><Wand2 size={28} color="#06b6d4" /><span>Herramientas</span></h2>
          <p>{info.desc}</p>
        </div>
      </div>

      <div className="camera-chips-grid" style={{ marginBottom: 20 }}>
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} type="button" className={`chip-btn ${tool === t.id ? 'active' : ''}`} onClick={() => selectTool(t.id)}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="influencer-grid">
        <div className="quanta-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tool === 'upscale' && (
            <>
              <div>
                <div className="panel-section-title">¿Qué quieres mejorar?</div>
                <Chips options={[{ id: 'image', label: 'Imagen' }, { id: 'video', label: 'Video' }]} value={kind} onChange={selectKind} />
              </div>
              <div>
                <div className="panel-section-title">Aumento</div>
                <Chips options={UPSCALE_FACTORS[kind].map((f) => ({ id: f, label: `x${f}` }))} value={factor} onChange={setFactor} />
              </div>
            </>
          )}

          {tool === 'motion' && (
            <>
              <div>
                <div className="panel-section-title">Calidad</div>
                <Chips options={MOTION_MODEL.modes.map((m) => ({ id: m, label: m }))} value={quality} onChange={setQuality} />
              </div>
              <div>
                <div className="panel-section-title">Orientación del personaje</div>
                <Chips options={MOTION_MODEL.orientations} value={orientation} onChange={setOrientation} />
              </div>
              <input type="text" value={prompt} maxLength={500} onChange={(e) => setPrompt(e.target.value)} placeholder="(Opcional) Describe la escena o el estilo" />
            </>
          )}

          {tool === 'replace' && (
            <div>
              <div className="panel-section-title">Calidad</div>
              <Chips options={REPLACE_MODEL.resolutions.map((r) => ({ id: r, label: r }))} value={quality} onChange={setQuality} />
            </div>
          )}

          {needsImage && (
            <ImageUpload
              label={tool === 'upscale' ? 'Imagen a mejorar' : 'Foto del personaje'}
              hint={tool === 'motion' ? 'Se ve cabeza, hombros y torso (mínimo 340 px)' : 'Haz clic para subir una imagen'}
              imageUrl={imageUrl}
              onChange={setImageUrl}
            />
          )}
          {needsVideo && (
            <VideoSource
              label={tool === 'motion' ? 'Video con el movimiento (3–30 s)' : tool === 'replace' ? 'Video original (máx. 10 MB)' : 'Video a mejorar (máx. 50 MB)'}
              hint="Usa un enlace público https o un video generado aquí."
              value={videoUrl}
              onChange={setVideoUrl}
            />
          )}

          {tool !== 'upscale' && (
            <p style={{ fontSize: 11, color: 'var(--hf-text-muted)' }}>
              Usa solo fotos tuyas o de personas que te dieron permiso. No la uses para suplantar a nadie.
            </p>
          )}

          {error && <div className="inline-error">{error}</div>}
          <button type="button" className="btn-primary-gradient" onClick={handleRun} disabled={isRunning}>
            <Wand2 size={16} />
            <span>{isRunning ? describeState(state) : info.label}</span>
          </button>
          <div className="cost-estimate-note">
            <Clock size={13} color="#f59e0b" />
            <span>Consume créditos de KIE y puede tardar varios minutos.</span>
          </div>
        </div>

        <div className="quanta-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <MediaResult url={result?.url} kind={result?.kind} credits={result?.credits} />
        </div>
      </div>
    </div>
  );
}
