'use client';

import React from 'react';
import { Zap, Clock, Cpu, DollarSign, AlertTriangle } from 'lucide-react';
import { formatUsd } from '@/lib/telemetry-utils';

interface MetricBarProps {
  stats: {
    totalEvents: number;
    totalToolCalls: number;
    errorCount: number;
    totalTokens: number;
    totalCostUsd: number;
    avgLatencyMs: number;
    errorRate: string;
  };
  connected: boolean;
}

export const MetricBar: React.FC<MetricBarProps> = ({ stats, connected }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
      {/* Link Status */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
          <span>Gateway Link</span>
          <span className={`inline-block h-2 w-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-base font-semibold text-neutral-100 font-mono">
            {connected ? 'LIVE WS' : 'OFFLINE'}
          </span>
          <span className="text-[10px] font-mono text-neutral-400">4300</span>
        </div>
      </div>

      {/* Tool Calls */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
          <span>Tool Invocations</span>
          <Zap className="w-3.5 h-3.5 text-neutral-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-semibold font-mono text-neutral-100">{stats.totalToolCalls}</span>
          <span className="text-[11px] text-neutral-400 font-mono">{stats.totalEvents} msgs</span>
        </div>
      </div>

      {/* Latency */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
          <span>Avg Latency</span>
          <Clock className="w-3.5 h-3.5 text-neutral-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-semibold font-mono text-neutral-100">
            {stats.avgLatencyMs}<span className="text-xs text-neutral-400 font-sans ml-0.5">ms</span>
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">per call</span>
        </div>
      </div>

      {/* Tokens */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
          <span>Token Burn</span>
          <Cpu className="w-3.5 h-3.5 text-neutral-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-semibold font-mono text-neutral-100">
            {stats.totalTokens.toLocaleString()}
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">tokens</span>
        </div>
      </div>

      {/* Cost */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
          <span>Estimated Burn</span>
          <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-semibold font-mono text-neutral-100">
            {formatUsd(stats.totalCostUsd)}
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">USD</span>
        </div>
      </div>

      {/* Fault Rate */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
          <span>Fault Rate</span>
          <AlertTriangle className={`w-3.5 h-3.5 ${stats.errorCount > 0 ? 'text-red-400' : 'text-neutral-400'}`} />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className={`text-xl font-semibold font-mono ${stats.errorCount > 0 ? 'text-red-400' : 'text-neutral-100'}`}>
            {stats.errorRate}%
          </span>
          <span className="text-[11px] text-neutral-400 font-mono">{stats.errorCount} fails</span>
        </div>
      </div>
    </div>
  );
};
