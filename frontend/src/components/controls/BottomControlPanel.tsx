// src/components/controls/BottomControlPanel.tsx
import React, { useState } from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { ForceBuyButton } from './ForceBuyButton';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Gauge, Wind, Zap, TrendingDown, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useHeartbeat } from '../../hooks/useHeartbeat';

export const BottomControlPanel: React.FC = () => {
  const { 
    simulationFactor, setSimulationFactor, isExecuting, 
    surgeActive, triggerSurge, clearSurge, agentStatus,
    claimFaucet, budgetUsd, spentUsd
  } = useCarbonStore();
  const pulse = useHeartbeat();
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [faucetSuccess, setFaucetSuccess] = useState(false);

  const getHeatLabel = (val: number) => {
    if (val < 1.0) return "Optimal Condition";
    if (val < 2.0) return "Thermal Stress Detected";
    return "CRITICAL HEATWAVE";
  };

  const handleFaucet = async () => {
    setFaucetLoading(true);
    await claimFaucet();
    setFaucetLoading(false);
    setFaucetSuccess(true);
    setTimeout(() => setFaucetSuccess(false), 3000);
  };

  return (
    <div className="w-full flex items-center justify-between gap-6 px-8 py-4 bg-[#0A1410]/95 backdrop-blur-2xl border border-emerald-900/30 rounded-2xl shadow-2xl relative overflow-hidden group">
      {/* Moving Energy Field */}
      <motion.div 
        animate={{ opacity: [0.05, 0.1, 0.05], backgroundPosition: ['0% 0%', '100% 100%'] }}
        transition={{ repeat: Infinity, duration: 10 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] opacity-50"
      />

      {/* LEFT: Climate Simulation Controls */}
      <div className="flex items-center gap-8 flex-grow relative z-10">
        <div className="flex flex-col gap-3 w-64">
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
              className="w-full appearance-none bg-emerald-950/40 h-[2px] rounded-full cursor-pointer outline-none accent-emerald-500 hover:accent-emerald-400 transition-all"
            />
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
              {getHeatLabel(simulationFactor)}
            </span>
          </div>
        </div>

        {/* Tactical Separator */}
        <div className="h-10 w-[1px] bg-emerald-900/20" />

        {/* Demo Event Controls */}
        <div className="flex flex-col gap-2">
          <span className="text-[8px] font-mono font-black uppercase tracking-widest text-emerald-900/40">Demo Events</span>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => surgeActive ? clearSurge() : triggerSurge('surge')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                surgeActive 
                  ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                  : 'bg-emerald-950/20 border-emerald-900/20 text-emerald-900/50 hover:border-emerald-700/40 hover:text-emerald-600'
              }`}
            >
              <Zap className="w-3 h-3" />
              {surgeActive ? 'SURGE ACTIVE' : 'TRIGGER SURGE'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => triggerSurge('peak')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border bg-emerald-950/20 border-emerald-900/20 text-emerald-900/50 hover:border-emerald-700/40 hover:text-emerald-600 transition-all"
            >
              <AlertTriangle className="w-3 h-3" />
              PEAK LOAD
            </motion.button>
          </div>
        </div>

        {/* Tactical Separator */}
        <div className="h-10 w-[1px] bg-emerald-900/20" />

        {/* Atmospheric readings */}
        <div className="flex items-center gap-6">
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

      {/* RIGHT: Faucet + Execution Trigger */}
      <div className="flex items-center gap-4 relative z-10">
        {/* Demo Faucet */}
        <div className="flex flex-col items-center gap-1">
          <AnimatePresence mode="wait">
            {faucetSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-400 text-[9px] font-black"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                $10K RECEIVED!
              </motion.div>
            ) : (
              <motion.button
                key="faucet"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFaucet}
                disabled={faucetLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/20 border border-emerald-900/30 text-emerald-700/80 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-800/30 hover:text-emerald-500 transition-all disabled:opacity-40"
              >
                <TrendingDown className="w-3.5 h-3.5" />
                {faucetLoading ? 'Loading...' : 'FAUCET $10K'}
              </motion.button>
            )}
          </AnimatePresence>
          <span className="text-[7px] font-mono text-emerald-950/30 uppercase tracking-widest">Testnet Demo</span>
        </div>

        <div className="h-10 w-[1px] bg-emerald-900/20" />

        {/* Primary Execution Trigger */}
        <div className="scale-90 origin-right">
          <ForceBuyButton />
        </div>
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
