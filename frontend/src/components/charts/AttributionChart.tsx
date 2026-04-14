// src/components/charts/AttributionChart.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { useCarbonStore } from '../../store/useCarbonStore';
import { motion, AnimatePresence } from 'framer-motion';
import { MaskedText } from '../layout/MaskedText';
import { Cpu, Target, Activity } from 'lucide-react';

const CustomCursor = (props: any) => {
    const { x, y, width, height } = props;
    return (
        <g>
            <line x1={x} y1={0} x2={x} y2={height + 100} stroke="rgba(16,185,129,0.5)" strokeWidth={1} strokeDasharray="3 3" />
            <circle cx={x} cy={y} r={10} fill="none" stroke="rgba(16,185,129,0.8)" strokeWidth={1} />
            <circle cx={x} cy={y} r={2} fill="#10b981" />
            
            {/* Horizontal Target Line tracking mouse */}
            <line x1={0} y1={y} x2={width + 100} y2={y} stroke="rgba(16,185,129,0.2)" strokeWidth={1} strokeDasharray="5 5" />
        </g>
    );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#050A08]/95 backdrop-blur-3xl border border-emerald-500/30 p-4 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.9)] min-w-[200px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
            
            <div className="flex items-center gap-3 mb-3 pb-2 border-b border-white/5">
                <Target className="w-4 h-4 text-emerald-500" />
                <span className="font-mono text-[10px] font-black tracking-widest text-emerald-400">VECTOR_LOCK: {label}</span>
            </div>

            <div className="space-y-3">
                {payload.map((item: any, index: number) => (
                    <div key={index} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-6">
                            <span className="text-[9px] font-mono font-black text-white/40 uppercase tracking-tighter">{item.name}</span>
                            <span className="text-xs font-mono font-black text-white">{item.value} tCO2e</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.value / 800) * 100}%` }}
                                className={`h-full ${item.name === "Stadium Footprint" ? 'bg-emerald-500' : 'bg-red-500'}`}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
                <Activity className="w-3 h-3 text-emerald-500/40 animate-pulse" />
                <span className="text-[8px] font-mono text-emerald-500/20 font-black uppercase tracking-[0.2em]">Live Telemetry Active</span>
            </div>
        </div>
      );
    }
    return null;
};

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
  const { telemetryData, simulationFactor } = useCarbonStore();

  // Threshold logic
  const CRITICAL_THRESHOLD = 500;
  const isHighStress = simulationFactor > 2.2;

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
          <AreaChart data={telemetryData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorStadium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="colorAmbient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
              </linearGradient>
              
              {/* Tactical Grid Pattern */}
              <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(16,185,129,0.1)" strokeWidth="0.5"/>
              </pattern>

              {/* Diagonal Scanlines */}
              <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="1" height="4" fill="rgba(16,185,129,0.05)" />
              </pattern>
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
              cursor={<CustomCursor />}
              content={<CustomTooltip />}
            />
            
            {/* Critical Threshold Line */}
            <ReferenceLine 
                y={CRITICAL_THRESHOLD} 
                stroke="#ef4444" 
                strokeDasharray="5 5" 
                label={{ 
                    position: 'right', 
                    value: 'STRATEGIC LIMIT', 
                    fill: '#ef4444', 
                    fontSize: 10, 
                    fontWeight: 'black', 
                    fontFamily: 'monospace' 
                }} 
            />
            
            <Area 
                type="monotone" 
                dataKey="stadium" 
                name="Stadium Footprint" 
                stackId="1" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorStadium)" 
                strokeWidth={isHighStress ? 2 : 4}
                className={isHighStress ? "animate-pulse" : ""}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
            />
            
            {/* Grid Overlay inside Area */}
            <Area 
                type="monotone" 
                dataKey="stadium" 
                stackId="1" 
                fill="url(#tacticalGrid)" 
                stroke="none"
                fillOpacity={0.4}
                pointerEvents="none"
            />

            <Area 
              type="monotone" 
              dataKey="ambient" 
              name="Ambient City Footprint" 
              stackId="1" 
              stroke="#ef4444" 
              fillOpacity={1} 
              fill="url(#colorAmbient)" 
              strokeWidth={isHighStress ? 2 : 4}
              className={isHighStress ? "animate-bounce" : ""}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }}
            />
            
            <Area 
                type="monotone" 
                dataKey="ambient" 
                stackId="1" 
                fill="url(#scanlines)" 
                stroke="none"
                fillOpacity={0.6}
                pointerEvents="none"
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
