// src/components/controls/BottomControlPanel.tsx
import React from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { ForceBuyButton } from './ForceBuyButton';
import { motion } from 'framer-motion';
import { Thermometer, Gauge, Wind } from 'lucide-react';
import { useHeartbeat } from '../../hooks/useHeartbeat';

export const BottomControlPanel: React.FC = () => {
  const { simulationFactor, setSimulationFactor, isExecuting } = useCarbonStore();
  const pulse = useHeartbeat();

  const getHeatLabel = (val: number) => {
    if (val < 1.0) return "Optimal Condition";
    if (val < 2.0) return "Thermal Stress Detected";
    return "CRITICAL HEATWAVE";
  };

  return (
    <div className="w-full flex items-center justify-between gap-12 px-10 py-6 bg-[#0A1410]/95 backdrop-blur-2xl border border-emerald-900/30 rounded-2xl shadow-2xl relative overflow-hidden group">
      {/* 🧬 Moving Energy Field inside Footer */}
      <motion.div 
        animate={{ opacity: [0.05, 0.1, 0.05], backgroundPosition: ['0% 0%', '100% 100%'] }}
        transition={{ repeat: Infinity, duration: 10 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] opacity-50"
      />

      {/* LEFT: Climate Simulation Controls */}
      <div className="flex items-center gap-10 flex-grow relative z-10">
        <div className="flex flex-col gap-3 w-72">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Thermometer className={`w-4 h-4 ${simulationFactor > 2 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-emerald-900/40">Climate_Scenario</span>
            </div>
            <span className={`font-mono text-[10px] font-black tracking-widest ${simulationFactor > 2 ? 'text-red-500' : 'text-emerald-400'}`}>
                {simulationFactor.toFixed(1)}x
            </span>
          </div>
          
          <div className="relative h-2 flex items-center group/slider">
             <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={simulationFactor}
                onChange={(e) => setSimulationFactor(parseFloat(e.target.value))}
                className="w-full appearance-none bg-emerald-950/40 h-[2px] rounded-full cursor-none outline-none accent-emerald-500 hover:accent-emerald-400 transition-all"
             />
             {/* Liquid Fill Progress */}
             <motion.div 
                className="absolute left-0 h-[2px] bg-emerald-500 pointer-events-none rounded-full blur-[1px]"
                style={{ width: `${((simulationFactor - 0.5) / 2.5) * 100}%` }}
             />
          </div>
          
          <div className="flex items-center gap-2">
            <motion.div 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`w-1.5 h-1.5 rounded-full ${simulationFactor > 2 ? 'bg-red-500' : 'bg-emerald-500'}`} 
            />
            <span className={`text-[8px] font-mono font-black uppercase tracking-widest ${simulationFactor > 2 ? 'text-red-500' : 'text-emerald-900/60'}`}>
                SYSTEM_LOAD: {getHeatLabel(simulationFactor)}
            </span>
          </div>
        </div>

        {/* Tactical Separator */}
        <div className="h-10 w-[1px] bg-emerald-900/20" />

        <div className="flex items-center gap-8">
            <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                    <Gauge className="w-3.5 h-3.5 text-emerald-500/40" />
                    <span className="text-[8px] font-mono font-black text-emerald-900/40 uppercase tracking-widest">Atmospheric_Pressure</span>
                </div>
                <div className="text-sm font-black font-mono text-emerald-100/60">1013.2 hPa</div>
            </div>
            <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                    <Wind className="w-3.5 h-3.5 text-emerald-500/40" />
                    <span className="text-[8px] font-mono font-black text-emerald-900/40 uppercase tracking-widest">Wind_Velocity</span>
                </div>
                <div className="text-sm font-black font-mono text-emerald-100/60">12.4 km/h</div>
            </div>
        </div>
      </div>

      {/* RIGHT: Primary Execution Trigger */}
      <div className="relative z-10 scale-110 origin-right">
        <ForceBuyButton />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        input[type=range]::-webkit-slider-thumb {
            appearance: none;
            width: 12px;
            height: 12px;
            background: #10b981;
            border: 2px solid #050a08;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(16,185,129,0.5);
            cursor: pointer;
            transition: all 0.2s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
            transform: scale(1.3);
            box-shadow: 0 0 20px rgba(16,185,129,0.8);
        }
      `}} />
    </div>
  );
};
