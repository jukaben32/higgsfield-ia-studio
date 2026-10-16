// Audio: música con Suno, voz con ElevenLabs, diálogos con varias voces
// y limpieza de audio (dejar solo la voz).
import React, { useState } from 'react';
import { Music, Mic, MessagesSquare, AudioLines, Wand2, Clock, ExternalLink, Plus, Trash2 } from 'lucide-react';
import {
  MUSIC_MODELS, MUSIC_LIMITS, MUSIC_VOCALS, VOICES, VOICE_MODEL, VOICE_TURBO_MODEL, DIALOGUE_MODEL, ISOLATION_MODEL,
} from '../data/models';
import { useGeneration } from '../hooks/useGeneration';
import { describeState } from '../services/aiService';
import { AudioUpload } from './AudioUpload';

const SECTIONS = [
  { id: 'music', label: 'Música (Suno)', icon: Music, desc: 'Crea canciones completas con voz o instrumentales a partir de una idea o de tu propia letra.' },
  { id: 'voice', label: 'Voz', icon: Mic, desc: 'Convierte un texto en una voz natural (ElevenLabs).' },
  { id: 'dialogue', label: 'Diálogo', icon: MessagesSquare, desc: 'Una conversación entre varias voces en un solo audio (ElevenLabs).' },
  { id: 'isolate', label: 'Aislar voz', icon: AudioLines, desc: 'Quita ruido, música y eco de un audio y deja solo la voz (ElevenLabs).' },
];

