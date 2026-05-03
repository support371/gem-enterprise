import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compliance API — GEM Enterprise Docs',
  description: 'Complete reference for the Compliance API endpoints including KYC/AML checks and SOC 2 evidence collection.',
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

export default function ComplianceAPIPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-white">Compliance API</h1>
          <span className="inline-flex items-center gap-1 font-mono text-xs bg-slate-500/20 text-slate-300 px-2 py-0.5 rounded border border-white/10">
            9 endpoints
          </span>
        </div>
        <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
          Automate compliance workflows including KYC/AML screening, SOC 2 evidence collection, regulatory check scheduling, and audit-ready report generation. All compliance operations are immutably logged.
        </p>
        <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-4 py-2 w-fit">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
          All endpoints require a valid Bearer token in the <code className="font-mono mx-1 text-amber-300">Authorization</code> header. Evidence upload requires <code className="font-mono text-amber-300">analyst</code> role or higher.
        </div>
      </div>

      {/* Base URL */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Base URL</h2>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
          https://api.gem-enterprise.io/v1
        </pre>
      </div>

      {/* Supported Frameworks */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Supported Frameworks</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {['SOC 2 Type II', 'ISO 27001', 'PCI DSS 4.0', 'GDPR', 'KYC / AML', 'NIST CSF 2.0'].map(fw => (
            <div key={fw} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 font-medium">{fw}</div>
          ))}
        </div>
      </div>

      {/* Endpoint Index */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Endpoints</h2>
        <div className="bg-white/5 rounded-xl border border-white/10 px-4 divide-y divide-white/5">
          <EndpointRow method="GET"  path="/api/compliance/status"           description="Overall compliance posture" />
          <EndpointRow method="GET"  path="/api/compliance/checks"           description="List all compliance checks" />
          <EndpointRow method="GET"  path="/api/compliance/checks/:id"       description="Get a single check" />
          <EndpointRow method="POST" path="/api/compliance/checks/:id/run"   description="Re-run a specific check" />
          <EndpointRow method="POST" path="/api/compliance/evidence"         description="Upload evidence artifact" />
          <EndpointRow method="GET"  path="/api/compliance/evidence"         description="List uploaded evidence" />
          <EndpointRow method="GET"  path="/api/compliance/reports"          description="List compliance reports" />
          <EndpointRow method="POST" path="/api/compliance/reports"          description="Generate a new report" />
          <EndpointRow method="GET"  path="/api/compliance/reports/:id"      description="Download a report" />
        </div>
      </div>

      {/* GET /api/compliance/status */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="GET" />
          <code className="text-white font-mono text-base">/api/compliance/status</code>
        </div>
        <p className="text-slate-400">Returns a high-level compliance posture summary including pass/fail counts per framework and the timestamp of the last evaluation run.</p>

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
                <td className="py-2 pr-4 font-mono text-green-300">framework</td>
                <td className="py-2 pr-4 text-slate-400">string</td>
                <td className="py-2">Filter by framework slug: <code className="bg-white/10 px-1 rounded">soc2</code>, <code className="bg-white/10 px-1 rounded">iso27001</code>, <code className="bg-white/10 px-1 rounded">pci-dss</code>, <code className="bg-white/10 px-1 rounded">kyc-aml</code></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": {
    "overallStatus": "partial",
    "score": 84,
    "lastEvaluatedAt": "2026-05-03T06:00:00Z",
    "frameworks": [
      {
        "id": "soc2",
        "name": "SOC 2 Type II",
        "status": "passing",
        "score": 96,
        "checks": { "total": 48, "passing": 46, "failing": 1, "notApplicable": 1 },
        "lastAuditDate": "2025-10-01",
        "nextAuditDate": "2026-10-01"
      },
      {
        "id": "kyc-aml",
        "name": "KYC / AML",
        "status": "partial",
        "score": 72,
        "checks": { "total": 24, "passing": 17, "failing": 7, "notApplicable": 0 },
        "lastAuditDate": "2026-03-15",
        "nextAuditDate": "2026-09-15"
      }
    ]
  }
}`}</pre>
      </div>

      {/* GET /api/compliance/checks */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="GET" />
          <code className="text-white font-mono text-base">/api/compliance/checks</code>
        </div>
        <p className="text-slate-400">Returns a list of all compliance checks across all frameworks, with their current pass/fail status, owning control, and any linked evidence.</p>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": [
    {
      "id": "chk_01HX7R4NPBCQKF5VWZYMJ6DTE8",
      "framework": "soc2",
      "controlId": "CC6.1",
      "title": "Logical and Physical Access Controls",
      "description": "Verify that MFA is enforced for all user accounts with administrative privileges.",
      "status": "passing",
      "category": "access-control",
      "lastCheckedAt": "2026-05-03T06:00:00Z",
      "evidenceIds": ["ev_01HX8A", "ev_01HX8B"],
      "assignedTo": "analyst_jsmith",
      "dueDate": null
    },
    {
      "id": "chk_01HX7R5QPCDRLE6WXAZNI7EUF9",
      "framework": "kyc-aml",
      "controlId": "AML-04",
      "title": "Politically Exposed Person (PEP) Screening",
      "description": "All onboarded clients must be screened against PEP watchlists within 24 hours of account creation.",
      "status": "failing",
      "category": "customer-due-diligence",
      "lastCheckedAt": "2026-05-03T06:00:00Z",
      "evidenceIds": [],
      "assignedTo": "compliance_team",
      "dueDate": "2026-05-15"
    }
  ],
  "meta": { "total": 72, "passing": 63, "failing": 8, "notApplicable": 1 }
}`}</pre>
      </div>

      {/* POST /api/compliance/evidence */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="POST" />
          <code className="text-white font-mono text-base">/api/compliance/evidence</code>
        </div>
        <p className="text-slate-400">Upload an evidence artifact and link it to one or more compliance checks. Supports PDF, CSV, XLSX, PNG, and JSON files up to 50 MB. Files are stored with immutable checksums for audit integrity.</p>
        <p className="text-slate-500 text-sm">Content-Type: <code className="bg-white/10 px-1 rounded text-slate-300">multipart/form-data</code></p>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Form Fields</h3>
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
              <tr><td className="py-2 pr-4 font-mono text-green-300">file</td><td className="py-2 pr-4 text-slate-400">File</td><td className="py-2">The evidence file (required)</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">checkIds</td><td className="py-2 pr-4 text-slate-400">string[]</td><td className="py-2">Compliance check IDs to link to (required)</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">title</td><td className="py-2 pr-4 text-slate-400">string</td><td className="py-2">Human-readable evidence title (required)</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">description</td><td className="py-2 pr-4 text-slate-400">string</td><td className="py-2">Context and provenance of the evidence</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">periodStart</td><td className="py-2 pr-4 text-slate-400">ISO 8601</td><td className="py-2">Start of the evidence coverage period</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-green-300">periodEnd</td><td className="py-2 pr-4 text-slate-400">ISO 8601</td><td className="py-2">End of the evidence coverage period</td></tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response — 201 Created</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": {
    "id": "ev_01HX8C7KPQZNRM4BDWTYFVX3G2",
    "title": "Q1 2026 SOC2 Access Review Screenshot",
    "fileName": "access-review-q1-2026.pdf",
    "fileSize": 284672,
    "mimeType": "application/pdf",
    "sha256": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
    "checkIds": ["chk_01HX7R4NPBCQKF5VWZYMJ6DTE8"],
    "uploadedBy": "analyst_jsmith",
    "periodStart": "2026-01-01",
    "periodEnd": "2026-03-31",
    "createdAt": "2026-05-03T10:14:00Z"
  }
}`}</pre>
      </div>

      {/* GET /api/compliance/reports */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="GET" />
          <code className="text-white font-mono text-base">/api/compliance/reports</code>
        </div>
        <p className="text-slate-400">Lists all previously generated compliance reports. Reports are retained for 7 years per audit requirements.</p>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": [
    {
      "id": "rpt_01HX9ZPMBVWK4RNTDCE7YQFJ3H",
      "title": "SOC 2 Type II Readiness Report — Q1 2026",
      "framework": "soc2",
      "status": "completed",
      "format": "pdf",
      "fileSizeBytes": 1482752,
      "generatedAt": "2026-04-01T09:00:00Z",
      "generatedBy": "compliance_team",
      "downloadUrl": "/api/compliance/reports/rpt_01HX9ZPMBVWK4RNTDCE7YQFJ3H/download",
      "expiresAt": "2033-04-01T09:00:00Z"
    }
  ],
  "meta": { "total": 14 }
}`}</pre>
      </div>

      {/* GET /api/compliance/reports/:id */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="GET" />
          <code className="text-white font-mono text-base">/api/compliance/reports/:id</code>
        </div>
        <p className="text-slate-400">Returns a signed, time-limited download URL for the report. The URL is valid for 15 minutes. Add <code className="bg-white/10 px-1 rounded font-mono text-sm">?download=true</code> to receive the file directly as an attachment.</p>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": {
    "id": "rpt_01HX9ZPMBVWK4RNTDCE7YQFJ3H",
    "downloadUrl": "https://cdn.gem-enterprise.io/reports/rpt_01HX9Z...?sig=abc&expires=1746364800",
    "urlExpiresAt": "2026-05-03T10:30:00Z"
  }
}`}</pre>
      </div>

      {/* KYC / AML Note */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 space-y-2">
        <h3 className="text-blue-300 font-semibold text-sm uppercase tracking-wide">KYC / AML Compliance</h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          KYC and AML checks run automatically on client onboarding events. They screen against OFAC SDN, EU consolidated sanctions lists, FATF high-risk jurisdictions, and PEP databases. Manual re-screening can be triggered via <code className="bg-white/10 px-1 rounded font-mono">POST /api/compliance/checks/:id/run</code>. All screening results are retained as immutable evidence records.
        </p>
      </div>

      {/* Error Codes */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Error Codes</h2>
        <div className="bg-white/5 rounded-xl border border-white/10 px-4 divide-y divide-white/5 text-sm">
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">400</code><span className="text-slate-400">Invalid request parameters or unsupported file format</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">401</code><span className="text-slate-400">Missing or invalid Bearer token</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">403</code><span className="text-slate-400">Insufficient role — analyst or higher required</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">404</code><span className="text-slate-400">Check, evidence, or report not found</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">413</code><span className="text-slate-400">Evidence file exceeds 50 MB size limit</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">429</code><span className="text-slate-400">Rate limit exceeded — report generation is limited to 10/hour per org</span></div>
        </div>
      </div>

    </div>
  )
}
