import React, { useState } from 'react';
import { 
  Sliders, 
  PlusCircle, 
  Scale, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  Search,
  DownloadCloud,
  Loader2,
  Zap,
  Gauge,
  ShieldCheck,
  Target
} from 'lucide-react';
import { evaluateStock, SIGNAL_RUNGS } from '../utils/valuationEngine';

const PRESET_CUSTOM_STOCKS = [
  {
    ticker: 'TARIL.NS',
    name: 'Transformers & Rectifiers (India) Ltd',
    role: 'High Voltage Power Transformers for Data Centers & Grid',
    currentPrice: 270.45,
    fairValue: 350.00,
    peterLynchFairValue: 380.00,
    peRatio: 30.4,
    historicalPeAvg: 22.0,
    pegRatio: 0.85,
    dma50: 285.00,
    dma200: 298.00,
    yearsPublic: 18,
    valuationPercentile: 68,
    operatingMargin: 16.0,
    cashBurnRatio: 0,
    currencySymbol: '₹',
    rsi14: 33.3,
    debtToEquity: 0.28,
    physicalMoatScore: 10,
    fcfYield: 2.71
  },
  {
    ticker: 'MOD',
    name: 'Modine Manufacturing Co.',
    role: '140 kW Direct Liquid Cooling & Chillers for AI Racks',
    currentPrice: 176.85,
    fairValue: 240.00,
    peterLynchFairValue: 250.00,
    peRatio: 16.0,
    historicalPeAvg: 18.0,
    pegRatio: 0.67,
    dma50: 185.00,
    dma200: 212.00,
    yearsPublic: 40,
    valuationPercentile: 52,
    operatingMargin: 14.5,
    cashBurnRatio: 0,
    currencySymbol: '$',
    rsi14: 46.2,
    debtToEquity: 0.45,
    physicalMoatScore: 9,
    fcfYield: 3.8
  },
  {
    ticker: 'VOLTAMP.NS',
    name: 'Voltamp Transformers Ltd',
    role: 'Dry-Type Fire-Safe Indoor Transformers for Data Centers',
    currentPrice: 10513.00,
    fairValue: 12500.00,
    peterLynchFairValue: 13200.00,
    peRatio: 33.5,
    historicalPeAvg: 24.0,
    pegRatio: 0.90,
    dma50: 9800.00,
    dma200: 9300.00,
    yearsPublic: 20,
    valuationPercentile: 65,
    operatingMargin: 18.0,
    cashBurnRatio: 0,
    currencySymbol: '₹',
    rsi14: 42.1,
    debtToEquity: 0.05,
    physicalMoatScore: 10,
    fcfYield: 4.2
  }
];

