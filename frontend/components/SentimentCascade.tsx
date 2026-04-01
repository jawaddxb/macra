"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Signal, TrendingDown, TrendingUp } from "lucide-react";
import type { AgentResult } from "@/lib/api";

interface Props {
  sentiment: { bullish: number; bearish: number; neutral: number };
  agentResults: AgentResult[];
  topSignals: { signal: string; count: number; strength: number }[];
}

export default function SentimentCascade({
  sentiment,
  agentResults,
  topSignals,
}: Props) {
  const initialRef = useRef<Record<string, number> | null>(null);
  const [shifts, setShifts] = useState<Record<string, number>>({});

  // Compute sentiment breakdown by persona type
  const byType = useMemo(() => {
    const types = ["retail", "b2b", "institutional"] as const;
    return types.map((type) => {
      const agents = agentResults.filter(
        (a) =>
          a.type === type && a.status !== "idle" && a.status !== "thinking",
      );
      const total = agents.length;
      if (total === 0)
        return {
          name: type === "institutional" ? "INST" : type.toUpperCase(),
          bullish: 0,
          bearish: 0,
          neutral: 100,
          total: 0,
        };
      const bullish = agents.filter((a) => a.status === "bullish").length;
      const bearish = agents.filter((a) => a.status === "bearish").length;
      const neutral = total - bullish - bearish;
      return {
        name: type === "institutional" ? "INST" : type.toUpperCase(),
        bullish: Math.round((bullish / total) * 100),
        bearish: Math.round((bearish / total) * 100),
        neutral: Math.round((neutral / total) * 100),
        total,
      };
    });
  }, [agentResults]);

  // Track bearish sentiment shift since simulation start
  useEffect(() => {
    const types = ["retail", "b2b", "institutional"];
    const current: Record<string, number> = {};
    byType.forEach((d, i) => {
      if (d.total > 0) current[types[i]] = d.bearish;
    });

    if (!initialRef.current && Object.keys(current).length > 0) {
      initialRef.current = { ...current };
    }

    if (initialRef.current) {
      const newShifts: Record<string, number> = {};
      types.forEach((t) => {
        if (
          current[t] !== undefined &&
          initialRef.current?.[t] !== undefined
        ) {
          newShifts[t] = current[t] - initialRef.current[t];
        }
      });
      setShifts(newShifts);
    }
  }, [byType]);

  const maxSignalCount = Math.max(...topSignals.map((s) => s.count), 1);

  return (
    <div className="h-full flex flex-col">
      {/* ─── Overall Sentiment ─── */}
      <div className="px-4 py-3 border-b border-[#0d1b2a]">
        <div className="text-[10px] font-bold text-white/50 tracking-[0.2em] mb-3">
          SENTIMENT
        </div>
        <div className="flex items-center justify-between gap-4">
          {[
            { label: "BULLISH", value: sentiment.bullish, color: "#00ff88" },
            { label: "NEUTRAL", value: sentiment.neutral, color: "#888" },
            { label: "BEARISH", value: sentiment.bearish, color: "#ff4444" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="text-xl font-bold font-mono"
                style={{
                  color: s.color,
                  textShadow: `0 0 8px ${s.color}40`,
                }}
              >
                {s.value}%
              </div>
              <div className="text-[8px] text-white/30 tracking-[0.15em] mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Breakdown By Persona ─── */}
      <div className="px-4 py-3 border-b border-[#0d1b2a]">
        <div className="text-[10px] font-bold text-white/50 tracking-[0.2em] mb-2">
          BY PERSONA
        </div>
        {byType.some((d) => d.total > 0) ? (
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={byType} layout="vertical" barSize={10}>
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{
                  fill: "#666",
                  fontSize: 9,
                  fontFamily: "monospace",
                }}
                width={36}
                axisLine={false}
                tickLine={false}
              />
              <Bar
                dataKey="bearish"
                stackId="s"
                fill="#ff4444"
                radius={0}
              />
              <Bar
                dataKey="neutral"
                stackId="s"
                fill="#222"
                radius={0}
              />
              <Bar
                dataKey="bullish"
                stackId="s"
                fill="#00ff88"
                radius={0}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-20 flex items-center justify-center">
            <span className="font-mono text-[10px] text-white/20">
              COLLECTING DATA...
            </span>
          </div>
        )}

        {/* Shift indicators */}
        {Object.keys(shifts).length > 0 && (
          <div className="mt-2 space-y-1">
            {(["retail", "b2b", "institutional"] as const).map((type) => {
              const shift = shifts[type];
              if (shift === undefined || Math.abs(shift) < 2) return null;
              return (
                <div
                  key={type}
                  className="flex items-center gap-1.5 text-[9px] font-mono"
                >
                  {shift > 0 ? (
                    <TrendingDown size={10} className="text-[#ff4444]" />
                  ) : (
                    <TrendingUp size={10} className="text-[#00ff88]" />
                  )}
                  <span className="text-white/40">{type}</span>
                  <span
                    className={
                      shift > 0 ? "text-[#ff4444]" : "text-[#00ff88]"
                    }
                  >
                    {shift > 0 ? "+" : ""}
                    {shift}% {shift > 0 ? "more bearish" : "less bearish"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Top Signals ─── */}
      <div className="px-4 py-3 flex-1">
        <div className="flex items-center gap-2 mb-3">
          <Signal size={11} className="text-[#00ff88]" />
          <span className="text-[10px] font-bold text-white/50 tracking-[0.2em]">
            TOP SIGNALS
          </span>
        </div>
        {topSignals.length === 0 ? (
          <div className="font-mono text-[10px] text-white/20 text-center py-4">
            DETECTING PATTERNS...
          </div>
        ) : (
          <div className="space-y-2.5">
            {topSignals.slice(0, 5).map((signal, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-white/60 font-mono truncate flex-1 mr-2 capitalize">
                    {signal.signal}
                  </span>
                  <span className="text-[9px] font-mono text-[#00ff88]">
                    {signal.count}
                  </span>
                </div>
                <div className="w-full h-1 bg-[#0d1b2a] overflow-hidden">
                  <div
                    className="h-full bg-[#00ff88]/60 transition-all duration-500"
                    style={{
                      width: `${(signal.count / maxSignalCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
