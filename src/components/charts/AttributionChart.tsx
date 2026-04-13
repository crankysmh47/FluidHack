// src/components/charts/AttributionChart.tsx
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCarbonStore } from '../../store/useCarbonStore';
import { Activity } from 'lucide-react';

export const AttributionChart: React.FC = () => {
  const { ambientBase, stadiumBase, simulationFactor, setSimulationFactor } = useCarbonStore();

  const data = useMemo(() => {
    // Stadium emissions stay relatively stable, Ambient scales drastically with the factor
    return [{
      name: 'Current Snapshot',
      ambient: Math.round(ambientBase * simulationFactor),
      stadium: Math.round(stadiumBase + (simulationFactor * 5)), 
    }];
  }, [ambientBase, stadiumBase, simulationFactor]);

  return (
    <div className="bg-panel backdrop-blur-md rounded-2xl border border-white/10 p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-neon-purple w-5 h-5" />
        <h2 className="text-neon-purple font-semibold tracking-widest uppercase text-sm">Emissions Attribution Logic</h2>
      </div>

      {/* Chart */}
      <div className="flex-grow min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
            <XAxis dataKey="name" stroke="#666" tickLine={false} axisLine={false} />
            <YAxis stroke="#666" tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{fill: 'rgba(255,255,255,0.05)'}}
              contentStyle={{ backgroundColor: '#05050f', border: '1px solid #333', borderRadius: '8px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="stadium" name="Stadium Footprint (Stable)" stackId="a" fill="#00ffcc" radius={[0, 0, 4, 4]} />
            <Bar dataKey="ambient" name="Ambient City Footprint (Spiking)" stackId="a" fill="#b026ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Slider */}
      <div className="mt-8 bg-black/40 p-5 rounded-xl border border-white/5">
        <label className="flex justify-between text-sm text-gray-300 mb-4 font-mono">
          <span>Normal Operation</span>
          <span className="text-neon-yellow">Simulate Heatwave / Grid Spike</span>
        </label>
        <input 
          type="range" 
          min="1" 
          max="5" 
          step="0.1"
          value={simulationFactor}
          onChange={(e) => setSimulationFactor(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-purple"
        />
        <div className="text-center mt-3 text-xs text-gray-500 uppercase tracking-wider">
          Drag to isolate external anomalies
        </div>
      </div>
    </div>
  );
};