export default function ValuationLab() {
  const [ticker, setTicker] = useState('TARIL.NS');
  const [name, setName] = useState('Transformers & Rectifiers (India) Ltd');
  const [currentPrice, setCurrentPrice] = useState(270.45);
  const [fairValue, setFairValue] = useState(350.00);
  const [peRatio, setPeRatio] = useState(30.4);
  const [historicalPeAvg, setHistoricalPeAvg] = useState(22.0);
  const [pegRatio, setPegRatio] = useState(0.85);
  const [dma200, setDma200] = useState(298.00);
  const [yearsPublic, setYearsPublic] = useState(18);
  const [valuationPercentile, setValuationPercentile] = useState(68);
  const [cashBurnRatio, setCashBurnRatio] = useState(0);
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  // Quant enhancements state
  const [rsi14, setRsi14] = useState(33.3);
  const [debtToEquity, setDebtToEquity] = useState(0.28);
  const [physicalMoatScore, setPhysicalMoatScore] = useState(10);
  const [fcfYield, setFcfYield] = useState(2.71);

  // Live Auto-fetch state
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [fetchStatus, setFetchStatus] = useState(null);

  const fetchLiveStockData = async (symbolToFetch) => {
    const sym = (symbolToFetch || ticker).trim();
    if (!sym) return;

    setIsFetchingLive(true);
    setFetchStatus(null);

    try {
      let res;
      try {
        res = await fetch(`/api/stock?query=${encodeURIComponent(sym)}`);
      } catch (e) {
        const host = window.location.hostname || 'localhost';
        res = await fetch(`http://${host}:5001/api/stock?query=${encodeURIComponent(sym)}`);
      }

      if (!res || !res.ok) {
        if (!res) {
          res = await fetch(`http://localhost:5001/api/stock?query=${encodeURIComponent(sym)}`);
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Server error');
        }
      }

      const data = await res.json();
      const cs = data.currencySymbol || '$';

      setTicker(data.ticker);
      setName(data.name || sym);
      setCurrentPrice(data.currentPrice);
      setFairValue(data.fairValue);
      setPeRatio(data.peRatio);
      setHistoricalPeAvg(data.historicalPeAvg);
      setPegRatio(data.pegRatio);
      setDma200(data.dma200);
      setYearsPublic(data.yearsPublic || 15);
      setValuationPercentile(data.valuationPercentile || 70);
      setCurrencySymbol(cs);

      // Quant fields
      setRsi14(data.rsi14 || 50.0);
      setDebtToEquity(data.debtToEquity || 0.3);
      setPhysicalMoatScore(data.physicalMoatScore || 8);
      setFcfYield(data.fcfYield || 2.5);

      setFetchStatus({ 
        success: true, 
        message: `Live data & 6 Quant metrics loaded for ${data.ticker} (${cs}${data.currentPrice}) • RSI: ${data.rsi14 || 50} • Moat: ${data.physicalMoatScore || 8}/10` 
      });
    } catch (err) {
      console.warn('Fetch error:', err);
      setFetchStatus({ 
        success: false, 
        message: `Could not fetch live data: ${err.message}. You can still adjust values manually below.` 
      });
    } finally {
      setIsFetchingLive(false);
    }
  };

  const loadPreset = (preset) => {
    setTicker(preset.ticker);
    setName(preset.name);
    setCurrentPrice(preset.currentPrice);
    setFairValue(preset.fairValue);
    setPeRatio(preset.peRatio);
    setHistoricalPeAvg(preset.historicalPeAvg);
    setPegRatio(preset.pegRatio);
    setDma200(preset.dma200);
    setYearsPublic(preset.yearsPublic);
    setValuationPercentile(preset.valuationPercentile);
    setCashBurnRatio(preset.cashBurnRatio);
    setCurrencySymbol(preset.currencySymbol || '$');
    setRsi14(preset.rsi14 || 50);
    setDebtToEquity(preset.debtToEquity || 0.3);
    setPhysicalMoatScore(preset.physicalMoatScore || 8);
    setFcfYield(preset.fcfYield || 2.0);
    setFetchStatus(null);
  };

  // Evaluate live in real time
  const evaluation = evaluateStock({
    currentPrice: Number(currentPrice),
    fairValue: Number(fairValue),
    peRatio: Number(peRatio),
    historicalPeAvg: Number(historicalPeAvg),
    pegRatio: Number(pegRatio),
    dma200: Number(dma200),
    yearsPublic: Number(yearsPublic),
    valuationPercentile: Number(valuationPercentile),
    cashBurnRatio: Number(cashBurnRatio),
    currencySymbol,
    rsi14: Number(rsi14),
    debtToEquity: Number(debtToEquity),
    physicalMoatScore: Number(physicalMoatScore),
    fcfYield: Number(fcfYield)
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

  const finalRungConfig = getRungConfig(evaluation.finalRung);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="p-6 rounded-2xl bg-[#0f1422] border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Sliders className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white font-mono">
                Interactive Custom Valuation & Quant Lab
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Type any company name (e.g. <strong className="text-cyan-300">Reliance, Modine, TARIL, Voltamp, Apple, Nvidia</strong>) to auto-fetch live market data or stress-test custom quant inputs.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">High-Demand Presets:</span>
            {PRESET_CUSTOM_STOCKS.map((p) => (
              <button
                key={p.ticker}
                onClick={() => loadPreset(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                  ticker === p.ticker
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {p.ticker.split('.')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Live Ticker Auto-Fetch Bar */}
        <div className="mt-5 p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            <Search className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />
            <input
              type="text"
              placeholder="Enter Any Company Name or Ticker (e.g. Reliance, Modine, TARIL, Powell, Voltamp)..."
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLiveStockData(ticker)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={() => fetchLiveStockData(ticker)}
            disabled={isFetchingLive}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-950/40 disabled:opacity-50"
          >
            {isFetchingLive ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Fetching Live Market & Quant Data...</span>
              </>
            ) : (
              <>
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>Auto-Fetch Live Data</span>
              </>
            )}
          </button>
        </div>

        {fetchStatus && (
          <div className={`mt-2 px-3 py-1.5 rounded-lg text-xs font-mono ${
            fetchStatus.success ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50' : 'bg-amber-950/40 text-amber-300 border border-amber-800/50'
          }`}>
            {fetchStatus.message}
          </div>
        )}
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-[#0f1422] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Asset Multiples & 6 Quant Dimensions
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live Inputs</span>
          </div>

          {/* Ticker & Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-mono">Ticker Symbol</label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-mono">Company Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Price vs Fair Value */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Current Market Price:</span>
                <span className="font-bold text-white">{currencySymbol}{currentPrice}</span>
              </div>
              <input
                type="number"
                step="0.5"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Estimated Fair Value:</span>
                <span className="font-bold text-cyan-400">{currencySymbol}{fairValue}</span>
              </div>
              <input
                type="number"
                step="0.5"
                value={fairValue}
                onChange={(e) => setFairValue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-sm"
              />
            </div>
          </div>

          {/* P/E Ratio vs 10-Yr Historical Average */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Current P/E Ratio:</span>
                <span className="font-bold text-amber-300">{peRatio}x</span>
              </div>
              <input
                type="number"
                step="0.5"
                value={peRatio}
                onChange={(e) => setPeRatio(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-200 font-mono text-sm"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">10-Yr Hist. P/E Avg:</span>
                <span className="font-bold text-slate-300">{historicalPeAvg}x</span>
              </div>
              <input
                type="number"
                step="0.5"
                value={historicalPeAvg}
                onChange={(e) => setHistoricalPeAvg(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono text-sm"
              />
            </div>
          </div>

          {/* PEG Ratio & 200 DMA */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">PEG Ratio (Growth Cost):</span>
                <span className={`font-bold ${pegRatio < 1 ? 'text-emerald-400' : 'text-rose-400'}`}>{pegRatio}</span>
              </div>
              <input
                type="number"
                step="0.05"
                value={pegRatio}
                onChange={(e) => setPegRatio(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">200-Day Moving Avg:</span>
                <span className="font-bold text-slate-300">{currencySymbol}{dma200}</span>
              </div>
              <input
                type="number"
                step="0.5"
                value={dma200}
                onChange={(e) => setDma200(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm"
              />
            </div>
          </div>

          {/* 14-Day RSI & Debt-to-Equity */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">14-Day RSI Momentum:</span>
                <span className={`font-bold ${rsi14 > 75 ? 'text-rose-400' : rsi14 < 35 ? 'text-emerald-400' : 'text-cyan-300'}`}>
                  {rsi14} {rsi14 > 75 ? '(Overbought)' : rsi14 < 35 ? '(Oversold)' : ''}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={95}
                step={0.5}
                value={rsi14}
                onChange={(e) => setRsi14(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-mono">&gt;75 overbought warning; &lt;35 oversold DCA</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Debt-to-Equity Ratio:</span>
                <span className={`font-bold ${debtToEquity > 2.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {debtToEquity}x
                </span>
              </div>
              <input
                type="range"
                min={0.0}
                max={3.0}
                step={0.05}
                value={debtToEquity}
                onChange={(e) => setDebtToEquity(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-mono">&gt;2.0x triggers solvency prudence downgrade</span>
            </div>
          </div>

          {/* Physical Moat Score & Valuation Percentile */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Physical Moat Score:</span>
                <span className="font-bold text-purple-300">{physicalMoatScore} / 10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={physicalMoatScore}
                onChange={(e) => setPhysicalMoatScore(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-mono">10 = Transformer / Grid; 9 = Liquid Cooling; 8 = Optics</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">10-Yr Valuation Percentile:</span>
                <span className={`font-bold ${valuationPercentile >= 95 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {valuationPercentile}%
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={99}
                step={1}
                value={valuationPercentile}
                onChange={(e) => setValuationPercentile(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-mono">&ge;95th percentile triggers cycle peak caution</span>
            </div>
          </div>
        </div>

        {/* Right Output Verdict (5 cols) */}
        <div className="lg:col-span-5 bg-[#0f1422] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                System Decision Rung
              </h3>
              <span className="text-xs text-cyan-400 font-mono">Model Signal</span>
            </div>

            {/* Big Signal Display */}
            <div className="my-5 p-5 rounded-2xl bg-gradient-to-b from-[#141b2c] to-[#0d1320] border border-slate-700/80 text-center">
              <span className="text-xs text-slate-400 font-mono uppercase block mb-1">
                3-Layer Algorithmic Verdict for {ticker}
              </span>
              <span className={`inline-block px-5 py-2 rounded-xl text-lg font-bold font-mono tracking-wider border shadow-lg ${finalRungConfig.badgeClass}`}>
                {evaluation.finalRung}
              </span>
              <p className="text-xs text-slate-300 mt-3 font-mono">
                {finalRungConfig.desc}
              </p>

              {/* Did it argue with itself? */}
              {evaluation.isArguedDown && (
                <div className="mt-4 p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-left">
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>The Model Argued With Itself:</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-tight">
                    {evaluation.primaryAnomalyReason}
                  </p>
                </div>
              )}
            </div>

            {/* Decision Trail */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-slate-400 block font-semibold">
                Multi-Dimensional Argument Trail ({evaluation.argumentLog.length} Checks):
              </span>
              <div className="space-y-2 text-xs max-h-64 overflow-y-auto pr-1">
                {evaluation.argumentLog.map((log, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2">
                    {log.status === 'positive' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                    {log.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                    {log.status === 'negative' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                    {log.status === 'neutral' && <Scale className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />}
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">{log.step}</span>
                      <span className="text-slate-200 leading-snug">{log.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            Evaluated using Multi-Layer Fundamental Logic + 6 Institutional Quant Filters (RSI, Solvency, Physical Moat, Invalidation).
          </div>
        </div>
      </div>
    </div>
  );
}
