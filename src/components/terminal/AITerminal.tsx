// src/components/terminal/AITerminal.tsx
import React, { useEffect, useRef } from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AITerminal: React.FC = () => {
  const logs = useCarbonStore((state) => state.logs);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-full flex flex-col font-mono p-6 bg-black/30 relative overflow-hidden group">
      {/* Terminal Grid Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />

      <div className="flex items-center gap-3 mb-2 border-b border-neon-cyan/20 pb-4 relative z-10">
        <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
        <h2 className="text-neon-cyan font-bold tracking-[0.3em] uppercase text-xs text-shadow-glow">Live Telemetry</h2>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar relative z-10"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)' }}
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => {
            let statusTag = "[INFO]";
            let colorClass = "text-blue-400";
            
            if (log.level === 'success') { statusTag = "[OK]"; colorClass = "text-neon-green drop-shadow-[0_0_8px_rgba(0,255,204,0.8)]"; }
            if (log.level === 'warning') { statusTag = "[ALERT]"; colorClass = "text-neon-yellow drop-shadow-[0_0_8px_rgba(255,204,0,0.8)]"; }

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-[11px] ${colorClass} flex gap-3 py-1 font-mono tracking-wider`}
              >
                <span className="text-gray-500 shrink-0 opacity-70">[{log.timestamp}]</span>
                <span className="shrink-0 font-bold">{statusTag}</span>
                <span className="leading-relaxed break-words">{log.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Blinking Cursor */}
        <motion.div 
          animate={{ opacity: [1, 0] }} 
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="w-2 h-4 bg-neon-cyan mt-2"
        />
      </div>
    </div>
  );
};
