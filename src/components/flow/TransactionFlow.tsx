// src/components/flow/TransactionFlow.tsx
import React, { useMemo } from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Vault, Link, Waypoints, Leaf, FileText, Cpu, ShieldCheck } from 'lucide-react';
import { MaskedText } from '../layout/MaskedText';

const NODES = [
  "Verify Preimage",
  "Base Vault",
  "Bridge",
  "Nodal Swap",
  "Credit Retirement"
];

const ICONS = [
  Key,
  Cpu,
  Link,
  ShieldCheck,
  ({ className }: { className?: string }) => (
    <div className="relative">
      <Leaf className={className} />
      <FileText className={`${className} absolute -top-1 -right-1 w-3 h-3 opacity-60`} />
    </div>
  )
];

export const TransactionFlow: React.FC = () => {
  const transactionStep = useCarbonStore(state => state.transactionStep);
  const isExecuting = useCarbonStore(state => state.isExecuting);

  return (
    <div className="w-full h-full flex items-center px-10 relative overflow-hidden bg-[#0A1410]/95 backdrop-blur-2xl border border-emerald-900/30 rounded-2xl shadow-2xl">
      {/* 🧬 Liquid Energy Conduit (Background) */}
      <div className="absolute inset-0 z-0 opacity-20">
         <div className="absolute top-1/2 left-0 w-full h-[1px] bg-emerald-950" />
         {isExecuting && (
            <motion.div 
               animate={{ x: ["-100%", "200%"] }}
               transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
               className="absolute top-1/2 left-0 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent blur-sm"
            />
         )}
      </div>

      <div className="flex items-center justify-between w-full max-w-7xl mx-auto z-10 relative">
        {NODES.map((node, index) => {
          const isActive = transactionStep === index;
          const isPast = transactionStep > index || transactionStep === 5;
          const Icon = ICONS[index];

          return (
            <React.Fragment key={node}>
              {/* Node Item */}
              <div className="flex items-center gap-5 relative shrink-0">
                {/* Tactical Diagnostic Rings */}
                {isActive && (
                    <div className="absolute inset-0 z-0 flex items-center justify-center -left-6 scale-125">
                        <motion.div 
                            animate={{ rotate: 360, opacity: [0.1, 0.3, 0.1] }}
                            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                            className="absolute w-24 h-24 border border-emerald-500/30 rounded-full border-dashed"
                        />
                        <motion.div 
                            animate={{ rotate: -360, opacity: [0.05, 0.2, 0.05] }}
                            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                            className="absolute w-28 h-28 border border-emerald-400/20 rounded-full border-dotted"
                        />
                    </div>
                )}

                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className={`relative z-10 flex items-center justify-center w-14 h-14 rounded-xl border transition-all duration-700 ${
                  isPast ? 'bg-emerald-950/20 border-emerald-600/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                  : isActive ? 'bg-emerald-500/10 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.4)]' 
                  : 'bg-emerald-950/5 border-emerald-900/10 opacity-30'
                }`}>
                  <Icon className={`w-6 h-6 transition-colors duration-500 ${
                    isPast ? 'text-emerald-700' : isActive ? 'text-emerald-400' : 'text-emerald-950/40'
                  }`} />
                  
                  {isPast && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 bg-emerald-950 rounded-full p-1 border border-emerald-500/60 shadow-lg"
                    >
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                    </motion.div>
                  )}
                </motion.div>

                <div className="flex flex-col gap-0.5">
                  <MaskedText 
                    text={`0${index + 1}`} 
                    className={`font-mono text-[9px] font-black uppercase tracking-[0.4em] ${
                        isPast ? 'text-emerald-800' : isActive ? 'text-emerald-500' : 'text-emerald-950'
                    }`}
                  />
                  <span className={`font-mono text-[10px] font-bold tracking-[0.15em] whitespace-nowrap uppercase transition-all duration-300 ${
                    isPast ? 'text-emerald-700/60' : isActive ? 'text-white text-glow-emerald' : 'text-emerald-950/20'
                  }`}>
                    {node}
                  </span>
                </div>
              </div>

              {/* Connecting Conduit (Liquid Energy) */}
              {index !== NODES.length - 1 && (
                <div className="flex-1 mx-8 relative h-[2px] bg-emerald-950/30 overflow-hidden rounded-full">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: isPast ? "100%" : "0%" }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="h-full bg-emerald-600/40 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  />
                  
                  {/* High-Velocity Liquid Pulse */}
                  {index === transactionStep - 1 && (
                      <motion.div 
                        initial={{ left: "-50%" }}
                        animate={{ left: "150%" }}
                        transition={{ duration: 0.8, ease: "circInOut" }}
                        className="absolute w-1/2 h-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent z-20"
                      />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
