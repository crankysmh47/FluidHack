// src/components/flow/TransactionFlow.tsx
import React from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { motion } from 'framer-motion';
import { Network, CheckCircle, Circle } from 'lucide-react';

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
    <div className="bg-panel backdrop-blur-md rounded-2xl border border-white/10 p-6 h-full flex flex-col relative overflow-hidden">
      {/* Background glow when executing */}
      {isExecuting && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-green to-transparent opacity-50 animate-pulse" />
      )}

      <div className="flex items-center gap-2 mb-8">
        <Network className="text-neon-green w-5 h-5" />
        <h2 className="text-neon-green font-semibold tracking-widest uppercase text-sm">Execution Engine</h2>
      </div>

      <div className="flex flex-col flex-grow justify-center pl-4">
        {NODES.map((node, index) => {
          const isActive = transactionStep === index;
          const isPast = transactionStep > index || transactionStep === 5; // 5 means complete

          return (
            <div key={node} className="relative flex items-center mb-10 last:mb-0">
              {/* Connecting Line */}
              {index !== NODES.length - 1 && (
                <div 
                  className={`absolute left-[11px] top-[24px] w-[2px] h-[40px] transition-colors duration-500 ${
                    isPast ? 'bg-neon-green' : 'bg-gray-800'
                  }`}
                />
              )}

              {/* Node Icon */}
              <div className="relative z-10 mr-4">
                {isPast ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle className="text-neon-green w-6 h-6 bg-[#05050f] rounded-full" />
                  </motion.div>
                ) : isActive ? (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Circle className="text-neon-yellow w-6 h-6 fill-neon-yellow/20" />
                  </motion.div>
                ) : (
                  <Circle className="text-gray-700 w-6 h-6" />
                )}
              </div>

              {/* Node Label */}
              <span className={`font-mono text-sm tracking-wide transition-colors duration-300 ${
                isPast ? 'text-white' : isActive ? 'text-neon-yellow font-bold drop-shadow-[0_0_8px_rgba(255,204,0,0.8)]' : 'text-gray-600'
              }`}>
                {node}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
