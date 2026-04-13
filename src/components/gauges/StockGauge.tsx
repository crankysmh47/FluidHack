import { Stock } from '../../types';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

interface StockGaugeProps {
  stock: Stock;
  selected: boolean;
  onClick: () => void;
}

export function StockGauge({ stock, selected, onClick }: StockGaugeProps) {
  // Clamping value between -5 and 5 for the gauge visualization (representing percentage change)
  const clampedValue = Math.max(-5, Math.min(5, stock.changePercent));
  const normalizedPercentage = (clampedValue + 5) / 10; // 0 to 1
  const rotationOffset = normalizedPercentage * 180 - 90; // -90 to +90 degrees

  const isPositive = stock.changePercent >= 0;
  const colorHex = isPositive ? '#00ff88' : '#ff3366';
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "glass-panel rounded-xl p-4 min-w-[220px] cursor-pointer transition-all duration-300 relative overflow-hidden group",
        selected ? `border-[${colorHex}]/50 shadow-[0_0_20px_rgba(0,0,0,0.8)]` : "hover:border-white/20"
      )}
      style={selected ? { borderColor: `${colorHex}80`, boxShadow: `0 0 15px ${colorHex}30` } : {}}
    >
      {selected && (
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ background: `linear-gradient(to bottom, ${colorHex}, transparent)` }} 
        />
      )}

      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold tracking-wider">{stock.symbol}</h3>
        <span className="text-xs text-gray-400 font-mono tracking-widest">{stock.name}</span>
      </div>

      <div className="relative h-[100px] flex items-end justify-center mb-2">
        {/* SVG Gauge Background */}
        <svg viewBox="0 0 100 50" className="w-full h-full drop-shadow-lg">
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#222" strokeWidth="8" strokeLinecap="round" />
          {/* Gradient zones */}
          <path d="M 10 50 A 40 40 0 0 1 30 20" fill="none" stroke="#ff3366" strokeWidth="8" strokeLinecap="round" strokeDasharray="4 2" />
          <path d="M 70 20 A 40 40 0 0 1 90 50" fill="none" stroke="#00ff88" strokeWidth="8" strokeLinecap="round" strokeDasharray="4 2" />
          
          {/* Needle pivot */}
          <circle cx="50" cy="50" r="4" fill="#666" />
        </svg>

        {/* Animated Needle */}
        <motion.div
          className="absolute bottom-[2px] w-[2px] h-[40px] bg-white origin-bottom z-10"
          style={{ borderRadius: '2px 2px 0 0' }}
          animate={{ rotate: rotationOffset }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        >
          {/* Needle glowing tip */}
          <div className="absolute top-0 left-[-2px] w-[6px] h-[6px] bg-white rounded-full blur-[2px]" style={{ backgroundColor: colorHex }} />
        </motion.div>
      </div>

      <div className="flex flex-col items-center z-10 relative">
        <div className="text-2xl font-mono font-bold">
          ${stock.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div 
          className="text-sm font-bold font-mono"
          style={{ color: colorHex }}
        >
          {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
