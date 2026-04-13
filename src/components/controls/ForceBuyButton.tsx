// src/components/controls/ForceBuyButton.tsx
import React from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { motion } from 'framer-motion';
import { Zap, Loader2 } from 'lucide-react';

export const ForceBuyButton: React.FC = () => {
  const { executeTransaction, isExecuting } = useCarbonStore();

  return (
    <motion.button
      whileHover={{ scale: isExecuting ? 1 : 1.05 }}
      whileTap={{ scale: isExecuting ? 1 : 0.95 }}
      onClick={executeTransaction}
      disabled={isExecuting}
      className={`relative group overflow-hidden px-14 py-5 rounded-xl font-black tracking-[0.2em] uppercase transition-all duration-500 flex items-center gap-4 ${
        isExecuting 
          ? 'bg-gray-900/80 text-teal/40 cursor-not-allowed border border-teal/20' 
          : 'bg-[#00ffcc] text-black border-2 border-white/30 shadow-[0_0_50px_rgba(0,255,204,0.6)] hover:shadow-[0_0_100px_rgba(0,255,204,1)]'
      }`}
    >
      <div className="relative z-10 flex items-center gap-4">
        {isExecuting ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <Zap className="w-6 h-6 fill-current" strokeWidth={3} />
        )}
        <span className="text-sm font-black">
          {isExecuting ? 'Executing Sequence...' : 'Force Offset Execution / Confirm and Execute'}
        </span>
      </div>
      
      {/* High-Intensity Shine */}
      {!isExecuting && (
        <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 group-hover:animate-shine" />
      )}
    </motion.button>
  );
};
