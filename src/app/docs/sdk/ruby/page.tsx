import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ruby SDK — Gem Enterprise Docs",
  description:
    "Install and use the Gem Enterprise Ruby SDK v1.5.2 with idiomatic Ruby including block-style webhook registration.",
};

export default function RubySDKPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">Ruby SDK</h1>
          <span className="text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
            v1.5.2
          </span>
        </div>
        <p className="text-slate-400 text-base leading-relaxed">
          The official Ruby gem for Gem Enterprise. Requires Ruby 3.1+. Follows
          idiomatic Ruby conventions including block-based configuration and
          chainable query builders.
        </p>
      </div>

      {/* Installation */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Installation
        </h2>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
          gem install gem-enterprise
        </pre>
        <p className="text-slate-400 text-sm">Or add to your Gemfile:</p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`# Gemfile
gem "gem-enterprise", "~> 1.5"

# Then run:
bundle install`}
        </pre>
      </section>

      {/* Initialization */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Initialization
        </h2>
        <p className="text-slate-400 text-sm">
          Instantiate{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">GemEnterprise::Client</code>{" "}
          using a block for clean configuration. The client is thread-safe and
          can be shared across fibers.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`require "gem_enterprise"

client = GemEnterprise::Client.new do |config|
  config.api_key    = ENV["GEM_API_KEY"]
  config.base_url   = "https://api.gem-enterprise.com/v2" # optional
  config.timeout    = 30    # seconds
  config.max_retries = 3
  config.logger     = Rails.logger # optional — any Logger-compatible object
end`}
        </pre>
        <p className="text-slate-400 text-sm">
          Or configure globally (useful in a Rails initializer):
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`# config/initializers/gem_enterprise.rb
GemEnterprise.configure do |config|
  config.api_key = ENV["GEM_API_KEY"]
end

# Then use the default client anywhere:
client = GemEnterprise.client`}
        </pre>
      </section>

      {/* Example 1: threats.list */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Example 1 — List Threats
        </h2>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`require "gem_enterprise"

client = GemEnterprise::Client.new { |c| c.api_key = ENV["GEM_API_KEY"] }

result = client.threats.list(
  severity: %w[critical high],
  status: "open",
  limit: 50,
  page: 1
)

puts "Total threats: #{result.total}"
result.data.each do |threat|
  puts "[#{threat.severity}] #{threat.title}"
end

# Auto-paginating enumerator
client.threats.list_each(severity: ["critical"]) do |threat|
  puts threat.title
end`}
        </pre>
      </section>

      {/* Example 2: assets.create */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Example 2 — Create an Asset
        </h2>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`require "gem_enterprise"

client = GemEnterprise::Client.new { |c| c.api_key = ENV["GEM_API_KEY"] }

asset = client.assets.create(
  name: "Order Processing Service",
  type: :service,
  metadata: {
    environment: "production",
    region: "eu-central-1",
    owner: "payments-team"
  },
  tags: %w[critical pci],
  risk_score: 88
)

puts "Asset created: #{asset.id}"
puts "Risk score:    #{asset.risk_score}"`}
        </pre>
      </section>

      {/* Example 3: block-style webhook */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Example 3 — Block-style Webhook Registration
        </h2>
        <p className="text-slate-400 text-sm">
          Register webhooks with a configuration block. Subscribe to multiple
          event types in a single call.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`require "gem_enterprise"

client = GemEnterprise::Client.new { |c| c.api_key = ENV["GEM_API_KEY"] }

webhook = client.webhooks.register do |wh|
  wh.url         = "https://your-app.example.com/hooks/gem"
  wh.secret      = ENV["WEBHOOK_SECRET"]
  wh.description = "Rails production webhook"
  wh.events      = %w[
    kyc.approved
    kyc.rejected
    alert.triggered
    incident.created
    portfolio.updated
  ]
end

puts "Webhook id:  #{webhook.id}"
puts "Signing key: (stored — never logged)"

# Verify an incoming webhook payload in a controller:
def handle_webhook
  payload   = request.body.read
  signature = request.headers["X-Gem-Signature"]

  event = client.webhooks.verify_and_parse(
    payload:   payload,
    signature: signature,
    secret:    ENV["WEBHOOK_SECRET"]
  )

  case event.type
  when "kyc.approved"  then handle_kyc_approved(event)
  when "alert.triggered" then handle_alert(event)
  end

  head :ok
end`}
        </pre>
      </section>
    </main>
  );
}
