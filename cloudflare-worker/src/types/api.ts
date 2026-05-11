export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface HealthResponse {
  status: "ok" | "degraded" | "down";
  timestamp: string;
  version: string;
  environment: string;
  services: {
    d1: "ok" | "error";
    r2: "ok" | "error" | "not_configured";
    kv: "ok" | "error" | "not_configured";
  };
}

export interface ReadyResponse {
  ready: boolean;
  checks: {
    database: boolean;
    storage: boolean;
    cache: boolean;
    secrets: boolean;
  };
}

export interface VersionResponse {
  version: string;
  environment: string;
  appName: string;
  buildDate: string;
  compatibilityDate: string;
}

export interface AuditLogEntry {
  id?: string;
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
}

export interface ServiceRequestEntry {
  id?: string;
  userId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "pending_info" | "completed" | "cancelled";
  assignedTo?: string;
  metadata?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationEntry {
  id?: string;
  userId: string;
  title: string;
  message: string;
  channel: "in_app" | "email" | "sms" | "push";
  read: boolean;
  metadata?: string;
  createdAt?: string;
}
