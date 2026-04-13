// src/components/controls/ForceBuyButton.tsx
import React from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export const ForceBuyButton: React.FC = () => {
  const { executeTransaction, isExecuting } = useCarbonStore();

  return (
    <div className="flex justify-center w-full my-4">
      <motion.button
        whileHover={{ scale: isExecuting ? 1 : 1.05 }}
        whileTap={{ scale: isExecuting ? 1 : 0.95 }}
        onClick={executeTransaction}
        disabled={isExecuting}
        className={`relative group overflow-hidden px-10 py-4 rounded-xl font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-3 ${
          isExecuting 
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
            : 'bg-neon-green/10 text-neon-green border border-neon-green/50 hover:bg-neon-green hover:text-black hover:shadow-[0_0_30px_rgba(0,255,204,0.6)]'
        }`}
      >
        <Zap className={isExecuting ? "text-gray-500" : "text-current"} />
        {isExecuting ? 'Executing Sequence...' : 'Force Offset Execution'}
        
        {/* Shine effect */}
        {!isExecuting && (
          <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
        )}
      </motion.button>
    </div>
  );
};
