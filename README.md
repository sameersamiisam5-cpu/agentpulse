<div align="center">
  <br />
  <h1>⚡ AgentPulse</h1>
  <strong>The Real-Time Observability & Circuit-Breaker Cockpit for AI Agents & MCP Servers</strong>
  <p>Stop flying blind. Intercept, visualize, and halt recursive agent loop traps before burning API token budgets.</p>
  
  <p>
    <a href="#quickstart">Quickstart</a> •
    <a href="#killer-features">Killer Features</a> •
    <a href="#mcp-proxy">MCP Stdio Interceptor</a> •
    <a href="#architecture">Architecture</a>
  </p>
</div>

---

## 🎯 Why AgentPulse?

When teams deploy autonomous coding agents (Claude Code, Cursor, Codex) and Model Context Protocol (MCP) servers, they operate inside a **dangerous black box**:
1. **Zero Visibility:** Agents execute dozens of tool calls in stdout with no structured timeline.
2. **Hidden Latency:** Sluggish database or search tools stall agent decision loops for 10–30s.
3. **Loop Traps:** Agents get trapped calling broken tools in infinite cycles, burning **\$50–\$200 in API tokens** in minutes.

**AgentPulse** acts as **Chrome DevTools for AI Agents**: a zero-overhead local cockpit providing live waterfall timelines, token analytics, and automated circuit breakers.

---

## 💎 Killer Features

- 🌊 **Live Waterfall Timeline:** Execution tracks visualising thoughts, tool calls, and API responses over time with sub-millisecond precision.
- ⚡ **Heuristic Circuit Breaker:** Detects recursive identical tool calls (3+ repetitions) and trips an alert to stop token drain.
- 🔍 **Deep Tool Call Inspector:** Slide-out drawer with syntax-highlighted JSON arguments, environment schemas, and output diffs with 1-click clipboard export.
- 📊 **Real-Time Token & Latency KPIs:** Live prompt/completion token counter, execution duration (ms), and USD burn rate.
- 📼 **Session Replay (Import / Export):** Download full execution traces as `.json` or load sample incident traces with zero setup.
- 🔌 **Universal MCP Proxy:** Plugs between any AI agent and any Model Context Protocol (MCP) server without code changes.

---

## 🚀 Quickstart

Clone the repository and launch the cockpit in one command:

```bash
git clone https://github.com/sameersamiisam5-cpu/agentpulse.git
cd agentpulse
npm install
npm run pulse
```

This starts:
1. **Telemetry Server** on `ws://localhost:4300`
2. **AgentPulse Cockpit UI** on `http://localhost:3000`
3. **Simulated Agent Traffic** emitting live thoughts, tools, and loop triggers.

---

## 🔌 Universal MCP Stdio Interceptor

You can use AgentPulse with **any real MCP Server** (such as SQLite, GitHub, or Filesystem MCP) by wrapping it with the proxy:

```bash
# Wrap any standard MCP server command
npm run proxy -- npx -y @modelcontextprotocol/server-filesystem ./my-project
```

The interceptor automatically sniffs `tools/call` JSON-RPC packets in `stdin`/`stdout`, calculates wall-clock latency, and streams telemetry directly to the cockpit.

---

## 📦 Client SDK

```typescript
import { AgentPulse } from "@agentpulse/sdk";

const pulse = new AgentPulse({ port: 4300 });

// Trace tool execution with automatic latency & error reporting
const result = await pulse.trace("database_query", { sql }, async () => {
  return await db.query(sql);
});

// Emit internal model thoughts
pulse.thought("Refactoring Prisma schema for agent session tracking...");
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────┐        WebSocket / SSE        ┌─────────────────────────────────┐
│     AI Agent / MCP Client       │ ────────────────────────────> │       AgentPulse Server         │
│  (Claude Code / Cursor / MCP)   │ <──────────────────────────── │      (Node.js / Express / WS)   │
└─────────────────────────────────┘                               └────────────────┬────────────────┘
                                                                                   │
                                                                       Real-Time State Stream
                                                                                   │
                                                                                   ▼
                                                                  ┌─────────────────────────────────┐
                                                                  │    AgentPulse UI Dashboard      │
                                                                  │  (Next.js 16 + Tailwind CSS)    │
                                                                  │  • Live Waterfall Timeline      │
                                                                  │  • Tool Call Inspector          │
                                                                  │  • Circuit Breaker Alert Banner │
                                                                  │  • Trace Import / Export Engine │
                                                                  └─────────────────────────────────┘
```

---

## 📄 License
MIT © Sami
