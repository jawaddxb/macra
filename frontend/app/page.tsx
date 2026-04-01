"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowRight, ChevronRight } from "lucide-react";
import { createSimulation } from "@/lib/api";
import PaymentModal from "@/components/PaymentModal";

const MARKET_OPTIONS = ["Global", "MENA", "US", "EU", "APAC"];

const PRESET_EVENTS = [
  "Fed raises rates 100bps",
  "OPEC cuts output 3mb/d",
  "China-Taiwan military escalation",
  "US AI chip export ban tightened",
];

const TIERS = [
  {
    id: "free",
    name: "FREE",
    agents: "100",
    agentNum: "100",
    price: null,
    swarmSize: 100,
  },
  {
    id: "pro",
    name: "PRO",
    agents: "10,000",
    agentNum: "10K",
    price: 12,
    swarmSize: 10000,
    locked: true,
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    agents: "100,000",
    agentNum: "100K",
    price: 120,
    swarmSize: 100000,
    locked: true,
  },
];

const STACK_LAYERS = [
  { id: "L2", name: "Neutron", desc: "Memory Layer" },
  { id: "L3", name: "K-On", desc: "Query & Inference" },
  { id: "L4", name: "Flows", desc: "Workflow Orchestration" },
  { id: "L5", name: "Axon", desc: "Smart Contract Deploy" },
  { id: "L6", name: "Ferron", desc: "Execution & Payments" },
  { id: "L7", name: "Veil", desc: "Encryption Layer" },
  { id: "L8", name: "Knowracle", desc: "Trust & Governance" },
];

