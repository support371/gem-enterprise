import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Webhooks API Reference — GEM Enterprise Docs',
  description: 'Complete reference for the Webhooks API — register endpoints, manage deliveries, and verify HMAC-SHA256 signatures.',
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

export default function WebhooksAPIPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-white">Webhooks API Reference</h1>
          <span className="inline-flex items-center gap-1 font-mono text-xs bg-slate-500/20 text-slate-300 px-2 py-0.5 rounded border border-white/10">
            6 endpoints
          </span>
          <span className="inline-flex items-center font-mono text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">
            v2 available
          </span>
        </div>
        <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
          Register HTTPS endpoints to receive real-time push notifications for platform events. All deliveries are signed with HMAC-SHA256 so you can verify authenticity before processing the payload.
        </p>
        <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-4 py-2 w-fit">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
          All endpoints require a valid Bearer token in the <code className="font-mono mx-1 text-amber-300">Authorization</code> header. Requires <code className="font-mono text-amber-300">admin</code> role or higher.
        </div>
      </div>

      {/* Base URL */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Base URL</h2>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
          https://api.gem-enterprise.io/v1
        </pre>
        <p className="text-slate-500 text-sm">
          API v2 is available at <code className="font-mono bg-white/5 px-1 rounded text-slate-400">https://api.gem-enterprise.io/v2</code>. It introduces batched delivery, configurable retry backoff, and delivery priority queuing. See the v2 migration guide for details.
        </p>
      </div>

      {/* Endpoint Index */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Endpoints</h2>
        <div className="bg-white/5 rounded-xl border border-white/10 px-4 divide-y divide-white/5">
          <EndpointRow method="POST"   path="/api/webhooks"                   description="Register a webhook endpoint" />
          <EndpointRow method="GET"    path="/api/webhooks"                   description="List registered webhooks" />
          <EndpointRow method="GET"    path="/api/webhooks/:id"               description="Get a single webhook" />
          <EndpointRow method="DELETE" path="/api/webhooks/:id"               description="Unregister a webhook" />
          <EndpointRow method="POST"   path="/api/webhooks/:id/test"          description="Send a test event" />
          <EndpointRow method="GET"    path="/api/webhooks/:id/deliveries"    description="Delivery history log" />
        </div>
      </div>

      {/* POST /api/webhooks */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="POST" />
          <code className="text-white font-mono text-base">/api/webhooks</code>
        </div>
        <p className="text-slate-400">Registers a new webhook endpoint. You can subscribe to specific event types or use <code className="bg-white/10 px-1 rounded font-mono text-sm">*</code> to receive all events. A unique signing secret is generated for each webhook — store it securely and use it to verify deliveries.</p>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Request Body</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "url": "https://your-service.example.com/webhooks/gem",
  "description": "Production SIEM ingestion endpoint",
  "events": [
    "threat.detected",
    "threat.updated",
    "asset.risk_change",
    "compliance.check_failed"
  ],
  "active": true,
  "metadata": {
    "team": "soc",
    "environment": "production"
  }
}`}</pre>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response — 201 Created</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": {
    "id": "wh_01HX7QZPKTNBCMRYDVWFXJE4G8",
    "url": "https://your-service.example.com/webhooks/gem",
    "description": "Production SIEM ingestion endpoint",
    "events": [
      "threat.detected",
      "threat.updated",
      "asset.risk_change",
      "compliance.check_failed"
    ],
    "active": true,
    "signingSecret": "whsec_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    "createdAt": "2026-05-03T10:00:00Z"
  }
}`}</pre>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-sm text-amber-300">
          The <code className="bg-white/10 px-1 rounded font-mono">signingSecret</code> is only returned once at creation time. Store it securely — it cannot be retrieved again. If lost, delete and re-register the webhook.
        </div>
      </div>

      {/* GET /api/webhooks */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="GET" />
          <code className="text-white font-mono text-base">/api/webhooks</code>
        </div>
        <p className="text-slate-400">Returns all registered webhook endpoints for the organization. Signing secrets are never returned in list or get responses.</p>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": [
    {
      "id": "wh_01HX7QZPKTNBCMRYDVWFXJE4G8",
      "url": "https://your-service.example.com/webhooks/gem",
      "description": "Production SIEM ingestion endpoint",
      "events": ["threat.detected", "threat.updated", "asset.risk_change", "compliance.check_failed"],
      "active": true,
      "lastDeliveryAt": "2026-05-03T09:47:22Z",
      "lastDeliveryStatus": "success",
      "deliverySuccessRate": 99.2,
      "createdAt": "2026-05-03T10:00:00Z"
    }
  ],
  "meta": { "total": 3 }
}`}</pre>
      </div>

      {/* DELETE /api/webhooks/:id */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="DELETE" />
          <code className="text-white font-mono text-base">/api/webhooks/:id</code>
        </div>
        <p className="text-slate-400">Unregisters the webhook and stops all future deliveries immediately. In-flight deliveries that have already been dispatched will still be attempted. Delivery history is retained for 90 days.</p>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response — 204 No Content</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`// No response body`}</pre>
      </div>

      {/* POST /api/webhooks/:id/test */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="POST" />
          <code className="text-white font-mono text-base">/api/webhooks/:id/test</code>
        </div>
        <p className="text-slate-400">Sends a synthetic test event to the registered URL. This is useful to verify connectivity and signature validation in your receiving service before going live.</p>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Request Body</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "eventType": "threat.detected"
}`}</pre>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response — 200 OK</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": {
    "deliveryId": "dlv_01HX9RZKPQNBCMTYDVWFEJ4G7",
    "status": "success",
    "httpStatus": 200,
    "responseBody": "{\"received\": true}",
    "durationMs": 142
  }
}`}</pre>
      </div>

      {/* GET /api/webhooks/:id/deliveries */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="GET" />
          <code className="text-white font-mono text-base">/api/webhooks/:id/deliveries</code>
        </div>
        <p className="text-slate-400">Returns a log of all delivery attempts for this webhook, including HTTP status codes, response bodies, and retry history. GEM retries failed deliveries up to 5 times using exponential backoff.</p>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": [
    {
      "id": "dlv_01HX9RZKPQNBCMTYDVWFEJ4G7",
      "webhookId": "wh_01HX7QZPKTNBCMRYDVWFXJE4G8",
      "eventType": "threat.detected",
      "eventId": "evt_01HX9R7KPQZNBMTCDFVWEXA4G1",
      "status": "success",
      "attempt": 1,
      "httpStatus": 200,
      "durationMs": 142,
      "deliveredAt": "2026-05-03T09:47:22Z"
    },
    {
      "id": "dlv_01HX8SYKPRMBDLUXEWVGFK3H5",
      "webhookId": "wh_01HX7QZPKTNBCMRYDVWFXJE4G8",
      "eventType": "asset.risk_change",
      "eventId": "evt_01HX9S8LQRAMBNTDEGWXFYB5H2",
      "status": "failed",
      "attempt": 3,
      "httpStatus": 503,
      "error": "Service Unavailable",
      "nextRetryAt": "2026-05-03T09:55:00Z",
      "deliveredAt": "2026-05-03T09:12:00Z"
    }
  ],
  "meta": {
    "total": 1847,
    "successRate": 99.2,
    "nextCursor": "eyJpZCI6ImRsdl8wMUhYOFMifQ=="
  }
}`}</pre>
      </div>

      {/* Webhook Payload */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Webhook Payload Format</h2>
        <p className="text-slate-400">All events are delivered as HTTP POST requests with a JSON body. The payload envelope is consistent across all event types.</p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`POST https://your-service.example.com/webhooks/gem
