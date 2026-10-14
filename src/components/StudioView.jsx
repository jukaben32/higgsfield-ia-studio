import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Play, Pause, RotateCcw, Download, Maximize2, 
  Layers, Volume2, Wand2, Zap, ArrowRight, Eye, Video, 
  Image as ImageIcon, Sliders, ChevronDown, Check, Share2, Copy
} from 'lucide-react';
import { AI_MODELS, SAMPLE_VIDEOS, CAMERA_PRESETS } from '../data/mockAssets';
import { generateRealVideo } from '../services/aiService';

export function StudioView({ onNavigateToGenjutsu }) {
  const [mode, setMode] = useState('text-to-video');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  
  const [prompt, setPrompt] = useState(
    'Cinematic wide shot, cybernetic protagonist sprint through Tokyo rain at night, volumetric neon fog, reflective puddle splashes, anamorphic lens, 8k resolution'
  );
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [duration, setDuration] = useState(6);
  const [cfgScale, setCfgScale] = useState(7.5);
  const [activeCamera, setActiveCamera] = useState('Anamorphic Pan Right');
  
  // Generation & Player State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationPhase, setGenerationPhase] = useState('');
  const [currentVideo, setCurrentVideo] = useState(SAMPLE_VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  const videoRef = useRef(null);

  // Magic prompt enhancer simulation
  const handleEnhancePrompt = () => {
    const enhancements = [
      ', master shot, unreal engine 5.4 cinematic render, raytraced subsurface scattering, 35mm film grain, 8k raw',
      ', photorealistic octane render, volumetric god rays, dramatic rim lighting, cinematic color grading, IMAX 70mm',
      ', hyper-detailed physics simulation, dynamic cloth ripples, anamorphic bokeh, shallow depth of field'
    ];
    const picked = enhancements[Math.floor(Math.random() * enhancements.length)];
    if (!prompt.includes(picked.slice(0, 10))) {
      setPrompt(prev => prev + picked);
    }
  };

  // Generation Handler: uses real Fal.ai API if key is saved, otherwise high-precision cluster simulator
  const handleStartGeneration = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerationProgress(0);
    setErrorMessage('');

    // Check for saved Fal.ai API Key
    let falKey = '';
    try {
      const saved = localStorage.getItem('hf_studio_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        falKey = parsed.falKey || '';
      }
    } catch (e) {}

    if (!falKey && typeof import.meta !== 'undefined' && import.meta.env?.VITE_FAL_KEY) {
      falKey = import.meta.env.VITE_FAL_KEY;
    }

    if (falKey) {
      // REAL GENERATION VIA FAL.AI
      setGenerationPhase(`Connected to Fal.ai H100 cluster • Dispatching ${selectedModel.name}...`);
      setGenerationProgress(20);

      try {
        const result = await generateRealVideo({
          prompt,
          model: selectedModel.id,
          aspectRatio: selectedRatio,
          duration,
          falKey
        });

        setGenerationProgress(100);
        setGenerationPhase('Generation complete! Loading 4K MP4 stream...');

        setTimeout(() => {
          setIsGenerating(false);
          const newVideo = {
            id: `real-${Date.now()}`,
            title: prompt.slice(0, 28) + '...',
            model: selectedModel.name,
            prompt: prompt,
            url: result.videoUrl,
            duration: `0:0${duration}`,
            likes: '1',
            views: '1'
          };
          setCurrentVideo(newVideo);
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
          }
        }, 500);
      } catch (err) {
        console.error('Real generation error:', err);
        setErrorMessage(err.message || 'Generation error');
        setIsGenerating(false);
      }
      return;
    }

    // SIMULATED PIPELINE (When no key is configured)
    const phases = [
      { p: 15, msg: 'Validating safety & prompt embeddings (fnf-score)...' },
      { p: 35, msg: `Sampling latent diffusion noise on ${selectedModel.name}...` },
      { p: 65, msg: 'Computing Genjutsu temporal motion vectors...' },
      { p: 85, msg: 'Upscaling frames to 4K cinematic clarity...' },
      { p: 98, msg: 'Synthesizing Dolby audio track & packaging MP4...' }
    ];

    let currentPhaseIdx = 0;
    setGenerationPhase(phases[0].msg);

    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        const next = prev + 2;
        if (currentPhaseIdx < phases.length && next >= phases[currentPhaseIdx].p) {
          setGenerationPhase(phases[currentPhaseIdx].msg);
          currentPhaseIdx++;
        }
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsGenerating(false);
            const nextIdx = (SAMPLE_VIDEOS.findIndex(v => v.id === currentVideo.id) + 1) % SAMPLE_VIDEOS.length;
            setCurrentVideo(SAMPLE_VIDEOS[nextIdx]);
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
              videoRef.current.play().catch(() => {});
              setIsPlaying(true);
            }
          }, 600);
          return 100;
        }
        return next;
      });
    }, 100);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="studio-layout">
      {/* Left Control Panel */}
      <aside className="studio-sidebar">
        {/* Mode Switcher */}
        <div>
          <div className="panel-section-title">Generation Studio Mode</div>
          <div className="mode-switcher">
            <button 
              id="mode-text-to-video"
              className={`mode-btn ${mode === 'text-to-video' ? 'active' : ''}`}
              onClick={() => setMode('text-to-video')}
            >
              <Video size={14} /> Text to Video
            </button>
            <button 
              id="mode-image-to-video"
              className={`mode-btn ${mode === 'image-to-video' ? 'active' : ''}`}
              onClick={() => setMode('image-to-video')}
            >
              <ImageIcon size={14} /> Image to Video
            </button>
          </div>
        </div>

        {/* Model Selector */}
        <div style={{ position: 'relative' }}>
          <div className="panel-section-title">
            <span>Inference Foundation Model</span>
            <span className="badge-tag cyan">{selectedModel.badge}</span>
          </div>
          
          <button 
            id="select-model-dropdown"
            className="model-dropdown-btn"
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
          >
            <div className="model-info-left">
              <div className="model-avatar" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
                {selectedModel.name.slice(0, 1)}
              </div>
              <div>
                <div className="model-name">{selectedModel.name}</div>
                <div className="model-sub">{selectedModel.creator}</div>
              </div>
            </div>
            <ChevronDown size={16} />
          </button>

          {modelDropdownOpen && (
            <div className="model-selector-popover">
              {AI_MODELS.map(m => (
                <div 
                  key={m.id}
                  className={`model-option-item ${selectedModel.id === m.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedModel(m);
                    setModelDropdownOpen(false);
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--hf-text-muted)' }}>{m.desc}</div>
                  </div>
                  <span className={`badge-tag ${m.badgeColor}`}>{m.badge}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prompt Input Area */}
        <div className="prompt-container">
          <div className="panel-section-title">
            <span>Creative Prompt Directive</span>
            <span style={{ color: 'var(--hf-text-muted)' }}>{prompt.length} chars</span>
          </div>
          <textarea
            id="prompt-input"
            className="prompt-textarea"
            placeholder="Describe the cinematic scene in vivid details..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="prompt-actions-bar">
            <button 
              id="enhance-prompt-btn"
              className="btn-prompt-magic" 
              onClick={handleEnhancePrompt}
            >
              <Sparkles size={13} /> Enhance with AI Magic
            </button>
            <span style={{ fontSize: 11, color: 'var(--hf-text-muted)' }}>fnf-score optimized</span>
          </div>
        </div>

        {/* Camera Movements Presets */}
        <div>
          <div className="panel-section-title">Cinematic Camera Motion</div>
          <div className="camera-chips-grid">
            {CAMERA_PRESETS.map((preset) => (
              <button 
                key={preset}
                className={`chip-btn ${activeCamera === preset ? 'active' : ''}`}
                onClick={() => setActiveCamera(preset)}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div>
          <div className="panel-section-title">Aspect Ratio</div>
          <div className="aspect-ratio-grid">
            {[
              { id: '16:9', label: '16:9', box: 'ratio-16-9' },
              { id: '9:16', label: '9:16', box: 'ratio-9-16' },
              { id: '1:1', label: '1:1', box: 'ratio-1-1' },
              { id: '4:5', label: '4:5', box: 'ratio-4-5' }
            ].map(r => (
              <button
                key={r.id}
                className={`aspect-btn ${selectedRatio === r.id ? 'active' : ''}`}
                onClick={() => setSelectedRatio(r.id)}
              >
                <div className={`aspect-box ${r.box}`} />
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Parameters (Duration & CFG) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="param-slider-group">
            <div className="slider-label-row">
              <span style={{ color: 'var(--hf-text-secondary)' }}>Duration</span>
              <span className="slider-val-badge">{duration}s</span>
            </div>
            <input 
              type="range" 
              min={3} 
              max={10} 
              value={duration} 
              onChange={e => setDuration(Number(e.target.value))} 
            />
          </div>

          <div className="param-slider-group">
            <div className="slider-label-row">
              <span style={{ color: 'var(--hf-text-secondary)' }}>Guidance (CFG)</span>
              <span className="slider-val-badge">{cfgScale}</span>
            </div>
            <input 
              type="range" 
              min={3} 
              max={15} 
              step={0.5} 
              value={cfgScale} 
              onChange={e => setCfgScale(Number(e.target.value))} 
            />
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="generate-action-wrap">
          {errorMessage && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: 8, padding: 10, fontSize: 12, color: '#fca5a5' }}>
              <strong>Error de Inferencia:</strong> {errorMessage}
            </div>
          )}

          <button 
            id="generate-video-btn"
            className="btn-primary-gradient btn-generate-main"
            onClick={handleStartGeneration}
            disabled={isGenerating}
          >
            <Wand2 size={18} />
            <span>Generate with {selectedModel.name}</span>
          </button>
          
          <div className="cost-estimate-note">
            <Zap size={13} color="#f59e0b" />
            <span>Estimated cost: {Math.round(duration * selectedModel.costPerSec)} credits (H100 Node)</span>
          </div>
        </div>
      </aside>

      {/* Main Center Stage */}
      <main className="studio-stage">
        {/* Stage Top Header */}
        <div className="stage-topbar">
          <div className="media-specs">
            <span style={{ color: '#fff', fontWeight: 600 }}>{currentVideo.title}</span>
            <span>•</span>
            <span className="badge-tag cyan">{currentVideo.model}</span>
            <span>•</span>
            <span>{selectedRatio} Cinema</span>
            <span>•</span>
            <span>4K 60fps</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
              <Share2 size={13} /> Share
            </button>
            <a 
              href={currentVideo.url} 
              download 
              className="btn-secondary" 
              style={{ padding: '6px 12px', fontSize: 12 }}
            >
              <Download size={13} /> Export MP4
            </a>
          </div>
        </div>

        {/* Viewport & Video Player */}
        <div className="stage-viewport">
          <div className="video-player-frame">
            <video
              ref={videoRef}
              src={currentVideo.url}
              className="rendered-media"
              autoPlay
              loop
              muted={isMuted}
              playsInline
            />

            {/* Quick Action Pill Bar */}
            <div className="media-quick-actions">
              <button className="quick-action-pill" onClick={togglePlay}>
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button 
                className="quick-action-pill" 
                onClick={() => setIsMuted(!isMuted)}
              >
                <Volume2 size={14} color={isMuted ? '#94a3b8' : '#06b6d4'} />
                <span>{isMuted ? 'Unmute' : 'Audio On'}</span>
              </button>
              <button 
                className="quick-action-pill" 
                onClick={() => onNavigateToGenjutsu && onNavigateToGenjutsu()}
              >
                <Zap size={14} color="#a855f7" />
                <span>Motion Transfer This</span>
              </button>
              <button 
                className="quick-action-pill"
                onClick={handleStartGeneration}
              >
                <RotateCcw size={14} />
                <span>Remix</span>
              </button>
            </div>
          </div>

          {/* Real-time Generation Overlay */}
          {isGenerating && (
            <div className="generating-overlay">
              <div className="generating-modal-card">
                <div className="spinner-pulse-ring" />
                <div>
                  <h3 style={{ fontSize: 18, marginBottom: 4 }}>Rendering Neural Video</h3>
                  <p style={{ fontSize: 13, color: 'var(--hf-text-secondary)' }}>{generationPhase}</p>
                </div>

                <div className="progress-track">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>

                <div className="generation-metrics-grid">
                  <div className="metric-cell">
                    <div className="label">GPU NODES</div>
                    <div className="val">8x H100 SXM5</div>
                  </div>
                  <div className="metric-cell">
                    <div className="label">PROGRESS</div>
                    <div className="val">{generationProgress}%</div>
                  </div>
                  <div className="metric-cell">
                    <div className="label">VRAM USAGE</div>
                    <div className="val">74.2 / 80 GB</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
