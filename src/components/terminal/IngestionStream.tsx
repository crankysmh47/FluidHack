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
    <div className="h-full flex flex-col font-mono p-6 relative overflow-hidden bg-[#030805]/95 crt-flicker">
      <div className="flex items-center justify-between mb-4 border-b border-emerald-900/20 pb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Terminal className="text-emerald-400 w-4 h-4" />
          <h2 className="text-emerald-400 font-bold tracking-[0.3em] uppercase text-xs">{'>'} Ingestion Stream</h2>
        </div>
      </div>

      <div className="flex gap-2 mb-6 relative z-10">
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
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                : 'bg-white/5 border-white/5 text-emerald-900/40 hover:border-emerald-900/60'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar relative z-10"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => {
            let statusTag = "[INFO]";
            let colorClass = "text-emerald-900/60";
            
            if (log.level === 'success') { statusTag = "[OK]"; colorClass = "text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]"; }
            if (log.message.includes("Verifying") || log.message.includes("Check")) { statusTag = "[MONITORING]"; colorClass = "text-emerald-100/40"; }
            if (log.level === 'warning') { statusTag = "[ALERT]"; colorClass = "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]"; }

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: 20, skewX: 20 }}
                animate={{ 
                    opacity: 1, 
                    x: 0, 
                    skewX: [20, -5, 0],
                    filter: ["blur(10px)", "blur(0px)"]
                }}
                transition={{ duration: 0.3 }}
                className={`text-[10px] ${colorClass} flex gap-3 py-1 font-mono tracking-normal relative`}
              >
                {/* Micro Glitch Overlay */}
                <motion.span 
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.1, delay: 0.1 }}
                    className="absolute inset-0 bg-emerald-400/10 pointer-events-none"
                />
                
                <span className="text-emerald-900/30 shrink-0 opacity-50">[{log.timestamp}]</span>
                <span className="shrink-0 font-bold">{statusTag}</span>
                <span className="leading-relaxed break-words">{log.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        <motion.div 
          animate={{ opacity: [1, 0] }} 
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="w-1.5 h-3 bg-emerald-500 mt-2"
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flicker {
          0% { opacity: 0.97; }
          5% { opacity: 0.95; }
          10% { opacity: 0.97; }
          15% { opacity: 0.94; }
          20% { opacity: 0.97; }
          100% { opacity: 0.98; }
        }
        .crt-flicker { animation: flicker 0.15s infinite; }
      `}} />
    </div>
  );
};
