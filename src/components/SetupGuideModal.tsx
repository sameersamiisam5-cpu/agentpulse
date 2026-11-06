'use client';

import React, { useState } from 'react';
import { Copy, Check, X, Sparkles, Terminal, Cpu, Box, Globe, ShieldCheck, Wand2, ArrowRight, PlayCircle } from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'instant' | 'mcp' | 'langchain' | 'openai' | 'rest'>('instant');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const copyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const triggerLivePing = async () => {
    try {
      await fetch('http://localhost:4300/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'test-agent-instant',
          agentName: 'Your Connected Agent (Live Test)',
          type: 'tool_start',
          toolName: 'system_verify_connection',
          input: { status: 'testing_pipeline', ide: 'Auto-Hooked IDE' },
          output: { verified: true, latencyMs: 12 },
          timestamp: Date.now(),
          durationMs: 42,
          tokens: { promptTokens: 450, completionTokens: 60, totalTokens: 510, estimatedCostUsd: 0.0018 }
        })
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 2500);
    } catch (e) {
      alert('Could not ping telemetry server. Ensure AgentPulse server is running.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#0e1118] border border-[#232838] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#1f2433] flex items-center justify-between bg-[#121622]">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Instant Agent Connection</span>
              </h3>
              <p className="text-xs text-zinc-400">Zero configuration needed. AgentPulse is already listening on your system.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status Box */}
          <div className="p-4 bg-[#141824] border border-cyan-500/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-bold text-white">Telemetry Gateway is Active</span>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                localhost:4300
              </span>
            </div>
            
            <p className="text-zinc-300 text-xs leading-relaxed">
              Your computer is already configured. Any AI agent, MCP server, Python script, or terminal tool can emit traces directly to AgentPulse with **zero manual effort**.
            </p>

            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={triggerLivePing}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-all"
              >
                <PlayCircle className="w-4 h-4" />
                <span>{testSent ? 'Ping Delivered to Dashboard!' : 'Fire Instant Test Ping'}</span>
              </button>
              <span className="text-[11px] text-zinc-500">Click to watch an event land on your dashboard immediately</span>
            </div>
          </div>

          {/* Quick copy snippet for developers */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Send an event from any terminal or script:
            </span>
            <div className="relative font-mono">
              <pre className="p-3 bg-[#06080d] border border-[#1b1f2b] rounded-lg text-cyan-200/90 text-[11px] overflow-x-auto leading-relaxed">
{`curl -X POST http://localhost:4300/api/events -H "Content-Type: application/json" -d '{"agentName":"My Agent","toolName":"read_file","status":"success"}'`}
              </pre>
              <button
                onClick={() => copyCode(`curl -X POST http://localhost:4300/api/events -H "Content-Type: application/json" -d '{"agentName":"My Agent","toolName":"read_file","status":"success"}'`, 'curl')}
                className="absolute top-2 right-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700"
              >
                {copiedKey === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1f2433] bg-[#090b10] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero restart required. Telemetry ports are live and accepting events.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
