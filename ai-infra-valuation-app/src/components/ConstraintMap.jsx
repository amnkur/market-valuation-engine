import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  Zap, 
  Radio, 
  Layers, 
  Server, 
  Flame, 
  AlertCircle, 
  ArrowRight, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { PHYSICAL_CONSTRAINTS } from '../data/stocksData';

export default function ConstraintMap({ onSelectTicker }) {
  const [activeBucket, setActiveBucket] = useState('memory');

  const buckets = [
    {
      id: 'compute',
      title: 'Bucket 1: Processors & Compute',
      subtitle: 'The Silicon that does all the thinking',
      icon: Cpu,
      color: 'cyan',
      primaryCompanies: [
        { ticker: 'NVDA', name: 'Nvidia', role: 'Flagship GPUs & Systems', signal: 'BUY A LOT' },
        { ticker: 'MRVL', name: 'Marvell', role: 'Custom Cloud ASICs', signal: 'SELL / SELL SOME' },
        { ticker: 'CEREBRAS', name: 'Cerebras', role: 'Dinner-Plate Wafer Engine', signal: 'BUY' }
      ],
      bottleneckFact: 'Blackwell racks pull 140 kW each—20x older A100 servers. Requires sub-floor liquid manifolds.',
      economics: 'Nvidia revenue leaped from $30B/quarter to $96B/quarter with 66% operating margin.'
    },
    {
      id: 'memory',
      title: 'Bucket 2: Memory & High-Density Storage',
      subtitle: 'Where conversations and model context live',
      icon: Database,
      color: 'emerald',
      primaryCompanies: [
        { ticker: 'MU', name: 'Micron', role: 'HBM3e / HBM4 Fast Memory', signal: 'BUY A LITTLE' },
        { ticker: 'SNDK', name: 'SanDisk', role: 'Enterprise Flash Datasets', signal: 'BUY' }
      ],
      bottleneckFact: 'A 300-page conversation takes 40GB just to remember. When models exceed 80GB on-chip memory, data centers must buy dedicated memory racks.',
      economics: 'Micron operating margin surged from 11% to 80%. SanDisk kept 78% of sales as operating profit.'
    },
    {
      id: 'optics',
      title: 'Bucket 3: Optics & Laser Interconnects',
      subtitle: 'Moving data as light through glass fiber',
      icon: Radio,
      color: 'purple',
      primaryCompanies: [
        { ticker: 'LITE', name: 'Lumentum', role: 'Laser Photonic Transceivers', signal: 'SELL / SELL SOME' }
      ],
      bottleneckFact: 'Copper wire cannot carry cross-rack memory queries fast enough without latency spikes. Light is mandatory.',
      economics: 'Sales surged 83% YoY, but price reached 195x earnings vs historical 70x normal.'
    },
    {
      id: 'inference',
      title: 'Bucket 4: Inference Clouds & Capacity Leasers',
      subtitle: 'Renting out finished compute by the hour',
      icon: Server,
      color: 'amber',
      primaryCompanies: [
        { ticker: 'COREWEAVE', name: 'CoreWeave', role: 'GPU Cloud Provider', signal: 'HOLD' }
      ],
      bottleneckFact: 'Older A100 chips from 2020 are locked into contracts through 2029 because newer chips lack warm shells.',
      economics: 'CoreWeave quarterly sales grew from $400M to $2.6B, but burned $13.7B cash to pre-build capacity.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111728] via-[#0d1527] to-[#131e33] border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              The Physical Constraint Thesis
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              "Find the Constraint, Because the Constraint Decides the Payoff"
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Mainstream media warns of an AI slowdown, yet hyperscalers hold <strong className="text-cyan-300 font-mono">$1.7 Trillion</strong> in pre-signed cloud backlogs. The spending cannot stop because fewer than <strong className="text-rose-400 font-mono">4%</strong> of American data centers can house modern 140 kW liquid-cooled racks.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-center font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">US Power Grid Queue</span>
              <span className="text-lg font-bold text-amber-400">4.2 Years</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-center font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">Comex Copper</span>
              <span className="text-lg font-bold text-orange-400">${PHYSICAL_CONSTRAINTS.copperPricePerLb}/lb</span>
            </div>
          </div>
        </div>
      </div>

      {/* Foundational Physical Bottlenecks Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0f1422] border border-amber-900/40 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-300 font-mono uppercase">Constraint 1: The 4-Year Grid Line</h4>
            <p className="text-xs text-slate-300 mt-1 leading-snug">
              In top US metro hubs, waiting for a utility substation power interconnect takes ~4 years. Even if chips are ready, power is delayed.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f1422] border border-purple-900/40 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-purple-300 font-mono uppercase">Constraint 2: "Warm Shell" Scarcity</h4>
            <p className="text-xs text-slate-300 mt-1 leading-snug">
              Satya Nadella: <em>"It's not a supply issue of chips; I don't have warm shells to plug into."</em> Old A100 data centers remain fully leased.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f1422] border border-orange-900/40 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-orange-300 font-mono uppercase">Constraint 3: Copper Tightness</h4>
            <p className="text-xs text-slate-300 mt-1 leading-snug">
              Every generator, transformer, radiator, and busbar demands physical copper. Stanley Druckenmiller called copper the tightest supply chain ever studied.
            </p>
          </div>
        </div>
      </div>

      {/* The 4 Physical Data Center Buckets Tabbed / Interactive View */}
      <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4 font-mono flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          The 4 Internal Data Center Buckets
        </h3>

        {/* Bucket Selector Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {buckets.map((b) => {
            const Icon = b.icon;
            const isActive = activeBucket === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setActiveBucket(b.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-slate-800/90 border-cyan-500 text-white shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500/50'
                    : 'bg-[#121828] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="font-mono text-xs font-bold uppercase truncate">{b.title.split(':')[1]}</span>
                </div>
                <span className="text-[11px] text-slate-500 line-clamp-1">{b.subtitle}</span>
              </button>
            );
          })}
        </div>

        {/* Active Bucket Detail View */}
        {(() => {
          const b = buckets.find((item) => item.id === activeBucket);
          const Icon = b.icon;
          return (
            <div className="p-5 rounded-2xl bg-[#141b2c] border border-slate-700/80 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white font-mono">{b.title}</h4>
                    <p className="text-xs text-slate-300">{b.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Physical Bottleneck & Financial Explosion */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block font-mono text-[10px] uppercase mb-1 font-semibold text-cyan-400">
                    The Physical Constraint
                  </span>
                  <p className="text-slate-200 leading-relaxed">{b.bottleneckFact}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block font-mono text-[10px] uppercase mb-1 font-semibold text-emerald-400">
                    The Economic Extraction
                  </span>
                  <p className="text-slate-200 leading-relaxed">{b.economics}</p>
                </div>
              </div>

              {/* Companies Operating in This Bucket */}
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-mono block mb-2 font-semibold">
                  Companies Evaluated in this Layer:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {b.primaryCompanies.map((c) => (
                    <div
                      key={c.ticker}
                      onClick={() => onSelectTicker(c.ticker)}
                      className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-white">{c.ticker}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          c.signal.includes('BUY A LOT') 
                            ? 'bg-emerald-500/20 text-emerald-300' 
                            : c.signal.includes('SELL') 
                              ? 'bg-rose-500/20 text-rose-300' 
                              : c.signal.includes('LITTLE') 
                                ? 'bg-amber-500/20 text-amber-300' 
                                : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {c.signal}
                        </span>
                      </div>
                      <span className="text-xs text-slate-300">{c.name}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{c.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
