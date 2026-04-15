// src/components/market/AtmosphericMarket.tsx
import React, { useState } from 'react';
import { useCarbonStore, MarketAsset } from '../../store/useCarbonStore';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Leaf, CheckCircle2, Zap, BarChart2 } from 'lucide-react';

const AssetCard = ({ asset }: { asset: MarketAsset }) => {
  const { quickBuyAsset, quickBuySuccess, maxTxUsd, isAuthorized } = useCarbonStore();
  const [buying, setBuying] = useState(false);
  const isPositive = asset.change >= 0;
  const justBought = quickBuySuccess === asset.symbol;

  const handleQuickBuy = async () => {
    if (!isAuthorized || buying) return;
    setBuying(true);
    await quickBuyAsset(asset.symbol, Math.min(maxTxUsd, 10));
    setBuying(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative p-3 rounded-xl border border-emerald-900/20 bg-emerald-950/10 hover:bg-emerald-950/20 hover:border-emerald-700/30 transition-all duration-300"
    >
      {/* Quick buy success flash */}
      <AnimatePresence>
        {justBought && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-emerald-900/90 rounded-xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-black text-sm">PURCHASED!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-black text-white tracking-wider">{asset.symbol}</div>
            <div className="text-[8px] font-mono text-emerald-900/40">{asset.chain}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-black font-mono text-white">${asset.price.toFixed(2)}</div>
          <div className={`flex items-center gap-0.5 text-[8px] font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {Math.abs(asset.change).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[8px] font-mono text-emerald-900/40">
          TVL: ${(asset.tvl / 1000).toFixed(0)}K
        </div>
        <motion.button
          whileHover={{ scale: isAuthorized ? 1.05 : 1 }}
          whileTap={{ scale: isAuthorized ? 0.95 : 1 }}
          onClick={handleQuickBuy}
          disabled={!isAuthorized || buying}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
            isAuthorized 
              ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 cursor-pointer'
              : 'bg-emerald-950/10 border border-emerald-900/10 text-emerald-900/30 cursor-not-allowed'
          }`}
        >
          {buying ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
              <Zap className="w-2.5 h-2.5" />
            </motion.div>
          ) : (
            <Zap className="w-2.5 h-2.5" />
          )}
          {buying ? 'Buying...' : 'Buy'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export const AtmosphericMarket: React.FC = () => {
  const { marketAssets, quickBuySuccess, isAuthorized } = useCarbonStore();
  const assets = Object.values(marketAssets);

  return (
    <div className="h-full flex flex-col p-5 relative overflow-hidden">
      {/* Global quick buy success toast */}
      <AnimatePresence>
        {quickBuySuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black rounded-full font-black text-xs shadow-[0_0_30px_rgba(16,185,129,0.6)]"
          >
            <CheckCircle2 className="w-4 h-4" />
            {quickBuySuccess} PURCHASE CONFIRMED ✓
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-emerald-500" />
          <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-emerald-400">Atmospheric Assets</h2>
        </div>
        {!isAuthorized && (
          <span className="text-[7px] font-mono text-emerald-900/40 uppercase tracking-widest">Authorize agent to buy</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-grow custom-scrollbar">
        {assets.map((asset) => (
          <AssetCard key={asset.symbol} asset={asset} />
        ))}
      </div>
    </div>
  );
};
