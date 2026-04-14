import React, { useState, useEffect } from 'react';
import { useStockStore } from '../store/useStockStore';
import { Activity, BrainCircuit, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function TypewriterText({ text, speed = 30 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);

    return () => clearInterval(typingInterval);
  }, [text, speed]);

  return <span>{displayedText}</span>;
}

export function AIPanel() {
  const aiDecision = useStockStore(state => state.aiDecision);

  if (!aiDecision) {
    return (
      <div className="glass-panel rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center">
        <BrainCircuit className="w-12 h-12 text-gray-500 mb-4 animate-pulse-slow" />
        <div className="text-gray-400 font-mono">Initializing AI Core...</div>
      </div>
    );
  }

  const isAnalyzing = aiDecision.action === 'ANALYZING';
  
  const getActionColor = () => {
    switch (aiDecision.action) {
      case 'BUY': return 'text-green-400';
      case 'SELL': return 'text-red-400';
      case 'HOLD': return 'text-yellow-400';
      default: return 'text-cyan-400';
    }
  };

  const getActionBg = () => {
    switch (aiDecision.action) {
      case 'BUY': return 'bg-green-400/10 border-green-400/30';
      case 'SELL': return 'bg-red-400/10 border-red-400/30';
      case 'HOLD': return 'bg-yellow-400/10 border-yellow-400/30';
      default: return 'bg-cyan-400/10 border-cyan-400/30';
    }
  };

  return (
    <div className="glass-panel flex-1 rounded-2xl p-6 flex flex-col relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <BrainCircuit className={`w-8 h-8 ${isAnalyzing ? 'text-cyan-400 animate-pulse' : 'text-purple-500'}`} />
        <h2 className="text-xl font-bold uppercase tracking-widest text-gray-200">
          Neural Interface
        </h2>
        {isAnalyzing && (
          <span className="ml-auto flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={aiDecision.symbol + aiDecision.action}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1 flex flex-col"
        >
          <div className="mb-4">
            <div className="text-sm font-mono text-gray-500 mb-1">Target Asset</div>
            <div className="text-2xl font-bold tracking-wider">{aiDecision.symbol}</div>
          </div>

          <div className={`p-4 rounded-xl border ${getActionBg()} mb-6`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-mono text-gray-400">Recommendation</span>
              {isAnalyzing ? (
                <Activity className="w-5 h-5 text-cyan-400 animate-spin" />
              ) : (
                <TrendingUp className={`w-5 h-5 ${getActionColor()}`} />
              )}
            </div>
            <div className={`text-4xl font-bold tracking-widest ${getActionColor()}`}>
              {aiDecision.action}
            </div>
          </div>

          {!isAnalyzing && (
            <>
              <div className="mb-6">
                <div className="flex justify-between text-sm font-mono mb-2">
                  <span className="text-gray-400">Confidence Model</span>
                  <span className="text-white">{aiDecision.confidence}%</span>
                </div>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${aiDecision.confidence}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${getActionColor().replace('text-', 'bg-')}`} 
                  />
                </div>
              </div>

              <div className="flex-1 bg-dark-900/50 rounded-xl p-4 border border-white/5 font-mono text-sm leading-relaxed text-gray-300">
                <div className="flex items-center gap-2 mb-2 text-purple-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Analysis Output:</span>
                </div>
                <TypewriterText text={aiDecision.reasoning} speed={25} />
              </div>
            </>
          )}

          {isAnalyzing && (
            <div className="flex-1 flex items-center justify-center font-mono text-cyan-400 text-sm">
              <TypewriterText text={aiDecision.reasoning} speed={40} />
              <span className="animate-pulse ml-1">_</span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
