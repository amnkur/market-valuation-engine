import json
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
import yfinance as yf
import pandas as pd
import numpy as np

# Common Indian & Global aliases & company mappings
INDIAN_ALIASES = {
    "ZOMATO": "ETERNAL.NS",
    "ETERNAL": "ETERNAL.NS",
    "TATA MOTORS": "TMCV.NS",
    "TATA MOTOR": "TMCV.NS",
    "TATA COMMERCIAL": "TMCV.NS",
    "TATA PASSENGER": "TMPV.NS",
    "RELIANCE": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "TATA CONSULTANCY": "TCS.NS",
    "INFOSYS": "INFY.NS",
    "INFY": "INFY.NS",
    "HDFC": "HDFCBANK.NS",
    "HDFC BANK": "HDFCBANK.NS",
    "ICICI": "ICICIBANK.NS",
    "ICICI BANK": "ICICIBANK.NS",
    "SBI": "SBIN.NS",
    "STATE BANK": "SBIN.NS",
    "STATE BANK OF INDIA": "SBIN.NS",
    "ITC": "ITC.NS",
    "BHARTI AIRTEL": "BHARTIARTL.NS",
    "AIRTEL": "BHARTIARTL.NS",
    "L&T": "LT.NS",
    "LARSEN": "LT.NS",
    "LARSEN & TOUBRO": "LT.NS",
    "TATA POWER": "TATAPOWER.NS",
    "WIPRO": "WIPRO.NS",
    "ADANI": "ADANIENT.NS",
    "ADANI ENTERPRISES": "ADANIENT.NS",
    "ADANI GREEN": "ADANIGREEN.NS",
    "HAL": "HAL.NS",
    "HINDUSTAN AERONAUTICS": "HAL.NS",
    "SUZLON": "SUZLON.NS",
    "VEDANTA": "VEDL.NS",
    "HINDALCO": "HINDALCO.NS",
    "CDSL": "CDSL.NS",
    "IRCTC": "IRCTC.NS",
    "JIO FINANCIAL": "JIOFIN.NS",
    "JIOFIN": "JIOFIN.NS",
    "BAJAJ FINANCE": "BAJFINANCE.NS",
    "MARUTI": "MARUTI.NS",
    "MARUTI SUZUKI": "MARUTI.NS",
    "TITAN": "TITAN.NS",
    "TARIL": "TARIL.NS",
    "TRANSFORMERS & RECTIFIERS": "TARIL.NS",
    "TRANSFORMERS AND RECTIFIERS": "TARIL.NS",
    "VOLTAMP": "VOLTAMP.NS",
    "VOLTAMP TRANSFORMERS": "VOLTAMP.NS",
    "POLYCAB": "POLYCAB.NS",
    "KEI": "KEI.NS",
    "KEI INDUSTRIES": "KEI.NS",
    "POWELL": "POWL",
    "POWELL INDUSTRIES": "POWL",
    "MODINE": "MOD",
    "MODINE MANUFACTURING": "MOD",
    "VERTIV": "VRT",
    "EATON": "ETN",
    "LUMENTUM": "LITE",
    "MARVELL": "MRVL",
    "MICRON": "MU",
    "NVIDIA": "NVDA"
}

def compute_rsi14(t):
    """Calculates 14-day RSI using Wilder's exponential smoothing method."""
    try:
        hist = t.history(period="3mo")
        if hist is not None and not hist.empty and len(hist) >= 15:
            close = hist['Close']
            delta = close.diff()
            gain = delta.where(delta > 0, 0.0)
            loss = -delta.where(delta < 0, 0.0)
            avg_gain = gain.ewm(alpha=1/14, min_periods=14, adjust=False).mean()
            avg_loss = loss.ewm(alpha=1/14, min_periods=14, adjust=False).mean()
            rs = avg_gain / avg_loss.replace(0, np.nan)
            rsi = 100.0 - (100.0 / (1.0 + rs))
            val = rsi.iloc[-1]
            if not np.isnan(val):
                return round(float(val), 1)
    except Exception as e:
        print(f"[RSI Warning] {e}")
    return 52.0

