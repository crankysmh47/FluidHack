import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useStockStore } from '../../store/useStockStore';
import { motion } from 'framer-motion';

export function StockChart() {
  const stocks = useStockStore(state => state.stocks);
  const selectedSymbol = useStockStore(state => state.selectedStockSymbol);
  
  const selectedStock = stocks.find(s => s.symbol === selectedSymbol);

  const isPositive = useMemo(() => {
    if (!selectedStock || selectedStock.history.length < 2) return true;
    const history = selectedStock.history;
    return history[history.length - 1].price >= history[0].price;
  }, [selectedStock]);

  if (!selectedStock) {
    return (
      <div className="glass-panel flex-1 rounded-2xl flex items-center justify-center">
        <div className="animate-pulse text-gray-500 font-mono">LOADING MARKET DATA...</div>
      </div>
    );
  }

  const color = isPositive ? '#00ff88' : '#ff3366';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel text-white p-3 rounded border border-white/10 shadow-2xl">
          <p className="text-gray-400 font-mono text-xs mb-1">{label}</p>
          <p className="font-mono text-lg font-bold" style={{ color }}>
            ${Number(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="glass-panel flex-1 rounded-2xl p-6 flex flex-col relative"
    >
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            {selectedStock.name} <span className="text-xl text-gray-500">[{selectedStock.symbol}]</span>
          </h2>
          <div className="text-sm font-mono text-gray-400 mt-1">Live Asset Performance</div>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={selectedStock.history} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              hide={true} 
            />
            <YAxis 
              domain={['auto', 'auto']} 
              hide={true}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={color} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              isAnimationActive={false} // Disable recharts animation to show real-time tick smoothly
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/20 rounded-tl-xl" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/20 rounded-tr-xl" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/20 rounded-bl-xl" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/20 rounded-br-xl" />
    </motion.div>
  );
}
