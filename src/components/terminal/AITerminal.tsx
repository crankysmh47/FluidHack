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
    <div className="bg-panel backdrop-blur-md rounded-2xl border border-white/10 p-6 h-full flex flex-col font-mono">
      <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
        <Terminal className="text-neon-cyan w-5 h-5" />
        <h2 className="text-neon-cyan font-semibold tracking-widest uppercase text-sm">AI Ingestion Terminal</h2>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => {
            let colorClass = "text-blue-400";
            if (log.level === 'success') colorClass = "text-neon-green";
            if (log.level === 'warning') colorClass = "text-neon-yellow";

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-xs sm:text-sm ${colorClass} flex gap-3`}
              >
                <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
                <span>{log.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
