import React, { useState } from 'react';
import { 
  Workflow, Play, Plus, Zap, Sliders, Maximize2, 
  RotateCcw, Sparkles, CheckCircle2, ArrowRight
} from 'lucide-react';

export function InfiniteCanvasView() {
  const [nodes, setNodes] = useState([
    {
      id: 'node-prompt',
      type: 'Prompt Directive',
      title: '1. Latent Semantic Node',
      x: 60,
      y: 120,
      content: 'Cyberpunk katana dualist in torrential neon rain, 8k raw cinema'
    },
    {
      id: 'node-genjutsu',
      type: 'Motion Extractor',
      title: '2. Genjutsu Pose Engine',
      x: 390,
      y: 80,
      content: 'DWPose Skeleton (240 keypoints) • Source: martial_arts.mp4'
    },
    {
      id: 'node-model',
      type: 'Diffusion Compute',
      title: '3. Wan 3.0 Pro (H100)',
      x: 720,
      y: 130,
      content: 'Steps: 40 • CFG: 7.5 • Resolution: 1920x1080 60fps'
    },
    {
      id: 'node-audio',
      type: 'Acoustic Synthesizer',
      title: '4. fnf-aitys Audio & Lip-sync',
      x: 1040,
      y: 100,
      content: 'Voice: ElevenLabs Serena • Phoneme Sync: LivePortrait'
    }
  ]);

  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);

  const handleRunPipeline = () => {
    setIsRunningPipeline(true);
    setActiveStep(0);

    const stepInterval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= nodes.length - 1) {
          clearInterval(stepInterval);
          setIsRunningPipeline(false);
          return nodes.length - 1;
        }
        return prev + 1;
      });
    }, 900);
  };

  return (
    <div className="canvas-wrapper">
      {/* Floating Canvas Toolbar */}
      <div className="canvas-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13 }}>
          <Workflow size={16} color="var(--hf-accent-cyan)" />
          <span>Canvas Graph Engine (canvas-worker)</span>
        </div>

        <span style={{ height: 16, width: 1, background: 'var(--hf-border-subtle)' }} />

        <button 
          id="run-canvas-pipeline-btn"
          className="btn-primary-gradient" 
          style={{ padding: '6px 14px', fontSize: 12 }}
          onClick={handleRunPipeline}
          disabled={isRunningPipeline}
        >
          <Play size={13} />
          <span>{isRunningPipeline ? 'Executing Graph Nodes...' : 'Run Full Pipeline'}</span>
        </button>

        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
          <Plus size={13} /> Add Node
        </button>
      </div>

      {/* SVG Connecting Curves */}
      <svg 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          width: '100%', 
          height: '100%', 
          pointerEvents: 'none', 
          zIndex: 5 
        }}
      >
        <path 
          d="M 340 180 C 365 180, 365 140, 390 140" 
          stroke={activeStep >= 1 ? '#06b6d4' : 'rgba(255,255,255,0.2)'} 
          strokeWidth="2.5" 
          fill="none" 
          strokeDasharray={isRunningPipeline && activeStep === 0 ? "5,5" : "none"}
        />
        <path 
          d="M 670 140 C 695 140, 695 190, 720 190" 
          stroke={activeStep >= 2 ? '#a855f7' : 'rgba(255,255,255,0.2)'} 
          strokeWidth="2.5" 
          fill="none" 
          strokeDasharray={isRunningPipeline && activeStep === 1 ? "5,5" : "none"}
        />
        <path 
          d="M 1000 190 C 1020 190, 1020 160, 1040 160" 
          stroke={activeStep >= 3 ? '#10b981' : 'rgba(255,255,255,0.2)'} 
          strokeWidth="2.5" 
          fill="none" 
          strokeDasharray={isRunningPipeline && activeStep === 2 ? "5,5" : "none"}
        />
      </svg>

      {/* Interactive Nodes */}
      {nodes.map((node, idx) => (
        <div 
          key={node.id}
          className={`canvas-node ${activeStep === idx ? 'selected' : ''}`}
          style={{ 
            left: node.x, 
            top: node.y, 
            zIndex: 10,
            borderColor: activeStep === idx ? 'var(--hf-accent-cyan)' : 'var(--hf-border-subtle)',
            boxShadow: activeStep === idx ? '0 0 25px rgba(6, 182, 212, 0.4)' : 'none'
          }}
        >
          <div className="node-header">
            <span>{node.title}</span>
            {activeStep === idx && <span className="pulse-dot" />}
          </div>
          <div className="node-body">
            <span style={{ fontSize: 10, color: 'var(--hf-text-muted)', textTransform: 'uppercase' }}>
              {node.type}
            </span>
            <div style={{ color: '#fff', fontSize: 12 }}>
              {node.content}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: 11 }}>
              <span style={{ color: 'var(--hf-accent-cyan)' }}>In/Out Pin: OK</span>
              <span style={{ color: 'var(--hf-text-muted)' }}>ID: #{idx + 101}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
