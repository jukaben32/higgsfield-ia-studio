import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const home = os.homedir();
const mcpServerScript = 'C:\\Users\\IA Power Engine\\MisProyectos\\higgsfield-ai-studio\\mcp-server\\index.mjs';
const nodePath = process.execPath;

const results = {};

// 1. Antigravity (~/.gemini/config/mcp_config.json)
try {
  const antigravityPath = path.join(home, '.gemini', 'config', 'mcp_config.json');
  if (fs.existsSync(antigravityPath)) {
    const raw = fs.readFileSync(antigravityPath, 'utf8');
    const data = JSON.parse(raw);
    if (!data.mcpServers) data.mcpServers = {};
    data.mcpServers['higgsfield-studio'] = {
      command: nodePath,
      args: [mcpServerScript],
    };
    fs.writeFileSync(antigravityPath, JSON.stringify(data, null, 2), 'utf8');
    results['antigravity'] = 'OK (mcp_config.json updated)';
  } else {
    results['antigravity'] = 'File not found';
  }
} catch (e) {
  results['antigravity'] = `Error: ${e.message}`;
}

// 2. Claude Desktop (%APPDATA%\Claude\claude_desktop_config.json)
try {
  const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
  const claudeDesktopDir = path.join(appData, 'Claude');
  const claudeDesktopPath = path.join(claudeDesktopDir, 'claude_desktop_config.json');
  if (!fs.existsSync(claudeDesktopDir)) {
    fs.mkdirSync(claudeDesktopDir, { recursive: true });
  }
  let data = { mcpServers: {} };
  if (fs.existsSync(claudeDesktopPath)) {
    try {
      data = JSON.parse(fs.readFileSync(claudeDesktopPath, 'utf8'));
      if (!data.mcpServers) data.mcpServers = {};
    } catch (_) {}
  }
  data.mcpServers['higgsfield-studio'] = {
    command: nodePath,
    args: [mcpServerScript],
  };
  fs.writeFileSync(claudeDesktopPath, JSON.stringify(data, null, 2), 'utf8');
  results['claude_desktop'] = `OK (${claudeDesktopPath})`;
} catch (e) {
  results['claude_desktop'] = `Error: ${e.message}`;
}

// 3. Claude Code (~/.claude.json and ~/.claude/.mcp.json)
try {
  const claudeGlobalJson = path.join(home, '.claude.json');
  const claudeDotMcp = path.join(home, '.claude', '.mcp.json');

  if (fs.existsSync(claudeGlobalJson)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(claudeGlobalJson, 'utf8'));
      if (!parsed.mcpServers) parsed.mcpServers = {};
      parsed.mcpServers['higgsfield-studio'] = {
        command: nodePath,
        args: [mcpServerScript],
      };
      fs.writeFileSync(claudeGlobalJson, JSON.stringify(parsed, null, 2), 'utf8');
      results['claude_code_global'] = `OK (${claudeGlobalJson})`;
    } catch (e) {
      results['claude_code_global'] = `Error: ${e.message}`;
    }
  }

  if (fs.existsSync(path.join(home, '.claude'))) {
    let dotMcpData = { mcpServers: {} };
    if (fs.existsSync(claudeDotMcp)) {
      try {
        dotMcpData = JSON.parse(fs.readFileSync(claudeDotMcp, 'utf8'));
        if (!dotMcpData.mcpServers) dotMcpData.mcpServers = {};
      } catch (_) {}
    }
    dotMcpData.mcpServers['higgsfield-studio'] = {
      command: nodePath,
      args: [mcpServerScript],
    };
    fs.writeFileSync(claudeDotMcp, JSON.stringify(dotMcpData, null, 2), 'utf8');
    results['claude_code_dot_mcp'] = `OK (${claudeDotMcp})`;
  }
} catch (e) {
  results['claude_code'] = `Error: ${e.message}`;
}

// 4. Codex (~/.codex/config.toml)
try {
  const codexConfigPath = path.join(home, '.codex', 'config.toml');
  if (fs.existsSync(codexConfigPath)) {
    let tomlContent = fs.readFileSync(codexConfigPath, 'utf8');
    if (!tomlContent.includes('[mcp_servers.higgsfield-studio]')) {
      const sanitizedNode = nodePath.replace(/\\/g, '\\\\');
      const sanitizedScript = mcpServerScript.replace(/\\/g, '\\\\');
      const block = `\n[mcp_servers.higgsfield-studio]\ncommand = "${sanitizedNode}"\nargs = ["${sanitizedScript}"]\n`;
      fs.writeFileSync(codexConfigPath, tomlContent + block, 'utf8');
      results['codex'] = `OK (Added to ${codexConfigPath})`;
    } else {
      results['codex'] = `Already present in ${codexConfigPath}`;
    }
  } else {
    results['codex'] = 'File not found';
  }
} catch (e) {
  results['codex'] = `Error: ${e.message}`;
}

// 5. OpenCode (~/.config/opencode/opencode.json)
try {
  const opencodeDir = path.join(home, '.config', 'opencode');
  const opencodeJsonPath = path.join(opencodeDir, 'opencode.json');
  if (!fs.existsSync(opencodeDir)) {
    fs.mkdirSync(opencodeDir, { recursive: true });
  }
  let opencodeData = {};
  if (fs.existsSync(opencodeJsonPath)) {
    try {
      opencodeData = JSON.parse(fs.readFileSync(opencodeJsonPath, 'utf8'));
    } catch (_) {}
  }
  
  // OpenCode supports mcp / mcpServers
  if (!opencodeData.mcpServers) opencodeData.mcpServers = {};
  opencodeData.mcpServers['higgsfield-studio'] = {
    command: nodePath,
    args: [mcpServerScript],
  };

  if (!opencodeData.mcp) opencodeData.mcp = {};
  opencodeData.mcp['higgsfield-studio'] = {
    type: 'local',
    command: [nodePath, mcpServerScript],
  };

  fs.writeFileSync(opencodeJsonPath, JSON.stringify(opencodeData, null, 2), 'utf8');
  results['opencode'] = `OK (${opencodeJsonPath})`;
} catch (e) {
  results['opencode'] = `Error: ${e.message}`;
}

console.log(JSON.stringify(results, null, 2));
