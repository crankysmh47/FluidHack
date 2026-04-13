// src/components/metrics/PerformanceMetrics.tsx
import React from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { ShieldAlert, BarChart3, Zap } from 'lucide-react';

export const PerformanceMetrics: React.FC = () => {
  const { performanceMetrics } = useCarbonStore();

  return (
    <div className="h-full flex flex-col p-6 font-sans">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <ShieldAlert className="text-teal w-12 h-12 drop-shadow-[0_0_15px_rgba(0,255,204,0.5)]" />
          <h1 className="text-4xl font-black tracking-tighter text-teal text-shadow-glow">
            CARBON<br/>SENTINEL
          </h1>
        </div>
        <p className="text-[10px] text-gray-400 font-mono tracking-[0.2em] leading-tight max-w-[200px]">
          LLM-BASED ADVANCED ENVIRONMENTAL ATTRIBUTION NODE
        </p>
      </div>

      <div className="space-y-6">
        <div className="hud-panel rounded-xl p-5 border-teal/20">
          <div className="flex items-center gap-2 mb-4 opacity-70">
            <BarChart3 className="w-4 h-4 text-teal" />
            <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-300">Performance Metrics</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[11px] mb-1 font-mono tracking-widest">
                <span className="text-gray-500 uppercase">Verification Accuracy</span>
                <span className="text-teal font-bold">{performanceMetrics.accuracy}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-teal shadow-[0_0_10px_rgba(0,255,204,1)]" style={{ width: `${performanceMetrics.accuracy}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1 font-mono tracking-widest">
                <span className="text-gray-500 uppercase">Offset Efficiency</span>
                <span className="text-purple font-bold">{performanceMetrics.efficiency}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-purple shadow-[0_0_10px_rgba(176,38,255,1)]" style={{ width: `${performanceMetrics.efficiency}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="hud-panel rounded-xl p-5 border-cyan/20">
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <Zap className="w-4 h-4 text-cyan" />
            <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-300">Node Status</h2>
          </div>
          <div className="text-lg font-mono text-cyan flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan"></span>
            </span>
            OPERATIONAL
          </div>
          <p className="text-[9px] text-gray-500 mt-2 font-mono">LATENCY: 12ms | UPTIME: 99.9%</p>
        </div>
      </div>
    </div>
  );
};