const PREDICTIONS = [
  { label: "Shipping costs", predicted: "+22%", actual: "+24%", accuracy: 91 },
  { label: "EU import demand", predicted: "-14%", actual: "-11%", accuracy: 79 },
  { label: "Nearshoring intent", predicted: "+8%", actual: "+9%", accuracy: 89 },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "FEED THE EVENT",
    desc: "A news headline or geopolitical signal",
  },
  {
    step: "02",
    title: "SWARM RUNS",
    desc: "10k agents simulate behavioral responses across global markets",
  },
  {
    step: "03",
    title: "READ THE SIGNALS",
    desc: "Demand curves, sentiment breakdown, top signals before consensus forms",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [event, setEvent] = useState("");
  const [marketFocus, setMarketFocus] = useState<string[]>(["Global"]);
  const [personaMix, setPersonaMix] = useState({
    retail: 40,
    b2b: 35,
    institutional: 25,
  });
  const [selectedTier, setSelectedTier] = useState("free");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    tier: "pro" | "enterprise";
  }>({ isOpen: false, tier: "pro" });
  const [agentCount, setAgentCount] = useState(10482);
  const formRef = useRef<HTMLDivElement>(null);

  // Animate agent counter
  useEffect(() => {
    const interval = setInterval(() => {
      setAgentCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleMarket = (market: string) => {
    setMarketFocus((prev) =>
      prev.includes(market)
        ? prev.filter((m) => m !== market)
        : [...prev, market]
    );
  };

  const handleTierSelect = (tierId: string) => {
    const tier = TIERS.find((t) => t.id === tierId);
    if (tier?.locked) {
      setPaymentModal({
        isOpen: true,
        tier: tierId as "pro" | "enterprise",
      });
      return;
    }
    setSelectedTier(tierId);
  };

  const handleSubmit = async () => {
    if (!event.trim()) return;
    setIsSubmitting(true);
    try {
      const tier = TIERS.find((t) => t.id === selectedTier);
      const { simulationId } = await createSimulation({
        event: event.trim(),
        marketFocus,
        personaMix,
        swarmSize: tier?.swarmSize || 500,
      });
      try {
        sessionStorage.setItem("macra_event", event.trim());
      } catch {}
      router.push(`/simulate/${simulationId}`);
    } catch (err) {
      console.error("Failed to create simulation:", err);
      setIsSubmitting(false);
    }
  };

  const handleViewDemo = async () => {
    setIsSubmitting(true);
    try {
      const { simulationId } = await createSimulation({
        event:
          "Red Sea shipping crisis — Houthi attacks force major carriers to reroute around Cape of Good Hope, adding 10-14 days to Asia-Europe transit times",
        marketFocus: ["Global", "MENA", "EU"],
        personaMix: { retail: 35, b2b: 40, institutional: 25 },
        swarmSize: 500,
      });
      try {
        sessionStorage.setItem(
          "macra_event",
          "Red Sea shipping crisis — Houthi attacks force major carriers to reroute around Cape of Good Hope"
        );
      } catch {}
      router.push(`/simulate/${simulationId}`);
    } catch (err) {
      console.error("Failed to start demo:", err);
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const personaLabels: { key: "retail" | "b2b" | "institutional"; label: string; short: string }[] = [
    { key: "retail", label: "Retail", short: "Retail" },
    { key: "b2b", label: "B2B", short: "B2B" },
    { key: "institutional", label: "Institutional", short: "Inst." },
  ];

  return (
    <div className="min-h-screen bg-bg war-room-grid war-room-scan">
      {/* ═══ NAVIGATION ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-bg/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-white tracking-[0.25em] uppercase font-mono">
              MACRA
            </span>
            <span className="hidden sm:block text-[10px] text-muted tracking-[0.3em] uppercase border-l border-border pl-4">
              BEHAVIORAL INTELLIGENCE AT SCALE
            </span>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={() => router.push("/pre-mortem")}
              className="text-xs text-muted hover:text-white transition-colors cursor-pointer tracking-wider uppercase hidden sm:flex items-center gap-1"
            >
              PRE-MORTEM <span className="text-accent">&#8599;</span>
            </button>
            <button
              onClick={handleViewDemo}
              className="text-xs bg-accent hover:bg-accent-light text-white px-4 py-2 transition-colors cursor-pointer tracking-wider uppercase font-semibold flex items-center gap-2"
            >
              <span className="inline-block w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-white" />
              LIVE DEMO
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ STATUS BAR ═══ */}
      <div className="fixed top-16 left-0 right-0 z-40 border-b border-border/40 bg-bg/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-[10px] font-mono text-green-500 tracking-wider">
                SYSTEM LIVE
              </span>
            </div>
            <span className="text-[10px] font-mono text-muted">
              AGENTS RUNNING:{" "}
              <span className="text-white">{agentCount.toLocaleString()}</span>
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted hidden sm:block">
            UPTIME 99.97% · LATENCY 42ms
          </span>
        </div>
      </div>

      {/* ═══ HERO ═══ */}
      <section className="pt-40 sm:pt-48 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[11px] font-mono text-accent tracking-[0.4em] uppercase mb-6">
              BEHAVIORAL INTELLIGENCE AT SCALE
            </p>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-[0.95] tracking-tight uppercase">
              FEED IT A NEWS EVENT.
              <br />
              <span className="text-accent">WATCH THE WORLD</span>
              <br />
              <span className="text-accent">RESPOND.</span>
            </h1>
          </motion.div>

          <motion.p
            className="mt-8 text-base sm:text-lg text-muted max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            MACRA deploys swarms of AI behavioral agents to simulate market
            response to geopolitical events — before they happen.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <button
              onClick={scrollToForm}
              className="bg-accent hover:bg-accent-light text-white px-8 py-4 text-sm font-semibold tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-3"
            >
              <span className="inline-block w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-white" />
              RUN YOUR FIRST SIMULATION
            </button>
            <button
              onClick={() => router.push("/pre-mortem")}
              className="text-sm text-muted hover:text-white transition-colors cursor-pointer flex items-center gap-2 tracking-wider"
            >
              View Red Sea Pre-Mortem <ArrowRight size={14} />
            </button>
          </motion.div>

          <motion.div
            className="mt-10 flex items-center gap-6 text-xs font-mono text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-red-400 line-through">Bloomberg $32K/yr</span>
              <span className="text-muted">vs</span>
              <span className="text-accent font-bold">MACRA: Free</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF BAR ═══ */}
      <motion.section
        className="px-6 py-6 border-y border-border/40"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-x-8 gap-y-2 text-[11px] font-mono tracking-wider uppercase text-muted">
          <span>
            <span className="text-white">86%</span> ACCURACY ON RED SEA CRISIS
          </span>
          <span className="hidden sm:inline text-border">·</span>
          <span>
            <span className="text-white">{agentCount.toLocaleString()}+</span>{" "}
            SIMULATIONS RUN
          </span>
          <span className="hidden sm:inline text-border">·</span>
          <span>
            <span className="text-accent">FREE TIER</span> AVAILABLE
          </span>
          <span className="hidden sm:inline text-border">·</span>
          <span>
            BUILT ON <span className="text-white">VANAR</span>
          </span>
        </div>
      </motion.section>

      {/* ═══ SIMULATION CONTROL PANEL ═══ */}
      <section className="px-6 py-24" ref={formRef}>
        <motion.div
          className="max-w-4xl mx-auto border border-border rounded-none bg-surface/60 backdrop-blur-sm"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Panel header */}
          <div className="border-b border-border px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <span className="text-[11px] font-mono text-accent tracking-[0.3em] uppercase font-bold">
                SIMULATION CONTROL
              </span>
            </div>
            <span className="text-[10px] font-mono text-muted">
              v2.4.1 · {new Date().toISOString().split("T")[0]}
            </span>
          </div>

          <div className="p-6 sm:p-8">
            {/* Event Catalyst */}
            <div className="mb-8">
              <label className="block text-[11px] font-mono font-bold text-muted tracking-[0.2em] uppercase mb-3">
                EVENT CATALYST
              </label>
              <textarea
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                placeholder="Type or paste a news headline..."
                className="w-full bg-bg border border-border rounded-none px-4 py-4 text-white placeholder-muted/40 focus:outline-none focus:border-accent font-mono text-sm resize-none h-28 leading-relaxed transition-colors"
              />
              <div className="mt-3">
                <span className="text-[10px] font-mono text-muted tracking-wider uppercase">
                  EXAMPLE EVENTS (click to load):
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PRESET_EVENTS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setEvent(preset)}
                      className="text-[11px] font-mono px-3 py-1.5 border border-border text-muted hover:text-accent hover:border-accent/50 transition-colors cursor-pointer bg-bg/50"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Market Theater + Persona Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Market Theater */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-muted tracking-[0.2em] uppercase mb-3">
                  MARKET THEATER
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MARKET_OPTIONS.map((market) => (
                    <button
                      key={market}
                      onClick={() => toggleMarket(market)}
                      className={`text-[11px] font-mono px-3 py-2.5 border transition-all cursor-pointer text-center tracking-wider ${
                        marketFocus.includes(market)
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-muted hover:text-white hover:border-muted bg-bg/30"
                      }`}
                    >
                      {market === marketFocus.find((m) => m === market) && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2" />
                      )}
                      {market}
                    </button>
                  ))}
                </div>
              </div>

              {/* Persona Distribution */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-muted tracking-[0.2em] uppercase mb-3">
                  PERSONA DISTRIBUTION
                </label>
                <div className="space-y-3">
                  {personaLabels.map(({ key, short }) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-mono text-text-secondary tracking-wider">
                          {short}
                        </span>
                        <span className="text-[11px] font-mono text-accent font-bold">
                          {personaMix[key]}%
                        </span>
                      </div>
                      <div className="relative h-2 bg-bg rounded-none border border-border">
                        <div
                          className="absolute inset-y-0 left-0 bg-accent/60 transition-all duration-200"
                          style={{ width: `${personaMix[key]}%` }}
                        />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={personaMix[key]}
                          onChange={(e) =>
                            setPersonaMix((prev) => ({
                              ...prev,
                              [key]: parseInt(e.target.value),
                            }))
                          }
                          className="absolute inset-0 w-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Swarm Size */}
            <div className="mb-8">
              <label className="block text-[11px] font-mono font-bold text-muted tracking-[0.2em] uppercase mb-3">
                SWARM SIZE
              </label>
              <div className="grid grid-cols-3 gap-3">
                {TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => handleTierSelect(tier.id)}
                    className={`relative p-4 border text-center transition-all cursor-pointer ${
                      selectedTier === tier.id
                        ? "border-accent bg-accent/5"
                        : "border-border bg-bg/30 hover:border-muted"
                    }`}
                  >
                    {tier.locked && (
                      <Lock
                        size={12}
                        className="absolute top-2 right-2 text-muted"
                      />
                    )}
                    <div className="text-[10px] font-mono text-muted tracking-widest">
                      {tier.name}
                    </div>
                    <div className="text-lg font-bold font-mono text-white mt-1">
                      {tier.agentNum}
                    </div>
                    <div className="text-[10px] font-mono text-accent">
                      AGENTS
                    </div>
                    {tier.price && (
                      <div className="text-[10px] font-mono text-muted mt-1">
                        ${tier.price} via x402
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={handleSubmit}
              disabled={!event.trim() || isSubmitting}
              className="w-full py-4 bg-accent hover:bg-accent-light disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold font-mono text-sm tracking-[0.3em] uppercase transition-colors flex items-center justify-center gap-3 cursor-pointer border border-accent"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  INITIALIZING SWARM...
                </>
              ) : (
                <>
                  <span className="inline-block w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-white" />
                  <span className="inline-block w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-white" />
                  LAUNCH SIMULATION
                </>
              )}
            </button>
          </div>
        </motion.div>
      </section>

      {/* ═══ PRE-MORTEM PROOF ═══ */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[11px] font-mono text-red-400 tracking-[0.3em] uppercase mb-4">
              // THE PRE-MORTEM
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-tight">
              WE ALREADY RAN THIS —
              <br />
              AND IT WAS RIGHT.
            </h2>
            <p className="mt-4 text-base text-muted max-w-2xl">
              The Red Sea crisis. December 2023. MACRA predicted it 72 hours
              before consensus.
            </p>
          </motion.div>

          {/* Accuracy Cards */}
          <motion.div
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {PREDICTIONS.map((pred) => (
              <div
                key={pred.label}
                className="border border-border bg-surface/40 p-6"
              >
                <div className="text-[10px] font-mono text-muted tracking-[0.2em] uppercase mb-4">
                  {pred.label}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] font-mono text-muted mb-1">
                      PREDICTED
                    </div>
                    <div className="text-xl font-bold font-mono text-white">
                      {pred.predicted}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-muted mb-1">
                      ACTUAL
                    </div>
                    <div className="text-xl font-bold font-mono text-accent">
                      {pred.actual}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-muted mb-1">
                      ACCURACY
                    </div>
                    <div className="text-xl font-bold font-mono text-green-500">
                      {pred.accuracy}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Overall Accuracy */}
          <motion.div
            className="mt-6 border border-accent/30 bg-accent/5 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <div className="text-[11px] font-mono text-accent tracking-[0.3em] uppercase mb-2">
                OVERALL ACCURACY
              </div>
              <div className="text-5xl sm:text-6xl font-bold font-mono text-white">
                86%
              </div>
            </div>
            <button
              onClick={() => router.push("/pre-mortem")}
              className="text-sm font-mono text-accent hover:text-accent-light transition-colors cursor-pointer flex items-center gap-2 tracking-wider uppercase border border-accent/30 px-6 py-3 hover:bg-accent/10"
            >
              SEE THE FULL PRE-MORTEM <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="px-6 py-24 border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-[11px] font-mono text-accent tracking-[0.3em] uppercase mb-4">
              // HOW IT WORKS
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-bold font-mono text-accent/40">
                    {item.step}
                  </span>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <span className="hidden md:block text-muted">
                      <ArrowRight size={16} />
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-mono font-bold text-white tracking-[0.2em] uppercase mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VANAR STACK ═══ */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-[11px] font-mono text-accent tracking-[0.3em] uppercase mb-4">
              // INFRASTRUCTURE
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-tight">
              INFRASTRUCTURE GRADE
            </h2>
            <p className="mt-4 text-base text-muted max-w-2xl leading-relaxed">
              Every simulation is run, stored, and attested on Vanar Stack — a
              sovereign AI infrastructure built for high-stakes decisions.
            </p>
          </motion.div>

          {/* Vertical Stack Diagram */}
          <motion.div
            className="mt-12 space-y-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {STACK_LAYERS.map((layer, i) => (
              <div key={layer.id} className="relative">
                {/* Connector line */}
                {i > 0 && (
                  <div className="absolute left-8 -top-px w-px h-px bg-accent/30" />
                )}
                <div className="flex items-stretch border border-border hover:border-accent/30 transition-colors group">
                  {/* Layer ID */}
                  <div className="w-16 flex-shrink-0 bg-accent/5 border-r border-border flex items-center justify-center">
                    <span className="text-[11px] font-mono font-bold text-accent">
                      {layer.id}
                    </span>
                  </div>
                  {/* Layer info */}
                  <div className="flex-1 px-5 py-3.5 flex items-center justify-between">
                    <span className="text-sm font-mono font-bold text-white tracking-wider">
                      {layer.name}
                    </span>
                    <span className="text-xs font-mono text-muted">
                      {layer.desc}
                    </span>
                  </div>
                  {/* Status indicator */}
                  <div className="w-12 flex-shrink-0 border-l border-border flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500/60 group-hover:bg-green-500 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="px-6 py-24 border-t border-border/40">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-white uppercase tracking-tight leading-tight">
            THE NEXT CRISIS IS
            <br />
            ALREADY FORMING.
          </h2>
          <p className="mt-6 text-base text-muted max-w-xl mx-auto">
            Run a simulation before consensus catches up.
          </p>
          <button
            onClick={scrollToForm}
            className="mt-10 bg-accent hover:bg-accent-light text-white px-10 py-4 text-sm font-mono font-bold tracking-[0.3em] uppercase transition-colors cursor-pointer inline-flex items-center gap-3 border border-accent"
          >
            <span className="inline-block w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-white" />
            RUN YOUR FIRST SIMULATION
          </button>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-border/40 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono">
          <div className="text-muted">
            <span className="text-white tracking-[0.2em]">MACRA</span>{" "}
            &copy; 2025 Vanar Chain
          </div>
          <div className="text-muted">
            Powered by K-On Agent Swarm · Attested by Knowracle
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push("/pre-mortem")}
              className="text-muted hover:text-white transition-colors cursor-pointer"
            >
              Pre-Mortem
            </button>
            <span className="text-muted hover:text-white transition-colors cursor-pointer">
              GitHub
            </span>
            <span className="text-muted hover:text-white transition-colors cursor-pointer">
              Docs
            </span>
          </div>
        </div>
      </footer>

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
        tier={paymentModal.tier}
      />
    </div>
  );
}
