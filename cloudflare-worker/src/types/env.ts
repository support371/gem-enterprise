export interface Env {
  // D1 Database
  DB: D1Database;

  // R2 Object Storage
  VAULT: R2Bucket;

  // KV Namespace (cache)
  CACHE: KVNamespace;

  // Queues (optional)
  NOTIFICATION_QUEUE?: Queue<NotificationPayload>;

  // Secrets (set via `wrangler secret put`)
  JWT_SECRET: string;
  CLOUDFLARE_API_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_ZONE_ID: string;

  // Non-secret vars (set in wrangler.toml [vars])
  ENVIRONMENT: string;
  APP_NAME: string;
  APP_VERSION: string;
  FRONTEND_URL: string;
  CORS_ORIGINS: string;
}

export interface NotificationPayload {
  userId: string;
  channel: "in_app" | "email" | "sms" | "push";
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export type UserRole = "client" | "analyst" | "admin" | "super_admin" | "internal";

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  kycStatus: string;
  kycApplicationId?: string;
  entitlements: string[];
  portfolioId?: string;
  organizationId?: string;
  iat?: number;
  exp?: number;
}
