import React, { useState } from 'react';
import { 
  Compass, Heart, Eye, RotateCcw, Copy, Check, Filter, 
  Sparkles, Search, Play
} from 'lucide-react';
import { SAMPLE_VIDEOS } from '../data/mockAssets';

export function ExploreView({ onRemixVideo }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  const filters = ['All', 'Cinematic 4K', 'Genjutsu Motion', 'Cyberpunk', 'Fashion & Soul', 'Anime / VFX'];

  const handleCopyPrompt = (id, promptText) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="explore-container">
      {/* Header */}
      <div className="module-hero-header">
        <div>
          <h2>
            <Compass size={28} color="#a855f7" />
            <span>Community Explore // Trending Generations</span>
          </h2>
          <p>
            Browse real generations from creators worldwide. Click 'Remix in Studio' 
            to clone the exact prompt, camera vector, and latent seed into your studio.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search prompts, models..." 
              style={{ paddingLeft: 34, width: 240, fontSize: 13 }}
            />
            <Search size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--hf-text-muted)' }} />
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="explore-filter-pills">
        {filters.map(f => (
          <button 
            key={f}
            className={`chip-btn ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Gallery Masonry */}
      <div className="gallery-masonry">
        {SAMPLE_VIDEOS.map(video => (
          <div key={video.id} className="gallery-card">
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <video 
                src={video.url}
                autoPlay
                loop
                muted
                playsInline
                style={{ width: '100%', height: 260, objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: 10, left: 10 }}>
                <span className="badge-tag cyan">{video.model}</span>
              </div>
              <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontFamily: 'var(--hf-font-mono)' }}>
                {video.duration}
              </div>
            </div>

            <div className="gallery-card-overlay">
              <div style={{ fontWeight: 600, fontSize: 14 }}>{video.title}</div>
              <div className="gallery-prompt-text">
                "{video.prompt.slice(0, 95)}..."
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingTop: 10, borderTop: '1px solid var(--hf-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--hf-text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Heart size={13} color="#f43f5e" /> {video.likes}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Eye size={13} /> {video.views}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '6px 10px', fontSize: 11 }}
                    onClick={() => handleCopyPrompt(video.id, video.prompt)}
                  >
                    {copiedId === video.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  </button>
                  <button 
                    className="btn-primary-gradient" 
                    style={{ padding: '6px 12px', fontSize: 11 }}
                    onClick={() => onRemixVideo && onRemixVideo(video)}
                  >
                    <RotateCcw size={12} /> Remix
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