Content-Type: application/json
X-GEM-Signature: sha256=a1b2c3d4e5f6...
X-GEM-Event: threat.detected
X-GEM-Delivery: dlv_01HX9RZKPQNBCMTYDVWFEJ4G7
X-GEM-Timestamp: 1746264442

{
  "id": "evt_01HX9R7KPQZNBMTCDFVWEXA4G1",
  "type": "threat.detected",
  "apiVersion": "2026-01-01",
  "createdAt": "2026-05-03T09:47:22Z",
  "data": {
    "threat": {
      "id": "thr_01HX4K2M9WQRZPNBCDFG3Y7V6E",
      "title": "APT-41 Financial Sector Credential Harvesting Campaign",
      "severity": "critical",
      "category": "espionage",
      "publishedAt": "2026-04-28T11:22:00Z"
    }
  },
  "organization": {
    "id": "org_01HX1ABCDEFGHIJKLMNOPQRSTU",
    "name": "Acme Financial Group"
  }
}`}</pre>
      </div>

      {/* Signature Verification */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Signature Verification (HMAC-SHA256)</h2>
        <p className="text-slate-400 leading-relaxed">
          Every delivery includes an <code className="bg-white/10 px-1 rounded font-mono text-sm">X-GEM-Signature</code> header. The signature is computed as <code className="bg-white/10 px-1 rounded font-mono text-sm">HMAC-SHA256(signingSecret, timestamp + "." + rawBody)</code> where <code className="bg-white/10 px-1 rounded font-mono text-sm">timestamp</code> is the value from the <code className="bg-white/10 px-1 rounded font-mono text-sm">X-GEM-Timestamp</code> header. Always compare using a constant-time equality function to prevent timing attacks.
        </p>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Node.js / TypeScript</h3>
          <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`import crypto from 'crypto'

