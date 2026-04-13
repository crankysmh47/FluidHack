// src/components/flow/TransactionFlow.tsx
import React from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';

const NODES = [
  "Verify Preimage",
  "Base Vault",
  "Bridge",
  "Polygon Swap",
  "Retire Credit"
];

export const TransactionFlow: React.FC = () => {
  const transactionStep = useCarbonStore(state => state.transactionStep);
  const isExecuting = useCarbonStore(state => state.isExecuting);

  return (
    <div className="w-full h-full flex items-center px-8 relative overflow-hidden">
      {/* Background execution pulse */}
      {isExecuting && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/10 to-transparent animate-pulse pointer-events-none" />
      )}

      <div className="flex items-center justify-between w-full max-w-7xl mx-auto z-10">
        {NODES.map((node, index) => {
          const isActive = transactionStep === index;
          const isPast = transactionStep > index || transactionStep === 5;

          return (
            <React.Fragment key={node}>
              {/* Node Item */}
              <div className="flex flex-col items-center gap-2 relative w-32 shrink-0">
                <div className="relative z-10 bg-background rounded-full">
                  {isPast ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle className="text-neon-green w-7 h-7 drop-shadow-[0_0_10px_rgba(0,255,204,0.8)]" />
                    </motion.div>
                  ) : isActive ? (
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }} 
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <Circle className="text-neon-yellow w-7 h-7 fill-neon-yellow/20 drop-shadow-[0_0_10px_rgba(255,204,0,0.8)]" />
                    </motion.div>
                  ) : (
                    <Circle className="text-gray-600 w-7 h-7" />
                  )}
                </div>

                <span className={`font-mono text-xs text-center tracking-wider transition-colors duration-300 absolute -bottom-6 w-[120%] ${
                  isPast ? 'text-gray-300' : isActive ? 'text-neon-yellow font-bold drop-shadow-[0_0_5px_rgba(255,204,0,0.8)]' : 'text-gray-600'
                }`}>
                  {node}
                </span>
              </div>

              {/* Connecting Line (Horizontal) */}
              {index !== NODES.length - 1 && (
                <div className="flex-1 mx-2 relative flex items-center">
                  <div className={`w-full h-[2px] transition-colors duration-500 rounded-full ${
                    isPast ? 'bg-neon-green shadow-[0_0_8px_rgba(0,255,204,0.6)]' : 'bg-gray-800'
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
