import React from 'react';
import { cn } from '../../utils/cn';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] bg-purple-900/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[30%] bg-green-900/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Grid Pattern overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 p-6 flex flex-col h-screen max-w-[1600px] mx-auto w-full gap-6">
        {children}
      </div>
    </div>
  );
}
