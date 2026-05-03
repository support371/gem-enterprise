import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Webhooks — Gem Enterprise Docs",
  description:
    "Register webhooks, subscribe to platform events, verify HMAC-SHA256 signatures, and understand the retry policy.",
};

export default function WebhooksPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-white">Webhooks</h1>
        <p className="text-slate-400 text-base leading-relaxed">
          Gem Enterprise can push real-time event notifications to any HTTPS
          endpoint you control. Webhooks remove the need to poll the API and
          allow you to react immediately to changes in KYC status, threats,
          incidents, and more.
        </p>
      </div>

      {/* Registration */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Registering a Webhook
        </h2>
        <p className="text-slate-400 text-sm">
          Send a{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">POST</code> to{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">/v2/webhooks</code> with the
          destination URL, the events to subscribe to, and a secret used for
          signature verification.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`POST /v2/webhooks
Authorization: Bearer <api-key>
Content-Type: application/json

{
  "url": "https://your-app.example.com/hooks/gem",
  "events": [
    "kyc.approved",
    "kyc.rejected",
    "alert.triggered",
    "incident.created"
  ],
  "secret": "whsec_your_random_signing_secret",
  "description": "Production event handler"
}`}
        </pre>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`{
  "id": "wh_01HXYZ1234ABCD",
  "url": "https://your-app.example.com/hooks/gem",
  "events": ["kyc.approved", "kyc.rejected", "alert.triggered", "incident.created"],
  "status": "active",
  "createdAt": "2026-05-03T10:00:00Z"
}`}
        </pre>
      </section>

      {/* Event Types */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Event Types
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Event</th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Description</th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[
                ["kyc.approved", "A KYC verification was approved for a user", "v1+"],
                ["kyc.rejected", "A KYC verification was rejected", "v1+"],
                ["ticket.created", "A new support or compliance ticket was opened", "v1+"],
                ["ticket.resolved", "An existing ticket was resolved", "v1+"],
                ["alert.triggered", "A threat alert was triggered by the rule engine", "v1+"],
                ["incident.created", "A new security incident was created", "v1+"],
                ["portfolio.updated", "Portfolio data was updated (bulk or incremental)", "v2"],
                ["document.available", "A generated document (report, export) is ready", "v2"],
              ].map(([event, desc, avail]) => (
                <tr key={event} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3 font-mono text-green-300 text-xs">{event}</td>
                  <td className="px-4 py-3 text-slate-400">{desc}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded ${
                        avail === "v2"
                          ? "bg-amber-900/40 text-amber-300 border border-amber-800"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {avail}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-slate-500 text-xs">
          Events marked <span className="text-amber-300 font-mono">v2</span> are available on
          webhooks v2 only. Pass{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">"version": "2"</code> in the
          registration payload to opt in.
        </p>
      </section>

      {/* Payload Format */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Webhook Payload Format
        </h2>
        <p className="text-slate-400 text-sm">
          Every event is delivered as a JSON POST body with a consistent
          envelope:
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`{
  "id":        "evt_01HXYZ9876EFGH",
  "type":      "kyc.approved",
  "timestamp": "2026-05-03T14:22:00Z",
  "data": {
    "user_id":    "usr_01HXYZ0001",
    "kyc_id":     "kyc_01HXYZ0002",
    "approved_at": "2026-05-03T14:21:58Z",
    "method":     "document_plus_selfie"
  }
}`}
        </pre>
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Field</th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Type</th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[
                ["id", "string", "Unique event ID — safe to use for deduplication"],
                ["type", "string", "Event type (e.g. kyc.approved)"],
                ["timestamp", "ISO 8601", "UTC time the event was generated"],
                ["data", "object", "Event-specific payload — schema varies by type"],
              ].map(([field, type, desc]) => (
                <tr key={field} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3 font-mono text-green-300 text-xs">{field}</td>
                  <td className="px-4 py-3 font-mono text-slate-400 text-xs">{type}</td>
                  <td className="px-4 py-3 text-slate-400">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Signature Verification */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Signature Verification
        </h2>
        <p className="text-slate-400 text-sm">
          Each delivery includes an{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">X-Gem-Signature</code> header
          containing an HMAC-SHA256 digest of the raw request body, signed with
          your webhook secret. Always verify this before processing the payload.
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`X-Gem-Signature: sha256=a1b2c3d4e5f6...`}
        </pre>
        <p className="text-slate-400 text-sm">Node.js verification example:</p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`import crypto from "crypto";

function verifyWebhook(
  rawBody: Buffer,
  signatureHeader: string,
  secret: string
): boolean {
  const expected = "sha256=" +
    crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

  // Use timingSafeEqual to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signatureHeader)
  );
}`}
        </pre>
      </section>

      {/* Retry Policy */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Retry Policy
        </h2>
        <p className="text-slate-400 text-sm">
          If your endpoint does not return a{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">2xx</code> response within 5
          seconds, Gem Enterprise will retry with exponential backoff:
        </p>
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Attempt</th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Delay</th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[
                ["1 (initial)", "—", "Delivered immediately"],
                ["2", "30 seconds", "First retry after failure"],
                ["3", "5 minutes", "Second retry"],
                ["4 (final)", "30 minutes", "Last attempt — event marked failed if not delivered"],
              ].map(([attempt, delay, note]) => (
                <tr key={attempt} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3 text-slate-300">{attempt}</td>
                  <td className="px-4 py-3 font-mono text-green-300 text-xs">{delay}</td>
                  <td className="px-4 py-3 text-slate-400">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-slate-400 text-sm">
          Respond quickly (within 5 s) by returning{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">200 OK</code> immediately and
          processing the event asynchronously in a background job.
        </p>
      </section>
    </main>
  );
}
