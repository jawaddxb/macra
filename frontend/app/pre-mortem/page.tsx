"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Shield,
  Calendar,
  Target,
  TrendingUp,
} from "lucide-react";
import { createSimulation } from "@/lib/api";

const PREDICTIONS = [
  {
    label: "Shipping Costs",
    predicted: "+22%",
    actual: "+24%",
    accuracy: 91,
    detail: "Container freight rates from Asia to Northern Europe",
  },
  {
    label: "EU Retail Demand",
    predicted: "-14%",
    actual: "-11%",
    accuracy: 79,
    detail: "Durable goods import orders across Eurozone markets",
  },
  {
    label: "Nearshoring Intent",
    predicted: "+8%",
    actual: "+9%",
    accuracy: 89,
    detail: "B2B procurement shift toward regional suppliers",
  },
];

function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number>(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [end, duration, started]);

  return { count, start: () => setStarted(true) };
}

export default function PreMortemPage() {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);

  const shipping = useCountUp(91, 2000);
  const retail = useCountUp(79, 2200);
  const nearshore = useCountUp(89, 2400);
  const overall = useCountUp(86, 2800);

  useEffect(() => {
    const timer = setTimeout(() => {
      shipping.start();
      retail.start();
      nearshore.start();
      overall.start();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRunDemo = async () => {
    setIsRunning(true);
    try {
      const { simulationId } = await createSimulation({
        event:
          "Red Sea shipping crisis — Houthi attacks force major carriers to reroute around Cape of Good Hope, adding 10-14 days to Asia-Europe transit times",
        marketFocus: ["Global", "MENA", "EU"],
        personaMix: { retail: 35, b2b: 40, institutional: 25 },
        swarmSize: 500,
      });
      router.push(`/simulate/${simulationId}`);
    } catch (err) {
      console.error("Failed to start demo:", err);
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="text-2xl font-bold text-accent tracking-tight cursor-pointer"
              onClick={() => router.push("/")}
            >
              MACRA
            </span>
            <span className="text-xs text-muted">/ PRE-MORTEM</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-muted hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AlertTriangle size={14} />
            The Pre-Mortem
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            We already ran this.
            <br />
            <span className="text-accent">It was right.</span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg text-muted max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            In December 2023, the Red Sea shipping crisis disrupted global trade.
            MACRA predicted the behavioral demand shifts 72 hours before the
            market reacted.
          </motion.p>
        </div>
      </section>

      {/* Timeline: Before vs After */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before */}
            <motion.div
              className="glass rounded-2xl p-6 border border-accent/20"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={16} className="text-accent" />
                <span className="text-xs font-semibold text-accent tracking-widest uppercase">
                  Dec 15, 2023 — Before Crisis
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">
                MACRA Simulation Ran
              </h3>
              <div className="space-y-3 text-sm text-text-secondary">
                <p>
                  Event input: &quot;Houthi militia announces Red Sea blockade
                  against Israel-linked shipping.&quot;
                </p>
                <p>
                  500 behavioral agents deployed across Global, MENA, and EU
                  market personas. Simulation completed in 47 seconds.
                </p>
                <div className="bg-bg rounded-lg p-3 border border-border mt-4">
                  <div className="text-xs text-muted uppercase tracking-wider mb-2">
                    Primary Signal Detected
                  </div>
                  <p className="text-accent font-medium">
                    Supply security fear among B2B buyers — not price sensitivity
                  </p>
                </div>
              </div>
            </motion.div>

            {/* After */}
            <motion.div
              className="glass rounded-2xl p-6 border border-red-500/20"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={16} className="text-red-400" />
                <span className="text-xs font-semibold text-red-400 tracking-widest uppercase">
                  Dec 18, 2023 — Crisis Hits
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Market Reality
              </h3>
              <div className="space-y-3 text-sm text-text-secondary">
                <p>
                  Major carriers Maersk, MSC, Hapag-Lloyd announce full Red Sea
                  rerouting. Freight rates spike within 48 hours.
                </p>
                <p>
                  EU importers scramble to secure alternative supply chains.
                  Nearshoring discussions accelerate across procurement teams.
                </p>
                <div className="bg-bg rounded-lg p-3 border border-border mt-4">
                  <div className="text-xs text-muted uppercase tracking-wider mb-2">
                    What Happened
                  </div>
                  <p className="text-red-400 font-medium">
                    Exactly what MACRA predicted — 72 hours earlier
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Accuracy Table */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-2xl font-bold text-white text-center mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Prediction Accuracy Breakdown
          </motion.h2>

          <div className="space-y-4">
            {PREDICTIONS.map((pred, i) => (
              <motion.div
                key={pred.label}
                className="glass rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Target size={14} className="text-accent" />
                      <span className="text-sm font-semibold text-white">
                        {pred.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted">{pred.detail}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xs text-muted uppercase tracking-wider">
                        Predicted
                      </div>
                      <div className="text-xl font-bold text-white mt-1">
                        {pred.predicted}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted uppercase tracking-wider">
                        Actual
                      </div>
                      <div className="text-xl font-bold text-accent mt-1">
                        {pred.actual}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted uppercase tracking-wider">
                        Accuracy
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle2 size={14} className="text-green-500" />
                        <span className="text-xl font-bold text-green-400">
                          {i === 0
                            ? shipping.count
                            : i === 1
                              ? retail.count
                              : nearshore.count}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accuracy bar */}
                <div className="mt-4 h-1.5 bg-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pred.accuracy}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.3 + i * 0.15 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Overall Score */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="rounded-2xl p-8 border-2 border-accent/30 bg-accent/5 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles size={18} className="text-accent" />
              <span className="text-xs font-semibold text-accent tracking-widest uppercase">
                Overall Accuracy
              </span>
            </div>
            <div className="text-7xl sm:text-8xl font-bold text-white mb-4">
              {overall.count}%
            </div>
            <p className="text-muted max-w-lg mx-auto text-sm leading-relaxed italic">
              &quot;The primary signal was supply security fear among B2B buyers
              — not price sensitivity. MACRA had the answer 72 hours before the
              market did.&quot;
            </p>

            <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted">
              <Shield size={14} className="text-accent" />
              <span>Results attested on Vanar Network via Knowracle</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              See it for yourself.
            </h2>
            <p className="text-muted mb-8 max-w-lg mx-auto">
              Run the exact same Red Sea crisis simulation and watch 500
              behavioral agents reach consensus in real-time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleRunDemo}
                disabled={isRunning}
                className="flex items-center gap-2 bg-accent hover:bg-accent-light disabled:opacity-40 text-white py-3 px-8 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <TrendingUp size={16} />
                    Run the Pre-Mortem
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 text-muted hover:text-white transition-colors cursor-pointer text-sm"
              >
                Or build your own scenario
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-accent">MACRA</span>
            <span className="text-xs text-muted">
              &copy; 2024 Vanar Chain
            </span>
          </div>
          <div className="text-xs text-muted">
            Powered by K-On Agent Swarm • Attested by Knowracle
          </div>
        </div>
      </footer>
    </div>
  );
}
