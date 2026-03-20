import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_DATA = [
  { id: 1, name: "Bitcoin", symbol: "BTC", price: 96432.50, change: 2.45, cap: "1.8T", vol: "45.2B" },
  { id: 2, name: "Ethereum", symbol: "ETH", price: 3452.12, change: -1.23, cap: "420B", vol: "18.5B" },
  { id: 3, name: "Solana", symbol: "SOL", price: 145.67, change: 5.67, cap: "68B", vol: "4.2B" },
  { id: 4, name: "BNB", symbol: "BNB", price: 598.23, change: 0.45, cap: "92B", vol: "1.2B" },
  { id: 5, name: "XRP", symbol: "XRP", price: 1.12, change: -0.89, cap: "61B", vol: "2.1B" },
];

export function CryptoMarketTable() {
  const [data, setData] = useState(MOCK_DATA);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(coin => ({
        ...coin,
        price: coin.price * (1 + (Math.random() * 0.002 - 0.001)), // +/- 0.1% change
        change: coin.change + (Math.random() * 0.1 - 0.05)
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white rounded-lg border border-border overflow-hidden shadow-sm">
      <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50/50">
        <h3 className="font-serif font-bold text-lg text-primary">Market Overview</h3>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
          Powered by CoinMarketCap
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-muted-foreground font-medium uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Asset</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">24h %</th>
              <th className="px-4 py-3 text-right hidden md:table-cell">Market Cap</th>
              <th className="px-4 py-3 text-right hidden lg:table-cell">Volume (24h)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((coin) => (
              <tr key={coin.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-4 font-medium text-primary">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-xs font-bold text-primary">
                        {coin.symbol[0]}
                    </div>
                    <div>
                        <div className="font-bold">{coin.name}</div>
                        <div className="text-xs text-muted-foreground">{coin.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-right font-mono font-medium">
                  ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className={cn("px-4 py-4 text-right font-medium flex items-center justify-end gap-1", coin.change >= 0 ? "text-green-600" : "text-red-600")}>
                  {coin.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {Math.abs(coin.change).toFixed(2)}%
                </td>
                <td className="px-4 py-4 text-right text-muted-foreground hidden md:table-cell">
                  ${coin.cap}
                </td>
                <td className="px-4 py-4 text-right text-muted-foreground hidden lg:table-cell">
                  ${coin.vol}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
