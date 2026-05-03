import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Threat Intelligence API — GEM Enterprise Docs',
  description: 'Complete reference for the Threat Intelligence API endpoints.',
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

export default function ThreatIntelligenceAPIPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-white">Threat Intelligence API</h1>
          <span className="inline-flex items-center gap-1 font-mono text-xs bg-slate-500/20 text-slate-300 px-2 py-0.5 rounded border border-white/10">
            12 endpoints
          </span>
        </div>
        <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
          Query, search, and manage threat intelligence records across your organization. Threats are enriched with MITRE ATT&CK mappings, indicator data, and sector-specific context.
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
          <EndpointRow method="GET"    path="/api/threats"                  description="List all threats" />
          <EndpointRow method="GET"    path="/api/threats/:id"              description="Get a single threat" />
          <EndpointRow method="POST"   path="/api/threats/search"           description="Advanced threat search" />
          <EndpointRow method="POST"   path="/api/threats"                  description="Create a new threat record" />
          <EndpointRow method="PATCH"  path="/api/threats/:id"              description="Update a threat record" />
          <EndpointRow method="DELETE" path="/api/threats/:id"              description="Archive a threat record" />
          <EndpointRow method="GET"    path="/api/threats/:id/indicators"   description="List IOCs for a threat" />
          <EndpointRow method="POST"   path="/api/threats/:id/indicators"   description="Add indicators to a threat" />
          <EndpointRow method="GET"    path="/api/threats/:id/assets"       description="Impacted assets for a threat" />
          <EndpointRow method="GET"    path="/api/threats/stats/summary"    description="Aggregate severity counts" />
          <EndpointRow method="GET"    path="/api/threats/feed/latest"      description="Real-time threat feed" />
          <EndpointRow method="POST"   path="/api/threats/:id/acknowledge"  description="Acknowledge a threat" />
        </div>
      </div>

      {/* GET /api/threats */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="GET" />
          <code className="text-white font-mono text-base">/api/threats</code>
        </div>
        <p className="text-slate-400">Returns a paginated list of threat intelligence records. Supports filtering by severity, sector, and time range.</p>

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
                <td className="py-2 pr-4 font-mono text-green-300">severity</td>
                <td className="py-2 pr-4 text-slate-400">string</td>
                <td className="py-2">Filter by severity: <code className="bg-white/10 px-1 rounded">critical</code>, <code className="bg-white/10 px-1 rounded">high</code>, <code className="bg-white/10 px-1 rounded">medium</code>, <code className="bg-white/10 px-1 rounded">low</code></td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-green-300">sector</td>
                <td className="py-2 pr-4 text-slate-400">string</td>
                <td className="py-2">Industry sector slug (e.g. <code className="bg-white/10 px-1 rounded">finance</code>, <code className="bg-white/10 px-1 rounded">healthcare</code>)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-green-300">since</td>
                <td className="py-2 pr-4 text-slate-400">ISO 8601</td>
                <td className="py-2">Only return threats published after this date</td>
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
      "id": "thr_01HX4K2M9WQRZPNBCDFG3Y7V6E",
      "title": "APT-41 Financial Sector Credential Harvesting Campaign",
      "severity": "critical",
      "category": "espionage",
      "sector": "finance",
      "tags": ["apt41", "credential-theft", "phishing", "T1566"],
      "indicators": {
        "ipAddresses": ["185.220.101.47", "94.102.49.193"],
        "domains": ["secure-login-portal.net", "auth-verify-now.com"],
        "fileHashes": ["e3b0c44298fc1c149afb..."],
        "count": 14
      },
      "mitre": {
        "tactics": ["Initial Access", "Credential Access"],
        "techniques": ["T1566.001", "T1110.003"]
      },
      "affectedAssetCount": 3,
      "publishedAt": "2026-04-28T11:22:00Z",
      "updatedAt": "2026-04-30T08:15:00Z"
    }
  ],
  "meta": {
    "total": 248,
    "limit": 20,
    "nextCursor": "eyJpZCI6InRocl8wMUhYNEsifQ=="
  }
}`}</pre>
      </div>

      {/* GET /api/threats/:id */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="GET" />
          <code className="text-white font-mono text-base">/api/threats/:id</code>
        </div>
        <p className="text-slate-400">Returns a full threat record including all indicators, analyst notes, and MITRE ATT&CK mapping.</p>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": {
    "id": "thr_01HX4K2M9WQRZPNBCDFG3Y7V6E",
    "title": "APT-41 Financial Sector Credential Harvesting Campaign",
    "severity": "critical",
    "category": "espionage",
    "sector": "finance",
    "summary": "A sustained spear-phishing campaign attributed to APT-41 targeting treasury and finance teams via lookalike authentication portals.",
    "description": "Full markdown content of the threat report...",
    "tags": ["apt41", "credential-theft", "phishing"],
    "tlp": "AMBER",
    "confidence": 92,
    "indicators": {
      "ipAddresses": ["185.220.101.47", "94.102.49.193"],
      "domains": ["secure-login-portal.net"],
      "urls": ["https://secure-login-portal.net/auth/sso"],
      "fileHashes": ["e3b0c44298fc1c149afb4c8996fb92427ae41e4649b934ca495991b7852b855"],
      "emails": ["noreply@auth-verify-now.com"],
      "count": 14
    },
    "mitre": {
      "tactics": ["Initial Access", "Credential Access"],
      "techniques": [
        { "id": "T1566.001", "name": "Spearphishing Attachment" },
        { "id": "T1110.003", "name": "Password Spraying" }
      ]
    },
    "analystNotes": [
      {
        "author": "analyst_jsmith",
        "content": "Confirmed overlap with HAFNIUM infrastructure.",
        "createdAt": "2026-04-29T14:00:00Z"
      }
    ],
    "affectedAssets": ["ast_01HX2A", "ast_01HX2B"],
    "publishedAt": "2026-04-28T11:22:00Z",
    "updatedAt": "2026-04-30T08:15:00Z"
  }
}`}</pre>
      </div>

      {/* POST /api/threats/search */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="POST" />
          <code className="text-white font-mono text-base">/api/threats/search</code>
        </div>
        <p className="text-slate-400">Perform an advanced full-text and structured search across all threat records. Supports boolean logic, date ranges, and MITRE technique filtering.</p>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Request Body</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "query": "credential harvesting finance",
  "filters": {
    "severity": ["critical", "high"],
    "sector": ["finance", "insurance"],
    "mitreTechniques": ["T1566", "T1110"],
    "publishedAfter": "2026-01-01T00:00:00Z",
    "publishedBefore": "2026-05-01T00:00:00Z",
    "tlp": ["AMBER", "RED"]
  },
  "sort": {
    "field": "confidence",
    "direction": "desc"
  },
  "limit": 25
}`}</pre>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": [
    {
      "id": "thr_01HX4K2M9WQRZPNBCDFG3Y7V6E",
      "title": "APT-41 Financial Sector Credential Harvesting Campaign",
      "severity": "critical",
      "category": "espionage",
      "sector": "finance",
      "confidence": 92,
      "publishedAt": "2026-04-28T11:22:00Z",
      "_score": 0.97
    }
  ],
  "meta": {
    "total": 12,
    "took": "34ms"
  }
}`}</pre>
      </div>

      {/* Threat Schema */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Threat Object Schema</h2>
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
              <tr><td className="py-2 pr-4 font-mono text-green-300">id</td><td className="py-2 pr-4 text-slate-400">string</td><td className="py-2">ULID prefixed with <code className="bg-white/10 px-1 rounded">thr_</code></td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">title</td><td className="py-2 pr-4 text-slate-400">string</td><td className="py-2">Human-readable threat title</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">severity</td><td className="py-2 pr-4 text-slate-400">enum</td><td className="py-2"><code className="bg-white/10 px-1 rounded">critical</code> | <code className="bg-white/10 px-1 rounded">high</code> | <code className="bg-white/10 px-1 rounded">medium</code> | <code className="bg-white/10 px-1 rounded">low</code></td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">category</td><td className="py-2 pr-4 text-slate-400">string</td><td className="py-2">e.g. ransomware, espionage, fraud, ddos</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">sector</td><td className="py-2 pr-4 text-slate-400">string</td><td className="py-2">Target industry sector slug</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">tlp</td><td className="py-2 pr-4 text-slate-400">enum</td><td className="py-2"><code className="bg-white/10 px-1 rounded">WHITE</code> | <code className="bg-white/10 px-1 rounded">GREEN</code> | <code className="bg-white/10 px-1 rounded">AMBER</code> | <code className="bg-white/10 px-1 rounded">RED</code></td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">confidence</td><td className="py-2 pr-4 text-slate-400">integer</td><td className="py-2">Analyst confidence score 0–100</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">indicators</td><td className="py-2 pr-4 text-slate-400">object</td><td className="py-2">IOC data: IPs, domains, hashes, URLs, emails</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">mitre</td><td className="py-2 pr-4 text-slate-400">object</td><td className="py-2">MITRE ATT&CK tactics and techniques</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">publishedAt</td><td className="py-2 pr-4 text-slate-400">ISO 8601</td><td className="py-2">When the threat was first published</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">updatedAt</td><td className="py-2 pr-4 text-slate-400">ISO 8601</td><td className="py-2">Last update timestamp</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Error Codes */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Error Codes</h2>
        <div className="bg-white/5 rounded-xl border border-white/10 px-4 divide-y divide-white/5 text-sm">
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">401</code><span className="text-slate-400">Missing or invalid Bearer token</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">403</code><span className="text-slate-400">Insufficient permissions for the requested TLP level</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">404</code><span className="text-slate-400">Threat record not found</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">429</code><span className="text-slate-400">Rate limit exceeded — see <code className="bg-white/10 px-1 rounded">Retry-After</code> header</span></div>
        </div>
      </div>

    </div>
  )
}
