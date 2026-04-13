// src/pages/Dashboard.tsx
import React, { useEffect } from 'react';
import { useCarbonStore } from '../store/useCarbonStore';
import { IngestionStream } from '../components/terminal/IngestionStream';
import { AttributionChart } from '../components/charts/AttributionChart';
import { TransactionFlow } from '../components/flow/TransactionFlow';
import { PerformanceMetrics } from '../components/metrics/PerformanceMetrics';
import { BottomControlPanel } from '../components/controls/BottomControlPanel';

export const Dashboard: React.FC = () => {
  const initSimulation = useCarbonStore(state => state.initSimulation);

  useEffect(() => {
    initSimulation();
  }, [initSimulation]);

  return (
    <div className="relative w-screen h-screen overflow-hidden scanline-effect">
      
      {/* 🔝 ROW 1: Execution Pipeline */}
      <div className="absolute top-0 left-0 w-full h-[120px] z-40">
        <TransactionFlow />
      </div>

      {/* 🖼️ MAIN GRID: Sidebars + Chart */}
      <main className="absolute top-[120px] left-0 right-0 bottom-[120px] flex z-10">
        
        {/* LEFT: Branding & Metrics */}
        <div className="w-[320px] h-full border-r border-white/5 bg-black/20 backdrop-blur-md">
          <PerformanceMetrics />
        </div>

        {/* CENTER: Main HUD Visualization */}
        <div className="flex-grow h-full bg-white/[0.02]">
          <AttributionChart />
        </div>

        {/* RIGHT: Ingestion Terminal */}
        <div className="w-[380px] h-full border-l border-white/5 bg-black/20 backdrop-blur-md">
          <IngestionStream />
        </div>

      </main>

      {/* 🕹️ ROW 3: Fixed Controls */}
      <BottomControlPanel />

    </div>
  );
};
