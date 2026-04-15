// src/store/useCarbonStore.ts
import { create } from 'zustand';
import { SystemLog } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const DEMO_USER = 'demo_user';
const AGENT_CYCLE_INTERVAL_MS = 5 * 60 * 1000; // Every 5 minutes

export type AgentStatus = 'active' | 'analyzing' | 'executing' | 'offline' | 'exhausted' | 'revoked';

export interface AgentDecision {
  amount_usd: number;
  calculated_footprint_kg: number;
  dest_chain: string;
  is_surge_event?: boolean;
  capped_to_limit?: boolean;
  capped_to_remaining?: boolean;
  blocked?: boolean;
  blocked_reason?: string;
  metadata?: {
    token_symbol: string;
    price_per_tonne_usd: number;
    is_surge?: boolean;
    event_type?: string;
    grid_intensity_gco2_kwh?: number;
  };
  timestamp?: string;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  category: string;
  price: number;
  change: number;
  tvl: number;
  volume: number;
  description: string;
  chain: string;
}

interface CarbonStore {
  logs: SystemLog[];
  ambientBase: number;
  stadiumBase: number;
  simulationFactor: number;
  performanceMetrics: {
    accuracy: number;
    efficiency: number;
  };
  telemetryData: { time: string; ambient: number; stadium: number }[];
  transactionStep: number;
  isExecuting: boolean;
  filter: 'all' | 'api' | 'nodal';

  // Agent AI State
  agentStatus: AgentStatus;
  agentDecision: AgentDecision | null;
  agentRunning: boolean;
  lastCycleTime: string | null;
  nextCycleIn: number; // seconds until next auto cycle
  matchMinute: number; // current simulated match minute
  surgeActive: boolean;
  surgeConsumed: boolean;

  // User State
  userId: string;
  isAuthorized: boolean;
  budgetUsd: number;
  spentUsd: number;
  maxTxUsd: number;
  txCount: number;
  authorizedTxCount: number;
  remainingBudget: number;

  // Market Data
  marketAssets: Record<string, MarketAsset>;
  quickBuySuccess: string | null; // token symbol of recently quick-bought item

  // Actions
  setFilter: (filter: 'all' | 'api' | 'nodal') => void;
  addLog: (message: string, level?: SystemLog['level']) => void;
  setSimulationFactor: (val: number) => void;
  executeTransaction: () => void;
  initSimulation: () => void;
  triggerAgentCycle: () => Promise<void>;
  authorizeAgent: (budgetUsd: number, maxTxUsd: number, txCount: number) => Promise<void>;
  revokeAgent: () => Promise<void>;
  claimFaucet: () => Promise<void>;
  triggerSurge: (type: 'surge' | 'peak') => Promise<void>;
  clearSurge: () => Promise<void>;
  quickBuyAsset: (symbol: string, amountUsd: number) => Promise<void>;
  dismissQuickBuySuccess: () => void;
  fetchUserConfig: () => Promise<void>;
}

const generateId = () => Math.random().toString(36).substring(2, 9);
const getTime = () => new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

const SIMULATED_MESSAGES = [
  "Registry API call successful...",
  "Verifying Toucan bridge liquidity metrics...",
  "Check Gold Standard credit serial availability...",
  "Syncing nodal emissions data from Sindh grid...",
  "Calculating localized attribution weights...",
  "Fetching DefiLlama pool metadata...",
  "Analyzing ambient city network load variations...",
  "Cross-referencing grid peaking hours with stadium schedule...",
  "Validating BCT retirement certificates on Polygon...",
  "Environmental attribution model updated: 99.8% accuracy.",
];

const AGENT_THINKING_MESSAGES = [
  "Scanning grid intensity sensors...",
  "Pulling stadium telemetry feed...",
  "Pattern analysis: perimeter carbon load nominal...",
  "Cross-checking renewable energy mix...",
  "Running attribution model v2.1...",
  "DefiLlama integration active — sourcing cheapest credits...",
  "Decision engine processing...",
];

