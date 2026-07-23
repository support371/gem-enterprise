import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { TokMetricError } from "@/lib/tokmetric/security";

let cached: SupabaseClient | null = null;

/**
 * Legacy Facebook tables remain readable during migration, but the client must
 * never be constructed during module evaluation. Missing server credentials
 * fail closed at request time instead of breaking the entire Next.js build.
 */
export function getLegacyFacebookSupabase() {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRoleKey) {
    throw new TokMetricError(
      503,
      "LEGACY_FACEBOOK_STORE_NOT_CONFIGURED",
      "The legacy Facebook data store is unavailable while migration is incomplete.",
    );
  }
  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
