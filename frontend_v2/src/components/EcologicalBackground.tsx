import React from 'react';

const EcologicalBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Pale greenish background gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 25%, #f1f8e9 50%, #dcedc8 75%, #e8f5e9 100%)',
        }}
      />
      
      {/* Floating leaf SVGs */}
      <div className="absolute top-20 left-10 animate-float-slow opacity-30">
        <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
          <path d="M50 10 C50 10, 80 30, 80 55 C80 75, 65 90, 50 90 C35 90, 20 75, 20 55 C20 30, 50 10, 50 10Z" 
                fill="#2e7d32" opacity="0.6"/>
          <path d="M50 20 L50 80" stroke="#1b5e20" strokeWidth="2" opacity="0.8"/>
          <path d="M50 35 Q40 45, 30 50" stroke="#1b5e20" strokeWidth="1.5" fill="none" opacity="0.6"/>
          <path d="M50 45 Q60 55, 70 60" stroke="#1b5e20" strokeWidth="1.5" fill="none" opacity="0.6"/>
        </svg>
      </div>

      <div className="absolute top-40 right-20 animate-float-medium opacity-25">
        <svg width="45" height="45" viewBox="0 0 100 100" fill="none">
          <path d="M50 10 C50 10, 80 30, 80 55 C80 75, 65 90, 50 90 C35 90, 20 75, 20 55 C20 30, 50 10, 50 10Z" 
                fill="#388e3c" opacity="0.5"/>
          <path d="M50 20 L50 80" stroke="#2e7d32" strokeWidth="2" opacity="0.7"/>
          <path d="M50 40 Q35 50, 25 55" stroke="#2e7d32" strokeWidth="1.5" fill="none" opacity="0.5"/>
        </svg>
      </div>

      <div className="absolute bottom-32 left-1/4 animate-float-fast opacity-35">
        <svg width="50" height="50" viewBox="0 0 100 100" fill="none">
          <path d="M50 5 C50 5, 85 25, 85 55 C85 78, 68 95, 50 95 C32 95, 15 78, 15 55 C15 25, 50 5, 50 5Z" 
                fill="#43a047" opacity="0.6"/>
          <path d="M50 15 L50 85" stroke="#2e7d32" strokeWidth="2.5" opacity="0.8"/>
          <path d="M50 30 Q38 42, 28 48" stroke="#2e7d32" strokeWidth="1.5" fill="none" opacity="0.6"/>
          <path d="M50 50 Q62 62, 72 68" stroke="#2e7d32" strokeWidth="1.5" fill="none" opacity="0.6"/>
          <path d="M50 65 Q40 72, 32 76" stroke="#2e7d32" strokeWidth="1.5" fill="none" opacity="0.6"/>
        </svg>
      </div>

      <div className="absolute top-1/3 right-1/3 animate-float-medium opacity-20">
        <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
          <path d="M50 15 C50 15, 75 35, 75 55 C75 72, 63 85, 50 85 C37 85, 25 72, 25 55 C25 35, 50 15, 50 15Z" 
                fill="#66bb6a" opacity="0.5"/>
          <path d="M50 25 L50 75" stroke="#43a047" strokeWidth="2" opacity="0.7"/>
        </svg>
      </div>

      <div className="absolute bottom-20 right-1/4 animate-float-slow opacity-30">
        <svg width="55" height="55" viewBox="0 0 100 100" fill="none">
          <path d="M50 8 C50 8, 82 28, 82 55 C82 76, 66 92, 50 92 C34 92, 18 76, 18 55 C18 28, 50 8, 50 8Z" 
                fill="#4caf50" opacity="0.6"/>
          <path d="M50 18 L50 82" stroke="#388e3c" strokeWidth="2" opacity="0.8"/>
          <path d="M50 35 Q42 45, 32 52" stroke="#388e3c" strokeWidth="1.5" fill="none" opacity="0.6"/>
          <path d="M50 55 Q60 65, 70 72" stroke="#388e3c" strokeWidth="1.5" fill="none" opacity="0.6"/>
        </svg>
      </div>

      {/* Decorative circles for ecological feel */}
      <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-green-200 opacity-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/3 w-24 h-24 rounded-full bg-emerald-200 opacity-15 animate-pulse-slow" />
      <div className="absolute top-2/3 left-1/2 w-20 h-20 rounded-full bg-lime-200 opacity-10 animate-pulse-slow" />
    </div>
  );
};

export default EcologicalBackground;
