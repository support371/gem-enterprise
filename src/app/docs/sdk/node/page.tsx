import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Node.js / TypeScript SDK — Gem Enterprise Docs",
  description:
    "Install and use the Gem Enterprise Node.js / TypeScript SDK v2.4.0 to manage threats, assets, and webhooks.",
};

export default function NodeSDKPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">
            Node.js / TypeScript SDK
          </h1>
          <span className="text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
            v2.4.0
          </span>
        </div>
        <p className="text-slate-400 text-base leading-relaxed">
          The official Node.js and TypeScript SDK for Gem Enterprise. Supports
          Node 18+ and ships with full TypeScript type definitions out of the
          box.
        </p>
      </div>

      {/* Installation */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Installation
        </h2>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
          npm install @gem-enterprise/sdk
        </pre>
        <p className="text-slate-400 text-sm">
          Or with yarn / pnpm:
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`yarn add @gem-enterprise/sdk
# or
pnpm add @gem-enterprise/sdk`}
        </pre>
      </section>

      {/* Initialization */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Initialization
        </h2>
        <p className="text-slate-400 text-sm">
          Create a single client instance and reuse it across your application.
          Store your API key in an environment variable — never hard-code it.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`import { GemClient } from "@gem-enterprise/sdk";

const client = new GemClient({
  apiKey: process.env.GEM_API_KEY!,
  // Optional: override base URL for self-hosted deployments
  baseUrl: "https://api.gem-enterprise.com/v2",
  // Optional: request timeout in milliseconds (default: 30_000)
  timeout: 30_000,
});`}
        </pre>
        <p className="text-slate-400 text-sm">
          The <code className="text-slate-300 bg-slate-800 px-1 rounded">GemClient</code> constructor accepts a{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">GemClientOptions</code> object:
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`interface GemClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number; // default: 3
  headers?: Record<string, string>;
}`}
        </pre>
      </section>

      {/* Example 1: threats.list */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Example 1 — List Threats
        </h2>
        <p className="text-slate-400 text-sm">
          Retrieve paginated threat intelligence records. All list methods
          return a typed{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">PagedResponse&lt;T&gt;</code>.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`import { GemClient, ThreatSeverity, type Threat } from "@gem-enterprise/sdk";

const client = new GemClient({ apiKey: process.env.GEM_API_KEY! });

async function fetchCriticalThreats(): Promise<Threat[]> {
  const response = await client.threats.list({
    severity: [ThreatSeverity.Critical, ThreatSeverity.High],
    status: "open",
    limit: 50,
    page: 1,
  });

  console.log(\`Total threats: \${response.total}\`);
  console.log(\`Page \${response.page} of \${response.totalPages}\`);

  return response.data;
}

const threats = await fetchCriticalThreats();
threats.forEach((threat) => {
  console.log(\`[\${threat.severity}] \${threat.title} — \${threat.id}\`);
});`}
        </pre>
      </section>

      {/* Example 2: assets.create */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Example 2 — Create an Asset
        </h2>
        <p className="text-slate-400 text-sm">
          Register a new asset in the inventory. The SDK validates input against
          the{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">CreateAssetInput</code>{" "}
          schema before sending the request.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`import { GemClient, AssetType, type Asset } from "@gem-enterprise/sdk";

const client = new GemClient({ apiKey: process.env.GEM_API_KEY! });

async function registerAsset(): Promise<Asset> {
  const asset = await client.assets.create({
    name: "Production API Gateway",
    type: AssetType.Service,
    metadata: {
      environment: "production",
      region: "us-east-1",
      owner: "platform-team",
    },
    tags: ["critical", "public-facing"],
    riskScore: 85,
  });

  console.log(\`Asset created: \${asset.id}\`);
  return asset;
}

const newAsset = await registerAsset();`}
        </pre>
      </section>

      {/* Example 3: webhooks.register */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Example 3 — Register a Webhook
        </h2>
        <p className="text-slate-400 text-sm">
          Subscribe to platform events. The{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">WebhookEvent</code> enum
          lists all available event types.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`import {
  GemClient,
  WebhookEvent,
  type Webhook,
} from "@gem-enterprise/sdk";

const client = new GemClient({ apiKey: process.env.GEM_API_KEY! });

async function registerWebhook(): Promise<Webhook> {
  const webhook = await client.webhooks.register({
    url: "https://your-app.example.com/webhooks/gem",
    events: [
      WebhookEvent.KycApproved,
      WebhookEvent.KycRejected,
      WebhookEvent.AlertTriggered,
      WebhookEvent.IncidentCreated,
    ],
    secret: process.env.WEBHOOK_SECRET!, // used for HMAC-SHA256 signing
    description: "Main production webhook endpoint",
  });

  console.log(\`Webhook registered: \${webhook.id}\`);
  console.log(\`Signing secret stored — keep it safe!\`);
  return webhook;
}

const hook = await registerWebhook();`}
        </pre>
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm text-slate-300 space-y-1">
          <p className="font-semibold text-white">TypeScript types reference</p>
          <p>
            <code className="text-slate-300 bg-slate-800 px-1 rounded">GemClient</code> — root client
          </p>
          <p>
            <code className="text-slate-300 bg-slate-800 px-1 rounded">Threat</code>,{" "}
            <code className="text-slate-300 bg-slate-800 px-1 rounded">Asset</code>,{" "}
            <code className="text-slate-300 bg-slate-800 px-1 rounded">Webhook</code> — core resource types
          </p>
          <p>
            <code className="text-slate-300 bg-slate-800 px-1 rounded">PagedResponse&lt;T&gt;</code> — paginated list wrapper
          </p>
          <p>
            <code className="text-slate-300 bg-slate-800 px-1 rounded">GemApiError</code> — structured error thrown on 4xx / 5xx
          </p>
        </div>
      </section>
    </main>
  );
}
