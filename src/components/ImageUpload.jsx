// Caja para subir una imagen: la envía a /api/upload y devuelve la URL pública.
import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadFile } from '../services/aiService';

const MAX_FILE_MB = 3; // límite para que funcione también publicado en Vercel
const ACCEPTED = 'image/png,image/jpeg,image/webp';

export function ImageUpload({ label, hint, imageUrl, onChange }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    if (!ACCEPTED.split(',').includes(file.type)) {
      setError('Usa una imagen PNG, JPG o WEBP.');
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`La imagen pesa más de ${MAX_FILE_MB} MB. Redúcela y vuelve a intentar.`);
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
        {imageUrl && (
          <button type="button" className="chip-btn" onClick={() => onChange('')}>
            <X size={12} /> Quitar
          </button>
        )}
      </div>

      <div
        className="drop-card-preview-area"
        style={{ height: imageUrl ? 180 : 110 }}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      >
        {isUploading && <Loader2 size={22} className="spin-icon" />}
        {!isUploading && imageUrl && (
          <img src={imageUrl} alt="Imagen subida" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        )}
        {!isUploading && !imageUrl && (
          <>
            <Upload size={20} color="var(--hf-accent-cyan)" />
            <span style={{ fontSize: 12, color: 'var(--hf-text-secondary)', marginTop: 6 }}>
              {hint || 'Haz clic para subir una imagen'}
            </span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <div className="inline-error">{error}</div>}
    </div>
  );
}
