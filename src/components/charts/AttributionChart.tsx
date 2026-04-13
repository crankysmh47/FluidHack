// src/components/charts/AttributionChart.tsx
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCarbonStore } from '../../store/useCarbonStore';

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
    <div className="h-full flex flex-col pb-[120px]"> {/* Padding bottom to accommodate floating button */}
      
      {/* Chart */}
      <div className="flex-grow w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
            <XAxis dataKey="name" stroke="#666" tickLine={false} axisLine={false} tick={{fill: '#888', fontSize: 14}} />
            <YAxis stroke="#666" tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{fill: 'rgba(255,255,255,0.02)'}}
              contentStyle={{ backgroundColor: 'rgba(5,5,15,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ fontFamily: 'monospace' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontFamily: 'monospace', fontSize: '14px' }} />
            <Bar dataKey="stadium" name="Stadium Footprint (Stable)" stackId="a" fill="#00ffcc" radius={[0, 0, 4, 4]} />
            <Bar dataKey="ambient" name="Ambient City Footprint (Spiking)" stackId="a" fill="#b026ff" radius={[4, 4, 0, 0]} />
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
    </div>
  );
};
