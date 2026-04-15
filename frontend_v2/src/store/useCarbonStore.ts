import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_BASE = window.location.port === '5173' || window.location.port === '3000' ? `http://${window.location.hostname}:5000` : '';

export interface SystemLog {
  id: string;
  timestamp: string;
  message: string;
  level: 'info' | 'warning' | 'success' | 'error';
}

export interface User {
  id: string;
  name: string;
}

export interface AgentDecision {
  timestamp: number | null;
  running: boolean;
  result: {
    match_id?: string;
    calculated_footprint_kg?: number;
    amount_usd?: number;
    is_surge_event?: boolean;
    blocked?: boolean;
    blocked_reason?: string;
    capped_to_limit?: boolean;
    capped_to_remaining?: boolean;
    dest_chain?: string;
    metadata?: {
      token_symbol?: string;
      event_type?: string;
      is_surge?: boolean;
      grid_intensity_gco2_kwh?: number;
      timestamp?: string;
    };
    error?: string;
    status?: string;
    tx_hash?: string;
  } | null;
}

interface CarbonStore {
  user: User | null;
  
  // Counters
  remainingBudget: number;
  totalOffset: number;
  globalTotalOffset: number;
  
  // Logs
  logs: SystemLog[];
  fullHistory: any[];
  agentHistory: any[];
  
  // Tx Limits (Preimages)
  authorizedTxCount: number;
  remainingTxCount: number;
  
  // Config
  isAgentActive: boolean;
  
  // Agent Decision (last cycle result)
  lastAgentCycle: AgentDecision;
  fetchLastAgentCycle: () => Promise<void>;
  triggerAgentCycle: () => Promise<any>;
  
  // Actions
  login: (username: string, pass: string) => Promise<boolean>;
  signup: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  fetchStats: () => Promise<void>;
  fetchLedger: () => Promise<void>;
  fetchFullHistory: () => Promise<void>;
  fetchAgentHistory: () => Promise<void>;
  revokeAgent: () => Promise<void>;
  restoreAgent: () => Promise<void>;
  forceBuy: (amount: number) => Promise<void>;
  setPaymentAuthorized: (val: boolean) => void;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  liveFeed: any;
  fetchLiveFeed: () => Promise<void>;
  
  // Web3 Authorization
  isPaymentAuthorized: boolean;
  authorizePayment: (budget: number, txLimit?: number) => Promise<boolean>;

  uiMessage: { text: string; type: 'success' | 'error' } | null;
  setUiMessage: (text: string, type: 'success' | 'error') => void;
  clearUiMessage: () => void;

  // Demo Control
  auditOffsetMinutes: number;
  accelerateAudit: (mins: number) => void;
  claimFaucet: () => Promise<boolean>;
  lastFaucetClaim: number | null;
}

