// src/components/controls/BottomControlPanel.tsx
import React from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { ForceBuyButton } from './ForceBuyButton';

export const BottomControlPanel: React.FC = () => {
  const { simulationFactor, setSimulationFactor } = useCarbonStore();

  return (
    <div className="fixed bottom-0 left-0 w-full h-[140px] z-50 hud-panel border-t border-white/10 px-16 flex items-center justify-between bg-black/80">
      {/* Simulation Controls */}
      <div className="flex-1 max-w-2xl">
        <div className="flex justify-between text-[11px] mb-6 font-mono tracking-[0.4em] uppercase">
          <span className={`transition-all duration-300 ${simulationFactor <= 2 ? "text-teal font-black drop-shadow-[0_0_8px_rgba(0,255,204,0.8)]" : "text-gray-600"}`}>Normal</span>
          <span className={`transition-all duration-300 ${simulationFactor > 2 && simulationFactor <= 3.5 ? "text-purple font-black drop-shadow-[0_0_8px_rgba(176,38,255,0.8)]" : "text-gray-600"}`}>Heatwave</span>
          <span className={`transition-all duration-300 ${simulationFactor > 3.5 ? "text-neon-red font-black drop-shadow-[0_0_8px_rgba(255,51,102,0.8)]" : "text-gray-600"}`}>Grid Spike</span>
        </div>
        
        <div className="relative group px-1">
          <div className="absolute -top-10 left-0 text-[10px] text-gray-400 font-mono opacity-80 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-red animate-pulse" />
            DEMO OVERRIDE: MANUALLY TRIGGER EXECUTION FLOW
          </div>
          <input 
            type="range" 
            min="1" 
            max="5" 
            step="0.1"
            value={simulationFactor}
            onChange={(e) => setSimulationFactor(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple border border-white/5"
          />
        </div>
      </div>

      {/* Execution Button */}
      <div className="ml-12">
        <ForceBuyButton />
      </div>
    </div>
  );
};
