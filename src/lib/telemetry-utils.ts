import { AgentPulseEvent } from '@/types/telemetry';

export function calculateStats(events: AgentPulseEvent[]) {
  const toolEvents = events.filter(e => e.type === 'tool_start' || e.type === 'tool_end');
  const errorEvents = events.filter(e => e.status === 'failed' || e.type === 'error');
  
  let totalTokens = 0;
  let totalCostUsd = 0;
  let totalDuration = 0;
  let durationCount = 0;

  events.forEach(e => {
    if (e.tokens) {
      totalTokens += e.tokens.totalTokens || 0;
      totalCostUsd += e.tokens.estimatedCostUsd || 0;
    }
    if (e.durationMs) {
      totalDuration += e.durationMs;
      durationCount++;
    }
  });

  return {
    totalEvents: events.length,
    totalToolCalls: toolEvents.length,
    errorCount: errorEvents.length,
    totalTokens,
    totalCostUsd,
    avgLatencyMs: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
    errorRate: toolEvents.length > 0 ? ((errorEvents.length / toolEvents.length) * 100).toFixed(1) : '0'
  };
}

export function formatMs(ms?: number) {
  if (!ms && ms !== 0) return '0ms';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatUsd(amount: number) {
  return `$${amount.toFixed(4)}`;
}

