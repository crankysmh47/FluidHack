import React, { useEffect, useState, Suspense, lazy } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useCarbonStore } from '../store/useCarbonStore';

// Lazy load heavy components for instant initialization
const IngestionStream = lazy(() => import('../components/terminal/IngestionStream').then(m => ({ default: m.IngestionStream })));
const AttributionChart = lazy(() => import('../components/charts/AttributionChart').then(m => ({ default: m.AttributionChart })));
const TransactionFlow = lazy(() => import('../components/flow/TransactionFlow').then(m => ({ default: m.TransactionFlow })));
const PerformanceMetrics = lazy(() => import('../components/metrics/PerformanceMetrics').then(m => ({ default: m.PerformanceMetrics })));
const BottomControlPanel = lazy(() => import('../components/controls/BottomControlPanel').then(m => ({ default: m.BottomControlPanel })));
const AtmosphericMarket = lazy(() => import('../components/market/AtmosphericMarket').then(m => ({ default: m.AtmosphericMarket })));

import { BootOverlay } from '../components/overlays/BootOverlay';
import { PremiumPanel } from '../components/layout/PremiumPanel';
import { ClickSpark } from '../components/layout/ClickSpark';
import { DigitalWeather } from '../components/layout/DigitalWeather';
import { ThermalFilter } from '../components/overlays/ThermalFilter';
import { CursorStars } from '../components/layout/CursorStars';
import { cn } from '../lib/utils';

