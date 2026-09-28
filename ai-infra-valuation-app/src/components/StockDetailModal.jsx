import React, { useState } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Scale, 
  Cpu, 
  Activity, 
  Sliders, 
  ShieldAlert,
  ArrowRight,
  Database,
  HelpCircle,
  Zap,
  Target,
  ShieldCheck,
  Award,
  Layers,
  Gauge
} from 'lucide-react';
import { evaluateStock, SIGNAL_RUNGS } from '../utils/valuationEngine';

export default function StockDetailModal({ stock, onClose }) {
  const cs = stock.currencySymbol || '$';

  // Interactive what-if sandbox inside the modal
  const [interactiveFairValue, setInteractiveFairValue] = useState(stock.fairValue || (stock.currentPrice * 1.15));
  const [interactivePe, setInteractivePe] = useState(stock.peRatio || 25);
  const [interactiveDma200, setInteractiveDma200] = useState(stock.dma200 || (stock.currentPrice * 0.9));
  const [interactiveRsi, setInteractiveRsi] = useState(stock.rsi14 || 52);
  const [interactiveDe, setInteractiveDe] = useState(stock.debtToEquity || 0.4);

  // Run live evaluation for what-if sandbox
  const liveEvaluation = evaluateStock({
    ...stock,
    currencySymbol: cs,
    fairValue: Number(interactiveFairValue),
    peRatio: Number(interactivePe),
    dma200: Number(interactiveDma200),
    rsi14: Number(interactiveRsi),
    debtToEquity: Number(interactiveDe)
  });

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

  const officialRung = getRungConfig(stock.finalSignal);
  const whatIfRung = getRungConfig(liveEvaluation.finalRung);
  const peMaxSlider = Math.max(120, Math.ceil((stock.peRatio || 30) * 1.3));

  const moatScore = stock.physicalMoatScore || 8;
  const rsiVal = stock.rsi14 || 52.0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0f1422] border border-slate-700/80 rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 relative text-slate-200">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Close Profile"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 pr-10">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl font-bold font-mono text-white">{stock.ticker}</h2>
              <span className="text-xs uppercase font-mono px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300">
                {stock.bucketLabel}
              </span>
              {stock.ticker && stock.ticker.endsWith('.NS') && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-orange-950/80 text-orange-300 border border-orange-700/60 font-semibold">
                  NSE (India) 🇮🇳
                </span>
              )}
              {stock.ticker && stock.ticker.endsWith('.BO') && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-orange-950/80 text-orange-300 border border-orange-700/60 font-semibold">
                  BSE (India) 🇮🇳
                </span>
              )}
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-700/60 font-semibold">
                Moat Score: {moatScore}/10
              </span>
            </div>
            <p className="text-base text-slate-300 mt-0.5 font-medium">{stock.name}</p>
            <p className="text-xs text-slate-400 font-mono mt-1">{stock.role}</p>
          </div>

          {/* Official System Signal */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-mono uppercase tracking-wider font-semibold">
                Official BWB Verdict
              </span>
              <span className={`px-4 py-1.5 rounded-xl text-sm font-bold font-mono tracking-wider border shadow-md inline-block mt-0.5 ${officialRung.badgeClass}`}>
                {stock.finalSignal}
              </span>
              {stock.arguedDowngrade && (
                <span className="text-[10px] text-amber-400 font-mono block mt-1">
                  ⚠️ System Argued Down
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Video Thesis Callout */}
        <div className="my-4 p-4 rounded-xl bg-slate-900/90 border border-cyan-900/40">
          <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs mb-1 font-mono">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>BUSINESS WITH BRIAN 3-LAYER VALUATION MODEL & INSTITUTIONAL QUANT AUDIT</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed italic">
            "{stock.systemNotes}"
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-4">
          
          {/* Left Column: Fundamental Profile & 6 Quant Dimensions */}
          <div className="space-y-4">
            
            {/* 1. Valuation Triangulation */}
            <div className="p-4 rounded-xl bg-[#141b2d] border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-cyan-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-cyan-400" />
                  Valuation Triangulation
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Intrinsic vs Growth</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-[#0b101c] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Market Price</span>
                  <span className="text-sm font-bold text-white">{cs}{stock.currentPrice.toFixed(2)}</span>
                </div>
                <div className="bg-[#0b101c] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">BWB Fair Value</span>
                  <span className="text-sm font-bold text-cyan-300">
                    {stock.fairValue ? `${cs}${stock.fairValue.toFixed(2)}` : 'Consensus'}
                  </span>
                </div>
                <div className="bg-[#0b101c] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Peter Lynch Intrinsic</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {stock.peterLynchFairValue ? `${cs}${stock.peterLynchFairValue.toFixed(2)}` : `${cs}${(stock.currentPrice * 1.2).toFixed(2)}`}
                  </span>
                </div>
                <div className="bg-[#0b101c] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">P/E vs 10Y Avg</span>
                  <span className={`text-sm font-bold ${
                    stock.peRatio > 75 ? 'text-rose-400' : 'text-slate-200'
                  }`}>
                    {stock.peRatio ? `${stock.peRatio}x` : 'N/A'} 
                    <span className="text-[10px] text-slate-400 ml-1">({stock.historicalPeAvg || 22}x avg)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Physical Constraint Moat Scorecard */}
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Physical Bottleneck Moat Scorecard
                </h4>
                <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 text-xs font-bold font-mono border border-purple-600/50">
                  {moatScore} / 10
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-purple-900/50">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(moatScore / 10) * 100}%` }}
                />
              </div>

              <div className="text-xs">
                <span className="text-purple-200 font-semibold block text-[11px]">
                  {stock.physicalMoatCategory || 'Physical Infrastructure Constraint'}
                </span>
                <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                  {stock.physicalMoatReason || 'High capital requirement, multi-year utility interconnect delays, and irreversible thermodynamic physics prevent bypass.'}
                </p>
              </div>
            </div>

            {/* 3. 14-Day RSI Technical Timing Filter */}
            <div className="p-4 rounded-xl bg-[#141b2d] border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  14-Day RSI Momentum Timing Filter
                </h4>
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                  rsiVal > 75 
                    ? 'bg-rose-950 text-rose-300 border-rose-700' 
                    : rsiVal < 35 
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700' 
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  RSI: {rsiVal}
                </span>
              </div>

              {/* RSI Visual Bar */}
              <div className="relative pt-3 pb-1">
                <div className="w-full bg-slate-900 rounded-full h-2 relative border border-slate-800">
                  {/* Oversold zone <35 */}
                  <div className="absolute left-0 top-0 bottom-0 w-[35%] bg-emerald-500/30 rounded-l-full" />
                  {/* Neutral zone 35-75 */}
                  <div className="absolute left-[35%] top-0 bottom-0 w-[40%] bg-cyan-500/20" />
                  {/* Overbought zone >75 */}
                  <div className="absolute right-0 top-0 bottom-0 w-[25%] bg-rose-500/30 rounded-r-full" />
                  {/* Cursor */}
                  <div 
                    className="absolute top-[-4px] w-3 h-4 bg-white rounded shadow-md -ml-1.5 border border-black transition-all"
                    style={{ left: `${Math.min(98, Math.max(2, rsiVal))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                  <span className="text-emerald-400">0 (Oversold &lt;35)</span>
                  <span className="text-slate-400">50 Neutral</span>
                  <span className="text-rose-400">100 (Overbought &gt;75)</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-snug">
                {stock.rsiStatus || (rsiVal > 75 ? 'Overbought: local top risk; stagger DCA entries.' : rsiVal < 35 ? 'Oversold: high capitulation margin of safety for long-term buyers.' : 'Healthy momentum corridor without speculative mania.')}
              </p>
            </div>

            {/* 4. Solvency, Cash Runway & Indian Governance */}
            <div className="p-4 rounded-xl bg-[#141b2d] border border-slate-800 space-y-2 text-xs font-mono">
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Solvency, FCF & Governance Test
                </span>
                <span className="text-[10px] text-emerald-400 font-normal">Balance Sheet Health</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-[#0b101c] p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Free Cash Flow (FCF)</span>
                  <span className="font-bold text-slate-100">{stock.fcfStr || 'Steady Operational Cash'}</span>
                  {stock.fcfYield && <span className="text-[10px] text-emerald-400 block">({stock.fcfYield}% Yield)</span>}
                </div>
                <div className="bg-[#0b101c] p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Debt-to-Equity (D/E)</span>
                  <span className={`font-bold ${
                    (stock.debtToEquity || 0) > 2.0 ? 'text-rose-400' : 'text-slate-100'
                  }`}>
                    {stock.debtToEquity !== null && stock.debtToEquity !== undefined ? `${stock.debtToEquity}x` : 'Low / Net Cash'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{stock.solvencyStatus || 'Healthy Leverage'}</span>
                </div>
                <div className="bg-[#0b101c] p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Capital Return (ROCE / ROE)</span>
                  <span className="font-bold text-cyan-300">{stock.roce ? `${stock.roce}%` : '22.0%'}</span>
                  <span className="text-[10px] text-slate-400 block">&gt; 18% Institutional Quality</span>
                </div>
                <div className="bg-[#0b101c] p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Promoter / Ownership</span>
                  <span className="font-bold text-slate-200 line-clamp-1">{stock.promoterPledge || 'Clean Governance'}</span>
                  <span className="text-[10px] text-emerald-400 block">0% Pledged / Institutional</span>
                </div>
              </div>
            </div>

            {/* 5. Portfolio Risk Blueprint */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-2 text-xs">
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-amber-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                Portfolio Sizing & Technical Invalidation Cut
              </h4>
              <div className="grid grid-cols-2 gap-2 font-mono pt-1">
                <div className="bg-[#0b101c] p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Thesis Invalidation (Cut)</span>
                  <span className="text-sm font-bold text-rose-400">
                    {cs}{stock.invalidationLevel ? stock.invalidationLevel.toFixed(2) : (stock.dma200 ? (stock.dma200 * 0.98).toFixed(2) : (stock.currentPrice * 0.85).toFixed(2))}
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 line-clamp-1">
                    {stock.invalidationReason || 'Close below 200 DMA invalidates momentum'}
                  </span>
                </div>
                <div className="bg-[#0b101c] p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Max Portfolio Cap</span>
                  <span className="text-sm font-bold text-cyan-300">
                    Max {stock.maxAllocPct || 5.0}%
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 line-clamp-1">
                    {stock.capCategory || 'Risk-managed capital allocation'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive What-If Simulation Sandbox */}
          <div className="bg-[#141b2d] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-700/60 pb-2">
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-cyan-400 flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  What-If Scenario Sandbox
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Dynamic Multi-Factor Stress Test</span>
              </div>

              {/* What-If Live Result */}
              <div className="mb-4 p-3 rounded-xl bg-[#090d16] border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">What-If Verdict</span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono border ${whatIfRung.badgeClass}`}>
                    {liveEvaluation.finalRung}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono max-w-[200px] text-right truncate">
                  {liveEvaluation.primaryAnomalyReason || 'Normal Stress Parameters'}
                </span>
              </div>

              <div className="space-y-4 text-xs font-mono">
                {/* Fair Value Slider */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Simulated Fair Value:</span>
                    <span className="font-bold text-cyan-300">{cs}{interactiveFairValue}</span>
                  </div>
                  <input
                    type="range"
                    min={Math.max(1, Math.round(stock.currentPrice * 0.4))}
                    max={Math.round(stock.currentPrice * 2.2)}
                    step={1}
                    value={interactiveFairValue}
                    onChange={(e) => setInteractiveFairValue(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{cs}{Math.round(stock.currentPrice * 0.4)}</span>
                    <span>Current: {cs}{Math.round(stock.currentPrice)}</span>
                    <span>{cs}{Math.round(stock.currentPrice * 2.2)}</span>
                  </div>
                </div>

                {/* P/E Ratio Slider */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Simulated P/E Multiple:</span>
                    <span className={`font-bold ${
                      interactivePe > 75 ? 'text-rose-400' : interactivePe > 45 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {interactivePe}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={peMaxSlider}
                    step={1}
                    value={interactivePe}
                    onChange={(e) => setInteractivePe(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>5x</span>
                    <span>75x (Bubble Cap)</span>
                    <span>{peMaxSlider}x</span>
                  </div>
                </div>

                {/* 14-Day RSI Slider */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Simulated 14-Day RSI:</span>
                    <span className={`font-bold ${
                      interactiveRsi > 75 ? 'text-rose-400' : interactiveRsi < 35 ? 'text-emerald-400' : 'text-cyan-300'
                    }`}>
                      {interactiveRsi} {interactiveRsi > 75 ? '(Overbought)' : interactiveRsi < 35 ? '(Oversold)' : '(Neutral)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={95}
                    step={1}
                    value={interactiveRsi}
                    onChange={(e) => setInteractiveRsi(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>10 (Deep Oversold)</span>
                    <span>50 (Fair)</span>
                    <span>95 (Mania Top)</span>
                  </div>
                </div>

                {/* Debt-to-Equity Slider */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Simulated Debt/Equity (D/E):</span>
                    <span className={`font-bold ${
                      interactiveDe > 2.2 ? 'text-rose-400' : interactiveDe > 1.2 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {interactiveDe}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={3.5}
                    step={0.1}
                    value={interactiveDe}
                    onChange={(e) => setInteractiveDe(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0.0x (Net Cash)</span>
                    <span>1.2x (Normal)</span>
                    <span>3.5x (Distress)</span>
                  </div>
                </div>

                {/* 200 DMA Slider */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Simulated 200 DMA:</span>
                    <span className="font-bold text-slate-200">{cs}{interactiveDma200}</span>
                  </div>
                  <input
                    type="range"
                    min={Math.max(1, Math.round(stock.currentPrice * 0.5))}
                    max={Math.round(stock.currentPrice * 1.5)}
                    step={1}
                    value={interactiveDma200}
                    onChange={(e) => setInteractiveDma200(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic System Argument Log */}
            <div className="mt-5 p-3 rounded-xl bg-[#0a0f1d] border border-slate-800 text-[11px]">
              <span className="text-slate-400 font-mono font-semibold block mb-2 text-[10px] uppercase">
                Dynamic Decision Rationale ({liveEvaluation.argumentLog.length} Factors):
              </span>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {liveEvaluation.argumentLog.map((log, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    {log.status === 'positive' && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />}
                    {log.status === 'warning' && <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />}
                    {log.status === 'negative' && <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />}
                    {log.status === 'neutral' && <Activity className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />}
                    <span className="text-slate-300 leading-tight">{log.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-mono">
            BWB Methodology: Physical constraint moats + 3-Layer valuation + 14-day RSI timing + Solvency runway checks.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md transition-all"
          >
            Close Audit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
