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

  // Parallax Background offsets
  const parallaxX = useTransform(mouseX, [-1000, 1000], [50, -50]);
  const parallaxY = useTransform(mouseY, [-1000, 1000], [50, -50]);

  // Elite 3D Tilt Shell
  const rotateX = useSpring(useTransform(mouseY, [-500, 500], [3, -3]), { stiffness: 40, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-500, 500], [-3, 3]), { stiffness: 40, damping: 20 });

  // System Shock Impact flash
  useEffect(() => {
    if (isExecuting) {
        setImpact(true);
        const timer = setTimeout(() => setImpact(false), 300);
        return () => clearTimeout(timer);
    }
  }, [isExecuting]);

  useEffect(() => {
    initSimulation();
  }, [initSimulation]);

  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    const x = clientX - window.innerWidth / 2;
    const y = clientY - window.innerHeight / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className={cn(
        "relative w-screen h-screen overflow-hidden bg-[#050A08] perspective-1000 select-none cursor-none transition-all duration-300",
        impact ? "brightness-200 scale-[1.01] contrast-150" : "brightness-100 scale-100 contrast-100"
      )}
      style={{ filter: "url(#thermal-stress)" }}
    >
      <BootOverlay onComplete={() => setIsBooted(true)} />
      <ClickSpark />
      <DigitalWeather />
      <ThermalFilter />

      {/* 🖱️ Elite Tactical Crosshair (Zero-Lag Sync) */}
      <motion.div 
        className="fixed top-0 left-0 w-10 h-10 pointer-events-none z-[1000] mix-blend-difference"
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

      {/* 🌌 Elite Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         {/* Parallax Tactical Grid */}
         <motion.div 
            style={{ x: parallaxX, y: parallaxY }}
            className="absolute inset-[-150px] bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:80px_80px]"
         />

         {/* Chromatic Flare Overlay during Impact */}
         <AnimatePresence>
            {impact && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-tr from-red-500 via-transparent to-emerald-500 z-50 mix-blend-overlay"
                />
            )}
         </AnimatePresence>
      </div>

      {/* 🖼️ HUD CONTENT CONTAINER */}
      <Suspense fallback={null}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: isBooted ? 1 : 0 }}
          className={cn(
              "relative w-full h-full flex flex-col z-10 p-6 gap-6",
              isExecuting && "animate-jitter"
          )}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        >
          {/* ROW 1: Execution Pipeline */}
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={isBooted ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
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
                  transition={{ duration: 0.6, delay: 0.4 }}
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
                  transition={{ duration: 0.8, delay: 0.6 }}
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
                  transition={{ duration: 0.6, delay: 0.5 }}
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
            transition={{ duration: 0.7, delay: 0.8 }}
            className="w-full h-[130px] relative z-30"
          >
            <BottomControlPanel />
          </motion.div>
        </motion.div>
      </Suspense>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes jitter {
          0% { transform: translate(0,0); }
          25% { transform: translate(1px, -1px); }
          50% { transform: translate(-1px, 1px); }
          75% { transform: translate(1px, 1px); }
          100% { transform: translate(0,0); }
        }
        .animate-jitter { animation: jitter 0.1s infinite; }
      `}} />
    </div>
  );
};
