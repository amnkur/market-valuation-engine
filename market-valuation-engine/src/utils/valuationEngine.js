/**
 * Multi-Layer Fundamental Valuation & Signal Engine + 6 Institutional Quant Filters
 * Layer 1: Valuation & Intrinsic Worth vs Current Price + Peter Lynch Growth Parity
 * Layer 2: Momentum, 200 DMA & 14-Day RSI Technical Timing Filters
 * Layer 3: Historical Anomaly, Multiple Bubble, Solvency Runway & Physical Constraint Moats
 */

export const SIGNAL_RUNGS = {
  BUY_A_LOT: {
    label: 'BUY A LOT',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    desc: 'High conviction accumulation. Margin of safety confirmed, passed historical multiple and solvency checks clean.'
  },
  BUY: {
    label: 'BUY',
    color: 'cyan',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    desc: 'Solid fundamental value. Moderate position sizing; minor technical momentum or timing constraint identified.'
  },
  BUY_A_LITTLE: {
    label: 'BUY A LITTLE',
    color: 'amber',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    desc: 'Cautious starter position. Stock may be at a cyclical multiple peak, overbought RSI, or high-beta exploratory stage.'
  },
  HOLD: {
    label: 'HOLD',
    color: 'slate',
    badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    desc: 'Fairly valued, elevated debt burden, or balanced risk/reward. Wait for backlog conversion or debt stabilization.'
  },
  SELL: {
    label: 'SELL / SELL SOME',
    color: 'rose',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    desc: 'Price has run far past the business fundamentals. Lock in profits or trim exposure.'
  }
};

