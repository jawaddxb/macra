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
    path: "M40,60 L180,60 L200,80 L200,160 L160,200 L120,180 L80,200 L40,160 Z",
    labelX: 120,
    labelY: 130,
  },
  SA: {
    path: "M120,210 L180,210 L200,250 L190,320 L160,360 L130,350 L110,300 L100,250 Z",
    labelX: 150,
    labelY: 285,
  },
  EU: {
    path: "M310,55 L420,50 L440,70 L430,130 L380,140 L340,130 L300,120 L300,80 Z",
    labelX: 370,
    labelY: 95,
  },
  AF: {
    path: "M310,150 L410,150 L430,180 L420,280 L380,320 L340,310 L310,260 L300,200 Z",
    labelX: 365,
    labelY: 235,
  },
  MENA: {
    path: "M440,90 L530,80 L550,120 L540,170 L500,180 L460,170 L440,140 Z",
    labelX: 490,
    labelY: 130,
  },
  APAC: {
    path: "M540,60 L700,50 L720,80 L730,160 L700,220 L640,250 L580,230 L550,180 L540,120 Z",
    labelX: 635,
    labelY: 140,
  },
};

function getImpactColor(impact: number): string {
  const abs = Math.abs(impact);
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
                stroke="#0A7B6E"
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
                fill="#0A7B6E"
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
