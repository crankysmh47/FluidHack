import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

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

interface CarbonStore {
  user: User | null;
  
  // Counters
  remainingBudget: number;
  totalOffset: number;
  
  // Logs
  logs: SystemLog[];
  
  // Config
  isAgentActive: boolean;
  
  // Actions
  login: (username: string, pass: string) => Promise<boolean>;
  signup: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  fetchStats: () => Promise<void>;
  fetchLedger: () => Promise<void>;
  revokeAgent: () => Promise<void>;
  forceBuy: (amount: number) => Promise<void>;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  liveFeed: any;
  fetchLiveFeed: () => Promise<void>;
  uiMessage: { text: string; type: 'success' | 'error' } | null;
  setUiMessage: (text: string, type: 'success' | 'error') => void;
  clearUiMessage: () => void;
}

export const useCarbonStore = create<CarbonStore>()(
  persist(
    (set, get) => ({
      user: null,
      remainingBudget: 0,
      totalOffset: 0,
      logs: [],
      isAgentActive: true,
      isLoading: false,
      error: null,
      isDemoMode: false,
      liveFeed: null,
      toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),

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
        set({ user: null, logs: [], remainingBudget: 0, totalOffset: 0 });
      },

      fetchStats: async () => {
        const { user } = get();
        if (!user) return;
        try {
          const res = await axios.get(`${API_BASE}/user/${user.id}/budget-check?amount_usd=0`);
          if (res.data.ok) {
            set({ 
              remainingBudget: res.data.data.remaining_usd,
              totalOffset: res.data.data.spent_usd * 0.0045 // Mock conversion
            });
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

      revokeAgent: async () => {
        const { user } = get();
        if (!user) return;
        set({ isLoading: true });
        try {
          const res = await axios.post(`${API_BASE}/user/${user.id}/revoke`);
          if (res.data.ok) {
            set({ isAgentActive: false });
            get().setUiMessage("AI Agent revoked successfully.", "success");
          }
        } catch (err) {
          set({ error: "Failed to revoke agent" });
          get().setUiMessage("Failed to revoke agent.", "error");
        } finally {
          set({ isLoading: false });
        }
      },

      forceBuy: async (amount: number) => {
        const { user } = get();
        if (!user) return;
        set({ isLoading: true });
        try {
          const res = await axios.post(`${API_BASE}/user/${user.id}/force-buy`, {
            amount_usd: amount,
            match_id: "MANUAL_WEB_TRIGGER"
          });
          if (res.data.ok) {
            await get().fetchStats();
            await get().fetchLedger();
            get().setUiMessage(`Force buy of $${amount} successfully queued.`, "success");
          }
        } catch (err) {
          set({ error: "Force buy failed" });
          get().setUiMessage("Force buy failed.", "error");
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'carbon-storage',
      partialize: (state) => ({ user: state.user, isDemoMode: state.isDemoMode }),
    }
  )
);
