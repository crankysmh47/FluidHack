// src/pages/Dashboard.tsx
import React, { useEffect } from 'react';
import { useCarbonStore } from '../store/useCarbonStore';
import { AITerminal } from '../components/terminal/AITerminal';
import { AttributionChart } from '../components/charts/AttributionChart';
import { TransactionFlow } from '../components/flow/TransactionFlow';
import { ForceBuyButton } from '../components/controls/ForceBuyButton';
import { ShieldAlert } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const initSimulation = useCarbonStore(state => state.initSimulation);

  useEffect(() => {
    initSimulation();
  }, [initSimulation]);

  return (
    <div className="relative w-screen h-screen bg-background bg-grid-pattern overflow-hidden text-white font-sans">
      
      {/* 🔝 TOP EDGE - Execution Engine */}
      <div className="absolute top-0 left-0 w-full h-[100px] z-30 bg-black/40 backdrop-blur-xl border-b border-neon-green/20 shadow-[0_4px_30px_rgba(0,255,204,0.05)]">
        <TransactionFlow />
      </div>

      {/* 🧾 RIGHT EDGE - AI Terminal */}
      <div className="absolute top-[100px] right-0 h-[calc(100vh-100px)] w-[320px] z-20 bg-black/50 backdrop-blur-lg border-l border-neon-cyan/20 shadow-[-4px_0_30px_rgba(0,204,255,0.05)]">
        <AITerminal />
      </div>

      {/* 📊 MAIN AREA - Chart & UI Core */}
      <div className="absolute top-[100px] left-0 right-[320px] bottom-0 z-10 p-8 flex flex-col">
        {/* Embedded Header */}
        <header className="flex items-center justify-between mb-8 opacity-90">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-white w-10 h-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
            <div>
              <h1 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 uppercase">
                Carbon <span className="text-neon-green drop-shadow-[0_0_10px_rgba(0,255,204,0.8)]">Sentinel</span>
              </h1>
              <p className="text-neon-cyan font-mono text-xs tracking-[0.2em] mt-1">LIVE ENVIRONMENTAL ATTRIBUTION NODE</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-green shadow-[0_0_10px_rgba(0,255,204,1)]"></span>
            </span>
            <span className="text-sm font-mono text-gray-300 tracking-wider">SYSTEM ACTIVE</span>
          </div>
        </header>

        {/* Embedded Chart */}
        <div className="flex-grow w-full relative">
          <AttributionChart />
        </div>
      </div>

      {/* ⚡ FLOATING BUTTON */}
      <div className="absolute bottom-10 left-[calc(50%-160px)] -translate-x-1/2 z-40">
        <ForceBuyButton />
      </div>

    </div>
  );
};
