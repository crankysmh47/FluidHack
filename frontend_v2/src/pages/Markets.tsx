import React, { useEffect } from 'react';
import { useCarbonStore } from '../store/useCarbonStore';
import { useNavigate } from 'react-router-dom';

const Markets: React.FC = () => {
  const { user, logout, isDemoMode, toggleDemoMode, liveFeed, fetchLiveFeed, forceBuy, isLoading } = useCarbonStore();
  const navigate = useNavigate();

  const [buyingId, setBuyingId] = React.useState<string | null>(null);
  const [buyStatus, setBuyStatus] = React.useState<string>('Preparing');

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
  ];

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="sticky top-0 z-40 bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-xl flex justify-between items-center w-full px-6 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-surface-container rounded-full">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="font-headline font-semibold text-emerald-600 dark:text-emerald-400 tracking-tighter text-xl">
            Carbon Markets
          </span>
        </div>
        <div className="flex gap-3 items-center">
          <button 
            onClick={toggleDemoMode}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${isDemoMode ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-surface-container-low border border-outline/10 text-on-surface-variant'}`}
          >
            {isDemoMode ? 'Demo' : 'Live'}
          </button>
          <button 
            onClick={() => { logout(); navigate('/'); }}
            className="text-xs font-medium text-error hover:underline"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tokens.map((token) => {
            const data = liveFeed?.crypto?.[token.id] || { price: 0, change: 0, tvl: 0, chain: 'Polygon' };
            const isMock = isDemoMode || !liveFeed?.crypto;
            
            return (
              <div key={token.id} className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-6 flex flex-col justify-between hover:border-primary/30 transition-all group">
                <div className="flex justify-between items-start mb-6">
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
                      ${isMock && token.id === 'bct' ? "18.42" : isMock && token.id === 'mco2' ? "12.15" : (typeof data?.price === 'number' ? data.price.toFixed(2) : "0.00")}
                    </p>
                    <p className={`text-[10px] font-bold flex items-center justify-end ${(data?.change ?? 0) >= 0 ? 'text-emerald-500' : 'text-error'}`}>
                      <span className="material-symbols-outlined text-xs">{(data?.change ?? 0) >= 0 ? 'arrow_drop_up' : 'arrow_drop_down'}</span>
                      {Math.abs(data?.change ?? 0).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface-container/30 rounded-2xl p-3 border border-outline-variant/5">
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Liquidity (TVL)</p>
                    <p className="font-headline font-bold text-sm text-on-surface">
                      ${(isMock && token.id === 'bct' ? 500000 : data.tvl).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-surface-container/30 rounded-2xl p-3 border border-outline-variant/5">
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Native Chain</p>
                    <div className="flex items-center gap-1">
                       <span className="material-symbols-outlined text-xs text-primary">link</span>
                       <p className="font-headline font-bold text-sm text-on-surface">{data.chain}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleQuickBuy(token.id)}
                  disabled={isLoading}
                  className={`w-full py-4 rounded-2xl font-headline font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-80 shadow-lg ${buyingId === token.id ? 'bg-emerald-500 text-white scale-[1.02]' : 'bg-primary-container text-on-primary-container hover:bg-primary group-hover:text-white group-hover:bg-primary'}`}
                >
                  <span className={`material-symbols-outlined text-sm ${buyingId === token.id ? 'animate-spin' : ''}`}>
                    {buyingId === token.id ? 'progress_activity' : 'bolt'}
                  </span>
                  {buyingId === token.id ? buyStatus : 'Quick Buy $1'}
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
