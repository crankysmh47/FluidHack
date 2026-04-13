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
    <div className="min-h-screen bg-background bg-grid-pattern p-4 md:p-8 flex flex-col gap-6">
      
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-white w-8 h-8" />
          <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500 uppercase">
            Carbon <span className="text-neon-green">Sentinel</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-green"></span>
            </span>
            <span className="text-sm font-mono text-gray-400">NODE ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Main 3-Panel Layout */}
      <section className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        {/* Left: Data Ingestion */}
        <div className="lg:col-span-1 h-full">
          <AITerminal />
        </div>
        
        {/* Center: Logic / Attribution */}
        <div className="lg:col-span-1 h-full">
          <AttributionChart />
        </div>

        {/* Right: Execution Flow */}
        <div className="lg:col-span-1 h-full">
          <TransactionFlow />
        </div>
      </section>

      {/* Action Area */}
      <section className="mt-auto">
        <ForceBuyButton />
      </section>

    </div>
  );
};
