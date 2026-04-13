import React from 'react';
import { StockGauge } from './StockGauge';
import { useStockStore } from '../../store/useStockStore';
import { motion } from 'framer-motion';

export function GaugeContainer() {
  const stocks = useStockStore(state => state.stocks);
  const selectedSymbol = useStockStore(state => state.selectedStockSymbol);
  const setSelectedStock = useStockStore(state => state.setSelectedStock);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex gap-4 w-full overflow-x-auto pb-4 pt-2 px-2 scrollbar-hide"
    >
      {stocks.map(stock => (
        <StockGauge
          key={stock.symbol}
          stock={stock}
          selected={selectedSymbol === stock.symbol}
          onClick={() => setSelectedStock(stock.symbol)}
        />
      ))}
    </motion.div>
  );
}
