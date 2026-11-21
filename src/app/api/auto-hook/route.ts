import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST() {
  try {
    const homeDir = os.homedir();
    const appData = process.env.APPDATA || (process.platform === 'darwin' ? path.join(homeDir, 'Library', 'Application Support') : path.join(homeDir, '.config'));

    const targets = [
      {
        name: 'Claude Desktop',
        path: path.join(appData, 'Claude', 'claude_desktop_config.json')
      },
      {
        name: 'Cursor IDE',
        path: path.join(appData, 'Cursor', 'User', 'globalStorage', 'cursor.mcp', 'mcp.json')
      },
      {
        name: 'Current Workspace (.cursor/mcp.json)',
        path: path.join(process.cwd(), '.cursor', 'mcp.json')
      }
    ];

    const hooked: string[] = [];

    for (const target of targets) {
      try {
        const dir = path.dirname(target.path);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        interface McpConfig {
          mcpServers: Record<string, { command: string; args: string[] }>;
          [key: string]: unknown;
        }

        let config: McpConfig = { mcpServers: {} };
        if (fs.existsSync(/*turbopackIgnore: true*/ target.path)) {
          try {
            const parsed = JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ target.path, 'utf8'));
            config = {
              ...parsed,
              mcpServers: parsed?.mcpServers && typeof parsed.mcpServers === 'object' ? parsed.mcpServers : {}
            };
          } catch {
            config = { mcpServers: {} };
          }
        }

        config.mcpServers['agentpulse-inspector'] = {
          command: 'npx',
          args: ['agentpulse', 'proxy', '--', 'npx', '-y', '@modelcontextprotocol/server-filesystem', process.cwd()]
        };

        fs.writeFileSync(target.path, JSON.stringify(config, null, 2), 'utf8');
        hooked.push(target.name);
      } catch {}
    }

    return NextResponse.json({ success: true, hooked });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown internal error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

