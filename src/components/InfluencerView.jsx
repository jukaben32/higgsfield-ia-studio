// Avatar que habla: sube una foto + escribe un guion.
// Paso 1: KIE convierte el guion en voz (ElevenLabs).
// Paso 2: KIE anima la foto para que hable con esa voz (Kling AI Avatar).
import React, { useState } from 'react';
import { Users, Wand2, ExternalLink, Mic } from 'lucide-react';
import { VOICES, VOICE_MODEL, AVATAR_MODEL } from '../data/models';
import { useGeneration } from '../hooks/useGeneration';
import { describeState } from '../services/aiService';
import { ImageUpload } from './ImageUpload';

const DEFAULT_SCRIPT = '¿Sigues publicando contenido sin resultados? En nuestra agencia usamos inteligencia artificial para crear videos que venden. Escríbenos hoy y te mostramos cómo.';
const MAX_SCRIPT = 1500;

export function InfluencerView({ incomingScript }) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const [voice, setVoice] = useState(VOICES[0].id);
  const [gesture, setGesture] = useState('');
  const [step, setStep] = useState(''); // texto del paso actual
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const { run, isRunning, state, error, setError } = useGeneration();

  // Si llega un guion nuevo desde la pestaña Guiones ({ text, sentAt }), lo ponemos
  // en el editor. Comparamos sentAt para cargarlo solo una vez por envío.
  const [lastSentAt, setLastSentAt] = useState(null);
  if (incomingScript?.text && incomingScript.sentAt !== lastSentAt) {
    setLastSentAt(incomingScript.sentAt);
    setScript(incomingScript.text.slice(0, MAX_SCRIPT));
  }

  const handleGenerate = async () => {
    if (!photoUrl) {
      setError('Primero sube la foto del personaje.');
      return;
    }
    setVideoUrl('');
    setAudioUrl('');

    // Paso 1: guion → voz
    setStep('Paso 1 de 2: creando la voz');
    const voiceTask = await run(
      { type: 'voice', text: script, voice },
      { type: 'audio', modelName: VOICE_MODEL.name, prompt: script }
    );
    if (!voiceTask) return setStep('');
    setAudioUrl(voiceTask.urls[0]);

    // Paso 2: foto + voz → video del avatar hablando
    setStep('Paso 2 de 2: animando el avatar');
    const avatarTask = await run(
      { type: 'avatar', imageUrl: photoUrl, audioUrl: voiceTask.urls[0], prompt: gesture },
      { type: 'video', modelName: AVATAR_MODEL.name, prompt: script }
    );
    setStep('');
    if (avatarTask) setVideoUrl(avatarTask.urls[0]);
  };

  return (
    <div className="influencer-grid">
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="quanta-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ImageUpload
            label="Foto del personaje"
            hint="Foto de frente, buena luz, rostro visible (PNG/JPG)"
            imageUrl={photoUrl}
            onChange={setPhotoUrl}
          />
          <p style={{ fontSize: 11, color: 'var(--hf-text-muted)' }}>
            Usa solo fotos tuyas o de personas que te dieron permiso.
          </p>
        </div>

        <div className="quanta-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="panel-section-title">
            <span>Voz</span>
            <span className="badge-tag cyan">ElevenLabs</span>
          </div>
          <select value={voice} onChange={(e) => setVoice(e.target.value)} style={{ width: '100%' }}>
            {VOICES.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
          <a
            href={`https://static.aiquickdraw.com/elevenlabs/voice/${voice}.mp3`}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 12, color: 'var(--hf-accent-cyan)', display: 'flex', gap: 6, alignItems: 'center' }}
          >
            <Mic size={13} /> Escuchar muestra de esta voz
          </a>
        </div>
      </aside>

      <main style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="quanta-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 18, display: 'flex', gap: 8, alignItems: 'center' }}>
              <Users size={18} color="var(--hf-accent-cyan)" /> Guion del avatar
            </h3>
            <span style={{ fontSize: 12, color: 'var(--hf-text-muted)' }}>{script.length} / {MAX_SCRIPT}</span>
          </div>
          <textarea
            className="prompt-textarea"
            style={{ minHeight: 140, fontSize: 14 }}
            maxLength={MAX_SCRIPT}
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Escribe lo que dirá el avatar…"
          />
          <input
            type="text"
            value={gesture}
            maxLength={300}
            onChange={(e) => setGesture(e.target.value)}
            placeholder="(Opcional) Gestos y cámara. Ej.: sonríe, mueve las manos, plano medio fijo"
          />

          {error && <div className="inline-error">{error}</div>}
          <button type="button" className="btn-primary-gradient" onClick={handleGenerate} disabled={isRunning} style={{ alignSelf: 'flex-end' }}>
            <Wand2 size={16} />
            <span>{isRunning ? `${step} — ${describeState(state)}` : 'Generar avatar que habla'}</span>
          </button>
          <p style={{ fontSize: 12, color: 'var(--hf-text-muted)', textAlign: 'right' }}>
            Consume créditos de KIE por la voz y por el video (el costo depende de la duración del audio).
          </p>
        </div>

        <div className="quanta-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: 24 }}>
          {audioUrl && <audio src={audioUrl} controls style={{ width: '100%' }} />}
          {videoUrl ? (
            <>
              <video src={videoUrl} controls autoPlay playsInline style={{ maxWidth: 360, width: '100%', borderRadius: 16 }} />
              <a href={videoUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: 12 }}>
                <ExternalLink size={13} /> Abrir / Descargar video
              </a>
            </>
          ) : (
            <div className="empty-stage" style={{ minHeight: 220 }}>
              <Users size={36} />
              <p>{isRunning ? step : 'El video del avatar aparecerá aquí.'}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
