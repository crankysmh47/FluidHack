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
    <div className="w-full h-full flex items-center px-12 relative overflow-hidden bg-black/60 backdrop-blur-xl border-b border-white/5">
      {/* Background execution pulse */}
      {isExecuting && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal/10 to-transparent animate-pulse pointer-events-none" />
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
                  isPast ? 'bg-teal border-teal shadow-[0_0_20px_rgba(0,255,204,0.8)]' 
                  : isActive ? 'bg-teal/20 border-teal shadow-[0_0_30px_rgba(0,255,204,0.6)]' 
                  : 'bg-white/5 border-white/10'
                }`}>
                  <Icon className={`w-5 h-5 transition-colors duration-300 ${
                    isPast ? 'text-black' : isActive ? 'text-teal' : 'text-gray-600'
                  }`} />
                  
                  {isPast && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-white rounded-full p-0.5"
                    >
                      <div className="w-2.5 h-2.5 bg-teal rounded-full" />
                    </motion.div>
                  )}
                </div>

                <div className="flex flex-col">
                  <span className={`font-mono text-[9px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                    isPast || isActive ? 'text-white' : 'text-gray-600'
                  }`}>
                    Step 0{index + 1}
                  </span>
                  <span className={`font-mono text-[10px] font-bold tracking-widest whitespace-nowrap transition-colors duration-300 ${
                    isPast ? 'text-teal' : isActive ? 'text-white' : 'text-gray-700'
                  }`}>
                    {node}
                  </span>
                </div>
              </div>

              {/* Connecting Line (Horizontal) */}
              {index !== NODES.length - 1 && (
                <div className="flex-1 mx-6 relative flex items-center">
                  <div className={`w-full h-[1px] transition-colors duration-500 rounded-full ${
                    isPast ? 'bg-teal shadow-[0_0_10px_rgba(0,255,204,0.5)]' : 'bg-gray-800'
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
