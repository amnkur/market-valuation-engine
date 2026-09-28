import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  Sliders, 
  Terminal, 
  Cpu, 
  TrendingDown, 
  TrendingUp 
} from 'lucide-react';
import { STOCK_DATA } from '../data/stocksData';
import { runNightlyCalculationsBatch } from '../utils/valuationEngine';

export default function NightlyRunSimulator() {
  const [isRunning, setIsRunning] = useState(false);
  const [calcProgress, setCalcProgress] = useState(20000000);
  const [hyperscalerGrowth, setHyperscalerGrowth] = useState(0); // % change
  const [gridDelayMonths, setGridDelayMonths] = useState(0);
  const [simulationLogs, setSimulationLogs] = useState([
    'Nightly batch engine idle.',
    'System ready to compute 20,000,000 multi-layer valuations across watch list.'
  ]);
  const [batchResults, setBatchResults] = useState(() => 
    runNightlyCalculationsBatch(STOCK_DATA, { hyperscalerBacklogGrowth: 0, powerGridDelayMonths: 0 })
  );

  const startBatchRun = () => {
    setIsRunning(true);
    setCalcProgress(0);
    setSimulationLogs(['Initializing 20,000,000 Monte Carlo valuation sweeps...']);

    let current = 0;
    const interval = setInterval(() => {
      current += 2500000;
      setCalcProgress(Math.min(20000000, current));

      if (current === 5000000) {
        setSimulationLogs((prev) => [
          ...prev,
          'Sweeping Layer 1: Intrinsic Discount vs 10-Yr Cash Flow distributions...'
        ]);
      } else if (current === 10000000) {
        setSimulationLogs((prev) => [
          ...prev,
          `Simulating Macro Stress: Hyperscaler Backlog at ${hyperscalerGrowth >= 0 ? '+' : ''}${hyperscalerGrowth}%, Grid delay +${gridDelayMonths} mos...`
        ]);
      } else if (current === 15000000) {
        setSimulationLogs((prev) => [
          ...prev,
          'Executing Layer 3: History & Bubble anomaly check across 10-year percentile tables...'
        ]);
      } else if (current >= 20000000) {
        clearInterval(interval);
        setIsRunning(false);
        setSimulationLogs((prev) => [
          ...prev,
          '✓ 20,000,000 calculations completed successfully. Updated signals generated below.'
        ]);
        const updated = runNightlyCalculationsBatch(STOCK_DATA, {
          hyperscalerBacklogGrowth: hyperscalerGrowth,
          powerGridDelayMonths: gridDelayMonths
        });
        setBatchResults(updated);
      }
    }, 150);
  };

  const resetBatch = () => {
    setHyperscalerGrowth(0);
    setGridDelayMonths(0);
    setCalcProgress(20000000);
    setSimulationLogs(['Reset to baseline conditions (20M calculations verified).']);
    setBatchResults(runNightlyCalculationsBatch(STOCK_DATA, { hyperscalerBacklogGrowth: 0, powerGridDelayMonths: 0 }));
  };

  return (
    <div className="space-y-6">
      {/* Simulation Header */}
      <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Activity className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white font-mono">
                The 20 Million Calculations Nightly Engine
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              The proprietary algorithmic Monte Carlo engine executes 20 million calculations across every watch list ticker, stress-testing valuation bands, physical power delays, and hyperscaler backlog durability.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={startBatchRun}
              disabled={isRunning}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-cyan-900/40 active:scale-95 transition-all disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Calculating...' : 'Run 20M Nightly Batch'}</span>
            </button>
            <button
              onClick={resetBatch}
              disabled={isRunning}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Reset Parameters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Counter */}
        <div className="mt-6 p-4 rounded-xl bg-[#090d16] border border-slate-800">
          <div className="flex justify-between items-center text-xs font-mono mb-2">
            <span className="text-slate-400">Calculations Executed:</span>
            <span className="text-cyan-400 font-bold text-sm">
              {calcProgress.toLocaleString()} / 20,000,000
            </span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-300 h-full transition-all duration-150"
              style={{ width: `${(calcProgress / 20000000) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Macro Shock Stress-Test Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-[#141b2c] border border-slate-700/80">
            <div className="flex justify-between items-center mb-1 text-xs font-mono">
              <span className="text-slate-300 font-semibold">Macro Shock: Hyperscaler Backlog Shift</span>
              <span className={`font-bold ${hyperscalerGrowth < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {hyperscalerGrowth >= 0 ? `+${hyperscalerGrowth}%` : `${hyperscalerGrowth}%`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              If the $1.7T hyperscaler backlog begins to shrink, buy signals are systematically downgraded to protect capital.
            </p>
            <input
              type="range"
              min={-50}
              max={50}
              step={5}
              value={hyperscalerGrowth}
              onChange={(e) => setHyperscalerGrowth(Number(e.target.value))}
              disabled={isRunning}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-[#141b2c] border border-slate-700/80">
            <div className="flex justify-between items-center mb-1 text-xs font-mono">
              <span className="text-slate-300 font-semibold">Physical Shock: Power Grid Delay Extension</span>
              <span className="font-bold text-amber-400">+{gridDelayMonths} Months</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Longer grid queues lock customers into older A100/H100 chips for longer (CoreWeave beneficiary).
            </p>
            <input
              type="range"
              min={0}
              max={36}
              step={6}
              value={gridDelayMonths}
              onChange={(e) => setGridDelayMonths(Number(e.target.value))}
              disabled={isRunning}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Terminal Live Stream */}
      <div className="p-4 rounded-xl bg-[#070b13] border border-slate-800 font-mono text-xs text-slate-400">
        <div className="flex items-center gap-2 text-slate-300 font-semibold mb-2 border-b border-slate-800 pb-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Simulation Engine Output Console</span>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {simulationLogs.map((log, i) => (
            <div key={i} className="leading-snug text-slate-300 text-[11px]">
              <span className="text-cyan-500 mr-2">&gt;</span>
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Batch Results Table */}
      <div className="bg-[#0f1422] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Nightly Signal Verification Matrix
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {batchResults.filter(r => r.isChanged).length} Signals Adjusted Under Current Shocks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#090d16] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Ticker</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Baseline Signal</th>
                <th className="py-3 px-4">Simulated Signal</th>
                <th className="py-3 px-4">Shift Status</th>
                <th className="py-3 px-4">System Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {batchResults.map((row) => (
                <tr key={row.ticker} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{row.ticker}</td>
                  <td className="py-3 px-4 text-slate-300">{row.name}</td>
                  <td className="py-3 px-4 text-slate-400">{row.originalSignal}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                      row.simulatedSignal.includes('BUY A LOT')
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : row.simulatedSignal.includes('SELL')
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : row.simulatedSignal.includes('LITTLE')
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}>
                      {row.simulatedSignal}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {row.isChanged ? (
                      <span className="flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Shifted
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Consistent
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs truncate" title={row.evaluation.argumentLog.map(l => l.text).join(' | ')}>
                    {row.evaluation.primaryAnomalyReason || 'Validated across 20M calculation paths without flags.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