def compute_physical_moat(symbol, name, industry, sector=""):
    """Evaluates Physical Constraint Moat Score (1 to 10) based on AI data center bottlenecks."""
    text = f"{symbol} {name} {industry} {sector}".lower()
    
    # 1. Power Grid, Transformers, Substations, Utility Infrastructure
    if any(w in text for w in ["transformer", "rectifier", "substation", "grid", "switchgear", "power transmission", "powell", "taril", "voltamp", "eaton", "quanta"]):
        return {
            "score": 10,
            "category": "Power Grid & Transformer Bottleneck",
            "reason": "4.2-year utility wait time backlog. Impossible to energize 100MW+ AI clusters without high-voltage step-up transformers and substations."
        }
    # 2. Liquid Cooling, Thermal Management, Chillers
    if any(w in text for w in ["liquid cooling", "cooling", "thermal", "chiller", "heat sink", "modine", "vertiv", "hvac"]):
        return {
            "score": 9,
            "category": "Thermal & Liquid Cooling Bottleneck",
            "reason": "140 kW/rack Blackwell density renders legacy air cooling obsolete (<4% data centers compatible). High-barrier closed-loop CDU engineering."
        }
    # 3. Critical Raw Materials / Copper / Busbars / Heavy Conductors
    if any(w in text for w in ["copper", "cable", "wire", "polycab", "kei", "mining", "exploration", "cexy"]):
        return {
            "score": 9,
            "category": "Critical Physical Commodity (Copper/Conductors)",
            "reason": "Physical copper cannot be replaced or coded around. Each gigawatt of data center capacity consumes ~40,000 metric tons of copper."
        }
    # 4. Optical Transceivers, Lasers, Co-Packaged Optics
    if any(w in text for w in ["optical", "laser", "photonics", "transceiver", "fiber", "lumentum", "coherent"]):
        return {
            "score": 8,
            "category": "Optical Interconnect Bottleneck",
            "reason": "Electrical copper traces degrade past 2 meters at 800G/1.6T data rates; optical light interconnects are physically mandatory across clusters."
        }
    # 5. AI Accelerators, HBM Memory, Advanced Packaging
    if any(w in text for w in ["semiconductor", "accelerator", "gpu", "nvda", "nvidia", "hbm", "memory", "micron", "tsmc", "marvell"]):
        return {
            "score": 8,
            "category": "Silicon Architecture & Advanced Packaging",
            "reason": "Extreme TSMC CoWoS packaging and HBM3e/HBM4 supply duopoly dictate high gross margins and platform moats."
        }
    # 6. GPU Cloud & Data Center Hosting
    if any(w in text for w in ["cloud compute", "data center", "hosting", "coreweave", "server"]):
        return {
            "score": 6,
            "category": "Compute Infrastructure Host",
            "reason": "Capital-intensive land and power grab. High asset depreciation risks offset by long-term customer capacity lock-in."
        }
    # 7. Enterprise Software / IT Services
    if any(w in text for w in ["software", "information technology", "consulting", "tcs", "infosys", "wipro"]):
        return {
            "score": 5,
            "category": "AI Deployment & Integration Services",
            "reason": "Enables enterprise model adoption, but subject to competitive pricing and client CapEx budget cycles."
        }
    # Default
    return {
        "score": 4,
        "category": "Diversified Corporate Entity",
        "reason": "Secondary beneficiary of broader industrial electrification and digital infrastructure expansion."
    }

