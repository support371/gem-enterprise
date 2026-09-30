"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Wallet } from "lucide-react";

type EvmProvider = {
  request: (request: { method: string }) => Promise<unknown>;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
};

type SolanaProvider = {
  connect: () => Promise<{ publicKey?: { toString: () => string } }>;
};

declare global {
  interface Window {
    ethereum?: EvmProvider & { providers?: EvmProvider[] };
    phantom?: { solana?: SolanaProvider };
  }
}

function shortAddress(value: string) {
  return value.length > 13 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
}

function record(event: string, target: string) {
  void fetch("/api/digital-hub/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, target, path: window.location.pathname }),
    keepalive: true,
  }).catch(() => undefined);
}

export function ReferralActions({
  code,
  href,
}: {
  code: string;
  href: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    record("referral_copy", "btcc");
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="space-y-4">
      <div className="flex overflow-hidden rounded-2xl border border-lime-200/30 bg-slate-950 shadow-2xl">
        <div className="flex-1 px-6 py-5 font-mono text-2xl font-bold tracking-[0.18em] text-lime-300 sm:text-4xl">
          {code}
        </div>
        <button
          type="button"
          onClick={copyCode}
          className="flex min-w-28 items-center justify-center gap-2 border-l border-white/10 px-5 font-semibold text-white hover:bg-white/10"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => record("referral_open", "btcc")}
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-slate-950 px-6 font-bold text-white hover:bg-slate-800"
      >
        Open BTCC referral <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}

export function WalletConnector() {
  const [status, setStatus] = useState("No wallet connected in this session.");
  const [connected, setConnected] = useState(false);

  async function connectEvm(kind: "metamask" | "coinbase" | "browser") {
    record("wallet_connect_attempt", kind);
    const providers = window.ethereum?.providers ?? (window.ethereum ? [window.ethereum] : []);
    const provider =
      kind === "metamask"
        ? providers.find((candidate) => candidate.isMetaMask && !candidate.isCoinbaseWallet)
        : kind === "coinbase"
          ? providers.find((candidate) => candidate.isCoinbaseWallet)
          : providers[0];

    if (!provider) {
      setStatus("That wallet was not detected in this browser.");
      return;
    }

    try {
      const result = await provider.request({ method: "eth_requestAccounts" });
      const accounts = Array.isArray(result) ? result.filter((item): item is string => typeof item === "string") : [];
      if (!accounts[0]) throw new Error("No public account returned");
      setConnected(true);
      setStatus(`Connected for this browser session: ${shortAddress(accounts[0])}`);
      record("wallet_connected", kind);
    } catch {
      setStatus("Wallet connection was cancelled or could not be completed.");
    }
  }

  async function connectPhantom() {
    record("wallet_connect_attempt", "phantom");
    const provider = window.phantom?.solana;
    if (!provider) {
      setStatus("Phantom was not detected in this browser.");
      return;
    }

    try {
      const result = await provider.connect();
      const address = result.publicKey?.toString();
      if (!address) throw new Error("No public account returned");
      setConnected(true);
      setStatus(`Connected for this browser session: ${shortAddress(address)}`);
      record("wallet_connected", "phantom");
    } catch {
      setStatus("Phantom connection was cancelled or could not be completed.");
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950 p-6 text-white sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="rounded-2xl bg-lime-300 p-3 text-slate-950"><Wallet className="h-6 w-6" /></div>
        <div>
          <h3 className="text-xl font-black">Connect a wallet</h3>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Approval stays inside the wallet. GEM does not request a seed phrase, private key, payment, signature, or transfer here.
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button type="button" onClick={() => connectEvm("metamask")} className="rounded-xl border border-white/10 p-4 text-left hover:bg-white/5">MetaMask</button>
        <button type="button" onClick={connectPhantom} className="rounded-xl border border-white/10 p-4 text-left hover:bg-white/5">Phantom</button>
        <button type="button" onClick={() => connectEvm("coinbase")} className="rounded-xl border border-white/10 p-4 text-left hover:bg-white/5">Coinbase Wallet</button>
        <button type="button" onClick={() => connectEvm("browser")} className="rounded-xl border border-white/10 p-4 text-left hover:bg-white/5">Other EVM wallet</button>
      </div>
      <p className={`mt-5 font-mono text-xs ${connected ? "text-lime-300" : "text-slate-400"}`} aria-live="polite">
        {status}
      </p>
    </div>
  );
}
