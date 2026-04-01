"use client";

import type { RecentResponse } from "@/lib/api";

interface Props {
  responses: RecentResponse[];
}

const typeTag = (type: string) => {
  switch (type) {
    case "retail":
      return "RTL";
    case "b2b":
      return "B2B";
    case "institutional":
      return "INS";
    default:
      return type.slice(0, 3).toUpperCase();
  }
};

export default function BottomTicker({ responses }: Props) {
  if (responses.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="font-mono text-[10px] text-white/20 tracking-[0.15em]">
          AWAITING AGENT RESPONSES...
        </span>
      </div>
    );
  }

  const items = responses.slice(0, 40);
  const scrollDuration = Math.max(30, items.length * 2);

  return (
    <div className="h-full flex items-center overflow-hidden">
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `ticker-scroll ${scrollDuration}s linear infinite`,
        }}
      >
        {[0, 1].map((pass) => (
          <div key={pass} className="flex">
            {items.map((r, i) => (
              <span
                key={`${pass}_${i}`}
                className="inline-flex items-center gap-1.5 mx-4 text-[10px] font-mono"
              >
                <span
                  className={`font-bold ${
                    r.sentiment > 0
                      ? "text-[#00ff88]"
                      : r.sentiment < 0
                        ? "text-[#ff4444]"
                        : "text-[#888]"
                  }`}
                >
                  [{typeTag(r.type)} &middot; {r.region}]
                </span>
                <span
                  className={
                    r.sentiment > 0
                      ? "text-[#00ff88]/60"
                      : r.sentiment < 0
                        ? "text-[#ff4444]/60"
                        : "text-white/30"
                  }
                >
                  {r.response && r.response.length > 60
                    ? r.response.slice(0, 60) + "\u2026"
                    : r.response || "\u2014"}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
