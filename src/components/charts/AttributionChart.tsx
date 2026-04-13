// src/components/charts/AttributionChart.tsx
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCarbonStore } from '../../store/useCarbonStore';
import { motion } from 'framer-motion';

export const AttributionChart: React.FC = () => {
  const { ambientBase, stadiumBase, simulationFactor } = useCarbonStore();

  const data = useMemo(() => {
    // Generate some historical-looking points for the Area chart
    const points = [];
    for (let i = 0; i < 7; i++) {
      const variator = 1 + (Math.sin(i) * 0.1);
      points.push({
        time: `${i}:00`,
        ambient: Math.round(ambientBase * simulationFactor * variator),
        stadium: Math.round((stadiumBase + (simulationFactor * 5)) * (1 + (Math.cos(i) * 0.05))), 
      });
    }
    return points;
  }, [ambientBase, stadiumBase, simulationFactor]);

  return (
    <motion.div 
      className="h-full flex flex-col relative p-4"
      animate={{ opacity: [0.98, 1, 0.98] }}
      transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
    >
      <div className="flex items-center justify-between mb-8 px-4">
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-500 mb-1">Telemetry Analysis</h2>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">Real-Time Emission Vectors</h1>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-gray-500 font-mono">SAMPLING RATE: 0.5s</p>
          <p className="text-[9px] text-teal font-mono">ENCRYPTED STREAM</p>
        </div>
      </div>

      <div className="flex-grow w-full h-[500px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorStadium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="colorAmbient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="1 5" stroke="rgba(16, 185, 129, 0.05)" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis 
              stroke="#14532d" 
              tickLine={false} 
              axisLine={false} 
              tick={{fill: '#34d399', fontSize: 10, fontFamily: 'monospace', opacity: 0.5}}
              ticks={[0, 200, 450, 600]}
              tickFormatter={(val) => `${val} tCO2e`}
            />
            <Tooltip 
              cursor={{ stroke: 'rgba(16, 185, 129, 0.2)', strokeWidth: 1 }}
              contentStyle={{ backgroundColor: 'rgba(5,10,8,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.8)' }}
              itemStyle={{ fontFamily: 'monospace', fontSize: '11px' }}
            />
            <Area 
              type="monotone" 
              dataKey="stadium" 
              name="Stadium Footprint (Stable)" 
              stackId="1" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorStadium)" 
              strokeWidth={3}
            />
            <Area 
              type="monotone" 
              dataKey="ambient" 
              name="Ambient City Footprint (Spiking)" 
              stackId="1" 
              stroke="#ef4444" 
              fillOpacity={1} 
              fill="url(#colorAmbient)" 
              strokeWidth={3}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