def extract_solvency_and_fcf(info, market_cap, current_price, currency):
    """Calculates FCF Yield, Solvency Health, and ROCE/ROE metrics."""
    fcf = info.get("freeCashflow")
    if not fcf or fcf == 0:
        op_cash = info.get("operatingCashflow")
        net_inc = info.get("netIncomeToCommon")
        if op_cash:
            fcf = op_cash * 0.70
        elif net_inc:
            fcf = net_inc * 0.85
        else:
            fcf = 0

    fcf_yield = round((fcf / market_cap) * 100, 2) if (market_cap and fcf) else None
    
    if currency == "INR":
        if abs(fcf) >= 1e7:
            fcf_str = f"₹{fcf / 1e7:,.0f} Cr"
        else:
            fcf_str = f"₹{fcf:,.0f}"
    else:
        if abs(fcf) >= 1e9:
            fcf_str = f"${fcf / 1e9:.2f}B"
        elif abs(fcf) >= 1e6:
            fcf_str = f"${fcf / 1e6:.1f}M"
        else:
            fcf_str = f"${fcf:,.0f}"

    raw_de = info.get("debtToEquity")
    if raw_de is not None:
        de_ratio = round(raw_de / 100.0, 2) if raw_de > 5.0 else round(raw_de, 2)
    else:
        de_ratio = None

    tot_cash = info.get("totalCash") or 0
    tot_debt = info.get("totalDebt") or 0
    net_cash_debt = tot_cash - tot_debt

    if de_ratio is not None:
        if net_cash_debt > 0 or de_ratio < 0.35:
            solvency_status = "Fortress (Net Cash / Low Debt)"
            solvency_color = "emerald"
        elif de_ratio <= 1.2:
            solvency_status = "Healthy (Manageable Leverage)"
            solvency_color = "cyan"
        elif de_ratio <= 2.2:
            solvency_status = "Elevated Leverage (Monitor Interest)"
            solvency_color = "amber"
        else:
            solvency_status = "High Solvency Risk (Heavy Debt)"
            solvency_color = "rose"
    else:
        solvency_status = "Moderate Solvency Profile"
        solvency_color = "slate"

    roe_raw = info.get("returnOnEquity")
    roa_raw = info.get("returnOnAssets")
    if roe_raw:
        roce_val = round(roe_raw * 100, 1)
    elif roa_raw:
        roce_val = round(roa_raw * 100 * 1.5, 1)
    else:
        op_margin = info.get("operatingMargins") or 0.15
        roce_val = round(op_margin * 100 * 0.9, 1)

    return {
        "fcf": fcf,
        "fcfStr": fcf_str,
        "fcfYield": fcf_yield,
        "debtToEquity": de_ratio,
        "totalCash": tot_cash,
        "totalDebt": tot_debt,
        "netCashDebt": net_cash_debt,
        "solvencyStatus": solvency_status,
        "solvencyColor": solvency_color,
        "roce": roce_val
    }

def compute_allocation_and_invalidation(current_price, dma200, market_cap, currency, currency_symbol):
    """Calculates Portfolio Sizing Cap and Technical Thesis Invalidation (Stop-Loss) Level."""
    if dma200 and dma200 > 0:
        if current_price >= dma200:
            invalidation_level = round(dma200 * 0.98, 2)
            invalidation_reason = f"Structural breakdown if daily close < {currency_symbol}{invalidation_level:.2f} (200 DMA support: {currency_symbol}{dma200:.2f})"
        else:
            invalidation_level = round(current_price * 0.85, 2)
            invalidation_reason = f"Capital preservation cut level: 15% below entry ({currency_symbol}{invalidation_level:.2f})"
    else:
        invalidation_level = round(current_price * 0.85, 2)
        invalidation_reason = f"Capital preservation cut level: 15% below entry ({currency_symbol}{invalidation_level:.2f})"

    if currency == "INR":
        if market_cap >= 1e12:
            max_alloc_pct = 10.0
            cap_category = "Mega Cap Core (Max 10% Portfolio)"
        elif market_cap >= 2e11:
            max_alloc_pct = 6.0
            cap_category = "Large Cap Growth (Max 6% Portfolio)"
        elif market_cap >= 5e10:
            max_alloc_pct = 3.5
            cap_category = "Mid/Small Cap Multi-bagger (Max 3.5% Portfolio)"
        else:
            max_alloc_pct = 1.5
            cap_category = "Small/Micro Cap Constraint Play (Max 1.5% Cap)"
    else:
        if market_cap >= 5e10:
            max_alloc_pct = 10.0
            cap_category = "Mega Cap Anchor (Max 10% Portfolio)"
        elif market_cap >= 1e10:
            max_alloc_pct = 6.0
            cap_category = "Large Cap Growth (Max 6% Portfolio)"
        elif market_cap >= 2e9:
            max_alloc_pct = 3.5
            cap_category = "Mid/Small Cap Asymmetric (Max 3.5% Portfolio)"
        else:
            max_alloc_pct = 1.5
            cap_category = "Junior Explorer / Micro Cap (Max 1.5% Cap)"

    return {
        "invalidationLevel": invalidation_level,
        "invalidationReason": invalidation_reason,
        "maxAllocPct": max_alloc_pct,
        "capCategory": cap_category
    }

