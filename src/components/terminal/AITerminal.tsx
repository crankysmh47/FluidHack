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
    <div className="h-full flex flex-col font-mono p-5">
      <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4 opacity-80">
        <Terminal className="text-neon-cyan w-5 h-5 drop-shadow-[0_0_8px_rgba(0,204,255,0.8)]" />
        <h2 className="text-neon-cyan font-semibold tracking-widest uppercase text-xs">Ingestion Stream</h2>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => {
            let colorClass = "text-blue-400";
            if (log.level === 'success') colorClass = "text-neon-green drop-shadow-[0_0_5px_rgba(0,255,204,0.5)]";
            if (log.level === 'warning') colorClass = "text-neon-yellow drop-shadow-[0_0_5px_rgba(255,204,0,0.5)]";

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-xs ${colorClass} flex flex-col gap-1 pb-1 border-b border-white/5 last:border-0`}
              >
                <span className="text-gray-600 shrink-0 text-[10px]">[{log.timestamp}]</span>
                <span className="leading-relaxed">{log.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
