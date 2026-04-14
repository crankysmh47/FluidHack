// src/components/metrics/PerformanceMetrics.tsx
import React, { useState, useEffect } from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { ShieldAlert, BarChart3, Zap, Activity } from 'lucide-react';
import { motion, animate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { TacticalMiniMap } from './TacticalMiniMap';
import { useHeartbeat } from '../../hooks/useHeartbeat';

const CountingNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      ease: [0.33, 1, 0.68, 1],
      onUpdate: (latest) => setDisplayValue(Number(latest.toFixed(1))),
    });
    return () => controls.stop();
  }, [value]);

  return <>{displayValue}</>;
};

export const PerformanceMetrics: React.FC = () => {
  const { performanceMetrics, isExecuting } = useCarbonStore();
  const pulse = useHeartbeat();
  
  // Proximity scaling (simulated for simplicity, or we can use mouse tracking)
  const glowOpacity = useTransform(useMotionValue(pulse), [0, 1], [0.3, 0.8]);

  return (
    <div className="h-full flex flex-col p-6 font-sans relative group overflow-hidden">
      <div className="mb-8 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="text-emerald-500 w-10 h-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <h1 className="text-3xl font-black tracking-tighter text-emerald-400 text-shadow-glow">
            CARBON<br/>SENTINEL
          </h1>
        </div>
        <p className="text-[9px] text-emerald-100/30 font-mono tracking-[0.3em] uppercase leading-relaxed">
          LLM-BASED ADVANCED ENVIRONMENTAL ATTRIBUTION NODE
        </p>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="hud-panel rounded-xl p-5 border-emerald-900/10 bg-emerald-950/5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-500 opacity-50" />
            <h2 className="text-[9px] font-black tracking-[0.4em] uppercase text-emerald-100/40">Network Performance</h2>
          </div>
          
          <div className="space-y-4">
            <motion.div style={{ opacity: pulse * 0.5 + 0.5 }}>
              <div className="flex justify-between text-[10px] mb-1 font-mono tracking-widest">
                <span className="text-emerald-900/60 font-bold">ACCURACY</span>
                <span className="text-emerald-400 font-black">
                  <CountingNumber value={performanceMetrics.accuracy} />%
                </span>
              </div>
              <div className="h-1 bg-emerald-950/40 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${performanceMetrics.accuracy}%` }}
                  transition={{ duration: 2 }}
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" 
                />
              </div>
            </motion.div>

            <motion.div style={{ opacity: (1-pulse) * 0.5 + 0.5 }}>
              <div className="flex justify-between text-[10px] mb-1 font-mono tracking-widest">
                <span className="text-emerald-900/60 font-bold text-red-900/40">EFFICIENCY</span>
                <span className="text-red-500 font-black">
                  <CountingNumber value={performanceMetrics.efficiency} />%
                </span>
              </div>
              <div className="h-1 bg-emerald-950/40 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${performanceMetrics.efficiency}%` }}
                  transition={{ duration: 2, delay: 0.1 }}
                  className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" 
                />
              </div>
            </motion.div>
          </div>
        </div>

        <div className="hud-panel rounded-xl p-5 border-emerald-900/10 bg-emerald-950/5">
            <div className="flex items-center gap-2 mb-3">
                <Activity className="w-3.5 h-3.5 text-emerald-500 opacity-50" />
                <h2 className="text-[9px] font-black tracking-[0.4em] uppercase text-emerald-100/40">Global Pulse</h2>
            </div>
            <TacticalMiniMap />
        </div>

        <div className="hud-panel rounded-xl p-5 border-emerald-900/10 bg-emerald-950/5">
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <h2 className="text-[9px] font-black tracking-[0.4em] uppercase text-emerald-100/40">Node Status</h2>
          </div>
          <motion.div 
            animate={{ scale: isExecuting ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className={`text-sm font-black font-mono flex items-center gap-3 ${isExecuting ? 'text-red-500' : 'text-emerald-400'}`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isExecuting ? 'bg-red-500' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isExecuting ? 'bg-red-500' : 'bg-emerald-400'}`}></span>
            </span>
            {isExecuting ? 'SEQ_EXECUTING' : 'NODE_OPERATIONAL'}
          </motion.div>
          <p className="text-[8px] text-emerald-900/40 mt-3 font-mono tracking-tighter uppercase">LATENCY: 12ms | UPTIME: 99.9% | SECURE</p>
        </div>
      </div>
    </div>
  );
};
