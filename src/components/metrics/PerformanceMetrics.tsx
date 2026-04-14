// src/components/metrics/PerformanceMetrics.tsx
import React, { useState, useEffect } from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { ShieldAlert, BarChart3, Zap } from 'lucide-react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';

const CountingNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      ease: [0.33, 1, 0.68, 1], // Physics-like easing
      onUpdate: (latest) => setDisplayValue(Number(latest.toFixed(1))),
    });
    return () => controls.stop();
  }, [value]);

  return <>{displayValue}</>;
};

export const PerformanceMetrics: React.FC = () => {
  const { performanceMetrics } = useCarbonStore();

  return (
    <div className="h-full flex flex-col p-6 font-sans relative group overflow-hidden">
      {/* Dynamic Glass Glare */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
      
      <div className="mb-10 relative z-10">
        <div className="flex items-center gap-3 mb-1">
          <ShieldAlert className="text-emerald-500 w-12 h-12 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <h1 className="text-4xl font-black tracking-tighter text-emerald-400 text-shadow-glow">
            CARBON<br/>SENTINEL
          </h1>
        </div>
        <p className="text-[10px] text-emerald-100/50 font-mono tracking-[0.2em] leading-tight max-w-[200px]">
          LLM-BASED ADVANCED ENVIRONMENTAL ATTRIBUTION NODE
        </p>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="hud-panel rounded-xl p-5 border-emerald-900/20 bg-[#0A1410]/40 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4 opacity-70">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-emerald-100/70">Performance Metrics</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[11px] mb-1 font-mono tracking-widest">
                <span className="text-emerald-900/60 uppercase">Verification Accuracy</span>
                <span className="text-emerald-400 font-bold">
                  <CountingNumber value={performanceMetrics.accuracy} />%
                </span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${performanceMetrics.accuracy}%` }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]" 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1 font-mono tracking-widest">
                <span className="text-emerald-900/60 uppercase">Offset Efficiency</span>
                <span className="text-red-500 font-bold">
                  <CountingNumber value={performanceMetrics.efficiency} />%
                </span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${performanceMetrics.efficiency}%` }}
                  transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                  className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="hud-panel rounded-xl p-5 border-emerald-900/20 bg-[#0A1410]/40">
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-emerald-100/70">Node Status</h2>
          </div>
          <div className="text-lg font-mono text-emerald-400 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            OPERATIONAL
          </div>
          <p className="text-[9px] text-emerald-900/50 mt-2 font-mono">LATENCY: 12ms | UPTIME: 99.9%</p>
        </div>
      </div>
    </div>
  );
};
