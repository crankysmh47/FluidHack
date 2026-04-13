export interface PriceData {
  time: string;
  price: number;
}

export interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  changePercent: number; // For the gauge
  volatility: number;    // Additional metric for the gauge
  history: PriceData[];
}

export type AIAction = 'BUY' | 'SELL' | 'HOLD' | 'ANALYZING';

export interface AIDecision {
  symbol: string;
  action: AIAction;
  confidence: number;
  reasoning: string;
}

export interface StoreState {
  stocks: Stock[];
  selectedStockSymbol: string | null;
  aiDecision: AIDecision | null;
  updateStockPrice: (symbol: string, newPrice: number) => void;
  setSelectedStock: (symbol: string) => void;
  setAIDecision: (decision: AIDecision) => void;
  initializeStocks: (stocks: Stock[]) => void;
}
