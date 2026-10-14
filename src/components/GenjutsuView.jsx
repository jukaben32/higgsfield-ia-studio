import React, { useState } from 'react';
import { 
  Zap, Upload, Video, Image as ImageIcon, Sliders, Play, 
  RotateCcw, Sparkles, Check, ArrowRight, ShieldCheck, Download
} from 'lucide-react';

export function GenjutsuView() {
  const [wireframeActive, setWireframeActive] = useState(true);
  const [motionStrength, setMotionStrength] = useState(0.85);
  const [preserveBg, setPreserveBg] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [transferred, setTransferred] = useState(false);

  const handleStartTransfer = () => {
    setIsProcessing(true);
    setProcessProgress(0);
    setTransferred(false);

    const interval = setInterval(() => {
      setProcessProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setTransferred(true);
          return 100;
        }
        return prev + 5;
      });
    }, 120);
  };

  return (
    <div className="genjutsu-container">
      {/* Header */}
      <div className="module-hero-header">
        <div>
          <h2>
            <Zap size={28} color="#a855f7" />
            <span>Genjutsu Engine // Motion Transfer & VFX</span>
          </h2>
          <p>
            Extract skeletal kinetics, facial micro-expressions, and spatial motion from any video, 
            and retarget them onto any custom character with temporal coherence.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <span className="badge-tag cyan">v1.0 NEURAL POSE</span>
          <span className="badge-tag purple">ZERO FLICKER</span>
        </div>
      </div>

      {/* Dual Uploaders */}
      <div className="dual-dropzone-grid">
        {/* Slot 1: Source Video */}
        <div className="drop-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>1. Reference Motion Video</span>
            <span className="badge-tag cyan">MP4 / MOV</span>
          </div>

          <div className="drop-card-preview-area">
            <video 
              src="https://assets.mixkit.co/videos/preview/mixkit-fashion-model-walking-in-a-desert-41514-large.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {wireframeActive && (
              <div className="wireframe-toggle-badge">
                <Check size={11} style={{ display: 'inline', marginRight: 4 }} />
                DWPose Skeletal Mesh (240 pts)
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--hf-text-secondary)' }}>Source: Haute_Couture_Walk.mp4</span>
            <button 
              className="btn-secondary" 
              style={{ fontSize: 11, padding: '4px 10px' }}
              onClick={() => setWireframeActive(!wireframeActive)}
            >
              {wireframeActive ? 'Hide Wireframe' : 'Show Wireframe'}
            </button>
          </div>
        </div>

        {/* Slot 2: Target Character */}
        <div className="drop-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>2. Target Subject Character</span>
            <span className="badge-tag purple">Katana Identity</span>
          </div>

          <div className="drop-card-preview-area">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
              alt="Target Avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
              <span className="badge-tag purple">Elena Vance (Anchor #892)</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--hf-text-secondary)' }}>Fidelity Lock: 99.4% Face Consistency</span>
            <button className="btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }}>
              Switch Character
            </button>
          </div>
        </div>
      </div>

      {/* Retargeting Settings & Execution Bar */}
      <div className="quanta-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {/* Motion Strength */}
          <div className="param-slider-group">
            <div className="slider-label-row">
              <span style={{ fontWeight: 600 }}>Kinetic Motion Transfer Strength</span>
              <span className="slider-val-badge">{Math.round(motionStrength * 100)}%</span>
            </div>
            <input 
              type="range" 
              min={0.1} 
              max={1.0} 
              step={0.05} 
              value={motionStrength} 
              onChange={e => setMotionStrength(Number(e.target.value))} 
            />
            <span style={{ fontSize: 11, color: 'var(--hf-text-muted)' }}>
              Controls how strictly the target follows the physical velocities of the source.
            </span>
          </div>

          {/* Preserve Background Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Background Composition</span>
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                className={`btn-secondary ${!preserveBg ? 'active' : ''}`}
                style={{ flex: 1, fontSize: 12, borderColor: !preserveBg ? 'var(--hf-accent-cyan)' : '' }}
                onClick={() => setPreserveBg(false)}
              >
                Synthesize Latent Scene
              </button>
              <button 
                className={`btn-secondary ${preserveBg ? 'active' : ''}`}
                style={{ flex: 1, fontSize: 12, borderColor: preserveBg ? 'var(--hf-accent-cyan)' : '' }}
                onClick={() => setPreserveBg(true)}
              >
                Keep Source Video Plate
              </button>
            </div>
          </div>

          {/* Execute CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <button 
              id="execute-genjutsu-btn"
              className="btn-primary-gradient"
              style={{ width: '100%', padding: '14px', fontSize: 15 }}
              onClick={handleStartTransfer}
              disabled={isProcessing}
            >
              <Zap size={18} />
              <span>{isProcessing ? `Extracting & Retargeting (${processProgress}%)` : 'Run Genjutsu Motion Retarget'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar when computing */}
        {isProcessing && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: 'var(--hf-accent-cyan)' }}>Running fnf-genjutsu spatial tensor mapper...</span>
              <span style={{ fontFamily: 'var(--hf-font-mono)' }}>{processProgress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${processProgress}%` }} />
            </div>
          </div>
        )}

        {/* Result Preview Box */}
        {transferred && (
          <div style={{ marginTop: 20, borderTop: '1px solid var(--hf-border-subtle)', paddingTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge-tag emerald">RETARGET COMPLETE</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Genjutsu Master Render // Elena_Vance_Fashion_Walk.mp4</span>
              </div>
              <a 
                href="https://assets.mixkit.co/videos/preview/mixkit-fashion-model-walking-in-a-desert-41514-large.mp4" 
                download 
                className="btn-secondary" 
                style={{ fontSize: 12, padding: '6px 12px' }}
              >
                <Download size={13} /> Export 4K MP4
              </a>
            </div>

            <div style={{ maxWidth: 800, margin: '0 auto', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--hf-border-highlight)' }}>
              <video 
                src="https://assets.mixkit.co/videos/preview/mixkit-fashion-model-walking-in-a-desert-41514-large.mp4"
                autoPlay
                loop
                muted
                playsInline
                style={{ width: '100%', display: 'block' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
