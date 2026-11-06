'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { AgentPulseEvent, LoopAlertPayload } from '@/types/telemetry';
import { calculateStats } from '@/lib/telemetry-utils';
import { SAMPLE_INCIDENT_SESSION } from '@/lib/sample-session';
import { MetricBar } from '@/components/MetricBar';
import { Waterfall } from '@/components/Waterfall';
import { ToolInspectorDrawer } from '@/components/ToolInspectorDrawer';
import { SetupGuideModal } from '@/components/SetupGuideModal';
import { 
  Activity, 
  Trash2, 
  Pause, 
  Play, 
  Filter, 
  Download, 
  Upload, 
  Sparkles, 
  AlertOctagon, 
  PlugZap 
} from 'lucide-react';

export default function AgentPulseDashboard() {
  const [events, setEvents] = useState<AgentPulseEvent[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<AgentPulseEvent | null>(null);
  const [loopAlert, setLoopAlert] = useState<LoopAlertPayload | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const incomingQueueRef = useRef<AgentPulseEvent[]>([]);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket('ws://localhost:4300');

        ws.onopen = () => {
          setConnected(true);
        };

        ws.onmessage = (message) => {
          try {
            const payload = JSON.parse(message.data);

            if (payload.type === 'INIT_STATE' && Array.isArray(payload.history)) {
              setEvents(payload.history.slice(-80));
            } else if (payload.type === 'EVENT' && payload.data) {
              if (!isPausedRef.current) {
                incomingQueueRef.current.push(payload.data);
              }
            } else if (payload.type === 'LOOP_ALERT' && payload.data) {
              setLoopAlert(payload.data);
            }
          } catch (e) {
            console.error('Failed to parse websocket message:', e);
          }
        };

        ws.onclose = () => {
          setConnected(false);
          reconnectTimeout = setTimeout(connectWebSocket, 2000);
        };

        ws.onerror = () => {
          ws.close();
        };

        socketRef.current = ws;
      } catch (err) {
        reconnectTimeout = setTimeout(connectWebSocket, 2000);
      }
    };

    connectWebSocket();

    const batchInterval = setInterval(() => {
      if (incomingQueueRef.current.length > 0) {
        const batch = incomingQueueRef.current;
        incomingQueueRef.current = [];
        setEvents(prev => {
          const merged = [...prev, ...batch];
          return merged.length > 100 ? merged.slice(-100) : merged;
        });
      }
    }, 250);

    return () => {
      clearTimeout(reconnectTimeout);
      clearInterval(batchInterval);
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  const stats = useMemo(() => calculateStats(events), [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (filterType === 'tools') return e.type === 'tool_start' || e.type === 'tool_end';
      if (filterType === 'thoughts') return e.type === 'thought';
      if (filterType === 'errors') return e.status === 'failed' || !!e.error;
      return true;
    });
  }, [events, filterType]);

  const clearSession = () => {
    incomingQueueRef.current = [];
    setEvents([]);
    setSelectedEvent(null);
    setLoopAlert(null);
  };

  const loadSampleSession = () => {
    setIsPaused(true);
    setEvents(SAMPLE_INCIDENT_SESSION);
    setLoopAlert({
      toolName: "docker_mcp_inspect",
      consecutiveCount: 3,
      similarityRatio: 1.0,
      sessionId: "claude-code-incident-409",
      triggeredAt: Date.now(),
      message: "Warning: The AI is calling the exact same broken tool repeatedly in an infinite loop."
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setIsPaused(true);
          setEvents(parsed);
        } else {
          alert("Invalid file format.");
        }
      } catch (err) {
        alert("Failed to read file.");
      }
    };
    reader.readAsText(file);
  };

  const exportSessionJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `agentpulse-session-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-100 flex flex-col font-sans">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        className="hidden"
      />

      {/* Header */}
      <header className="border-b border-[#1f1f1f] bg-[#0c0c0c] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-7 w-7 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center">
            <Activity className="h-4 w-4 text-neutral-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-semibold tracking-tight text-white font-mono">
                AgentPulse
              </h1>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono border border-neutral-700">
                Live AI Monitor
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">See what your AI agents are doing in real-time</p>
          </div>
        </div>

        {/* Actions in Plain English */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={() => setShowSetupGuide(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold transition-colors"
          >
            <PlugZap className="w-3.5 h-3.5" />
            <span>Connect Your AI</span>
          </button>

          <button
            onClick={loadSampleSession}
            title="Watch a recorded example of an AI agent working"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#181818] hover:bg-[#222222] text-neutral-300 border border-[#2a2a2a] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
            <span>See Example Run</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Open a saved log file"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-[#181818] hover:bg-[#222222] text-neutral-400 border border-[#2a2a2a] transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Open Log</span>
          </button>

          <button
            onClick={exportSessionJson}
            disabled={events.length === 0}
            title="Save this run to a file"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-[#181818] hover:bg-[#222222] text-neutral-400 border border-[#2a2a2a] disabled:opacity-30 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-[#181818] hover:bg-[#222222] text-neutral-300 border border-[#2a2a2a] transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={clearSession}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-[#181818] hover:bg-[#222222] text-neutral-400 hover:text-red-400 border border-[#2a2a2a] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-5 max-w-7xl w-full mx-auto flex flex-col">
        {/* Simple Plain-English Alert Banner */}
        {loopAlert && (
          <div className="mb-4 p-3.5 rounded-lg bg-[#141010] border border-red-500/40 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <span className="font-semibold text-red-400 uppercase tracking-wider block font-mono">
                  Infinite Loop Stopped! (Money Saver)
                </span>
                <span className="text-neutral-300 text-[11px]">
                  The AI was trapped repeating the exact same failed action ({loopAlert.toolName}) over and over. AgentPulse flagged it to stop token waste.
                </span>
              </div>
            </div>
            <button
              onClick={() => setLoopAlert(null)}
              className="text-[11px] px-2.5 py-1 rounded bg-[#221515] hover:bg-[#2f1b1b] text-red-300 border border-red-500/30 transition-colors font-mono"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 6 Simple KPI Gauges */}
        <MetricBar stats={stats} connected={connected} />

        {/* Simple Filter Tabs */}
        <div className="flex items-center justify-between mb-2.5 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="text-neutral-400 text-[11px] mr-1 flex items-center space-x-1">
              <Filter className="w-3 h-3 text-neutral-400" />
              <span>Show:</span>
            </span>
            {[
              { id: 'all', label: 'Everything' },
              { id: 'tools', label: 'Actions Only' },
              { id: 'thoughts', label: 'AI Thinking Only' },
              { id: 'errors', label: 'Mistakes Only' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`text-[11px] px-2.5 py-0.5 rounded transition-all ${
                  filterType === tab.id
                    ? 'bg-neutral-200 text-neutral-900 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#181818]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-neutral-400">
            Showing {filteredEvents.length} of {events.length} actions
          </div>
        </div>

        {/* Live Timeline in Plain Words */}
        <div className="flex-1">
          <Waterfall
            events={filteredEvents}
            selectedEventId={selectedEvent?.id || null}
            onSelectEvent={(evt) => setSelectedEvent(evt)}
          />
        </div>
      </main>

      {/* Slide-out Tool Inspector */}
      <ToolInspectorDrawer
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      {/* Connect Modal */}
      <SetupGuideModal
        isOpen={showSetupGuide}
        onClose={() => setShowSetupGuide(false)}
      />
    </div>
  );
}
