// Configuración: muestra si el servidor tiene la clave de KIE, el saldo real
// y permite escribir la contraseña de acceso (solo si la app está publicada).
// Las claves de IA YA NO se escriben aquí: viven en el servidor (.env).
import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Save, Check, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { getHealth, getAppPassword, setAppPassword } from '../services/aiService';

function StatusRow({ ok, okText, badText }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
      {ok ? <ShieldCheck size={16} color="var(--hf-accent-emerald)" /> : <AlertCircle size={16} color="var(--hf-accent-rose)" />}
      <span>{ok ? okText : badText}</span>
    </div>
  );
}

export function SettingsView({ onHealthChange }) {
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState('');
  const [password, setPassword] = useState(getAppPassword);
  const [saved, setSaved] = useState(false);

  // Pide el estado al servidor y lo guarda (sin cambios de estado síncronos)
  const loadHealth = useCallback(
    () => getHealth()
      .then((data) => {
        setHealth(data);
        setHealthError('');
        if (onHealthChange) onHealthChange(data);
      })
      .catch((err) => setHealthError(err.message)),
    [onHealthChange]
  );

  // Al abrir Configuración, revisamos el estado una vez
  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  const refresh = () => loadHealth();

  const handleSave = () => {
    setAppPassword(password.trim());
    loadHealth(); // refresca el saldo con la contraseña nueva
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
      <div className="module-hero-header">
        <div>
          <h2>
            <Settings size={28} color="#06b6d4" />
            <span>Configuración</span>
          </h2>
          <p>Estado de la conexión con KIE.ai y acceso a la app.</p>
        </div>
      </div>

      <div className="quanta-card" style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
        <div className="panel-section-title">
          <span>1. Conexión con KIE.ai</span>
          <button type="button" className="chip-btn" onClick={refresh}><RefreshCw size={12} /> Revisar</button>
        </div>
        {healthError && <div className="inline-error">{healthError}</div>}
        {health && (
          <>
            <StatusRow ok={health.kieConfigured} okText="La clave de KIE está configurada en el servidor." badText="Falta KIE_API_KEY en el servidor." />
            {health.credits != null && (
              <div style={{ fontSize: 14 }}>Saldo disponible: <strong>{health.credits} créditos</strong></div>
            )}
          </>
        )}
        <div className="help-box">
          <strong>¿Cómo se configura la clave?</strong>
          <ol>
            <li>Copia tu clave en <a href="https://kie.ai/api-key" target="_blank" rel="noreferrer">kie.ai/api-key</a>.</li>
            <li>En tu PC: abre el archivo <code>.env</code> del proyecto y escribe <code>KIE_API_KEY=&lt;tu clave&gt;</code>. Luego reinicia <code>npm run dev</code>.</li>
            <li>Publicado en Vercel: agrégala en <em>Settings → Environment Variables</em>.</li>
          </ol>
          La clave nunca se guarda en el navegador ni aparece en el código de la página.
        </div>
      </div>

      <div className="quanta-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="panel-section-title">2. Contraseña de acceso</div>
        <p style={{ fontSize: 13, color: 'var(--hf-text-secondary)' }}>
          {health?.passwordRequired
            ? 'Esta app pide contraseña. Escribe la misma que pusiste en APP_PASSWORD.'
            : 'En tu PC no hace falta. Si publicas la app, define APP_PASSWORD en Vercel para que nadie más gaste tus créditos.'}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña de acceso"
            autoComplete="current-password"
            style={{ flex: 1 }}
          />
          <button type="button" className="btn-primary-gradient" onClick={handleSave}>
            {saved ? <Check size={16} /> : <Save size={16} />}
            <span>{saved ? 'Guardada' : 'Guardar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
