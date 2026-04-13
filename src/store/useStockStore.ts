import { create } from 'zustand';
import { StoreState, Stock, AIDecision } from '../types';

export const useStockStore = create<StoreState>((set) => ({
  stocks: [],
  selectedStockSymbol: null,
  aiDecision: null,

  updateStockPrice: (symbol, newPrice) => set((state) => {
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    return {
      stocks: state.stocks.map((stock) => {
        if (stock.symbol === symbol) {
          const oldPrice = stock.currentPrice;
          const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;
          const history = [...stock.history, { time: timeString, price: newPrice }];
          // Keep only last 20 data points
          if (history.length > 20) history.shift();
          
          return {
            ...stock,
            currentPrice: newPrice,
            changePercent,
            history
          };
        }
        return stock;
      })
    };
  }),

  setSelectedStock: (symbol) => set({ selectedStockSymbol: symbol }),
  
  setAIDecision: (decision) => set({ aiDecision: decision }),
  
  initializeStocks: (stocks) => set({ 
    stocks, 
    selectedStockSymbol: stocks.length > 0 ? stocks[0].symbol : null 
  })
}));
