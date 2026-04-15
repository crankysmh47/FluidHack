import React, { useEffect, useState } from 'react';
import { useCarbonStore } from '../store/useCarbonStore';
import { useNavigate } from 'react-router-dom';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import EcologicalBackground from '../components/EcologicalBackground';
import CursorStars from '../components/CursorStars';

const Markets: React.FC = () => {
  const { user, logout, isDemoMode, toggleDemoMode, liveFeed, fetchLiveFeed, forceBuy, isLoading, uiMessage } = useCarbonStore();
  const navigate = useNavigate();
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();

  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [buyStatus, setBuyStatus] = useState<string>('Preparing');
  const [successToastId, setSuccessToastId] = useState<string | null>(null);

  const handleQuickBuy = async (tokenId: string) => {
    setBuyingId(tokenId);
    setBuyStatus('Authenticating');
    
    // Simulate stages for UX meaningfulness
    const stages = ['Encrypting Payloads', 'Proof Generation', 'Broadcasting Chain', 'Awaiting Confirm'];
    let stageIdx = 0;
    const interval = setInterval(() => {
      if (stageIdx < stages.length) {
        setBuyStatus(stages[stageIdx]);
        stageIdx++;
      }
    }, 2000);

    try {
      await forceBuy(1.0);
      
      // On success, show the green success toast locally for this token card
      setSuccessToastId(tokenId);
      setTimeout(() => setSuccessToastId(null), 4000);
    } finally {
      clearInterval(interval);
      setBuyingId(null);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchLiveFeed();
    const interval = setInterval(() => fetchLiveFeed(), 10000);
    return () => clearInterval(interval);
  }, [user, navigate, fetchLiveFeed]);

  const tokens = [
    { id: 'bct', name: 'Base Carbon Tonne', icon: 'eco', color: 'text-primary' },
    { id: 'mco2', name: 'Moss Carbon Credit', icon: 'cloud_done', color: 'text-emerald-500' },
    { id: 'nct', name: 'Nature Carbon Tonne', icon: 'forest', color: 'text-amber-600' },
    { id: 'ubo', name: 'Universal Basic Offset', icon: 'waves', color: 'text-blue-500' },
    
    // Additional assets
    { id: 'c3t', name: 'C3 Carbon Network', icon: 'park', color: 'text-lime-500' },
    { id: 'klima', name: 'KlimaDAO token', icon: 'ac_unit', color: 'text-teal-400' },
    { id: 'crisp', name: 'Crisp Carbon', icon: 'compost', color: 'text-orange-500' },
    { id: 'regen', name: 'Regen Network', icon: 'grass', color: 'text-green-600' }
  ];

  return (
    <div className="bg-transparent text-on-surface min-h-screen pb-32 relative">
      {/* Ecological Background */}
      <EcologicalBackground />

      {/* Cursor Stars */}
      <CursorStars />

      {/* Toast Notification (from Store) */}
      {uiMessage && (
        <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 px-8 py-4 rounded-3xl text-sm font-black shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-50 transition-all border ${uiMessage.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-red-500 border-red-400 text-white'}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">{uiMessage.type === 'success' ? 'check_circle' : 'error'}</span>
            {uiMessage.text}
          </div>
        </div>
      )}
      {/* TopAppBar - Premium Glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-emerald-500/10 flex justify-between items-center w-full px-6 py-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all group"
          >
            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">arrow_back</span>
          </button>
          
          <div className="h-8 w-px bg-emerald-500/10 mx-1"></div>

          <div className="flex items-center gap-3">
            <img 
              src="/psl_giants.png" 
              alt="PSL Giants" 
              className="w-10 h-10 object-contain drop-shadow-[0_5px_15px_rgba(16,185,129,0.2)]" 
            />
            <div className="flex flex-col">
              <span className="font-headline font-black text-emerald-950 dark:text-emerald-50 tracking-tight text-xl leading-none">
                Carbon Markets
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mt-1">
                PSL Sentinel Protocol
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button 
            onClick={toggleDemoMode}
            className={`px-4 py-1.5 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all border shadow-sm ${isDemoMode ? 'bg-amber-500 text-white border-amber-400' : 'bg-slate-100 dark:bg-slate-800 border-emerald-500/10 text-slate-500'}`}
          >
            {isDemoMode ? 'Sandbox' : 'Live'}
          </button>
          {/* Restored Wallet Button */}
          <button 
            onClick={() => open()}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-emerald-500/10 px-4 py-1.5 rounded-2xl text-[10px] uppercase font-black tracking-widest hover:border-emerald-500/30 transition-all"
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400'} animate-pulse`}></span>
            {isConnected ? 'Wallet' : 'Connect'}
          </button>
          <button 
            onClick={() => { logout(); navigate('/'); }}
            className="px-4 py-1.5 rounded-2xl text-[10px] uppercase font-black tracking-widest text-red-500 hover:bg-red-500/5 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-headline font-extrabold mb-2">Atmospheric Assets</h1>
          <p className="text-on-surface-variant text-sm max-w-md">
            Direct access to verified carbon retirement pools. Select a protocol to execute a manual offset or view liquidity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tokens.map((token) => {
            const data = liveFeed?.crypto?.[token.id] || { price: 0, change: 0, tvl: 0, chain: 'Polygon' };
            const isMock = isDemoMode || !liveFeed?.crypto;
            
            // Mock data for the newly added tokens
            let price = data.price;
            let tvl = data.tvl;
            let change = data.change;
            
            if (isMock) {
              if (token.id === 'bct') { price = 18.42; tvl = 500000; change = 2.4; }
              else if (token.id === 'mco2') { price = 12.15; tvl = 120000; change = -0.8; }
              else if (token.id === 'nct') { price = 22.10; tvl = 85000; change = 1.2; }
              else if (token.id === 'ubo') { price = 4.50; tvl = 32000; change = 5.4; }
              else if (token.id === 'c3t') { price = 5.60; tvl = 45000; change = 3.1; }
              else if (token.id === 'klima') { price = 2.45; tvl = 1500000; change = 8.5; }
              else if (token.id === 'crisp') { price = 8.90; tvl = 21000; change = -1.5; }
              else if (token.id === 'regen') { price = 15.20; tvl = 62000; change = 0.5; }
            }

            const successActive = successToastId === token.id;
            
            return (
              <div key={token.id} className={`bg-surface-container-low border rounded-3xl p-6 flex flex-col justify-between hover:border-primary/30 transition-all group relative overflow-hidden ${successActive ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-outline-variant/10'}`}>
                
                {/* Embedded Success Toast inside Card */}
                <div className={`absolute top-0 left-0 w-full bg-emerald-500 text-white font-bold text-xs py-1.5 flex items-center justify-center gap-1 transition-transform duration-300 ${successActive ? 'translate-y-0' : '-translate-y-full'}`}>
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Quick Buy Successful
                </div>

                <div className="flex justify-between items-start mb-6 mt-2">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center ${token.color}`}>
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{token.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-lg">{token.id.toUpperCase()}</h3>
                      <p className="text-xs text-on-surface-variant">{token.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-headline font-bold text-primary">
                      ${typeof price === 'number' ? price.toFixed(2) : "0.00"}
                    </p>
                    <p className={`text-[10px] font-bold flex items-center justify-end ${(change ?? 0) >= 0 ? 'text-emerald-500' : 'text-error'}`}>
                      <span className="material-symbols-outlined text-xs">{(change ?? 0) >= 0 ? 'arrow_drop_up' : 'arrow_drop_down'}</span>
                      {Math.abs(change ?? 0).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface-container/30 rounded-2xl p-3 border border-outline-variant/5">
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Liquidity (TVL)</p>
                    <p className="font-headline font-bold text-sm text-on-surface">
                      ${tvl?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="bg-surface-container/30 rounded-2xl p-3 border border-outline-variant/5">
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Native Chain</p>
                    <div className="flex items-center gap-1">
                       <span className="material-symbols-outlined text-xs text-primary">link</span>
                       <p className="font-headline font-bold text-sm text-on-surface">{data.chain || 'Polygon'}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleQuickBuy(token.id)}
                  disabled={isLoading || successActive}
                  className={`w-full py-4 rounded-2xl font-headline font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-80 shadow-lg ${successActive ? 'bg-emerald-500 text-white' : buyingId === token.id ? 'bg-primary text-white scale-[1.02]' : 'bg-primary-container text-on-primary-container hover:bg-primary group-hover:text-white group-hover:bg-primary'}`}
                >
                  {successActive ? (
                    <>
                      <span className="material-symbols-outlined text-sm">check</span>
                      Purchased
                    </>
                  ) : (
                    <>
                      <span className={`material-symbols-outlined text-sm ${buyingId === token.id ? 'animate-spin' : ''}`}>
                        {buyingId === token.id ? 'progress_activity' : 'bolt'}
                      </span>
                      {buyingId === token.id ? buyStatus : 'Quick Buy $1'}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-6 pb-8 pt-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.06)] dark:shadow-none border-t border-outline-variant/20 rounded-t-3xl">
        <a onClick={() => navigate('/dashboard')} className="cursor-pointer flex flex-col items-center justify-center text-slate-400 opacity-60 hover:text-emerald-500 transition-colors">
          <span className="material-symbols-outlined mb-1">dashboard</span>
          <span className="font-headline text-[10px] tracking-wide uppercase">Overview</span>
        </a>
        <a className="flex flex-col items-center justify-center text-emerald-600 after:content-[''] after:w-1 after:h-1 after:bg-emerald-500 after:rounded-full after:mt-1 transform translate-y-[-2px] duration-300" href="#">
          <span className="material-symbols-outlined mb-1">eco</span>
          <span className="font-headline text-[10px] tracking-wide uppercase">Markets</span>
        </a>
        <a onClick={() => navigate('/sandbox')} className="cursor-pointer flex flex-col items-center justify-center text-slate-400 opacity-60 hover:text-emerald-500 transition-colors">
          <span className="material-symbols-outlined mb-1">psychology</span>
          <span className="font-headline text-[10px] tracking-wide uppercase">Demo</span>
        </a>
        <a onClick={() => navigate('/history')} className="cursor-pointer flex flex-col items-center justify-center text-slate-400 opacity-60 hover:text-emerald-500 transition-colors">
          <span className="material-symbols-outlined mb-1">receipt_long</span>
          <span className="font-headline text-[10px] tracking-wide uppercase">History</span>
        </a>
      </nav>
    </div>
  );
};

export default Markets;
