'use client';

import React, { useEffect, useState } from 'react';
import { AgentPulseEvent } from '@/types/telemetry';
import { formatMs } from '@/lib/telemetry-utils';
import { Wrench, Bot, AlertCircle, CheckCircle2 } from 'lucide-react';

interface WaterfallProps {
  events: AgentPulseEvent[];
  selectedEventId: string | null;
  onSelectEvent: (event: AgentPulseEvent) => void;
}

export const Waterfall: React.FC<WaterfallProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTimestamp = (ts: number) => {
    if (!mounted) return '--:--:--.000';
    const d = new Date(ts);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    const ms = String(ts % 1000).padStart(3, '0');
    return `${h}:${m}:${s}.${ms}`;
  };

  const timestamps = events.map(e => e.timestamp);
  const minTime = timestamps.length ? Math.min(...timestamps) : 0;
  const maxTime = timestamps.length ? Math.max(...timestamps) : 1;
  const totalSpanMs = Math.max(maxTime - minTime, 1000);

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-lg overflow-hidden flex flex-col h-[600px]">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-[#0a0a0a] border-b border-[#222222] text-[11px] font-mono text-neutral-400 uppercase tracking-wider select-none">
        <div className="col-span-2">Time / Agent</div>
        <div className="col-span-1">Type</div>
        <div className="col-span-4">Operation & Payload</div>
        <div className="col-span-1 text-center">Status</div>
        <div className="col-span-4">Execution Latency (ms)</div>
      </div>

      {/* Events List */}
      <div className="overflow-y-auto flex-1 divide-y divide-[#1c1c1c]">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-500 py-20 font-mono text-xs">
            <Bot className="w-8 h-8 mb-2 opacity-40 text-neutral-400" />
            <p>Listening for telemetry stream...</p>
          </div>
        ) : (
          events.map((evt) => {
            const isSelected = selectedEventId === evt.id;
            const isThought = evt.type === 'thought';
            const isFailed = evt.status === 'failed' || !!evt.error;

            const offsetMs = evt.timestamp - minTime;
            const leftPct = Math.min(Math.max((offsetMs / totalSpanMs) * 100, 0), 92);
            const duration = evt.durationMs || 30;
            const widthPct = Math.min(Math.max((duration / totalSpanMs) * 100, 2), 100 - leftPct);

            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className={`grid grid-cols-12 gap-2 px-4 py-2 items-center text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#222222] border-l-2 border-l-neutral-200'
                    : 'hover:bg-[#181818]'
                }`}
              >
                {/* Time & Agent */}
                <div className="col-span-2 flex flex-col font-mono text-[11px]" suppressHydrationWarning>
                  <span className="text-neutral-300">
                    {formatTimestamp(evt.timestamp)}
                  </span>
                  <span className="text-[10px] text-neutral-400 truncate max-w-[120px]">
                    {evt.agentName || evt.sessionId}
                  </span>
                </div>

                {/* Type */}
                <div className="col-span-1">
                  {isThought ? (
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1c1c1c] text-neutral-300 border border-[#2a2a2a]">
                      THINK
                    </span>
                  ) : (
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1c1c1c] text-neutral-300 border border-[#2a2a2a]">
                      TOOL
                    </span>
                  )}
                </div>

                {/* Operation / Description */}
                <div className="col-span-4 flex items-center space-x-2 truncate pr-2 font-mono text-[11px]">
                  {isThought ? (
                    <div className="flex items-center space-x-1.5 truncate text-neutral-300">
                      <Bot className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate italic">
                        {evt.metadata?.thought || 'Model reasoning...'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 truncate">
                      <Wrench className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="font-semibold text-neutral-200 truncate">
                        {evt.toolName || 'unnamed_tool'}
                      </span>
                      {evt.input && (
                        <span className="text-neutral-400 text-[10px] truncate">
                          ({typeof evt.input === 'object' ? Object.keys(evt.input).join(', ') : '...'})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Indicator */}
                <div className="col-span-1 flex justify-center font-mono text-[10px]">
                  {isFailed ? (
                    <span className="text-red-400 font-semibold">FAIL</span>
                  ) : (
                    <span className="text-neutral-400 font-semibold">OK</span>
                  )}
                </div>

                {/* Live Waterfall Bar */}
                <div className="col-span-4 relative h-5 bg-[#0a0a0a] rounded border border-[#1e1e1e] flex items-center px-1 overflow-hidden">
                  <div
                    className={`absolute h-3.5 rounded transition-all duration-200 ${
                      isFailed
                        ? 'bg-red-500/80 border border-red-400'
                        : isThought
                        ? 'bg-neutral-600 border border-neutral-500'
                        : 'bg-neutral-400 border border-neutral-300'
                    }`}
                    style={{
                      left: `${leftPct}%`,
                      width: `${Math.max(widthPct, 2)}%`
                    }}
                  />
                  <div className="absolute right-2 text-[10px] font-mono text-neutral-400 font-medium pointer-events-none">
                    {formatMs(evt.durationMs)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
