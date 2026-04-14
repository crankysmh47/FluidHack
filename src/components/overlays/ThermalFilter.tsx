// src/components/overlays/ThermalFilter.tsx
import React from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';

export const ThermalFilter: React.FC = () => {
    const { simulationFactor } = useCarbonStore();
    
    // Scale turbulence based on simulation factor (0.005 -> 0.05)
    const baseFreq = 0.005 + (simulationFactor * 0.01);
    
    return (
        <svg className="fixed top-0 left-0 w-0 h-0 pointer-events-none opacity-0">
            <filter id="thermal-stress">
                <feTurbulence 
                    type="fractalNoise" 
                    baseFrequency={baseFreq} 
                    numOctaves="1" 
                    result="noise" 
                >
                    <animate 
                        attributeName="baseFrequency" 
                        values={`${baseFreq};${baseFreq * 1.5};${baseFreq}`} 
                        dur="10s" 
                        repeatCount="indefinite" 
                    />
                </feTurbulence>
                <feDisplacementMap 
                    in="SourceGraphic" 
                    in2="noise" 
                    scale={simulationFactor * 5} 
                />
            </filter>
        </svg>
    );
};
