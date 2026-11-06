import http from 'http';
import { AgentPulseEvent } from '../types/telemetry';

const PORT = 4300;
const SESSION_ID = 'session-claude-' + Math.random().toString(36).substring(2, 7);

const tools = [
  {
    name: 'fs_read_file',
    inputs: [{ path: 'src/components/Navigation.tsx' }, { path: 'prisma/schema.prisma' }],
    outputs: [{ content: 'export default function Navigation() { ... }' }, { models: ['User', 'AgentSession', 'ToolCall'] }]
  },
  {
    name: 'db_execute_sql',
    inputs: [{ query: 'SELECT * FROM sessions WHERE status = "active" LIMIT 10' }, { query: 'EXPLAIN ANALYZE SELECT * FROM telemetry' }],
    outputs: [{ rowsCount: 8, executionTimeMs: 14.2 }, { plan: 'Index Scan using idx_session_time' }]
  },
  {
    name: 'web_search_mcp',
    inputs: [{ query: 'latest Model Context Protocol spec 2026' }, { query: 'Next.js 16 turbopack server actions' }],
    outputs: [{ results: 5, topUrl: 'https://modelcontextprotocol.io' }, { results: 12, topUrl: 'https://nextjs.org' }]
  },
  {
    name: 'bash_run_command',
    inputs: [{ cmd: 'npm run test -- --silent' }, { cmd: 'git status -s' }],
    outputs: [{ exitCode: 0, stdout: '42 tests passed, 0 failed' }, { modified: ['src/app/page.tsx'] }]
  }
];

function sendEvent(event: AgentPulseEvent) {
  const data = JSON.stringify(event);
  const req = http.request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/events',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  });

  req.on('error', (e) => {
    console.error('Mock agent failed to send event (is telemetry server running?):', e.message);
  });

  req.write(data);
  req.end();
}

console.log(`🤖 Starting Mock Agent Simulator [${SESSION_ID}] streaming to port ${PORT}...`);

let step = 0;
const thoughts = [
  "Analyzing codebase structure to locate tool routing mechanism...",
  "Querying active telemetry sessions to verify throughput...",
  "Running lint and test check across recent component updates...",
  "Inspecting Model Context Protocol registry endpoints..."
];

setInterval(() => {
  step++;
  const toolChoice = tools[Math.floor(Math.random() * tools.length)];
  const inputChoice = toolChoice.inputs[Math.floor(Math.random() * toolChoice.inputs.length)];
  const outputChoice = toolChoice.outputs[Math.floor(Math.random() * toolChoice.outputs.length)];
  const duration = Math.floor(Math.random() * 450) + 40;
  const promptTokens = Math.floor(Math.random() * 800) + 300;
  const completionTokens = Math.floor(Math.random() * 250) + 50;
  const cost = Number(((promptTokens * 0.000003) + (completionTokens * 0.000015)).toFixed(5));

  // 1. Emit thought
  sendEvent({
    id: 'evt-' + Math.random().toString(36).substring(2, 9),
    sessionId: SESSION_ID,
    agentName: 'Claude Code (Sonnet 3.7)',
    type: 'thought',
    timestamp: Date.now(),
    status: 'success',
    metadata: {
      thought: thoughts[Math.floor(Math.random() * thoughts.length)]
    }
  });

  // 2. Emit Tool Start & End
  setTimeout(() => {
    const isError = Math.random() < 0.08;
    const isLoopTrigger = step % 7 === 0;

    const actualInput = isLoopTrigger 
      ? { path: 'critical_loop_file.ts', mode: 'strict' } 
      : inputChoice;
    const actualTool = isLoopTrigger ? 'stuck_file_reader' : toolChoice.name;

    sendEvent({
      id: 'evt-' + Math.random().toString(36).substring(2, 9),
      sessionId: SESSION_ID,
      agentName: 'Claude Code (Sonnet 3.7)',
      type: 'tool_start',
      timestamp: Date.now(),
      toolName: actualTool,
      input: actualInput,
      output: isError ? { error: 'EPERM: Permission denied on target resource' } : outputChoice,
      durationMs: duration,
      tokens: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        estimatedCostUsd: cost
      },
      status: isError ? 'failed' : 'success',
      error: isError ? 'EPERM: Access denied' : undefined
    });
  }, 300);

}, 2400);

