import React from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { motion } from 'framer-motion';
import { ShieldCheck, Database, Link, Network, Leaf } from 'lucide-react';

const NODES = ["Verify Preimage", "Base Vault", "Bridge", "Polygon Swap", "Retire Credit"];
const ICONS = [ShieldCheck, Database, Link, Network, Leaf];

export const TransactionFlow: React.FC = () => {
  const transactionStep = useCarbonStore(state => state.transactionStep);
  const isExecuting = useCarbonStore(state => state.isExecuting);

  return (
    <div className="w-full h-full flex items-center px-8 relative overflow-hidden bg-black/40 backdrop-blur-md">
      {/* Cinematic Energy Beam (Background) */}
      <motion.div 
        className="absolute top-1/2 -translate-y-1/2 h-[2px] w-[200%] bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent blur-sm z-0"
        animate={{ x: ['-50%', '0%'] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      />

      <div className="flex items-center justify-between w-full max-w-7xl mx-auto z-10 relative">
        {NODES.map((node, index) => {
          const isActive = transactionStep === index;
          const isPast = transactionStep > index || transactionStep === 5;
          const Icon = ICONS[index];

          return (
            <React.Fragment key={node}>
              {/* Node Container */}
              <div className="flex flex-col items-center gap-3 relative w-32 shrink-0">
                {/* Icon Wrapper with Glows */}
                <motion.div 
                  className={`relative z-10 p-3 rounded-xl border backdrop-blur-md transition-all duration-500 ${
                    isPast ? 'bg-neon-green/20 border-neon-green shadow-[0_0_20px_rgba(0,255,204,0.4)]' 
                    : isActive ? 'bg-neon-cyan/20 border-neon-cyan shadow-[0_0_30px_rgba(0,204,255,0.6)]' 
                    : 'bg-white/5 border-white/10 opacity-50'
                  }`}
                  animate={isActive ? { scale: [1, 1.15, 1], textShadow: "0px 0px 10px rgb(0, 204, 255)" } : { scale: 1 }}
                  transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
                >
                  <Icon className={`w-6 h-6 transition-colors duration-300 ${
                    isPast ? 'text-neon-green' : isActive ? 'text-neon-cyan' : 'text-gray-500'
                  }`} strokeWidth={1.5} />
                </motion.div>

                {/* Node Label */}
                <span className={`font-mono text-[10px] uppercase text-center tracking-widest absolute -bottom-8 w-[150%] transition-all duration-300 ${
                  isPast ? 'text-neon-green/80' : isActive ? 'text-neon-cyan font-bold drop-shadow-[0_0_8px_rgba(0,204,255,0.8)]' : 'text-gray-600'
                }`}>
                  {node}
                </span>
              </div>

              {/* Animated Connecting Line */}
              {index !== NODES.length - 1 && (
                <div className="flex-1 mx-4 relative flex items-center h-[2px] bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-green to-neon-cyan shadow-[0_0_10px_rgba(0,255,204,0.8)]"
                    initial={{ width: '0%' }}
                    animate={{ width: isPast ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
