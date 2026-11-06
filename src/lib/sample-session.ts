import { AgentPulseEvent } from '@/types/telemetry';

export const SAMPLE_INCIDENT_SESSION: AgentPulseEvent[] = [
  {
    id: "sample-evt-001",
    sessionId: "claude-code-incident-409",
    agentName: "Claude 3.7 Sonnet (Autonomous)",
    type: "thought",
    timestamp: 1731000000000,
    status: "success",
    metadata: {
      thought: "User requested: 'Refactor database models and generate Prisma migration for AgentSession'."
    }
  },
  {
    id: "sample-evt-002",
    sessionId: "claude-code-incident-409",
    agentName: "Claude 3.7 Sonnet (Autonomous)",
    type: "tool_start",
    timestamp: 1731000001200,
    toolName: "fs_read_file",
    input: { path: "prisma/schema.prisma", encoding: "utf-8" },
    output: { lines: 142, models: ["User", "Workspace", "ApiKey"] },
    durationMs: 85,
    tokens: { promptTokens: 920, completionTokens: 45, totalTokens: 965, estimatedCostUsd: 0.0034 },
    status: "success"
  },
  {
    id: "sample-evt-003",
    sessionId: "claude-code-incident-409",
    agentName: "Claude 3.7 Sonnet (Autonomous)",
    type: "thought",
    timestamp: 1731000002100,
    status: "success",
    metadata: {
      thought: "Schema inspected. Appending model AgentSession with relation to User."
    }
  },
  {
    id: "sample-evt-004",
    sessionId: "claude-code-incident-409",
    agentName: "Claude 3.7 Sonnet (Autonomous)",
    type: "tool_start",
    timestamp: 1731000003000,
    toolName: "fs_write_file",
    input: { path: "prisma/schema.prisma", append: true, content: "model AgentSession { id String @id ... }" },
    output: { bytesWritten: 320, success: true },
    durationMs: 140,
    tokens: { promptTokens: 1450, completionTokens: 110, totalTokens: 1560, estimatedCostUsd: 0.0058 },
    status: "success"
  },
  {
    id: "sample-evt-005",
    sessionId: "claude-code-incident-409",
    agentName: "Claude 3.7 Sonnet (Autonomous)",
    type: "thought",
    timestamp: 1731000004500,
    status: "success",
    metadata: {
      thought: "Running migration command: npx prisma migrate dev --name add_agent_session"
    }
  },
  {
    id: "sample-evt-006",
    sessionId: "claude-code-incident-409",
    agentName: "Claude 3.7 Sonnet (Autonomous)",
    type: "tool_start",
    timestamp: 1731000005200,
    toolName: "bash_exec",
    input: { cmd: "npx prisma migrate dev --name add_agent_session" },
    output: { error: "P1001: Can't reach database server at localhost:5432" },
    durationMs: 4200,
    tokens: { promptTokens: 2100, completionTokens: 60, totalTokens: 2160, estimatedCostUsd: 0.0072 },
    status: "failed",
    error: "P1001: Can't reach database server at localhost:5432"
  },
  {
    id: "sample-evt-007",
    sessionId: "claude-code-incident-409",
    agentName: "Claude 3.7 Sonnet (Autonomous)",
    type: "thought",
    timestamp: 1731000010100,
    status: "success",
    metadata: {
      thought: "Database unreachable. Verifying Docker container state using docker ps."
    }
  },
  {
    id: "sample-evt-008",
    sessionId: "claude-code-incident-409",
    agentName: "Claude 3.7 Sonnet (Autonomous)",
    type: "tool_start",
    timestamp: 1731000011000,
    toolName: "docker_mcp_inspect",
    input: { container: "postgres-local", filter: "status=running" },
    output: { containers: [], message: "No matching running containers found" },
    durationMs: 310,
    tokens: { promptTokens: 2450, completionTokens: 90, totalTokens: 2540, estimatedCostUsd: 0.0087 },
    status: "success"
  },
  {
    id: "sample-evt-009",
    sessionId: "claude-code-incident-409",
    agentName: "Claude 3.7 Sonnet (Autonomous)",
    type: "thought",
    timestamp: 1731000012200,
    status: "success",
    metadata: {
      thought: "Container dead. Spawning local postgres container via docker-compose."
    }
  },
  {
    id: "sample-evt-010",
    sessionId: "claude-code-incident-409",
    agentName: "Claude 3.7 Sonnet (Autonomous)",
    type: "tool_start",
    timestamp: 1731000013000,
    toolName: "docker_mcp_inspect",
    input: { container: "postgres-local", filter: "status=running" },
    output: { containers: [], message: "No matching running containers found" },
    durationMs: 295,
    tokens: { promptTokens: 2600, completionTokens: 85, totalTokens: 2685, estimatedCostUsd: 0.0091 },
    status: "success"
  },
  {
    id: "sample-evt-011",
    sessionId: "claude-code-incident-409",
    agentName: "Claude 3.7 Sonnet (Autonomous)",
    type: "tool_start",
    timestamp: 1731000014000,
    toolName: "docker_mcp_inspect",
    input: { container: "postgres-local", filter: "status=running" },
    output: { containers: [], message: "No matching running containers found" },
    durationMs: 315,
    tokens: { promptTokens: 2800, completionTokens: 95, totalTokens: 2895, estimatedCostUsd: 0.0098 },
    status: "success"
  }
];

