// src/store/useCarbonStore.ts
import { create } from 'zustand';
import { SystemLog } from '../types';

interface CarbonStore {
  logs: SystemLog[];
  ambientBase: number;
  stadiumBase: number;
  simulationFactor: number;
  performanceMetrics: {
    accuracy: number;
    efficiency: number;
  };
  transactionStep: number;
  isExecuting: boolean;
  filter: 'all' | 'api' | 'nodal';
  setFilter: (filter: 'all' | 'api' | 'nodal') => void;
  addLog: (message: string, level?: SystemLog['level']) => void;
  setSimulationFactor: (val: number) => void;
  executeTransaction: () => void;
  initSimulation: () => void;
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
  "Analyzing ambient city network load variations..."
];

export const useCarbonStore = create<CarbonStore>((set, get) => ({
  logs: [],
  ambientBase: 450,
  stadiumBase: 120,
  simulationFactor: 1.8, // Start at Heatwave for cinematic effect
  performanceMetrics: {
    accuracy: 99.8,
    efficiency: 94
  },
  transactionStep: -1,
  isExecuting: false,
  filter: 'all',

  setFilter: (filter) => set({ filter }),

  addLog: (message, level = 'info') => {
    set((state) => ({
      logs: [...state.logs, { id: generateId(), timestamp: getTime(), message, level }].slice(-50)
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

  initSimulation: () => {
    setInterval(() => {
      const { isExecuting, addLog } = get();
      if (!isExecuting && Math.random() > 0.6) {
        const msg = SIMULATED_MESSAGES[Math.floor(Math.random() * SIMULATED_MESSAGES.length)];
        const level = Math.random() > 0.8 ? 'warning' : Math.random() > 0.9 ? 'success' : 'info';
        addLog(msg, level);
      }
    }, 3000);
  }
}));
