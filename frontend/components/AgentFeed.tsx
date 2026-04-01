"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Building2, Landmark } from "lucide-react";
import type { RecentResponse } from "@/lib/api";

const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "retail":
      return <User size={11} className="text-blue-400" />;
    case "b2b":
      return <Building2 size={11} className="text-purple-400" />;
    case "institutional":
      return <Landmark size={11} className="text-amber-400" />;
    default:
      return <User size={11} className="text-gray-500" />;
  }
};

const typeLabel = (type: string) => {
  switch (type) {
    case "retail":
      return "RTL";
    case "b2b":
      return "B2B";
    case "institutional":
      return "INS";
    default:
      return type.toUpperCase().slice(0, 3);
  }
};

const typeBadgeClass = (type: string) => {
  switch (type) {
    case "retail":
      return "bg-blue-500/15 text-blue-400";
    case "b2b":
      return "bg-purple-500/15 text-purple-400";
    case "institutional":
      return "bg-amber-500/15 text-amber-400";
    default:
      return "bg-gray-500/15 text-gray-400";
  }
};

interface Props {
  responses: RecentResponse[];
}

export default function AgentFeed({ responses }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [responses.length]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[#0d1b2a] flex items-center gap-2 flex-shrink-0">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00ff88]" />
        </span>
        <span className="text-[10px] font-bold text-white/50 tracking-[0.2em]">
          AGENT FEED
        </span>
        <span className="ml-auto text-[10px] font-mono text-white/20">
          {responses.length}
        </span>
      </div>

      {/* Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {responses.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="font-mono text-[10px] text-[#00ff88]/30 tracking-[0.2em] animate-pulse">
              AWAITING RESPONSES
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {responses.slice(0, 25).map((r, i) => (
              <motion.div
                key={`${r.response?.slice(0, 30)}_${i}`}
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="border-b border-[#0d1b2a]/60 px-3 py-2"
              >
                {/* Top row: type + region + sentiment */}
                <div className="flex items-center gap-1.5 mb-1">
                  <TypeIcon type={r.type} />
                  <span
                    className={`text-[8px] font-bold tracking-[0.15em] px-1 py-px ${typeBadgeClass(r.type)}`}
                  >
                    {typeLabel(r.type)}
                  </span>
                  <span className="text-[9px] text-white/30 font-mono ml-auto">
                    {r.region}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold ${
                      r.sentiment > 0
                        ? "text-[#00ff88]"
                        : r.sentiment < 0
                          ? "text-[#ff4444]"
                          : "text-[#888]"
                    }`}
                  >
                    {r.sentiment > 0 ? "+" : ""}
                    {(r.sentiment * 100).toFixed(0)}%
                  </span>
                </div>
                {/* Response text */}
                <p className="text-[10px] font-mono text-white/50 leading-relaxed line-clamp-2">
                  {r.response || "\u2014"}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
