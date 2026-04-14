// src/pages/Dashboard.tsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useMotionTemplate } from 'framer-motion';
import { useCarbonStore } from '../store/useCarbonStore';
import { IngestionStream } from '../components/terminal/IngestionStream';
import { AttributionChart } from '../components/charts/AttributionChart';
import { TransactionFlow } from '../components/flow/TransactionFlow';
import { PerformanceMetrics } from '../components/metrics/PerformanceMetrics';
import { BottomControlPanel } from '../components/controls/BottomControlPanel';
import { BootOverlay } from '../components/overlays/BootOverlay';
import { PremiumPanel } from '../components/layout/PremiumPanel';
import { ClickSpark } from '../components/layout/ClickSpark';
import { cn } from '../lib/utils';

export const Dashboard: React.FC = () => {
  const { initSimulation, isExecuting } = useCarbonStore();
  const [isBooted, setIsBooted] = useState(false);
  const [impact, setImpact] = useState(false);
  
  // Trigger system shock when execution starts
  useEffect(() => {
    if (isExecuting) {
        setImpact(true);
        const timer = setTimeout(() => setImpact(false), 500);
        return () => clearTimeout(timer);
    }
  }, [isExecuting]);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax Background offsets
  const parallaxX = useTransform(mouseX, [-1000, 1000], [40, -40]);
  const parallaxY = useTransform(mouseY, [-1000, 1000], [40, -40]);

  // 3D Tilt transforms for the whole layout
  const rotateX = useSpring(useTransform(mouseY, [-500, 500], [2, -2]), { stiffness: 50, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-500, 500], [-2, 2]), { stiffness: 50, damping: 30 });

  useEffect(() => {
    initSimulation();
  }, [initSimulation]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    mouseX.set(clientX - window.innerWidth / 2);
    mouseY.set(clientY - window.innerHeight / 2);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className={cn(
        "relative w-screen h-screen overflow-hidden bg-[#050A08] perspective-1000 select-none cursor-none transition-all duration-300",
        impact ? "brightness-150 scale-[1.005] rotate-1" : "brightness-100 scale-100 rotate-0"
      )}
    >
      <BootOverlay onComplete={() => setIsBooted(true)} />
      <ClickSpark />

      {/* 🖱️ Global Tactical Crosshair Cursor */}
      <motion.div 
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[1000] mix-blend-difference"
        style={{ 
            x: useSpring(mouseX, { stiffness: 400, damping: 30 }), 
            y: useSpring(mouseY, { stiffness: 400, damping: 30 }),
            translateX: "-50%",
            translateY: "-50%"
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute w-full h-[1px] bg-emerald-400/80" />
            <div className="absolute h-full w-[1px] bg-emerald-400/80" />
            <div className="w-1 h-1 bg-emerald-400 rounded-full" />
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute w-4 h-4 border border-emerald-400/40 rounded-sm"
            />
        </div>
      </motion.div>

      {/* 🌌 Atmospheric Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         {/* Global Dynamic Spotlight */}
         <motion.div 
            className="absolute inset-0 opacity-40 transition-opacity duration-1000"
            style={{
                background: useMotionTemplate`radial-gradient(1000px circle at ${useTransform(mouseX, x => x + window.innerWidth/2)}px ${useTransform(mouseY, y => y + window.innerHeight/2)}px, rgba(16, 185, 129, 0.08), transparent 80%)`
            }}
         />
         
         {/* Parallax Grid */}
         <motion.div 
            style={{ x: parallaxX, y: parallaxY }}
            className="absolute inset-[-100px] bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"
         />

         {/* Premium Grain Overlay */}
         <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isBooted ? 1 : 0 }}
        className="relative w-full h-full flex flex-col z-10 p-6 gap-6"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {/* 🔝 ROW 1: Execution Pipeline */}
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={isBooted ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
          className="w-full h-[110px]"
        >
          <TransactionFlow />
        </motion.div>

        {/* 🖼️ MAIN GRID: Sidebars + Chart */}
        <div className="flex-grow flex gap-6 min-h-0">
          
          {/* LEFT: Branding & Metrics */}
          <motion.div 
            initial={{ x: -200, opacity: 0 }}
            animate={isBooted ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.33, 1, 0.68, 1] }}
            className="w-[320px] flex flex-col gap-6"
          >
            <PremiumPanel className="flex-grow">
              <PerformanceMetrics />
            </PremiumPanel>
          </motion.div>

          {/* CENTER: Main HUD Visualization */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={isBooted ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 1.5, delay: 0.8, ease: [0.33, 1, 0.68, 1] }}
            className="flex-grow flex flex-col"
          >
            <PremiumPanel className="h-full">
               <AttributionChart />
            </PremiumPanel>
          </motion.div>

          {/* RIGHT: Ingestion Terminal */}
          <motion.div 
            initial={{ x: 200, opacity: 0 }}
            animate={isBooted ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.7, ease: [0.33, 1, 0.68, 1] }}
            className="w-[420px] h-full"
          >
            <PremiumPanel className="h-full">
              <IngestionStream />
            </PremiumPanel>
          </motion.div>

        </div>

        {/* 🕹️ ROW 3: Fixed Controls */}
        <motion.div 
          initial={{ y: 200, opacity: 0 }}
          animate={isBooted ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.2, ease: [0.33, 1, 0.68, 1] }}
          className="w-full h-[120px]"
        >
          <BottomControlPanel />
        </motion.div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .scanline-effect::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, transparent, rgba(16, 185, 129, 0.05), transparent);
            animation: scanline 8s linear infinite;
            pointer-events: none;
            z-index: 100;
        }
      `}} />
    </div>
  );
};
