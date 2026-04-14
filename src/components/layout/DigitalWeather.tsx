// src/components/layout/DigitalWeather.tsx
import React, { useRef, useEffect } from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';

interface Particle {
  x: number;
  y: number;
  z: number;
  speed: number;
  size: number;
  opacity: number;
}

export const DigitalWeather: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { simulationFactor, isExecuting } = useCarbonStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    const particleCount = 100;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          z: Math.random() * 2,
          speed: 0.2 + Math.random() * 1.5,
          size: 1 + Math.random() * 2,
          opacity: 0.1 + Math.random() * 0.4
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const velocityScale = 1 + (simulationFactor * 0.5) + (isExecuting ? 4 : 0);
      
      particles.forEach(p => {
        p.y -= p.speed * velocityScale;
        p.x += Math.sin(p.y / 50) * 0.5; // Subtle drift

        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${p.opacity})`;
        ctx.fill();
        
        // Draw trailing lines if executing (Streamers)
        if (isExecuting) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y + p.speed * 20);
          ctx.strokeStyle = `rgba(16, 185, 129, ${p.opacity * 0.5})`;
          ctx.stroke();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [simulationFactor, isExecuting]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-1 overflow-hidden" 
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
