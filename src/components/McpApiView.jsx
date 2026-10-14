import React, { useState } from 'react';
import { 
  Terminal, Key, Code2, Copy, Check, Play, 
  Cpu, Server, ExternalLink, ShieldCheck, Zap
} from 'lucide-react';
import { MCP_TOOLS_SPEC } from '../data/mockAssets';

export function McpApiView({ onOpenSettings }) {
  const [selectedTool, setSelectedTool] = useState(MCP_TOOLS_SPEC[0]);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeSnippetTab, setActiveSnippetTab] = useState('curl');
  const [testOutput, setTestOutput] = useState(null);
  const [isCallingRpc, setIsCallingRpc] = useState(false);

  const apiKeyId = "hf_live_99a8882bc4";
  const apiKeySecret = "sk_prod_77b319e8a04dfc919248";

  const handleCopyKeys = () => {
    navigator.clipboard.writeText(`Authorization: Key ${apiKeyId}:${apiKeySecret}`);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleTestRpc = () => {
    setIsCallingRpc(true);
    setTestOutput(null);

    setTimeout(() => {
      setIsCallingRpc(false);
      setTestOutput({
        jsonrpc: "2.0",
        id: "mcp_req_9921b",
        result: {
          status: "queued",
          task_id: "task_h100_88712a",
          estimated_seconds: 14.5,
          endpoint: `https://fnf-api-gw.higgsfield.ai/v1/${selectedTool.name}`,
          model_allocated: "wan-3.0-sxm5-cluster",
          safety_score: 0.994
        }
      });
    }, 700);
  };

  const snippets = {
    curl: `curl -X POST https://api.higgsfield.ai/v1/generate/video \\
  -H "Authorization: Key ${apiKeyId}:${apiKeySecret}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Cinematic 8k cybernetic sprint in rain",
    "model": "wan-3.0",
    "aspect_ratio": "16:9",
    "duration": 6
  }'`,
    python: `from higgsfield import HiggsfieldClient

client = HiggsfieldClient(
    key_id="${apiKeyId}",
    secret="${apiKeySecret}"
)

# Launch Video Generation
task = client.video.create(
    model="wan-3.0",
    prompt="Cinematic 8k cybernetic sprint in rain",
    aspect_ratio="16:9",
    duration=6
)

print(f"Task Queued: {task.id}")
result = task.wait_for_completion()
print(f"Video URL: {result.video_url}")`,
    mcp: `{
  "mcpServers": {
    "higgsfield": {
      "command": "npx",
      "args": ["-y", "@higgsfield/mcp"],
      "env": {
        "HIGGSFIELD_API_KEY_ID": "${apiKeyId}",
        "HIGGSFIELD_API_KEY_SECRET": "${apiKeySecret}"
      }
    }
  }
}`
  };

  return (
    <div className="mcp-container">
      {/* Header */}
      <div className="module-hero-header">
        <div>
          <h2>
            <Terminal size={28} color="#06b6d4" />
            <span>Developer Cloud API & MCP Agent Gateway</span>
          </h2>
          <p>
            Native Model Context Protocol (MCP) server (`@higgsfield/mcp`) and REST API gateway. 
            Connect Claude, Cursor, AutoGPT, and custom agents directly to your GPU video pipeline.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <span className="badge-tag cyan">MCP SPEC 2024-11-05</span>
          <span className="badge-tag emerald">GATEWAY HEALTHY</span>
        </div>
      </div>

      {/* Settings Action Banner */}
      <div className="quanta-card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)', borderColor: 'rgba(99, 102, 241, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>
            ⚙️ Conecta tus claves API personales (Fal.ai, ElevenLabs, Replicate)
          </div>
          <div style={{ fontSize: 12, color: 'var(--hf-text-secondary)', marginTop: 2 }}>
            Configura tus claves para generar vídeos reales para YouTube y Publicidad directamente desde el estudio.
          </div>
        </div>
        <button 
          id="mcp-open-settings-cta"
          className="btn-primary-gradient"
          style={{ padding: '8px 20px', fontSize: 13 }}
          onClick={() => onOpenSettings && onOpenSettings()}
        >
          ⚙️ Ir a Configuración de Claves
        </button>
      </div>

      {/* API Key Box */}
      <div className="quanta-card" style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={16} color="#f59e0b" />
            <span style={{ fontWeight: 600 }}>Active Production API Credentials</span>
          </div>
          <div style={{ fontFamily: 'var(--hf-font-mono)', fontSize: 13, color: 'var(--hf-text-secondary)', marginTop: 4 }}>
            ID: <span style={{ color: '#fff' }}>{apiKeyId}</span> • SECRET: <span style={{ color: '#fff' }}>{apiKeySecret.slice(0, 10)}****************</span>
          </div>
        </div>

        <button 
          id="copy-api-key-btn"
          className="btn-secondary" 
          onClick={handleCopyKeys}
        >
          {copiedKey ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          <span>{copiedKey ? 'Credentials Copied!' : 'Copy Auth Header'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left: Interactive MCP Tools Tester */}
        <div className="quanta-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={16} color="var(--hf-accent-cyan)" />
              <span>Available MCP Agent Tools</span>
            </h3>
            <span className="badge-tag purple">JSON-RPC 2.0</span>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {MCP_TOOLS_SPEC.map(tool => (
              <button
                key={tool.name}
                className={`chip-btn ${selectedTool.name === tool.name ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTool(tool);
                  setTestOutput(null);
                }}
              >
                {tool.name}
              </button>
            ))}
          </div>

          <div style={{ background: 'rgba(0,0,0,0.35)', padding: 14, borderRadius: 10, border: '1px solid var(--hf-border-subtle)' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#fff', marginBottom: 4 }}>
              Tool: {selectedTool.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--hf-text-secondary)', marginBottom: 12 }}>
              {selectedTool.description}
            </div>

            <div style={{ fontSize: 11, fontFamily: 'var(--hf-font-mono)', color: 'var(--hf-accent-cyan)' }}>
              Parameters Schema:
            </div>
            <pre style={{ fontSize: 11, fontFamily: 'var(--hf-font-mono)', color: '#94a3b8', margin: '6px 0 0', overflowX: 'auto' }}>
              {JSON.stringify(selectedTool.parameters, null, 2)}
            </pre>
          </div>

          <button 
            id="test-mcp-rpc-btn"
            className="btn-primary-gradient"
            onClick={handleTestRpc}
            disabled={isCallingRpc}
          >
            <Play size={14} />
            <span>{isCallingRpc ? 'Transmitting to fnf-agent-gateway...' : 'Execute Test JSON-RPC Call'}</span>
          </button>

          {testOutput && (
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 11, color: 'var(--hf-accent-emerald)', marginBottom: 4, fontWeight: 600 }}>
                RPC 200 OK Response:
              </div>
              <pre className="code-snippet-box" style={{ margin: 0, padding: 12 }}>
                {JSON.stringify(testOutput, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Right: Code Integration Snippets */}
        <div className="quanta-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Code2 size={16} color="var(--hf-accent-secondary)" />
              <span>Integration SDK & MCP Config</span>
            </h3>

            <div style={{ display: 'flex', gap: 4 }}>
              {['curl', 'python', 'mcp'].map(tab => (
                <button
                  key={tab}
                  className={`chip-btn ${activeSnippetTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveSnippetTab(tab)}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="code-snippet-box">
            <button 
              className="btn-copy-code"
              onClick={() => {
                navigator.clipboard.writeText(snippets[activeSnippetTab]);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
            >
              {copiedCode ? 'Copied!' : 'Copy Code'}
            </button>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'var(--hf-font-mono)' }}>
              {snippets[activeSnippetTab]}
            </pre>
          </div>

          <div style={{ fontSize: 12, color: 'var(--hf-text-secondary)', lineHeight: 1.6 }}>
            💡 <strong>Claude Desktop / Antigravity Tip:</strong> Add the <code>mcp.json</code> block to your local MCP client to control your video studio directly through natural language agent prompts!
          </div>
        </div>
      </div>
    </div>
  );
}
