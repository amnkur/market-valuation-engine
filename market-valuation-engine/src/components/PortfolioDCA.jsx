import React, { useState } from 'react';
import { 
  DollarSign, 
  PieChart, 
  CheckCircle2, 
  AlertOctagon, 
  ArrowUpRight, 
  Percent, 
  HelpCircle,
  Coins
} from 'lucide-react';
import { STOCK_DATA } from '../data/stocksData';

export default function PortfolioDCA({ onSelectStock }) {
  const [monthlyBudget, setMonthlyBudget] = useState(2500);

  // Multi-Tier Dollar Cost Averaging Rung Weights:
  // BUY A LOT: 45% of buy pool
  // BUY: 30% of buy pool
  // BUY A LITTLE: 15% of buy pool
  // HOLD: 0% new buys
  // SELL: 0% new buys (take profit)
  const getWeightFactor = (signal) => {
    switch (signal) {
      case 'BUY A LOT': return 4.0;
      case 'BUY': return 2.0;
      case 'BUY A LITTLE': return 1.0;
      case 'HOLD': return 0.0;
      case 'SELL':
      case 'SELL / SELL SOME': return 0.0;
      default: return 0.0;
    }
  };

  const eligibleStocks = STOCK_DATA.map((stock) => {
    const weightFactor = getWeightFactor(stock.finalSignal);
    return {
      ...stock,
      weightFactor
    };
  });

  const totalWeight = eligibleStocks.reduce((sum, s) => sum + s.weightFactor, 0);

  const allocations = eligibleStocks.map((stock) => {
    const percent = totalWeight > 0 ? (stock.weightFactor / totalWeight) * 100 : 0;
    const dollarAmount = totalWeight > 0 ? (monthlyBudget * (stock.weightFactor / totalWeight)) : 0;
    const sharesCount = stock.currentPrice > 0 ? (dollarAmount / stock.currentPrice).toFixed(2) : 0;
    return {
      ...stock,
      percent,
      dollarAmount,
      sharesCount
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0f1422] border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Coins className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white font-mono">
                Multi-Tier Dollar-Cost Averaging (DCA) Allocator
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Execution discipline: <em className="text-emerald-300">"Dollar-cost averaging is the primary risk-mitigation tool. Heavily accumulate on confirmed discounts, and allocate zero capital to overvalued steps."</em>
            </p>
          </div>

          {/* Budget Input Box */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono shrink-0">
            <span className="text-[10px] text-slate-400 block uppercase">Monthly Capital Contribution</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-emerald-400 font-bold text-lg">$</span>
              <input
                type="number"
                step="100"
                min="100"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(Math.max(0, Number(e.target.value)))}
                className="w-28 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-lg focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Allocation Summary Table */}
      <div className="bg-[#0f1422] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Automated Monthly DCA Distribution
          </h3>
          <span className="text-xs text-emerald-400 font-mono">
            Total Distributed: ${monthlyBudget.toLocaleString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#090d16] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Ticker</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">System Rung</th>
                <th className="py-3 px-4">Target Weight</th>
                <th className="py-3 px-4">Monthly Allocation</th>
                <th className="py-3 px-4">Approx. Shares</th>
                <th className="py-3 px-4">Action Directive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {allocations.map((item) => (
                <tr key={item.ticker} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">
                    <button
                      onClick={() => onSelectStock(item)}
                      className="hover:text-cyan-400 underline underline-offset-2"
                    >
                      {item.ticker}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{item.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                      item.finalSignal.includes('BUY A LOT')
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : item.finalSignal.includes('SELL')
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : item.finalSignal.includes('LITTLE')
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : item.finalSignal.includes('HOLD')
                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}>
                      {item.finalSignal}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-200">
                    {item.percent.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-emerald-400 font-bold text-sm">
                    ${item.dollarAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {item.dollarAmount > 0 ? `${item.sharesCount} shares` : '—'}
                  </td>
                  <td className="py-3 px-4 text-[11px]">
                    {item.finalSignal === 'BUY A LOT' && (
                      <span className="text-emerald-400 font-semibold">Priority Accumulate</span>
                    )}
                    {item.finalSignal === 'BUY' && (
                      <span className="text-cyan-300 font-semibold">Steady Accumulate</span>
                    )}
                    {item.finalSignal === 'BUY A LITTLE' && (
                      <span className="text-amber-300 font-semibold">Scale In Cautiously</span>
                    )}
                    {item.finalSignal === 'HOLD' && (
                      <span className="text-slate-400">Do Not Add (Monitor)</span>
                    )}
                    {item.finalSignal.includes('SELL') && (
                      <span className="text-rose-400 font-semibold">Do Not Buy (Harvest / Trim)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rationale Notice */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 leading-relaxed font-mono">
        <strong className="text-slate-200">Execution Note:</strong> Notice how stocks on the "Sell" rung (like Lumentum and Marvell) receive <strong className="text-rose-400">$0.00</strong> in new monthly capital. Even though both companies have booming AI revenue, their stock price has already discounted 7+ years of future growth. DCA capital is strictly routed to where margin of safety exists (Nvidia, SanDisk, Micron starter, and cash-backed copper).
      </div>
    </div>
  );
}
