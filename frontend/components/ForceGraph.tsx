"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { AgentResult } from "@/lib/api";

interface ForceGraphProps {
  agents: AgentResult[];
  width?: number;
  height?: number;
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
  idle: "#333333",
  thinking: "#eab308",
  bullish: "#22c55e",
  bearish: "#ef4444",
  neutral: "#666666",
};

const CLUSTER_CENTERS: Record<string, { x: number; y: number }> = {
  retail: { x: 0.25, y: 0.5 },
  b2b: { x: 0.5, y: 0.3 },
  institutional: { x: 0.75, y: 0.5 },
};

const CLUSTER_LABELS: Record<string, string> = {
  retail: "RETAIL CONSUMERS",
  b2b: "B2B BUYERS",
  institutional: "INSTITUTIONAL TRADERS",
};

export default function ForceGraph({ agents, width = 800, height = 600 }: ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    agent: GraphNode;
  } | null>(null);

  useEffect(() => {
    if (!svgRef.current || agents.length === 0) return;

    const svg = d3.select(svgRef.current);

    // Create nodes from agents
    const nodes: GraphNode[] = agents.map((a) => ({
      id: a.id,
      type: a.type,
      status: a.status,
      sentiment: a.sentiment,
      region: a.region,
      x: CLUSTER_CENTERS[a.type]?.x * width + (Math.random() - 0.5) * 100,
      y: CLUSTER_CENTERS[a.type]?.y * height + (Math.random() - 0.5) * 100,
    }));

    // Create some links between nearby agents of same type
    const links: GraphLink[] = [];
    const typeGroups: Record<string, GraphNode[]> = {};
    nodes.forEach((n) => {
      if (!typeGroups[n.type]) typeGroups[n.type] = [];
      typeGroups[n.type].push(n);
    });

    Object.values(typeGroups).forEach((group) => {
      for (let i = 0; i < Math.min(group.length - 1, group.length * 0.3); i++) {
        const a = Math.floor(Math.random() * group.length);
        let b = Math.floor(Math.random() * group.length);
        if (a !== b) {
          links.push({ source: group[a].id, target: group[b].id });
        }
      }
    });

    // Stop previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Clear previous content
    svg.selectAll("*").remove();

    // Add defs for glow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "2")
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Draw cluster labels
    Object.entries(CLUSTER_LABELS).forEach(([type, label]) => {
      const center = CLUSTER_CENTERS[type];
      svg
        .append("text")
        .attr("x", center.x * width)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("fill", "#444444")
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .attr("letter-spacing", "2px")
        .text(label);
    });

    // Draw links
    const linkGroup = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#1a1a1a")
      .attr("stroke-width", 0.5)
      .attr("stroke-opacity", 0.4);

    // Draw nodes
    const nodeGroup = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => (d.status === "thinking" ? 5 : 4))
      .attr("fill", (d) => STATUS_COLORS[d.status] || "#333")
      .attr("stroke", (d) =>
        d.status === "thinking" ? "#eab308" : "transparent"
      )
      .attr("stroke-width", (d) => (d.status === "thinking" ? 2 : 0))
      .attr("stroke-opacity", 0.5)
      .style("filter", (d) =>
        d.status !== "idle" ? "url(#glow)" : "none"
      )
      .style("cursor", "pointer")
      .on("mouseenter", (event, d) => {
        const [x, y] = d3.pointer(event, svgRef.current);
        setTooltip({ x, y, agent: d });
      })
      .on("mouseleave", () => {
        setTooltip(null);
      });

    // Force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(20).strength(0.1)
      )
      .force("charge", d3.forceManyBody().strength(-3))
      .force("collision", d3.forceCollide(6))
      .force(
        "x",
        d3.forceX<GraphNode>((d) => (CLUSTER_CENTERS[d.type]?.x || 0.5) * width).strength(0.15)
      )
      .force(
        "y",
        d3.forceY<GraphNode>((d) => (CLUSTER_CENTERS[d.type]?.y || 0.5) * height).strength(0.15)
      )
      .alphaDecay(0.02)
      .on("tick", () => {
        linkGroup
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);

        nodeGroup.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
      });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [agents.length]); // Only re-init on agent count changes

  // Update colors without re-creating the simulation
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    svg
      .selectAll<SVGCircleElement, GraphNode>("circle")
      .data(agents as any[], (d: any) => d.id)
      .attr("fill", (d: any) => STATUS_COLORS[d.status] || "#333")
      .attr("r", (d: any) => (d.status === "thinking" ? 5 : 4))
      .attr("stroke", (d: any) =>
        d.status === "thinking" ? "#eab308" : "transparent"
      )
      .style("filter", (d: any) =>
        d.status !== "idle" ? "url(#glow)" : "none"
      );
  }, [agents]);

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
      />
      {tooltip && (
        <div
          className="absolute pointer-events-none glass rounded-lg px-3 py-2 text-xs z-10"
          style={{ left: tooltip.x + 10, top: tooltip.y - 10 }}
        >
          <div className="font-semibold text-white capitalize">
            {tooltip.agent.type}
          </div>
          <div className="text-muted">{tooltip.agent.region}</div>
          <div className="mt-1">
            <span
              className="capitalize font-medium"
              style={{
                color: STATUS_COLORS[tooltip.agent.status] || "#666",
              }}
            >
              {tooltip.agent.status}
            </span>
            {tooltip.agent.sentiment !== null && (
              <span className="text-muted ml-2">
                ({tooltip.agent.sentiment > 0 ? "+" : ""}
                {(tooltip.agent.sentiment * 100).toFixed(0)}%)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
