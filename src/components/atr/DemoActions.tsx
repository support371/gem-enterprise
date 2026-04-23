'use client';

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";

const STORAGE_KEY = "atr_demo_account";
const INITIAL_BALANCE = 100_000;

interface DemoHoldings {
  cash: number;
  realEstate: number;
  crypto: number;
}

interface DemoTransaction {
  id: string;
  type: "buy" | "sell";
  asset: "realEstate" | "crypto";
  amount: number;
  timestamp: number;
}

interface DemoAccount {
  holdings: DemoHoldings;
  transactions: DemoTransaction[];
}

function getInitialAccount(): DemoAccount {
  return {
    holdings: { cash: INITIAL_BALANCE, realEstate: 0, crypto: 0 },
    transactions: [],
  };
}

function loadAccount(): DemoAccount {
  if (typeof window === "undefined") return getInitialAccount();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    /* ignore */
  }
  return getInitialAccount();
}

function saveAccount(account: DemoAccount) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  } catch {
    /* ignore */
  }
}

export function DemoActions() {
  const [account, setAccount] = useState<DemoAccount>(getInitialAccount);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant?: "error" } | null>(null);

  useEffect(() => {
    setAccount(loadAccount());
    setIsLoaded(true);
  }, []);

  const showToast = useCallback((message: string, variant?: "error") => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const updateAccount = useCallback((next: DemoAccount) => {
    setAccount(next);
    saveAccount(next);
  }, []);

  const simulateBuy = useCallback(
    (amount: number, asset: "realEstate" | "crypto") => {
      if (account.holdings.cash < amount) {
        showToast("Insufficient cash balance for this trade.", "error");
        return;
      }
      const next: DemoAccount = {
        holdings: {
          ...account.holdings,
          cash: account.holdings.cash - amount,
          [asset]: account.holdings[asset] + amount,
        },
        transactions: [
          {
            id: Date.now().toString(),
            type: "buy",
            asset,
            amount,
            timestamp: Date.now(),
          },
          ...account.transactions,
        ],
      };
      updateAccount(next);
      showToast(
        `Purchased $${amount.toLocaleString()} of ${asset === "realEstate" ? "Real Estate" : "Crypto"} Allocation`
      );
    },
    [account, updateAccount, showToast]
  );

  const simulateSell = useCallback(
    (amount: number, asset: "realEstate" | "crypto") => {
      if (account.holdings[asset] < amount) {
        showToast(`Insufficient ${asset} balance.`, "error");
        return;
      }
      const next: DemoAccount = {
        holdings: {
          ...account.holdings,
          cash: account.holdings.cash + amount,
          [asset]: account.holdings[asset] - amount,
        },
        transactions: [
          {
            id: Date.now().toString(),
            type: "sell",
            asset,
            amount,
            timestamp: Date.now(),
          },
          ...account.transactions,
        ],
      };
      updateAccount(next);
      showToast(
        `Sold $${amount.toLocaleString()} of ${asset === "realEstate" ? "Real Estate" : "Crypto"}`
      );
    },
    [account, updateAccount, showToast]
  );

  const resetDemo = useCallback(() => {
    const fresh = getInitialAccount();
    updateAccount(fresh);
    showToast("Demo account reset.");
  }, [updateAccount, showToast]);

  if (!isLoaded) return null;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`px-4 py-3 rounded text-sm font-medium ${
            toast.variant === "error"
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-green-50 border border-green-200 text-green-700"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Holdings summary */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm uppercase tracking-wider text-[hsl(215.4,16.3%,46.9%)]">
          Holdings
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <span className="text-[hsl(215.4,16.3%,46.9%)] text-sm">Cash Balance</span>
            <span className="font-mono font-bold text-[hsl(222,47%,11%)]">
              ${account.holdings.cash.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <span className="text-[hsl(215.4,16.3%,46.9%)] text-sm">Real Estate</span>
            <span className="font-mono font-bold text-[hsl(222,47%,11%)]">
              ${account.holdings.realEstate.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <span className="text-[hsl(215.4,16.3%,46.9%)] text-sm">Digital Assets</span>
            <span className="font-mono font-bold text-[hsl(222,47%,11%)]">
              ${account.holdings.crypto.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Simulator Actions */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm uppercase tracking-wider text-[hsl(215.4,16.3%,46.9%)]">
          Simulator Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => simulateBuy(5000, "realEstate")}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded text-sm transition-colors"
          >
            <TrendingUp className="h-4 w-4" /> Simulate Buy
          </button>
          <button
            onClick={() => simulateSell(5000, "realEstate")}
            className="flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2.5 px-4 rounded text-sm transition-colors"
          >
            <TrendingDown className="h-4 w-4" /> Simulate Sell
          </button>
        </div>
        <button
          onClick={resetDemo}
          className="w-full flex items-center justify-center gap-2 text-[hsl(215.4,16.3%,46.9%)] hover:text-[hsl(222,47%,11%)] py-2.5 text-sm transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Reset Demo Account
        </button>
      </div>

      {/* Recent Transactions */}
      {account.transactions.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-sm uppercase tracking-wider text-[hsl(215.4,16.3%,46.9%)]">
            Recent Activity
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {account.transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex justify-between items-center p-2.5 bg-gray-50 rounded text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      tx.type === "buy" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="font-medium capitalize">
                    {tx.type} {tx.asset === "realEstate" ? "Real Estate" : "Crypto"}
                  </span>
                </div>
                <span className="font-mono">${tx.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