export const Dashboard: React.FC = () => {
  const { initSimulation, isExecuting, simulationFactor, transactionStep } = useCarbonStore();
  const [isBooted, setIsBooted] = useState(false);
  const [impact, setImpact] = useState(false);
  
  // Mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax Background offsets
  const smoothMouseX = useSpring(mouseX, { stiffness: 40, damping: 30 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 40, damping: 30 });

  const parallaxX = useTransform(smoothMouseX, [0, window.innerWidth], [60, -60]);
  const parallaxY = useTransform(smoothMouseY, [0, window.innerHeight], [60, -60]);

  // Slow parallax for leaves
  const leafParallaxX = useTransform(smoothMouseX, [0, window.innerWidth], [15, -15]);
  const leafParallaxY = useTransform(smoothMouseY, [0, window.innerHeight], [15, -15]);
  const leafParallaxXInverse = useTransform(smoothMouseX, [0, window.innerWidth], [-15, 15]);

  // Elite 3D Tilt Shell
  const rotateY = useSpring(useTransform(mouseX, [0, window.innerWidth], [-2, 2]), { stiffness: 30, damping: 25 });
  const rotateX = useSpring(useTransform(mouseY, [0, window.innerHeight], [2, -2]), { stiffness: 30, damping: 25 });

  // System Shock Impact flash & jitter (PHYSICS BASED)
  const shakeX = useSpring(0, { stiffness: 400, damping: 30 });
  const shakeY = useSpring(0, { stiffness: 400, damping: 30 });

  useEffect(() => {
    let interval: any;
    
    if (isExecuting) {
        setImpact(true);
        interval = setInterval(() => {
            const baseIntensity = 5;
            const stepMultiplier = transactionStep >= 0 ? 1 + (transactionStep * 0.2) : 1;
            const intensity = baseIntensity * stepMultiplier;
            
            shakeX.set((Math.random() - 0.5) * intensity);
            shakeY.set((Math.random() - 0.5) * intensity);
        }, 40);
    } else {
        setImpact(false);
        shakeX.set(0);
        shakeY.set(0);
    }

    return () => {
        if (interval) clearInterval(interval);
    };
  }, [isExecuting, transactionStep, shakeX, shakeY]);

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
        "relative w-screen h-screen overflow-hidden perspective-1000 select-none transition-all duration-300",
        impact ? "brightness-150 scale-[1.005]" : "brightness-100 scale-100"
      )}
      style={{
        // Pale greenish background
        background: 'radial-gradient(ellipse at 30% 20%, #0d2b1e 0%, #071810 40%, #050f0a 100%)',
      }}
    >
      <BootOverlay onComplete={() => setIsBooted(true)} />
      <ClickSpark />
      <CursorStars />
      
      {/* Atmospheric Layers */}
      <div className="absolute inset-0 pointer-events-none">
        <DigitalWeather />
        <ThermalFilter impact={impact} />
        
        {/* Background Layers */}
        <div className="absolute inset-0 z-0">
          {/* Parallax Tactical Grid */}
          <motion.div 
            style={{ x: parallaxX, y: parallaxY }}
            className="absolute inset-[-150px] bg-[linear-gradient(rgba(16,185,129,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.025)_1px,transparent_1px)] bg-[size:80px_80px]"
          />

          {/* Pale green radial glow — ecological ambiance */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.05)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_100%,rgba(5,150,105,0.06)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_50%,rgba(16,185,129,0.04)_0%,transparent_40%)]" />
        </div>

        {/* LEAF DECORATIONS — Ecological background elements */}
        {/* Left leaf */}
        <motion.div
          style={{ x: leafParallaxX, y: leafParallaxY }}
          className="absolute -left-16 bottom-0 w-[340px] h-[460px] pointer-events-none z-[1]"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: isBooted ? 1 : 0, x: isBooted ? 0 : -50 }}
          transition={{ duration: 2, delay: 1.5 }}
        >
          <img 
            src="/leaf_left.png" 
            alt="" 
            className="w-full h-full object-contain opacity-[0.12] mix-blend-luminosity"
            style={{ filter: 'hue-rotate(0deg) saturate(0.8)' }}
          />
        </motion.div>

        {/* Right leaf */}
        <motion.div
          style={{ 
            x: leafParallaxXInverse,
            y: leafParallaxY 
          }}
          className="absolute -right-16 top-0 w-[380px] h-[500px] pointer-events-none z-[1]"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: isBooted ? 1 : 0, x: isBooted ? 0 : 50 }}
          transition={{ duration: 2, delay: 1.8 }}
        >
          <img 
            src="/leaf_right.png" 
            alt="" 
            className="w-full h-full object-contain opacity-[0.10] mix-blend-luminosity"
            style={{ filter: 'hue-rotate(10deg) saturate(0.7)' }}
          />
        </motion.div>

        {/* Floating micro-leaf particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, (i % 2 === 0 ? 10 : -10), 0],
              opacity: [0.03, 0.08, 0.03],
              rotate: [0, (i % 2 === 0 ? 15 : -15), 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 8 + i * 1.5,
              delay: i * 1.2,
              ease: 'easeInOut'
            }}
            className="absolute pointer-events-none"
            style={{
              left: `${10 + i * 18}%`,
              top: `${15 + (i % 3) * 20}%`,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(16,185,129,0.6)">
              <path d="M17 8C8 10 5.9 16.17 3.82 22c4.29-.78 8.4-2.78 11.14-5.5 1.07-1.08 1.29-2.73.3-3.7-.98-.97-2.63-.76-3.7.3C7.96 16.5 6.5 19 6.5 19s-.26-1.21-.23-2.04C6.7 10.89 12.48 8.7 17 8z"/>
            </svg>
          </motion.div>
        ))}
      </div>

      {/* HUD CONTENT CONTAINER */}
      <Suspense fallback={null}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: isBooted ? 1 : 0 }}
          className="relative w-full h-full flex flex-col z-10 p-4 gap-4"
          style={{ 
              rotateX, 
              rotateY, 
              x: shakeX, 
              y: shakeY, 
              transformStyle: "preserve-3d" 
          }}
        >
          {/* ROW 1: Execution Pipeline */}
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={isBooted ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} 
            className="w-full h-[110px] relative z-40"
          >
            <TransactionFlow />
          </motion.div>

          {/* MAIN GRID */}
          <div className="flex-grow flex gap-4 min-h-0 relative z-20" style={{ transformStyle: "preserve-3d" }}>
            {/* SIDEBAR L — Performance Metrics & Agent Status */}
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={isBooted ? { x: 0, opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-[320px] flex flex-col gap-4"
            >
              <PremiumPanel className="flex-grow">
                <PerformanceMetrics />
              </PremiumPanel>
            </motion.div>

            {/* MAIN HUD — Emission Telemetry */}
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

            {/* SIDEBAR R — Split between Ingestion & Market */}
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={isBooted ? { x: 0, opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-[400px] h-full flex flex-col gap-4"
            >
              <PremiumPanel className="flex-[3]">
                <IngestionStream />
              </PremiumPanel>
              <PremiumPanel className="flex-[2]">
                <AtmosphericMarket />
              </PremiumPanel>
            </motion.div>
          </div>

          {/* BOTTOM CONTROLS */}
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={isBooted ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-[120px] relative z-30"
          >
            <BottomControlPanel />
          </motion.div>
        </motion.div>
      </Suspense>

      {/* Elite Tactical Crosshair */}
      <div className="fixed inset-0 pointer-events-none z-[1000] mix-blend-difference overflow-hidden">
        {/* Liquid Aura */}
        <motion.div 
          className="absolute w-64 h-64 bg-[radial-gradient(circle,rgba(16,185,129,0.12)_0%,transparent_70%)] blur-2xl"
          style={{ 
              x: smoothMouseX, 
              y: smoothMouseY,
              translateX: "-50%",
              translateY: "-50%"
          }}
        />

        {/* Crosshair */}
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
