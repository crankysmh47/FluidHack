import React, { useState, useEffect, useRef } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
}

const CursorStars = () => {
  const [stars, setStars] = useState<Star[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const starIdRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Add a new star at mouse position
      const newStar: Star = {
        id: starIdRef.current++,
        x: e.clientX + (Math.random() - 0.5) * 40,
        y: e.clientY + (Math.random() - 0.5) * 40,
        size: Math.random() * 8 + 4,
        opacity: Math.random() * 0.5 + 0.5,
        delay: Math.random() * 0.3,
      };

      setStars(prev => [...prev.slice(-15), newStar]); // Keep max 15 stars
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Remove old stars
  useEffect(() => {
    const interval = setInterval(() => {
      setStars(prev => prev.slice(-10)); // Remove oldest stars
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Main cursor star */}
      <div
        className="absolute transition-all duration-100 ease-out"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
            fill="#1b5e20"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Trailing stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute animate-star-fade pointer-events-none"
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
              fill="#2e7d32"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default CursorStars;
