// src/components/controls/ForceBuyButton.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Zap, Loader2 } from 'lucide-react';

const Particle = ({ id, x, y, onComplete }: { id: number, x: number; y: number; onComplete: () => void }) => {
    return (
        <motion.div 
            initial={{ x, y, scale: 1, opacity: 1 }}
            animate={{ 
                x: x + (Math.random() - 0.5) * 300, 
                y: y + (Math.random() - 0.5) * 300,
                scale: 0,
                opacity: 0
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onAnimationComplete={onComplete}
            className="absolute w-2 h-2 bg-emerald-400 rounded-full blur-[2px] z-[60]"
        />
    );
};

export const ForceBuyButton: React.FC = () => {
  const { executeTransaction, isExecuting } = useCarbonStore();
  const ref = useRef<HTMLButtonElement>(null);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  // Magnetic Motion
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isExecuting || !ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Pull factor (0.3 of distance)
    x.set((clientX - centerX) * 0.35);
    y.set((clientY - centerY) * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isExecuting) return;
    
    // Burst particles
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
        id: Date.now() + i,
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY
    }));
    setParticles(prev => [...prev, ...newParticles]);
    
    executeTransaction();
  };

  return (
    <div className="relative">
        <AnimatePresence>
            {particles.map(p => (
                <Particle 
                    key={p.id} 
                    id={p.id} 
                    x={p.x} 
                    y={p.y} 
                    onComplete={() => setParticles(prev => prev.filter(item => item.id !== p.id))} 
                />
            ))}
        </AnimatePresence>

        <motion.button
            ref={ref}
            style={{ x: springX, y: springY }}
            whileHover={{ scale: isExecuting ? 1 : 1.1 }}
            whileTap={{ scale: isExecuting ? 1 : 0.9 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            disabled={isExecuting}
            className={`relative group overflow-hidden px-14 py-5 rounded-xl font-black tracking-[0.2em] uppercase transition-all duration-500 flex items-center gap-4 ${
                isExecuting 
                ? 'bg-emerald-900/40 text-emerald-500/40 cursor-not-allowed border border-emerald-500/20' 
                : 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-[#050A08] border-2 border-emerald-300/50 shadow-[0_0_60px_rgba(16,185,129,0.3)]'
            }`}
        >
            {/* Magnetic aura / Glow layer */}
            {!isExecuting && (
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute inset-0 bg-emerald-400 blur-2xl z-0"
                />
            )}

            <div className="relative z-10 flex items-center gap-4">
                {isExecuting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                <Zap className="w-6 h-6 fill-current" strokeWidth={3} />
                )}
                <span className="text-sm font-black">
                {isExecuting ? 'Executing Sequence...' : 'Force Offset Execution / Confirm and Execute'}
                </span>
            </div>
            
            {/* High-Intensity Tactical Shine */}
            {!isExecuting && (
                <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent via-emerald-100/40 to-transparent opacity-60 group-hover:animate-shine" />
            )}
        </motion.button>
    </div>
  );
};