const VOICE_MODELS = [
  { id: VOICE_MODEL.id, label: 'Multilingual v2 (hasta 1500 caracteres)', max: 1500 },
  { id: VOICE_TURBO_MODEL.id, label: 'Turbo 2.5 (rápida, hasta 5000)', max: VOICE_TURBO_MODEL.maxChars },
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

function Field({ label, children, counter }) {
  return (
    <div>
      <div className="panel-section-title">
        <span>{label}</span>
        {counter && <span style={{ color: 'var(--hf-text-muted)' }}>{counter}</span>}
      </div>
      {children}
    </div>
  );
}

export function AudioView() {
  const [section, setSection] = useState('music');
  const [result, setResult] = useState(null);
  const { run, isRunning, state, error, setError } = useGeneration();

  // Música
  const [musicModel, setMusicModel] = useState(MUSIC_MODELS[0].id);
  const [customMode, setCustomMode] = useState(false);
  const [instrumental, setInstrumental] = useState(false);
  const [style, setStyle] = useState('Pop latino alegre, guitarras y percusión');
  const [idea, setIdea] = useState('Una canción positiva para empezar el día con energía');
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [vocal, setVocal] = useState('');
  const [duration, setDuration] = useState('');

  // Voz y diálogo
  const [voiceModel, setVoiceModel] = useState(VOICE_MODELS[0].id);
  const [voice, setVoice] = useState(VOICES[0].id);
  const [text, setText] = useState('Hola, bienvenido a nuestra agencia. Hoy te contamos cómo la inteligencia artificial puede ayudar a tu negocio.');
  const [lines, setLines] = useState([
    { text: 'Hola, ¿ya viste el nuevo video de la agencia?', voice: VOICES[0].id },
    { text: 'Sí, quedó increíble. ¿Lo hicieron con inteligencia artificial?', voice: VOICES[3].id },
  ]);

  // Aislar voz
  const [audioUrl, setAudioUrl] = useState('');

  const info = SECTIONS.find((s) => s.id === section);
  const voiceMax = VOICE_MODELS.find((m) => m.id === voiceModel).max;
  const dialogueChars = lines.reduce((sum, l) => sum + l.text.length, 0);

  const selectSection = (id) => {
    setSection(id);
    setResult(null);
    setError('');
  };

  const updateLine = (index, patch) => setLines((list) => list.map((l, i) => (i === index ? { ...l, ...patch } : l)));

  // Arma lo que se envía al servidor y lo que se guarda en el historial
  const buildJob = () => {
    if (section === 'music') {
      return {
        params: {
          type: 'music', model: musicModel, customMode, instrumental, style, prompt: idea, title, lyrics,
          vocalGender: vocal, duration: duration === '' ? undefined : Number(duration),
        },
        meta: { type: 'audio', modelName: `Suno ${musicModel}`, prompt: customMode ? `${title} — ${style}` : `${idea} — ${style}` },
      };
    }
    if (section === 'voice') {
      return {
        params: { type: 'voice', model: voiceModel, text, voice },
        meta: { type: 'audio', modelName: voiceModel === VOICE_TURBO_MODEL.id ? VOICE_TURBO_MODEL.name : VOICE_MODEL.name, prompt: text },
      };
    }
    if (section === 'dialogue') {
      return {
        params: { type: 'dialogue', lines },
        meta: { type: 'audio', modelName: DIALOGUE_MODEL.name, prompt: lines.map((l) => l.text).join(' / ') },
      };
    }
    return {
      params: { type: 'isolate', audioUrl },
      meta: { type: 'audio', modelName: ISOLATION_MODEL.name, prompt: 'Aislar la voz de un audio' },
    };
  };

  const handleGenerate = async () => {
    setResult(null);
    const { params, meta } = buildJob();
    const task = await run(params, meta);
    if (task) setResult({ urls: task.urls, credits: task.credits });
  };

  const missingAudio = section === 'isolate' && !audioUrl;

  return (
    <div className="ads-studio-container">
      <div className="module-hero-header">
        <div>
          <h2><Music size={28} color="#06b6d4" /><span>Audio</span></h2>
          <p>{info.desc}</p>
        </div>
      </div>

      <div className="camera-chips-grid" style={{ marginBottom: 20 }}>
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button key={s.id} type="button" className={`chip-btn ${section === s.id ? 'active' : ''}`} onClick={() => selectSection(s.id)}>
              <Icon size={13} /> {s.label}
            </button>
          );
        })}
      </div>

      <div className="influencer-grid">
        <div className="quanta-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {section === 'music' && (
            <>
              <Field label="Versión de Suno">
                <Chips options={MUSIC_MODELS.map((m) => ({ id: m.id, label: m.label }))} value={musicModel} onChange={setMusicModel} />
                <div style={{ fontSize: 11, color: 'var(--hf-text-muted)', marginTop: 6 }}>
                  {MUSIC_MODELS.find((m) => m.id === musicModel).desc}
                </div>
              </Field>
              <Field label="Modo">
                <Chips
                  options={[{ id: 'simple', label: 'Sencillo (una idea)' }, { id: 'custom', label: 'Personalizado (tu letra)' }]}
                  value={customMode ? 'custom' : 'simple'}
                  onChange={(id) => setCustomMode(id === 'custom')}
                />
              </Field>
              <Field label="Estilo musical" counter={`${style.length} / ${MUSIC_LIMITS.styleMax}`}>
                <input type="text" value={style} maxLength={MUSIC_LIMITS.styleMax} onChange={(e) => setStyle(e.target.value)} placeholder="Ej.: Bachata romántica, guitarra suave" />
              </Field>
              <label className="toggle-row">
                <input type="checkbox" checked={instrumental} onChange={(e) => setInstrumental(e.target.checked)} />
                <span>Solo instrumental (sin voz)</span>
              </label>

              {!customMode && (
                <Field label="Idea de la canción" counter={`${idea.length} / ${MUSIC_LIMITS.promptMax}`}>
                  <textarea className="prompt-textarea" maxLength={MUSIC_LIMITS.promptMax} value={idea} onChange={(e) => setIdea(e.target.value)} />
                </Field>
              )}

              {customMode && (
                <>
                  <Field label="Título" counter={`${title.length} / ${MUSIC_LIMITS.titleMax}`}>
                    <input type="text" value={title} maxLength={MUSIC_LIMITS.titleMax} onChange={(e) => setTitle(e.target.value)} placeholder="Nombre de la canción" />
                  </Field>
                  {!instrumental && (
                    <>
                      <Field label="Letra" counter={`${lyrics.length} / ${MUSIC_LIMITS.lyricsMax}`}>
                        <textarea className="prompt-textarea" style={{ minHeight: 160 }} maxLength={MUSIC_LIMITS.lyricsMax} value={lyrics} onChange={(e) => setLyrics(e.target.value)} placeholder="Escribe la letra completa. Separa estrofas con una línea vacía." />
                      </Field>
                      <Field label="Voz">
                        <Chips options={MUSIC_VOCALS.map((v) => ({ id: v.id || 'auto', label: v.label }))} value={vocal || 'auto'} onChange={(id) => setVocal(id === 'auto' ? '' : id)} />
                      </Field>
                    </>
                  )}
                  <Field label={`Duración en segundos (opcional, ${MUSIC_LIMITS.durationMin}–${MUSIC_LIMITS.durationMax})`}>
                    <input type="number" min={MUSIC_LIMITS.durationMin} max={MUSIC_LIMITS.durationMax} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Automática" />
                  </Field>
                </>
              )}
            </>
          )}

          {section === 'voice' && (
            <>
              <Field label="Modelo de voz">
                <Chips options={VOICE_MODELS} value={voiceModel} onChange={setVoiceModel} />
              </Field>
              <Field label="Voz">
                <select value={voice} onChange={(e) => setVoice(e.target.value)} style={{ width: '100%' }}>
                  {VOICES.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
              </Field>
              <Field label="Texto" counter={`${text.length} / ${voiceMax}`}>
                <textarea className="prompt-textarea" style={{ minHeight: 160 }} maxLength={voiceMax} value={text} onChange={(e) => setText(e.target.value)} />
              </Field>
            </>
          )}

          {section === 'dialogue' && (
            <>
              <Field label="Líneas del diálogo" counter={`${dialogueChars} / ${DIALOGUE_MODEL.maxChars} caracteres`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {lines.map((line, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <select value={line.voice} onChange={(e) => updateLine(i, { voice: e.target.value })} style={{ flex: 1 }}>
                          {VOICES.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                        </select>
                        <button type="button" className="btn-secondary" aria-label={`Quitar línea ${i + 1}`} disabled={lines.length === 1} onClick={() => setLines((list) => list.filter((_, n) => n !== i))}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <input type="text" value={line.text} onChange={(e) => updateLine(i, { text: e.target.value })} placeholder={`Línea ${i + 1}`} />
                    </div>
                  ))}
                </div>
              </Field>
              <button
                type="button"
                className="btn-secondary"
                disabled={lines.length >= DIALOGUE_MODEL.maxLines}
                onClick={() => setLines((list) => [...list, { text: '', voice: VOICES[list.length % VOICES.length].id }])}
              >
                <Plus size={13} /> Agregar línea ({lines.length} de {DIALOGUE_MODEL.maxLines})
              </button>
            </>
          )}

          {section === 'isolate' && (
            <AudioUpload label="Audio a limpiar" hint="Sube un MP3 o WAV (máx. 3 MB)" audioUrl={audioUrl} onChange={setAudioUrl} />
          )}

          {missingAudio && <div className="inline-error">Sube primero el audio que quieres limpiar.</div>}
          {error && <div className="inline-error">{error}</div>}
          <button type="button" className="btn-primary-gradient" onClick={handleGenerate} disabled={isRunning || missingAudio}>
            <Wand2 size={16} />
            <span>{isRunning ? describeState(state) : `Generar ${info.label.toLowerCase()}`}</span>
          </button>
          <div className="cost-estimate-note">
            <Clock size={13} color="#f59e0b" />
            <span>
              Consume créditos de KIE.{' '}
              {section === 'music' ? 'Cada pedido devuelve 2 versiones y tarda 1 a 3 minutos.' : 'Suele tardar menos de un minuto.'}
            </span>
          </div>
        </div>

        <div className="quanta-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 }}>
          {result?.urls?.length ? (
            <>
              {result.urls.map((url, i) => (
                <div key={url} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.urls.length > 1 && <span style={{ fontSize: 12, color: 'var(--hf-text-muted)' }}>Versión {i + 1}</span>}
                  <audio src={url} controls style={{ width: '100%' }} />
                  <a href={url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: 12, alignSelf: 'flex-start' }}>
                    <ExternalLink size={13} /> Abrir / Descargar
                  </a>
                </div>
              ))}
              {result.credits != null && <span className="badge-tag cyan">{result.credits} créditos</span>}
            </>
          ) : (
            <div className="empty-stage" style={{ minHeight: 220 }}>
              <Music size={36} />
              <p>{isRunning ? describeState(state) : 'Tu audio aparecerá aquí.'}</p>
              <p style={{ fontSize: 12 }}>Todo lo que generes queda guardado en la pestaña Historial.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
