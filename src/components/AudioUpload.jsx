// Caja para subir un audio (MP3 o WAV): lo envía a /api/upload y devuelve la URL pública.
import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadFile } from '../services/aiService';

const MAX_FILE_MB = 3; // límite para que funcione también publicado en Vercel
const ACCEPTED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav'];

export function AudioUpload({ label, hint, audioUrl, onChange }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Usa un audio MP3 o WAV.');
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`El audio pesa más de ${MAX_FILE_MB} MB. Recórtalo y vuelve a intentar.`);
      return;
    }
    setIsUploading(true);
    try {
      onChange(await uploadFile(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = ''; // permite volver a elegir el mismo archivo
    }
  };

  return (
    <div>
      <div className="panel-section-title">
        <span>{label}</span>
        {audioUrl && (
          <button type="button" className="chip-btn" onClick={() => onChange('')}>
            <X size={12} /> Quitar
          </button>
        )}
      </div>

      {audioUrl ? (
        <audio src={audioUrl} controls style={{ width: '100%' }} />
      ) : (
        <div
          className="drop-card-preview-area"
          style={{ height: 110 }}
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        >
          {isUploading ? <Loader2 size={22} className="spin-icon" /> : (
            <>
              <Upload size={20} color="var(--hf-accent-cyan)" />
              <span style={{ fontSize: 12, color: 'var(--hf-text-secondary)', marginTop: 6 }}>
                {hint || 'Haz clic para subir un audio MP3 o WAV'}
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".mp3,.wav,audio/mpeg,audio/wav"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <div className="inline-error">{error}</div>}
    </div>
  );
}
