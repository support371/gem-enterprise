import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Asset Management API — GEM Enterprise Docs',
  description: 'Complete reference for the Asset Management API endpoints.',
}

function MethodBadge({ method }: { method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' }) {
  const colors: Record<string, string> = {
    GET: 'bg-green-500/20 text-green-400',
    POST: 'bg-blue-500/20 text-blue-400',
    PUT: 'bg-yellow-500/20 text-yellow-400',
    PATCH: 'bg-amber-500/20 text-amber-400',
    DELETE: 'bg-red-500/20 text-red-400',
  }
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded ${colors[method]}`}>
      {method}
    </span>
  )
}

function EndpointRow({ method, path, description }: { method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; path: string; description: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <MethodBadge method={method} />
      <code className="text-slate-200 text-sm font-mono flex-1">{path}</code>
      <span className="text-slate-400 text-sm text-right hidden sm:block">{description}</span>
    </div>
  )
}

export default function AssetManagementAPIPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-white">Asset Management API</h1>
          <span className="inline-flex items-center gap-1 font-mono text-xs bg-slate-500/20 text-slate-300 px-2 py-0.5 rounded border border-white/10">
            18 endpoints
          </span>
        </div>
        <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
          Register, update, and monitor your infrastructure assets. Assets are the cornerstone of risk scoring — linking threats, vulnerabilities, and compliance controls to the real systems they affect.
        </p>
        <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-4 py-2 w-fit">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
          All endpoints require a valid Bearer token in the <code className="font-mono mx-1 text-amber-300">Authorization</code> header.
        </div>
      </div>

      {/* Base URL */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Base URL</h2>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
          https://api.gem-enterprise.io/v1
        </pre>
      </div>

      {/* Endpoint Index */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Endpoints</h2>
        <div className="bg-white/5 rounded-xl border border-white/10 px-4 divide-y divide-white/5">
          <EndpointRow method="GET"    path="/api/assets"                    description="List all assets" />
          <EndpointRow method="POST"   path="/api/assets"                    description="Register a new asset" />
          <EndpointRow method="GET"    path="/api/assets/:id"                description="Get a single asset" />
          <EndpointRow method="PATCH"  path="/api/assets/:id"                description="Update asset metadata" />
          <EndpointRow method="DELETE" path="/api/assets/:id"                description="Deregister an asset" />
          <EndpointRow method="GET"    path="/api/assets/:id/threats"        description="Threats affecting this asset" />
          <EndpointRow method="GET"    path="/api/assets/:id/vulnerabilities" description="CVEs linked to this asset" />
          <EndpointRow method="GET"    path="/api/assets/:id/risk"           description="Risk score history" />
          <EndpointRow method="POST"   path="/api/assets/:id/scan"           description="Trigger a risk scan" />
          <EndpointRow method="GET"    path="/api/assets/:id/tags"           description="List tags on asset" />
          <EndpointRow method="POST"   path="/api/assets/:id/tags"           description="Add tags to asset" />
          <EndpointRow method="DELETE" path="/api/assets/:id/tags/:tag"      description="Remove a tag from asset" />
          <EndpointRow method="GET"    path="/api/assets/groups"             description="List asset groups" />
          <EndpointRow method="POST"   path="/api/assets/groups"             description="Create an asset group" />
          <EndpointRow method="GET"    path="/api/assets/groups/:id"         description="Get a single group" />
          <EndpointRow method="PATCH"  path="/api/assets/groups/:id"         description="Update a group" />
          <EndpointRow method="DELETE" path="/api/assets/groups/:id"         description="Delete a group" />
          <EndpointRow method="GET"    path="/api/assets/stats/risk-summary" description="Risk distribution summary" />
        </div>
      </div>

      {/* GET /api/assets */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="GET" />
          <code className="text-white font-mono text-base">/api/assets</code>
        </div>
        <p className="text-slate-400">Returns a paginated list of registered assets. Filter by type, risk score, and tags.</p>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Query Parameters</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-2 pr-4 text-slate-400 font-medium">Parameter</th>
                <th className="pb-2 pr-4 text-slate-400 font-medium">Type</th>
                <th className="pb-2 text-slate-400 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 divide-y divide-white/5">
              <tr>
                <td className="py-2 pr-4 font-mono text-green-300">type</td>
                <td className="py-2 pr-4 text-slate-400">string</td>
                <td className="py-2">Filter by asset type: <code className="bg-white/10 px-1 rounded">server</code>, <code className="bg-white/10 px-1 rounded">endpoint</code>, <code className="bg-white/10 px-1 rounded">service</code>, <code className="bg-white/10 px-1 rounded">database</code>, <code className="bg-white/10 px-1 rounded">network</code></td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-green-300">riskMin</td>
                <td className="py-2 pr-4 text-slate-400">number</td>
                <td className="py-2">Minimum risk score (0–100)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-green-300">riskMax</td>
                <td className="py-2 pr-4 text-slate-400">number</td>
                <td className="py-2">Maximum risk score (0–100)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-green-300">tags</td>
                <td className="py-2 pr-4 text-slate-400">string[]</td>
                <td className="py-2">Comma-separated list of tags to filter by</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-green-300">group</td>
                <td className="py-2 pr-4 text-slate-400">string</td>
                <td className="py-2">Filter by group ID</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-green-300">limit</td>
                <td className="py-2 pr-4 text-slate-400">integer</td>
                <td className="py-2">Max results per page (default: 20, max: 100)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-green-300">cursor</td>
                <td className="py-2 pr-4 text-slate-400">string</td>
                <td className="py-2">Pagination cursor from previous response</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": [
    {
      "id": "ast_01HX5P3R7MNQK9YWTJBFCZ2DV8",
      "name": "prod-api-gateway-01",
      "type": "server",
      "ipAddress": "10.0.1.24",
      "hostname": "prod-api-gateway-01.internal",
      "os": "Ubuntu 22.04 LTS",
      "tags": ["production", "internet-facing", "critical-infra"],
      "riskScore": 78,
      "groupId": "grp_01HX3M",
      "threatCount": 4,
      "vulnerabilityCount": 12,
      "createdAt": "2025-11-03T09:00:00Z",
      "updatedAt": "2026-04-29T16:44:00Z"
    }
  ],
  "meta": {
    "total": 134,
    "limit": 20,
    "nextCursor": "eyJpZCI6ImFzdF8wMUhYNVAifQ=="
  }
}`}</pre>
      </div>

      {/* POST /api/assets */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="POST" />
          <code className="text-white font-mono text-base">/api/assets</code>
        </div>
        <p className="text-slate-400">Register a new asset in your inventory. The asset will be queued for an initial risk scan automatically.</p>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Request Body</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "name": "prod-db-primary-01",
  "type": "database",
  "ipAddress": "10.0.2.15",
  "hostname": "prod-db-primary-01.internal",
  "os": "Amazon Linux 2023",
  "description": "Primary PostgreSQL cluster for transactional data",
  "tags": ["production", "pii", "database"],
  "groupId": "grp_01HX3M",
  "metadata": {
    "region": "us-east-1",
    "owner": "platform-team",
    "costCenter": "CC-1042"
  }
}`}</pre>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response — 201 Created</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": {
    "id": "ast_01HX9T4VQRMZW2BCPFKGN8EYDJ",
    "name": "prod-db-primary-01",
    "type": "database",
    "ipAddress": "10.0.2.15",
    "hostname": "prod-db-primary-01.internal",
    "os": "Amazon Linux 2023",
    "tags": ["production", "pii", "database"],
    "riskScore": null,
    "scanStatus": "queued",
    "createdAt": "2026-05-03T10:00:00Z",
    "updatedAt": "2026-05-03T10:00:00Z"
  }
}`}</pre>
      </div>

      {/* GET /api/assets/:id/threats */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="GET" />
          <code className="text-white font-mono text-base">/api/assets/:id/threats</code>
        </div>
        <p className="text-slate-400">Returns all threat records that have been linked to this asset, ordered by severity descending.</p>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": [
    {
      "id": "thr_01HX4K2M9WQRZPNBCDFG3Y7V6E",
      "title": "APT-41 Financial Sector Credential Harvesting Campaign",
      "severity": "critical",
      "category": "espionage",
      "publishedAt": "2026-04-28T11:22:00Z",
      "linkedAt": "2026-04-29T08:00:00Z",
      "linkReason": "indicator_match"
    },
    {
      "id": "thr_01HX3BNZ7CQDYP6EMFHWRK4T2A",
      "title": "Log4Shell Exploitation Attempts in Financial Sector",
      "severity": "high",
      "category": "vulnerability-exploit",
      "publishedAt": "2026-03-12T14:00:00Z",
      "linkedAt": "2026-03-13T00:05:00Z",
      "linkReason": "cve_match"
    }
  ],
  "meta": {
    "total": 4
  }
}`}</pre>
      </div>

      {/* PATCH /api/assets/:id */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="PATCH" />
          <code className="text-white font-mono text-base">/api/assets/:id</code>
        </div>
        <p className="text-slate-400">Update mutable fields on an asset. Only the fields included in the request body are changed (partial update semantics).</p>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Request Body</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "tags": ["production", "pii", "database", "tier-1"],
  "description": "Primary PostgreSQL cluster — migrated to RDS in Q1 2026",
  "metadata": {
    "owner": "data-platform-team"
  }
}`}</pre>
      </div>

      {/* DELETE /api/assets/:id */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="DELETE" />
          <code className="text-white font-mono text-base">/api/assets/:id</code>
        </div>
        <p className="text-slate-400">Soft-deregisters the asset. The record is retained for audit and compliance purposes but removed from active risk calculations. Pass <code className="bg-white/10 px-1 rounded font-mono text-sm">?hard=true</code> to permanently delete (requires <code className="bg-white/10 px-1 rounded font-mono text-sm">admin</code> role).</p>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response — 204 No Content</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`// No response body`}</pre>
      </div>

      {/* Asset Schema */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Asset Object Schema</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-2 pr-4 text-slate-400 font-medium">Field</th>
                <th className="pb-2 pr-4 text-slate-400 font-medium">Type</th>
                <th className="pb-2 text-slate-400 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 divide-y divide-white/5">
              <tr><td className="py-2 pr-4 font-mono text-green-300">id</td><td className="py-2 pr-4 text-slate-400">string</td><td className="py-2">ULID prefixed with <code className="bg-white/10 px-1 rounded">ast_</code></td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">name</td><td className="py-2 pr-4 text-slate-400">string</td><td className="py-2">Display name for the asset</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">type</td><td className="py-2 pr-4 text-slate-400">enum</td><td className="py-2"><code className="bg-white/10 px-1 rounded">server</code> | <code className="bg-white/10 px-1 rounded">endpoint</code> | <code className="bg-white/10 px-1 rounded">service</code> | <code className="bg-white/10 px-1 rounded">database</code> | <code className="bg-white/10 px-1 rounded">network</code> | <code className="bg-white/10 px-1 rounded">cloud</code></td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">ipAddress</td><td className="py-2 pr-4 text-slate-400">string</td><td className="py-2">Primary IPv4 or IPv6 address</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">hostname</td><td className="py-2 pr-4 text-slate-400">string</td><td className="py-2">FQDN of the asset</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">os</td><td className="py-2 pr-4 text-slate-400">string</td><td className="py-2">Operating system and version string</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">tags</td><td className="py-2 pr-4 text-slate-400">string[]</td><td className="py-2">Free-form labels for grouping and filtering</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">riskScore</td><td className="py-2 pr-4 text-slate-400">number | null</td><td className="py-2">Computed risk score 0–100; null if not yet scanned</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">groupId</td><td className="py-2 pr-4 text-slate-400">string | null</td><td className="py-2">Asset group this asset belongs to</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">metadata</td><td className="py-2 pr-4 text-slate-400">object</td><td className="py-2">Arbitrary key-value pairs for custom data</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">createdAt</td><td className="py-2 pr-4 text-slate-400">ISO 8601</td><td className="py-2">Registration timestamp</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">updatedAt</td><td className="py-2 pr-4 text-slate-400">ISO 8601</td><td className="py-2">Last update timestamp</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Error Codes */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Error Codes</h2>
        <div className="bg-white/5 rounded-xl border border-white/10 px-4 divide-y divide-white/5 text-sm">
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">400</code><span className="text-slate-400">Invalid request body — check required fields and type constraints</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">401</code><span className="text-slate-400">Missing or invalid Bearer token</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">403</code><span className="text-slate-400">Insufficient role to perform this action</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">404</code><span className="text-slate-400">Asset not found</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">409</code><span className="text-slate-400">Asset with this IP address or hostname already exists</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">429</code><span className="text-slate-400">Rate limit exceeded — see <code className="bg-white/10 px-1 rounded">Retry-After</code> header</span></div>
        </div>
      </div>

    </div>
  )
}
