import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Layers, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Info,
  Sparkles,
  ExternalLink,
  PlusCircle,
  Loader2,
  Building2,
  Globe2
} from 'lucide-react';
import Header from './components/Header';
import StockCard from './components/StockCard';
import StockDetailModal from './components/StockDetailModal';
import ConstraintMap from './components/ConstraintMap';
import NightlyRunSimulator from './components/NightlyRunSimulator';
import ValuationLab from './components/ValuationLab';
import DataCenterCalculator from './components/DataCenterCalculator';
import PortfolioDCA from './components/PortfolioDCA';
import { STOCK_DATA } from './data/stocksData';

const POPULAR_INDIAN_SUGGESTIONS = [
  { label: 'Reliance', query: 'Reliance' },
  { label: 'TCS', query: 'TCS' },
  { label: 'Tata Motors', query: 'Tata Motors' },
  { label: 'Infosys', query: 'Infosys' },
  { label: 'HDFC Bank', query: 'HDFC Bank' },
  { label: 'Zomato', query: 'Zomato' },
  { label: 'TARIL', query: 'TARIL' },
  { label: 'Voltamp', query: 'Voltamp' },
  { label: 'Modine', query: 'Modine' },
  { label: 'Powell', query: 'Powell' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('screener');
  const [stocksList, setStocksList] = useState(STOCK_DATA);
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRungFilter, setSelectedRungFilter] = useState('ALL');
  const [selectedBucketFilter, setSelectedBucketFilter] = useState('ALL');
  const [isRunningCalculations, setIsRunningCalculations] = useState(false);

  // New Company Name Lookup on the UI
  const [companyInput, setCompanyInput] = useState('');
  const [isEvaluatingCompany, setIsEvaluatingCompany] = useState(false);
  const [evalError, setEvalError] = useState(null);
  const [evalSuccess, setEvalSuccess] = useState(null);

  const evaluateCompany = async (queryToEvaluate) => {
    const query = (queryToEvaluate || companyInput).trim();
    if (!query) return;

    setIsEvaluatingCompany(true);
    setEvalError(null);
    setEvalSuccess(null);

    try {
      let res;
      // 1. Try relative proxied path first
      try {
        res = await fetch(`/api/stock?query=${encodeURIComponent(query)}`);
      } catch (e) {
        // 2. Fallback to direct port 5001
        const host = window.location.hostname || 'localhost';
        res = await fetch(`http://${host}:5001/api/stock?query=${encodeURIComponent(query)}`);
      }

      if (!res || !res.ok) {
        // Fallback to explicit localhost:5001 if proxy failed
        if (!res) {
          res = await fetch(`http://localhost:5001/api/stock?query=${encodeURIComponent(query)}`);
        }
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || 'Could not resolve company name');
        }
      }

      const newStock = await res.json();
      const cs = newStock.currencySymbol || '$';

      // Check if already in list
      const existingIndex = stocksList.findIndex((s) => s.ticker === newStock.ticker);
      if (existingIndex >= 0) {
        const updated = [...stocksList];
        updated[existingIndex] = newStock;
        setStocksList(updated);
        setSelectedStock(newStock);
        setEvalSuccess(`Updated live valuation for ${newStock.name} (${newStock.ticker}): ${cs}${newStock.currentPrice} • ${newStock.finalSignal}`);
      } else {
        setStocksList([newStock, ...stocksList]);
        setSelectedStock(newStock);
        setEvalSuccess(`Evaluated and added ${newStock.name} (${newStock.ticker}): ${cs}${newStock.currentPrice} as ${newStock.finalSignal}!`);
      }
      setCompanyInput('');
    } catch (err) {
      setEvalError(err.message || `Failed to fetch live data for "${query}". Ensure backend API is active.`);
    } finally {
      setIsEvaluatingCompany(false);
    }
  };

  const handleEvaluateSubmit = (e) => {
    if (e) e.preventDefault();
    evaluateCompany(companyInput);
  };

  const handleTriggerNightlyRun = () => {
    setIsRunningCalculations(true);
    setActiveTab('simulator');
    setTimeout(() => {
      setIsRunningCalculations(false);
    }, 1800);
  };

  const handleSelectTicker = (ticker) => {
    const found = stocksList.find((s) => s.ticker === ticker);
    if (found) {
      setSelectedStock(found);
    }
  };

  // Filter stocks for Screener
  const filteredStocks = stocksList.filter((stock) => {
    const matchesSearch = 
      stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRung = 
      selectedRungFilter === 'ALL' || 
      (selectedRungFilter === 'BUY_A_LOT' && stock.finalSignal === 'BUY A LOT') ||
      (selectedRungFilter === 'BUY' && stock.finalSignal === 'BUY') ||
      (selectedRungFilter === 'BUY_A_LITTLE' && stock.finalSignal === 'BUY A LITTLE') ||
      (selectedRungFilter === 'HOLD' && stock.finalSignal === 'HOLD') ||
      (selectedRungFilter === 'SELL' && stock.finalSignal.includes('SELL'));

    const matchesBucket = 
      selectedBucketFilter === 'ALL' || 
      (selectedBucketFilter === 'indian' && stock.ticker && (stock.ticker.endsWith('.NS') || stock.ticker.endsWith('.BO'))) ||
      stock.bucket === selectedBucketFilter;

    return matchesSearch && matchesRung && matchesBucket;
  });

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTriggerNightlyRun={handleTriggerNightlyRun}
        isRunningCalculations={isRunningCalculations}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: 5-RUNG SCREENER */}
        {activeTab === 'screener' && (
          <div className="space-y-6">
            {/* Hero Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0f172a] via-[#101b33] to-[#0c1322] border border-slate-800 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs uppercase font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 font-bold">
                      Quantitative Valuation Engine
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      20,000,000 Daily Sweeps
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-orange-950/80 text-orange-300 border border-orange-700/60 font-semibold flex items-center gap-1">
                      <span>🇮🇳</span> NSE & BSE Indian Stocks Supported
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mt-1.5 font-mono">
                    The 5-Rung Valuation & Physical Constraint Screener
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                    Type any <strong>Indian company</strong> (e.g. Reliance, Tata Motors, TCS, Zomato, TARIL, Voltamp) or <strong>global tech giant</strong> (Nvidia, Modine, Powell, Apple).
                  </p>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-center">
                    <span className="text-slate-400 block text-[10px]">Hyperscaler Pipeline</span>
                    <span className="text-cyan-400 font-bold text-base">$1.7 Trillion</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-center">
                    <span className="text-slate-400 block text-[10px]">Liquid-Cooling Ready</span>
                    <span className="text-rose-400 font-bold text-base">&lt; 4% US DCs</span>
                  </div>
                </div>
              </div>

              {/* COMPANY NAME INPUT ON UI */}
              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <form onSubmit={handleEvaluateSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
                  <div className="relative flex-1 w-full">
                    <Building2 className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Type ANY Indian or Global Company (e.g. Reliance, Tata Motors, TARIL, Modine, Zomato, TCS)..."
                      value={companyInput}
                      onChange={(e) => setCompanyInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090d16] border border-slate-700 focus:border-cyan-400 text-sm text-white placeholder-slate-500 focus:outline-none shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isEvaluatingCompany || !companyInput.trim()}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition-all disabled:opacity-50 shrink-0"
                  >
                    {isEvaluatingCompany ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Resolving & Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        <span>Evaluate Company</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Quick Suggestions Chips */}
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mr-1">
                    <span>⚡</span> High Demand Bottleneck Picks:
                  </span>
                  {POPULAR_INDIAN_SUGGESTIONS.map((item) => (
                    <button
                      key={item.query}
                      type="button"
                      onClick={() => {
                        setCompanyInput(item.query);
                        evaluateCompany(item.query);
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-900/90 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-700/60 text-[11px] font-mono transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {evalSuccess && (
                  <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{evalSuccess}</span>
                  </div>
                )}

                {evalError && (
                  <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-mono flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{evalError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#0f1422] p-4 rounded-xl border border-slate-800">
              {/* Search input */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by ticker, name, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Rung Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono w-full md:w-auto">
                <span className="text-slate-500 text-[11px] mr-1">Rung:</span>
                {[
                  { id: 'ALL', label: `All (${stocksList.length})` },
                  { id: 'BUY_A_LOT', label: 'Buy a Lot' },
                  { id: 'BUY', label: 'Buy' },
                  { id: 'BUY_A_LITTLE', label: 'Buy a Little' },
                  { id: 'HOLD', label: 'Hold' },
                  { id: 'SELL', label: 'Sell' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedRungFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                      selectedRungFilter === tab.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Bucket / Market Filter */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-500 text-[11px]">Layer:</span>
                <select
                  value={selectedBucketFilter}
                  onChange={(e) => setSelectedBucketFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">All Layers & Markets</option>
                  <option value="indian">🇮🇳 Indian Stocks (NSE/BSE)</option>
                  <option value="compute">Processors & Compute</option>
                  <option value="memory">Memory & Storage</option>
                  <option value="optics">Optics & Photonics</option>
                  <option value="inference">Inference Clouds</option>
                  <option value="foundation">Physical Foundations (Commodity)</option>
                </select>
              </div>
            </div>

            {/* Stocks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStocks.map((stock) => (
                <StockCard
                  key={stock.ticker}
                  stock={stock}
                  onSelectStock={setSelectedStock}
                />
              ))}
            </div>

            {filteredStocks.length === 0 && (
              <div className="text-center py-16 bg-[#0f1422] rounded-2xl border border-slate-800 text-slate-400">
                <p className="text-sm">No stocks matched the selected filters.</p>
                <button
                  onClick={() => { setSelectedRungFilter('ALL'); setSelectedBucketFilter('ALL'); setSearchQuery(''); }}
                  className="mt-2 text-xs text-cyan-400 hover:underline font-mono"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PHYSICAL CONSTRAINT MAP */}
        {activeTab === 'constraints' && (
          <ConstraintMap onSelectTicker={handleSelectTicker} />
        )}

        {/* TAB 3: 20M MONTE CARLO SIMULATOR */}
        {activeTab === 'simulator' && (
          <NightlyRunSimulator />
        )}

        {/* TAB 4: CUSTOM VALUATION LAB */}
        {activeTab === 'sandbox' && (
          <ValuationLab />
        )}

        {/* TAB 5: PHYSICAL DATA CENTER CALCULATOR */}
        {activeTab === 'calculator' && (
          <DataCenterCalculator />
        )}

        {/* TAB 6: DCA ALLOCATOR */}
        {activeTab === 'dca' && (
          <PortfolioDCA onSelectStock={setSelectedStock} />
        )}
      </main>

      {/* Stock Detail Modal */}
      {selectedStock && (
        <StockDetailModal
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070a10] py-6 px-4 sm:px-6 lg:px-8 mt-12 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-slate-300 font-bold">Market Valuation Engine</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Multi-layer fundamental & technical valuation framework with global & Indian Stock Market (NSE/BSE) integration.
            </p>
          </div>
          <div className="text-right text-[11px] text-slate-500">
            <span>Educational and analytical model only. Not investment advice.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
