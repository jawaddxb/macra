"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  ArrowUp,
  ArrowDown,
  Download,
  Code2,
  RotateCcw,
  Shield,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import WorldMap from "@/components/WorldMap";
import { getSimulationResults, type SimulationResults } from "@/lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  ChartTooltip,
  Legend
);

function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end * 10) / 10);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [end, duration]);

  return count;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hashCopied, setHashCopied] = useState(false);

  useEffect(() => {
    async function fetchResults() {
      try {
        const data = await getSimulationResults(id);
        if ("error" in data) {
          setError((data as any).error);
          return;
        }
        setResults(data);
      } catch (err) {
        setError("Failed to load results");
      }
    }
    fetchResults();
  }, [id]);

  const demandCount = useCountUp(results?.demandChange || 0, 2500);

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <div className="text-red-400 mb-4">{error}</div>
          <button
            onClick={() => router.push("/")}
            className="text-accent hover:text-accent-light cursor-pointer"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const isPositive = results.demandChange >= 0;

  // Demand curve chart data
  const curveLabels = results.demandCurve.map((p) => `Day ${p.day}`);
  const curveData = {
    labels: curveLabels,
    datasets: [
      {
        label: "Upper Bound",
        data: results.demandCurve.map((p) => p.upper),
        borderColor: "transparent",
        backgroundColor: "rgba(10, 123, 110, 0.1)",
        fill: true,
        pointRadius: 0,
        tension: 0.4,
      },
      {
        label: "Projected Change",
        data: results.demandCurve.map((p) => p.value),
        borderColor: "#0A7B6E",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: false,
      },
      {
        label: "Lower Bound",
        data: results.demandCurve.map((p) => p.lower),
        borderColor: "transparent",
        backgroundColor: "rgba(10, 123, 110, 0.1)",
        fill: "-2",
        pointRadius: 0,
        tension: 0.4,
      },
    ],
  };

  const curveOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#161616",
        titleColor: "#fff",
        bodyColor: "#e5e5e5",
        borderColor: "#1f1f1f",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: "#1a1a1a" },
        ticks: { color: "#666", maxTicksLimit: 8, font: { size: 10 } },
      },
      y: {
        grid: { color: "#1a1a1a" },
        ticks: {
          color: "#666",
          callback: (value: any) => `${value > 0 ? "+" : ""}${value}%`,
          font: { size: 10 },
        },
      },
    },
  };

  // Behavioral breakdown bar chart
  const behavioralData = {
    labels: ["Retail Consumers", "B2B Buyers", "Institutional Traders"],
    datasets: [
      {
        label: "Sentiment Impact",
        data: [
          results.behavioral.retail,
          results.behavioral.b2b,
          results.behavioral.institutional,
        ],
        backgroundColor: [
          results.behavioral.retail >= 0 ? "#22c55e" : "#ef4444",
          results.behavioral.b2b >= 0 ? "#22c55e" : "#ef4444",
          results.behavioral.institutional >= 0 ? "#22c55e" : "#ef4444",
        ],
        borderRadius: 4,
        barThickness: 24,
      },
    ],
  };

  const behavioralOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#161616",
        titleColor: "#fff",
        bodyColor: "#e5e5e5",
        borderColor: "#1f1f1f",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: "#1a1a1a" },
        ticks: {
          color: "#666",
          callback: (value: any) => `${value}%`,
          font: { size: 10 },
        },
      },
      y: {
        grid: { display: false },
        ticks: { color: "#999", font: { size: 11 } },
      },
    },
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <nav className="glass border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="text-xl font-bold text-accent cursor-pointer"
              onClick={() => router.push("/")}
            >
              MACRA
            </span>
            <span className="text-xs text-muted">/ RESULTS</span>
            <span className="text-xs font-mono text-muted">{id}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-green-400 text-xs font-semibold">
              <CheckCircle2 size={14} />
              SIMULATION COMPLETE
            </span>
            <div className="w-px h-4 bg-border" />
            <span className="flex items-center gap-1 text-xs text-accent">
              <Shield size={12} />
              Knowracle Attested
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Hero Metric */}
        <motion.div
          className="glass rounded-2xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-xs font-semibold text-muted tracking-widest uppercase mb-2">
            {results.metric}
          </div>
          <div className="flex items-center justify-center gap-4">
            <motion.div
              className={`text-6xl sm:text-7xl font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
            >
              {isPositive ? "+" : ""}
              {demandCount.toFixed(1)}%
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {isPositive ? (
                <ArrowUp size={40} className="text-green-400" />
              ) : (
                <ArrowDown size={40} className="text-red-400" />
              )}
            </motion.div>
          </div>
          <div className="text-sm text-muted mt-2">
            30/60/90-day projection • {results.sentiment.bullish}% bullish •{" "}
            {results.sentiment.bearish}% bearish
          </div>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Demand Curve */}
          <motion.div
            className="glass rounded-2xl p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xs font-semibold text-muted tracking-widest uppercase mb-4">
              Demand Projection Curve
            </h3>
            <div className="h-64">
              <Line data={curveData} options={curveOptions} />
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-muted">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-accent" />
                <span>Projected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-accent/10" />
                <span>Confidence Band</span>
              </div>
            </div>
          </motion.div>

          {/* Behavioral Breakdown */}
          <motion.div
            className="glass rounded-2xl p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xs font-semibold text-muted tracking-widest uppercase mb-4">
              Behavioral Breakdown by Persona
            </h3>
            <div className="h-64">
              <Bar data={behavioralData} options={behavioralOptions} />
            </div>
          </motion.div>
        </div>

        {/* Geographic Heatmap */}
        <motion.div
          className="glass rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xs font-semibold text-muted tracking-widest uppercase mb-4">
            Geographic Impact Distribution
          </h3>
          <WorldMap data={results.geoData} />
        </motion.div>

        {/* THE WHY */}
        <motion.div
          className="glass rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-accent" />
            <h3 className="text-xs font-semibold text-accent tracking-widest uppercase">
              The Why — K-On Synthesis
            </h3>
          </div>
          <div className="space-y-3">
            {results.narrative.split(". ").reduce((acc: string[][], sentence, i, arr) => {
              // Group sentences into paragraphs of 2-3
              const lastGroup = acc[acc.length - 1];
              if (lastGroup && lastGroup.length < 2) {
                lastGroup.push(sentence + (i < arr.length - 1 ? "." : ""));
              } else {
                acc.push([sentence + (i < arr.length - 1 ? "." : "")]);
              }
              return acc;
            }, []).map((group, i) => (
              <p key={i} className="text-text-secondary leading-relaxed text-sm">
                {group.join(" ")}
              </p>
            ))}
          </div>
        </motion.div>

        {/* Knowracle Attestation */}
        <motion.div
          className="rounded-2xl p-6 border-2 border-accent/30 bg-accent/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-accent" />
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                Simulation Certified
              </h3>
            </div>
            <div className="flex items-center gap-1 text-green-400 text-xs">
              <CheckCircle2 size={14} />
              <span>Verified on Vanar Network</span>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-muted w-20 flex-shrink-0">Hash</span>
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <span className="font-mono text-text-secondary text-xs break-all">
                  {results.attestation.hash}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(results.attestation.hash);
                    setHashCopied(true);
                    setTimeout(() => setHashCopied(false), 2000);
                  }}
                  className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                  title="Copy hash"
                >
                  {hashCopied ? (
                    <Check size={14} className="text-green-400" />
                  ) : (
                    <Copy size={14} className="text-muted hover:text-white" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted w-20 flex-shrink-0">Time</span>
              <span className="text-text-secondary">
                {results.attestation.timestamp}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted w-20 flex-shrink-0">Block</span>
              <span className="text-text-secondary font-mono">
                #{results.attestation.blockHeight}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 pb-12">
          <button className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white py-3 px-6 rounded-xl font-medium transition-colors cursor-pointer">
            <Download size={16} />
            Download PDF Report
          </button>
          <button className="flex items-center gap-2 bg-surface hover:bg-surface-alt text-white py-3 px-6 rounded-xl font-medium border border-border transition-colors cursor-pointer">
            <Code2 size={16} />
            Get API Access
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 bg-surface hover:bg-surface-alt text-white py-3 px-6 rounded-xl font-medium border border-border transition-colors cursor-pointer"
          >
            <RotateCcw size={16} />
            Run a Variant
          </button>
        </div>
      </div>
    </div>
  );
}
