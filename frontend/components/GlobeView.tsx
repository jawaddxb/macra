"use client";

import Globe from "react-globe.gl";
import { useRef, useEffect, useMemo, useState } from "react";
import type { AgentResult, RecentResponse } from "@/lib/api";

// ─── Region Coordinates ────────────────────────────────────
const REGION_COORDS: Record<string, [number, number]> = {
  "North America": [40, -100],
  "South America": [-15, -60],
  "Europe": [50, 10],
  EU: [50, 10],
  Africa: [5, 25],
  AF: [5, 25],
  MENA: [28, 40],
  "Middle East": [28, 45],
  "Asia-Pacific": [25, 110],
  APAC: [25, 110],
  Asia: [30, 100],
  Singapore: [1.35, 103.82],
  "Hong Kong": [22.32, 114.17],
  Tokyo: [35.68, 139.69],
  Japan: [36, 138],
  Shanghai: [31.23, 121.47],
  Beijing: [39.9, 116.4],
  China: [35, 105],
  Mumbai: [19.08, 72.88],
  India: [20, 77],
  Seoul: [37.57, 126.98],
  "South Korea": [36, 128],
  Sydney: [-33.87, 151.21],
  Australia: [-25, 135],
  London: [51.51, -0.13],
  UK: [54, -2],
  Frankfurt: [50.11, 8.68],
  Germany: [51, 10],
  Paris: [48.86, 2.35],
  France: [46, 2],
  Zurich: [47.37, 8.54],
  Amsterdam: [52.37, 4.9],
  "New York": [40.71, -74.01],
  Chicago: [41.88, -87.63],
  "San Francisco": [37.77, -122.42],
  "Los Angeles": [34.05, -118.24],
  USA: [39, -98],
  US: [39, -98],
  "United States": [39, -98],
  Toronto: [43.65, -79.38],
  Canada: [56, -106],
  "São Paulo": [-23.55, -46.63],
  Brazil: [-14, -51],
  "Mexico City": [19.43, -99.13],
  Mexico: [23, -102],
  Dubai: [25.2, 55.27],
  UAE: [24, 54],
  Riyadh: [24.71, 46.68],
  "Saudi Arabia": [24, 45],
  Lagos: [6.52, 3.38],
  Nigeria: [10, 8],
  Johannesburg: [-26.2, 28.05],
  "South Africa": [-29, 24],
  Nairobi: [-1.29, 36.82],
  Kenya: [0, 38],
  Jakarta: [-6.2, 106.85],
  Indonesia: [-5, 120],
  Bangkok: [13.76, 100.5],
  Thailand: [15, 100],
  Taipei: [25.03, 121.57],
  Taiwan: [24, 121],
};

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return ((h & 0x7fffffff) % 10000) / 10000;
}

function getCoords(region: string, id: string = ""): [number, number] {
  const base = REGION_COORDS[region];
  const jLat = (hash(id + "lat") - 0.5) * 6;
  const jLng = (hash(id + "lng") - 0.5) * 6;
  if (base) return [base[0] + jLat, base[1] + jLng];
  return [(hash(region + "lat") - 0.5) * 120, (hash(region + "lng") - 0.5) * 300];
}

// ─── Component ─────────────────────────────────────────────
interface Props {
  agentResults: AgentResult[];
  recentResponses: RecentResponse[];
}

export default function GlobeView({ agentResults, recentResponses }: Props) {
  const globeEl = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const setupDone = useRef(false);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Configure globe controls (auto-rotate, camera)
  useEffect(() => {
    if (setupDone.current) return;
    if (!globeEl.current) return;
    try {
      const controls = globeEl.current.controls();
      if (!controls) return;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      controls.enableZoom = false;
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.2 }, 0);
      setupDone.current = true;
    } catch {
      // Globe not ready yet — will retry on next render
    }
  });

  // Points: completed agents
  const pointsData = useMemo(() => {
    return agentResults
      .filter((a) => a.status !== "idle" && a.status !== "thinking")
      .map((a) => {
        const [lat, lng] = getCoords(a.region, a.id);
        return {
          lat,
          lng,
          color:
            a.status === "bullish"
              ? "#00ff88"
              : a.status === "bearish"
                ? "#ff4444"
                : "#666666",
          alt: 0.01,
          radius: 0.3,
        };
      });
  }, [agentResults]);

  // Rings: recent response ripples
  const ringsData = useMemo(() => {
    return recentResponses.slice(-10).map((r, i) => {
      const [lat, lng] = getCoords(
        r.region,
        `ring_${i}_${r.response?.slice(0, 8)}`,
      );
      return {
        lat,
        lng,
        maxR: 4,
        propagationSpeed: 2,
        repeatPeriod: 2000,
        color:
          r.sentiment > 0
            ? "rgba(0, 255, 136, 0.5)"
            : r.sentiment < 0
              ? "rgba(255, 68, 68, 0.5)"
              : "rgba(136, 136, 136, 0.3)",
      };
    });
  }, [recentResponses]);

  // Arcs: connect consecutive recent responses
  const arcsData = useMemo(() => {
    const recent = recentResponses.slice(-6);
    if (recent.length < 2) return [];
    return recent.slice(0, -1).map((r, i) => {
      const [startLat, startLng] = getCoords(r.region, `arc_s_${i}`);
      const [endLat, endLng] = getCoords(
        recent[i + 1].region,
        `arc_e_${i}`,
      );
      return {
        startLat,
        startLng,
        endLat,
        endLng,
        color:
          r.sentiment > 0
            ? "rgba(0, 255, 136, 0.25)"
            : r.sentiment < 0
              ? "rgba(255, 68, 68, 0.25)"
              : "rgba(136, 136, 136, 0.15)",
      };
    });
  }, [recentResponses]);

  return (
    <div ref={containerRef} className="w-full h-full">
      {size.w > 0 && (
        <Globe
          ref={globeEl}
          width={size.w}
          height={size.h}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor="#00ff88"
          atmosphereAltitude={0.12}
          animateIn={true}
          pointsData={pointsData}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointAltitude="alt"
          pointRadius="radius"
          ringsData={ringsData}
          ringLat="lat"
          ringLng="lng"
          ringColor="color"
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeatPeriod="repeatPeriod"
          arcsData={arcsData}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor="color"
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={1500}
          arcStroke={0.5}
          enablePointerInteraction={false}
        />
      )}
    </div>
  );
}
