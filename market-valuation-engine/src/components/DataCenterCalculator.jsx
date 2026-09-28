import React, { useState } from 'react';
import { 
  Server, 
  Zap, 
  Droplets, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Info,
  Layers
} from 'lucide-react';
import { PHYSICAL_CONSTRAINTS } from '../data/stocksData';

export default function DataCenterCalculator() {
  const [rackCount, setRackCount] = useState(25);
  const [chipGen, setChipGen] = useState('blackwell'); // blackwell, hopper, a100

  const specs = {
    blackwell: {
      name: 'Nvidia GB200 NVL72 (Blackwell)',
      kwPerRack: 140,
      coolingType: 'Direct-to-Chip Liquid Cooling (Mandatory)',
      coolingGPMPerRack: 38, // Gallons per minute of chilled liquid
      copperLbsPerRack: 2400, // Copper in busbars, power supplies, coils
      legacyCompatible: false
    },
    hopper: {
      name: 'Nvidia H100 / H200 SuperPOD',
      kwPerRack: 42,
      coolingType: 'Hybrid Air / Rear-Door Liquid Heat Exchanger',
      coolingGPMPerRack: 12,
      copperLbsPerRack: 950,
      legacyCompatible: true
    },
    a100: {
      name: 'Nvidia A100 (Legacy 2020 Platform)',
      kwPerRack: 12,
      coolingType: 'Traditional Air Cooling (Computer Room Air Handler)',
      coolingGPMPerRack: 0,
      copperLbsPerRack: 320,
      legacyCompatible: true
    }
  };

  const selectedSpec = specs[chipGen];
  const totalPowerKW = rackCount * selectedSpec.kwPerRack;
  const totalPowerMW = (totalPowerKW / 1000).toFixed(2);
  const totalCoolingGPM = rackCount * selectedSpec.coolingGPMPerRack;
  const totalCopperLbs = rackCount * selectedSpec.copperLbsPerRack;
  const totalCopperTons = (totalCopperLbs / 2000).toFixed(2);
  const totalCopperCost = (totalCopperLbs * PHYSICAL_CONSTRAINTS.copperPricePerLb).toLocaleString(undefined, {
    maximumFractionDigits: 0
  });

  // Household equivalent (avg US home ~1.2 kW continuous)
  const householdEquivalent = Math.round(totalPowerKW / 1.2).toLocaleString();

  // Feasibility verdict
  const requiresWarmShell = selectedSpec.kwPerRack > 35;
  const requiresSubstation = totalPowerMW > 15;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0f1422] border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Server className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white font-mono">
                Physical Data Center Constraint Calculator
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Physical thermal constraint: <em className="text-cyan-300">Fewer than 4% of American data centers can house a full rack of newest high-density AI accelerators</em>. Calculate real-world megawatt demand, liquid cooling pipe infrastructure, and physical copper requirements.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono shrink-0">
            <span className="text-[10px] text-slate-400 uppercase block">US Legacy Compatibility</span>
            <span className="text-lg font-bold text-rose-400">&lt; 3.8%</span>
          </div>
        </div>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters (5 cols) */}
        <div className="lg:col-span-5 bg-[#0f1422] border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Deployment Parameters
            </h3>
            <span className="text-xs text-cyan-400 font-mono">Inputs</span>
          </div>

          {/* Chip Generation Selector */}
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-2 font-semibold">
              Select AI Architecture Generation:
            </label>
            <div className="space-y-2">
              {Object.keys(specs).map((key) => {
                const item = specs[key];
                const isSelected = chipGen === key;
                return (
                  <button
                    key={key}
                    onClick={() => setChipGen(key)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 text-white ring-1 ring-cyan-500/50'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-mono text-xs font-bold block">{item.name}</span>
                      <span className="text-[11px] text-slate-400">{item.coolingType}</span>
                    </div>
                    <span className="font-mono font-bold text-xs text-cyan-400 shrink-0 ml-2">
                      {item.kwPerRack} kW / rack
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rack Slider */}
          <div className="pt-2">
            <div className="flex justify-between items-center text-xs font-mono mb-2">
              <span className="text-slate-300 font-semibold">Number of High-Density Racks:</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">{rackCount} Racks</span>
            </div>
            <input
              type="range"
              min={1}
              max={150}
              step={1}
              value={rackCount}
              onChange={(e) => setRackCount(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>1 Rack (Edge)</span>
              <span>25 Racks (Cluster)</span>
              <span>150 Racks (Hyperscale Mega-Pod)</span>
            </div>
          </div>

          {/* Context Quote */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 italic leading-relaxed">
            "A new rack of Nvidia's best chips pulls 140 kW—more than 20 of the old A100 servers put together, and needs liquid cooling with pipes underneath the floor. That's why the old chips stay in the building and keep getting paid."
          </div>
        </div>

        {/* Output Metrics (7 cols) */}
        <div className="lg:col-span-7 bg-[#0f1422] border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Physical Resource Consumption Engine
            </h3>
            <span className="text-xs text-amber-400 font-mono">Derived Constraints</span>
          </div>

          {/* 4 Big Resource Tiles */}
          <div className="grid grid-cols-2 gap-3">
            {/* Power Metric */}
            <div className="p-4 rounded-xl bg-[#141b2c] border border-slate-700/80">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-[11px] font-mono uppercase font-semibold">Total Power Draw</span>
              </div>
              <div className="font-mono text-2xl font-bold text-white">
                {totalPowerMW} <span className="text-xs text-amber-300 font-normal">Megawatts</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Equals power for ~{householdEquivalent} US homes
              </span>
            </div>

            {/* Liquid Cooling Metric */}
            <div className="p-4 rounded-xl bg-[#141b2c] border border-slate-700/80">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Droplets className="w-4 h-4" />
                <span className="text-[11px] font-mono uppercase font-semibold">Chilled Liquid Flow</span>
              </div>
              <div className="font-mono text-2xl font-bold text-white">
                {totalCoolingGPM.toLocaleString()} <span className="text-xs text-cyan-300 font-normal">GPM</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {totalCoolingGPM > 0 ? 'Requires sub-floor pipe manifolds' : 'Air-cooling sufficient'}
              </span>
            </div>

            {/* Copper Tonnage */}
            <div className="p-4 rounded-xl bg-[#141b2c] border border-slate-700/80">
              <div className="flex items-center gap-2 text-orange-400 mb-1">
                <Flame className="w-4 h-4" />
                <span className="text-[11px] font-mono uppercase font-semibold">Copper Wire & Busbars</span>
              </div>
              <div className="font-mono text-2xl font-bold text-white">
                {totalCopperTons} <span className="text-xs text-orange-300 font-normal">Tons</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                {totalCopperLbs.toLocaleString()} lbs of raw copper
              </span>
            </div>

            {/* Copper Comex Cost */}
            <div className="p-4 rounded-xl bg-[#141b2c] border border-slate-700/80">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Building2 className="w-4 h-4" />
                <span className="text-[11px] font-mono uppercase font-semibold">Raw Copper Metal Value</span>
              </div>
              <div className="font-mono text-2xl font-bold text-white">
                ${totalCopperCost}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                At Comex spot ${PHYSICAL_CONSTRAINTS.copperPricePerLb}/lb
              </span>
            </div>
          </div>

          {/* Compatibility & Construction Verdict */}
          <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-slate-300 block">
              Infrastructure Deployment Feasibility Verdict:
            </span>

            {/* Legacy Data Center Check */}
            <div className="flex items-start gap-2.5 text-xs">
              {selectedSpec.legacyCompatible ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold text-slate-200">
                  {selectedSpec.legacyCompatible
                    ? 'Compatible with standard existing data centers (air-cooled floor)'
                    : 'INCOMPATIBLE with 96% of existing US Data Centers'}
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {selectedSpec.legacyCompatible
                    ? 'Older A100/H100 architectures can run on legacy air infrastructure, keeping older data centers fully leased through 2029.'
                    : '140 kW per rack overwhelms standard CRAC air handling. Mandates dedicated plumbing, liquid chillers, and warm shells.'}
                </p>
              </div>
            </div>

            {/* Power Grid Queue Check */}
            <div className="flex items-start gap-2.5 text-xs pt-1">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200">
                  {requiresSubstation
                    ? `Requires Dedicated Substation Expansion (>15 MW) - Estimated ${PHYSICAL_CONSTRAINTS.powerGridQueueYears} Year Utility Wait`
                    : 'Can utilize secondary circuit capacity if warm shell is pre-energized'}
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Utilities in Virginia, Texas, and Ohio are backlogged out to 2029–2030 for power interconnects of this magnitude.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
