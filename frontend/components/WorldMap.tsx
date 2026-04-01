"use client";

import { motion } from "framer-motion";

interface GeoRegion {
  name: string;
  impact: number;
}

interface WorldMapProps {
  data: Record<string, GeoRegion>;
}

const REGION_PATHS: Record<string, { path: string; labelX: number; labelY: number }> = {
  NA: {
    path: "M50,65 L140,55 L185,70 L195,90 L185,135 L165,165 L140,178 L115,168 L90,175 L65,155 L45,130 L42,100 Z",
    labelX: 120,
    labelY: 120,
  },
  SA: {
    path: "M130,195 L170,190 L190,205 L205,230 L210,270 L200,310 L178,345 L158,355 L140,340 L122,295 L112,255 L115,220 Z",
    labelX: 162,
    labelY: 275,
  },
  EU: {
    path: "M305,48 L380,42 L430,50 L445,62 L440,90 L420,110 L390,118 L355,112 L320,100 L302,82 L298,62 Z",
    labelX: 370,
    labelY: 80,
  },
  AF: {
    path: "M305,148 L385,142 L420,158 L435,190 L435,240 L420,290 L395,325 L365,335 L335,320 L310,275 L295,225 L295,180 Z",
    labelX: 365,
    labelY: 235,
  },
  MENA: {
    path: "M448,88 L520,78 L558,88 L562,108 L555,145 L530,158 L500,162 L472,152 L450,132 L442,108 Z",
    labelX: 502,
    labelY: 120,
  },
  APAC: {
    path: "M548,48 L660,38 L710,52 L730,75 L735,115 L720,165 L690,200 L655,215 L608,218 L568,195 L548,155 L540,105 Z",
    labelX: 640,
    labelY: 128,
  },
};

function getImpactColor(impact: number): string {
  const abs = Math.abs(impact);
  if (impact < 0) {
    // Bearish — red tones
    if (abs > 20) return "rgba(220, 38, 38, 0.65)";
    if (abs > 15) return "rgba(220, 38, 38, 0.5)";
    if (abs > 10) return "rgba(220, 38, 38, 0.35)";
    if (abs > 5) return "rgba(220, 38, 38, 0.22)";
    return "rgba(220, 38, 38, 0.1)";
  }
  // Bullish — teal/green tones
  if (abs > 20) return "rgba(10, 123, 110, 0.7)";
  if (abs > 15) return "rgba(10, 123, 110, 0.55)";
  if (abs > 10) return "rgba(10, 123, 110, 0.4)";
  if (abs > 5) return "rgba(10, 123, 110, 0.25)";
  return "rgba(10, 123, 110, 0.12)";
}

export default function WorldMap({ data }: WorldMapProps) {
  return (
    <div className="w-full">
      <svg viewBox="0 0 760 380" className="w-full h-auto">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line
            key={`v${i}`}
            x1={i * 100}
            y1={0}
            x2={i * 100}
            y2={380}
            stroke="#111"
            strokeWidth={0.5}
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={i * 100}
            x2={760}
            y2={i * 100}
            stroke="#111"
            strokeWidth={0.5}
          />
        ))}

        {/* Regions */}
        {Object.entries(REGION_PATHS).map(([key, region]) => {
          const regionData = data[key];
          if (!regionData) return null;
          return (
            <motion.g key={key}>
              <motion.path
                d={region.path}
                fill={getImpactColor(regionData.impact)}
                stroke={regionData.impact < 0 ? "#dc2626" : "#0A7B6E"}
                strokeWidth={1}
                strokeOpacity={0.3}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * Object.keys(REGION_PATHS).indexOf(key) }}
                whileHover={{ fillOpacity: 0.8, strokeOpacity: 0.8 }}
                style={{ cursor: "pointer" }}
              />
              <text
                x={region.labelX}
                y={region.labelY - 10}
                textAnchor="middle"
                fill="#999"
                fontSize="10"
                fontWeight="600"
                letterSpacing="1"
              >
                {regionData.name}
              </text>
              <text
                x={region.labelX}
                y={region.labelY + 8}
                textAnchor="middle"
                fill={regionData.impact < 0 ? "#ef4444" : "#0A7B6E"}
                fontSize="16"
                fontWeight="700"
              >
                {regionData.impact > 0 ? "+" : ""}
                {regionData.impact}%
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
