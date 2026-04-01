"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Download, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import type { AgentResult } from "@/lib/api";

interface Props {
  sentiment: { bullish: number; bearish: number; neutral: number };
  topSignals: { signal: string; count: number; strength: number }[];
  agentResults: AgentResult[];
  simulationId: string;
}

export default function CompletionOverlay({
  sentiment,
  topSignals,
  agentResults,
  simulationId,
}: Props) {
  const router = useRouter();

  const extremes = useMemo(() => {
    const sorted = [...agentResults]
      .filter((a) => a.sentiment !== null && a.response)
      .sort((a, b) => (a.sentiment ?? 0) - (b.sentiment ?? 0));
    return {
      mostBearish: sorted[0],
      mostBullish: sorted[sorted.length - 1],
    };
  }, [agentResults]);

  const handleDownload = () => {
    const data = {
      simulationId,
      timestamp: new Date().toISOString(),
      totalAgents: agentResults.length,
      sentiment,
      topSignals: topSignals.slice(0, 10),
      agents: agentResults
        .filter((a) => a.response)
        .map((a) => ({
          id: a.id,
          type: a.type,
          region: a.region,
          status: a.status,
          sentiment: a.sentiment,
          response: a.response,
        })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `macra-${simulationId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="max-w-xl w-full mx-4"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", bounce: 0.25 }}
      >
        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-white tracking-[0.3em] glow-white mb-8">
          SIMULATION COMPLETE
        </h1>

        {/* Sentiment Summary */}
        <div className="flex items-center justify-center gap-8 mb-8">
          {[
            {
              label: "BULLISH",
              value: sentiment.bullish,
              color: "#00ff88",
              Icon: TrendingUp,
            },
            {
              label: "BEARISH",
              value: sentiment.bearish,
              color: "#ff4444",
              Icon: TrendingDown,
            },
          ].map(({ label, value, color, Icon }) => (
            <div key={label} className="text-center">
              <Icon
                size={18}
                style={{ color }}
                className="mx-auto mb-1"
              />
              <div
                className="text-3xl font-bold font-mono"
                style={{
                  color,
                  textShadow: `0 0 12px ${color}60`,
                }}
              >
                {value}%
              </div>
              <div className="text-[9px] text-white/40 tracking-[0.2em] mt-1">
                {label}
              </div>
            </div>
          ))}
          <div className="text-center">
            <div className="w-[18px] h-[18px] mx-auto mb-1" />
            <div className="text-3xl font-bold font-mono text-[#888]">
              {sentiment.neutral}%
            </div>
            <div className="text-[9px] text-white/40 tracking-[0.2em] mt-1">
              NEUTRAL
            </div>
          </div>
        </div>

        {/* Top Signals */}
        <div className="border border-[#0d1b2a] bg-[#050a0f]/80 p-4 mb-4">
          <div className="text-[10px] font-bold text-white/40 tracking-[0.2em] mb-2">
            TOP SIGNALS
          </div>
          {topSignals.slice(0, 3).map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-1 font-mono text-xs"
            >
              <span className="text-white/60 capitalize">
                {s.signal}
              </span>
              <span className="text-[#00ff88]">{s.count} hits</span>
            </div>
          ))}
        </div>

        {/* Most Extreme Responses */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {extremes.mostBullish && (
            <div className="border border-[#00ff88]/20 bg-[#00ff88]/5 p-3">
              <div className="text-[8px] font-bold text-[#00ff88] tracking-[0.15em] mb-1">
                MOST BULLISH
              </div>
              <div className="text-[9px] text-white/40 font-mono mb-1">
                {extremes.mostBullish.type} &middot;{" "}
                {extremes.mostBullish.region}
              </div>
              <p className="text-[10px] text-white/60 font-mono leading-relaxed line-clamp-3">
                &ldquo;{extremes.mostBullish.response}&rdquo;
              </p>
            </div>
          )}
          {extremes.mostBearish && (
            <div className="border border-[#ff4444]/20 bg-[#ff4444]/5 p-3">
              <div className="text-[8px] font-bold text-[#ff4444] tracking-[0.15em] mb-1">
                MOST BEARISH
              </div>
              <div className="text-[9px] text-white/40 font-mono mb-1">
                {extremes.mostBearish.type} &middot;{" "}
                {extremes.mostBearish.region}
              </div>
              <p className="text-[10px] text-white/60 font-mono leading-relaxed line-clamp-3">
                &ldquo;{extremes.mostBearish.response}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/results/${simulationId}`)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#00ff88] hover:bg-[#00ff88]/90 text-[#050a0f] font-bold text-sm tracking-wider transition-colors cursor-pointer"
          >
            VIEW FULL RESULTS <ArrowRight size={14} />
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 py-3 px-4 border border-[#0d1b2a] hover:border-white/20 text-white/60 hover:text-white text-sm transition-colors cursor-pointer"
          >
            <Download size={14} />
          </button>
        </div>

        <div className="text-center mt-4">
          <span className="text-[9px] font-mono text-white/20">
            {agentResults.length} agents processed &middot; ID:{" "}
            {simulationId}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
