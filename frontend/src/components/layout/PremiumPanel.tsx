// src/components/layout/PremiumPanel.tsx
import React, { useRef } from 'react';
import { motion, useMotionValue, useMotionTemplate, useSpring, useTransform } from 'framer-motion';
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

  // Smooth springs for tilt/parallax
  const rotateX = useSpring(useTransform(mouseY, [0, 600], [5, -5]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [0, 800], [-5, 5]), { stiffness: 100, damping: 30 });

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  function handleMouseLeave() {
    mouseX.set(400); // Reset to center (approx)
    mouseY.set(300);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-emerald-900/30 bg-[#0A1410]/80 backdrop-blur-3xl transition-all duration-500",
        className
      )}
    >
      {/* 🖱️ Interactive Dynamic Spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-700 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              450px circle at ${mouseX}px ${mouseY}px,
              rgba(16, 185, 129, 0.1),
              transparent 80%
            )
          `,
        }}
      />

      {/* 💫 Border Beam Effect */}
      {showBeam && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-xl">
           <div 
             className="absolute inset-0 border border-emerald-500/10 rounded-xl"
             style={{
                maskImage: 'linear-gradient(to right, transparent, black, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black, transparent)',
                animation: 'border-pulse 6s linear infinite'
             }}
           />
        </div>
      )}

      {/* 📦 3D Content Wrapper */}
      <div 
        className="relative z-20 h-full w-full"
        style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}
      >
        {children}
      </div>

      {/* Subtle depth shadow */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] z-[1]" />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes border-pulse {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}} />
    </motion.div>
  );
};
