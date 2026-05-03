import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Python SDK — Gem Enterprise Docs",
  description:
    "Install and use the Gem Enterprise Python SDK v2.3.1 to manage threats, assets, and event callbacks.",
};

export default function PythonSDKPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">Python SDK</h1>
          <span className="text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
            v2.3.1
          </span>
        </div>
        <p className="text-slate-400 text-base leading-relaxed">
          The official Python SDK for Gem Enterprise. Requires Python 3.9+.
          Supports both synchronous and async (asyncio) usage patterns.
        </p>
      </div>

      {/* Installation */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Installation
        </h2>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
          pip install gem-enterprise
        </pre>
        <p className="text-slate-400 text-sm">
          To include optional async support:
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
          pip install "gem-enterprise[async]"
        </pre>
      </section>

      {/* Initialization */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Initialization
        </h2>
        <p className="text-slate-400 text-sm">
          Instantiate{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">GemClient</code>{" "}
          with your API key. Use environment variables to avoid committing
          secrets.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`import os
from gem_enterprise import GemClient

gem = GemClient(
    api_key=os.environ["GEM_API_KEY"],
    # Optional keyword arguments:
    base_url="https://api.gem-enterprise.com/v2",
    timeout=30,       # seconds
    max_retries=3,
)`}
        </pre>
      </section>

      {/* Example 1: threats.list */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Example 1 — List Threats by Severity
        </h2>
        <p className="text-slate-400 text-sm">
          Pass a list of severity strings to filter results. The method returns
          a{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">PagedResult</code>{" "}
          object with{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">.data</code>,{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">.total</code>, and{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">.page</code> attributes.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`from gem_enterprise import GemClient

gem = GemClient(api_key=os.environ["GEM_API_KEY"])

result = gem.threats.list(
    severity=["critical", "high"],
    status="open",
    limit=50,
    page=1,
)

print(f"Found {result.total} threats")
for threat in result.data:
    print(f"[{threat.severity}] {threat.title}  id={threat.id}")`}
        </pre>
        <p className="text-slate-400 text-sm">
          Auto-pagination helper — iterates all pages transparently:
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`for threat in gem.threats.list_all(severity=["critical"]):
    print(threat.title)`}
        </pre>
      </section>

      {/* Example 2: assets.create */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Example 2 — Create an Asset
        </h2>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`from gem_enterprise import GemClient

gem = GemClient(api_key=os.environ["GEM_API_KEY"])

asset = gem.assets.create(
    name="Production Database Cluster",
    type="database",
    metadata={
        "environment": "production",
        "region": "eu-west-1",
        "engine": "postgres",
        "version": "15.2",
    },
    tags=["pii", "critical"],
    risk_score=90,
)

print(f"Asset created: {asset.id}")
print(f"Risk score: {asset.risk_score}")`}
        </pre>
      </section>

      {/* Example 3: event callbacks */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Example 3 — Event Callbacks
        </h2>
        <p className="text-slate-400 text-sm">
          Use the{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">@gem.on()</code>{" "}
          decorator to register handler functions for specific event types.
          Handlers are invoked when incoming webhook payloads are processed
          through the built-in webhook router.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`from gem_enterprise import GemClient
from gem_enterprise.events import KycApprovedEvent, KycRejectedEvent

gem = GemClient(api_key=os.environ["GEM_API_KEY"])

@gem.on("kyc.approved")
def handle_kyc_approved(event: KycApprovedEvent) -> None:
    user_id = event.data["user_id"]
    print(f"KYC approved for user {user_id}")
    # Trigger downstream onboarding workflow...

@gem.on("kyc.rejected")
def handle_kyc_rejected(event: KycRejectedEvent) -> None:
    user_id = event.data["user_id"]
    reason = event.data.get("rejection_reason", "unknown")
    print(f"KYC rejected for user {user_id}: {reason}")

# Async variant — works the same way
@gem.on("alert.triggered")
async def handle_alert(event) -> None:
    await notify_on_call_team(event.data)

# Process a raw webhook payload (e.g. from your web framework)
gem.process_webhook(
    payload=request.body,
    signature=request.headers["X-Gem-Signature"],
)`}
        </pre>
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm text-slate-300 space-y-1">
          <p className="font-semibold text-white">Key classes</p>
          <p>
            <code className="text-slate-300 bg-slate-800 px-1 rounded">gem_enterprise.GemClient</code> — root client
          </p>
          <p>
            <code className="text-slate-300 bg-slate-800 px-1 rounded">gem_enterprise.models.Threat</code>,{" "}
            <code className="text-slate-300 bg-slate-800 px-1 rounded">Asset</code>,{" "}
            <code className="text-slate-300 bg-slate-800 px-1 rounded">Webhook</code>
          </p>
          <p>
            <code className="text-slate-300 bg-slate-800 px-1 rounded">gem_enterprise.exceptions.GemApiError</code> — raised on 4xx / 5xx
          </p>
          <p>
            <code className="text-slate-300 bg-slate-800 px-1 rounded">gem_enterprise.async_client.AsyncGemClient</code> — full async variant
          </p>
        </div>
      </section>
    </main>
  );
}
