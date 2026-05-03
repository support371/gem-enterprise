import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Error Codes — Gem Enterprise Docs",
  description:
    "HTTP status codes, error response format, and application-specific error codes returned by the Gem Enterprise API.",
};

export default function ErrorCodesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-white">Error Codes</h1>
        <p className="text-slate-400 text-base leading-relaxed">
          The Gem Enterprise API uses standard HTTP status codes and returns a
          consistent JSON error body on every non-2xx response. This page lists
          all status codes, the error response schema, and the application-level
          error codes you may encounter.
        </p>
      </div>

      {/* Error Response Format */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Error Response Format
        </h2>
        <p className="text-slate-400 text-sm">
          All errors share the same JSON envelope. The{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">details</code> field is
          optional and varies by error type:
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`{
  "error":   "Human-readable error message",
  "code":    "MACHINE_READABLE_CODE",
  "details": {
    "field":   "email",
    "reason":  "must be a valid email address",
    "provided": "not-an-email"
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
                ["error", "string", "A human-readable description of the error"],
                ["code", "string", "Machine-readable application error code (see below)"],
                ["details", "object | null", "Additional context — field name, constraints, etc."],
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

      {/* HTTP Status Codes */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          HTTP Status Codes
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Name</th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[
                ["400", "Bad Request", "The request body or query parameters failed validation. Check the details field for the specific field and constraint that failed."],
                ["401", "Unauthorized", "No API key was provided, or the key is invalid / revoked. Include a valid Bearer token in the Authorization header."],
                ["403", "Forbidden", "The API key is valid but does not have permission to perform this action. Check the required scope in the endpoint reference."],
                ["404", "Not Found", "The requested resource does not exist or has been deleted. Verify the ID in the path."],
                ["409", "Conflict", "The resource already exists or the operation conflicts with the current state (e.g. duplicate webhook URL)."],
                ["422", "Unprocessable Entity", "The request was well-formed but could not be processed due to semantic errors (e.g. invalid state transition)."],
                ["429", "Too Many Requests", "Rate limit exceeded. Inspect the Retry-After header and back off before retrying."],
                ["500", "Internal Server Error", "An unexpected error occurred on the server. Retry with exponential backoff; if the issue persists contact support with the request ID."],
              ].map(([status, name, meaning]) => (
                <tr key={status} className="hover:bg-slate-900/50 align-top">
                  <td className="px-4 py-3 font-mono text-xs">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        status.startsWith("4")
                          ? "bg-red-900/40 text-red-300 border border-red-800"
                          : "bg-orange-900/40 text-orange-300 border border-orange-800"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-200 font-medium whitespace-nowrap">{name}</td>
                  <td className="px-4 py-3 text-slate-400">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* App-Specific Error Codes */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Application Error Codes
        </h2>
        <p className="text-slate-400 text-sm">
          The{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">code</code> field in the
          error body contains one of the following values. Use it for
          programmatic error handling rather than parsing the message string.
        </p>
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Code</th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">HTTP Status</th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[
                ["INVALID_API_KEY", "401", "The provided API key does not match any active key in the system. Regenerate the key in the dashboard."],
                ["KYC_REQUIRED", "403", "This action requires the acting user to have a completed KYC verification on file."],
                ["INSUFFICIENT_PERMISSIONS", "403", "The API key's role does not include the scope required for this operation. Upgrade the key's permissions in Settings > API Keys."],
                ["RESOURCE_NOT_FOUND", "404", "The referenced resource ID does not exist or belongs to a different organisation."],
                ["VALIDATION_ERROR", "400", "One or more request fields failed validation. See details.field and details.reason for specifics."],
                ["DUPLICATE_RESOURCE", "409", "A resource with the same unique identifier or URL already exists."],
                ["INVALID_STATE", "422", "The requested operation is not permitted given the resource's current state."],
                ["RATE_LIMIT_EXCEEDED", "429", "The API key has exceeded its request quota. Check Retry-After and implement exponential backoff."],
                ["INTERNAL_ERROR", "500", "An unexpected server-side error. Include the request ID (X-Request-Id header) when contacting support."],
              ].map(([code, status, desc]) => (
                <tr key={code} className="hover:bg-slate-900/50 align-top">
                  <td className="px-4 py-3 font-mono text-green-300 text-xs whitespace-nowrap">{code}</td>
                  <td className="px-4 py-3 font-mono text-slate-400 text-xs">{status}</td>
                  <td className="px-4 py-3 text-slate-400">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Handling example */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Handling Errors in Code
        </h2>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`import { GemClient, GemApiError } from "@gem-enterprise/sdk";

const client = new GemClient({ apiKey: process.env.GEM_API_KEY! });

try {
  const asset = await client.assets.get("asset_unknown");
} catch (err) {
  if (err instanceof GemApiError) {
    switch (err.code) {
      case "RESOURCE_NOT_FOUND":
        console.error("Asset not found — check the ID");
        break;
      case "INVALID_API_KEY":
        console.error("Invalid API key — regenerate in the dashboard");
        break;
      case "KYC_REQUIRED":
        console.error("Complete KYC verification before proceeding");
        break;
      case "INSUFFICIENT_PERMISSIONS":
        console.error("Upgrade API key permissions:", err.details);
        break;
      case "RATE_LIMIT_EXCEEDED":
        console.error(\`Rate limited — retry in \${err.retryAfter}s\`);
        break;
      default:
        console.error(\`Unexpected error \${err.statusCode}: \${err.message}\`);
    }
  } else {
    throw err; // re-throw non-API errors
  }
}`}
        </pre>
      </section>
    </main>
  );
}
