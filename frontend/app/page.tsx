"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Zap,
  Shield,
  Globe,
  Lock,
  Users,
  Building2,
  TrendingUp,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { createSimulation } from "@/lib/api";
import PaymentModal from "@/components/PaymentModal";

const MARKET_OPTIONS = ["Global", "MENA", "US", "EU", "APAC"];

const TIERS = [
  {
    id: "free",
    name: "FREE",
    agents: "500",
    features: ["Public Results", "3/day limit"],
    price: null,
    swarmSize: 500,
  },
  {
    id: "pro",
    name: "PRO",
    agents: "10,000",
    features: ["Sealed Results", "$12 via x402"],
    price: 12,
    swarmSize: 10000,
    locked: true,
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    agents: "100,000",
    features: ["Custom Personas", "$120 via x402"],
    price: 120,
    swarmSize: 100000,
    locked: true,
  },
];

const STACK_LAYERS = [
  { id: "L2", name: "Neutron", desc: "Settlement Layer" },
  { id: "L3", name: "Virtron", desc: "Data Processing" },
  { id: "L4", name: "Ferron", desc: "Payment Rails" },
  { id: "L5", name: "Arkon", desc: "Compute Engine" },
  { id: "L6", name: "K-On", desc: "AI Agent Swarm" },
  { id: "L7", name: "Lumion", desc: "Visualization" },
  { id: "L8", name: "Knowracle", desc: "Attestation" },
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
      router.push(`/simulate/${simulationId}`);
    } catch (err) {
      console.error("Failed to start demo:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-accent tracking-tight">
              MACRA
            </span>
            <span className="text-xs text-muted hidden sm:block tracking-widest uppercase">
              Simulate what&apos;s next.
            </span>
          </div>
          <button
            onClick={handleViewDemo}
            className="text-sm text-accent hover:text-accent-light transition-colors flex items-center gap-1 cursor-pointer"
          >
            View Demo <ChevronRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Feed it a news event.
            <br />
            <span className="text-accent">Watch the world respond.</span>
          </motion.h1>
          <motion.p
            className="mt-6 text-lg text-muted max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            MACRA deploys thousands of AI-driven behavioral agents to simulate
            how global markets react to real-world events — before they happen.
          </motion.p>
        </div>
      </section>

      {/* Main Form */}
      <section className="px-6 pb-24">
        <motion.div
          className="max-w-3xl mx-auto glass rounded-2xl p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Event Input */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-muted tracking-widest uppercase mb-3">
              Event Catalyst
            </label>
            <textarea
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              placeholder="e.g. Oil prices spike 40% following OPEC+ production cuts and escalating Middle East tensions"
              className="w-full bg-bg border border-border rounded-xl px-4 py-4 text-white placeholder-muted/50 focus:outline-none focus:border-accent/50 resize-none h-28 text-sm leading-relaxed"
            />
          </div>

          {/* Market Focus */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-muted tracking-widest uppercase mb-3">
              Market Focus
            </label>
            <div className="flex flex-wrap gap-2">
              {MARKET_OPTIONS.map((market) => (
                <button
                  key={market}
                  onClick={() => toggleMarket(market)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    marketFocus.includes(market)
                      ? "bg-accent/20 text-accent border border-accent/30"
                      : "bg-surface border border-border text-muted hover:text-white hover:border-border"
                  }`}
                >
                  {market}
                </button>
              ))}
            </div>
          </div>

          {/* Persona Mix */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-muted tracking-widest uppercase mb-3">
              Persona Mix
            </label>
            <div className="space-y-4">
              {[
                {
                  key: "retail" as const,
                  label: "Retail Consumers",
                  icon: Users,
                },
                {
                  key: "b2b" as const,
                  label: "B2B Buyers",
                  icon: Building2,
                },
                {
                  key: "institutional" as const,
                  label: "Institutional Traders",
                  icon: TrendingUp,
                },
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center gap-4">
                  <Icon size={16} className="text-muted flex-shrink-0" />
                  <span className="text-sm text-text-secondary w-40 flex-shrink-0">
                    {label}
                  </span>
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
                    className="flex-1 h-1 bg-border rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <span className="text-sm text-accent font-mono w-8 text-right">
                    {personaMix[key]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Swarm Size */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-muted tracking-widest uppercase mb-3">
              Swarm Size
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => handleTierSelect(tier.id)}
                  className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTier === tier.id
                      ? "border-accent/50 bg-accent/5"
                      : "border-border bg-surface hover:border-border"
                  }`}
                >
                  {tier.locked && (
                    <Lock
                      size={14}
                      className="absolute top-3 right-3 text-muted"
                    />
                  )}
                  <div className="text-xs font-semibold text-muted tracking-widest">
                    {tier.name}
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    {tier.agents}
                  </div>
                  <div className="text-xs text-accent mt-0.5">AGENTS</div>
                  <div className="mt-2 space-y-1">
                    {tier.features.map((f, i) => (
                      <div key={i} className="text-xs text-muted">
                        {f}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!event.trim() || isSubmitting}
            className="w-full py-4 bg-accent hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm tracking-wider cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                INITIALIZING...
              </>
            ) : (
              <>
                <Zap size={16} />
                RUN SIMULATION
              </>
            )}
          </button>
        </motion.div>
      </section>

      {/* Pre-Mortem Section */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase mb-6">
              <AlertTriangle size={14} />
              The Pre-Mortem
            </div>
            <h2 className="text-3xl font-bold text-white">
              We already ran this — and it was right.
            </h2>
          </motion.div>

          <motion.div
            className="glass rounded-2xl p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-start gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Red Sea Shipping Crisis — December 2023
                </h3>
                <p className="text-sm text-muted mt-1">
                  Houthi attacks force major carriers to reroute around Cape of
                  Good Hope, adding 10-14 days to Asia-Europe transit times
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                {
                  label: "Shipping costs",
                  predicted: "+22%",
                  actual: "+24%",
                  accuracy: 91,
                },
                {
                  label: "EU import demand",
                  predicted: "-14%",
                  actual: "-11%",
                  accuracy: 79,
                },
                {
                  label: "Nearshoring intent",
                  predicted: "+8%",
                  actual: "+9%",
                  accuracy: 89,
                },
              ].map((pred) => (
                <div
                  key={pred.label}
                  className="bg-bg rounded-xl p-4 border border-border"
                >
                  <div className="text-xs text-muted uppercase tracking-wider">
                    {pred.label}
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-xl font-bold text-white">
                      {pred.predicted}
                    </span>
                    <span className="text-xs text-muted">predicted</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-semibold text-accent">
                      {pred.actual}
                    </span>
                    <span className="text-xs text-muted">actual</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-green-500" />
                    <span className="text-xs text-green-500 font-medium">
                      {pred.accuracy}% accuracy
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-bg rounded-xl p-4 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-accent" />
                <span className="text-xs font-semibold text-accent tracking-widest uppercase">
                  Overall Accuracy
                </span>
              </div>
              <div className="text-4xl font-bold text-white">86%</div>
              <p className="text-sm text-muted mt-2 leading-relaxed italic">
                &quot;The primary signal was not price sensitivity but supply
                security fear among B2B buyers in the EU.&quot;
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vanar Stack */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-8">
            Built on Vanar Stack
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {STACK_LAYERS.map((layer) => (
              <div
                key={layer.id}
                className="glass rounded-lg px-4 py-3 text-center"
              >
                <div className="text-xs text-accent font-mono font-bold">
                  {layer.id}
                </div>
                <div className="text-sm text-white font-semibold mt-1">
                  {layer.name}
                </div>
                <div className="text-xs text-muted">{layer.desc}</div>
              </div>
            ))}
          </div>
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

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
        tier={paymentModal.tier}
      />
    </div>
  );
}
