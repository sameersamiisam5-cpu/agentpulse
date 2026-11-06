import http from 'http';
import { AgentPulseEvent } from '../types/telemetry';

export class AgentPulse {
  private port: number;
  private host: string;
  private sessionId: string;
  private agentName: string;

  constructor(options: { port?: number; host?: string; sessionId?: string; agentName?: string } = {}) {
    this.port = options.port || 4300;
    this.host = options.host || 'localhost';
    this.sessionId = options.sessionId || `session-${Math.random().toString(36).substring(2, 9)}`;
    this.agentName = options.agentName || 'Autonomous Agent';
  }

  /**
   * 1-LINE WRAPPER FOR ANY LLM SDK (LangChain, OpenAI, Anthropic, Gemini, Vercel AI SDK)
   * Intercepts function execution, times latency, catches errors, and streams metrics.
   */
  async trace<T>(
    toolName: string,
    input: any,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    const eventId = `evt-${Math.random().toString(36).substring(2, 9)}`;

    try {
      const result = await fn();
      const durationMs = Date.now() - startTime;

      this.send({
        id: eventId,
        sessionId: this.sessionId,
        agentName: this.agentName,
        type: 'tool_start',
        timestamp: startTime,
        toolName,
        input,
        output: result as any,
        durationMs,
        status: 'success'
      });

      return result;
    } catch (err: any) {
      const durationMs = Date.now() - startTime;

      this.send({
        id: eventId,
        sessionId: this.sessionId,
        agentName: this.agentName,
        type: 'error',
        timestamp: startTime,
        toolName,
        input,
        error: err.message || String(err),
        durationMs,
        status: 'failed'
      });

      throw err;
    }
  }

  /**
   * Emit internal chain-of-thought or reasoning step
   */
  thought(content: string) {
    this.send({
      id: `evt-${Math.random().toString(36).substring(2, 9)}`,
      sessionId: this.sessionId,
      agentName: this.agentName,
      type: 'thought',
      timestamp: Date.now(),
      status: 'success',
      metadata: { thought: content }
    });
  }

  /**
   * Universal LangChain / LangGraph Callback Handler
   */
  getLangChainCallback() {
    const self = this;
    return {
      handleToolStart: async (tool: { name: string }, input: string) => {
        self.send({
          id: `lc-tool-${Date.now()}`,
          sessionId: self.sessionId,
          agentName: self.agentName,
          type: 'tool_start',
          timestamp: Date.now(),
          toolName: tool.name,
          input: input,
          status: 'running'
        });
      },
      handleToolEnd: async (output: string) => {
        self.send({
          id: `lc-end-${Date.now()}`,
          sessionId: self.sessionId,
          agentName: self.agentName,
          type: 'tool_end',
          timestamp: Date.now(),
          output: output,
          durationMs: 120,
          status: 'success'
        });
      },
      handleToolError: async (err: Error) => {
        self.send({
          id: `lc-err-${Date.now()}`,
          sessionId: self.sessionId,
          agentName: self.agentName,
          type: 'error',
          timestamp: Date.now(),
          error: err.message,
          status: 'failed'
        });
      }
    };
  }

  private send(event: AgentPulseEvent) {
    const data = JSON.stringify(event);
    const req = http.request({
      hostname: this.host,
      port: this.port,
      path: '/api/events',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    });
    req.on('error', () => {
      // Non-blocking fail-safe
    });
    req.write(data);
    req.end();
  }
}