function verifyGEMSignature(
  signingSecret: string,
  signature: string,    // X-GEM-Signature header value
  timestamp: string,    // X-GEM-Timestamp header value
  rawBody: string       // raw request body as string
): boolean {
  const signedPayload = \`\${timestamp}.\${rawBody}\`
  const expectedSig = crypto
    .createHmac('sha256', signingSecret)
    .update(signedPayload, 'utf8')
    .digest('hex')
  const expected = \`sha256=\${expectedSig}\`

  // Constant-time comparison to prevent timing attacks
  if (expected.length !== signature.length) return false
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  )
}`}</pre>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Python</h3>
          <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`import hmac
import hashlib

def verify_gem_signature(
    signing_secret: str,
    signature: str,
    timestamp: str,
    raw_body: str
) -> bool:
    signed_payload = f"{timestamp}.{raw_body}"
    expected = hmac.new(
        signing_secret.encode("utf-8"),
        signed_payload.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    expected_header = f"sha256={expected}"
    return hmac.compare_digest(expected_header, signature)`}</pre>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 space-y-2">
          <h3 className="text-blue-300 font-semibold text-sm uppercase tracking-wide">Replay Attack Prevention</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            We recommend rejecting deliveries where the <code className="bg-white/10 px-1 rounded font-mono">X-GEM-Timestamp</code> is more than 5 minutes old. This prevents replay attacks where a valid signed request is captured and re-sent at a later time. The timestamp is a Unix epoch integer (seconds).
          </p>
        </div>
      </div>

      {/* Retry Policy */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Retry Policy</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          A delivery is considered failed if your endpoint returns a non-2xx HTTP status code or does not respond within 10 seconds. GEM retries failed deliveries up to 5 times using exponential backoff with jitter.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-2 pr-4 text-slate-400 font-medium">Attempt</th>
                <th className="pb-2 text-slate-400 font-medium">Delay after failure</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 divide-y divide-white/5">
              <tr><td className="py-2 pr-4">1 (initial)</td><td className="py-2">Immediate</td></tr>
              <tr><td className="py-2 pr-4">2</td><td className="py-2">~5 minutes</td></tr>
              <tr><td className="py-2 pr-4">3</td><td className="py-2">~30 minutes</td></tr>
              <tr><td className="py-2 pr-4">4</td><td className="py-2">~2 hours</td></tr>
              <tr><td className="py-2 pr-4">5</td><td className="py-2">~8 hours</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-slate-500 text-sm">After 5 failed attempts, the delivery is marked as permanently failed. If a webhook endpoint fails more than 50% of deliveries over a 24-hour window, it is automatically deactivated and you will receive an email notification.</p>
      </div>

      {/* Error Codes */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Error Codes</h2>
        <div className="bg-white/5 rounded-xl border border-white/10 px-4 divide-y divide-white/5 text-sm">
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">400</code><span className="text-slate-400">Invalid URL format or unsupported event type</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">401</code><span className="text-slate-400">Missing or invalid Bearer token</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">403</code><span className="text-slate-400">Requires admin role or higher</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">404</code><span className="text-slate-400">Webhook not found</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">409</code><span className="text-slate-400">A webhook with this URL already exists</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">422</code><span className="text-slate-400">Endpoint URL is not reachable (failed connectivity check)</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">429</code><span className="text-slate-400">Rate limit exceeded — webhook registration is limited to 5/hour per org</span></div>
        </div>
      </div>

    </div>
  )
}
