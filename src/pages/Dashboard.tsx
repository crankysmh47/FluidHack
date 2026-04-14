// src/pages/Dashboard.tsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useCarbonStore } from '../store/useCarbonStore';
import { IngestionStream } from '../components/terminal/IngestionStream';
import { AttributionChart } from '../components/charts/AttributionChart';
import { TransactionFlow } from '../components/flow/TransactionFlow';
import { PerformanceMetrics } from '../components/metrics/PerformanceMetrics';
import { BottomControlPanel } from '../components/controls/BottomControlPanel';
import { BootOverlay } from '../components/overlays/BootOverlay';

export const Dashboard: React.FC = () => {
  const initSimulation = useCarbonStore(state => state.initSimulation);
  const [isBooted, setIsBooted] = useState(false);
  
  // Mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax Background offsets
  const parallaxX = useTransform(mouseX, [-500, 500], [20, -20]);
  const parallaxY = useTransform(mouseY, [-500, 500], [20, -20]);

  // 3D Tilt transforms
  const rotateX = useSpring(useTransform(mouseY, [-500, 500], [3, -3]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-500, 500], [-3, 3]), { stiffness: 100, damping: 30 });

  useEffect(() => {
    initSimulation();
  }, [initSimulation]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set(clientX - innerWidth / 2);
    mouseY.set(clientY - innerHeight / 2);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative w-screen h-screen overflow-hidden bg-[#050A08] bg-noise scanline-effect perspective-1000"
    >
      <BootOverlay onComplete={() => setIsBooted(true)} />

      {/* 🌌 Background Parallax Grid */}
      <motion.div 
        style={{ x: parallaxX, y: parallaxY }}
        className="absolute inset-[-100px] bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none opacity-50 z-0"
      />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isBooted ? 1 : 0 }}
        className="relative w-full h-full flex flex-col z-10"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {/* 🔝 ROW 1: Execution Pipeline */}
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={isBooted ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="absolute top-0 left-0 w-full h-[120px] z-40"
        >
          <TransactionFlow />
        </motion.div>

        {/* 🖼️ MAIN GRID: Sidebars + Chart */}
        <main className="absolute top-[120px] left-0 right-0 bottom-[140px] flex z-10 p-4 gap-4">
          
          {/* LEFT: Branding & Metrics */}
          <motion.div 
            initial={{ x: -200, opacity: 0, rotateY: 15 }}
            animate={isBooted ? { x: 0, opacity: 1, rotateY: 0 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-[320px] h-full hud-panel rounded-xl overflow-hidden shadow-2xl"
          >
            <PerformanceMetrics />
          </motion.div>

          {/* CENTER: Main HUD Visualization */}
          <motion.div 
            initial={{ scaleY: 0, opacity: 0 }}
            animate={isBooted ? { scaleY: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex-grow h-full hud-panel rounded-xl overflow-hidden bg-emerald-950/5 relative"
          >
             {/* Center Panel Light Glare */}
             <motion.div 
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, transparent 100%)',
                  x: useTransform(mouseX, [-500, 500], [-300, 300]),
                  y: useTransform(mouseY, [-500, 500], [-300, 300]),
                }}
                className="absolute inset-0 pointer-events-none z-20"
             />
            <AttributionChart />
          </motion.div>

          {/* RIGHT: Ingestion Terminal */}
          <motion.div 
            initial={{ x: 200, opacity: 0, rotateY: -15 }}
            animate={isBooted ? { x: 0, opacity: 1, rotateY: 0 } : {}}
            transition={{ duration: 1, delay: 0.8 }}
            className="w-[420px] h-full hud-panel rounded-xl overflow-hidden"
          >
            <IngestionStream />
          </motion.div>

        </main>

        {/* 🕹️ ROW 3: Fixed Controls */}
        <motion.div 
          initial={{ y: 200 }}
          animate={isBooted ? { y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="w-full"
        >
          <BottomControlPanel />
        </motion.div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 { perspective: 1000px; }
      `}} />
    </div>
  );
};
