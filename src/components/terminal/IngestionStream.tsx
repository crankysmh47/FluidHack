// src/components/terminal/IngestionStream.tsx
import React, { useEffect, useRef } from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { Terminal, Filter, Cpu, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const IngestionStream: React.FC = () => {
  const { logs, filter, setFilter } = useCarbonStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-full flex flex-col font-mono p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Terminal className="text-cyan w-4 h-4" />
          <h2 className="text-cyan font-bold tracking-[0.3em] uppercase text-xs">{'>'} Ingestion Stream</h2>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { id: 'all', label: 'All', Icon: Filter },
          { id: 'api', label: 'API', Icon: Cpu },
          { id: 'nodal', label: 'Nodal', Icon: Globe }
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setFilter(id as any)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-[9px] uppercase tracking-widest transition-all ${
              filter === id 
                ? 'bg-cyan/10 border-cyan text-cyan' 
                : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar relative"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)' }}
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => {
            let statusTag = "[INFO]";
            let colorClass = "text-blue-400";
            
            if (log.level === 'success') { statusTag = "[OK]"; colorClass = "text-teal drop-shadow-[0_0_8px_rgba(0,255,204,0.4)]"; }
            if (log.message.includes("Verifying") || log.message.includes("Check")) { statusTag = "[MONITORING]"; colorClass = "text-purple drop-shadow-[0_0_8px_rgba(176,38,255,0.4)]"; }
            if (log.level === 'warning') { statusTag = "[ALERT]"; colorClass = "text-neon-red drop-shadow-[0_0_8px_rgba(255,51,102,0.4)]"; }

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-[10px] ${colorClass} flex gap-3 py-1 font-mono tracking-normal`}
              >
                <span className="text-gray-600 shrink-0 opacity-50">[{log.timestamp}]</span>
                <span className="shrink-0 font-bold">{statusTag}</span>
                <span className="leading-relaxed break-words">{log.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        <motion.div 
          animate={{ opacity: [1, 0] }} 
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="w-1.5 h-3 bg-cyan mt-2"
        />
      </div>
    </div>
  );
};
