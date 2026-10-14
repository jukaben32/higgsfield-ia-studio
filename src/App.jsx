import React, { useState } from 'react';
import { 
  Clapperboard, Zap, Users, Megaphone, Workflow, 
  Compass, Terminal, Settings, Coins, ShieldCheck
} from 'lucide-react';
import { StudioView } from './components/StudioView';
import { GenjutsuView } from './components/GenjutsuView';
import { InfluencerView } from './components/InfluencerView';
import { AdsStudioView } from './components/AdsStudioView';
import { InfiniteCanvasView } from './components/InfiniteCanvasView';
import { ExploreView } from './components/ExploreView';
import { McpApiView } from './components/McpApiView';
import { SettingsView } from './components/SettingsView';
import { SettingsModal } from './components/SettingsModal';
import './styles/studio.css';
import './styles/modules.css';

export function App() {
  const [activeTab, setActiveTab] = useState('studio');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [credits, setCredits] = useState(850);

  const navItems = [
    { id: 'studio', label: 'Studio', icon: Clapperboard, badge: 'WAN 3.0' },
    { id: 'genjutsu', label: 'Genjutsu', icon: Zap, badge: 'MOTION' },
    { id: 'influencer', label: 'AI Influencer', icon: Users, badge: null },
    { id: 'ads', label: 'Ads Studio', icon: Megaphone, badge: 'AI CMO' },
    { id: 'canvas', label: 'Infinite Canvas', icon: Workflow, badge: null },
    { id: 'explore', label: 'Explore', icon: Compass, badge: null },
    { id: 'mcp', label: 'MCP & API', icon: Terminal, badge: 'v2.0' },
    { id: 'settings', label: 'Configuración', icon: Settings, badge: 'APIs' }
  ];

  return (
    <div className="app-container">
      {/* Subtle Ambient Radial Lighting */}
      <div className="ambient-glow" />

      {/* Top Main Navigation Header */}
      <header className="top-header">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-logo-icon">
            <Zap size={20} color="#ffffff" />
          </div>
          <div className="brand-title-wrap">
            <span className="brand-title">HIGGSFIELD // AETHER</span>
            <span className="brand-subtitle">fnf-core v3.0 • GPU CLUSTER</span>
          </div>
        </div>

        {/* Center Tabs */}
        <nav className="nav-tabs">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={15} color={isActive ? 'var(--hf-accent-cyan)' : 'inherit'} />
                <span>{item.label}</span>
                {item.badge && <span className="tab-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* Right Status & Profile Actions */}
        <div className="header-right-actions">
          <button 
            id="open-settings-header-btn"
            className="btn-primary-gradient" 
            style={{ padding: '7px 14px', fontSize: 12, gap: 6 }}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={15} />
            <span>Configuración</span>
          </button>

          <div className="credits-counter">
            <Coins size={14} color="#f59e0b" />
            <span>{credits} CR</span>
          </div>
        </div>
      </header>

      {/* Viewport Render Area */}
      <div className="main-viewport">
        {activeTab === 'studio' && (
          <StudioView 
            onNavigateToGenjutsu={() => setActiveTab('genjutsu')} 
            onOpenSettings={() => setActiveTab('settings')}
          />
        )}
        {activeTab === 'genjutsu' && <GenjutsuView />}
        {activeTab === 'influencer' && <InfluencerView />}
        {activeTab === 'ads' && <AdsStudioView />}
        {activeTab === 'canvas' && <InfiniteCanvasView />}
        {activeTab === 'explore' && (
          <ExploreView onRemixVideo={() => setActiveTab('studio')} />
        )}
        {activeTab === 'mcp' && (
          <McpApiView onOpenSettings={() => setActiveTab('settings')} />
        )}
        {activeTab === 'settings' && (
          <SettingsView onClose={() => setActiveTab('studio')} />
        )}
      </div>

      {/* Settings Modal (Also accessible if triggered) */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}

export default App;
