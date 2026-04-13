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
      className={`relative group overflow-hidden px-16 py-6 rounded-full font-black tracking-[0.3em] uppercase transition-all duration-500 flex items-center gap-4 ${
        isExecuting 
          ? 'bg-gray-900/80 backdrop-blur-xl text-neon-cyan/50 cursor-not-allowed border border-neon-cyan/20 shadow-[0_0_30px_rgba(0,204,255,0.1)]' 
          : 'bg-gradient-to-r from-neon-green/20 to-neon-cyan/20 backdrop-blur-xl text-white border border-neon-cyan shadow-[0_0_40px_rgba(0,204,255,0.4)] hover:shadow-[0_0_80px_rgba(0,255,204,0.8)]'
      }`}
    >
      {/* Dynamic Icon */}
      {isExecuting ? (
        <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
      ) : (
        <Zap className="w-6 h-6 text-neon-green drop-shadow-[0_0_10px_rgba(0,255,204,1)]" />
      )}
      
      <span className={!isExecuting ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" : ""}>
        {isExecuting ? 'Executing Sequence...' : 'Force Offset Execution'}
      </span>
      
      {/* Radar/Ripple background effect */}
      {!isExecuting && (
        <>
          <span className="absolute inset-0 rounded-full border border-neon-green/50 animate-ping opacity-20" />
          <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
        </>
      )}
    </motion.button>
  );
};
