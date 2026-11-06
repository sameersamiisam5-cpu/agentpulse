export interface AgentPulseOptions {
  port?: number;
  host?: string;
  sessionId?: string;
  agentName?: string;
}

export class AgentPulse {
  private url: string;
  private sessionId: string;
  private agentName: string;

  constructor(options: AgentPulseOptions = {}) {
    const port = options.port || 4300;
    const host = options.host || 'localhost';
    this.url = `http://${host}:${port}/api/events`;
    this.sessionId = options.sessionId || `session-${Math.random().toString(36).substring(2, 9)}`;
    this.agentName = options.agentName || 'Autonomous Agent';
  }

  /**
   * Trace an arbitrary tool or function execution and stream metrics to AgentPulse
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

      this.emitEvent({
        id: eventId,
        sessionId: this.sessionId,
        agentName: this.agentName,
        type: 'tool_start',
        timestamp: startTime,
        toolName,
        input,
        output: result,
        durationMs,
        status: 'success'
      });

      return result;
    } catch (err: any) {
      const durationMs = Date.now() - startTime;

      this.emitEvent({
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
   * Record agent thoughts / chain-of-thought steps
   */
  thought(content: string) {
    this.emitEvent({
      id: `evt-${Math.random().toString(36).substring(2, 9)}`,
      sessionId: this.sessionId,
      agentName: this.agentName,
      type: 'thought',
      timestamp: Date.now(),
      status: 'success',
      metadata: { thought: content }
    });
  }

  private emitEvent(event: any) {
    // Non-blocking fire-and-forget fetch
    if (typeof fetch !== 'undefined') {
      fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(() => {
        // Suppress errors when telemetry server is offline
      });
    }
  }
}

