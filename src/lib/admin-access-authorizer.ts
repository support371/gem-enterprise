export const ADMIN_ACCESS_USER_ID = "edd388da-e547-446a-be9c-c5587a8ca914";
export const ADMIN_ACCESS_EMAIL = "admin@gemcybersecurityassist.com";
export const ADMIN_ACCESS_SQL_EDITOR_URL =
  "https://supabase.com/dashboard/project/slzdjoqpzbkwzuaexlkj/sql/new";
export const ADMIN_ACCESS_SESSION_KEY = "gem_admin_access_authorization_v1";

const REQUEST_ID_PATTERN = /^aar_[a-f0-9]{32}$/;
const SHA256_HEX_PATTERN = /^[a-f0-9]{64}$/;
const USER_ID_PATTERN = /^[a-f0-9-]{36}$/;

export interface AdminAccessAuthorization {
  token: string;
  tokenHash: string;
  requestId: string;
  expiresAt: string;
  sql: string;
}

export interface BuildAdminAccessSqlInput {
  userId?: string;
  tokenHash: string;
  requestId: string;
  expiresAt: string;
}

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function buildAdminAccessSql({
  userId = ADMIN_ACCESS_USER_ID,
  tokenHash,
  requestId,
  expiresAt,
}: BuildAdminAccessSqlInput): string {
  if (!USER_ID_PATTERN.test(userId)) {
    throw new Error("Administrator user ID is invalid.");
  }
  if (!SHA256_HEX_PATTERN.test(tokenHash)) {
    throw new Error("Administrator access token hash must be SHA-256 hex.");
  }
  if (!REQUEST_ID_PATTERN.test(requestId)) {
    throw new Error("Administrator access request ID is invalid.");
  }

  const expiry = new Date(expiresAt);
  if (!Number.isFinite(expiry.getTime())) {
    throw new Error("Administrator access expiry is invalid.");
  }

  return `insert into public.admin_access_tokens (
  user_id,
  token_hash,
  expires_at,
  request_id
) values (
  '${escapeSqlLiteral(userId)}',
  '${escapeSqlLiteral(tokenHash)}',
  '${escapeSqlLiteral(expiry.toISOString())}'::timestamptz,
  '${escapeSqlLiteral(requestId)}'
)
returning id, expires_at;`;
}

export async function generateAdminAccessAuthorization(
  lifetimeMs = 2 * 60 * 60 * 1000,
): Promise<AdminAccessAuthorization> {
  if (!globalThis.crypto?.getRandomValues || !globalThis.crypto?.subtle) {
    throw new Error("This browser does not support secure token generation.");
  }
  if (!Number.isFinite(lifetimeMs) || lifetimeMs < 5 * 60 * 1000) {
    throw new Error("Administrator access lifetime is invalid.");
  }

  const tokenBytes = new Uint8Array(48);
  const requestBytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(tokenBytes);
  globalThis.crypto.getRandomValues(requestBytes);

  const token = bytesToBase64Url(tokenBytes);
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  const tokenHash = bytesToHex(new Uint8Array(digest));
  const requestId = `aar_${bytesToHex(requestBytes)}`;
  const expiresAt = new Date(Date.now() + lifetimeMs).toISOString();

  return {
    token,
    tokenHash,
    requestId,
    expiresAt,
    sql: buildAdminAccessSql({ tokenHash, requestId, expiresAt }),
  };
}

export function serializeAdminAccessAuthorization(
  authorization: AdminAccessAuthorization,
): string {
  return JSON.stringify(authorization);
}

export function parseAdminAccessAuthorization(
  value: string | null,
): AdminAccessAuthorization | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<AdminAccessAuthorization>;
    if (
      typeof parsed.token !== "string" ||
      parsed.token.length < 40 ||
      typeof parsed.tokenHash !== "string" ||
      !SHA256_HEX_PATTERN.test(parsed.tokenHash) ||
      typeof parsed.requestId !== "string" ||
      !REQUEST_ID_PATTERN.test(parsed.requestId) ||
      typeof parsed.expiresAt !== "string" ||
      new Date(parsed.expiresAt).getTime() <= Date.now() ||
      typeof parsed.sql !== "string" ||
      parsed.sql.includes(parsed.token)
    ) {
      return null;
    }

    return parsed as AdminAccessAuthorization;
  } catch {
    return null;
  }
}
