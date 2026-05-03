import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Java SDK — Gem Enterprise Docs",
  description:
    "Install and use the Gem Enterprise Java SDK v2.1.0 with builder pattern initialization and CompletableFuture async support.",
};

export default function JavaSDKPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">Java SDK</h1>
          <span className="text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
            v2.1.0
          </span>
        </div>
        <p className="text-slate-400 text-base leading-relaxed">
          The official Java SDK for Gem Enterprise. Requires Java 17+. Supports
          both synchronous and asynchronous execution via{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">CompletableFuture</code>.
        </p>
      </div>

      {/* Installation */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Installation
        </h2>
        <p className="text-slate-400 text-sm font-medium text-slate-300">Maven</p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`<dependency>
  <groupId>com.gem-enterprise</groupId>
  <artifactId>gem-sdk</artifactId>
  <version>2.1.0</version>
</dependency>`}
        </pre>
        <p className="text-slate-400 text-sm font-medium text-slate-300">Gradle (Kotlin DSL)</p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`implementation("com.gem-enterprise:gem-sdk:2.1.0")`}
        </pre>
        <p className="text-slate-400 text-sm font-medium text-slate-300">Gradle (Groovy DSL)</p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`implementation 'com.gem-enterprise:gem-sdk:2.1.0'`}
        </pre>
      </section>

      {/* Initialization */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Initialization
        </h2>
        <p className="text-slate-400 text-sm">
          Use{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">GemClient.builder()</code> to
          construct a configured client. The builder is fluent and validates
          required fields at build time.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`import com.gementerprise.GemClient;

public class App {
    private static final GemClient client = GemClient.builder()
        .apiKey(System.getenv("GEM_API_KEY"))
        .baseUrl("https://api.gem-enterprise.com/v2") // optional
        .timeout(30_000)                              // milliseconds
        .maxRetries(3)
        .build();
}`}
        </pre>
      </section>

      {/* Example 1: threats().list().execute() */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Example 1 — List Threats (Synchronous)
        </h2>
        <p className="text-slate-400 text-sm">
          Build a request with the fluent query builder, then call{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">.execute()</code> to block
          until the response arrives.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`import com.gementerprise.GemClient;
import com.gementerprise.model.Threat;
import com.gementerprise.model.PagedResponse;
import com.gementerprise.model.ThreatSeverity;

PagedResponse<Threat> result = client.threats()
    .list()
    .severity(ThreatSeverity.CRITICAL, ThreatSeverity.HIGH)
    .status("open")
    .limit(50)
    .page(1)
    .execute();

System.out.printf("Total threats: %d%n", result.getTotal());
for (Threat threat : result.getData()) {
    System.out.printf("[%s] %s%n",
        threat.getSeverity(),
        threat.getTitle());
}`}
        </pre>
      </section>

      {/* Example 2: assets().create() */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Example 2 — Create an Asset
        </h2>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`import com.gementerprise.model.Asset;
import com.gementerprise.model.AssetType;
import java.util.Map;
import java.util.List;

Asset asset = client.assets()
    .create()
    .name("Payments Microservice")
    .type(AssetType.SERVICE)
    .metadata(Map.of(
        "environment", "production",
        "region",      "us-east-1"
    ))
    .tags(List.of("pci", "critical"))
    .riskScore(91)
    .execute();

System.out.printf("Created asset: %s%n", asset.getId());`}
        </pre>
      </section>

      {/* Example 3: CompletableFuture async */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Example 3 — Async with CompletableFuture
        </h2>
        <p className="text-slate-400 text-sm">
          Replace{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">.execute()</code> with{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">.executeAsync()</code> to get a{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">CompletableFuture</code> and
          avoid blocking the calling thread.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`import com.gementerprise.model.Threat;
import com.gementerprise.model.PagedResponse;
import java.util.concurrent.CompletableFuture;

CompletableFuture<PagedResponse<Threat>> future = client.threats()
    .list()
    .severity("critical")
    .executeAsync();

// Non-blocking continuation
future
    .thenApply(result -> {
        System.out.printf("Found %d threats%n", result.getTotal());
        return result.getData();
    })
    .thenAccept(threats ->
        threats.forEach(t ->
            System.out.printf("[%s] %s%n", t.getSeverity(), t.getTitle())
        )
    )
    .exceptionally(ex -> {
        System.err.println("Request failed: " + ex.getMessage());
        return null;
    });

// Or join if you need to block in a test:
PagedResponse<Threat> result = future.join();`}
        </pre>
      </section>
    </main>
  );
}
