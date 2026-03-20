"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Activity, Zap, Signal, Clock, MessageSquare } from "lucide-react";
import ForceGraph from "@/components/ForceGraph";
import { getSimulationStatus, type SimulationStatus } from "@/lib/api";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SimulatePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [status, setStatus] = useState<SimulationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [eta, setEta] = useState<number>(45);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getSimulationStatus(id);
      setStatus(data);

      if (data.progress > 0 && data.total > 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = data.progress / elapsed;
        const remaining = (data.total - data.progress) / rate;
        setEta(Math.max(1, Math.round(remaining)));
      }

      if (data.status === "complete") {
        setTimeout(() => router.push(`/results/${id}`), 1500);
      }
    } catch (err) {
      setError("Failed to fetch simulation status");
    }
  }, [id, router, startTime]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

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

  const progress = status
    ? Math.round((status.progress / Math.max(1, status.total)) * 100)
    : 0;

  const donutData = {
    labels: ["Bullish", "Bearish", "Neutral"],
    datasets: [
      {
        data: [
          status?.sentiment.bullish || 0,
          status?.sentiment.bearish || 0,
          status?.sentiment.neutral || 100,
        ],
        backgroundColor: ["#22c55e", "#ef4444", "#333333"],
        borderColor: ["#22c55e", "#ef4444", "#333333"],
        borderWidth: 0,
        cutout: "75%",
      },
    ],
  };

  const donutOptions = {
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
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <nav className="glass border-b border-border">
        <div className="max-w-full px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="text-xl font-bold text-accent cursor-pointer"
              onClick={() => router.push("/")}
            >
              MACRA
            </span>
            <span className="text-xs text-muted">/ SIMULATION</span>
            <span className="text-xs font-mono text-muted">{id}</span>
          </div>
          <div className="flex items-center gap-2">
            {status?.status === "complete" ? (
              <span className="flex items-center gap-2 text-green-400 text-xs font-semibold">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                COMPLETE
              </span>
            ) : (
              <span className="flex items-center gap-2 text-yellow-400 text-xs font-semibold">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse-glow" />
                SIMULATION RUNNING
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-56px)]">
        {/* Left: Force Graph */}
        <div className="flex-1 lg:w-[65%] p-4 relative">
          <div className="glass rounded-2xl h-full overflow-hidden">
            {status?.agentResults && status.agentResults.length > 0 ? (
              <ForceGraph
                agents={status.agentResults}
                width={900}
                height={650}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
                  <div className="text-muted text-sm">
                    Initializing agent swarm...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Stats Panel */}
        <div className="lg:w-[35%] p-4 lg:pl-0 overflow-y-auto">
          <div className="space-y-4">
            {/* Progress */}
            <motion.div
              className="glass rounded-xl p-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-accent" />
                  <span className="text-xs font-semibold text-muted tracking-widest uppercase">
                    Progress
                  </span>
                </div>
                <span className="text-xs text-muted font-mono">
                  {status?.progress || 0} / {status?.total || 0}
                </span>
              </div>
              <div className="h-2 bg-bg rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-bold text-white">
                  {progress}%
                </span>
                <div className="flex items-center gap-1 text-muted text-xs">
                  <Clock size={12} />
                  <span>
                    ETA: {status?.status === "complete" ? "Done" : `${eta}s`}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Sentiment Donut */}
            <motion.div
              className="glass rounded-xl p-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} className="text-accent" />
                <span className="text-xs font-semibold text-muted tracking-widest uppercase">
                  Sentiment Distribution
                </span>
              </div>
              <div className="h-48 flex items-center justify-center">
                <Doughnut data={donutData} options={donutOptions} />
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {[
                  {
                    label: "Bullish",
                    value: status?.sentiment.bullish || 0,
                    color: "#22c55e",
                  },
                  {
                    label: "Bearish",
                    value: status?.sentiment.bearish || 0,
                    color: "#ef4444",
                  },
                  {
                    label: "Neutral",
                    value: status?.sentiment.neutral || 0,
                    color: "#666",
                  },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div
                      className="text-lg font-bold"
                      style={{ color: item.color }}
                    >
                      {item.value}%
                    </div>
                    <div className="text-xs text-muted">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top Signals */}
            <motion.div
              className="glass rounded-xl p-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Signal size={14} className="text-accent" />
                <span className="text-xs font-semibold text-muted tracking-widest uppercase">
                  Top Signals Detected
                </span>
              </div>
              <div className="space-y-2">
                {(status?.topSignals || []).slice(0, 5).map((signal, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <span className="text-sm text-text-secondary capitalize">
                      {signal.signal}
                    </span>
                    <span className="text-xs font-mono text-accent">
                      {signal.strength}%
                    </span>
                  </div>
                ))}
                {(!status?.topSignals || status.topSignals.length === 0) && (
                  <div className="text-xs text-muted text-center py-4">
                    Analyzing behavioral patterns...
                  </div>
                )}
              </div>
            </motion.div>

            {/* Agent Reasoning Feed */}
            <motion.div
              className="glass rounded-xl p-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={14} className="text-accent" />
                <span className="text-xs font-semibold text-muted tracking-widest uppercase">
                  Agent Reasoning Feed
                </span>
              </div>
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {(() => {
                  const completedAgents = (status?.agentResults || [])
                    .filter((a) => a.response && a.status !== "idle" && a.status !== "thinking")
                    .slice(-8)
                    .reverse();
                  if (completedAgents.length === 0) {
                    return (
                      <div className="text-xs text-muted text-center py-4">
                        Waiting for agent responses...
                      </div>
                    );
                  }
                  return completedAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="bg-bg rounded-lg p-3 border border-border"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded ${
                            agent.type === "retail"
                              ? "bg-blue-500/15 text-blue-400"
                              : agent.type === "b2b"
                                ? "bg-purple-500/15 text-purple-400"
                                : "bg-amber-500/15 text-amber-400"
                          }`}
                        >
                          {agent.type}
                        </span>
                        <span className="text-[10px] text-muted">
                          {agent.region}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        &quot;{agent.response}&quot;
                      </p>
                      <div className="mt-1.5 flex items-center gap-1">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            agent.status === "bullish"
                              ? "bg-green-400"
                              : agent.status === "bearish"
                                ? "bg-red-400"
                                : "bg-gray-500"
                          }`}
                        />
                        <span
                          className={`text-[10px] font-medium ${
                            agent.status === "bullish"
                              ? "text-green-400"
                              : agent.status === "bearish"
                                ? "text-red-400"
                                : "text-gray-500"
                          }`}
                        >
                          {agent.sentiment !== null
                            ? `${agent.sentiment > 0 ? "+" : ""}${(agent.sentiment * 100).toFixed(0)}%`
                            : "—"}
                        </span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
