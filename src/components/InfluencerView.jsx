import React, { useState } from 'react';
import { 
  Users, Sparkles, Mic, Volume2, Play, Pause, Video, 
  RotateCcw, Sliders, Check, Download, Wand2, PlusCircle
} from 'lucide-react';
import { AI_INFLUENCERS } from '../data/mockAssets';

export function InfluencerView() {
  const [selectedInfluencer, setSelectedInfluencer] = useState(AI_INFLUENCERS[0]);
  const [script, setScript] = useState(selectedInfluencer.sampleScript);
  const [voiceTone, setVoiceTone] = useState('Viral Hook & High Energy');
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [renderedVideo, setRenderedVideo] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  const handleSelectInfluencer = (inf) => {
    setSelectedInfluencer(inf);
    setScript(inf.sampleScript);
    setRenderedVideo(false);
  };

  const handleRenderInfluencerVideo = () => {
    setIsGeneratingSpeech(true);
    setRenderProgress(0);
    setRenderedVideo(false);

    const interval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGeneratingSpeech(false);
          setRenderedVideo(true);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleSimulateAudioPlay = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      // Simulate synthetic web speech API if available
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(script);
        utterance.rate = 1.05;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsPlayingAudio(false), 5000);
      }
    }
  };

  return (
    <div className="influencer-grid">
      {/* Sidebar: Character & Voice Setup */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="quanta-card">
          <div className="panel-section-title">
            <span>Identity Anchor Model</span>
            <span className="badge-tag purple">Consistence Lock</span>
          </div>

          <div className="avatar-selector-grid">
            {AI_INFLUENCERS.map(inf => (
              <div 
                key={inf.id}
                className={`avatar-card ${selectedInfluencer.id === inf.id ? 'active' : ''}`}
                onClick={() => handleSelectInfluencer(inf)}
              >
                <img src={inf.avatar} alt={inf.name} />
                <div className="avatar-card-name">{inf.name.split(' ')[0]}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--hf-border-subtle)' }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedInfluencer.name}</div>
            <div style={{ fontSize: 12, color: 'var(--hf-text-secondary)', marginTop: 2 }}>
              {selectedInfluencer.niche} • {selectedInfluencer.followers} Reach
            </div>
          </div>
        </div>

        {/* Voice Engine Setup */}
        <div className="quanta-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="panel-section-title">
            <span>Neural Voice & Lip-Sync (fnf-aitys)</span>
            <span className="badge-tag cyan">ElevenLabs</span>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--hf-text-secondary)', display: 'block', marginBottom: 6 }}>
              Cloned Voice Profile
            </label>
            <select 
              value={selectedInfluencer.voice} 
              onChange={() => {}}
              style={{ width: '100%' }}
            >
              <option>{selectedInfluencer.voice}</option>
              <option>FishAudio - Cinematic Storyteller</option>
              <option>ElevenLabs - Adam (Deep Podcast)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--hf-text-secondary)', display: 'block', marginBottom: 6 }}>
              Emotional Cadence & Tone
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Viral Hook', 'Confident Pitch', 'Storytelling', 'Intimate'].map(t => (
                <button 
                  key={t}
                  className={`chip-btn ${voiceTone.includes(t) ? 'active' : ''}`}
                  onClick={() => setVoiceTone(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Waveform Audio Preview */}
          <div className="audio-waveform-box">
            <button 
              id="preview-voice-btn"
              className="btn-primary-gradient" 
              style={{ width: 36, height: 36, padding: 0, borderRadius: '50%' }}
              onClick={handleSimulateAudioPlay}
            >
              {isPlayingAudio ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <div className="waveform-bars">
              {[12, 24, 32, 18, 28, 36, 20, 14, 30, 22, 16, 26, 34, 18, 24, 30, 12, 28].map((h, i) => (
                <div 
                  key={i} 
                  className="wave-bar" 
                  style={{ 
                    height: isPlayingAudio ? `${Math.max(8, (h * (Math.sin(Date.now() / 150 + i) + 1.2)))}px` : `${h / 2}px`,
                    background: isPlayingAudio ? 'var(--hf-accent-cyan)' : 'rgba(255, 255, 255, 0.2)'
                  }} 
                />
              ))}
            </div>
            <span style={{ fontSize: 11, fontFamily: 'var(--hf-font-mono)', color: 'var(--hf-accent-cyan)' }}>
              {isPlayingAudio ? 'PLAYING' : 'AUDIO PREVIEW'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Studio: Script & Generation */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="quanta-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 18 }}>TikTok / Reels Script & Hook Generator</h3>
            <span className="badge-tag cyan">9:16 Vertical Engine</span>
          </div>

          <textarea
            id="influencer-script-input"
            className="prompt-textarea"
            style={{ minHeight: 140, fontSize: 14 }}
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Type or generate the avatar script..."
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                className="btn-secondary"
                style={{ fontSize: 12 }}
                onClick={() => setScript("Stop scrolling! If you are not using AI to automate your content in 2026, you are already falling behind. Here is the exact blueprint...")}
              >
                <Sparkles size={13} color="#06b6d4" /> Generate Viral Hook
              </button>
            </div>

            <button 
              id="render-influencer-video-btn"
              className="btn-primary-gradient"
              onClick={handleRenderInfluencerVideo}
              disabled={isGeneratingSpeech}
            >
              <Wand2 size={16} />
              <span>{isGeneratingSpeech ? `Synthesizing Avatar (${renderProgress}%)` : 'Generate Talking Avatar Video'}</span>
            </button>
          </div>

          {isGeneratingSpeech && (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: 'var(--hf-accent-secondary)' }}>Synchronizing phonemes & LivePortrait lip-sync...</span>
                <span style={{ fontFamily: 'var(--hf-font-mono)' }}>{renderProgress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${renderProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Video Preview */}
        <div className="quanta-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge-tag emerald">9:16 READY FOR TIKTOK/REELS</span>
              <span style={{ fontWeight: 600 }}>{selectedInfluencer.name} • Master Cut</span>
            </div>
            <button className="btn-secondary" style={{ fontSize: 12 }}>
              <Download size={13} /> Export 9:16 MP4
            </button>
          </div>

          <div style={{ width: 340, borderRadius: 20, overflow: 'hidden', border: '1px solid var(--hf-border-highlight)', boxShadow: 'var(--hf-shadow-elevated)' }}>
            <video 
              src="https://assets.mixkit.co/videos/preview/mixkit-fashion-model-walking-in-a-desert-41514-large.mp4"
              autoPlay
              loop
              muted={false}
              playsInline
              style={{ width: '100%', display: 'block' }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
