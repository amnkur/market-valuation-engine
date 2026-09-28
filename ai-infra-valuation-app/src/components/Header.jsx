import React from 'react';
import { Cpu, Zap, Activity, Database, Flame, Server } from 'lucide-react';
import { PHYSICAL_CONSTRAINTS } from '../data/stocksData';

export default function Header({ activeTab, setActiveTab, onTriggerNightlyRun, isRunningCalculations }) {
  return (
    <header className="border-b border-slate-800 bg-[#0c101a]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Ticker Macro Bar */}
      <div className="bg-[#070a10] border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-400 overflow-x-auto flex items-center justify-between gap-6 whitespace-nowrap">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200">MACRO CONSTRAINT MONITOR:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hyperscaler Backlog:</span>
            <span className="font-mono text-cyan-300 font-semibold">${PHYSICAL_CONSTRAINTS.hyperscalerBacklogTrillions} Trillion</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>US Power Grid Wait:</span>
            <span className="font-mono text-amber-300 font-semibold">{PHYSICAL_CONSTRAINTS.powerGridQueueYears} Years</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-purple-400" />
            <span>Warm Shell Rack Compatibility:</span>
            <span className="font-mono text-rose-300 font-semibold">&lt;{PHYSICAL_CONSTRAINTS.liquidCoolingCompatibilityPercent}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Comex Copper:</span>
            <span className="font-mono text-orange-300 font-semibold">${PHYSICAL_CONSTRAINTS.copperPricePerLb}/lb</span>
            <span className="text-emerald-400 text-[10px]">({PHYSICAL_CONSTRAINTS.copperPrice12mChange})</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-slate-500 font-mono text-[11px]">
          <Activity className="w-3 h-3 text-cyan-500" />
          <span>Nightly Calculations: <strong className="text-slate-300">20,000,000 / day</strong></span>
        </div>
      </div>

      {/* Main Nav Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-mono">
                Alpha<span className="text-cyan-400">Constraint</span>
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 font-mono">
                BWB Valuation v2.6
              </span>
            </div>
            <p className="text-xs text-slate-400">
              AI Infrastructure Bottleneck & 5-Rung Valuation Signal Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('screener')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'screener'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            5-Rung Screener
          </button>
          <button
            onClick={() => setActiveTab('constraints')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'constraints'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Physical Constraint Map
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'simulator'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            20M Monte Carlo Run
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'sandbox'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Custom Valuation Lab
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'calculator'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Rack Calculator
          </button>
          <button
            onClick={() => setActiveTab('dca')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'dca'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            DCA Allocator
          </button>
        </div>

        {/* Nightly Run Action Button */}
        <div>
          <button
            onClick={onTriggerNightlyRun}
            disabled={isRunningCalculations}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition-all border border-emerald-400/30 active:scale-95 disabled:opacity-50"
          >
            <Activity className={`w-3.5 h-3.5 ${isRunningCalculations ? 'animate-spin' : ''}`} />
            <span>{isRunningCalculations ? 'Running 20M Calcs...' : 'Run 20M Nightly Calcs'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
