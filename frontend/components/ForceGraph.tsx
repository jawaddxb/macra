"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { AgentResult } from "@/lib/api";

interface ForceGraphProps {
  agents: AgentResult[];
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  type: string;
  status: string;
  sentiment: number | null;
  region: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

const STATUS_COLORS: Record<string, string> = {
  idle: "#2a2a2a",
  thinking: "#eab308",
  bullish: "#22c55e",
  bearish: "#ef4444",
  neutral: "#555555",
};

const CLUSTER_X: Record<string, number> = {
  retail: 0.22,
  b2b: 0.5,
  institutional: 0.78,
};
const CLUSTER_Y = 0.5;

const CLUSTER_LABELS: Record<string, string> = {
  retail: "RETAIL CONSUMERS",
  b2b: "B2B BUYERS",
  institutional: "INSTITUTIONAL TRADERS",
};

export default function ForceGraph({ agents }: ForceGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const [dims, setDims] = useState({ w: 800, h: 580 });
  const [tooltip, setTooltip] = useState<{ x: number; y: number; agent: GraphNode } | null>(null);

  // Measure container on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setDims({ w: width, h: height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Build/rebuild graph when we have agents + dimensions
  useEffect(() => {
    if (!svgRef.current || agents.length === 0 || dims.w === 0) return;

    const { w, h } = dims;
    const svg = d3.select(svgRef.current);

    const nodes: GraphNode[] = agents.map((a) => ({
      id: a.id,
      type: a.type,
      status: a.status,
      sentiment: a.sentiment,
      region: a.region,
      x: CLUSTER_X[a.type] * w + (Math.random() - 0.5) * 60,
      y: CLUSTER_Y * h + (Math.random() - 0.5) * 60,
    }));

    const links: GraphLink[] = [];
    const byType: Record<string, GraphNode[]> = {};
    nodes.forEach((n) => { (byType[n.type] = byType[n.type] || []).push(n); });
    Object.values(byType).forEach((group) => {
      const n = Math.min(group.length - 1, Math.ceil(group.length * 0.25));
      for (let i = 0; i < n; i++) {
        const a = Math.floor(Math.random() * group.length);
        const b = (a + 1 + Math.floor(Math.random() * (group.length - 1))) % group.length;
        links.push({ source: group[a].id, target: group[b].id });
      }
    });

    if (simulationRef.current) simulationRef.current.stop();
    svg.selectAll("*").remove();

    // Glow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Cluster labels
    Object.entries(CLUSTER_LABELS).forEach(([type, label]) => {
      svg.append("text")
        .attr("x", CLUSTER_X[type] * w)
        .attr("y", 24)
        .attr("text-anchor", "middle")
        .attr("fill", "#3a3a3a")
        .attr("font-size", "9px")
        .attr("font-weight", "700")
        .attr("letter-spacing", "2px")
        .text(label);
    });

    const linkSel = svg.append("g")
      .selectAll("line").data(links).enter().append("line")
      .attr("stroke", "#1a1a1a").attr("stroke-width", 0.6).attr("stroke-opacity", 0.5);

    const nodeSel = svg.append("g")
      .selectAll("circle").data(nodes).enter().append("circle")
      .attr("r", (d) => d.status === "thinking" ? 5.5 : 4)
      .attr("fill", (d) => STATUS_COLORS[d.status] || "#2a2a2a")
      .attr("stroke", (d) => d.status === "thinking" ? "#eab308" : "transparent")
      .attr("stroke-width", 1.5)
      .style("filter", (d) => d.status !== "idle" ? "url(#glow)" : "none")
      .style("cursor", "pointer")
      .on("mouseenter", (event, d) => {
        const [x, y] = d3.pointer(event, svgRef.current);
        setTooltip({ x, y, agent: d });
      })
      .on("mouseleave", () => setTooltip(null));

    const sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(22).strength(0.08))
      .force("charge", d3.forceManyBody().strength(-20))
      .force("collision", d3.forceCollide(7))
      .force("x", d3.forceX<GraphNode>((d) => CLUSTER_X[d.type] * w).strength(0.35))
      .force("y", d3.forceY<GraphNode>(() => CLUSTER_Y * h).strength(0.2))
      .stop();

    // Pre-run ticks synchronously for immediate layout
    for (let i = 0; i < 200; i++) sim.tick();

    // Paint immediately
    const tick = () => {
      linkSel
        .attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y);
      nodeSel.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
    };
    tick();

    // Continue animating
    sim.alphaDecay(0.025).restart().on("tick", tick);
    simulationRef.current = sim;

    return () => { sim.stop(); };
  }, [agents.length, dims.w, dims.h]);

  // Live colour updates without rebuilding
  useEffect(() => {
    if (!svgRef.current || agents.length === 0) return;
    d3.select(svgRef.current)
      .selectAll<SVGCircleElement, GraphNode>("circle")
      .data(agents as any[], (d: any) => d.id)
      .attr("fill", (d: any) => STATUS_COLORS[d.status] || "#2a2a2a")
      .attr("r", (d: any) => d.status === "thinking" ? 5.5 : 4)
      .attr("stroke", (d: any) => d.status === "thinking" ? "#eab308" : "transparent")
      .style("filter", (d: any) => d.status !== "idle" ? "url(#glow)" : "none");
  }, [agents]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg
        ref={svgRef}
        width={dims.w}
        height={dims.h}
        className="w-full h-full"
      />
      {tooltip && (
        <div
          className="absolute pointer-events-none glass rounded-lg px-3 py-2 text-xs z-10 max-w-[180px]"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <div className="font-semibold text-white capitalize">{tooltip.agent.type}</div>
          <div className="text-muted">{tooltip.agent.region}</div>
          <div className="mt-1">
            <span className="capitalize font-medium" style={{ color: STATUS_COLORS[tooltip.agent.status] }}>
              {tooltip.agent.status}
            </span>
            {tooltip.agent.sentiment !== null && (
              <span className="text-muted ml-2">
                ({tooltip.agent.sentiment > 0 ? "+" : ""}{(tooltip.agent.sentiment * 100).toFixed(0)}%)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
