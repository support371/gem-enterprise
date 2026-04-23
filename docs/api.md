# GEM Enterprise — API Reference

All API endpoints are implemented as Next.js Route Handlers under `app/api/`. The base URL in production is `https://gem-enterprise.com`.

---

## Table of Contents

1. [Conventions](#conventions)
2. [Authentication](#authentication)
3. [Health](#health)
4. [Auth Endpoints](#auth-endpoints)
5. [KYC Endpoints](#kyc-endpoints)
6. [User Endpoints](#user-endpoints)
7. [Notification Endpoints](#notification-endpoints)
8. [Support Endpoints](#support-endpoints)
9. [Request Endpoints](#request-endpoints)
10. [Admin Endpoints](#admin-endpoints)
11. [Contact Endpoint](#contact-endpoint)
12. [Error Responses](#error-responses)

---

## Conventions

- All request and response bodies are JSON unless otherwise noted.
- Authenticated endpoints require a valid JWT stored in an HTTP-only cookie named `gem_session`.
- Dates are ISO 8601 strings (e.g., `"2025-06-01T12:00:00.000Z"`).
- Paginated responses include `{ data: [], total: number, page: number, pageSize: number }`.
- All endpoints return standard HTTP status codes.

---

## Authentication

Protected endpoints validate the `gem_session` cookie on every request via Next.js middleware. If the cookie is absent or the JWT is expired, the middleware returns:

```json
HTTP 401 Unauthorized
{
  "error": "Unauthorized"
}
```

Admin-only endpoints additionally check `user.role === "ADMIN"`. Non-admin authenticated users receive:

```json
HTTP 403 Forbidden
{
  "error": "Forbidden"
}
```

---

## Health

### GET /api/health

Liveness check. Returns immediately without a database query.

**Auth required:** No

**Response `200 OK`**

```json
{
  "status": "ok",
  "timestamp": "2025-06-01T12:00:00.000Z"
}
```

---

### GET /api/routes

Lists all registered API route paths and their allowed HTTP methods. Useful for integration testing and service discovery.

**Auth required:** No

**Response `200 OK`**

```json
{
  "routes": [
    { "path": "/api/health", "methods": ["GET"] },
    { "path": "/api/auth/login", "methods": ["POST"] },
    { "path": "/api/auth/logout", "methods": ["POST"] },
    { "path": "/api/auth/session", "methods": ["GET"] }
  ]
}
```

---

## Auth Endpoints

### POST /api/auth/login

Authenticates a user with email and password. On success, sets an HTTP-only JWT cookie and returns the session user object.

**Auth required:** No

**Request body**

```json
{
  "email": "client@example.com",
  "password": "s3cur3p@ssw0rd"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | User's registered email address |
| `password` | string | Yes | Plaintext password |

**Response `200 OK`**

```json
{
  "user": {
    "id": "clx1abc123",
    "email": "client@example.com",
    "name": "Jane Smith",
    "role": "CLIENT",
    "kycStatus": "APPROVED"
  }
}
```

Sets cookie: `gem_session=<jwt>; HttpOnly; Secure; SameSite=Lax; Path=/`

**Response `401 Unauthorized`**

```json
{
  "error": "Invalid email or password"
}
```

---

### POST /api/auth/logout

Clears the session cookie and invalidates the current session.

**Auth required:** Yes

**Request body:** None

**Response `200 OK`**

```json
{
  "message": "Logged out successfully"
}
```

Clears cookie: `gem_session` (sets `Max-Age=0`)

---

### GET /api/auth/session

Returns the currently authenticated user's session data.

**Auth required:** Yes

**Response `200 OK`**

```json
{
  "user": {
    "id": "clx1abc123",
    "email": "client@example.com",
    "name": "Jane Smith",
    "role": "CLIENT",
    "kycStatus": "APPROVED",
    "createdAt": "2025-01-15T09:30:00.000Z"
  }
}
```

**Response `401 Unauthorized`**

```json
{
  "error": "Unauthorized"
}
```

---

## KYC Endpoints

### GET /api/kyc

Returns the KYC submission record for the currently authenticated user.

**Auth required:** Yes

**Response `200 OK`**

```json
{
  "submission": {
    "id": "kyc_abc123",
    "userId": "clx1abc123",
    "entityType": "INDIVIDUAL",
    "status": "PENDING",
    "submittedAt": "2025-03-01T10:00:00.000Z",
    "reviewedAt": null,
    "reviewedBy": null,
    "notes": null
  }
}
```

**Response `404 Not Found`** (no submission exists yet)

```json
{
  "error": "No KYC submission found"
}
```

---

### POST /api/kyc/submit

Submits a completed KYC application. The request body varies by entity type.

**Auth required:** Yes

**Request body — Individual**

```json
{
  "entityType": "INDIVIDUAL",
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "1985-04-20",
  "nationality": "GB",
  "taxResidency": "GB",
  "taxIdentificationNumber": "AB123456C",
  "address": {
    "line1": "12 Example Street",
    "line2": "Apt 4B",
    "city": "London",
    "postcode": "EC1A 1BB",
    "country": "GB"
  },
  "sourceOfFunds": "Employment income",
  "investmentExperience": "INTERMEDIATE",
  "politicallyExposedPerson": false
}
```

**Request body — Business**

```json
{
  "entityType": "BUSINESS",
  "companyName": "Acme Capital Ltd",
  "registrationNumber": "12345678",
  "incorporationCountry": "GB",
  "registeredAddress": {
    "line1": "1 Business Park",
    "city": "London",
    "postcode": "EC2A 2BB",
    "country": "GB"
  },
  "natureOfBusiness": "Investment management",
  "ultimateBeneficialOwners": [
    {
      "name": "Jane Smith",
      "ownership": 75,
      "nationality": "GB"
    }
  ]
}
```

**Request body — Trust**

```json
{
  "entityType": "TRUST",
  "trustName": "Smith Family Trust",
  "trustDeedDate": "2010-06-15",
  "jurisdiction": "GB",
  "trustees": [
    { "name": "Jane Smith", "role": "TRUSTEE" }
  ],
  "settlor": "John Smith",
  "beneficiaries": ["Jane Smith", "Tom Smith"]
}
```

**Request body — Family Office**

```json
{
  "entityType": "FAMILY_OFFICE",
  "officeName": "Smith Family Office",
  "aum": 50000000,
  "currency": "GBP",
  "jurisdiction": "GB",
  "primaryContact": {
    "name": "Jane Smith",
    "email": "jane@smithfamilyoffice.com",
    "role": "CIO"
  }
}
```

**Response `201 Created`**

```json
{
  "submission": {
    "id": "kyc_xyz789",
    "status": "PENDING",
    "submittedAt": "2025-06-01T12:00:00.000Z"
  }
}
```

**Response `409 Conflict`** (submission already exists)

```json
{
  "error": "A KYC submission already exists for this user"
}
```

---

### POST /api/kyc/documents

Uploads supporting documents for a KYC submission. Accepts `multipart/form-data`.

**Auth required:** Yes

**Content-Type:** `multipart/form-data`

**Form fields**

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | File | Yes | Document file (PDF, JPG, PNG — max 10 MB) |
| `documentType` | string | Yes | One of: `PASSPORT`, `DRIVERS_LICENSE`, `PROOF_OF_ADDRESS`, `COMPANY_REGISTRATION`, `TRUST_DEED`, `OTHER` |
| `description` | string | No | Optional human-readable description |

**Example request (curl)**

```bash
curl -X POST https://gem-enterprise.com/api/kyc/documents \
  -H "Cookie: gem_session=<token>" \
  -F "file=@passport.pdf" \
  -F "documentType=PASSPORT"
```

**Response `201 Created`**

```json
{
  "document": {
    "id": "doc_abc456",
    "documentType": "PASSPORT",
    "fileName": "passport.pdf",
    "fileSize": 204800,
    "uploadedAt": "2025-06-01T12:05:00.000Z"
  }
}
```

**Response `400 Bad Request`**

```json
{
  "error": "File size exceeds the 10 MB limit"
}
```

---

## User Endpoints

### GET /api/users/profile

Returns the full profile of the authenticated user.

**Auth required:** Yes

**Response `200 OK`**

```json
{
  "user": {
    "id": "clx1abc123",
    "email": "client@example.com",
    "name": "Jane Smith",
    "phone": "+44 7700 900000",
    "role": "CLIENT",
    "kycStatus": "APPROVED",
    "createdAt": "2025-01-15T09:30:00.000Z",
    "updatedAt": "2025-05-20T14:00:00.000Z"
  }
}
```

---

### PATCH /api/users/profile

Updates mutable profile fields for the authenticated user. Only supply the fields you wish to change.

**Auth required:** Yes

**Request body**

```json
{
  "name": "Jane A. Smith",
  "phone": "+44 7700 900001"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | No | Display name |
| `phone` | string | No | Contact phone number |

**Response `200 OK`**

```json
{
  "user": {
    "id": "clx1abc123",
    "name": "Jane A. Smith",
    "phone": "+44 7700 900001",
    "updatedAt": "2025-06-01T12:10:00.000Z"
  }
}
```

---

## Notification Endpoints

### GET /api/notifications

Returns paginated notifications for the authenticated user.

**Auth required:** Yes

**Query parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `pageSize` | number | `20` | Results per page (max 100) |
| `unreadOnly` | boolean | `false` | Filter to unread notifications only |

**Response `200 OK`**

```json
{
  "data": [
    {
      "id": "notif_001",
      "type": "KYC_APPROVED",
      "title": "Your application has been approved",
      "body": "Congratulations — your KYC application has been approved. You now have full portal access.",
      "read": false,
      "createdAt": "2025-06-01T08:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

---

### PATCH /api/notifications

Marks one or more notifications as read.

**Auth required:** Yes

**Request body**

```json
{
  "ids": ["notif_001", "notif_002"],
  "markAllRead": false
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `ids` | string[] | No | Array of notification IDs to mark as read |
| `markAllRead` | boolean | No | If `true`, marks all notifications as read (ignores `ids`) |

**Response `200 OK`**

```json
{
  "updated": 2
}
```

---

## Support Endpoints

### GET /api/support

Returns paginated support tickets for the authenticated user.

**Auth required:** Yes

**Query parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `pageSize` | number | `20` | Results per page |
| `status` | string | — | Filter by `OPEN`, `IN_PROGRESS`, or `CLOSED` |

**Response `200 OK`**

```json
{
  "data": [
    {
      "id": "ticket_001",
      "subject": "Unable to access documents",
      "status": "OPEN",
      "priority": "MEDIUM",
      "createdAt": "2025-05-28T10:00:00.000Z",
      "updatedAt": "2025-05-28T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

---

### POST /api/support

Creates a new support ticket.

**Auth required:** Yes

**Request body**

```json
{
  "subject": "Unable to access documents",
  "body": "I'm receiving a 403 error when trying to access the Documents section. My account was approved last week.",
  "priority": "MEDIUM",
  "category": "ACCESS"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `subject` | string | Yes | Short summary of the issue |
| `body` | string | Yes | Full description |
| `priority` | string | No | `LOW`, `MEDIUM`, `HIGH` (default: `MEDIUM`) |
| `category` | string | No | `ACCESS`, `BILLING`, `TECHNICAL`, `COMPLIANCE`, `OTHER` |

**Response `201 Created`**

```json
{
  "ticket": {
    "id": "ticket_002",
    "subject": "Unable to access documents",
    "status": "OPEN",
    "priority": "MEDIUM",
    "createdAt": "2025-06-01T12:00:00.000Z"
  }
}
```

---

## Request Endpoints

### GET /api/requests

Returns paginated service requests for the authenticated user.

**Auth required:** Yes

**Query parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `pageSize` | number | `20` | Results per page |
| `status` | string | — | Filter by `PENDING`, `IN_REVIEW`, `COMPLETED`, or `CANCELLED` |

**Response `200 OK`**

```json
{
  "data": [
    {
      "id": "req_001",
      "type": "REDEMPTION",
      "status": "PENDING",
      "amount": 50000,
      "currency": "GBP",
      "createdAt": "2025-05-30T14:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

---

### POST /api/requests

Submits a new service request.

**Auth required:** Yes

**Request body**

```json
{
  "type": "REDEMPTION",
  "amount": 50000,
  "currency": "GBP",
  "portfolioId": "port_abc123",
  "notes": "Please process by end of month"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | string | Yes | `REDEMPTION`, `SUBSCRIPTION`, `REBALANCE`, `WITHDRAWAL`, `OTHER` |
| `amount` | number | No | Monetary amount (required for financial request types) |
| `currency` | string | No | ISO 4217 currency code (default: `GBP`) |
| `portfolioId` | string | No | Target portfolio ID |
| `notes` | string | No | Additional instructions |

**Response `201 Created`**

```json
{
  "request": {
    "id": "req_002",
    "type": "REDEMPTION",
    "status": "PENDING",
    "amount": 50000,
    "currency": "GBP",
    "createdAt": "2025-06-01T12:00:00.000Z"
  }
}
```

---

## Admin Endpoints

All admin endpoints require `role = ADMIN`. Non-admin requests return `403 Forbidden`.

### GET /api/admin/kyc

Returns paginated KYC submissions across all users with filtering and sorting options.

**Auth required:** Yes — Admin

**Query parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `pageSize` | number | `20` | Results per page |
| `status` | string | — | Filter by `PENDING`, `APPROVED`, `REJECTED`, `MANUAL_REVIEW` |
| `entityType` | string | — | Filter by `INDIVIDUAL`, `BUSINESS`, `TRUST`, `FAMILY_OFFICE` |
| `search` | string | — | Search by applicant name or email |
| `sortBy` | string | `submittedAt` | Sort field |
| `sortOrder` | string | `desc` | `asc` or `desc` |

**Response `200 OK`**

```json
{
  "data": [
    {
      "id": "kyc_xyz789",
      "userId": "clx1abc123",
      "userEmail": "client@example.com",
      "userName": "Jane Smith",
      "entityType": "INDIVIDUAL",
      "status": "PENDING",
      "submittedAt": "2025-06-01T10:00:00.000Z",
      "reviewedAt": null,
      "reviewedBy": null
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20
}
```

---

### PATCH /api/admin/kyc

Updates the status of a KYC submission (approve, reject, or flag for manual review).

**Auth required:** Yes — Admin

**Request body**

```json
{
  "submissionId": "kyc_xyz789",
  "action": "APPROVE",
  "notes": "All documents verified. Identity confirmed."
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `submissionId` | string | Yes | ID of the KYC submission to update |
| `action` | string | Yes | `APPROVE`, `REJECT`, or `FLAG_MANUAL_REVIEW` |
| `notes` | string | No | Internal review notes |

**Response `200 OK`**

```json
{
  "submission": {
    "id": "kyc_xyz789",
    "status": "APPROVED",
    "reviewedAt": "2025-06-01T14:30:00.000Z",
    "reviewedBy": "admin@gem-enterprise.com"
  }
}
```

---

### GET /api/admin/users

Returns a paginated list of all platform users.

**Auth required:** Yes — Admin

**Query parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `pageSize` | number | `20` | Results per page |
| `role` | string | — | Filter by `CLIENT` or `ADMIN` |
| `kycStatus` | string | — | Filter by KYC status |
| `search` | string | — | Search by name or email |

**Response `200 OK`**

```json
{
  "data": [
    {
      "id": "clx1abc123",
      "email": "client@example.com",
      "name": "Jane Smith",
      "role": "CLIENT",
      "kycStatus": "APPROVED",
      "createdAt": "2025-01-15T09:30:00.000Z",
      "lastLoginAt": "2025-06-01T08:00:00.000Z"
    }
  ],
  "total": 312,
  "page": 1,
  "pageSize": 20
}
```

---

### PATCH /api/admin/users

Updates a user's role or account status.

**Auth required:** Yes — Admin

**Request body**

```json
{
  "userId": "clx1abc123",
  "role": "ADMIN",
  "suspended": false
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `userId` | string | Yes | ID of the user to update |
| `role` | string | No | `CLIENT` or `ADMIN` |
| `suspended` | boolean | No | Set to `true` to suspend the account |

**Response `200 OK`**

```json
{
  "user": {
    "id": "clx1abc123",
    "role": "ADMIN",
    "suspended": false,
    "updatedAt": "2025-06-01T15:00:00.000Z"
  }
}
```

---

## Contact Endpoint

### POST /api/contact

Submits a public contact form enquiry. Does not require authentication.

**Auth required:** No

**Request body**

```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "company": "Johnson Ventures",
  "subject": "Investment enquiry",
  "message": "I would like to learn more about your real estate investment products.",
  "enquiryType": "INVESTMENT"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Sender's full name |
| `email` | string | Yes | Sender's email address |
| `company` | string | No | Sender's company or organisation |
| `subject` | string | Yes | Subject line |
| `message` | string | Yes | Message body |
| `enquiryType` | string | No | `INVESTMENT`, `PARTNERSHIP`, `PRESS`, `SUPPORT`, `OTHER` |

**Response `200 OK`**

```json
{
  "message": "Your enquiry has been received. A member of our team will be in touch shortly."
}
```

**Response `429 Too Many Requests`**

```json
{
  "error": "Too many requests. Please wait before submitting again."
}
```

---

## Error Responses

All endpoints use a consistent error response shape:

```json
{
  "error": "Human-readable error message"
}
```

### Standard HTTP Status Codes

| Status | Meaning |
|---|---|
| `200 OK` | Request succeeded |
| `201 Created` | Resource created successfully |
| `400 Bad Request` | Invalid request body or parameters |
| `401 Unauthorized` | Missing or invalid session cookie |
| `403 Forbidden` | Authenticated but insufficient permissions |
| `404 Not Found` | Requested resource does not exist |
| `409 Conflict` | Resource already exists (e.g., duplicate KYC submission) |
| `422 Unprocessable Entity` | Request body failed validation |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Unexpected server error |