export const useCarbonStore = create<CarbonStore>()(
  persist(
    (set, get) => ({
      user: null,
      remainingBudget: 0,
      totalOffset: 0,
      globalTotalOffset: 0,
      logs: [],
      fullHistory: [],
      agentHistory: [],
      authorizedTxCount: 0,
      remainingTxCount: 0,
      isAgentActive: true,
      isLoading: false,
      error: null,
      isDemoMode: false,
      liveFeed: null,
      isPaymentAuthorized: false,
      auditOffsetMinutes: 0,
      lastFaucetClaim: null,
      lastAgentCycle: { timestamp: null, running: false, result: null },

      toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),

      accelerateAudit: (mins: number) => set((state) => ({ 
        auditOffsetMinutes: state.auditOffsetMinutes + mins 
      })),

      // ── Agent Cycle Actions ────────────────────────────────────────────
      
      fetchLastAgentCycle: async () => {
        try {
          const res = await axios.get(`${API_BASE}/agent/last-cycle`);
          if (res.data.ok && res.data.data) {
            set({ lastAgentCycle: res.data.data });
          }
        } catch (err) {
          // Silent — agent cycle endpoint may not be available
        }
      },

      triggerAgentCycle: async () => {
        const { user, isAgentActive, isPaymentAuthorized, setUiMessage } = get();
        if (!user) return null;
        if (!isAgentActive || !isPaymentAuthorized) {
          console.log('[Store] Agent not active or not authorized, skipping cycle');
          return null;
        }

        try {
          set({ lastAgentCycle: { ...get().lastAgentCycle, running: true } });
          const res = await axios.post(`${API_BASE}/agent/run-cycle`, { user_id: user.id });
          
          if (res.data.ok) {
            // Poll for the result after a short delay (agent runs in a thread)
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Fetch the actual result
            const cycleRes = await axios.get(`${API_BASE}/agent/last-cycle`);
            if (cycleRes.data.ok && cycleRes.data.data) {
              const cycleData = cycleRes.data.data;
              set({ lastAgentCycle: cycleData });
              
              const result = cycleData.result;
              if (result) {
                if (result.error) {
                  setUiMessage(`Agent Cycle Error: ${result.error}`, 'error');
                } else if (result.blocked) {
                  setUiMessage(`Agent Cycle: ${result.blocked_reason || 'Blocked by policy'}`, 'error');
                } else {
                  const surge = result.is_surge_event ? ' ⚡ SURGE DETECTED' : '';
                  const capped = result.capped_to_remaining ? ' (capped to budget)' : '';
                  setUiMessage(
                    `Agent Cycle Complete${surge}: Offset ${result.calculated_footprint_kg?.toFixed(1) || '?'}kg CO₂ → $${result.amount_usd?.toFixed(4) || '?'} ${result.metadata?.token_symbol || 'BCT'}${capped}`,
                    'success'
                  );
                }
              }
            }
            
            // Refresh stats after cycle
            await get().fetchStats();
            await get().fetchLedger();
            return res.data;
          }
          return null;
        } catch (err) {
          console.error('Agent Cycle Error:', err);
          set({ lastAgentCycle: { ...get().lastAgentCycle, running: false } });
          setUiMessage('Agent cycle failed — backend may be offline', 'error');
          return null;
        }
      },

      // ── Faucet ─────────────────────────────────────────────────────────

      claimFaucet: async () => {
        const { user, lastFaucetClaim, setUiMessage } = get();
        if (!user) return false;

        // 5 minute cooldown for demo
        const COOLDOWN_MS = 5 * 60 * 1000;
        if (lastFaucetClaim && Date.now() - lastFaucetClaim < COOLDOWN_MS) {
          const remainingMins = Math.ceil((COOLDOWN_MS - (Date.now() - lastFaucetClaim)) / 60000);
          setUiMessage(`Faucet already used — please wait ${remainingMins} minutes`, "error");
          return false;
        }

        set({ isLoading: true });
        try {
          const res = await axios.post(`${API_BASE}/demo/faucet`, { user_id: user.id });
          if (res.data.ok) {
            set({ 
              lastFaucetClaim: Date.now(),
              isPaymentAuthorized: true,
              isAgentActive: true,
              remainingBudget: 10000,
              authorizedTxCount: 100,
              remainingTxCount: 100
            });
            setUiMessage("✓ 10,000 USD added to your account", "success");
            await get().fetchStats();
            return true;
          }
          return false;
        } catch (err) {
          console.error("Faucet Error:", err);
          // Fallback to local if API fails (Option B style)
          set({ 
            lastFaucetClaim: Date.now(),
            remainingBudget: (get().remainingBudget || 0) + 10000,
            isPaymentAuthorized: true,
            isAgentActive: true
          });
          setUiMessage("✓ 10,000 USD added to your account (offline mode)", "success");
          return true;
        } finally {
          set({ isLoading: false });
        }
      },

      authorizePayment: async (budget: number, txLimit: number = 20) => {
        const { user } = get();
        if (!user) return false;
        set({ isLoading: true });
        try {
          // Update the backend configuration first
          const res = await axios.post(`${API_BASE}/user/${user.id}/config`, {
            budget_usd: budget,
            authorized_tx_count: txLimit,
            is_active: true,
            auto_execute: true
          });
          
          if (res.data.ok) {
            set({ isPaymentAuthorized: true, authorizedTxCount: txLimit, isAgentActive: true });
            get().setUiMessage(`Protocol Authorized with $${budget} allowance and ${txLimit} transactions.`, "success");
            await get().fetchStats();
            return true;
          }
          return false;
        } catch (err) {
          console.error("Authorization Error:", err);
          get().setUiMessage("Failed to authorize agent on the network.", "error");
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchLiveFeed: async () => {
        try {
          const res = await axios.get(`${API_BASE}/live-feed`);
          if (res.data.ok) {
            set({ liveFeed: res.data.data });
          }
        } catch (err) {
          console.error("Live Feed Fetch Error:", err);
        }
      },
      uiMessage: null,

      setUiMessage: (text, type) => {
        set({ uiMessage: { text, type } });
        setTimeout(() => set({ uiMessage: null }), 4000);
      },
      clearUiMessage: () => set({ uiMessage: null }),

      login: async (username: string, pass: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post(`${API_BASE}/auth/login`, { username, password: pass });
          if (res.data.ok) {
            set({ user: { id: username, name: username } });
            await get().fetchStats();
            return true;
          }
          throw new Error("Invalid credentials");
        } catch (err: any) {
          set({ error: err.response?.data?.error || "Failed to login. Please check your credentials." });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (username: string, pass: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post(`${API_BASE}/auth/signup`, { username, password: pass });
          if (res.data.ok) {
            set({ 
              user: { id: username, name: username },
              remainingBudget: 50.0,
              isAgentActive: true
            });
            return true;
          }
          throw new Error("Failed to sign up");
        } catch (err: any) {
          set({ error: err.response?.data?.error || "Username already exists." });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
logout: () => {
  set({ user: null, logs: [], remainingBudget: 0, totalOffset: 0, globalTotalOffset: 0 });
},

fetchStats: async () => {
  const { user } = get();
  if (!user) return;
  try {
    // Fetch user-specific stats
    const res = await axios.get(`${API_BASE}/user/${user.id}/budget-check?amount_usd=0`);

    // Fetch platform-wide stats
    const globalRes = await axios.get(`${API_BASE}/offsets`);

    if (res.data.ok) {
      const isDemo = get().isDemoMode;
      const multiplier = isDemo ? 1000 : 1;

      let globalTotal = res.data.data.spent_usd * 0.0045; // Default to user spent if global fails
      if (globalRes.data.ok) {
        globalTotal = (globalRes.data.data.total_footprint_kg_offset || 0) / 1000.0;
      }

            set({ 
              remainingBudget: (isDemo && res.data.data.remaining_usd < 5) ? 5000 : res.data.data.remaining_usd * multiplier,
              totalOffset: res.data.data.spent_usd * 0.0045 * multiplier,
              globalTotalOffset: globalTotal * multiplier,
              authorizedTxCount: res.data.data.authorized_tx_count || 0,
              remainingTxCount: (res.data.data.authorized_tx_count || 0) - (res.data.data.tx_count || 0),
              isAgentActive: !!res.data.data.is_active
            });

            // AUTO-TERMINATION LOGIC
            // If the agent is exhausted, mark it offline but DON'T de-authorize to allow dashboard viewing
            const { remainingBudget, remainingTxCount, isPaymentAuthorized } = get();
            if (isPaymentAuthorized && (remainingBudget <= 0 || remainingTxCount <= 0)) {
              set({ isAgentActive: false });
              get().setUiMessage("Sentinel Protocol exhausted. Agent is now offline. Spin up a new agent to continue.", "error");
            }
          }
        } catch (err) {
          console.warn("API Offline or Unreachable:", err);
        }
      },

      fetchLedger: async () => {
        const { user } = get();
        if (!user) return;
        try {
          const res = await axios.get(`${API_BASE}/ledger?per_page=10`);
          if (res.data.ok) {
            const mappedLogs = res.data.data.records.map((r: any) => {
              if (!r.timestamp) {
                return {
                  id: r.tx_hash || Math.random().toString(),
                  timestamp: 'Recent',
                  message: `Offset: ${r.footprint_kg}kg | ID: ${r.match_id}`,
                  level: 'success'
                };
              }
              // Fix Python date parsing (ensure timezone handled)
              const d = new Date(r.timestamp.endsWith('Z') || r.timestamp.includes('+') ? r.timestamp : r.timestamp + 'Z');
              const timeString = isNaN(d.getTime()) ? 'Unknown Time' : d.toLocaleTimeString();
              return {
                id: r.tx_hash,
                timestamp: timeString,
                message: `Offset: ${r.footprint_kg}kg | ID: ${r.match_id}`,
                level: 'success'
              };
            });
            set({ logs: mappedLogs });
          }
        } catch (err) {
          console.error("Ledger Fetch Error:", err);
        }
      },

      fetchFullHistory: async () => {
        const { user } = get();
        if (!user) return;
        try {
          const res = await axios.get(`${API_BASE}/user/${user.id}/ledger/supabase?limit=100`);
          if (res.data.ok) {
            set({ fullHistory: res.data.data });
          }
        } catch (err) {
          console.error("Full History Fetch Error:", err);
          get().setUiMessage("Failed to fetch full history from Supabase.", "error");
        }
      },

      fetchAgentHistory: async () => {
        const { user } = get();
        if (!user) return;
        try {
          const res = await axios.get(`${API_BASE}/user/${user.id}/agent-history`);
          if (res.data.ok) {
            set({ agentHistory: res.data.data });
          }
        } catch (err) {
          console.error("Agent History Fetch Error:", err);
        }
      },

      setPaymentAuthorized: (val) => set({ isPaymentAuthorized: val }),

      revokeAgent: async () => {
        const { user } = get();
        if (!user) return;
        set({ isLoading: true });
        try {
          const res = await axios.post(`${API_BASE}/user/${user.id}/revoke`);
          if (res.data.ok) {
            set({ isAgentActive: false, isPaymentAuthorized: false });
            get().setUiMessage("AI Agent terminated. Protocol deactivated.", "success");
          }
        } catch (err) {
          set({ error: "Failed to terminate agent" });
          get().setUiMessage("Failed to terminate agent.", "error");
        } finally {
          set({ isLoading: false });
        }
      },

      restoreAgent: async () => {
        const { user } = get();
        if (!user) return;
        set({ isLoading: true });
        try {
          const res = await axios.post(`${API_BASE}/user/${user.id}/restore`);
          if (res.data.ok) {
            set({ isAgentActive: true });
            get().setUiMessage("AI Agent restored successfully.", "success");
          }
        } catch (err) {
          set({ error: "Failed to restore agent" });
          get().setUiMessage("Failed to restore agent.", "error");
        } finally {
          set({ isLoading: false });
        }
      },

      forceBuy: async (amount: number) => {
        const { user, setUiMessage, remainingBudget } = get();
        if (!user) return;
        
        // Cap to remaining budget if it would exceed
        let finalAmount = amount;
        if (finalAmount > remainingBudget && remainingBudget > 0.01) {
          finalAmount = Math.floor(remainingBudget * 100) / 100; // floor to cents
          setUiMessage(`Amount capped to remaining budget: $${finalAmount.toFixed(2)}`, 'success');
        } else if (remainingBudget <= 0.01) {
          setUiMessage('Budget exhausted. Authorize a new budget to continue.', 'error');
          return;
        }
        
        set({ isLoading: true });
        try {
          const res = await axios.post(`${API_BASE}/user/${user.id}/force-buy/immediate`, { 
            amount_usd: finalAmount 
          });
          if (res.data.ok) {
            setUiMessage(`Protocol executed $${finalAmount.toFixed(2)} offset successfully!`, "success");
            await get().fetchStats();
            await get().fetchLedger();
          } else {
            throw new Error(res.data.error || "Execution failed");
          }
        } catch (err: any) {
          console.error("Force Buy Error:", err);
          const errMsg = err.response?.data?.error || err.message || "Execution blocked by agent policy.";
          setUiMessage(`Force Buy Failed: ${errMsg}`, "error");
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'carbon-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isDemoMode: state.isDemoMode,
        isPaymentAuthorized: state.isPaymentAuthorized,
        isAgentActive: state.isAgentActive,
        lastFaucetClaim: state.lastFaucetClaim
      }),
    }
  )
);