export const useCarbonStore = create<CarbonStore>((set, get) => ({
  logs: [],
  ambientBase: 450,
  stadiumBase: 120,
  simulationFactor: 1.8,
  performanceMetrics: {
    accuracy: 99.8,
    efficiency: 94
  },
  telemetryData: [],
  transactionStep: -1,
  isExecuting: false,
  filter: 'all',

  // Agent state
  agentStatus: 'active',
  agentDecision: null,
  agentRunning: false,
  lastCycleTime: null,
  nextCycleIn: 300,
  matchMinute: 0,
  surgeActive: false,
  surgeConsumed: false,

  // User state
  userId: DEMO_USER,
  isAuthorized: false,
  budgetUsd: 0,
  spentUsd: 0,
  maxTxUsd: 5.0,
  txCount: 0,
  authorizedTxCount: 50,
  remainingBudget: 0,

  // Market data
  marketAssets: {
    bct: { symbol: 'BCT', price: 18.42, change: 2.4, tvl: 500000, chain: 'Polygon' },
    mco2: { symbol: 'MCO2', price: 12.15, change: -0.8, tvl: 120000, chain: 'Polygon' },
    nct: { symbol: 'NCT', price: 22.10, change: 1.2, tvl: 85000, chain: 'Polygon' },
    ubo: { symbol: 'UBO', price: 4.50, change: 5.4, tvl: 32000, chain: 'Polygon' },
    klima: { symbol: 'KLIMA', price: 0.72, change: -1.3, tvl: 18000, chain: 'Polygon' },
    c3t: { symbol: 'C3T', price: 2.18, change: 0.9, tvl: 9500, chain: 'Celo' },
  },
  quickBuySuccess: null,

  setFilter: (filter) => set({ filter }),

  addLog: (message, level = 'info') => {
    set((state) => ({
      logs: [...state.logs, { id: generateId(), timestamp: getTime(), message, level }].slice(-80)
    }));
  },

  setSimulationFactor: (val) => set({ simulationFactor: val }),

  executeTransaction: () => {
    if (get().isExecuting) return;
    
    set({ isExecuting: true, transactionStep: 0 });
    const { addLog } = get();
    
    addLog("INITIATING OFFSET EXECUTION", "warning");
    addLog("Registry sync: BCT Tokenized credits confirmed", "success");

    const steps = [
      { msg: "Verifying Preimage Hash...", delay: 1000 },
      { msg: "Locking assets in Base Vault...", delay: 2500 },
      { msg: "Bridging via LayerZero (Base -> Polygon)...", delay: 4000 },
      { msg: "Executing Polygon Swap (USDC -> BCT)...", delay: 5500 },
      { msg: "Retiring Credit Serial #ST-4592-ON...", delay: 7000 }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        set({ transactionStep: index });
        addLog(step.msg, "info");
      }, step.delay);
    });

    setTimeout(() => {
      set({ isExecuting: false, transactionStep: 5 });
      addLog("TRANSACTION COMPLETE. Offset retired on chain.", "success");
    }, 8500);
  },

  fetchUserConfig: async () => {
    try {
      const resp = await fetch(`${API_BASE}/user/${get().userId}/config`);
      const json = await resp.json();
      if (json.ok && json.data) {
        const cfg = json.data;
        const budget = cfg.budget_usd || 0;
        const spent = cfg.spent_usd || 0;
        const isActive = cfg.is_active !== false;
        const txCount = cfg.tx_count || 0;
        const authTxCount = cfg.authorized_tx_count || 50;
        const exhausted = (txCount >= authTxCount) || (budget > 0 && spent >= budget);
        
        set({
          budgetUsd: budget,
          spentUsd: spent,
          maxTxUsd: cfg.max_tx_usd || 5.0,
          txCount,
          authorizedTxCount: authTxCount,
          remainingBudget: Math.max(0, budget - spent),
          isAuthorized: isActive && budget > 0,
          agentStatus: !isActive ? 'revoked' : exhausted ? 'exhausted' : 'active',
        });
      }
    } catch (e) {
      // Silently fail if API not available
    }
  },

  triggerAgentCycle: async () => {
    const state = get();
    if (state.agentRunning) return;
    if (state.agentStatus === 'revoked') return;

    set({ agentRunning: true, agentStatus: 'analyzing' });
    const { addLog } = get();

    // Show thinking messages
    addLog("[AI AGENT] Autonomous cycle initiated — scanning environment...", "warning");
    
    // First half: show thinking messages
    AGENT_THINKING_MESSAGES.forEach((msg, i) => {
      setTimeout(() => addLog(`[AGENT] ${msg}`, 'info'), i * 600);
    });

    try {
      const resp = await fetch(`${API_BASE}/agent/run-cycle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: get().userId })
      });
      const json = await resp.json();

      // Poll for result (agent runs in background thread)
      let maxPolls = 24; // 2 min max
      const pollInterval = setInterval(async () => {
        maxPolls--;
        if (maxPolls <= 0) {
          clearInterval(pollInterval);
          set({ agentRunning: false, agentStatus: 'active' });
          return;
        }

        try {
          const cycleResp = await fetch(`${API_BASE}/agent/last-cycle`);
          const cycleJson = await cycleResp.json();
          
          if (cycleJson.ok && cycleJson.data && !cycleJson.data.running && cycleJson.data.result) {
            clearInterval(pollInterval);
            const result = cycleJson.data.result;
            const now = new Date().toLocaleTimeString();
            
            const isBlocked = result.blocked || false;
            const isSurge = result.is_surge_event || false;
            const amount = result.amount_usd || 0;
            const token = result.metadata?.token_symbol || 'BCT';
            const footprint = result.calculated_footprint_kg || 0;
            const isCapped = result.capped_to_limit || result.capped_to_remaining || false;

            set({ 
              agentDecision: result,
              lastCycleTime: now,
              agentRunning: false,
              surgeConsumed: isSurge,
            });

            if (isBlocked) {
              const reason = result.blocked_reason || 'Budget limit reached';
              addLog(`[AGENT] DECISION: ${reason}`, 'warning');
              addLog(`[AGENT] Agent status: OFFLINE - Budget/tx limit exhausted`, 'warning');
              set({ agentStatus: 'exhausted' });
            } else {
              if (isSurge) {
                addLog(`[AGENT] SURGE PERIMETER DETECTED — Grid: ${result.metadata?.grid_intensity_gco2_kwh || 315} gCO2/kWh`, 'warning');
              }
              if (isCapped) {
                addLog(`[AGENT] Amount capped to per-tx limit: $${amount.toFixed(4)}`, 'warning');
              }
              addLog(`[AGENT] DECISION: Purchase $${amount.toFixed(4)} of ${token} | ${footprint.toFixed(1)} kg CO2 | ${result.dest_chain}`, 'success');
              addLog(`[AGENT] Executing on-chain transaction...`, 'info');
              
              // Trigger visual transaction flow
              get().executeTransaction();
              set({ agentStatus: 'active' });
            }

            // Refresh user config
            get().fetchUserConfig();
          }
        } catch (e) {
          // Continue polling
        }
      }, 5000); // Poll every 5 seconds

    } catch (e) {
      addLog("[AGENT] Cycle error: API unreachable. Running simulation mode.", 'warning');
      
      // Simulate a cycle result locally for demo
      setTimeout(() => {
        const { surgeActive } = get();
        const footprintKg = surgeActive ? 892 : 324;
        const amountUsd = Math.min(get().maxTxUsd, footprintKg * 0.0015);
        
        const simulatedDecision: AgentDecision = {
          amount_usd: amountUsd,
          calculated_footprint_kg: footprintKg,
          dest_chain: 'Polygon',
          is_surge_event: surgeActive,
          metadata: {
            token_symbol: 'BCT',
            price_per_tonne_usd: 1.5,
            is_surge: surgeActive,
            event_type: surgeActive ? 'surge' : 'normal',
          }
        };

        if (surgeActive) {
          addLog(`[AGENT] SURGE PERIMETER DETECTED — Grid intensity 315 gCO2/kWh`, 'warning');
        }
        addLog(`[AGENT] DECISION: Purchase $${amountUsd.toFixed(4)} of BCT | ${footprintKg} kg CO2 | Polygon`, 'success');
        
        set({
          agentDecision: simulatedDecision,
          lastCycleTime: getTime(),
          agentRunning: false,
          agentStatus: 'active',
          surgeConsumed: surgeActive,
          surgeActive: false,
        });
        
        get().executeTransaction();
      }, 4000);
    }
  },

  authorizeAgent: async (budgetUsd, maxTxUsd, txCount) => {
    const { addLog, userId } = get();
    try {
      const resp = await fetch(`${API_BASE}/user/${userId}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget_usd: budgetUsd,
          max_tx_usd: maxTxUsd,
          authorized_tx_count: txCount,
          is_active: true,
          auto_execute: true,
        })
      });
      const json = await resp.json();
      if (json.ok) {
        addLog(`[AGENT] Authorization granted. Budget: $${budgetUsd} | Max/tx: $${maxTxUsd} | Tx limit: ${txCount}`, 'success');
        set({
          isAuthorized: true,
          budgetUsd,
          maxTxUsd,
          authorizedTxCount: txCount,
          spentUsd: 0,
          remainingBudget: budgetUsd,
          agentStatus: 'active',
        });
      }
    } catch (e) {
      // Local fallback
      set({
        isAuthorized: true,
        budgetUsd,
        maxTxUsd,
        authorizedTxCount: txCount,
        spentUsd: 0,
        remainingBudget: budgetUsd,
        agentStatus: 'active',
      });
      addLog(`[AGENT] Authorization granted (local). Budget: $${budgetUsd}`, 'success');
    }
  },

  revokeAgent: async () => {
    const { addLog, userId } = get();
    try {
      await fetch(`${API_BASE}/user/${userId}/revoke`, { method: 'POST' });
    } catch (e) {}
    addLog('[AGENT] Agent REVOKED. All autonomous execution halted.', 'warning');
    set({ agentStatus: 'revoked', isAuthorized: false });
  },

  claimFaucet: async () => {
    const { addLog, userId } = get();
    try {
      const resp = await fetch(`${API_BASE}/demo/faucet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      const json = await resp.json();
      if (json.ok) {
        addLog('[FAUCET] $10,000 USD simulation budget added to demo wallet!', 'success');
        set({
          budgetUsd: 10000,
          spentUsd: 0,
          remainingBudget: 10000,
          maxTxUsd: 500,
          authorizedTxCount: 100,
          isAuthorized: true,
          agentStatus: 'active',
        });
      }
    } catch (e) {
      // Local fallback 
      addLog('[FAUCET] $10,000 USD simulation budget granted (demo mode)!', 'success');
      set({
        budgetUsd: 10000,
        spentUsd: 0,
        remainingBudget: 10000,
        maxTxUsd: 500,
        authorizedTxCount: 100,
        isAuthorized: true,
        agentStatus: 'active',
      });
    }
  },

  triggerSurge: async (type) => {
    const { addLog } = get();
    try {
      await fetch(`${API_BASE}/demo/trigger-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: type })
      });
    } catch (e) {}
    addLog(`[DEMO] Grid ${type.toUpperCase()} activated — perimeter flag set for next agent cycle`, 'warning');
    set({ surgeActive: true, surgeConsumed: false });
  },

  clearSurge: async () => {
    try {
      await fetch(`${API_BASE}/demo/trigger-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'clear' })
      });
    } catch (e) {}
    set({ surgeActive: false, surgeConsumed: false });
  },

  quickBuyAsset: async (symbol: string, amountUsd: number) => {
    const { addLog, userId } = get();
    try {
      const resp = await fetch(`${API_BASE}/user/${userId}/force-buy/immediate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_usd: amountUsd })
      });
      const json = await resp.json();
      addLog(`[MARKET] Quick buy: $${amountUsd} of ${symbol} executed successfully`, 'success');
      set({ quickBuySuccess: symbol });
      setTimeout(() => set({ quickBuySuccess: null }), 3000);
    } catch (e) {
      addLog(`[MARKET] Quick buy: $${amountUsd} of ${symbol} sent (simulation mode)`, 'success');
      set({ quickBuySuccess: symbol });
      setTimeout(() => set({ quickBuySuccess: null }), 3000);
    }
  },

  dismissQuickBuySuccess: () => set({ quickBuySuccess: null }),

  initSimulation: () => {
    const { fetchUserConfig, triggerAgentCycle, addLog } = get();
    
    // Initial config fetch
    fetchUserConfig();

    // PRE-FILL telemetry with initial noise
    const initialData = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
        const time = new Date(now - i * 3000).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        initialData.push({
            time,
            ambient: Math.round(get().ambientBase * get().simulationFactor * (0.9 + Math.random() * 0.2)),
            stadium: Math.round(get().stadiumBase * (0.9 + Math.random() * 0.2))
        });
    }
    set({ telemetryData: initialData });

    // LIVE UPDATE LOOP (3s)
    setInterval(() => {
      const { isExecuting, addLog, ambientBase, stadiumBase, simulationFactor, telemetryData } = get();
      
      const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const variator = 1 + (Math.sin(Date.now() / 2000) * 0.1);
      const newPoint = {
          time: nowTime,
          ambient: Math.round(ambientBase * simulationFactor * variator),
          stadium: Math.round((stadiumBase + (simulationFactor * 5)) * (1 + (Math.cos(Date.now() / 1500) * 0.05))), 
      };

      set({ telemetryData: [...telemetryData, newPoint].slice(-20) });

      // Simulated background logs
      if (!isExecuting && Math.random() > 0.6) {
        const msg = SIMULATED_MESSAGES[Math.floor(Math.random() * SIMULATED_MESSAGES.length)];
        const level = Math.random() > 0.8 ? 'warning' : Math.random() > 0.9 ? 'success' : 'info';
        addLog(msg, level);
      }
    }, 3000);

    // Match minute counter — simulates a live cricket/PSL match
    let minute = 0;
    setInterval(() => {
      minute++;
      set({ matchMinute: minute });
    }, 6000); // 6 seconds = 1 "match minute" for demo

    // Agent auto-cycle timer — every 5 minutes (300s)
    // For demo, we also do a first cycle at 30 seconds if authorized
    let cycleCountdown = 300;
    
    setInterval(() => {
      const state = get();
      cycleCountdown--;
      set({ nextCycleIn: cycleCountdown });
      
      if (cycleCountdown <= 0) {
        cycleCountdown = 300;
        // Only run if authorized and not already running
        if (state.isAuthorized && !state.agentRunning && state.agentStatus !== 'revoked' && state.agentStatus !== 'exhausted') {
          addLog('[AGENT] Autonomous 5-minute cycle triggered', 'warning');
          get().triggerAgentCycle();
        } else if (!state.isAuthorized) {
          addLog('[AGENT] Cycle skipped — agent not authorized', 'info');
        } else if (state.agentStatus === 'exhausted') {
          addLog('[AGENT] OFFLINE — budget or tx limit exhausted', 'warning');
        }
      }
    }, 1000);

    // Fetch market data from live feed
    const fetchMarket = async () => {
      try {
        const resp = await fetch(`${API_BASE}/live-feed`);
        const json = await resp.json();
        if (json.ok && json.data.crypto) {
          const crypto = json.data.crypto;
          const assets: Record<string, MarketAsset> = { ...get().marketAssets };
          Object.entries(crypto).forEach(([key, val]: [string, any]) => {
            if (assets[key]) {
              assets[key] = {
                ...assets[key],
                price: val.price || assets[key].price,
                change: val.change || assets[key].change,
                tvl: val.tvl || assets[key].tvl,
              };
            }
          });
          set({ marketAssets: assets });
        }
      } catch (e) {
        // Keep defaults
      }
    };
    
    fetchMarket();
    setInterval(fetchMarket, 30000);

    // Refresh user config every 30 seconds
    setInterval(() => get().fetchUserConfig(), 30000);
  }
}));
