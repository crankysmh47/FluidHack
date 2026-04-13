// src/components/controls/ForceBuyButton.tsx
import React from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export const ForceBuyButton: React.FC = () => {
  const { executeTransaction, isExecuting } = useCarbonStore();

  return (
    <motion.button
      whileHover={{ scale: isExecuting ? 1 : 1.05 }}
      whileTap={{ scale: isExecuting ? 1 : 0.95 }}
      onClick={executeTransaction}
      disabled={isExecuting}
      className={`relative group overflow-hidden px-14 py-5 rounded-full font-black tracking-[0.2em] uppercase transition-all duration-300 flex items-center gap-4 shadow-2xl ${
        isExecuting 
          ? 'bg-black/80 backdrop-blur-md text-gray-500 cursor-not-allowed border border-gray-700' 
          : 'bg-black/60 backdrop-blur-xl text-neon-green border border-neon-green hover:bg-neon-green hover:text-black shadow-[0_0_40px_rgba(0,255,204,0.3)] hover:shadow-[0_0_60px_rgba(0,255,204,0.6)]'
      }`}
    >
      <Zap className={`w-6 h-6 ${isExecuting ? "text-gray-500" : "text-current"}`} />
      {isExecuting ? 'Executing Sequence...' : 'Force Offset Execution'}
      
      {/* Cinematic Shine effect */}
      {!isExecuting && (
        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
      )}
    </motion.button>
  );
};
