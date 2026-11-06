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

        let config: any = { mcpServers: {} };
        if (fs.existsSync(target.path)) {
          try {
            config = JSON.parse(fs.readFileSync(target.path, 'utf8'));
            if (!config.mcpServers) config.mcpServers = {};
          } catch (e) {
            config = { mcpServers: {} };
          }
        }

        config.mcpServers['agentpulse-inspector'] = {
          command: 'npx',
          args: ['agentpulse', 'proxy', '--', 'npx', '-y', '@modelcontextprotocol/server-filesystem', process.cwd()]
        };

        fs.writeFileSync(target.path, JSON.stringify(config, null, 2), 'utf8');
        hooked.push(target.name);
      } catch (e) {}
    }

    return NextResponse.json({ success: true, hooked });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

