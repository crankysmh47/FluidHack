import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { useCarbonStore } from '../store/useCarbonStore';

// Lazy load heavy components for instant initialization
const IngestionStream = lazy(() => import('../components/terminal/IngestionStream').then(m => ({ default: m.IngestionStream })));
const AttributionChart = lazy(() => import('../components/charts/AttributionChart').then(m => ({ default: m.AttributionChart })));
const TransactionFlow = lazy(() => import('../components/flow/TransactionFlow').then(m => ({ default: m.TransactionFlow })));
const PerformanceMetrics = lazy(() => import('../components/metrics/PerformanceMetrics').then(m => ({ default: m.PerformanceMetrics })));
const BottomControlPanel = lazy(() => import('../components/controls/BottomControlPanel').then(m => ({ default: m.BottomControlPanel })));

import { BootOverlay } from '../components/overlays/BootOverlay';
import { PremiumPanel } from '../components/layout/PremiumPanel';
import { ClickSpark } from '../components/layout/ClickSpark';
import { DigitalWeather } from '../components/layout/DigitalWeather';
import { ThermalFilter } from '../components/overlays/ThermalFilter';
import { cn } from '../lib/utils';

export const Dashboard: React.FC = () => {
  const { initSimulation, isExecuting, simulationFactor } = useCarbonStore();
  const [isBooted, setIsBooted] = useState(false);
  const [impact, setImpact] = useState(false);
  
  // Mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax Background offsets (adjusted for absolute coordinates)
  // FIXED: Using springs for background elements to give them inertia and weight
  const smoothMouseX = useSpring(mouseX, { stiffness: 40, damping: 30 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 40, damping: 30 });

  const parallaxX = useTransform(smoothMouseX, [0, window.innerWidth], [60, -60]);
  const parallaxY = useTransform(smoothMouseY, [0, window.innerHeight], [60, -60]);

  // Elite 3D Tilt Shell
  const rotateY = useSpring(useTransform(mouseX, [0, window.innerWidth], [-2, 2]), { stiffness: 30, damping: 25 });
  const rotateX = useSpring(useTransform(mouseY, [0, window.innerHeight], [2, -2]), { stiffness: 30, damping: 25 });

  // System Shock Impact flash & jitter (PHYSICS BASED)
  const shakeX = useSpring(0, { stiffness: 500, damping: 10 });
  const shakeY = useSpring(0, { stiffness: 500, damping: 10 });

  useEffect(() => {
    if (isExecuting) {
        setImpact(true);
        const interval = setInterval(() => {
            shakeX.set((Math.random() - 0.5) * 8);
            shakeY.set((Math.random() - 0.5) * 8);
        }, 30);
        
        const timer = setTimeout(() => {
            setImpact(false);
            clearInterval(interval);
            shakeX.set(0);
            shakeY.set(0);
        }, 500);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }
  }, [isExecuting, shakeX, shakeY]);

  useEffect(() => {
    initSimulation();
  }, [initSimulation]);

  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    mouseX.set(clientX);
    mouseY.set(clientY);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className={cn(
        "relative w-screen h-screen overflow-hidden bg-[#050A08] perspective-1000 select-none transition-all duration-300",
        impact ? "brightness-150 scale-[1.005]" : "brightness-100 scale-100"
      )}
    >
      <BootOverlay onComplete={() => setIsBooted(true)} />
      <ClickSpark />
      
      {/* 🌌 Atmospheric Layers (Filtered) */}
      <div style={{ filter: "url(#thermal-stress)" }} className="absolute inset-0 pointer-events-none">
        <DigitalWeather />
        <ThermalFilter />
        
        {/* 🌌 Elite Background Layers */}
        <div className="absolute inset-0 z-0">
           {/* Parallax Tactical Grid */}
           <motion.div 
              style={{ x: parallaxX, y: parallaxY }}
              className="absolute inset-[-150px] bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:80px_80px]"
           />
        </div>
      </div>

      {/* 🖼️ HUD CONTENT CONTAINER (Filtered) */}
      <Suspense fallback={null}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: isBooted ? 1 : 0 }}
          className="relative w-full h-full flex flex-col z-10 p-6 gap-6"
          style={{ 
              rotateX, 
              rotateY, 
              x: shakeX, 
              y: shakeY, 
              transformStyle: "preserve-3d", 
              filter: "url(#thermal-stress)" 
          }}
        >
          {/* ROW 1: Execution Pipeline */}
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={isBooted ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} 
            className="w-full h-[120px] relative z-40"
          >
            <TransactionFlow />
          </motion.div>

          {/* MAIN GRID */}
          <div className="flex-grow flex gap-6 min-h-0 relative z-20" style={{ transformStyle: "preserve-3d" }}>
              {/* SIDEBAR L */}
              <motion.div 
                  initial={{ x: -100, opacity: 0 }}
                  animate={isBooted ? { x: 0, opacity: 1 } : {}}
                  transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="w-[340px] flex flex-col gap-6"
              >
                  <PremiumPanel className="flex-grow">
                      <PerformanceMetrics />
                  </PremiumPanel>
              </motion.div>

              {/* MAIN HUD */}
              <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={isBooted ? { scale: 1, opacity: 1 } : {}}
                  transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-grow flex flex-col"
                  style={{ transform: "translateZ(10px)" }}
              >
                  <PremiumPanel className="h-full">
                      <AttributionChart />
                  </PremiumPanel>
              </motion.div>

              {/* SIDEBAR R */}
              <motion.div 
                  initial={{ x: 100, opacity: 0 }}
                  animate={isBooted ? { x: 0, opacity: 1 } : {}}
                  transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-[440px] h-full"
              >
                  <PremiumPanel className="h-full">
                      <IngestionStream />
                  </PremiumPanel>
              </motion.div>
          </div>

          {/* BOTTOM CONTROLS */}
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={isBooted ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-[130px] relative z-30"
          >
            <BottomControlPanel />
          </motion.div>
        </motion.div>
      </Suspense>

      {/* 🖱️ Elite Tactical Crosshair (ABSOLUTE SYNC + LIQUID AURA) */}
      <div className="fixed inset-0 pointer-events-none z-[1000] mix-blend-difference overflow-hidden">
          {/* LIQUID AURA: Smooth lagged follower */}
          <motion.div 
            className="absolute w-64 h-64 bg-[radial-gradient(circle,rgba(16,185,129,0.15)_0%,transparent_70%)] blur-2xl"
            style={{ 
                x: smoothMouseX, 
                y: smoothMouseY,
                translateX: "-50%",
                translateY: "-50%"
            }}
          />

          {/* THE CROSSHAIR: Zero-Lag precision */}
          <motion.div 
            className="absolute w-10 h-10"
            style={{ 
                x: mouseX, 
                y: mouseY,
                translateX: "-50%",
                translateY: "-50%"
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute w-full h-[1px] bg-emerald-400" />
                <div className="absolute h-full w-[1px] bg-emerald-400" />
                <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="absolute w-6 h-6 border border-emerald-400/30 rounded-full"
                />
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,1)]" />
            </div>
          </motion.div>
      </div>
    </div>
  );
};
