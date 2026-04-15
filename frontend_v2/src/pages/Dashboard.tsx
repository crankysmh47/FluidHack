import React, { useEffect, useState, useRef } from 'react';
import { useCarbonStore } from '../store/useCarbonStore';
import { useNavigate } from 'react-router-dom';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useSignMessage } from 'wagmi';
import EcologicalBackground from '../components/EcologicalBackground';
import CursorStars from '../components/CursorStars';
import pslLogo from '../assets/psl_giants.png';

const Dashboard: React.FC = () => {
  const { user, remainingBudget, globalTotalOffset, fetchStats, fetchLedger, revokeAgent, forceBuy, logout, uiMessage, isAgentActive, isDemoMode, toggleDemoMode, liveFeed, fetchLiveFeed, isPaymentAuthorized, authorizePayment, isLoading, auditOffsetMinutes, lastAgentCycle, fetchLastAgentCycle, triggerAgentCycle } = useCarbonStore();
  const navigate = useNavigate();
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const effectiveIsConnected = isConnected || isDemoMode;

  const getPslMatchUrl = (home?: string, away?: string, matchNum?: number) => {
    const h = (home || 'peshawar-zalmi').toLowerCase().replace(/\s+/g, '-');
    const a = (away || 'quetta-gladiators').toLowerCase().replace(/\s+/g, '-');
    // Pattern: Match 23 = 1527574, Match 24 = 1527575
    // Base ID for Match 23 is 1527574. Formula: 1527551 + matchNum
    const id = matchNum && matchNum >= 1 ? 1527551 + matchNum : 1527574;
    const matchPart = matchNum ? `${matchNum}${getOrdinalSuffix(matchNum)}-match-` : '';
    return `https://www.espncricinfo.com/series/pakistan-super-league-2026-1515734/${h}-vs-${a}-${matchPart}${id}/live-cricket-score`;
  };

  const getOrdinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"],
          v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [buyAmount, setBuyAmount] = useState('1.00');
  const [allowanceAmount, setAllowanceAmount] = useState(50);
  const [txLimitAmount, setTxLimitAmount] = useState(20);
  const [isAuthDismissed, setIsAuthDismissed] = useState(false);
  const [countdown, setCountdown] = useState('04m 59s');
  const [cycleProgress, setCycleProgress] = useState(0);

  // Track next cycle time with a ref to survive re-renders
  const nextCycleRef = useRef<number>(0);
  const cycleTriggeredRef = useRef<boolean>(false);

  // Terminate & Reset logic
  const handleTerminateAgent = async () => {
    await revokeAgent();
  };

  // Spin up new agent — open the auth modal
  const handleSpinUpAgent = () => {
    setIsAuthDismissed(false);
    useCarbonStore.setState({ isPaymentAuthorized: false });
  };

  // ── Bulletproof 5-Minute Agent Cycle Timer ───────────────────────────
  useEffect(() => {
    // Initialize the next cycle time if not set
    if (nextCycleRef.current === 0) {
      // Align to the next 5-minute wall-clock boundary
      const now = Date.now();
      const msIntoCurrentCycle = now % (5 * 60 * 1000);
      nextCycleRef.current = now + (5 * 60 * 1000) - msIntoCurrentCycle;
    }

    const timer = setInterval(() => {
      const now = Date.now();
      
      // Apply demo acceleration: reduce remaining time
      const effectiveNextCycle = nextCycleRef.current - (auditOffsetMinutes * 60 * 1000);
      let msRemaining = effectiveNextCycle - now;

      if (msRemaining <= 0) {
        // CYCLE TRIGGERED
        if (!cycleTriggeredRef.current && isAgentActive && isPaymentAuthorized) {
          cycleTriggeredRef.current = true;
          console.log('[Dashboard] 5-minute cycle triggered — calling agent pipeline');
          triggerAgentCycle().finally(() => {
            cycleTriggeredRef.current = false;
          });
        }
        
        // Reset for next cycle
        nextCycleRef.current = now + (5 * 60 * 1000);
        useCarbonStore.setState({ auditOffsetMinutes: 0 });
        msRemaining = 5 * 60 * 1000;
      }

      const totalMs = 5 * 60 * 1000;
      const progress = ((totalMs - msRemaining) / totalMs) * 100;
      setCycleProgress(Math.min(100, Math.max(0, progress)));

      const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setCountdown(`${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [auditOffsetMinutes, isAgentActive, isPaymentAuthorized, triggerAgentCycle]);

  const handleAuthorize = async () => {
    try {
      const message = `Authorize Carbon Sentinel Agent\n\nUser: ${user?.id}\nWallet: ${address || 'demo_wallet'}\nDesignated AI Budget: $${allowanceAmount}\nTransaction Limit (Preimages): ${txLimitAmount}\n\nI grant the protocol permission to execute signature-less settlements on my behalf within these budget and transaction limits.`;
      
      if (!isDemoMode) {
        await signMessageAsync({ message });
      }
      await authorizePayment(allowanceAmount, txLimitAmount);
      setIsAuthDismissed(true);
    } catch (err) {
      console.error("Authorization user error:", err);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchStats();
    fetchLedger();
    fetchLiveFeed();
    fetchLastAgentCycle();
    const interval = setInterval(() => {
      fetchStats();
      fetchLedger();
      fetchLiveFeed();
      fetchLastAgentCycle();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchLedger, fetchLiveFeed, fetchLastAgentCycle, user, navigate]);

  // Helper to format the last cycle time
  const formatCycleTime = (ts: number | null) => {
    if (!ts) return 'Never';
    const d = new Date(ts * 1000);
    return d.toLocaleTimeString();
  };

  const agentResult = lastAgentCycle?.result;

  return (
    <div className="bg-transparent text-on-surface min-h-screen pb-24 relative">
      {/* Ecological Background */}
      <EcologicalBackground />
      
      {/* Cursor Stars */}
      <CursorStars />
      
      {/* TopAppBar - Premium Glassmorphism Redesign */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-emerald-500/10 flex justify-between items-center w-full px-6 py-4 transition-all">
        {/* Toast Notification */}
        {uiMessage && (
          <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 px-8 py-4 rounded-3xl text-sm font-black shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-50 transition-all border ${uiMessage.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-red-500 border-red-400 text-white'}`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">{uiMessage.type === 'success' ? 'check_circle' : 'error'}</span>
              {uiMessage.text}
            </div>
          </div>
        )}

        <div className="flex items-center gap-5">
          <div className="relative group cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img 
              src={pslLogo} 
              alt="PSL Giants" 
              className="w-14 h-14 object-contain relative z-10 drop-shadow-[0_5px_15px_rgba(16,185,129,0.2)]" 
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg border border-emerald-400/30">
              <span className="font-headline font-black text-white text-lg">{user?.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex flex-col">
              <h2 className="font-headline font-black text-emerald-950 dark:text-emerald-50 tracking-tight text-xl leading-none">
                Sentinel Dashboard
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${isPaymentAuthorized && isAgentActive ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-red-500'}`}></div>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isPaymentAuthorized && isAgentActive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {isPaymentAuthorized && isAgentActive ? 'Protocol Active' : 'Sentinel Standby'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button 
            onClick={toggleDemoMode}
            className={`hidden md:flex items-center gap-2.5 px-5 py-2 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all border shadow-sm ${isDemoMode ? 'bg-amber-500 text-white border-amber-400' : 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? 'bg-white animate-pulse' : 'bg-emerald-400'}`}></span>
            {isDemoMode ? 'Sandbox Active' : 'Live Network'}
          </button>

          {/* Restored Wallet Button */}
          <button 
            onClick={() => open()}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all border shadow-sm ${isConnected ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-100 dark:bg-slate-800 border-emerald-500/10 text-slate-500 dark:text-white hover:border-emerald-500/30'}`}
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-slate-400'} animate-pulse`}></span>
            {isConnected ? 'Wallet' : 'Connect'}
          </button>
          
          <div className="h-8 w-px bg-emerald-500/10 mx-1 hidden md:block"></div>

          <button 
            onClick={() => { logout(); navigate('/'); }}
            className="px-5 py-2 rounded-2xl text-[10px] uppercase font-black tracking-widest text-red-500 hover:bg-red-500/5 transition-colors border border-transparent hover:border-red-500/20"
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
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70">Network Offset</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-headline font-light text-primary">{globalTotalOffset.toFixed(2)}</span>
            <span className="text-[10px] text-on-surface-variant font-medium">Tonnes</span>
          </div>
        </div>
      </div>

      {/* Main Content: Bento Grid */}
      <main className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Section: Carbon Options List */}
        <section className="md:col-span-12 lg:col-span-7 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-headline font-semibold text-on-surface">Carbon Market Pulse</h2>
            <span className="text-[10px] font-label text-emerald-600 font-bold px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">LIVE MARKET</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'bct', name: 'Base Carbon', desc: 'Verified Tonnes', fallback: '0.65', color: 'primary' },
              { id: 'mco2', name: 'Moss Carbon', desc: 'Amazon Protection', fallback: '1.25', color: 'emerald-600' },
              { id: 'nct', name: 'Nature Carbon', desc: 'Nature Based', fallback: '0.70', color: 'amber-600' },
              { id: 'ubo', name: 'Universal Offset', desc: 'Basic Offset', fallback: '0.45', color: 'blue-500' }
            ].map(token => (
              <div key={token.id} className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10 shadow-sm flex justify-between items-center hover:border-primary/20 transition-all cursor-pointer" onClick={() => navigate('/markets')}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-${token.color}/10 flex items-center justify-center text-${token.color}`}>
                    <span className="material-symbols-outlined text-lg">{token.id === 'bct' ? 'eco' : token.id === 'mco2' ? 'cloud_done' : token.id === 'nct' ? 'forest' : 'waves'}</span>
                  </div>
                  <div>
                    <p className="font-headline font-bold text-sm text-on-surface">{token.id.toUpperCase()}</p>
                    <p className="text-[9px] text-on-surface-variant font-medium uppercase tracking-tighter">{token.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-headline font-bold text-primary text-sm">
                    ${isDemoMode || !liveFeed?.crypto?.[token.id] ? token.fallback : liveFeed.crypto[token.id].price.toFixed(2)}
                  </p>
                  <p className={`text-[9px] font-bold ${(isDemoMode || !liveFeed?.crypto?.[token.id] || liveFeed.crypto[token.id].change >= 0) ? 'text-emerald-500' : 'text-error'}`}>
                    {(isDemoMode || !liveFeed?.crypto?.[token.id]) ? "+1.2%" : (liveFeed.crypto[token.id].change > 0 ? "+" : "") + liveFeed.crypto[token.id].change.toFixed(1) + "%"}
                  </p>
                </div>
              </div>
            ))}
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
                      <span className="text-on-surface-variant">Forecasted Environmental Mitigation</span>
                      <span className="text-primary font-bold">120 kg CO2e</span>
                    </div>
                    <div className="w-full bg-outline-variant/20 h-1 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-2/3"></div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Sentinel Intelligence Cue</p>
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
                  <div className="mt-auto text-center flex justify-center relative z-20">
                    <a 
                      href={getPslMatchUrl(liveFeed?.sports?.match?.home_team, liveFeed?.sports?.match?.away_team, liveFeed?.sports?.match?.match_number)} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full transition-colors cursor-pointer pointer-events-auto"
                    >
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
                    <p className="text-xs text-on-surface-variant mt-1">{liveFeed?.sports?.match?.dateTimeGMT ? new Date(liveFeed.sports.match.dateTimeGMT + "Z").toLocaleString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}</p>
                  </div>
                  <div className="mt-auto text-center flex justify-center relative z-20">
                    <a 
                      href={getPslMatchUrl(liveFeed?.sports?.match?.home_team, liveFeed?.sports?.match?.away_team, liveFeed?.sports?.match?.match_number)} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full transition-colors cursor-pointer pointer-events-auto"
                    >
                      <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                      Schedule on ESPNCricinfo
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Section: Sentinel Control Center — always visible */}
        <section className="md:col-span-12">
          <div className="bg-surface-container-low rounded-[2.5rem] p-8 border border-outline-variant/20 biological-shadow">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPaymentAuthorized && isAgentActive ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>
                  <span className="material-symbols-outlined">{isPaymentAuthorized && isAgentActive ? 'settings_suggest' : 'power_off'}</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-xl text-on-surface">Protocol Control Center</h3>
                  <p className="text-xs text-on-surface-variant">
                    {isPaymentAuthorized && isAgentActive 
                      ? 'Manage your autonomous agent and manual overrides.' 
                      : '⚠ Agent is offline. Spin up a new agent to resume autonomous monitoring.'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                {isPaymentAuthorized && isAgentActive ? (
                  <button 
                    onClick={handleTerminateAgent}
                    className="flex-1 md:flex-none px-8 py-4 rounded-2xl font-bold font-headline uppercase text-sm tracking-widest transition-all flex items-center justify-center gap-3 bg-error/10 text-error hover:bg-error/20 border border-error/20 active:scale-95"
                  >
                    <span className="material-symbols-outlined">cancel</span>
                    Terminate Agent
                  </button>
                ) : (
                  <button 
                    onClick={handleSpinUpAgent}
                    className="flex-1 md:flex-none px-8 py-4 rounded-2xl font-bold font-headline uppercase text-sm tracking-widest transition-all flex items-center justify-center gap-3 bg-primary text-on-primary shadow-xl hover:brightness-110 active:scale-95 animate-pulse"
                  >
                    <span className="material-symbols-outlined">add_circle</span>
                    Spin Up New Agent
                  </button>
                )}
                
                <button 
                  onClick={() => setIsBuyModalOpen(true)}
                  disabled={!isPaymentAuthorized || !isAgentActive}
                  className={`flex-1 md:flex-none px-8 py-4 rounded-2xl font-headline font-bold uppercase text-sm tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all ${(!isPaymentAuthorized || !isAgentActive) ? 'bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed' : 'bg-primary text-on-primary hover:brightness-110 active:scale-95'}`}
                >
                  <span>Force Buy</span>
                  <span className="material-symbols-outlined">bolt</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Last Agent Decision — Intelligence Feed */}
        <section className="md:col-span-12">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
            {/* High-tech Scanning Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20 animate-scan pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lastAgentCycle?.running ? 'bg-amber-500/20 text-amber-400' : agentResult?.blocked ? 'bg-red-500/20 text-red-400' : agentResult ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
                  <span className={`material-symbols-outlined text-2xl ${lastAgentCycle?.running ? 'animate-spin' : ''}`}>
                    {lastAgentCycle?.running ? 'progress_activity' : agentResult?.blocked ? 'block' : agentResult ? 'terminal' : 'smart_toy'}
                  </span>
                </div>
                <div>
                  <h3 className="font-headline font-black text-lg text-emerald-50 tracking-tight uppercase">Agent Intelligence Feed</h3>
                  <p className="text-[10px] font-mono text-emerald-500/70 font-bold tracking-widest uppercase">
                    {lastAgentCycle?.running ? 'SYSTEM ANALYZING DATA PATHS...' 
                      : agentResult ? `LAST LOG: ${formatCycleTime(lastAgentCycle.timestamp)}`
                      : 'SYSTEM INITIALIZED - AWAITING DATA'}
                  </p>
                </div>
              </div>
              {agentResult?.is_surge_event && (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/50 px-4 py-1.5 rounded-full animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-amber-500 text-[10px] font-black tracking-widest uppercase">Surge Event Detected</span>
                </div>
              )}
            </div>

            {agentResult && !agentResult.error ? (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Event Type', value: agentResult.is_surge_event ? (agentResult.metadata?.event_type === 'peak' ? 'Peak Load' : 'Grid Surge') : 'Normal', color: agentResult.is_surge_event ? 'text-amber-400' : 'text-emerald-400' },
                  { label: 'Calculated Footprint', value: `${agentResult.calculated_footprint_kg?.toFixed(1) || '—'} kg CO₂`, color: 'text-white' },
                  { label: 'Settlement Amount', value: `$${agentResult.amount_usd?.toFixed(4) || '—'}`, color: agentResult.blocked ? 'text-red-400' : 'text-emerald-400' },
                  { label: 'Protocol Token', value: agentResult.metadata?.token_symbol || 'BCT', color: 'text-white' },
                  { label: 'Resolution Status', value: agentResult.blocked ? 'Rejected' : 'Executed', color: agentResult.blocked ? 'text-red-400' : 'text-emerald-400' },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/10 rounded-2xl p-4 group-hover:border-emerald-500/20 transition-all">
                    <p className="text-[9px] font-mono font-bold text-emerald-500/40 uppercase tracking-widest mb-2">{item.label}</p>
                    <p className={`font-headline font-black text-base tracking-tight ${item.color}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : agentResult?.error ? (
              <div className="bg-red-500/5 border border-red-500/30 rounded-2xl p-6 flex items-center gap-4">
                <span className="material-symbols-outlined text-red-500 text-3xl">report_problem</span>
                <div>
                  <p className="text-red-400 font-bold text-sm">System Malfunction Detected</p>
                  <p className="text-red-400/70 text-xs font-mono">{agentResult.error}</p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/30 border border-emerald-500/5 rounded-2xl p-10 text-center relative overflow-hidden group">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #10b981 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                <div className="relative z-10">
                  <div className="mb-4 flex justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                  </div>
                  <p className="text-emerald-100/90 font-headline font-medium text-base mb-2">
                    {isPaymentAuthorized && isAgentActive 
                      ? 'Sentinel node monitoring network traffic logs...'
                      : 'Awaiting Authorization Protocol...'}
                  </p>
                  <p className="text-emerald-500/60 font-mono text-[10px] tracking-[0.2em] uppercase font-bold">
                    {isPaymentAuthorized && isAgentActive 
                      ? `Targeting next cycle in ${countdown}`
                      : 'STANDBY: AGENT NOT AUTHORIZED'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section: Sentinel Impact Pulse */}
        <section className="md:col-span-12">
          <div className="bg-gradient-to-br from-emerald-950 to-slate-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group border border-emerald-500/20">
            {/* Decorative Background Glows */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="flex flex-col items-center gap-3 mb-6">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400/80">Network Sentinel Impact</span>
                </div>
              </div>
              
              <div className="space-y-4 max-w-2xl">
                <h3 className="text-6xl md:text-8xl font-headline font-black tracking-tighter leading-tight">
                  <span className="text-white drop-shadow-sm">{Math.floor(globalTotalOffset * 50)}</span>
                  <span className="text-emerald-400 block mt-2 text-4xl md:text-5xl uppercase tracking-widest text-shadow-glow">Tree Years</span>
                </h3>
                
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent mx-auto my-8"></div>
                
                <p className="text-emerald-100/50 text-base md:text-lg leading-relaxed font-medium">
                  The Sentinel Network has collectively offset the equivalent of <span className="text-emerald-400 font-bold">{(globalTotalOffset * 50).toFixed(0)} full years</span> of a mature tree's carbon sequestration capacity across the Pakistan Super League ecosystem.
                </p>
              </div>

              <div className="mt-12 w-full max-w-xs">
                <button onClick={() => navigate('/history')} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white transition-all py-4 px-8 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl border border-emerald-400/20 active:scale-95">
                  Explore Sentinel Ledger
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-6 pb-8 pt-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.06)] dark:shadow-none border-t border-outline-variant/20 rounded-t-3xl">
        <a className="flex flex-col items-center justify-center text-emerald-600 after:content-[''] after:w-1 after:h-1 after:bg-emerald-500 after:rounded-full after:mt-1 transform translate-y-[-2px] duration-300 pointer-events-none">
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
        <a onClick={() => navigate('/history')} className="cursor-pointer flex flex-col items-center justify-center text-slate-400 opacity-60 hover:text-emerald-500 transition-colors">
          <span className="material-symbols-outlined mb-1">receipt_long</span>
          <span className="font-headline text-[10px] tracking-wide uppercase">History</span>
        </a>
      </nav>

      {/* Authorization Modal — Triggered by Spin Up Agent button or first visit */}
      {(!effectiveIsConnected || !isPaymentAuthorized) && !isAuthDismissed && (
        <div className="fixed inset-0 z-50 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center p-6">
          <div className="max-w-xl w-full bg-emerald-950 rounded-[3rem] p-10 md:p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-emerald-500/30 text-center relative overflow-y-auto max-h-[90vh]">
            {/* Decorative Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-emerald-500/50 blur-xl"></div>
            
            <span className="material-symbols-outlined text-6xl text-emerald-400 mb-6 animate-pulse">
              {!isConnected ? 'account_balance_wallet' : 'verified_user'}
            </span>
            
            <h2 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight mb-4 text-white">
              {!effectiveIsConnected ? 'Link Identity' : 'Authorize Agent'}
            </h2>
            
            <p className="text-base text-emerald-200/70 mb-10 max-w-sm mx-auto leading-relaxed">
              {!effectiveIsConnected 
                ? "Connect your wallet to bridge to the WireFluid testnet for on-chain settlement."
                : "Grant the Sentinel protocol permission to execute offsets within your limits."}
            </p>

            {!effectiveIsConnected ? (
              <button 
                onClick={() => open()}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-10 py-5 rounded-2xl font-headline font-bold text-lg uppercase tracking-widest shadow-xl active:scale-95 transition-all w-full max-w-xs mx-auto flex justify-center items-center gap-3 duration-200"
              >
                <span className="material-symbols-outlined">link</span>
                Connect Wallet
              </button>
            ) : (
              <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
                <div className="w-full bg-emerald-900/40 p-6 rounded-2xl border border-emerald-500/20 text-left">
                  <label className="block font-label text-[10px] text-emerald-300 uppercase tracking-[0.2em] mb-3">
                    Allowance (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-xl">$</span>
                    <input 
                      type="number" 
                      min="0"
                      value={allowanceAmount}
                      onChange={(e) => setAllowanceAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-emerald-950/60 border-none rounded-xl py-3 pl-10 pr-4 text-xl font-headline font-bold text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="w-full bg-emerald-900/40 p-6 rounded-2xl border border-emerald-500/20 text-left">
                  <label className="block font-label text-[10px] text-emerald-300 uppercase tracking-[0.2em] mb-3">
                    Transaction Limit
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-xl">#</span>
                    <input 
                      type="number" 
                      min="0"
                      value={txLimitAmount}
                      onChange={(e) => setTxLimitAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-emerald-950/60 border-none rounded-xl py-3 pl-10 pr-4 text-xl font-headline font-bold text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleAuthorize}
                  disabled={isLoading}
                  className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-10 py-5 rounded-2xl font-headline font-bold text-lg uppercase tracking-widest shadow-xl active:scale-95 transition-all w-full flex justify-center items-center gap-3 disabled:opacity-70 duration-200 mt-2"
                >
                  <span className="material-symbols-outlined">
                    {isLoading ? 'hourglass_empty' : 'signature'}
                  </span>
                  {isLoading ? 'Awaiting...' : 'Authorize'}
                </button>
              </div>
            )}

            <button 
              onClick={() => setIsAuthDismissed(true)}
              className="mt-8 text-emerald-500/40 font-label text-[10px] uppercase tracking-widest hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Skip — View Dashboard
            </button>
          </div>
        </div>
      )}

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
