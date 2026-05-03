import type { Metadata } from "next";

export const metadata: Metadata = {
  title: ".NET / C# SDK — Gem Enterprise Docs",
  description:
    "Install and use the Gem Enterprise .NET / C# SDK v1.9.0 with async/await and LINQ filtering examples.",
};

export default function DotNetSDKPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">.NET / C# SDK</h1>
          <span className="text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
            v1.9.0
          </span>
        </div>
        <p className="text-slate-400 text-base leading-relaxed">
          The official .NET SDK for Gem Enterprise. Targets .NET 8+ and .NET
          Standard 2.1. Ships with first-class async / await support and LINQ-
          friendly response types.
        </p>
      </div>

      {/* Installation */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Installation
        </h2>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
          dotnet add package GemEnterprise.SDK
        </pre>
        <p className="text-slate-400 text-sm">Or via the NuGet Package Manager:</p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
          Install-Package GemEnterprise.SDK -Version 1.9.0
        </pre>
        <p className="text-slate-400 text-sm">Package reference in your .csproj:</p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`<PackageReference Include="GemEnterprise.SDK" Version="1.9.0" />`}
        </pre>
      </section>

      {/* Initialization */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Initialization
        </h2>
        <p className="text-slate-400 text-sm">
          Construct{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">GemClient</code> with an
          API key. Register it as a singleton in the DI container for ASP.NET
          Core applications.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`using GemEnterprise.SDK;

// Direct instantiation
var client = new GemClient(
    apiKey:  Environment.GetEnvironmentVariable("GEM_API_KEY")!,
    options: new GemClientOptions
    {
        BaseUrl    = "https://api.gem-enterprise.com/v2", // optional
        TimeoutMs  = 30_000,
        MaxRetries = 3,
    }
);

// ASP.NET Core DI (Program.cs)
builder.Services.AddSingleton<IGemClient>(sp =>
    new GemClient(
        apiKey: builder.Configuration["Gem:ApiKey"]!
    )
);`}
        </pre>
      </section>

      {/* Example 1: ListAsync */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Example 1 — List Threats Async
        </h2>
        <p className="text-slate-400 text-sm">
          All resource methods have both synchronous and{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">Async</code> variants.
          Always prefer the async overloads in web applications.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`using GemEnterprise.SDK;
using GemEnterprise.SDK.Models;

var client = new GemClient(Environment.GetEnvironmentVariable("GEM_API_KEY")!);

PagedResponse<Threat> result = await client.Threats.ListAsync(
    new ThreatListOptions
    {
        Severity = new[] { ThreatSeverity.Critical, ThreatSeverity.High },
        Status   = "open",
        Limit    = 50,
        Page     = 1,
    },
    cancellationToken: CancellationToken.None
);

Console.WriteLine($"Total: {result.Total}");
foreach (var threat in result.Data)
{
    Console.WriteLine($"[{threat.Severity}] {threat.Title}");
}`}
        </pre>
      </section>

      {/* Example 2: assets create */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Example 2 — Create an Asset
        </h2>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`using GemEnterprise.SDK.Models;

Asset asset = await client.Assets.CreateAsync(new CreateAssetRequest
{
    Name      = "Auth Service",
    Type      = AssetType.Service,
    Metadata  = new Dictionary<string, string>
    {
        ["environment"] = "production",
        ["region"]      = "westeurope",
        ["owner"]       = "identity-team",
    },
    Tags      = new[] { "critical", "public-facing" },
    RiskScore = 87,
});

Console.WriteLine($"Asset created: {asset.Id}");`}
        </pre>
      </section>

      {/* Example 3: LINQ filtering */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Example 3 — LINQ Filtering
        </h2>
        <p className="text-slate-400 text-sm">
          The{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">PagedResponse&lt;T&gt;.Data</code>{" "}
          property is an{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">IReadOnlyList&lt;T&gt;</code>,
          so standard LINQ operators work directly on it. Use{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">ListAllAsync()</code> when
          you need to page through the full result set before filtering.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`using GemEnterprise.SDK.Models;
using System.Linq;

// Fetch all threats (auto-paginates)
IAsyncEnumerable<Threat> allThreats = client.Threats.ListAllAsync(
    new ThreatListOptions { Status = "open" }
);

// Filter and project with LINQ to Objects on each page
var result = await client.Threats.ListAsync(
    new ThreatListOptions { Limit = 100, Page = 1 }
);

var criticalProductionThreats = result.Data
    .Where(t  => t.Severity == ThreatSeverity.Critical)
    .Where(t  => t.Tags.Contains("production"))
    .OrderByDescending(t => t.RiskScore)
    .Select(t => new { t.Id, t.Title, t.RiskScore })
    .ToList();

Console.WriteLine($"High-priority production threats: {criticalProductionThreats.Count}");
foreach (var t in criticalProductionThreats)
{
    Console.WriteLine($"  [{t.RiskScore}] {t.Title} (id: {t.Id})");
}`}
        </pre>
      </section>
    </main>
  );
}
