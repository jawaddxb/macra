"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  getSimulationStatus,
  type SimulationStatus,
  type RecentResponse,
} from "@/lib/api";
import AgentFeed from "@/components/AgentFeed";
import SentimentCascade from "@/components/SentimentCascade";
import BottomTicker from "@/components/BottomTicker";
import CompletionOverlay from "@/components/CompletionOverlay";

// Dynamic import — GlobeView uses WebGL/Three.js (no SSR)
const GlobeView = dynamic(() => import("@/components/GlobeView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="font-mono text-xs text-[#00ff88]/30 tracking-[0.3em] animate-pulse">
        INITIALIZING GLOBE
      </div>
    </div>
  ),
});

function formatElapsed(s: number): string {
  return `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

export default function SimulatePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [status, setStatus] = useState<SimulationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [allResponses, setAllResponses] = useState<RecentResponse[]>([]);
  const [eventText, setEventText] = useState(
    "GLOBAL BEHAVIORAL DEMAND SIMULATION",
  );

  // Read event text from sessionStorage (set by home page)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("macra_event");
      if (saved) setEventText(saved.toUpperCase());
    } catch {}
  }, []);

  // Elapsed time counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Accumulate unique responses across poll cycles
  useEffect(() => {
    if (!status?.recentResponses?.length) return;
    setAllResponses((prev) => {
      const existing = new Set(prev.map((r) => r.response));
      const newItems = status.recentResponses.filter(
        (r) => !existing.has(r.response),
      );
      if (newItems.length === 0) return prev;
      return [...newItems, ...prev].slice(0, 100);
    });
  }, [status?.recentResponses]);

  // Poll simulation status every 2s
  const fetchStatus = useCallback(async () => {
    try {
      const data = await getSimulationStatus(id);
      setStatus(data);
      setError(null);
    } catch {
      setError("Connection lost \u2014 retrying...");
    }
  }, [id]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const progress = status
    ? Math.round((status.progress / Math.max(1, status.total)) * 100)
    : 0;

  // ─── Error state ─────────────────────────────────────────
  if (error && !status) {
    return (
      <div className="h-screen bg-[#050a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#ff4444] font-mono text-sm mb-4">
            {error}
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-[#00ff88] hover:underline font-mono text-sm cursor-pointer"
          >
            RETURN HOME
          </button>
        </div>
      </div>
    );
  }

  // ─── Main render ─────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col overflow-hidden war-room-grid relative">
      {/* Scan line effect */}
      <div className="war-room-scan" />

      {/* ═══════════════ HERO HEADER BAR ═══════════════ */}
      <header className="h-14 flex-shrink-0 border-b border-[#0d1b2a] flex items-center px-4 lg:px-6 bg-[#050a0f]/90 backdrop-blur-sm relative z-20">
        {/* Left: MACRA + LIVE badge */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className="text-lg font-bold text-white tracking-[0.2em] glow-white cursor-pointer"
            onClick={() => router.push("/")}
          >
            MACRA
          </span>
          <div className="flex items-center gap-1.5 bg-[#ff0000]/10 border border-[#ff0000]/30 px-2 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff0000] animate-pulse-red" />
            <span className="text-[9px] font-bold text-[#ff0000] tracking-[0.2em]">
              LIVE
            </span>
          </div>
        </div>

        {/* Center: Event text + progress */}
        <div className="flex-1 flex flex-col items-center gap-0.5 mx-4 overflow-hidden">
          <span className="text-[11px] text-white/80 font-medium tracking-wider truncate max-w-lg glow-white">
            {eventText}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-white/40">
              {status?.progress || 0} / {status?.total || 0}
            </span>
            <div className="w-32 h-1 bg-[#0d1b2a] overflow-hidden">
              <div
                className="h-full bg-[#00ff88] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-[#00ff88]">
              {progress}%
            </span>
          </div>
        </div>

        {/* Right: Sentiment bar + elapsed time */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[9px] font-mono text-[#ff4444] tracking-wider">
              BEAR
            </span>
            <div className="w-20 h-1.5 bg-[#0d1b2a] flex overflow-hidden">
              <div
                className="bg-[#ff4444] transition-all duration-500"
                style={{
                  width: `${status?.sentiment?.bearish || 0}%`,
                }}
              />
              <div
                className="bg-[#333] transition-all duration-500"
                style={{
                  width: `${status?.sentiment?.neutral || 100}%`,
                }}
              />
              <div
                className="bg-[#00ff88] transition-all duration-500"
                style={{
                  width: `${status?.sentiment?.bullish || 0}%`,
                }}
              />
            </div>
            <span className="text-[9px] font-mono text-[#00ff88] tracking-wider">
              BULL
            </span>
          </div>
          <div className="w-px h-4 bg-[#0d1b2a] hidden sm:block" />
          <span className="font-mono text-xs text-white/30">
            {formatElapsed(elapsed)}
          </span>
        </div>
      </header>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <div className="flex-1 flex overflow-hidden">
        {/* Agent Feed — Left Panel */}
        <div className="w-72 border-r border-[#0d1b2a] overflow-hidden hidden lg:flex flex-col flex-shrink-0">
          <AgentFeed responses={allResponses} />
        </div>

        {/* Globe — Center (dominant) */}
        <div className="flex-1 relative">
          <GlobeView
            agentResults={status?.agentResults || []}
            recentResponses={status?.recentResponses || []}
          />
          {/* Vignette overlay for depth */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 40%, rgba(5, 10, 15, 0.6) 100%)",
            }}
          />
        </div>

        {/* Sentiment Cascade — Right Panel */}
        <div className="w-80 border-l border-[#0d1b2a] overflow-y-auto hidden lg:block flex-shrink-0">
          <SentimentCascade
            sentiment={
              status?.sentiment || {
                bullish: 0,
                bearish: 0,
                neutral: 100,
              }
            }
            agentResults={status?.agentResults || []}
            topSignals={status?.topSignals || []}
          />
        </div>
      </div>

      {/* ═══════════════ BOTTOM TICKER ═══════════════ */}
      <div className="h-9 flex-shrink-0 border-t border-[#0d1b2a] overflow-hidden bg-[#050a0f]/90">
        <BottomTicker responses={allResponses} />
      </div>

      {/* ═══════════════ COMPLETION OVERLAY ═══════════════ */}
      <AnimatePresence>
        {status?.status === "complete" && (
          <CompletionOverlay
            sentiment={status.sentiment}
            topSignals={status.topSignals}
            agentResults={status.agentResults}
            simulationId={id}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
