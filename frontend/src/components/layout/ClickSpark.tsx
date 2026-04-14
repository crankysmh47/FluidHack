// src/components/layout/ClickSpark.tsx
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Spark {
  id: number;
  x: number;
  y: number;
}

export const ClickSpark: React.FC = () => {
  const [sparks, setSparks] = useState<Spark[]>([]);

  const addSpark = useCallback((e: MouseEvent) => {
    const newSpark = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };
    setSparks((prev) => [...prev, newSpark]);
    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => s.id !== newSpark.id));
    }, 1000);
  }, []);

  React.useEffect(() => {
    window.addEventListener("click", addSpark);
    return () => window.removeEventListener("click", addSpark);
  }, [addSpark]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[2000] overflow-hidden">
      <AnimatePresence>
        {sparks.map((spark) => (
          <motion.div
            key={spark.id}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ opacity: 0, scale: 2 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              left: spark.x,
              top: spark.y,
              transform: "translate(-50%, -50%)",
            }}
            className="w-12 h-12 border border-emerald-400 rounded-full"
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