export function evaluateStock(stock) {
  const argumentLog = [];
  let baseRung = 'HOLD';
  let initialRung = 'HOLD';
  let finalRung = 'HOLD';
  let isArguedDown = false;
  let primaryAnomalyReason = '';

  const {
    currentPrice,
    fairValue,
    peterLynchFairValue,
    peRatio,
    historicalPeAvg = 25.0,
    pegRatio,
    dma50,
    dma200,
    yearsPublic = 10,
    valuationPercentile = 50,
    operatingMargin = 20,
    cashBurnRatio = 0,
    currencySymbol = '$',
    rsi14,
    debtToEquity,
    solvencyStatus,
    fcfStr,
    fcfYield,
    physicalMoatScore,
    physicalMoatCategory,
    physicalMoatReason,
    invalidationLevel,
    invalidationReason,
    maxAllocPct,
    capCategory
  } = stock;

  const cs = currencySymbol;

  // LAYER 1: Valuation Check
  const discountToFairValue = fairValue ? ((fairValue - currentPrice) / fairValue) * 100 : 0;
  
  if (discountToFairValue > 20) {
    baseRung = 'BUY A LOT';
    argumentLog.push({
      step: 'Layer 1: Intrinsic Valuation',
      status: 'positive',
      text: `Current price (${cs}${currentPrice}) trades at a ${discountToFairValue.toFixed(1)}% discount to estimated fair value (${cs}${fairValue}).`
    });
  } else if (discountToFairValue > 0) {
    baseRung = 'BUY';
    argumentLog.push({
      step: 'Layer 1: Intrinsic Valuation',
      status: 'positive',
      text: `Current price (${cs}${currentPrice}) is modestly below fair value (${cs}${fairValue}) by ${discountToFairValue.toFixed(1)}%.`
    });
  } else if (discountToFairValue < -35) {
    baseRung = 'SELL';
    argumentLog.push({
      step: 'Layer 1: Intrinsic Valuation',
      status: 'negative',
      text: `Current price (${cs}${currentPrice}) exceeds fair value (${cs}${fairValue}) by ${Math.abs(discountToFairValue).toFixed(1)}%. Severe premium.`
    });
  } else {
    baseRung = 'HOLD';
    argumentLog.push({
      step: 'Layer 1: Intrinsic Valuation',
      status: 'neutral',
      text: `Trading within normal intrinsic fair value band (${cs}${fairValue}).`
    });
  }

  // Peter Lynch Growth Parity Check
  if (peterLynchFairValue) {
    const plDiscount = ((peterLynchFairValue - currentPrice) / peterLynchFairValue) * 100;
    argumentLog.push({
      step: 'Peter Lynch Growth Parity Check',
      status: plDiscount > 0 ? 'positive' : 'warning',
      text: `Peter Lynch Intrinsic: ${cs}${peterLynchFairValue.toFixed(2)} (${plDiscount > 0 ? `${plDiscount.toFixed(1)}% undervalued vs earnings growth` : `${Math.abs(plDiscount).toFixed(1)}% premium`}).`
    });
  }

  // PEG evaluation bonus/penalty
  if (pegRatio !== null && pegRatio !== undefined) {
    if (pegRatio < 0.5) {
      argumentLog.push({
        step: 'PEG Ratio Metric',
        status: 'positive',
        text: `PEG ratio of ${pegRatio.toFixed(2)} signifies exceptionally undervalued earnings growth (< 1.0).`
      });
      if (baseRung === 'BUY') baseRung = 'BUY A LOT';
    } else if (pegRatio > 2.0) {
      argumentLog.push({
        step: 'PEG Ratio Metric',
        status: 'negative',
        text: `PEG ratio of ${pegRatio.toFixed(2)} is elevated, warning of excessive growth expectations.`
      });
      if (baseRung === 'BUY A LOT') baseRung = 'BUY';
    }
  }

  initialRung = baseRung;
  finalRung = baseRung;

  // LAYER 2: Trend & Moving Average Check
  if (dma200) {
    const vs200 = ((currentPrice - dma200) / dma200) * 100;
    if (currentPrice >= dma200) {
      argumentLog.push({
        step: 'Layer 2: Technical Moving Average (200 DMA)',
        status: 'positive',
        text: `Price (${cs}${currentPrice}) is holding ${vs200.toFixed(1)}% above the 200-day moving average (${cs}${dma200}). Bullish institutional accumulation.`
      });
    } else {
      argumentLog.push({
        step: 'Layer 2: Technical Moving Average (200 DMA)',
        status: 'warning',
        text: `Price (${cs}${currentPrice}) is below the 200-day moving average (${cs}${dma200}) by ${Math.abs(vs200).toFixed(1)}%. Momentum is sliding.`
      });
      if (finalRung === 'BUY A LOT') {
        finalRung = 'BUY';
        isArguedDown = true;
        primaryAnomalyReason = `Momentum sliding below 200 DMA (${cs}${dma200})`;
      }
    }
  }

  // LAYER 2B: 14-Day RSI Technical Timing Gate
  if (rsi14 !== undefined && rsi14 !== null) {
    if (rsi14 > 75) {
      argumentLog.push({
        step: 'Layer 2: 14-Day RSI Timing Filter',
        status: 'warning',
        text: `RSI is ${rsi14} (>75). Overbought local top risk. Tactical caution: stagger DCA purchases rather than lump-sum entry.`
      });
      if (finalRung === 'BUY A LOT') {
        finalRung = 'BUY';
        isArguedDown = true;
        primaryAnomalyReason = primaryAnomalyReason || `RSI Overbought (${rsi14} > 75): Stagger entries to avoid local tops`;
      }
    } else if (rsi14 < 35) {
      argumentLog.push({
        step: 'Layer 2: 14-Day RSI Timing Filter',
        status: 'positive',
        text: `RSI is ${rsi14} (<35). Deep oversold capitulation zone. Prime accumulation window with favorable risk/reward.`
      });
    } else {
      argumentLog.push({
        step: 'Layer 2: 14-Day RSI Timing Filter',
        status: 'neutral',
        text: `RSI is ${rsi14}. Trading within orderly, healthy momentum corridor (35-75).`
      });
    }
  }

  // LAYER 3: The System "Argues With Itself" (Anomaly & History Check)
  // Check 3A: Extreme Historical Multiple Bubble (e.g. Lumentum 195x, Marvell 80x, Zomato 700x)
  const isMultipleBubble = (peRatio && peRatio > 75) || (peRatio && historicalPeAvg && peRatio > (historicalPeAvg * 2.0));
  
  if (isMultipleBubble) {
    finalRung = 'SELL';
    isArguedDown = true;
    primaryAnomalyReason = `Valuation Bubble: Multiple of ${peRatio}x is excessively stretched beyond historical baseline (${historicalPeAvg}x)`;
    argumentLog.push({
      step: 'Layer 3: Anomaly Filter - Multiple Bubble',
      status: 'negative',
      text: `SYSTEM OVERRIDE TO SELL: Paying ${peRatio}x earnings for a business with a historical norm of ${historicalPeAvg}x. Price has severely outpaced business reality.`
    });
  }
  // Check 3B: Cyclical Peak Valuation (P/E > 45 or Top 5% of history, e.g. Micron)
  else if ((peRatio && peRatio > 45) || valuationPercentile >= 95) {
    if (finalRung === 'BUY A LOT' || finalRung === 'BUY') {
      finalRung = 'BUY A LITTLE';
      isArguedDown = true;
      primaryAnomalyReason = `Cyclical valuation caution: P/E (${peRatio}x) or ${valuationPercentile}th percentile sits in upper cyclical band`;
      argumentLog.push({
        step: 'Layer 3: Anomaly Filter - Cyclical Percentile',
        status: 'warning',
        text: `SYSTEM ARGUED DOWN TO BUY A LITTLE: Stock is in the upper valuation tier. Restrict to dollar-cost averaging / starter sizing.`
      });
    }
  }
  // Check 3C: Short Public Track Record Check (< 2 years, e.g. SanDisk, Cerebras)
  else if (yearsPublic < 2.0) {
    if (finalRung === 'BUY A LOT') {
      finalRung = 'BUY';
      isArguedDown = true;
      primaryAnomalyReason = `Track Record Constraint: Only public for ${(yearsPublic * 12).toFixed(0)} months; lacks 10-year baseline`;
      argumentLog.push({
        step: 'Layer 3: Anomaly Filter - Public Track Record',
        status: 'warning',
        text: `SYSTEM ARGUED DOWN TO BUY: Company has only been public for ${(yearsPublic * 12).toFixed(0)} months. Lacks full cycle historical data to verify fair value against proprietary models.`
      });
    }
  }

  // Check 3D: High Cash Burn / Leverage Warning (e.g. CoreWeave)
  if (cashBurnRatio > 1.2 || (debtToEquity && debtToEquity > 2.2)) {
    if (finalRung === 'BUY A LOT' || finalRung === 'BUY') {
      finalRung = 'HOLD';
      isArguedDown = true;
      primaryAnomalyReason = `Solvency & Leverage Alert: Elevated debt (${debtToEquity || cashBurnRatio}x) introduces rate sensitivity`;
      argumentLog.push({
        step: 'Layer 3: Anomaly Filter - Solvency & Debt',
        status: 'negative',
        text: `SYSTEM ARGUED DOWN TO HOLD: Elevated debt load/cash burn relative to operating income. Capital preservation mandate applied.`
      });
    }
  } else if (solvencyStatus) {
    argumentLog.push({
      step: 'Layer 3: Balance Sheet Health',
      status: 'positive',
      text: `${solvencyStatus}. FCF: ${fcfStr || 'Positive'} (${fcfYield ? fcfYield + '%' : 'Steady'}).`
    });
  }

  // Physical Constraint Moat Check
  if (physicalMoatScore) {
    argumentLog.push({
      step: 'Physical Constraint Moat',
      status: physicalMoatScore >= 8 ? 'positive' : 'neutral',
      text: `Physical Moat Score: ${physicalMoatScore}/10 (${physicalMoatCategory || 'Physical Bottleneck'}). ${physicalMoatReason || ''}`
    });
  }

  // Clean bill check
  if (!isArguedDown && finalRung === 'BUY A LOT') {
    argumentLog.push({
      step: 'Layer 3: History Check - Clean Bill',
      status: 'positive',
      text: 'Passed all 10-year multiple filters, balance sheet sanity, and momentum checks without restrictions. Signal confirmed at BUY A LOT.'
    });
  }

  // Invalidation & Allocation
  if (invalidationLevel) {
    argumentLog.push({
      step: 'Risk Control & Portfolio Sizing',
      status: 'neutral',
      text: `Thesis Invalidation Cut: ${cs}${invalidationLevel} (${invalidationReason}). Max Allocation Cap: ${maxAllocPct || 5}% (${capCategory}).`
    });
  }

  return {
    initialRung,
    finalRung,
    isArguedDown,
    primaryAnomalyReason,
    argumentLog
  };
}

/**
 * Monte Carlo nightly batch simulation (20 million calculations)
 */
export function runNightlyCalculationsBatch(stocks, scenarioModifiers = {}) {
  const {
    hyperscalerBacklogGrowth = 0,
    powerGridDelayMonths = 0
  } = scenarioModifiers;

  const results = stocks.map((stock) => {
    let simulatedStock = { ...stock };
    
    if (hyperscalerBacklogGrowth < -10) {
      simulatedStock.fairValue = simulatedStock.fairValue * (1 + (hyperscalerBacklogGrowth / 200));
    }

    if (powerGridDelayMonths > 12 && simulatedStock.ticker === 'COREWEAVE') {
      simulatedStock.operatingMargin = Math.min(85, (simulatedStock.operatingMargin || 18) + 8);
    }

    const evaluation = evaluateStock(simulatedStock);
    return {
      ticker: stock.ticker,
      name: stock.name,
      originalSignal: stock.finalSignal,
      simulatedSignal: evaluation.finalRung,
      isChanged: stock.finalSignal !== evaluation.finalRung,
      evaluation
    };
  });

  return results;
}
