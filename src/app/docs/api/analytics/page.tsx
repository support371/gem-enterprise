import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics & Reporting API — GEM Enterprise Docs',
  description: 'Complete reference for the Analytics and Reporting API endpoints.',
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

export default function AnalyticsAPIPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-white">Analytics &amp; Reporting API</h1>
          <span className="inline-flex items-center gap-1 font-mono text-xs bg-slate-500/20 text-slate-300 px-2 py-0.5 rounded border border-white/10">
            8 endpoints
          </span>
        </div>
        <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
          Retrieve aggregated metrics, time-series trend data, and event streams for your security operations. Use these endpoints to power custom dashboards, integrate with SIEM tools, or generate executive-level reports.
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
          <EndpointRow method="GET"  path="/api/analytics/overview"          description="Dashboard summary stats" />
          <EndpointRow method="GET"  path="/api/analytics/threats/trend"     description="Threat volume over time" />
          <EndpointRow method="GET"  path="/api/analytics/threats/by-sector" description="Breakdown by sector" />
          <EndpointRow method="GET"  path="/api/analytics/assets/risk"       description="Asset risk distribution" />
          <EndpointRow method="GET"  path="/api/analytics/events"            description="Security event stream" />
          <EndpointRow method="GET"  path="/api/analytics/events/:id"        description="Single event detail" />
          <EndpointRow method="GET"  path="/api/analytics/reports"           description="List saved reports" />
          <EndpointRow method="POST" path="/api/analytics/reports"           description="Generate a new report" />
        </div>
      </div>

      {/* GET /api/analytics/overview */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="GET" />
          <code className="text-white font-mono text-base">/api/analytics/overview</code>
        </div>
        <p className="text-slate-400">Returns high-level KPIs for the authenticated organization's security posture. Values are computed over a rolling window — default is the last 30 days.</p>

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
                <td className="py-2 pr-4 font-mono text-green-300">from</td>
                <td className="py-2 pr-4 text-slate-400">ISO 8601</td>
                <td className="py-2">Start of the reporting period (default: 30 days ago)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-green-300">to</td>
                <td className="py-2 pr-4 text-slate-400">ISO 8601</td>
                <td className="py-2">End of the reporting period (default: now)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": {
    "period": {
      "from": "2026-04-03T00:00:00Z",
      "to": "2026-05-03T00:00:00Z"
    },
    "threats": {
      "total": 248,
      "critical": 18,
      "high": 67,
      "medium": 112,
      "low": 51,
      "changeFromPreviousPeriod": "+12%"
    },
    "assets": {
      "total": 134,
      "highRisk": 11,
      "mediumRisk": 43,
      "lowRisk": 80,
      "averageRiskScore": 42.3
    },
    "compliance": {
      "overallScore": 84,
      "failing": 8,
      "changeFromPreviousPeriod": "+3"
    },
    "events": {
      "total": 12840,
      "critical": 34,
      "last24h": 387
    },
    "meanTimeToDetect": "00:47:12",
    "meanTimeToRespond": "03:22:08"
  }
}`}</pre>
      </div>

      {/* GET /api/analytics/threats/trend */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="GET" />
          <code className="text-white font-mono text-base">/api/analytics/threats/trend</code>
        </div>
        <p className="text-slate-400">Returns a time-series of threat counts bucketed by the specified interval. Use this to power line charts and area graphs in your dashboard.</p>

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
                <td className="py-2 pr-4 font-mono text-green-300">from</td>
                <td className="py-2 pr-4 text-slate-400">ISO 8601</td>
                <td className="py-2">Start of the trend window (required)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-green-300">to</td>
                <td className="py-2 pr-4 text-slate-400">ISO 8601</td>
                <td className="py-2">End of the trend window (required)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-green-300">interval</td>
                <td className="py-2 pr-4 text-slate-400">enum</td>
                <td className="py-2"><code className="bg-white/10 px-1 rounded">hour</code> | <code className="bg-white/10 px-1 rounded">day</code> | <code className="bg-white/10 px-1 rounded">week</code> | <code className="bg-white/10 px-1 rounded">month</code> (default: <code className="bg-white/10 px-1 rounded">day</code>)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-green-300">severity</td>
                <td className="py-2 pr-4 text-slate-400">string</td>
                <td className="py-2">Filter series to one severity level</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": {
    "interval": "day",
    "series": [
      {
        "timestamp": "2026-04-27T00:00:00Z",
        "total": 9,
        "bySeverity": { "critical": 1, "high": 3, "medium": 4, "low": 1 }
      },
      {
        "timestamp": "2026-04-28T00:00:00Z",
        "total": 14,
        "bySeverity": { "critical": 2, "high": 5, "medium": 6, "low": 1 }
      },
      {
        "timestamp": "2026-04-29T00:00:00Z",
        "total": 7,
        "bySeverity": { "critical": 0, "high": 2, "medium": 4, "low": 1 }
      },
      {
        "timestamp": "2026-04-30T00:00:00Z",
        "total": 11,
        "bySeverity": { "critical": 1, "high": 4, "medium": 5, "low": 1 }
      },
      {
        "timestamp": "2026-05-01T00:00:00Z",
        "total": 6,
        "bySeverity": { "critical": 0, "high": 1, "medium": 4, "low": 1 }
      }
    ],
    "summary": {
      "total": 47,
      "avg": 9.4,
      "peak": { "timestamp": "2026-04-28T00:00:00Z", "count": 14 }
    }
  }
}`}</pre>
      </div>

      {/* GET /api/analytics/events */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="GET" />
          <code className="text-white font-mono text-base">/api/analytics/events</code>
        </div>
        <p className="text-slate-400">Returns a paginated stream of security events ordered by timestamp descending. Events cover threat detections, asset changes, user actions, compliance state changes, and webhook deliveries. Supports Server-Sent Events (SSE) for real-time streaming when <code className="bg-white/10 px-1 rounded font-mono text-sm">Accept: text/event-stream</code> is sent.</p>

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
                <td className="py-2">Event type filter (see type list below)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-green-300">since</td>
                <td className="py-2 pr-4 text-slate-400">ISO 8601</td>
                <td className="py-2">Only return events after this timestamp</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-green-300">assetId</td>
                <td className="py-2 pr-4 text-slate-400">string</td>
                <td className="py-2">Filter events for a specific asset</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-green-300">severity</td>
                <td className="py-2 pr-4 text-slate-400">string</td>
                <td className="py-2">Minimum event severity</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-green-300">limit</td>
                <td className="py-2 pr-4 text-slate-400">integer</td>
                <td className="py-2">Max results (default: 50, max: 500)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": [
    {
      "id": "evt_01HX9R7KPQZNBMTCDFVWEXA4G1",
      "type": "threat.detected",
      "severity": "critical",
      "title": "New critical threat detected: APT-41 Campaign",
      "timestamp": "2026-05-03T09:47:22Z",
      "actor": {
        "type": "system",
        "id": "threat-engine"
      },
      "target": {
        "type": "threat",
        "id": "thr_01HX4K2M9WQRZPNBCDFG3Y7V6E"
      },
      "metadata": {
        "severity": "critical",
        "affectedAssets": 3
      }
    },
    {
      "id": "evt_01HX9S8LQRAMBNTDEGWXFYB5H2",
      "type": "asset.risk_change",
      "severity": "high",
      "title": "Risk score increased: prod-api-gateway-01 (42 → 78)",
      "timestamp": "2026-05-03T09:12:00Z",
      "actor": {
        "type": "system",
        "id": "risk-engine"
      },
      "target": {
        "type": "asset",
        "id": "ast_01HX5P3R7MNQK9YWTJBFCZ2DV8"
      },
      "metadata": {
        "previousScore": 42,
        "newScore": 78
      }
    },
    {
      "id": "evt_01HX9T9MRSBNCOUDFHXGZC6I3",
      "type": "user.role_changed",
      "severity": "medium",
      "title": "User role changed: jane.smith analyst → admin",
      "timestamp": "2026-05-03T08:30:00Z",
      "actor": {
        "type": "user",
        "id": "usr_01HX1BKPQNR"
      },
      "target": {
        "type": "user",
        "id": "usr_01HX2AZMQPNK8YWRTJBF3CVD4E"
      },
      "metadata": {
        "previousRole": "analyst",
        "newRole": "admin"
      }
    }
  ],
  "meta": {
    "total": 12840,
    "limit": 50,
    "nextCursor": "eyJpZCI6ImV2dF8wMUhYOVQifQ=="
  }
}`}</pre>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Event Types</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {[
            'threat.detected', 'threat.updated', 'threat.acknowledged',
            'asset.registered', 'asset.risk_change', 'asset.deregistered',
            'compliance.check_failed', 'compliance.evidence_uploaded',
            'user.login', 'user.role_changed', 'user.deactivated',
            'webhook.delivery_failed',
          ].map(t => (
            <code key={t} className="font-mono text-green-300 bg-white/5 border border-white/10 px-2 py-1 rounded text-xs">{t}</code>
          ))}
        </div>
      </div>

      {/* POST /api/analytics/reports */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="POST" />
          <code className="text-white font-mono text-base">/api/analytics/reports</code>
        </div>
        <p className="text-slate-400">Triggers an async report generation job. Reports are emailed to the requester and also available via <code className="bg-white/10 px-1 rounded font-mono text-sm">GET /api/analytics/reports/:id</code> once complete.</p>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Request Body</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "title": "Weekly Threat Intelligence Summary — W18 2026",
  "type": "threat_summary",
  "format": "pdf",
  "period": {
    "from": "2026-04-28T00:00:00Z",
    "to": "2026-05-04T23:59:59Z"
  },
  "filters": {
    "severity": ["critical", "high"],
    "sectors": ["finance"]
  },
  "recipients": ["ciso@example.com", "soc-team@example.com"]
}`}</pre>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response — 202 Accepted</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": {
    "id": "rpt_01HX9ZTPQBCK7MRVDNYWXFJ4E6",
    "status": "generating",
    "title": "Weekly Threat Intelligence Summary — W18 2026",
    "estimatedCompletionAt": "2026-05-03T10:02:00Z"
  }
}`}</pre>
      </div>

      {/* Error Codes */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Error Codes</h2>
        <div className="bg-white/5 rounded-xl border border-white/10 px-4 divide-y divide-white/5 text-sm">
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">400</code><span className="text-slate-400">Invalid date range or unsupported interval</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">401</code><span className="text-slate-400">Missing or invalid Bearer token</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">403</code><span className="text-slate-400">Insufficient permissions</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">429</code><span className="text-slate-400">Rate limit exceeded — analytics endpoints are limited to 60 req/min</span></div>
        </div>
      </div>

    </div>
  )
}
