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
    <div className="h-full flex flex-col font-mono p-6 relative overflow-hidden bg-[#030805]/95 crt-flicker glass-distortion">
      <div className="flex items-center justify-between mb-6 border-b border-emerald-900/10 pb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Terminal className="text-emerald-500 w-4 h-4 animate-pulse" />
          <h2 className="text-emerald-500 font-black tracking-[0.4em] uppercase text-[10px]">{'>'} Ingestion_Stream.sys</h2>
        </div>
      </div>

      <div className="flex gap-2 mb-8 relative z-10">
        {[
          { id: 'all', label: 'All', Icon: Filter },
          { id: 'api', label: 'API', Icon: Cpu },
          { id: 'nodal', label: 'Nodal', Icon: Globe }
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setFilter(id as any)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg border text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              filter === id 
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                : 'bg-emerald-950/10 border-emerald-900/20 text-emerald-950/40 hover:border-emerald-900/40 hover:text-emerald-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar relative z-10"
        style={{ 
            maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)', 
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' 
        }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {logs.map((log) => {
            let statusTag = "INFO";
            let colorClass = "text-emerald-900/40";
            
            if (log.level === 'success') { statusTag = "OK"; colorClass = "text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]"; }
            if (log.message.includes("Verifying") || log.message.includes("Check")) { statusTag = "MONITOR"; colorClass = "text-emerald-100/30"; }
            if (log.level === 'warning') { statusTag = "ALERT"; colorClass = "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] font-black uppercase"; }

            return (
              <motion.div
                key={log.id}
                layout
                initial={{ opacity: 0, x: 20, skewX: 20, filter: "blur(5px)" }}
                animate={{ 
                    opacity: 1, 
                    x: 0, 
                    skewX: 0,
                    filter: "blur(0px)"
                }}
                transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
                className={`text-[10px] ${colorClass} flex gap-4 py-1.5 font-mono tracking-tight leading-relaxed group/log`}
              >
                <span className="text-emerald-950/30 shrink-0 font-black">[{log.timestamp}]</span>
                <span className="shrink-0 font-black tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5 group-hover/log:border-current transition-colors">
                    {statusTag}
                </span>
                <span className="break-words select-text">{log.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        <motion.div 
          animate={{ opacity: [1, 0] }} 
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-1.5 h-4 bg-emerald-500 mt-4 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .glass-distortion {
            mask-image: radial-gradient(circle at center, black 80%, transparent 100%);
            -webkit-mask-image: radial-gradient(circle at center, black 80%, transparent 100%);
        }
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
