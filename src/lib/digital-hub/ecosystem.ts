export const digitalHubEcosystem = {
  brand: {
    name: "GEM Enterprise",
    publicUrl: "https://www.gemcybersecurityassist.com",
    digitalHubUrl: "https://www.gemcybersecurityassist.com/digital-hub",
    logo: "/gem-wallet-mark.svg",
    walletReturnPath: "/digital-hub#wallets",
  },
  wallets: [
    {
      id: "metamask",
      name: "MetaMask",
      kind: "wallet",
      ecosystems: ["Ethereum", "EVM"],
      connection: "EIP-6963 / EIP-1193 injected provider",
      fallbackUrl: "https://metamask.io/download/",
      state: "live",
    },
    {
      id: "phantom",
      name: "Phantom",
      kind: "wallet",
      ecosystems: ["Solana", "Ethereum"],
      connection: "Injected Phantom provider",
      fallbackUrl: "https://phantom.com/download",
      state: "live",
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet / Base App",
      kind: "wallet",
      ecosystems: ["Ethereum", "Base", "EVM"],
      connection: "EIP-6963 / EIP-1193 injected provider",
      fallbackUrl: "https://wallet.coinbase.com/sign-in",
      state: "live",
    },
    {
      id: "farcaster",
      name: "Farcaster",
      kind: "web3-host",
      ecosystems: ["Base", "Ethereum", "EVM"],
      connection: "Farcaster Mini App EIP-1193 wallet host; manifest ownership registration required",
      fallbackUrl: "https://farcaster.xyz",
      state: "registration-required",
    },
    {
      id: "other-web3",
      name: "Other Web3 wallets",
      kind: "multi-wallet",
      ecosystems: ["EVM", "Solana", "Bitcoin", "TON", "TRON"],
      connection: "EIP-6963 discovery + Reown/AppKit expansion gate",
      fallbackUrl: "https://walletguide.walletconnect.network/",
      state: "discovery-live",
    },
  ],
  marketSources: [
    {
      id: "yahoo-finance",
      name: "Yahoo Finance",
      href: "https://finance.yahoo.com/markets/",
      description: "Market overview for indices, cryptocurrencies, rates, commodities, currencies, and related market data.",
    },
    {
      id: "investopedia",
      name: "Investopedia",
      href: "https://www.investopedia.com/markets-news-4427704",
      description: "Independent market education, explainers, and financial news used as an external research reference.",
    },
    {
      id: "forbes-web3",
      name: "Forbes Web3 / Digital Assets",
      href: "https://www.forbes.com/sites/forbesweb3/",
      description: "External Web3 and digital-assets reporting and community coverage.",
    },
  ],
  community: {
    name: "GEM Enterprise Community Hub",
    href: "https://www.gemcybersecurityassist.com/hub",
    alias: "https://www.gemcybersecurityassist.com/community-hub",
    description:
      "GEM's controlled community destination and the future home of chat, events, member circles, knowledge, and community affairs as those capabilities are verified.",
    communicationReferences: [
      { name: "Discord", state: "placeholder" },
      { name: "Reddit", state: "placeholder" },
      { name: "Slack", state: "placeholder" },
    ],
  },
} as const;

export type DigitalHubWalletId = (typeof digitalHubEcosystem.wallets)[number]["id"];

export function getDigitalHubWallet(walletId: string) {
  return digitalHubEcosystem.wallets.find((wallet) => wallet.id === walletId) ?? null;
}
