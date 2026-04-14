// src/components/layout/PremiumPanel.tsx
import React, { useRef } from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { cn } from '../../lib/utils';

interface PremiumPanelProps {
  children: React.ReactNode;
  className?: string;
  showBeam?: boolean;
}

export const PremiumPanel: React.FC<PremiumPanelProps> = ({ 
  children, 
  className,
  showBeam = true
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-emerald-900/30 bg-[#0A1410]/80 backdrop-blur-xl transition-all duration-500",
        className
      )}
    >
      {/* 🖱️ Global Spotlight Follow */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-500 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(16, 185, 129, 0.15),
              transparent 80%
            )
          `,
        }}
      />

      {/* 💫 Border Beam Effect */}
      {showBeam && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-xl">
           <div 
             className="absolute inset-0 border border-emerald-500/20 rounded-xl"
             style={{
                maskImage: 'linear-gradient(to right, transparent, black, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black, transparent)',
                animation: 'border-pulse 4s linear infinite'
             }}
           />
        </div>
      )}

      {/* 📦 Content */}
      <div className="relative z-20 h-full w-full">
        {children}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes border-pulse {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
      `}} />
    </div>
  );
};
