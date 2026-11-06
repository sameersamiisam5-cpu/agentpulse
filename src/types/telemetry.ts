export type EventType = 
  | 'thought' 
  | 'tool_start' 
  | 'tool_end' 
  | 'error' 
  | 'metric' 
  | 'circuit_breaker';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface AgentPulseEvent {
  id: string;
  sessionId: string;
  agentName?: string;
  type: EventType;
  timestamp: number; // Unix ms
  toolName?: string;
  input?: Record<string, any> | string;
  output?: Record<string, any> | string;
  error?: string;
  durationMs?: number;
  tokens?: TokenUsage;
  status: 'running' | 'success' | 'failed' | 'throttled' | 'loop_detected';
  metadata?: Record<string, any>;
}

export interface AgentSessionSummary {
  sessionId: string;
  agentName: string;
  startTime: number;
  lastActiveTime: number;
  totalEvents: number;
  totalToolCalls: number;
  totalErrors: number;
  totalTokens: number;
  totalCostUsd: number;
  averageLatencyMs: number;
  status: 'healthy' | 'warning' | 'circuit_broken';
  hasLoopAlert: boolean;
}

export interface LoopAlertPayload {
  toolName: string;
  consecutiveCount: number;
  similarityRatio: number;
  sessionId: string;
  triggeredAt: number;
  message: string;
}

