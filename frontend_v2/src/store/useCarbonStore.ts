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
  email: string;
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
  login: (email: string) => Promise<boolean>;
  signup: (name: string, email: string) => Promise<boolean>;
  logout: () => void;
  fetchStats: () => Promise<void>;
  fetchLedger: () => Promise<void>;
  revokeAgent: () => Promise<void>;
  forceBuy: (amount: number) => Promise<void>;
  
  // UI State
  isLoading: boolean;
  error: string | null;
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

      login: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const userId = `usr_${btoa(email).replace(/=/g, '')}`;
          const res = await axios.get(`${API_BASE}/user/${userId}/config`);
          if (res.data.ok) {
            set({ 
              user: { 
                id: userId, 
                name: res.data.data.display_name || email.split('@')[0], 
                email 
              },
              remainingBudget: res.data.data.budget_usd - res.data.data.spent_usd,
              isAgentActive: res.data.data.is_active
            });
            await get().fetchStats();
            return true;
          }
          throw new Error("User not found");
        } catch (err) {
          set({ error: "Failed to login. Please check your email or sign up." });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (name: string, email: string) => {
        set({ isLoading: true, error: null });
        try {
          const userId = `usr_${btoa(email).replace(/=/g, '')}`;
          // Init config on backend
          await axios.post(`${API_BASE}/user/${userId}/config`, {
            display_name: name,
            budget_usd: 50.0 // Starting budget
          });
          
          set({ 
            user: { id: userId, name, email },
            remainingBudget: 50.0,
            isAgentActive: true
          });
          return true;
        } catch (err) {
          set({ error: "Failed to sign up." });
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
            const mappedLogs = res.data.data.records.map((r: any) => ({
              id: r.tx_hash,
              timestamp: new Date(r.timestamp).toLocaleTimeString(),
              message: `Offset: ${r.footprint_kg}kg | ID: ${r.match_id}`,
              level: 'success'
            }));
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
          }
        } catch (err) {
          set({ error: "Failed to revoke agent" });
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
          }
        } catch (err) {
          set({ error: "Force buy failed" });
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'carbon-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
