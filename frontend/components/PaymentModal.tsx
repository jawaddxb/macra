"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, CreditCard, Wallet } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: "pro" | "enterprise";
}

export default function PaymentModal({ isOpen, onClose, tier }: PaymentModalProps) {
  const price = tier === "pro" ? 12 : 120;
  const agents = tier === "pro" ? "10,000" : "100,000";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="glass rounded-2xl p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                UNLOCK {tier.toUpperCase()} SIMULATION
              </h2>
              <button
                onClick={onClose}
                className="text-muted hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="glass rounded-xl p-4 mb-6">
              <div className="text-sm text-muted mb-1">{agents} AGENTS</div>
              <div className="text-3xl font-bold text-white">${price} <span className="text-sm font-normal text-muted">USDC</span></div>
              <div className="text-xs text-accent mt-1">via x402 protocol</div>
            </div>

            <div className="space-y-3 mb-6">
              <button className="w-full flex items-center justify-center gap-3 bg-accent hover:bg-accent-light text-white py-3 px-4 rounded-xl font-medium transition-colors cursor-pointer">
                <Wallet size={18} />
                Connect Wallet
              </button>
              <div className="flex items-center gap-3 text-muted text-sm">
                <div className="flex-1 h-px bg-border" />
                <span>or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <button className="w-full flex items-center justify-center gap-3 bg-surface-alt hover:bg-surface text-white py-3 px-4 rounded-xl font-medium border border-border transition-colors cursor-pointer">
                <CreditCard size={18} />
                Pay with card
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted">
              <Lock size={12} />
              <span>Powered by Ferron x402 — Encrypted & Sealed</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
