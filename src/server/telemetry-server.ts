import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { AgentPulseEvent, LoopAlertPayload } from '../types/telemetry';

const PORT = Number(process.env.PORT) || 4300;

// Track active connected agents
const activeAgents = new Map<string, { agentName: string; lastSeen: number; totalCalls: number }>();

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-agent-name, x-session-id');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', server: 'AgentPulse Universal Telemetry Gateway', uptime: process.uptime() }));
    return;
  }

  // Active agents status endpoint
  if (req.url === '/api/agents') {
    const agentsList = Array.from(activeAgents.entries()).map(([id, meta]) => ({
      sessionId: id,
      ...meta,
      isLive: Date.now() - meta.lastSeen < 15000
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ agents: agentsList }));
    return;
  }

  // Universal Ingestion Endpoint - accepts raw events OR auto-detects from headers
  if (req.method === 'POST' && req.url === '/api/events') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        const event: AgentPulseEvent = {
          id: parsed.id || `evt-${Math.random().toString(36).substring(2, 9)}`,
          sessionId: parsed.sessionId || (req.headers['x-session-id'] as string) || 'default-session',
          agentName: parsed.agentName || (req.headers['x-agent-name'] as string) || 'Autonomous Agent',
          type: parsed.type || 'tool_start',
          timestamp: parsed.timestamp || Date.now(),
          toolName: parsed.toolName,
          input: parsed.input,
          output: parsed.output,
          error: parsed.error,
          durationMs: parsed.durationMs || 45,
          tokens: parsed.tokens,
          status: parsed.status || (parsed.error ? 'failed' : 'success'),
          metadata: parsed.metadata
        };

        // Track agent
        const existing = activeAgents.get(event.sessionId);
        activeAgents.set(event.sessionId, {
          agentName: event.agentName || 'Agent',
          lastSeen: Date.now(),
          totalCalls: (existing?.totalCalls || 0) + 1
        });

        processAndBroadcastEvent(event);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, eventId: event.id }));
      } catch (err: any) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const wss = new WebSocketServer({ server });
const MAX_BUFFER = 500;
const eventBuffer: AgentPulseEvent[] = [];

interface RecentToolCall {
  toolName: string;
  serializedInput: string;
  timestamp: number;
}
const sessionHistory = new Map<string, RecentToolCall[]>();

function detectLoop(event: AgentPulseEvent): LoopAlertPayload | null {
  if (event.type !== 'tool_start' || !event.toolName) return null;

  const sessionId = event.sessionId;
  const history = sessionHistory.get(sessionId) || [];
  const currentSerialized = JSON.stringify(event.input || {});

  history.push({
    toolName: event.toolName,
    serializedInput: currentSerialized,
    timestamp: event.timestamp
  });

  if (history.length > 15) history.shift();
  sessionHistory.set(sessionId, history);

  if (history.length >= 3) {
    const last3 = history.slice(-3);
    const sameTool = last3.every(c => c.toolName === event.toolName);
    const sameInput = last3.every(c => c.serializedInput === currentSerialized);

    if (sameTool && sameInput) {
      return {
        toolName: event.toolName,
        consecutiveCount: 3,
        similarityRatio: 1.0,
        sessionId,
        triggeredAt: Date.now(),
        message: `Loop Trap Detected: ${event.toolName} was called 3 consecutive times with identical inputs!`
      };
    }
  }

  return null;
}

function processAndBroadcastEvent(event: AgentPulseEvent) {
  eventBuffer.push(event);
  if (eventBuffer.length > MAX_BUFFER) eventBuffer.shift();

  const loopAlert = detectLoop(event);
  const payloadStr = JSON.stringify({ type: 'EVENT', data: event });

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payloadStr);
      if (loopAlert) {
        client.send(JSON.stringify({ type: 'LOOP_ALERT', data: loopAlert }));
      }
    }
  });

  if (loopAlert) {
    console.warn(`\x1b[33m[CIRCUIT BREAKER ALERT]\x1b[0m ${loopAlert.message}`);
  }
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'INIT_STATE', history: eventBuffer }));

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed.type === 'INGEST_EVENT' && parsed.event) {
        processAndBroadcastEvent(parsed.event);
      }
    } catch (e) {
      console.error('Error handling WS message:', e);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n⚡ Universal Telemetry Gateway on port ${PORT}`);
});
