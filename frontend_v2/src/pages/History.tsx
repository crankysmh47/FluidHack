import React, { useEffect } from 'react';
import { useCarbonStore } from '../store/useCarbonStore';
import { useNavigate } from 'react-router-dom';

const History: React.FC = () => {
  const { user, fullHistory, fetchFullHistory, setUiMessage } = useCarbonStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchFullHistory();
  }, [user, navigate, fetchFullHistory]);

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-24">
      {/* TopAppBar */}
      <header className="sticky top-0 z-40 bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-xl flex flex-col w-full px-6 pt-6 pb-4 border-b border-outline-variant/10">
        <div className="flex items-center gap-4 mb-2">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-3xl font-headline font-extrabold tracking-tighter text-on-surface">
            Legacy <span className="text-primary italic">Ledger</span>
          </h1>
        </div>
        <p className="text-sm text-on-surface-variant max-w-md">
          A definitive on-chain history of your autonomous carbon offsets via the WireFluid protocol.
        </p>
      </header>

      <main className="p-6">
        {fullHistory.length > 0 ? (
          <div className="flex flex-col gap-4">
            {fullHistory.map((tx: any) => (
              <div 
                key={tx.tx_hash} 
                className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/20 biological-shadow transition-transform hover:scale-[1.01] duration-200 group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                      <span className="material-symbols-outlined">verified</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-headline font-bold text-lg text-on-surface">
                          Offset {tx.footprint_kg.toFixed(1)}kg CO2e
                        </h3>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                          {tx.token_symbol}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                        {new Date(tx.logged_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end">
                    <p className="font-headline font-extrabold text-xl text-primary mb-1">
                      ${tx.amount_usd.toFixed(4)}
                    </p>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] text-on-surface-variant font-medium tracking-tight overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px]">
                         {tx.tx_hash}
                       </span>
                       <a 
                         href={tx.explorer_url || `https://wirefluidscan.com/tx/${tx.tx_hash}`}
                         target="_blank"
                         rel="noreferrer"
                         className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                       >
                         Scan <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                       </a>
                    </div>
                  </div>
                </div>
                
                {tx.match_id && (
                  <div className="mt-4 pt-4 border-t border-outline-variant/10 flex justify-between items-center text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                    <span>Source: {tx.source || 'Sentinel'}</span>
                    <span>Event ID: {tx.match_id}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <span className="material-symbols-outlined text-6xl mb-4">history_toggle_off</span>
            <h3 className="text-xl font-headline font-bold mb-2 text-on-surface">No records found</h3>
            <p className="text-sm max-w-xs text-on-surface-variant">
              When your Sentinel agent executes its first carbon offset, the definitive record will appear here.
            </p>
          </div>
        )}
      </main>

      {/* BottomNavigationBar */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-6 pb-8 pt-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.06)] dark:shadow-none border-t border-outline-variant/20 rounded-t-3xl">
        <a onClick={() => navigate('/dashboard')} className="cursor-pointer flex flex-col items-center justify-center text-slate-400 opacity-60 hover:text-emerald-500 transition-colors">
          <span className="material-symbols-outlined mb-1">dashboard</span>
          <span className="font-headline text-[10px] tracking-wide uppercase">Overview</span>
        </a>
        <a onClick={() => navigate('/markets')} className="cursor-pointer flex flex-col items-center justify-center text-slate-400 opacity-60 hover:text-emerald-500 transition-colors">
          <span className="material-symbols-outlined mb-1">eco</span>
          <span className="font-headline text-[10px] tracking-wide uppercase">Markets</span>
        </a>
        <a onClick={() => navigate('/sandbox')} className="cursor-pointer flex flex-col items-center justify-center text-slate-400 opacity-60 hover:text-emerald-500 transition-colors">
          <span className="material-symbols-outlined mb-1">psychology</span>
          <span className="font-headline text-[10px] tracking-wide uppercase">Demo</span>
        </a>
        <a className="flex flex-col items-center justify-center text-emerald-600 after:content-[''] after:w-1 after:h-1 after:bg-emerald-500 after:rounded-full after:mt-1 transform translate-y-[-2px] duration-300" href="#">
          <span className="material-symbols-outlined mb-1">receipt_long</span>
          <span className="font-headline text-[10px] tracking-wide uppercase">History</span>
        </a>
      </nav>
    </div>
  );
};

export default History;
