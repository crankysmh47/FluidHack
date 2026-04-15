import React, { useEffect, useState } from 'react';
import { useCarbonStore } from '../store/useCarbonStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import EcologicalBackground from '../components/EcologicalBackground';
import CursorStars from '../components/CursorStars';
import pslLogo from '../assets/psl_giants.png';

const API_BASE = window.location.port === '5173' || window.location.port === '3000' ? `http://${window.location.hostname}:5000` : '';

const Sandbox: React.FC = () => {
  const { user, forceBuy, uiMessage, setUiMessage, accelerateAudit, claimFaucet, triggerAgentCycle } = useCarbonStore();
  const navigate = useNavigate();
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();

  const [isFaucetLoading, setIsFaucetLoading] = useState(false);

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

  const handleFaucetClaim = async () => {
    setIsFaucetLoading(true);
    await claimFaucet();
    setIsFaucetLoading(false);
  };

  return (
    <div className="bg-transparent text-on-background font-body selection:bg-primary-fixed min-h-screen pb-32 relative">
      {/* Ecological Background */}
      <EcologicalBackground />
      
      {/* Cursor Stars */}
      <CursorStars />
      
      {/* Toast Notification */}
      {uiMessage && (
        <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 px-8 py-4 rounded-3xl text-sm font-black shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-50 transition-all border ${uiMessage.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-red-500 border-red-400 text-white'}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">{uiMessage.type === 'success' ? 'check_circle' : 'error'}</span>
            {uiMessage.text}
          </div>
        </div>
      )}

      {/* TopAppBar - Premium Glassmorphism */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-emerald-500/10 flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-5">
          <div className="relative group cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img 
              src={pslLogo} 
              alt="PSL Giants" 
              className="w-12 h-12 object-contain relative z-10 drop-shadow-[0_5px_15px_rgba(16,185,129,0.2)]" 
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black font-headline text-emerald-950 dark:text-emerald-50 tracking-tight leading-none">
              Sentinel Sandbox
            </h1>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mt-1">
              Simulation Environment
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-5 py-2 rounded-2xl bg-amber-500 text-white text-[10px] uppercase font-black tracking-widest shadow-lg shadow-amber-500/20 border border-amber-400">
            Sandbox Active
          </div>
          {/* Restored Wallet Button */}
          <button 
            onClick={() => open()}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-emerald-500/10 px-4 py-2 rounded-2xl text-[10px] uppercase font-black tracking-widest hover:border-emerald-500/30 transition-all"
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400'} animate-pulse`}></span>
            {isConnected ? 'Wallet' : 'Connect'}
          </button>
          <button className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all">
            <span className="material-symbols-outlined text-xl">monitoring</span>
          </button>
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
              disabled={isFaucetLoading}
              onClick={handleFaucetClaim}
              className="clinical-gradient flex items-center justify-center gap-3 w-full py-5 rounded-md text-on-primary font-headline font-bold text-lg hover:brightness-110 transition-all active:scale-95 duration-200 disabled:opacity-70 shadow-lg"
            >
              <span className={`material-symbols-outlined ${isFaucetLoading ? 'animate-spin' : ''}`}>
                {isFaucetLoading ? 'progress_activity' : 'account_balance_wallet'}
              </span>
              {isFaucetLoading ? 'Claiming 10,000 USD...' : 'Get 10,000 USD'}
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
                  <span className="material-symbols-outlined text-primary text-3xl">cell_tower</span>
                  <h3 className="font-headline text-2xl font-light">IoT Telemetry Streaming</h3>
                </div>
                <p className="text-on-surface-variant mb-10 max-w-sm">
                  Stress test the Sentinel Agent's ability to ingest high-frequency stadium smart-meter data, evaluating Live DefiLlama pools to execute <b>thought-out micro-offsets</b> continuously.
                </p>
                <div className="mb-10">
                  <div className="flex justify-between mb-4">
                    <span className="font-label text-xs uppercase text-on-surface-variant">Data Stream Rate</span>
                    <span className="font-headline text-primary font-bold">120 msg/sec</span>
                  </div>
                  <input className="w-full h-1 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary border-none outline-none" type="range" />
                  <div className="flex justify-between mt-2 font-label text-[10px] text-outline px-1">
                    <span>Low IoT Load</span>
                    <span>Stadium Peak</span>
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    setUiMessage("Streaming Live Venue Data. Sentinel Agent evaluating optimal routing...", "success");
                    await axios.post(`${API_BASE}/demo/rapid-fire-sequence`);
                    setTimeout(() => { triggerAgentCycle(); }, 3000);
                    setTimeout(() => { triggerAgentCycle(); }, 8000);
                    setTimeout(() => { triggerAgentCycle(); }, 14000);
                  }}
                  className="clinical-gradient w-full py-5 rounded-md text-on-primary font-headline font-bold text-lg hover:brightness-110 transition-all active:scale-95 duration-200 uppercase tracking-widest"
                >
                  Stream Live Telemetry
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
