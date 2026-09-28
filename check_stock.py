import sys
import os

# Reconfigure stdout for UTF-8 on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from api_server import resolve_and_fetch_stock

def evaluate_ticker(user_input):
    user_input = user_input.strip()
    if not user_input:
        print("[!] Error: Empty input query.")
        return

    print(f"\n=================================================================")
    print(f"  BWB 3-LAYER VALUATION & 6 QUANT AUDIT ENGINE: {user_input}")
    print(f"=================================================================")
    print(f"[*] Fetching live market & quant data via yfinance...")

    try:
        data = resolve_and_fetch_stock(user_input)
    except Exception as e:
        print(f"[!] Error fetching stock data: {e}")
        return

    cs = data.get('currencySymbol', '$')
    print(f"\n[+] Company:              {data['name']} ({data['ticker']})")
    print(f"[+] Market / Exchange:    {data['bucketLabel']}")
    print(f"[+] Current Price:        {cs}{data['currentPrice']:.2f}")
    print(f"[+] BWB Fair Value:       {cs}{data['fairValue']:.2f}")
    if data.get('peterLynchFairValue'):
        print(f"[+] Peter Lynch FV:       {cs}{data['peterLynchFairValue']:.2f}")
    if data.get('dma200'):
        print(f"[+] 200-Day Moving Avg:   {cs}{data['dma200']:.2f} ({'ABOVE' if data['currentPrice'] >= data['dma200'] else 'BELOW'})")
    if data.get('dma50'):
        print(f"[+] 50-Day Moving Avg:    {cs}{data['dma50']:.2f}")
    if data.get('peRatio'):
        print(f"[+] P/E Multiple:         {data['peRatio']}x (10Y avg: {data.get('historicalPeAvg', 22)}x)")
    if data.get('pegRatio'):
        print(f"[+] PEG Ratio:            {data['pegRatio']}")
    if data.get('operatingMargin'):
        print(f"[+] Operating Margin:     {data['operatingMargin']}%")

    print(f"\n--- 6 INSTITUTIONAL QUANT ENHANCEMENTS ---")
    print(f"[1] 14-Day RSI Momentum:  {data.get('rsi14', 50)} ({data.get('rsiStatus', 'Neutral')})")
    print(f"[2] Free Cash Flow:       {data.get('fcfStr', 'N/A')} (FCF Yield: {data.get('fcfYield', 'N/A')}%)")
    print(f"[3] Balance Sheet Health: {data.get('solvencyStatus', 'N/A')} (D/E: {data.get('debtToEquity', 'N/A')}x)")
    print(f"[4] Capital Return / ROE: ROCE {data.get('roce', 20)}% | {data.get('promoterPledge', 'Clean')}")
    print(f"[5] Physical Moat Score:  {data.get('physicalMoatScore', 8)} / 10 ({data.get('physicalMoatCategory', 'Constraint')})")
    print(f"    -> Moat Detail:       {data.get('physicalMoatReason', '')}")
    print(f"[6] Risk Management:      Stop Cut: {cs}{data.get('invalidationLevel', 0):.2f} | Max Alloc: {data.get('maxAllocPct', 5)}% ({data.get('capCategory', '')})")

    print(f"\n-----------------------------------------------------------------")
    print(f"  OFFICIAL VERDICT:       >>> {data['finalSignal']} <<<")
    if data.get('arguedDowngrade'):
        print(f"  [!] THE MODEL ARGUED DOWN: {data.get('downgradeReason', '')}")
    print(f"-----------------------------------------------------------------")
    print("\nDecision Trail Breakdown:")
    for step in data.get('reasoning', []):
        print(f"  * [{step['type'].upper()}] {step['text']}")
    print("=================================================================\n")

if __name__ == "__main__":
    ticker = sys.argv[1] if len(sys.argv) > 1 else input("Enter stock or company name: ")
    evaluate_ticker(ticker)
