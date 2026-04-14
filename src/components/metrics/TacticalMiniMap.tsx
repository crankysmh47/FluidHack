// src/components/metrics/TacticalMiniMap.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useHeartbeat } from '../../hooks/useHeartbeat';

export const TacticalMiniMap: React.FC = () => {
  const pulse = useHeartbeat();
  
  // Simulated node points across a "world grid"
  const nodes = [
    { x: 30, y: 40, label: "NA-01" },
    { x: 70, y: 30, label: "EU-04" },
    { x: 50, y: 60, label: "AS-09" },
    { x: 20, y: 70, label: "SA-02" },
    { x: 80, y: 80, label: "OC-01" }
  ];

  return (
    <div className="w-full h-[120px] relative bg-emerald-950/20 rounded-lg overflow-hidden border border-emerald-900/20 group">
      {/* Wireframe Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#10b981" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>

      {/* Global Pulse Rings */}
      <motion.div 
        style={{ scale: 1 + (pulse * 0.2), opacity: 0.3 - (pulse * 0.2) }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-32 h-32 border border-emerald-400 rounded-full" />
      </motion.div>

      <div className="relative z-10 w-full h-full p-2">
         {nodes.map((node, i) => (
             <React.Fragment key={node.label}>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,1)]"
                />
                <div 
                    style={{ left: `${node.x + 2}%`, top: `${node.y - 2}%` }}
                    className="absolute text-[6px] font-mono text-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    {node.label}
                </div>
             </React.Fragment>
         ))}
      </div>

      <div className="absolute bottom-1 right-2 text-[7px] font-mono text-emerald-500/30 uppercase tracking-widest">
        Network_Grid [ACTIVE]
      </div>
    </div>
  );
};
