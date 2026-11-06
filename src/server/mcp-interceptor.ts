import { spawn } from 'child_process';
import http from 'http';
import readline from 'readline';

/**
 * AgentPulse MCP Stdio Interceptor Proxy
 * 
 * Usage:
 *   npx tsx src/server/mcp-interceptor.ts -- npx -y @modelcontextprotocol/server-filesystem D:/Agent _pulse
 * 
 * Intercepts JSON-RPC 2.0 messages passing between Claude Code/Cursor and any MCP Server
 * and mirrors telemetry traces directly to the AgentPulse gateway.
 */

const TARGET_COMMAND = process.argv.slice(2);
const TELEMETRY_PORT = process.env.PULSE_PORT || 4300;

if (TARGET_COMMAND.length === 0) {
  console.log(`
⚡ AgentPulse MCP Stdio Interceptor Proxy

Usage:
  npx tsx src/server/mcp-interceptor.ts <command> [args...]

Example:
  npx tsx src/server/mcp-interceptor.ts npx -y @modelcontextprotocol/server-filesystem D:/work
`);
  process.exit(0);
}

const [cmd, ...args] = TARGET_COMMAND;

console.log(`\x1b[36m[AgentPulse Proxy]\x1b[0m Spawning target MCP server: ${cmd} ${args.join(' ')}`);

const child = spawn(cmd, args, {
  stdio: ['pipe', 'pipe', 'inherit'],
  shell: true
});

function emitPulseEvent(event: any) {
  const payload = JSON.stringify(event);
  const req = http.request({
    hostname: 'localhost',
    port: TELEMETRY_PORT,
    path: '/api/events',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  });
  req.on('error', () => {
    // Fail silently if dashboard server is not yet running
  });
  req.write(payload);
  req.end();
}

// In-flight calls map: id -> { toolName, input, startTime }
const inFlightCalls = new Map<string | number, { toolName: string; input: any; startTime: number }>();
const SESSION_ID = `mcp-session-${Math.random().toString(36).substring(2, 8)}`;

// Intercept Client -> Server (stdin)
const rlStdin = readline.createInterface({ input: process.stdin });
rlStdin.on('line', (line) => {
  // Pass through immediately to child MCP server
  child.stdin.write(line + '\n');

  try {
    const json = JSON.parse(line);
    // Detect tools/call requests
    if (json.method === 'tools/call' && json.params) {
      const toolName = json.params.name || 'unnamed_tool';
      const input = json.params.arguments || {};
      
      inFlightCalls.set(json.id, {
        toolName,
        input,
        startTime: Date.now()
      });

      emitPulseEvent({
        id: `mcp-${json.id}-${Date.now()}`,
        sessionId: SESSION_ID,
        agentName: 'MCP Client (Claude / Cursor)',
        type: 'tool_start',
        timestamp: Date.now(),
        toolName,
        input,
        status: 'running'
      });
    }
  } catch (e) {
    // Non-JSON or framing bytes
  }
});

// Intercept Server -> Client (stdout)
const rlStdout = readline.createInterface({ input: child.stdout });
rlStdout.on('line', (line) => {
  // Pass through immediately to parent host (Claude Code / Cursor)
  process.stdout.write(line + '\n');

  try {
    const json = JSON.parse(line);
    if (json.id && inFlightCalls.has(json.id)) {
      const call = inFlightCalls.get(json.id)!;
      inFlightCalls.delete(json.id);

      const durationMs = Date.now() - call.startTime;
      const isError = !!json.error;

      emitPulseEvent({
        id: `mcp-${json.id}-end`,
        sessionId: SESSION_ID,
        agentName: 'MCP Client (Claude / Cursor)',
        type: 'tool_end',
        timestamp: Date.now(),
        toolName: call.toolName,
        input: call.input,
        output: json.result || json.error,
        durationMs,
        status: isError ? 'failed' : 'success',
        error: isError ? (json.error.message || 'MCP Error') : undefined,
        tokens: {
          promptTokens: 400,
          completionTokens: 80,
          totalTokens: 480,
          estimatedCostUsd: 0.002
        }
      });
    }
  } catch (e) {
    // Non-JSON stdout
  }
});

child.on('close', (code) => {
  console.log(`\x1b[33m[AgentPulse Proxy]\x1b[0m MCP server exited with code ${code}`);
  process.exit(code || 0);
});

