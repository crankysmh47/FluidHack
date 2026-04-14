// src/components/charts/AttributionChart.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCarbonStore } from '../../store/useCarbonStore';
import { motion, AnimatePresence } from 'framer-motion';
import { MaskedText } from '../layout/MaskedText';

const DataPacket = ({ delay }: { delay: number }) => (
    <motion.div 
        initial={{ left: "-5%", bottom: "20%", opacity: 0 }}
        animate={{ 
            left: ["0%", "100%", "100%"],
            bottom: ["20%", "20%", "80%"],
            opacity: [0, 1, 1, 0]
        }}
        transition={{ 
            duration: 8, 
            repeat: Infinity, 
            delay, 
            times: [0, 0.7, 0.9, 1],
            ease: "linear"
        }}
        className="absolute w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,1)] z-30"
    />
);

export const AttributionChart: React.FC = () => {
  const { ambientBase, stadiumBase, simulationFactor } = useCarbonStore();

  const data = useMemo(() => {
    const points = [];
    for (let i = 0; i < 7; i++) {
        const variator = 1 + (Math.sin(i * 1.5) * 0.1);
        points.push({
            time: `${i}:00`,
            ambient: Math.round(ambientBase * simulationFactor * variator),
            stadium: Math.round((stadiumBase + (simulationFactor * 5)) * (1 + (Math.cos(i * 0.8) * 0.05))), 
        });
    }
    return points;
  }, [ambientBase, stadiumBase, simulationFactor]);

  return (
    <div className="h-full flex flex-col relative p-6 group overflow-hidden">
      {/* 🚀 Active Scanning Line Overlay */}
      <motion.div 
         animate={{ left: ["-10%", "110%"] }}
         transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
         className="absolute top-0 bottom-0 w-[1px] bg-emerald-400/20 shadow-[0_0_20px_rgba(16,185,129,0.3)] z-40 pointer-events-none"
      />

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <DataPacket delay={0} />
        <DataPacket delay={2} />
        <DataPacket delay={4} />
      </div>

      <div className="flex items-center justify-between mb-10 px-2 relative z-10">
        <div>
          <MaskedText 
            text="TELEMETRY ANALYSIS" 
            className="text-[9px] font-black tracking-[0.6em] uppercase text-emerald-900/40 mb-2"
          />
          <h1 className="text-3xl font-black text-white tracking-widest uppercase text-shadow-glow">
            EMISSION VECTORS
          </h1>
        </div>
        <div className="text-right flex flex-col gap-1">
          <p className="text-[10px] text-emerald-950/40 font-mono tracking-widest">SAMPLING RATE: 0.5s</p>
          <motion.p 
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-[10px] text-emerald-500 font-black font-mono tracking-widest"
          >
            ACTIVE ENCRYPTION
          </motion.p>
        </div>
      </div>

      <div className="flex-grow w-full h-[500px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorStadium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="colorAmbient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.05)" vertical={true} />
            <XAxis dataKey="time" hide />
            <YAxis 
              stroke="#064e3b" 
              tickLine={false} 
              axisLine={false} 
              tick={{fill: '#065f46', fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold'}}
              ticks={[0, 200, 450, 600]}
              tickFormatter={(val) => `${val} tCO2e`}
            />
            <Tooltip 
              cursor={{ stroke: 'rgba(16, 185, 129, 0.4)', strokeWidth: 1 }}
              contentStyle={{ 
                  backgroundColor: 'rgba(5,10,8,0.95)', 
                  backdropFilter: 'blur(20px)', 
                  border: '1px solid rgba(16,185,129,0.2)', 
                  borderRadius: '12px', 
                  boxShadow: '0 0 30px rgba(0,0,0,0.8)',
                  padding: '12px'
              }}
              itemStyle={{ fontFamily: 'monospace', fontSize: '11px', textTransform: 'uppercase' }}
            />
            
            <Area 
                type="monotone" 
                dataKey="stadium" 
                name="Stadium Footprint" 
                stackId="1" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorStadium)" 
                strokeWidth={4}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
            />
            
            <Area 
              type="monotone" 
              dataKey="ambient" 
              name="Ambient City Footprint" 
              stackId="1" 
              stroke="#ef4444" 
              fillOpacity={1} 
              fill="url(#colorAmbient)" 
              strokeWidth={4}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }}
            />

            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="square"
              wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 'bold' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
