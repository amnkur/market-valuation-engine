import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Scale, 
  BarChart2, 
  ShieldCheck, 
  HelpCircle,
  Clock,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import { SIGNAL_RUNGS } from '../utils/valuationEngine';

export default function StockCard({ stock, onSelectStock }) {
  const [showArgumentDetails, setShowArgumentDetails] = useState(false);
  const cs = stock.currencySymbol || '$';

  const getRungConfig = (signal) => {
    switch (signal) {
      case 'BUY A LOT': return SIGNAL_RUNGS.BUY_A_LOT;
      case 'BUY': return SIGNAL_RUNGS.BUY;
      case 'BUY A LITTLE': return SIGNAL_RUNGS.BUY_A_LITTLE;
      case 'HOLD': return SIGNAL_RUNGS.HOLD;
      case 'SELL':
      case 'SELL / SELL SOME': return SIGNAL_RUNGS.SELL;
      default: return SIGNAL_RUNGS.HOLD;
    }
  };

  const rung = getRungConfig(stock.finalSignal);

  return (
    <div className="bg-[#101625] rounded-2xl border border-slate-800/90 hover:border-slate-700 p-5 transition-all duration-200 flex flex-col justify-between shadow-lg shadow-black/20 hover:shadow-cyan-950/20 group">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-lg font-bold text-white tracking-wide group-hover:text-cyan-300 transition-colors">
                {stock.ticker}
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                {stock.bucketLabel}
              </span>
              {stock.ticker && stock.ticker.endsWith('.NS') && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-950/80 text-orange-300 border border-orange-700/60 font-semibold">
                  NSE 🇮🇳
                </span>
              )}
              {stock.ticker && stock.ticker.endsWith('.BO') && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-950/80 text-orange-300 border border-orange-700/60 font-semibold">
                  BSE 🇮🇳
                </span>
              )}
              {/* Physical Moat Score Tag */}
              {stock.physicalMoatScore && (
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                  stock.physicalMoatScore >= 9 
                    ? 'bg-purple-950/80 text-purple-300 border-purple-700/60' 
                    : stock.physicalMoatScore >= 7
                      ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60'
                      : 'bg-slate-800 text-slate-400 border-slate-700/60'
                }`}>
                  Moat {stock.physicalMoatScore}/10
                </span>
              )}
              {/* RSI Badge */}
              {stock.rsi14 && (
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                  stock.rsi14 > 75 
                    ? 'bg-rose-950/80 text-rose-300 border-rose-700/60 animate-pulse' 
                    : stock.rsi14 < 35 
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' 
                      : 'bg-slate-800 text-slate-400 border-slate-700/60'
                }`} title={stock.rsiStatus}>
                  RSI: {stock.rsi14} {stock.rsi14 > 75 ? '⚡Top' : stock.rsi14 < 35 ? '🎯DCA' : ''}
                </span>
              )}
            </div>
            <h3 className="text-sm font-medium text-slate-300 line-clamp-1 mt-1">{stock.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{stock.role}</p>
          </div>

          {/* Signal Badge */}
          <div className="flex flex-col items-end shrink-0">
            <span className={`px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-wider border shadow-sm ${rung.badgeClass}`}>
              {stock.finalSignal}
            </span>
            {stock.arguedDowngrade && (
              <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono mt-1 font-semibold">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Argued Down
              </span>
            )}
          </div>
        </div>

        {/* Price & Fair Value Row */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 my-3 font-mono text-xs">
          <div>
            <span className="text-[11px] text-slate-500 block">Current Price</span>
            <span className="text-sm font-bold text-slate-100">{cs}{stock.currentPrice.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">System Fair Value</span>
            <span className={`text-sm font-bold ${
              stock.fairValue && stock.fairValue > stock.currentPrice 
                ? 'text-emerald-400' 
                : stock.fairValue && stock.fairValue < stock.currentPrice 
                  ? 'text-rose-400' 
                  : 'text-slate-300'
            }`}>
              {stock.fairValue ? `${cs}${stock.fairValue.toFixed(2)}` : 'Consensus Only'}
            </span>
          </div>
        </div>

        {/* Valuation Metrics Bar */}
        <div className="space-y-2 text-xs py-1">
          {/* P/E Ratio Comparison */}
          {stock.peRatio ? (
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-slate-500" />
                P/E Multiple:
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <span className={`font-semibold ${
                  stock.peRatio > (stock.historicalPeAvg * 1.5) ? 'text-rose-400' : 'text-slate-100'
                }`}>
                  {stock.peRatio}x
                </span>
                {stock.historicalPeAvg && (
                  <span className="text-[10px] text-slate-500">
                    (10y avg: {stock.historicalPeAvg}x)
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Valuation Mode:</span>
              <span className="font-mono text-cyan-400 text-[11px]">Consensus & Backlog Driven</span>
            </div>
          )}

          {/* PEG Ratio */}
          {stock.pegRatio !== null && stock.pegRatio !== undefined && (
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1">
                <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
                PEG Ratio (Growth Cost):
              </span>
              <span className={`font-mono font-bold ${
                stock.pegRatio < 0.5 ? 'text-emerald-400' : stock.pegRatio > 1.5 ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {stock.pegRatio.toFixed(2)}
                {stock.pegRatio < 0.5 && <span className="text-[10px] font-normal text-emerald-300 ml-1">(Cheapest)</span>}
              </span>
            </div>
          )}

          {/* Moving Average Trend */}
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
              200-Day Moving Avg:
            </span>
            <span className="font-mono text-[11px] flex items-center gap-1">
              {stock.dma200 ? (
                stock.currentPrice >= stock.dma200 ? (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Above ({cs}{stock.dma200.toFixed(1)})
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-0.5">
                    <TrendingDown className="w-3 h-3" /> Below ({cs}{stock.dma200.toFixed(1)})
                  </span>
                )
              ) : (
                <span className="text-slate-500">Insufficient History (&lt;200d)</span>
              )}
            </span>
          </div>

          {/* FCF Yield & Solvency Profile */}
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
              FCF Yield & Health:
            </span>
            <span className="font-mono text-[11px] flex items-center gap-1">
              <span className={stock.fcfYield && stock.fcfYield > 2 ? 'text-emerald-400 font-semibold' : 'text-slate-200'}>
                {stock.fcfYield ? `${stock.fcfYield}% Yield` : (stock.fcfStr || 'Cash Flow Steady')}
              </span>
              <span className="text-[10px] text-slate-500">
                • {stock.solvencyStatus ? stock.solvencyStatus.split(' ')[0] : 'Solid'}
              </span>
            </span>
          </div>

          {/* Stop-Loss Invalidation & Position Cap */}
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-amber-500" />
              Cut Loss / Max Cap:
            </span>
            <span className="font-mono text-[11px] flex items-center gap-1">
              <span className="text-rose-400 font-semibold">
                Cut: {cs}{stock.invalidationLevel ? stock.invalidationLevel.toFixed(1) : (stock.dma200 ? (stock.dma200 * 0.98).toFixed(1) : (stock.currentPrice * 0.85).toFixed(1))}
              </span>
              <span className="text-cyan-300 text-[10px]">
                (Max {stock.maxAllocPct || 5}%)
              </span>
            </span>
          </div>
        </div>

        {/* Self-Argument Banner if Downgraded */}
        {stock.arguedDowngrade && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Why the Model Argued With Itself:</span>
            </div>
            <p className="text-amber-200/80 text-[11px] leading-relaxed">
              {stock.downgradeReason}
            </p>
          </div>
        )}

        {/* Toggle Argument Log */}
        <div className="mt-3 border-t border-slate-800/80 pt-2">
          <button
            onClick={() => setShowArgumentDetails(!showArgumentDetails)}
            className="w-full flex items-center justify-between text-[11px] text-cyan-400 hover:text-cyan-300 py-1"
          >
            <span>{showArgumentDetails ? 'Hide' : 'Inspect'} 3-Layer + Quant Arguments</span>
            {showArgumentDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showArgumentDetails && (
            <div className="mt-2 space-y-2 bg-[#090d16] p-3 rounded-xl border border-slate-800 text-[11px]">
              {stock.reasoning && stock.reasoning.map((item, idx) => (
                <div key={idx} className="border-l-2 pl-2 border-cyan-500/40">
                  <span className="text-slate-400 uppercase font-mono text-[9px] block">
                    {item.type}
                  </span>
                  <p className="text-slate-200 leading-snug">{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 font-mono">
          {stock.yearsPublic}y Public History
        </span>
        <button
          onClick={() => onSelectStock(stock)}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium transition-colors"
        >
          Institutional Audit Profile →
        </button>
      </div>
    </div>
  );
}
