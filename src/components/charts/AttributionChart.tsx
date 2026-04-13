// src/components/charts/AttributionChart.tsx
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCarbonStore } from '../../store/useCarbonStore';
import { motion } from 'framer-motion';

export const AttributionChart: React.FC = () => {
  const { ambientBase, stadiumBase, simulationFactor, setSimulationFactor } = useCarbonStore();

  const data = useMemo(() => {
    return [{
      name: 'Real-Time Emission Vectors',
      ambient: Math.round(ambientBase * simulationFactor),
      stadium: Math.round(stadiumBase + (simulationFactor * 5)), 
    }];
  }, [ambientBase, stadiumBase, simulationFactor]);

  return (
    <motion.div 
      className="h-full flex flex-col pb-[120px] relative"
      animate={{ opacity: [0.97, 1, 0.97] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
    >
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-neon-purple/5 to-transparent pointer-events-none rounded-2xl" />

      <div className="flex-grow w-full min-h-[300px] relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorStadium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ffcc" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#00ffcc" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="colorAmbient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b026ff" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#b026ff" stopOpacity={0.2}/>
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="#888" tickLine={false} axisLine={false} tick={{fill: '#888', fontSize: 12, fontFamily: 'monospace'}} />
            <YAxis stroke="#888" tickLine={false} axisLine={false} tick={{fontFamily: 'monospace'}} />
            <Tooltip 
              cursor={{fill: 'rgba(255,255,255,0.03)'}}
              contentStyle={{ backgroundColor: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,255,204,0.3)', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,255,204,0.1)' }}
              itemStyle={{ fontFamily: 'monospace' }}
            />
            <Bar dataKey="stadium" name="Stadium (Stable)" stackId="a" fill="url(#colorStadium)" radius={[0, 0, 4, 4]} filter="url(#glow)" animationDuration={1500} animationEasing="ease-out" />
            <Bar dataKey="ambient" name="Ambient (Spiking)" stackId="a" fill="url(#colorAmbient)" radius={[4, 4, 0, 0]} filter="url(#glow)" animationDuration={1500} animationEasing="ease-out" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Embedded Slider UI */}
      <div className="mt-6 mx-auto w-full max-w-3xl bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <label className="flex justify-between text-sm text-gray-300 mb-6 font-mono tracking-wide">
          <span>NORMAL OPERATION</span>
          <span className="text-neon-yellow drop-shadow-[0_0_8px_rgba(255,204,0,0.6)] animate-pulse">SIMULATE HEATWAVE / GRID SPIKE</span>
        </label>
        <input 
          type="range" 
          min="1" 
          max="5" 
          step="0.1"
          value={simulationFactor}
          onChange={(e) => setSimulationFactor(parseFloat(e.target.value))}
          className="w-full h-3 bg-black/60 rounded-lg appearance-none cursor-pointer accent-neon-purple border border-white/10"
        />
        <div className="text-center mt-4 text-xs text-gray-500 uppercase tracking-[0.2em]">
          Drag slider to visually prove attribution separation logic
        </div>
      </div>
    </motion.div>
  );
};
