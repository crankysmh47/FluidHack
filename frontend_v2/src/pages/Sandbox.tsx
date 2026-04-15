import React, { useEffect } from 'react';
import { useCarbonStore } from '../store/useCarbonStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000`;

const Sandbox: React.FC = () => {
  const { user, forceBuy, uiMessage, setUiMessage, accelerateAudit } = useCarbonStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  const handleSimulate = async (event: string) => {
    try {
      await axios.post(`${API_BASE}/demo/trigger-event`, { event });
      setUiMessage(`Simulation Triggered: ${event}. Agent will detect in next cycle.`, "success");
    } catch (err) {
      setUiMessage("Failed to trigger simulation.", "error");
    }
  };

  return (
    <div className="bg-background text-on-background font-body selection:bg-primary-fixed min-h-screen pb-32">
      {/* Toast Notification */}
      {uiMessage && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-sm font-bold shadow-xl z-50 transition-all ${uiMessage.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {uiMessage.text}
        </div>
      )}

      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-slate-50/70 backdrop-blur-xl flex justify-between items-center px-6 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden">
            <span className="font-headline font-bold text-lg text-primary-container">{user?.name.charAt(0).toUpperCase()}</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight font-headline text-emerald-600">Carbon Sentinel Sandbox</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-emerald-600 text-2xl hover:opacity-80 transition-opacity active:scale-95 duration-200 ease-out">monitoring</button>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto min-h-screen">
        {/* Header Section */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <span className="font-label text-xs uppercase tracking-[0.2em] text-primary mb-2 block">Environmental Testing Ground</span>
              <h2 className="font-headline text-5xl font-light leading-tight text-on-background">Demo Sandbox</h2>
            </div>
            <div className="bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant/10">
              <p className="font-label text-xs text-on-surface-variant mb-1">NETWORK STATUS</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-headline font-semibold text-primary">Carbon-Testnet-04</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Layout for Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Testnet Faucet Card */}
          <div className="md:col-span-5 bg-surface-container-lowest biological-shadow rounded-xl p-8 flex flex-col justify-between border border-outline-variant/5">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">water_drop</span>
                <h3 className="font-headline text-2xl font-light">Testnet Faucet</h3>
              </div>
              <p className="text-on-surface-variant font-body leading-relaxed mb-8">
                Initialize your environment with simulated assets. These tokens hold no real-world value and are exclusively for sandbox validation.
              </p>
            </div>
            <button 
              onClick={() => {
                setUiMessage("Simulated Faucet: 10,000 USDC added to your environment balance.", "success");
              }}
              className="clinical-gradient w-full py-5 rounded-md text-on-primary font-headline font-bold text-lg hover:brightness-110 transition-all active:scale-95 duration-200"
            >
              Get 10,000 USDC
            </button>
          </div>

          {/* Environment Simulators Card */}
          <div className="md:col-span-7 bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
            <div className="flex items-center gap-4 mb-8">
              <span className="material-symbols-outlined text-primary text-3xl">bolt</span>
              <h3 className="font-headline text-2xl font-light">Grid Dynamics Simulator</h3>
            </div>
            <div className="space-y-4">
              <button 
                onClick={() => handleSimulate('surge')}
                className="w-full flex items-center justify-between p-4 bg-surface rounded-xl border border-outline/10 hover:border-primary/50 transition-all hover:bg-primary/5 group"
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-amber-500">warning</span>
                  <div className="text-left">
                    <span className="block font-headline font-bold text-on-surface">Simulate Grid Surge</span>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">Trigger +30% Carbon Intensity Spike</span>
                  </div>
                </div>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>

              <button 
                onClick={() => handleSimulate('peak')}
                className="w-full flex items-center justify-between p-4 bg-surface rounded-xl border border-outline/10 hover:border-primary/50 transition-all hover:bg-primary/5 group"
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-red-500">trending_up</span>
                  <div className="text-left">
                    <span className="block font-headline font-bold text-on-surface">Simulate Stadium Peak Load</span>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">Simulate Floodlights + Max Crowd Load</span>
                  </div>
                </div>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>

              <button 
                onClick={() => handleSimulate('clear')}
                className="w-full flex items-center justify-between p-4 bg-surface rounded-xl border border-outline/10 hover:border-primary/50 transition-all hover:bg-primary/5 group"
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                  <div className="text-left">
                    <span className="block font-headline font-bold text-on-surface">Reset to Baseline</span>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">Return to real-world grid telemetry</span>
                  </div>
                </div>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Sentinel Lifecycle Control Card */}
          <div className="md:col-span-12 bg-surface-container-lowest biological-shadow rounded-xl p-8 mb-8 border border-outline-variant/5">
            <div className="flex items-center gap-4 mb-6">
              <span className="material-symbols-outlined text-emerald-600 text-3xl">avg_time</span>
              <h3 className="font-headline text-2xl font-light text-on-surface">Sentinel Lifecycle Control</h3>
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <p className="text-on-surface-variant font-body leading-relaxed flex-1">
                Manually accelerate the autonomous audit cycle. This 'time-warp' allows you to demonstrate governance settlements without waiting for real-world intervals.
              </p>
              <button 
                onClick={() => {
                  accelerateAudit(1);
                  setUiMessage("Time-Warp active: Sentinel Audit accelerated by 1 minute.", "success");
                }}
                className="bg-emerald-600 text-white px-8 py-4 rounded-md font-headline font-bold hover:brightness-110 transition-all active:scale-95 shadow-lg whitespace-nowrap"
              >
                Fast Forward Audit (+1m)
              </button>
            </div>
          </div>

          {/* Transaction Simulator Card */}
          <div className="md:col-span-12 bg-surface-container-lowest biological-shadow rounded-xl overflow-hidden border border-outline-variant/5">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 border-r border-outline-variant/10">
                <div className="flex items-center gap-4 mb-6">
                  <span className="material-symbols-outlined text-primary text-3xl">receipt_long</span>
                  <h3 className="font-headline text-2xl font-light">Transaction Simulator</h3>
                </div>
                <p className="text-on-surface-variant mb-10 max-w-sm">
                  Stress test the sentinel agent's response time by simulating high-frequency autonomous settlements.
                </p>
                <div className="mb-10">
                  <div className="flex justify-between mb-4">
                    <span className="font-label text-xs uppercase text-on-surface-variant">Time Progression</span>
                    <span className="font-headline text-primary font-bold">14.5x Real-time</span>
                  </div>
                  <input className="w-full h-1 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary" type="range" />
                  <div className="flex justify-between mt-2 font-label text-[10px] text-outline">
                    <span>1X</span>
                    <span>MAX (50X)</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    forceBuy(5.0);
                    setUiMessage("Test transaction sent. The AI agent will process it.", "success");
                  }}
                  className="clinical-gradient w-full py-5 rounded-md text-on-primary font-headline font-bold text-lg hover:brightness-110 transition-all active:scale-95 duration-200 uppercase tracking-widest"
                >
                  Fire Autonomous Test Transaction
                </button>
              </div>
              <div className="bg-surface-container-low p-10 flex flex-col justify-center items-center relative">
                <div className="absolute inset-0 opacity-10 pointer-events-none grayscale overflow-hidden">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="abstract satellite view of city infrastructure" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYpa24IVedjVgE6L5nsmwWOfNCLWNbaqZpY5dQO4efDd-AL3rprjz-5p0LChJ7HSZjN3JQ61iW4hzqyQlFqav7Q5mTi2J9xiTqIqI4D3dx7hxWkSZ5sshLLbTN8w84YW2euOqf5QYDd_5zYGINQVXuvXX4G5no7iSn3LEu54LfPQ3X0AQItS7HWYHef2iYJmRfjpZqnIXIiEoTs3xmQ6ltENHHpDOH974Qi4kpz3_otN5klYv_G7UPcG88ZntUU5J0yPxADlYzrA8" 
                  />
                </div>
                <div className="text-center z-10">
                  <div className="text-8xl font-headline font-thin text-primary mb-2">0.02s</div>
                  <p className="font-label uppercase tracking-widest text-on-surface-variant text-sm">Target Latency</p>
                </div>
                <div className="mt-12 grid grid-cols-3 gap-6 w-full max-w-xs z-10">
                  <div className="text-center">
                    <div className="text-xl font-headline font-bold text-on-surface">1.2k</div>
                    <div className="text-[9px] uppercase tracking-tighter text-outline">TPS Peak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-headline font-bold text-on-surface">99.9%</div>
                    <div className="text-[9px] uppercase tracking-tighter text-outline">Settled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-headline font-bold text-on-surface">0.0</div>
                    <div className="text-[9px] uppercase tracking-tighter text-outline">Gas Drift</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-8 pt-4 bg-white/80 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.04)] rounded-t-[2rem]">
        <a onClick={() => navigate('/dashboard')} className="cursor-pointer flex flex-col items-center justify-center text-slate-400 opacity-60 hover:text-emerald-500 transition-colors">
          <span className="material-symbols-outlined mb-1">dashboard</span>
          <span className="font-headline text-[10px] tracking-wide uppercase">Overview</span>
        </a>
        <a onClick={() => navigate('/markets')} className="cursor-pointer flex flex-col items-center justify-center text-slate-400 opacity-60 hover:text-emerald-500 transition-colors">
          <span className="material-symbols-outlined mb-1">eco</span>
          <span className="font-headline text-[10px] tracking-wide uppercase">Markets</span>
        </a>
        <a className="flex flex-col items-center justify-center text-emerald-600 after:content-[''] after:w-1 after:h-1 after:bg-emerald-500 after:rounded-full after:mt-1 transform translate-y-[-2px] duration-300 pointer-events-none">
          <span className="material-symbols-outlined mb-1">psychology</span>
          <span className="font-headline text-[10px] tracking-wide uppercase">Agent</span>
        </a>
        <a onClick={() => navigate('/history')} className="cursor-pointer flex flex-col items-center justify-center text-slate-400 opacity-60 hover:text-emerald-500 transition-colors">
          <span className="material-symbols-outlined mb-1">receipt_long</span>
          <span className="font-headline text-[10px] tracking-wide uppercase">History</span>
        </a>
      </nav>
    </div>
  );
};

export default Sandbox;
