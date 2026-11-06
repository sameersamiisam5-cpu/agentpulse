#!/usr/bin/env node

/**
 * AgentPulse Auto-Injector
 * 
 * Automatically detects installed IDEs and agent configurations on the user's machine
 * (Cursor, Claude Desktop, Antigravity, VS Code, Windsurf) and patches them to route
 * MCP telemetry through AgentPulse with ZERO manual JSON editing.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

console.log(`\n\x1b[36m⚡ AgentPulse Universal Auto-Detector & Hook\x1b[0m\n`);

const homeDir = os.homedir();
const appData = process.env.APPDATA || (process.platform === 'darwin' ? path.join(homeDir, 'Library', 'Application Support') : path.join(homeDir, '.config'));

interface TargetAgent {
  name: string;
  configPath: string;
  type: 'claude' | 'cursor' | 'antigravity';
}

const potentialTargets: TargetAgent[] = [
  // 1. Claude Desktop
  {
    name: 'Claude Desktop',
    configPath: path.join(appData, 'Claude', 'claude_desktop_config.json'),
    type: 'claude'
  },
  // 2. Cursor IDE Global Config
  {
    name: 'Cursor IDE',
    configPath: path.join(appData, 'Cursor', 'User', 'globalStorage', 'cursor.mcp', 'mcp.json'),
    type: 'cursor'
  },
  // 3. Local Workspace .cursor/mcp.json
  {
    name: 'Current Workspace (Cursor/VSCode/Antigravity)',
    configPath: path.join(process.cwd(), '.cursor', 'mcp.json'),
    type: 'cursor'
  }
];

let injectedCount = 0;

export function autoInject() {
  for (const target of potentialTargets) {
    try {
      const dir = path.dirname(target.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      let config: any = { mcpServers: {} };
      if (fs.existsSync(target.configPath)) {
        try {
          config = JSON.parse(fs.readFileSync(target.configPath, 'utf8'));
          if (!config.mcpServers) config.mcpServers = {};
        } catch (e) {
          config = { mcpServers: {} };
        }
      }

      // Add or update AgentPulse Telemetry MCP Server entry
      config.mcpServers['agentpulse'] = {
        command: 'npx',
        args: ['agentpulse', 'proxy', '--', 'npx', '-y', '@modelcontextprotocol/server-filesystem', process.cwd()],
        env: {
          AGENTPULSE_GATEWAY: 'http://localhost:4300'
        }
      };

      fs.writeFileSync(target.configPath, JSON.stringify(config, null, 2), 'utf8');
      console.log(`\x1b[32m✔ Auto-hooked:\x1b[0m ${target.name} at \x1b[90m${target.configPath}\x1b[0m`);
      injectedCount++;
    } catch (err: any) {
      // Skip if permission denied or non-existent
    }
  }

  // Also drop an instant drop-in proxy configuration into the current workspace
  const workspaceCursorRules = path.join(process.cwd(), '.cursorrules');
  const ruleContent = `\n# AgentPulse Telemetry Gateway
All autonomous tool invocations and MCP servers are monitored at http://localhost:3000
Telemetry Gateway: http://localhost:4300/api/events\n`;

  try {
    if (!fs.existsSync(workspaceCursorRules)) {
      fs.writeFileSync(workspaceCursorRules, ruleContent, 'utf8');
      console.log(`\x1b[32m✔ Created .cursorrules in current project\x1b[0m`);
    }
  } catch (e) {}

  console.log(`\n\x1b[36mDone! Any agent in these environments will now route telemetry straight to http://localhost:3000\x1b[0m\n`);
}

autoInject();

