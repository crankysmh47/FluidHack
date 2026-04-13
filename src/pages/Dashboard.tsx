import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GaugeContainer } from '../components/gauges/GaugeContainer';
import { StockChart } from '../components/charts/StockChart';
import { AIAvatar } from '../components/avatar/AIAvatar';
import { AIPanel } from '../components/AIPanel';
import { useDataSimulation } from '../hooks/useDataSimulation';
import { BrainCircuit } from 'lucide-react';

export function Dashboard() {
  // Initialize data simulation hook
  useDataSimulation();

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="flex justify-between items-center py-2 px-1">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold tracking-widest text-white uppercase">Nexus<span className="text-cyan-400">Trade</span></h1>
            <p className="text-xs text-gray-500 font-mono tracking-widest">Autonomous Global Markets AI</p>
          </div>
        </div>
        
        <div className="flex gap-4 font-mono text-sm">
          <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            SYSTEM ONLINE
          </div>
          <div className="glass-panel px-4 py-2 rounded-lg text-gray-400">
            LATENCY: <span className="text-white">12ms</span>
          </div>
        </div>
      </header>

      {/* Top Section - Gauges */}
      <section className="w-full">
        <GaugeContainer />
      </section>

      {/* Main Grid Setup */}
      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Left Section - Main Chart */}
        <section className="flex-[2] flex flex-col min-w-0">
          <StockChart />
        </section>

        {/* Right Section - AI Avatar & Panel */}
        <section className="flex-1 flex flex-col gap-6 min-w-[350px] max-w-[450px]">
          {/* Avatar takes top portion of right column */}
          <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <div className="text-[10px] font-mono text-white/50 tracking-widest">REC</div>
            </div>
            <AIAvatar />
          </div>

          {/* AI Panel takes remaining space */}
          <AIPanel />
        </section>

      </div>
    </DashboardLayout>
  );
}
