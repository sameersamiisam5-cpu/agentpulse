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
      {/* Connection Status */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 text-xs">
          <span>Monitor Status</span>
          <span className={`inline-block h-2 w-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-base font-semibold text-neutral-100 font-mono">
            {connected ? 'CONNECTED' : 'OFFLINE'}
          </span>
          <span className="text-[10px] text-neutral-400">Live</span>
        </div>
      </div>

      {/* Actions Done */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 text-xs">
          <span>Actions Done</span>
          <Zap className="w-3.5 h-3.5 text-neutral-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-semibold font-mono text-neutral-100">{stats.totalToolCalls}</span>
          <span className="text-[11px] text-neutral-400 font-mono">steps</span>
        </div>
      </div>

      {/* Speed / Time */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 text-xs">
          <span>Average Speed</span>
          <Clock className="w-3.5 h-3.5 text-neutral-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-semibold font-mono text-neutral-100">
            {stats.avgLatencyMs}<span className="text-xs text-neutral-400 font-sans ml-0.5">ms</span>
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">per action</span>
        </div>
      </div>

      {/* AI Words / Tokens */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 text-xs">
          <span>AI Words Used</span>
          <Cpu className="w-3.5 h-3.5 text-neutral-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-semibold font-mono text-neutral-100">
            {stats.totalTokens.toLocaleString()}
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">tokens</span>
        </div>
      </div>

      {/* Money Spent */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 text-xs">
          <span>Money Spent</span>
          <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-semibold font-mono text-neutral-100">
            {formatUsd(stats.totalCostUsd)}
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">USD</span>
        </div>
      </div>

      {/* Mistakes / Errors */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 text-xs">
          <span>Mistakes & Fails</span>
          <AlertTriangle className={`w-3.5 h-3.5 ${stats.errorCount > 0 ? 'text-red-400' : 'text-neutral-400'}`} />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className={`text-xl font-semibold font-mono ${stats.errorCount > 0 ? 'text-red-400' : 'text-neutral-100'}`}>
            {stats.errorRate}%
          </span>
          <span className="text-[11px] text-neutral-400 font-mono">{stats.errorCount} failed</span>
        </div>
      </div>
    </div>
  );
};
