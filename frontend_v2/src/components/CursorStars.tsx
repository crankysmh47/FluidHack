import React, { useState, useEffect, useRef, useMemo } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  baseSize: number;
  opacity: number;
  baseOpacity: number;
  delay: number;
}

const CursorStars = () => {
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
  const starIdRef = useRef(0);

  // Generate fixed background stars once
  const backgroundStars = useMemo(() => {
    return Array.from({ length: 700 }, () => {
      const size = Math.random() * 4 + 3;
      return {
        id: starIdRef.current++,
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
        size,
        baseSize: size,
        opacity: Math.random() * 0.4 + 0.3,
        baseOpacity: Math.random() * 0.4 + 0.3,
        delay: Math.random() * 5,
      };
    });
  }, []);

  const [interactiveBgStars, setInteractiveBgStars] = useState<Map<number, Star>>(new Map());

  // Check proximity to background stars and update them
  useEffect(() => {
    const radius = 200;
    const updated = new Map<number, Star>();

    backgroundStars.forEach((star) => {
      const dx = star.x - mousePosition.x;
      const dy = star.y - mousePosition.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        const proximity = 1 - dist / radius;
        const scale = 1 + proximity * 0.8;
        updated.set(star.id, {
          ...star,
          size: star.baseSize * scale,
          opacity: Math.min(0.95, star.baseOpacity + proximity * 0.6),
        });
      } else {
        updated.set(star.id, {
          ...star,
          size: star.baseSize,
          opacity: star.baseOpacity,
        });
      }
    });

    setInteractiveBgStars(updated);
  }, [mousePosition, backgroundStars]);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>
      {/* Background stars (whole page) - react to cursor proximity */}
      {Array.from(interactiveBgStars.values()).map((star) => {
        const isNearCursor = star.size > star.baseSize * 1.05;

        return (
          <div
            key={star.id}
            className={`absolute transition-all duration-500 ease-out ${!isNearCursor ? 'animate-pulse-slow' : ''}`}
            style={{
              left: star.x - star.size / 2,
              top: star.y - star.size / 2,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              animationDelay: `${star.delay}s`,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <path
                d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                fill={isNearCursor ? '#4caf50' : '#2e7d32'}
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

export default CursorStars;
