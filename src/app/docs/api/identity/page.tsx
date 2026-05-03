import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Identity & Access API — GEM Enterprise Docs',
  description: 'Complete reference for the Identity and Access Management API endpoints.',
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

function EndpointRow({ method, path, description, adminOnly }: { method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; path: string; description: string; adminOnly?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <MethodBadge method={method} />
      <code className="text-slate-200 text-sm font-mono flex-1">{path}</code>
      <div className="flex items-center gap-2 shrink-0">
        {adminOnly && (
          <span className="hidden sm:inline-flex font-mono text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">admin</span>
        )}
        <span className="text-slate-400 text-sm text-right hidden sm:block">{description}</span>
      </div>
    </div>
  )
}

export default function IdentityAccessAPIPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-white">Identity &amp; Access API</h1>
          <span className="inline-flex items-center gap-1 font-mono text-xs bg-slate-500/20 text-slate-300 px-2 py-0.5 rounded border border-white/10">
            15 endpoints
          </span>
        </div>
        <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
          Manage users, roles, and authentication for your organization. Invite team members, enforce role-based access control, and integrate with your identity provider via SAML 2.0 or OIDC.
        </p>
        <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-4 py-2 w-fit">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
          All endpoints require a valid Bearer token. Admin-only endpoints are marked with a <span className="font-mono text-purple-400 mx-1">admin</span> badge.
        </div>
      </div>

      {/* Base URL */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Base URL</h2>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
          https://api.gem-enterprise.io/v1
        </pre>
      </div>

      {/* UserRole Enum */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">UserRole Enum</h2>
        <p className="text-slate-400 text-sm">Roles are hierarchical. A role inherits all permissions of the roles below it in this list.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-2 pr-4 text-slate-400 font-medium">Role</th>
                <th className="pb-2 text-slate-400 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 divide-y divide-white/5">
              <tr>
                <td className="py-2 pr-4"><code className="font-mono text-green-300 bg-white/5 px-2 py-0.5 rounded">internal</code></td>
                <td className="py-2">GEM platform staff only. Full unrestricted access across all tenants. Cannot be assigned via API.</td>
              </tr>
              <tr>
                <td className="py-2 pr-4"><code className="font-mono text-green-300 bg-white/5 px-2 py-0.5 rounded">super_admin</code></td>
                <td className="py-2">Organization super-administrator. Can manage all users, billing, and SSO configuration.</td>
              </tr>
              <tr>
                <td className="py-2 pr-4"><code className="font-mono text-green-300 bg-white/5 px-2 py-0.5 rounded">admin</code></td>
                <td className="py-2">Organization administrator. Can invite and manage users, configure webhooks, and access all API features.</td>
              </tr>
              <tr>
                <td className="py-2 pr-4"><code className="font-mono text-green-300 bg-white/5 px-2 py-0.5 rounded">analyst</code></td>
                <td className="py-2">Security analyst. Can read and write threats, assets, and compliance checks. Cannot manage users.</td>
              </tr>
              <tr>
                <td className="py-2 pr-4"><code className="font-mono text-green-300 bg-white/5 px-2 py-0.5 rounded">client</code></td>
                <td className="py-2">Read-only access to reports and compliance status relevant to their linked client profile.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Endpoint Index */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Endpoints</h2>
        <div className="bg-white/5 rounded-xl border border-white/10 px-4 divide-y divide-white/5">
          <EndpointRow method="GET"    path="/api/users"                   description="List all users" adminOnly />
          <EndpointRow method="GET"    path="/api/users/me"                description="Get current user" />
          <EndpointRow method="PATCH"  path="/api/users/me"                description="Update current user profile" />
          <EndpointRow method="POST"   path="/api/users/invite"            description="Invite a new user" adminOnly />
          <EndpointRow method="GET"    path="/api/users/:id"               description="Get user by ID" adminOnly />
          <EndpointRow method="PATCH"  path="/api/users/:id/role"          description="Change user role" adminOnly />
          <EndpointRow method="POST"   path="/api/users/:id/suspend"       description="Suspend a user account" adminOnly />
          <EndpointRow method="POST"   path="/api/users/:id/unsuspend"     description="Reactivate a suspended user" adminOnly />
          <EndpointRow method="DELETE" path="/api/users/:id"               description="Permanently deactivate user" adminOnly />
          <EndpointRow method="POST"   path="/api/auth/login"              description="Authenticate and get token" />
          <EndpointRow method="POST"   path="/api/auth/logout"             description="Revoke current session token" />
          <EndpointRow method="POST"   path="/api/auth/refresh"            description="Refresh an expiring token" />
          <EndpointRow method="POST"   path="/api/auth/mfa/enroll"         description="Enroll in MFA" />
          <EndpointRow method="POST"   path="/api/auth/mfa/verify"         description="Verify an MFA code" />
          <EndpointRow method="DELETE" path="/api/auth/mfa"                description="Remove MFA enrollment" adminOnly />
        </div>
      </div>

      {/* POST /api/auth/login */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="POST" />
          <code className="text-white font-mono text-base">/api/auth/login</code>
        </div>
        <p className="text-slate-400">Authenticates a user with email and password credentials. Returns a short-lived access token (15 min) and a long-lived refresh token (30 days). If the account has MFA enabled, an <code className="bg-white/10 px-1 rounded font-mono text-sm">mfa_challenge_id</code> is returned instead — submit it to <code className="bg-white/10 px-1 rounded font-mono text-sm">POST /api/auth/mfa/verify</code>.</p>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Request Body</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "email": "jane.smith@example.com",
  "password": "••••••••••••"
}`}</pre>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response — 200 OK (no MFA)</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c3JfMDFIWDJBIiwicm9sZSI6ImFuYWx5c3QiLCJleHAiOjE3NDYzNjQ4MDB9...",
    "refreshToken": "rt_01HX2BZKPQNRYMTCDFVWEXA9G7",
    "expiresIn": 900,
    "tokenType": "Bearer",
    "user": {
      "id": "usr_01HX2AZMQPNK8YWRTJBF3CVD4E",
      "email": "jane.smith@example.com",
      "name": "Jane Smith",
      "role": "analyst",
      "mfaEnabled": false
    }
  }
}`}</pre>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response — 200 OK (MFA required)</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": {
    "mfaRequired": true,
    "mfaChallengeId": "mfa_01HX4PQKZNRWTCBDYFMVEX3G8",
    "mfaMethod": "totp",
    "expiresAt": "2026-05-03T10:20:00Z"
  }
}`}</pre>
      </div>

      {/* POST /api/users/invite */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="POST" />
          <code className="text-white font-mono text-base">/api/users/invite</code>
          <span className="font-mono text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">admin</span>
        </div>
        <p className="text-slate-400">Sends an email invitation to a new user. The invite link expires after 72 hours. Requires <code className="bg-white/10 px-1 rounded font-mono text-sm">admin</code> role or higher.</p>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Request Body</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "email": "new.user@example.com",
  "name": "Alex Johnson",
  "role": "analyst",
  "sendWelcomeEmail": true,
  "metadata": {
    "department": "Security Operations"
  }
}`}</pre>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response — 201 Created</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": {
    "inviteId": "inv_01HX5QTNZBCWYP4RDMGVKXFEJ7",
    "email": "new.user@example.com",
    "role": "analyst",
    "status": "pending",
    "invitedBy": "admin_jdoe",
    "expiresAt": "2026-05-06T10:00:00Z"
  }
}`}</pre>
      </div>

      {/* PATCH /api/users/:id/role */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="PATCH" />
          <code className="text-white font-mono text-base">/api/users/:id/role</code>
          <span className="font-mono text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">admin</span>
        </div>
        <p className="text-slate-400">Changes the role of an existing user. You cannot elevate a user to a role higher than your own. Role changes take effect immediately on the next token refresh.</p>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Request Body</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "role": "admin",
  "reason": "Promoted to team lead — approved by CISO on 2026-05-01"
}`}</pre>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response — 200 OK</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": {
    "id": "usr_01HX2AZMQPNK8YWRTJBF3CVD4E",
    "email": "jane.smith@example.com",
    "role": "admin",
    "previousRole": "analyst",
    "roleChangedAt": "2026-05-03T10:30:00Z",
    "roleChangedBy": "usr_01HX1BKPQNR"
  }
}`}</pre>
      </div>

      {/* GET /api/users/me */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="GET" />
          <code className="text-white font-mono text-base">/api/users/me</code>
        </div>
        <p className="text-slate-400">Returns the profile of the currently authenticated user, including their role, permissions, and MFA status.</p>

        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`{
  "data": {
    "id": "usr_01HX2AZMQPNK8YWRTJBF3CVD4E",
    "email": "jane.smith@example.com",
    "name": "Jane Smith",
    "role": "analyst",
    "permissions": [
      "threats:read", "threats:write",
      "assets:read", "assets:write",
      "compliance:read", "analytics:read"
    ],
    "mfaEnabled": true,
    "mfaMethod": "totp",
    "lastLoginAt": "2026-05-03T09:01:00Z",
    "createdAt": "2025-09-15T12:00:00Z"
  }
}`}</pre>
      </div>

      {/* DELETE /api/users/:id */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="DELETE" />
          <code className="text-white font-mono text-base">/api/users/:id</code>
          <span className="font-mono text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">admin</span>
        </div>
        <p className="text-slate-400">Permanently deactivates a user account and revokes all active sessions and API tokens. This action is irreversible. The user record is retained for audit purposes. Requires <code className="bg-white/10 px-1 rounded font-mono text-sm">super_admin</code> role to delete another admin.</p>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-300">
          Deactivating a user immediately invalidates all their active tokens. If they are running automated workflows with API keys, those will stop working immediately.
        </div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response — 204 No Content</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`// No response body`}</pre>
      </div>

      {/* POST /api/auth/logout */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MethodBadge method="POST" />
          <code className="text-white font-mono text-base">/api/auth/logout</code>
        </div>
        <p className="text-slate-400">Revokes the current access token and its associated refresh token. Pass <code className="bg-white/10 px-1 rounded font-mono text-sm">?all=true</code> to revoke all sessions for the current user (useful after a suspected compromise).</p>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Response — 204 No Content</h3>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">{`// No response body`}</pre>
      </div>

      {/* Error Codes */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Error Codes</h2>
        <div className="bg-white/5 rounded-xl border border-white/10 px-4 divide-y divide-white/5 text-sm">
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">400</code><span className="text-slate-400">Invalid request — missing required fields or invalid enum value</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">401</code><span className="text-slate-400">Invalid credentials or expired token</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">403</code><span className="text-slate-400">Insufficient role — you cannot elevate users above your own role</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">404</code><span className="text-slate-400">User not found</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">409</code><span className="text-slate-400">User with this email already exists in the organization</span></div>
          <div className="flex gap-4 py-3"><code className="font-mono text-red-400 w-16">429</code><span className="text-slate-400">Too many login attempts — account temporarily locked for 15 minutes</span></div>
        </div>
      </div>

    </div>
  )
}
