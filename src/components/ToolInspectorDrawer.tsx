'use client';

import React, { useState } from 'react';
import { AgentPulseEvent } from '@/types/telemetry';
import { formatMs, formatUsd } from '@/lib/telemetry-utils';
import { X, Copy, Check, Terminal, Code2, AlertTriangle } from 'lucide-react';

interface ToolInspectorDrawerProps {
  event: AgentPulseEvent | null;
  onClose: () => void;
}

export const ToolInspectorDrawer: React.FC<ToolInspectorDrawerProps> = ({ event, onClose }) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  if (!event) return null;

  const copyToClipboard = (text: string, tab: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 1800);
  };

  const isThought = event.type === 'thought';
  const hasError = !!event.error || event.status === 'failed';

  return (
    <div className="fixed inset-y-0 right-0 w-[520px] max-w-[90vw] bg-[#0d0d0d] border-l border-[#222222] z-50 flex flex-col font-sans text-xs">
      {/* Header */}
      <div className="p-4 border-b border-[#222222] flex items-center justify-between bg-[#111111]">
        <div className="flex items-center space-x-2.5 truncate">
          <Terminal className="w-4 h-4 text-neutral-400" />
          <div className="truncate">
            <h3 className="text-sm font-semibold text-neutral-100 truncate">
              {event.toolName || (isThought ? 'AI Thinking Step' : 'Action Details')}
            </h3>
            <p className="text-[11px] text-neutral-500 font-mono truncate">{event.agentName || 'Agent Session'}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-[#0a0a0a] border-b border-[#1c1c1c] text-xs">
        <div>
          <span className="text-[10px] text-neutral-500 uppercase block">Time Taken</span>
          <span className="text-neutral-200 font-semibold font-mono">{formatMs(event.durationMs)}</span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 uppercase block">Words / Tokens</span>
          <span className="text-neutral-200 font-semibold font-mono">
            {event.tokens ? `${event.tokens.totalTokens}` : '0'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 uppercase block">Cost</span>
          <span className="text-neutral-200 font-semibold font-mono">
            {event.tokens ? formatUsd(event.tokens.estimatedCostUsd) : '$0.00'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
        {hasError && (
          <div className="p-3 bg-red-950/20 border border-red-500/30 rounded flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-red-400 text-[11px] uppercase">Why This Failed</div>
              <p className="text-red-200 text-xs mt-1 font-sans">
                {event.error || JSON.stringify(event.output)}
              </p>
            </div>
          </div>
        )}

        {event.metadata?.thought && (
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 block font-sans">
              What the AI was thinking
            </span>
            <div className="p-3 bg-[#111111] border border-[#222222] rounded text-neutral-200 font-sans leading-relaxed">
              {event.metadata.thought}
            </div>
          </div>
        )}

        {event.input && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase flex items-center space-x-1 font-sans">
                <Code2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>What was sent to the tool</span>
              </span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(event.input, null, 2), 'input')}
                className="text-[10px] text-neutral-400 hover:text-white flex items-center space-x-1 px-1.5 py-0.5 rounded bg-neutral-800"
              >
                {copiedTab === 'input' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTab === 'input' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 bg-[#0a0a0a] border border-[#1e1e1e] rounded text-neutral-300 text-[11px] overflow-x-auto max-h-56">
              {JSON.stringify(event.input, null, 2)}
            </pre>
          </div>
        )}

        {event.output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase flex items-center space-x-1 font-sans">
                <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                <span>What the tool answered back</span>
              </span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(event.output, null, 2), 'output')}
                className="text-[10px] text-neutral-400 hover:text-white flex items-center space-x-1 px-1.5 py-0.5 rounded bg-neutral-800"
              >
                {copiedTab === 'output' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTab === 'output' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 bg-[#0a0a0a] border border-[#1e1e1e] rounded text-neutral-300 text-[11px] overflow-x-auto max-h-56">
              {JSON.stringify(event.output, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
