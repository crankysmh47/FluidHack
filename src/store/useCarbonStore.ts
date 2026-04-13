// src/store/useCarbonStore.ts
import { create } from 'zustand';
import { SystemLog } from '../types';

interface CarbonStore {
  logs: SystemLog[];
  ambientBase: number;
  stadiumBase: number;
  simulationFactor: number;
  transactionStep: number;
  isExecuting: boolean;
  addLog: (message: string, level?: SystemLog['level']) => void;
  setSimulationFactor: (val: number) => void;
  executeTransaction: () => void;
  initSimulation: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);
const getTime = () => new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

const SIMULATED_MESSAGES = [
  "Fetching Sindh grid data...",
  "Calling DefiLlama API...",
  "Analyzing liquidity pools...",
  "Calculating localized emissions...",
  "Monitoring nodal variations...",
  "Checking Toucan Protocol bridge status..."
];

export const useCarbonStore = create<CarbonStore>((set, get) => ({
  logs: [],
  ambientBase: 450,
  stadiumBase: 120,
  simulationFactor: 1,
  transactionStep: -1,
  isExecuting: false,

  addLog: (message, level = 'info') => {
    set((state) => ({
      logs: [...state.logs, { id: generateId(), timestamp: getTime(), message, level }].slice(-50) // Keep last 50 logs
    }));
  },

  setSimulationFactor: (val) => set({ simulationFactor: val }),

  executeTransaction: () => {
    if (get().isExecuting) return;
    
    set({ isExecuting: true, transactionStep: 0 });
    const { addLog } = get();
    
    addLog("INITIATING OFFSET EXECUTION", "warning");
    addLog("Optimal offset found: BCT", "success");

    const steps = [
      { msg: "Verifying Preimage...", delay: 1000 },
      { msg: "Locking funds in Base Vault...", delay: 2500 },
      { msg: "Bridging assets via LayerZero...", delay: 4000 },
      { msg: "Executing Polygon Swap (USDC -> BCT)...", delay: 5500 },
      { msg: "Retiring Credit on-chain...", delay: 7000 }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        set({ transactionStep: index });
        addLog(step.msg, "info");
      }, step.delay);
    });

    setTimeout(() => {
      set({ isExecuting: false, transactionStep: 5 });
      addLog("TRANSACTION COMPLETE. Carbon offset verified.", "success");
    }, 8500);
  },

  initSimulation: () => {
    // Background AI thinking simulation
    setInterval(() => {
      const { isExecuting, addLog } = get();
      if (!isExecuting && Math.random() > 0.6) {
        const msg = SIMULATED_MESSAGES[Math.floor(Math.random() * SIMULATED_MESSAGES.length)];
        addLog(msg, "info");
      }
    }, 2000);
  }
}));
