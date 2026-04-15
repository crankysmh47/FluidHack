import React, { useEffect } from 'react';
import { useCarbonStore } from '../store/useCarbonStore';
import { useNavigate } from 'react-router-dom';
import EcologicalBackground from '../components/EcologicalBackground';
import CursorStars from '../components/CursorStars';

const History: React.FC = () => {
  const { user, fullHistory, fetchFullHistory, agentHistory, fetchAgentHistory } = useCarbonStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchFullHistory();
      fetchAgentHistory();
    }
  }, [user, fetchFullHistory, fetchAgentHistory]);

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-24 relative">
      {/* Ecological Background */}
      <EcologicalBackground />
      
      {/* Cursor Stars */}
      <CursorStars />
      
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

      <main className="p-6 space-y-12">
        {/* Agent Session History Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">diversity_3</span>
            <h2 className="text-xl font-headline font-bold text-on-surface">Protocol Sentinel Sessions</h2>
          </div>
          
          {agentHistory.length > 0 ? (
            <div className="bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/20 biological-shadow">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/10 bg-surface-container-high/50">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Authorized</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Budget (USD)</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Consumption</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {agentHistory.map((sess: any) => (
                    <tr key={sess.session_id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-on-surface">{new Date(sess.start_time).toLocaleDateString()}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase">{sess.session_id}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-headline font-black text-on-surface">${sess.authorized_budget.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <p className="text-sm font-bold text-emerald-500">${sess.final_spend.toFixed(2)}</p>
                          <p className="text-[10px] text-on-surface-variant">{sess.final_tx_count} Transactions</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[9px] font-black px-2 py-1 rounded-full border ${
                          sess.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          sess.status === 'EXHAUSTED' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        }`}>
                          {sess.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/20 text-center opacity-40">
              <p className="text-sm">No past sentinel sessions found. Your active agent's history will be logged here once finalized.</p>
            </div>
          )}
        </section>

        {/* Transaction Ledger Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">receipt_long</span>
            <h2 className="text-xl font-headline font-bold text-on-surface">On-Chain Transaction Log</h2>
          </div>
          {fullHistory.length > 0 && (
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
          )}
        </section>
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
        <a className="flex flex-col items-center justify-center text-emerald-600 after:content-[''] after:w-1 after:h-1 after:bg-emerald-500 after:rounded-full after:mt-1 transform translate-y-[-2px] duration-300 pointer-events-none">
          <span className="material-symbols-outlined mb-1">receipt_long</span>
          <span className="font-headline text-[10px] tracking-wide uppercase">History</span>
        </a>
      </nav>
    </div>
  );
};

export default History;
