import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useStockStore } from '../../store/useStockStore';

function AICore({ isThinking }: { isThinking: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Dynamic glow and distortion based on AI state
  const color = isThinking ? '#00ccff' : '#aa00ff';
  const distort = isThinking ? 0.6 : 0.4;
  const speed = isThinking ? 4 : 2;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * (isThinking ? 0.5 : 0.2);
      meshRef.current.rotation.x = state.clock.elapsedTime * (isThinking ? 0.3 : 0.1);
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} scale={1.5}>
      <MeshDistortMaterial
        color={color}
        envMapIntensity={1}
        clearcoat={1}
        clearcoatRoughness={0.1}
        metalness={0.9}
        roughness={0.1}
        distort={distort}
        speed={speed}
        emissive={color}
        emissiveIntensity={isThinking ? 0.8 : 0.4}
      />
    </Sphere>
  );
}

export function AIAvatar() {
  const aiDecision = useStockStore(state => state.aiDecision);
  const isThinking = aiDecision?.action === 'ANALYZING';

  return (
    <div className="w-full h-[300px] relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#00ff88" intensity={2} />
        
        <AICore isThinking={isThinking} />
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={!isThinking} autoRotateSpeed={1} />
      </Canvas>
      {/* Decorative grid overlay for the 3D window to make it look like a sci-fi panel */}
      <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.8)_100%)]" />
    </div>
  );
}
