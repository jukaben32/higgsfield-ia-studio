import React, { useState } from 'react';
import { 
  Megaphone, Sparkles, Globe, ArrowRight, Play, 
  RotateCcw, Sliders, CheckCircle, TrendingUp, Layers, Download
} from 'lucide-react';

export function AdsStudioView() {
  const [productUrl, setProductUrl] = useState('https://lumina-skincare.io/glow-serum');
  const [analyzing, setAnalyzing] = useState(false);
  const [activeHook, setActiveHook] = useState(0);

  const hooks = [
    {
      type: 'Problem / Pain Agitation',
      badge: 'High Conversion',
      headline: 'Why Your $120 Night Cream is Actually Clogging Your Pores',
      script: 'Ever wonder why your skin still feels dry despite 7 different serums? Most brands use mineral fillers. Here is what dermatologists actually use...',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-walking-in-a-desert-41514-large.mp4'
    },
    {
      type: 'Curiosity Gap / Pattern Interrupt',
      badge: 'Viral Hook',
      headline: 'I Swapped My Entire Routine For This 1 Bottle For 30 Days',
      script: 'Do not buy this until you watch this video. Here are the unfiltered day-1 vs day-30 results under microscopic UV lighting...',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-lights-moving-along-motherboard-41527-large.mp4'
    },
    {
      type: 'Secret Hack / Social Proof',
      badge: 'Low CPA',
      headline: 'The $24 French Formula Hollywood Stylists Keep Secret',
      script: 'Celebrity makeup artists have been gatekeeping this for runway shows. Watch how this serum creates an instant glass-skin finish with zero foundation...',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-at-night-with-skyscrapers-and-neon-lights-40822-large.mp4'
    }
  ];

  const handleAnalyzeUrl = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="ads-studio-container">
      {/* Header */}
      <div className="module-hero-header">
        <div>
          <h2>
            <Megaphone size={28} color="#06b6d4" />
            <span>Ads Studio // AI CMO & Hook Multiplier</span>
          </h2>
          <p>
            Autonomous advertising agent (fnf-ai-cmo). Ingest your e-commerce URL or landing page, 
            and generate high-CTR video variations across Meta, TikTok, and YouTube Shorts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <span className="badge-tag cyan">CTR OPTIMIZER v2</span>
          <span className="badge-tag amber">A/B SPLIT TESTING</span>
        </div>
      </div>

      {/* URL Ingestion Card */}
      <div className="quanta-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Globe size={20} color="var(--hf-accent-cyan)" />
        <input 
          type="text" 
          value={productUrl}
          onChange={e => setProductUrl(e.target.value)}
          placeholder="Paste Shopify, Amazon, or Landing page URL..."
          style={{ flex: 1, fontSize: 14 }}
        />
        <button 
          id="analyze-product-btn"
          className="btn-primary-gradient" 
          onClick={handleAnalyzeUrl}
          disabled={analyzing}
        >
          <Sparkles size={16} />
          <span>{analyzing ? 'Extracting Product DNA...' : 'Multiply 3 Ad Hooks'}</span>
        </button>
      </div>

      {/* Generated Hooks Grid */}
      <div className="hooks-grid">
        {hooks.map((hook, idx) => (
          <div 
            key={idx} 
            className="hook-card"
            style={{ 
              borderColor: activeHook === idx ? 'var(--hf-accent-cyan)' : 'var(--hf-border-subtle)',
              boxShadow: activeHook === idx ? '0 0 20px rgba(6, 182, 212, 0.2)' : 'none'
            }}
            onClick={() => setActiveHook(idx)}
          >
            <div className="hook-card-header">
              <span className="badge-tag cyan">{hook.badge}</span>
              <span style={{ fontSize: 11, color: 'var(--hf-text-muted)' }}>Variation #{idx + 1}</span>
            </div>

            <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.4, color: '#fff' }}>
              "{hook.headline}"
            </div>

            <div className="hook-script-preview">
              {hook.script}
            </div>

            <div style={{ borderRadius: 12, overflow: 'hidden', height: 180, position: 'relative' }}>
              <video 
                src={hook.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ 
                position: 'absolute', 
                bottom: 10, 
                left: 10, 
                right: 10, 
                background: 'rgba(0,0,0,0.7)', 
                padding: '6px 10px', 
                borderRadius: 8,
                fontSize: 11,
                color: '#fff',
                fontWeight: 600
              }}>
                Overlay: {hook.headline.slice(0, 36)}...
              </div>
            </div>

            <button 
              className="btn-secondary" 
              style={{ width: '100%', justifyContent: 'center', fontSize: 12, marginTop: 4 }}
            >
              <Download size={13} /> Export 9:16 Ad Package
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
