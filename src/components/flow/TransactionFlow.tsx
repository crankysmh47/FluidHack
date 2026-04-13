// src/components/flow/TransactionFlow.tsx
import React from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { motion } from 'framer-motion';
import { Key, Vault, Link, Waypoints, Leaf, FileText } from 'lucide-react';

const NODES = [
  "Verify Preimage",
  "Base Vault",
  "Bridge",
  "Polygon Swap",
  "Retire Credit"
];

const ICONS = [
  Key,
  Vault,
  Link,
  Waypoints,
  ({ className }: { className?: string }) => (
    <div className="relative">
      <Leaf className={className} />
      <FileText className={`${className} absolute -top-1 -right-1 w-3 h-3 opacity-80`} />
    </div>
  )
];

export const TransactionFlow: React.FC = () => {
  const transactionStep = useCarbonStore(state => state.transactionStep);
  const isExecuting = useCarbonStore(state => state.isExecuting);

  return (
    <div className="w-full h-full flex items-center px-12 relative overflow-hidden bg-[#0A1410]/90 backdrop-blur-xl border-b border-emerald-900/40">
      {/* Background execution pulse */}
      {isExecuting && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent animate-pulse pointer-events-none" />
      )}

      <div className="flex items-center justify-between w-full max-w-7xl mx-auto z-10">
        {NODES.map((node, index) => {
          const isActive = transactionStep === index;
          const isPast = transactionStep > index || transactionStep === 5;
          const Icon = ICONS[index];

          return (
            <React.Fragment key={node}>
              {/* Node Item */}
              <div className="flex items-center gap-4 relative shrink-0">
                <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-500 ${
                  isPast ? 'bg-emerald-800/10 border-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                  : isActive ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.6)]' 
                  : 'bg-white/5 border-white/10'
                }`}>
                  <Icon className={`w-5 h-5 transition-colors duration-300 ${
                    isPast ? 'text-emerald-700' : isActive ? 'text-emerald-400' : 'text-emerald-900/40'
                  }`} />
                  
                  {isPast && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-emerald-900 rounded-full p-0.5 border border-emerald-500"
                    >
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                    </motion.div>
                  )}
                </div>

                <div className="flex flex-col">
                  <span className={`font-mono text-[9px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                    isPast ? 'text-emerald-700/60' : isActive ? 'text-emerald-400' : 'text-emerald-900/40'
                  }`}>
                    Step 0{index + 1}
                  </span>
                  <span className={`font-mono text-[10px] font-bold tracking-widest whitespace-nowrap transition-colors duration-300 ${
                    isPast ? 'text-emerald-700' : isActive ? 'text-white drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'text-emerald-900/40'
                  }`}>
                    {node}
                  </span>
                </div>
              </div>

              {/* Connecting Line (Horizontal) */}
              {index !== NODES.length - 1 && (
                <div className="flex-1 mx-6 relative flex items-center">
                  <div className={`w-full h-[1px] transition-colors duration-500 rounded-full ${
                    isPast ? 'bg-emerald-700 shadow-[0_0_5px_rgba(16,185,129,0.2)]' : 'bg-emerald-900/20'
                  }`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
