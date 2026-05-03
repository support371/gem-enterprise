import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Go SDK — Gem Enterprise Docs",
  description:
    "Install and use the Gem Enterprise Go SDK v1.8.0 to manage threats and assets with idiomatic Go patterns.",
};

export default function GoSDKPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">Go SDK</h1>
          <span className="text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
            v1.8.0
          </span>
        </div>
        <p className="text-slate-400 text-base leading-relaxed">
          The official Go module for Gem Enterprise. Requires Go 1.21+.
          Designed for idiomatic Go with context propagation, structured error
          types, and zero external dependencies outside the standard library.
        </p>
      </div>

      {/* Installation */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Installation
        </h2>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
          go get github.com/gem-enterprise/gem-go
        </pre>
        <p className="text-slate-400 text-sm">
          Import the package in your Go source:
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`import (
    gem "github.com/gem-enterprise/gem-go"
    "github.com/gem-enterprise/gem-go/threats"
    "github.com/gem-enterprise/gem-go/assets"
)`}
        </pre>
      </section>

      {/* Initialization */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Initialization
        </h2>
        <p className="text-slate-400 text-sm">
          Create a client with functional options. The client is safe for
          concurrent use.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`package main

import (
    "log"
    "os"

    gem "github.com/gem-enterprise/gem-go"
)

func main() {
    client, err := gem.NewClient(
        gem.WithAPIKey(os.Getenv("GEM_API_KEY")),
        gem.WithBaseURL("https://api.gem-enterprise.com/v2"), // optional
        gem.WithTimeout(30),                                  // seconds
        gem.WithMaxRetries(3),
    )
    if err != nil {
        log.Fatalf("failed to init gem client: %v", err)
    }
    _ = client
}`}
        </pre>
      </section>

      {/* Example 1: threats.List */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Example 1 — List Threats
        </h2>
        <p className="text-slate-400 text-sm">
          All API calls accept a{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">context.Context</code> as
          the first argument for deadline and cancellation propagation.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`package main

import (
    "context"
    "fmt"
    "log"
    "os"
    "time"

    gem "github.com/gem-enterprise/gem-go"
    "github.com/gem-enterprise/gem-go/threats"
)

func main() {
    client, _ := gem.NewClient(gem.WithAPIKey(os.Getenv("GEM_API_KEY")))

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    result, err := client.Threats.List(ctx, &threats.ListParams{
        Severity: []string{"critical", "high"},
        Status:   "open",
        Limit:    50,
        Page:     1,
    })
    if err != nil {
        log.Fatalf("threats.List: %v", err)
    }

    fmt.Printf("Total: %d\\n", result.Total)
    for _, t := range result.Data {
        fmt.Printf("[%s] %s\\n", t.Severity, t.Title)
    }
}`}
        </pre>
      </section>

      {/* Example 2: error handling */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Example 2 — Structured Error Handling
        </h2>
        <p className="text-slate-400 text-sm">
          Use{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">errors.As</code> to
          inspect API errors and branch on HTTP status code or application error
          code.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`package main

import (
    "context"
    "errors"
    "fmt"
    "log"
    "os"

    gem "github.com/gem-enterprise/gem-go"
    gomerr "github.com/gem-enterprise/gem-go/errors"
)

func getAsset(id string) error {
    client, _ := gem.NewClient(gem.WithAPIKey(os.Getenv("GEM_API_KEY")))

    asset, err := client.Assets.Get(context.Background(), id)
    if err != nil {
        var apiErr *gomerr.APIError
        if errors.As(err, &apiErr) {
            switch apiErr.StatusCode {
            case 404:
                return fmt.Errorf("asset %q not found", id)
            case 401:
                return fmt.Errorf("invalid API key")
            case 429:
                return fmt.Errorf("rate limited — retry after %ds", apiErr.RetryAfter)
            default:
                return fmt.Errorf("API error %d: %s (code=%s)",
                    apiErr.StatusCode, apiErr.Message, apiErr.Code)
            }
        }
        return fmt.Errorf("unexpected error: %w", err)
    }

    log.Printf("Asset: %s (%s)\\n", asset.Name, asset.ID)
    return nil
}`}
        </pre>
      </section>

      {/* Example 3: assets create */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Example 3 — Create an Asset
        </h2>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`package main

import (
    "context"
    "fmt"
    "os"

    gem "github.com/gem-enterprise/gem-go"
    "github.com/gem-enterprise/gem-go/assets"
)

func main() {
    client, _ := gem.NewClient(gem.WithAPIKey(os.Getenv("GEM_API_KEY")))

    asset, err := client.Assets.Create(context.Background(), &assets.CreateParams{
        Name: "Payment Service",
        Type: assets.TypeService,
        Metadata: map[string]string{
            "environment": "production",
            "region":      "us-east-1",
        },
        Tags:      []string{"pci", "critical"},
        RiskScore: 92,
    })
    if err != nil {
        panic(err)
    }

    fmt.Printf("Created asset: id=%s name=%s\\n", asset.ID, asset.Name)
}`}
        </pre>
      </section>
    </main>
  );
}
