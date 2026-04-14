import { useEffect } from 'react';
import { useStockStore } from '../store/useStockStore';
import { Stock, AIDecision, AIAction } from '../types';

const INITIAL_STOCKS: Stock[] = [
  { symbol: 'BTC', name: 'Bitcoin', currentPrice: 64230.50, changePercent: 0.5, volatility: 0.8, history: generateInitialHistory(64000, 500) },
  { symbol: 'ETH', name: 'Ethereum', currentPrice: 3450.20, changePercent: -1.2, volatility: 0.6, history: generateInitialHistory(3500, 50) },
  { symbol: 'NVDA', name: 'Nvidia Corp', currentPrice: 1105.40, changePercent: 2.4, volatility: 0.5, history: generateInitialHistory(1080, 20) },
  { symbol: 'TSLA', name: 'Tesla Inc', currentPrice: 175.80, changePercent: -0.3, volatility: 0.7, history: generateInitialHistory(176, 5) },
];

function generateInitialHistory(basePrice: number, variance: number) {
  const history = [];
  const now = new Date();
  for (let i = 20; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 2000);
    history.push({
      time: `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`,
      price: basePrice + (Math.random() * variance * 2 - variance)
    });
  }
  return history;
}

const AI_REASONINGS = [
  "Pattern recognition suggests an impending breakout based on volume nodes.",
  "RSI divergence detected on the 5-minute timeframe.",
  "Whale accumulation identified in dark pool data.",
  "Macro sentiment shift reflecting neutral stance.",
  "Moving average crossover confirmation pending."
];

export function useDataSimulation() {
  const { initializeStocks, updateStockPrice, setAIDecision, stocks } = useStockStore();

  useEffect(() => {
    // Initialize
    initializeStocks(INITIAL_STOCKS);

    // Simulate price ticks
    const priceInterval = setInterval(() => {
      INITIAL_STOCKS.forEach(stock => {
        // Random walk
        const volatility = stock.volatility;
        const change = (Math.random() * volatility * 2) - volatility;
        const currentPrice = useStockStore.getState().stocks.find(s => s.symbol === stock.symbol)?.currentPrice || stock.currentPrice;
        
        const newPrice = Math.max(0.01, currentPrice * (1 + change / 100)); // percent change
        updateStockPrice(stock.symbol, newPrice);
      });
    }, 2000); // 2 seconds per tick

    // Simulate AI decision updates
    const aiInterval = setInterval(() => {
      const currentStocks = useStockStore.getState().stocks;
      if (currentStocks.length === 0) return;
      
      const randomStock = currentStocks[Math.floor(Math.random() * currentStocks.length)];
      const actions: AIAction[] = ['BUY', 'SELL', 'HOLD'];
      
      // Force analyzing state briefly
      setAIDecision({
        symbol: randomStock.symbol,
        action: 'ANALYZING',
        confidence: 0,
        reasoning: "Running quantum neural analysis..."
      });

      setTimeout(() => {
        const action = actions[Math.floor(Math.random() * actions.length)];
        const confidence = 65 + Math.floor(Math.random() * 30); // 65-94%
        const reasoning = AI_REASONINGS[Math.floor(Math.random() * AI_REASONINGS.length)];
        
        setAIDecision({
          symbol: randomStock.symbol,
          action,
          confidence,
          reasoning
        });
      }, 1500);

    }, 8000); // Every 8 seconds

    return () => {
      clearInterval(priceInterval);
      clearInterval(aiInterval);
    };
  }, []); // Run once on mount
}
