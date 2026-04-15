// src/components/layout/CursorStars.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  delay: number;
}

const STAR_COUNT = 8;

const StarShape = ({ size, opacity, rotation }: { size: number; opacity: number; rotation: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ opacity, transform: `rotate(${rotation}deg)` }}
    fill="#065f46"
    className="drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]"
  >
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);

export const CursorStars: React.FC = () => {
  const [stars, setStars] = useState<Star[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const starIdRef = useRef(0);
  const lastEmitRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      
      const now = Date.now();
      if (now - lastEmitRef.current < 80) return; // Throttle: emit every 80ms
      lastEmitRef.current = now;

      const newStar: Star = {
        id: starIdRef.current++,
        x: e.clientX,
        y: e.clientY,
        size: 6 + Math.random() * 10,
        opacity: 0.6 + Math.random() * 0.4,
        rotation: Math.random() * 360,
        delay: 0,
      };

      setStars(prev => [...prev.slice(-STAR_COUNT + 1), newStar]);
      
      // Auto-remove after 1.5 seconds
      setTimeout(() => {
        setStars(prev => prev.filter(s => s.id !== newStar.id));
      }, 1500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[999] overflow-hidden">
      <AnimatePresence>
        {stars.map((star, index) => {
          const age = index / STAR_COUNT; // 0 = oldest, 1 = newest
          return (
            <motion.div
              key={star.id}
              initial={{ 
                x: star.x - star.size / 2,
                y: star.y - star.size / 2,
                scale: 0,
                opacity: star.opacity,
                rotate: star.rotation
              }}
              animate={{ 
                scale: [0, 1, 0.8],
                opacity: [star.opacity, star.opacity * 0.8, 0],
                y: star.y - star.size / 2 - 20 - (index * 3), // Float upward slightly
                x: star.x - star.size / 2 + (Math.random() - 0.5) * 10,
                rotate: star.rotation + (Math.random() > 0.5 ? 45 : -45),
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                duration: 1.2,
                ease: 'easeOut',
              }}
              className="absolute"
              style={{ position: 'fixed' }}
            >
              <StarShape 
                size={star.size} 
                opacity={1 - age * 0.5} // Fade out older stars
                rotation={0}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
