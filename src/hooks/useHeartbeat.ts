// src/hooks/useHeartbeat.ts
import { useState, useEffect } from 'react';
import { useCarbonStore } from '../store/useCarbonStore';

/**
 * A global synchronization hook that provides a normalized "Heartbeat" (0 -> 1 -> 0)
 * The speed is dynamically linked to the system's simulation factor.
 */
export const useHeartbeat = () => {
  const { simulationFactor, isExecuting } = useCarbonStore();
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    let startTime = Date.now();
    let frameId: number;

    const tick = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        
        // Base frequency + multiplier based on stress levels
        const freq = isExecuting ? 3.0 : (0.5 + (simulationFactor * 0.5));
        
        // Sine wave normalized to 0-1
        const value = (Math.sin((elapsed / 1000) * freq * Math.PI) + 1) / 2;
        setPulse(value);
        
        frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [simulationFactor, isExecuting]);

  return pulse;
};