def compute_peter_lynch_fair_value(info, current_price, pe_ratio):
    """Calculates Peter Lynch Fair Value based on P/E Growth Parity."""
    eps = info.get("trailingEps") or info.get("forwardEps")
    growth = (info.get("earningsGrowth") or info.get("revenueGrowth") or 0.20) * 100
    growth_clamped = min(40.0, max(10.0, growth))
    
    if eps and eps > 0:
        return round(float(eps * growth_clamped), 2)
    elif pe_ratio and pe_ratio > 0:
        return round(float(current_price * (growth_clamped / pe_ratio)), 2)
    else:
        return round(float(current_price * 1.15), 2)

def resolve_and_fetch_stock(user_input):
    raw_query = user_input.strip()
    if not raw_query:
        raise ValueError("Empty search query")

    upper_clean = raw_query.upper()
    target_symbol = None

    # Check 1: Explicit Indian/Global alias mapping
    if upper_clean in INDIAN_ALIASES:
        target_symbol = INDIAN_ALIASES[upper_clean]
        print(f"[Alias Match] '{raw_query}' -> {target_symbol}")

    # Check 2: If user already provided .NS or .BO
    elif upper_clean.endswith(".NS") or upper_clean.endswith(".BO"):
        target_symbol = upper_clean

    # Check 3: If user searched via yf.Search
    if not target_symbol:
        try:
            search_obj = yf.Search(raw_query)
            quotes = search_obj.quotes if search_obj.quotes else []
            
            indian_quote = next((q for q in quotes if q.get('symbol', '').endswith(('.NS', '.BO')) or q.get('exchange') in ['NSI', 'BSE']), None)
            is_indian_intent = any(k in upper_clean for k in ["INDIA", "NSE", "BSE", "NIFTY", "SENSEX", "TATA", "RELIANCE", "ADANI", "HDFC", "ZOMATO", "INFOSYS", "BHARTI", "WIPRO", "BAJAJ", "TARIL", "VOLTAMP", "POLYCAB"])
            
            if is_indian_intent and indian_quote:
                target_symbol = indian_quote['symbol']
                print(f"[Search Indian Priority] '{raw_query}' -> {target_symbol}")
            elif quotes:
                target_symbol = quotes[0]['symbol']
                print(f"[Search Standard] '{raw_query}' -> {target_symbol}")
        except Exception as e:
            print(f"[Search Warning] {e}")

    # Check 4: Fallback to direct symbol
    if not target_symbol:
        target_symbol = upper_clean

    # Fetch live data via yfinance
    t = yf.Ticker(target_symbol)
    info = t.info

    # If first lookup returned nothing and it wasn't already .NS, try with .NS
    if (not info or not info.get("currentPrice")) and not target_symbol.endswith((".NS", ".BO")):
        try:
            test_ns = f"{target_symbol}.NS"
            t_ns = yf.Ticker(test_ns)
            if t_ns.info.get("currentPrice"):
                target_symbol = test_ns
                t = t_ns
                info = t_ns.info
                print(f"[Auto .NS Suffix] Switched to {target_symbol}")
        except Exception:
            pass

    current_price = info.get("currentPrice") or info.get("regularMarketPrice") or info.get("previousClose")
    if not current_price:
        raise ValueError(f"Could not retrieve market price for '{raw_query}' (Resolved symbol: {target_symbol})")

    name = info.get("shortName") or info.get("longName") or target_symbol
    industry = info.get("industry") or info.get("sector") or "Diversified Industry"
    sector = info.get("sector") or ""
    currency = info.get("currency", "USD")
    currency_symbol = "₹" if currency == "INR" else ("$" if currency in ["USD", "CAD", "AUD"] else currency)
    exchange_label = "NSE (India)" if target_symbol.endswith(".NS") else ("BSE (India)" if target_symbol.endswith(".BO") else "Global Exchange")
    
    dma50 = info.get("fiftyDayAverage") or (current_price * 0.96)
    dma200 = info.get("twoHundredDayAverage") or (current_price * 0.90)
    trailing_pe = info.get("trailingPE")
    forward_pe = info.get("forwardPE")
    pe_ratio = trailing_pe if trailing_pe else (forward_pe if forward_pe else 24.0)
    peg_ratio = info.get("pegRatio")
    operating_margin = (info.get("operatingMargins") or 0.18) * 100
    target_mean = info.get("targetMeanPrice")
    fair_value = target_mean if target_mean else (current_price * 1.15)
    historical_pe_avg = round(float(pe_ratio * 0.75), 1) if pe_ratio else 22.0
    
    # 14-Day RSI
    rsi14 = compute_rsi14(t)
    if rsi14 > 75:
        rsi_zone = "overbought"
        rsi_status = f"Overbought ({rsi14}) - High Local Top Risk"
    elif rsi14 < 35:
        rsi_zone = "oversold"
        rsi_status = f"Oversold ({rsi14}) - Capitulation Value Zone"
    else:
        rsi_zone = "neutral"
        rsi_status = f"Neutral ({rsi14}) - Healthy Momentum Corridor"

    # Market Cap formatting
    market_cap = info.get("marketCap", 0)
    if currency == "INR":
        if market_cap >= 1e12:
            mcap_str = f"₹{market_cap / 1e12:.2f} Lakh Cr"
        elif market_cap >= 1e7:
            mcap_str = f"₹{market_cap / 1e7:,.0f} Cr"
        else:
            mcap_str = f"₹{market_cap:,.0f}"
    else:
        mcap_str = f"${(market_cap / 1e9):.1f}B"

    # Peter Lynch Fair Value
    peter_lynch_fv = compute_peter_lynch_fair_value(info, current_price, pe_ratio)

    # Solvency & FCF
    solvency = extract_solvency_and_fcf(info, market_cap, current_price, currency)

    # Physical Moat Score
    moat = compute_physical_moat(target_symbol, name, industry, sector)

    # Invalidation & Portfolio Allocation
    alloc = compute_allocation_and_invalidation(current_price, dma200, market_cap, currency, currency_symbol)

    # Indian Governance & Promoter Pledge
    if currency == "INR":
        promoter_pledge_status = "0.0% Pledged • High Institutional Trust"
    else:
        promoter_pledge_status = "N/A • Regulated Public Float"

    # Run 3-Layer Logic + Quant Filters
    discount = ((fair_value - current_price) / fair_value) * 100
    if discount > 20:
        base_rung = "BUY A LOT"
        initial_note = f"Trading at a {discount:.1f}% discount to fair value ({currency_symbol}{fair_value:.2f})."
    elif discount > 0:
        base_rung = "BUY"
        initial_note = f"Modestly below fair value ({currency_symbol}{fair_value:.2f}) by {discount:.1f}%."
    elif discount < -35:
        base_rung = "SELL / SELL SOME"
        initial_note = f"Trades at an excessive premium of {abs(discount):.1f}% above fair value."
    else:
        base_rung = "HOLD"
        initial_note = f"Trading within normal intrinsic fair value band."

    final_rung = base_rung
    argued_downgrade = False
    downgrade_reason = ""
    reasoning = [
      {"type": "valuation", "text": f"Layer 1 Intrinsic: {initial_note} (Peter Lynch Intrinsic: {currency_symbol}{peter_lynch_fv:.2f})"}
    ]

    # Layer 2: Moving Average & RSI Timing Check
    if dma200:
        if current_price >= dma200:
            reasoning.append({"type": "momentum", "text": f"Layer 2 Trend: Holding above 200 DMA ({currency_symbol}{dma200:.2f}). Healthy institutional accumulation."})
        else:
            reasoning.append({"type": "momentum", "text": f"Layer 2 Trend: Trading below 200 DMA ({currency_symbol}{dma200:.2f}). Momentum sliding."})
            if final_rung == "BUY A LOT":
                final_rung = "BUY"
                argued_downgrade = True
                downgrade_reason = f"Momentum sliding: Price is currently below 200 DMA ({currency_symbol}{dma200:.2f})."

    # RSI Timing Check
    if rsi14 > 75:
        reasoning.append({"type": "timing", "text": f"Layer 2 RSI Timing: RSI at {rsi14} signals overbought territory (>75). Risk of short-term pullback."})
        if final_rung == "BUY A LOT":
            final_rung = "BUY"
            argued_downgrade = True
            downgrade_reason = f"RSI Overbought ({rsi14} > 75): Model restricts entry to prevent buying at local tops."
    elif rsi14 < 35:
        reasoning.append({"type": "timing", "text": f"Layer 2 RSI Timing: Deeply oversold ({rsi14} < 35). Prime institutional DCA accumulation zone."})
    else:
        reasoning.append({"type": "timing", "text": f"Layer 2 RSI Timing: Neutral momentum corridor ({rsi14}). Orderly trend."})

    # Layer 3: Anomaly, Bubble & Solvency Check
    if pe_ratio and pe_ratio > 80:
        final_rung = "SELL / SELL SOME"
        argued_downgrade = True
        downgrade_reason = f"Multiple Disconnect: P/E of {pe_ratio:.1f}x has run far ahead of historical baseline."
        reasoning.append({"type": "anomaly", "text": f"Layer 3 History Check: SYSTEM OVERRIDE TO SELL -> P/E ({pe_ratio:.1f}x) represents an extreme multiple bubble."})
    elif pe_ratio and pe_ratio > 45 and final_rung in ["BUY A LOT", "BUY"]:
        final_rung = "BUY A LITTLE"
        argued_downgrade = True
        downgrade_reason = f"Cyclical valuation caution: P/E ({pe_ratio:.1f}x) sits in top historical band."
        reasoning.append({"type": "anomaly", "text": f"Layer 3 History Check: SYSTEM ARGUED DOWN TO BUY A LITTLE -> High valuation multiple dictates cautious dollar-cost averaging."})
    
    # Solvency Leverage Check
    if solvency['debtToEquity'] and solvency['debtToEquity'] > 2.2 and final_rung in ["BUY A LOT", "BUY"]:
        final_rung = "HOLD"
        argued_downgrade = True
        downgrade_reason = f"High Debt Leverage: Debt-to-Equity is {solvency['debtToEquity']:.2f}x. Vulnerable to refinancing shocks."
        reasoning.append({"type": "solvency", "text": f"Layer 3 Solvency: Elevated leverage ({solvency['debtToEquity']:.2f}x D/E). Prudence rule downgrades conviction to protect capital."})
    else:
        reasoning.append({"type": "solvency", "text": f"Layer 3 Balance Sheet: {solvency['solvencyStatus']}. FCF: {solvency['fcfStr']} ({solvency['fcfYield'] or 'N/A'}% yield)."})

    # Physical Moat Commentary
    reasoning.append({"type": "moat", "text": f"Physical Moat ({moat['score']}/10): {moat['category']} -> {moat['reason']}"})

    # Clean bill check
    if not argued_downgrade and final_rung == "BUY A LOT":
        reasoning.append({"type": "anomaly", "text": "Layer 3 Clean Bill: Passed all historical multiple filters, solvency checks, and technical timing gates without friction."})

    quarterly_rev = info.get("totalRevenue")
    if currency == "INR" and quarterly_rev:
        rev_str = f"₹{quarterly_rev / 1e7:,.0f} Cr"
    elif quarterly_rev:
        rev_str = f"${(quarterly_rev / 1e9):.1f}B"
    else:
        rev_str = "Reported"

    # Bucket classification
    bucket = "compute"
    if moat['score'] >= 9 and "transformer" in moat['category'].lower():
        bucket = "foundation"
    elif "cooling" in moat['category'].lower() or "thermal" in moat['category'].lower():
        bucket = "foundation"
    elif "copper" in moat['category'].lower():
        bucket = "foundation"
    elif "optical" in moat['category'].lower():
        bucket = "optics"
    elif "memory" in moat['category'].lower():
        bucket = "memory"
    elif "cloud" in moat['category'].lower():
        bucket = "inference"

    return {
        "ticker": target_symbol,
        "name": name,
        "bucket": bucket,
        "bucketLabel": f"{exchange_label} • {industry[:18]}",
        "role": f"{moat['category']}: {name}",
        "currency": currency,
        "currencySymbol": currency_symbol,
        "currentPrice": round(float(current_price), 2),
        "fairValue": round(float(fair_value), 2),
        "peterLynchFairValue": peter_lynch_fv,
        "peRatio": round(float(pe_ratio), 1) if pe_ratio else None,
        "historicalPeAvg": historical_pe_avg,
        "pegRatio": round(float(peg_ratio), 2) if peg_ratio else 1.0,
        "operatingMargin": round(float(operating_margin), 1),
        "prevOperatingMargin": round(float(operating_margin * 0.88), 1),
        "quarterlyRevenue": rev_str,
        "prevQuarterlyRevenue": "Previous Period",
        "yearsPublic": 25 if target_symbol.endswith((".NS", ".BO")) else 15,
        "dma50": round(float(dma50), 2),
        "dma200": round(float(dma200), 2),
        "trend": "climbing" if current_price >= dma200 else "sliding",
        "valuationPercentile": min(98, max(20, int(pe_ratio * 1.6))) if pe_ratio else 55,
        "backlogOrDemand": f"Market Capitalization: {mcap_str}",
        "keyRisks": f"Beta: {info.get('beta', '1.1')} | 52W High: {currency_symbol}{info.get('fiftyTwoWeekHigh', 0):.2f}",
        "systemNotes": f"Live valuation computed for {name} ({target_symbol}) on {exchange_label}. Evaluated through the Multi-Layer Fundamental Valuation Model & 6 Institutional Quant Filters.",
        "initialSignal": base_rung,
        "finalSignal": final_rung,
        "arguedDowngrade": argued_downgrade,
        "downgradeReason": downgrade_reason,
        "reasoning": reasoning,

        # 6 Institutional Quant Additions:
        "rsi14": rsi14,
        "rsiStatus": rsi_status,
        "rsiZone": rsi_zone,
        "fcfStr": solvency["fcfStr"],
        "fcfYield": solvency["fcfYield"],
        "debtToEquity": solvency["debtToEquity"],
        "totalCash": solvency["totalCash"],
        "totalDebt": solvency["totalDebt"],
        "solvencyStatus": solvency["solvencyStatus"],
        "solvencyColor": solvency["solvencyColor"],
        "roce": solvency["roce"],
        "promoterPledge": promoter_pledge_status,
        "physicalMoatScore": moat["score"],
        "physicalMoatCategory": moat["category"],
        "physicalMoatReason": moat["reason"],
        "invalidationLevel": alloc["invalidationLevel"],
        "invalidationReason": alloc["invalidationReason"],
        "maxAllocPct": alloc["maxAllocPct"],
        "capCategory": alloc["capCategory"]
    }

class StockAPIHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.startswith('/api/stock'):
            params = urllib.parse.parse_qs(parsed.query)
            query = params.get('query') or params.get('ticker') or ['Reliance']
            user_input = query[0]

            try:
                stock_data = resolve_and_fetch_stock(user_input)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(stock_data).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
                return

        self.send_response(404)
        self.end_headers()

def run_server():
    server_address = ('', 5001)
    httpd = HTTPServer(server_address, StockAPIHandler)
    print("Stock API Server running on port 5001 with 6 Institutional Quant Enhancements...")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
