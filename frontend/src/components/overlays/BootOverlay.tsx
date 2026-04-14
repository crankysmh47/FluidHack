// src/components/overlays/BootOverlay.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SCRAMBLE_CHARS = "ABCDEFGHIKLMNOPQRSTVXYZ0123456789@#%&*";

const useScramble = (text: string, duration = 1500, delay = 500) => {
  const [output, setOutput] = useState("");
  
  useEffect(() => {
    let frame = 0;
    const totalFrames = 60; // Approx frames for the duration
    const interval = (duration / totalFrames);
    
    const timeout = setTimeout(() => {
      const timer = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        
        const scrambled = text.split("").map((char, i) => {
          if (char === " ") return " ";
          if (progress > (i / text.length)) return char;
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }).join("");
        
        setOutput(scrambled);
        
        if (frame >= totalFrames) {
          clearInterval(timer);
          setOutput(text);
        }
      }, interval);
      
      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, duration, delay]);

  return output;
};

interface BootOverlayProps {
  onComplete: () => void;
}

export const BootOverlay: React.FC<BootOverlayProps> = ({ onComplete }) => {
  const [show, setShow] = useState(true);
  const scrambledTitle = useScramble("CARBON SENTINEL", 1200, 400);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 600); // Faster fade out
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#050A08] flex items-center justify-center overflow-hidden"
        >
          {/* Scanline Sweep */}
          <motion.div 
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            transition={{ duration: 1.5, ease: "linear", repeat: 1 }}
            className="absolute left-0 right-0 h-[2px] bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,1)] z-[101]"
          />

          <div className="text-center relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4"
            >
              <h1 className="text-6xl font-black text-emerald-400 tracking-[0.5em] font-mono drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                {scrambledTitle}
              </h1>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-emerald-900 font-mono tracking-[0.2em] text-sm"
            >
              SYSTEM INITIALIZING...
            </motion.div>
          </div>

          {/* Grid Fade In during boot */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
