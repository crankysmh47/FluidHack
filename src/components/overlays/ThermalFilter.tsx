// src/components/overlays/ThermalFilter.tsx
import React from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';

export const ThermalFilter: React.FC = () => {
    const { simulationFactor } = useCarbonStore();
    
    // Optimized: Subtler, low-frequency waves that feel more "heat haze" and less "liquefied"
    const baseFreq = 0.003 + (simulationFactor * 0.002);
    
    return (
        <svg className="fixed top-0 left-0 w-0 h-0 pointer-events-none opacity-0">
            <filter id="thermal-stress">
                <feTurbulence 
                    type="fractalNoise" 
                    baseFrequency={`${baseFreq} ${baseFreq * 2}`} 
                    numOctaves="3" 
                    seed="1"
                    result="noise" 
                >
                    <animate 
                        attributeName="seed" 
                        from="1" 
                        to="100" 
                        dur="60s" 
                        repeatCount="indefinite" 
                    />
                </feTurbulence>
                <feDisplacementMap 
                    in="SourceGraphic" 
                    in2="noise" 
                    scale={simulationFactor * 3} 
                    xChannelSelector="R"
                    yChannelSelector="G"
                />
            </filter>
        </svg>
    );
};
