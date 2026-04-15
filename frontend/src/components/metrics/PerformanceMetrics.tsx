// src/components/metrics/PerformanceMetrics.tsx
import React, { useState, useEffect } from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { ShieldAlert, BarChart3, Zap, Activity, BrainCircuit, AlertTriangle, Clock, TrendingUp, Bot } from 'lucide-react';
import { motion, animate, AnimatePresence } from 'framer-motion';
import { TacticalMiniMap } from './TacticalMiniMap';
import { useHeartbeat } from '../../hooks/useHeartbeat';

const CountingNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      ease: [0.33, 1, 0.68, 1],
      onUpdate: (latest) => setDisplayValue(Number(latest.toFixed(1))),
    });
    return () => controls.stop();
  }, [value]);

  return <>{displayValue}</>;
};

// Authorization modal component
const AuthModal = ({ onClose }: { onClose: () => void }) => {
  const { authorizeAgent, claimFaucet, budgetUsd } = useCarbonStore();
  const [budget, setBudget] = useState('100');
  const [maxTx, setMaxTx] = useState('10');
  const [txCount, setTxCount] = useState('20');
  const [loading, setLoading] = useState(false);

  const handleAuthorize = async () => {
    setLoading(true);
    await authorizeAgent(parseFloat(budget), parseFloat(maxTx), parseInt(txCount));
    setLoading(false);
    onClose();
  };

  const handleFaucet = async () => {
    setLoading(true);
    await claimFaucet();
    setLoading(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative bg-[#071210] border border-emerald-500/40 rounded-2xl p-8 w-[460px] shadow-[0_0_80px_rgba(16,185,129,0.15)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
        
        <div className="flex items-center gap-3 mb-6">
          <BrainCircuit className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
          <div>
            <h2 className="text-xl font-black text-emerald-300 tracking-wider">AUTHORIZE AGENT</h2>
            <p className="text-[9px] text-emerald-900/60 font-mono tracking-widest">CARBON SENTINEL v2.1 — USER CONTROL LAYER</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-[9px] font-mono font-black text-emerald-900/60 uppercase tracking-widest block mb-2">Total Budget (USD)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="flex-1 bg-emerald-950/20 border border-emerald-900/40 rounded-lg px-4 py-2.5 text-emerald-300 font-mono text-sm focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
              <button
                onClick={handleFaucet}
                className="px-4 py-2 bg-emerald-900/30 border border-emerald-700/40 rounded-lg text-emerald-400 text-xs font-black hover:bg-emerald-800/40 transition-all"
              >
                FAUCET +$10K
              </button>
            </div>
          </div>
          
          <div>
            <label className="text-[9px] font-mono font-black text-emerald-900/60 uppercase tracking-widest block mb-2">Max Per-Transaction (USD)</label>
            <input
              type="number"
              value={maxTx}
              onChange={e => setMaxTx(e.target.value)}
              className="w-full bg-emerald-950/20 border border-emerald-900/40 rounded-lg px-4 py-2.5 text-emerald-300 font-mono text-sm focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>

          <div>
            <label className="text-[9px] font-mono font-black text-emerald-900/60 uppercase tracking-widest block mb-2">Max Transaction Count</label>
            <input
              type="number"
              value={txCount}
              onChange={e => setTxCount(e.target.value)}
              className="w-full bg-emerald-950/20 border border-emerald-900/40 rounded-lg px-4 py-2.5 text-emerald-300 font-mono text-sm focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-emerald-900/30 text-emerald-900/60 text-xs font-black uppercase tracking-widest hover:border-emerald-900/60 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleAuthorize}
            disabled={loading}
            className="flex-2 flex-grow py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-black font-black uppercase tracking-widest text-sm hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          >
            {loading ? 'Authorizing...' : 'AUTHORIZE'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const PerformanceMetrics: React.FC = () => {
  const { 
    performanceMetrics, isExecuting, agentStatus, agentDecision, 
    lastCycleTime, nextCycleIn, matchMinute, isAuthorized,
    budgetUsd, spentUsd, remainingBudget, txCount, authorizedTxCount,
    revokeAgent, triggerAgentCycle, agentRunning, surgeActive, surgeConsumed
  } = useCarbonStore();
  const pulse = useHeartbeat();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isOffline = agentStatus === 'revoked' || agentStatus === 'exhausted' || agentStatus === 'offline';
  const isAnalyzing = agentStatus === 'analyzing';

  const statusConfig = {
    active: { color: 'text-emerald-400', bg: 'bg-emerald-400', label: 'ACTIVE', pulse: true },
    analyzing: { color: 'text-cyan-400', bg: 'bg-cyan-400', label: 'ANALYZING', pulse: true },
    executing: { color: 'text-yellow-400', bg: 'bg-yellow-400', label: 'EXECUTING', pulse: true },
    offline: { color: 'text-red-500', bg: 'bg-red-500', label: 'OFFLINE', pulse: false },
    exhausted: { color: 'text-orange-500', bg: 'bg-orange-500', label: 'BUDGET EXHAUSTED', pulse: false },
    revoked: { color: 'text-red-600', bg: 'bg-red-600', label: 'REVOKED', pulse: false },
  };

  const sc = statusConfig[agentStatus] || statusConfig.active;

  const formatNextCycle = () => {
    const m = Math.floor(nextCycleIn / 60);
    const s = nextCycleIn % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col p-6 font-sans relative group overflow-hidden">
      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </AnimatePresence>

      <div className="mb-6 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="text-emerald-500 w-10 h-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <h1 className="text-3xl font-black tracking-tighter text-emerald-400 text-shadow-glow">
            CARBON<br/>SENTINEL
          </h1>
        </div>
        <p className="text-[9px] text-emerald-100/30 font-mono tracking-[0.3em] uppercase leading-relaxed">
          LLM-BASED ADVANCED ENVIRONMENTAL ATTRIBUTION NODE
        </p>
      </div>

      <div className="space-y-4 relative z-10">

        {/* Agent Status Panel */}
        <div className="hud-panel rounded-xl p-4 border-emerald-900/10 bg-emerald-950/5">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-3.5 h-3.5 text-emerald-500 opacity-50" />
            <h2 className="text-[9px] font-black tracking-[0.4em] uppercase text-emerald-100/40">AI Agent Status</h2>
          </div>

          {/* Main status indicator */}
          <motion.div 
            animate={isOffline ? {} : { scale: isAnalyzing ? [1, 1.02, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className={`flex items-center gap-3 mb-3 ${sc.color}`}
          >
            <span className="relative flex h-2.5 w-2.5">
              {sc.pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sc.bg}`} />}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${sc.bg}`} />
            </span>
            <span className="font-mono text-sm font-black tracking-wider">{sc.label}</span>
          </motion.div>

          {/* Surge detected badge */}
          {surgeConsumed && agentDecision?.is_surge_event && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-2 px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
            >
              <AlertTriangle className="w-3 h-3 text-yellow-500" />
              <span className="text-[8px] font-mono font-black text-yellow-500 uppercase tracking-widest">Grid Surge Detected — Transaction Executed</span>
            </motion.div>
          )}

          {/* Budget display */}
          {isAuthorized && (
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-emerald-900/60">Budget Remaining</span>
                <span className={remainingBudget < budgetUsd * 0.1 ? 'text-red-400 font-black' : 'text-emerald-400 font-black'}>
                  ${remainingBudget.toFixed(2)}
                </span>
              </div>
              <div className="h-1 bg-emerald-950/40 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${budgetUsd > 0 ? (remainingBudget / budgetUsd) * 100 : 0}%` }}
                  transition={{ duration: 1 }}
                  className={`h-full rounded-full ${remainingBudget < budgetUsd * 0.1 ? 'bg-red-500' : 'bg-emerald-500'}`}
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-emerald-950/50">
                <span>Txs: {txCount}/{authorizedTxCount}</span>
                <span>Per Tx: ${useCarbonStore.getState().maxTxUsd.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Next cycle countdown */}
          {isAuthorized && !isOffline && (
            <div className="flex items-center gap-2 mt-2">
              <Clock className="w-3 h-3 text-emerald-900/40" />
              <span className="text-[8px] font-mono text-emerald-900/40 uppercase tracking-widest">
                {agentRunning ? 'Cycle running...' : `Next cycle: ${formatNextCycle()}`}
              </span>
            </div>
          )}
        </div>

        {/* Last Decision */}
        {agentDecision && !agentDecision.blocked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hud-panel rounded-xl p-4 border-emerald-900/10 bg-emerald-950/5"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 opacity-50" />
              <h2 className="text-[9px] font-black tracking-[0.4em] uppercase text-emerald-100/40">Last Agent Decision</h2>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-emerald-900/50">Amount</span>
                <span className="text-emerald-400 font-black">${agentDecision.amount_usd?.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-emerald-900/50">Token</span>
                <span className="text-white font-black">{agentDecision.metadata?.token_symbol || 'BCT'}</span>
              </div>
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-emerald-900/50">CO2 offset</span>
                <span className="text-emerald-400 font-black">{agentDecision.calculated_footprint_kg?.toFixed(1)} kg</span>
              </div>
              {agentDecision.capped_to_limit && (
                <div className="text-[8px] font-mono text-yellow-500/80 mt-1">* Capped to per-tx limit</div>
              )}
              {lastCycleTime && (
                <div className="text-[8px] font-mono text-emerald-950/40 mt-1">at {lastCycleTime}</div>
              )}
            </div>
          </motion.div>
        )}

        {/* Match minute context */}
        <div className="hud-panel rounded-xl p-4 border-emerald-900/10 bg-emerald-950/5">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-3.5 h-3.5 text-emerald-500 opacity-50" />
            <h2 className="text-[9px] font-black tracking-[0.4em] uppercase text-emerald-100/40">Global Pulse</h2>
          </div>
          <TacticalMiniMap />
          <div className="mt-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-mono text-emerald-900/40 uppercase tracking-widest">
              Match Min {matchMinute} | {surgeActive ? '⚡ SURGE ACTIVE' : 'GRID: NOMINAL'}
            </span>
          </div>
        </div>

        {/* Authorize / Spin Agent Button */}
        <div className="hud-panel rounded-xl p-4 border-emerald-900/10 bg-emerald-950/5">
          <div className="flex items-center gap-2 mb-3 opacity-70">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <h2 className="text-[9px] font-black tracking-[0.4em] uppercase text-emerald-100/40">Node Control</h2>
          </div>
          
          {/* Show offline state prominently */}
          {isOffline && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-3 flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[9px] font-mono font-black text-red-400 uppercase tracking-widest">
                {agentStatus === 'exhausted' ? 'Budget Exhausted' : 'Agent Offline'}
              </span>
            </motion.div>
          )}

          <div className="flex gap-2">
            {/* Spin Agent / Authorize button — replaces revoke when offline */}
            {isOffline ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex-1 py-2 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                  <BrainCircuit className="w-3 h-3" />
                </motion.div>
                SPIN AGENT
              </button>
            ) : (
              <button
                onClick={isAuthorized ? () => revokeAgent() : () => setShowAuthModal(true)}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  isAuthorized 
                    ? 'bg-red-900/20 border border-red-900/30 text-red-500/60 hover:bg-red-900/30'
                    : 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30'
                }`}
              >
                {isAuthorized ? 'REVOKE' : 'AUTHORIZE'}
              </button>
            )}

            {/* Manual cycle trigger */}
            {isAuthorized && !isOffline && (
              <button
                onClick={() => triggerAgentCycle()}
                disabled={agentRunning}
                className="flex-1 py-2 rounded-lg bg-emerald-600/10 border border-emerald-900/30 text-emerald-900/60 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600/20 hover:text-emerald-400 transition-all disabled:opacity-40"
              >
                {agentRunning ? 'Running...' : 'RUN CYCLE'}
              </button>
            )}
          </div>
          
          {!isOffline && (
            <p className="text-[8px] text-emerald-900/40 mt-3 font-mono tracking-tighter uppercase">
              {isExecuting ? 'SEQ_EXECUTING' : 'NODE_OPERATIONAL'} | LATENCY: 12ms | UPTIME: 99.9%
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
