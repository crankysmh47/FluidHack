import React, { useEffect, useState } from 'react';
import { useCarbonStore } from '../store/useCarbonStore';
import { useNavigate } from 'react-router-dom';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';

const Dashboard: React.FC = () => {
  const { user, remainingBudget, totalOffset, logs, fetchStats, fetchLedger, revokeAgent, forceBuy, logout, uiMessage, isAgentActive, isDemoMode, toggleDemoMode, liveFeed, fetchLiveFeed } = useCarbonStore();
  const navigate = useNavigate();
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [buyAmount, setBuyAmount] = useState('1.00');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchStats();
    fetchLedger();
    fetchLiveFeed();
    const interval = setInterval(() => {
      fetchStats();
      fetchLedger();
      fetchLiveFeed();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchLedger, fetchLiveFeed, user, navigate]);

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-24">
      {/* TopAppBar */}
      <header className="sticky top-0 z-40 bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-xl flex justify-between items-center w-full px-6 pt-4 pb-2">
        {/* Toast Notification */}
        {uiMessage && (
          <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-sm font-bold shadow-xl z-50 transition-all ${uiMessage.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
            {uiMessage.text}
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden">
            <span className="font-headline font-bold text-primary-container">{user?.name.charAt(0).toUpperCase()}</span>
          </div>
          <span className="font-headline font-semibold text-emerald-600 dark:text-emerald-400 tracking-tighter text-xl">
            {user?.name}'s Dashboard
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={toggleDemoMode}
            className={`flex items-center gap-2 border px-3 py-1 rounded-full text-xs font-semibold transition-colors ${isDemoMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 font-bold' : 'bg-surface-container-low border-outline/20 hover:bg-surface-container text-on-surface'}`}
          >
            {isDemoMode ? 'Demo Mode On' : 'Live Mode'}
          </button>
          <button 
            onClick={() => open()}
            className="flex items-center gap-2 bg-surface-container-low border border-outline/20 px-3 py-1 rounded-full text-xs font-semibold hover:bg-surface-container transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
          </button>
          <button 
            onClick={() => { logout(); navigate('/'); }}
            className="text-xs font-medium text-error hover:underline"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Data Row (Sentinel Metrics) */}
      <div className="px-6 py-4 grid grid-cols-2 gap-4 bg-surface-container-low">
        <div className="flex flex-col">
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70">Remaining Budget</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-headline font-light text-primary">${remainingBudget.toFixed(2)}</span>
            <span className="text-[10px] text-on-surface-variant font-medium">USD</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70">Total Offset</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-headline font-light text-primary">{totalOffset.toFixed(2)}</span>
            <span className="text-[10px] text-on-surface-variant font-medium">Tonnes</span>
          </div>
        </div>
      </div>

      {/* Main Content: Bento Grid */}
      <main className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Section: Carbon Options List */}
        <section className="md:col-span-12 lg:col-span-7 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-headline font-semibold text-on-surface">Carbon Options List</h2>
            <span className="text-xs font-label text-primary-container font-medium px-2 py-1 bg-primary/5 rounded-full">LIVE FEED</span>
          </div>
          <div className="flex flex-col gap-3">
            {/* BCT Token */}
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">eco</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-lg text-on-surface">BCT</p>
                  <p className="text-xs text-on-surface-variant">Base Carbon Tonne</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-headline font-semibold text-primary">
                  ${isDemoMode || !liveFeed?.crypto ? "18.42" : liveFeed.crypto.bct.price.toFixed(2)}
                </p>
                <p className={`text-[10px] flex items-center justify-end ${(!isDemoMode && liveFeed?.crypto?.bct?.change < 0) ? 'text-error' : 'text-primary'}`}>
                  <span className="material-symbols-outlined text-xs">
                    {(!isDemoMode && liveFeed?.crypto?.bct?.change < 0) ? 'arrow_drop_down' : 'arrow_drop_up'}
                  </span> 
                  {isDemoMode || !liveFeed?.crypto ? "+2.4" : (liveFeed.crypto.bct.change > 0 ? "+" : "") + liveFeed.crypto.bct.change.toFixed(1)}%
                </p>
              </div>
            </div>
            {/* MCO2 Token */}
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined">cloud_done</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-lg text-on-surface">MCO2</p>
                  <p className="text-xs text-on-surface-variant">Moss Carbon Credit</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-headline font-semibold text-primary">
                  ${isDemoMode || !liveFeed?.crypto ? "12.15" : liveFeed.crypto.mco2.price.toFixed(2)}
                </p>
                <p className={`text-[10px] flex items-center justify-end ${(!isDemoMode && liveFeed?.crypto?.mco2?.change > 0) ? 'text-primary' : 'text-error'}`}>
                  <span className="material-symbols-outlined text-xs">
                    {(!isDemoMode && liveFeed?.crypto?.mco2?.change > 0) ? 'arrow_drop_up' : 'arrow_drop_down'}
                  </span> 
                  {isDemoMode || !liveFeed?.crypto ? "-0.8" : (liveFeed.crypto.mco2.change > 0 ? "+" : "") + liveFeed.crypto.mco2.change.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Live PSL Match */}
        <section className="md:col-span-12 lg:col-span-5">
          <div className="relative overflow-hidden rounded-3xl bg-surface-container-high p-6 h-full flex flex-col justify-between">
            {/* Background visual texture */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10 transition-all">
              {isDemoMode ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-tighter">LIVE PSL MATCH</span>
                    <span className="text-on-surface-variant text-xs">Overs 14.2</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 items-center mb-8">
                    <div className="text-center">
                      <p className="font-headline font-extrabold text-xl mb-1">PES</p>
                      <p className="text-3xl font-headline font-light">142/4</p>
                    </div>
                    <div className="text-center border-l border-outline-variant/30">
                      <p className="font-headline font-extrabold text-xl mb-1">MUL</p>
                      <p className="text-3xl font-headline font-light">--</p>
                    </div>
                  </div>
                  <div className="bg-surface-container-lowest/50 rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant">Predicted Offset Impact</span>
                      <span className="text-primary font-bold">120 kg CO2e</span>
                    </div>
                    <div className="w-full bg-outline-variant/20 h-1 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-2/3"></div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Next Auto-Buy Trigger</p>
                    <p className="font-headline font-medium text-on-surface">Wicket in 15th Over</p>
                  </div>
                </>
              ) : liveFeed?.sports?.is_live ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-tighter">LIVE MATCH</span>
                    <span className="text-on-surface-variant text-xs">{liveFeed.sports.match.status_long}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 items-center mb-6">
                    <div className="text-center">
                      <p className="font-headline font-extrabold text-lg mb-1 leading-tight">{liveFeed.sports.match.home_team}</p>
                      <p className="text-3xl font-headline font-light text-primary">{liveFeed.sports.match.home_score ?? 0}</p>
                    </div>
                    <div className="text-center border-l border-outline-variant/30">
                      <p className="font-headline font-extrabold text-lg mb-1 leading-tight">{liveFeed.sports.match.away_team}</p>
                      <p className="text-3xl font-headline font-light text-primary">{liveFeed.sports.match.away_score ?? 0}</p>
                    </div>
                  </div>
                  <div className="mt-auto text-center flex justify-center">
                    <a href="https://www.espncricinfo.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full transition-colors">
                      <span className="material-symbols-outlined text-[14px]">sports_cricket</span>
                      View on ESPNCricinfo
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <span className="bg-surface-container-highest text-on-surface-variant text-[10px] font-bold px-3 py-1 rounded-full tracking-tighter shadow-sm border border-outline-variant/20">SCHEDULED</span>
                    <span className="text-on-surface-variant text-xs">{liveFeed?.sports?.match ? new Date(liveFeed.sports.match.date).toLocaleDateString() : 'Upcoming'}</span>
                  </div>
                  <div className="bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-xl text-sm mb-6 border border-amber-200 dark:border-amber-900/30">
                    <p className="font-semibold mb-1 flex items-center gap-2"><span className="material-symbols-outlined text-sm">info</span> No match currently happening.</p>
                    <p className="text-xs opacity-90">Switch to <b>Demo Mode</b> in the top right to see simulated live metrics.</p>
                  </div>
                  <div className="text-center mb-6">
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Next Match</p>
                    <p className="font-headline font-bold text-xl">{liveFeed?.sports?.match?.home_team || 'Team A'} vs {liveFeed?.sports?.match?.away_team || 'Team B'}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{liveFeed?.sports?.match?.date ? new Date(liveFeed.sports.match.date).toLocaleString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}</p>
                  </div>
                  <div className="mt-auto text-center flex justify-center">
                    <a href="https://www.espncricinfo.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full transition-colors">
                      <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                      Schedule on ESPNCricinfo
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Section: AI Agent Tracker */}
        <section className="md:col-span-12">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-headline font-semibold text-on-surface">AI Agent Tracker</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[10px] text-on-surface-variant font-label tracking-wide uppercase">Active Sentinel</span>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-2xl p-2">
            <div className="flex flex-col">
              {logs.length > 0 ? logs.map((log) => (
                <div key={log.id} className="flex gap-4 p-4 items-start border-b border-outline-variant/10">
                  <span className="material-symbols-outlined text-primary text-sm mt-1">
                    {log.level === 'success' ? 'verified' : 'sync'}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-headline font-bold text-sm">Autonomous Settlement</span>
                      <span className="text-[10px] text-on-surface-variant/50">{log.timestamp}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">{log.message}</p>
                  </div>
                </div>
              )) : (
                <div className="p-10 text-center opacity-50">
                  <span className="material-symbols-outlined text-4xl mb-2">monitoring</span>
                  <p className="text-xs">Awaiting live telemetry pulse...</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Contextual Actions Overlay */}
      <div className="fixed bottom-24 right-6 flex flex-col items-end gap-3 pointer-events-none">
        <button 
          onClick={revokeAgent}
          disabled={!isAgentActive}
          className={`pointer-events-auto bg-surface-container-low px-6 py-4 rounded-full shadow-lg border border-outline-variant/40 flex items-center gap-3 transition-all ${!isAgentActive ? 'opacity-50 line-through text-on-surface-variant' : 'text-error hover:bg-error/10 active:scale-95'}`}
        >
          <span className="material-symbols-outlined">{isAgentActive ? 'front_hand' : 'block'}</span>
          <span className="font-bold font-headline uppercase text-sm tracking-widest">{isAgentActive ? 'Revoke Agent' : 'Agent Revoked'}</span>
        </button>
        <button 
          onClick={() => setIsBuyModalOpen(true)}
          className="pointer-events-auto bg-primary-container text-on-primary-container px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 active:scale-95 duration-200 ease-out"
        >
          <span className="font-headline font-extrabold tracking-tight">FORCE BUY</span>
          <span className="material-symbols-outlined">bolt</span>
        </button>
      </div>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-6 pb-8 pt-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.06)] dark:shadow-none border-t border-outline-variant/20 rounded-t-3xl">
        <a className="flex flex-col items-center justify-center text-emerald-600 after:content-[''] after:w-1 after:h-1 after:bg-emerald-500 after:rounded-full after:mt-1 transform translate-y-[-2px] duration-300" href="#">
          <span className="material-symbols-outlined mb-1">dashboard</span>
          <span className="font-headline text-[10px] tracking-wide uppercase">Overview</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-400 opacity-60 hover:text-emerald-500 transition-colors" href="#">
          <span className="material-symbols-outlined mb-1">eco</span>
          <span className="font-headline text-[10px] tracking-wide uppercase">Markets</span>
        </a>
        <a onClick={() => navigate('/sandbox')} className="cursor-pointer flex flex-col items-center justify-center text-slate-400 opacity-60 hover:text-emerald-500 transition-colors">
          <span className="material-symbols-outlined mb-1">psychology</span>
          <span className="font-headline text-[10px] tracking-wide uppercase">Agent</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-400 opacity-60 hover:text-emerald-500 transition-colors" href="#">
          <span className="material-symbols-outlined mb-1">receipt_long</span>
          <span className="font-headline text-[10px] tracking-wide uppercase">History</span>
        </a>
      </nav>

      {/* Internal Modals */}
      {isBuyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-sm border border-outline-variant/20 biological-shadow relative">
            <button onClick={() => setIsBuyModalOpen(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-2xl font-headline font-bold text-on-surface mb-2">Manual Override</h3>
            <p className="text-sm text-on-surface-variant mb-6">Enter the amount in USD to execute an immediate carbon purchase off-chain.</p>
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-headline font-bold">$</span>
              <input 
                type="number" 
                step="0.01"
                min="0.10"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="w-full bg-surface-container px-10 py-4 rounded-xl font-headline font-bold text-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button 
              onClick={() => {
                forceBuy(parseFloat(buyAmount));
                setIsBuyModalOpen(false);
              }}
              className="w-full gradient-pulse py-4 rounded-xl font-headline font-bold text-white tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all"
            >
              Confirm Purchase
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
