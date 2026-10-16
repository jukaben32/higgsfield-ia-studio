import React, { useState, useEffect } from 'react';
import { Clapperboard, Film, Wand2, Users, Megaphone, History, Settings, Coins, Zap } from 'lucide-react';
import { StudioView } from './components/StudioView';
import { CinemaView } from './components/CinemaView';
import { ToolsView } from './components/ToolsView';
import { InfluencerView } from './components/InfluencerView';
import { AdsStudioView } from './components/AdsStudioView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { getHealth } from './services/aiService';
import './styles/studio.css';
import './styles/modules.css';

// Nombre visible de la app: cámbialo aquí y en index.html (<title>)
export const APP_NAME = 'Betha IA Studio';

const NAV_ITEMS = [
  { id: 'studio', label: 'Studio', icon: Clapperboard },
  { id: 'cinema', label: 'Cinema', icon: Film },
  { id: 'tools', label: 'Herramientas', icon: Wand2 },
  { id: 'avatar', label: 'Avatar', icon: Users },
  { id: 'hooks', label: 'Ganchos y guiones', icon: Megaphone },
  { id: 'history', label: 'Historial', icon: History },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export function App() {
  const [activeTab, setActiveTab] = useState('studio');
  const [health, setHealth] = useState(null);
  const [scriptForAvatar, setScriptForAvatar] = useState(null);

  // Al abrir la app revisamos si el servidor está listo y el saldo real
  useEffect(() => {
    getHealth().then(setHealth).catch(() => setHealth(null));
  }, []);

  // Desde "Ganchos y guiones" se puede mandar un guion al Avatar
  const handleUseScript = (text) => {
    setScriptForAvatar({ text, sentAt: Date.now() });
    setActiveTab('avatar');
  };

  // Las vistas quedan montadas (solo se ocultan) para no perder un trabajo en curso
  const view = (id, element) => (
    <div style={{ display: activeTab === id ? 'contents' : 'none' }}>{element}</div>
  );

  return (
    <div className="app-container">
      <div className="ambient-glow" />

      <header className="top-header">
        <div className="brand-section">
          <div className="brand-logo-icon">
            <Zap size={20} color="#ffffff" />
          </div>
          <div className="brand-title-wrap">
            <span className="brand-title">{APP_NAME}</span>
            <span className="brand-subtitle">Videos e imágenes con IA • KIE.ai</span>
          </div>
        </div>

        <nav className="nav-tabs" aria-label="Secciones">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={15} color={isActive ? 'var(--hf-accent-cyan)' : 'inherit'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="header-right-actions">
          {/* Saldo REAL de KIE (o aviso si falta configurar la clave) */}
          <button type="button" className="credits-counter" onClick={() => setActiveTab('settings')} title="Ver configuración">
            <Coins size={14} color="#f59e0b" />
            <span>
              {health?.credits != null
                ? `${health.credits} créditos`
                : health && !health.kieConfigured ? 'Configura KIE'
                  : health?.passwordRequired && !health.authorized ? 'Escribe la contraseña' : '—'}
            </span>
          </button>
        </div>
      </header>

      <div className="main-viewport">
        {view('studio', <StudioView />)}
        {view('cinema', <CinemaView />)}
        {view('tools', <ToolsView />)}
        {view('avatar', <InfluencerView incomingScript={scriptForAvatar} />)}
        {view('hooks', <AdsStudioView onUseScript={handleUseScript} />)}
        {view('history', <HistoryView />)}
        {activeTab === 'settings' && <SettingsView onHealthChange={setHealth} />}
      </div>
    </div>
  );
}

export default App;
