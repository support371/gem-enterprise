import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
);

export const authUnavailableReason = isSupabaseConfigured
  ? null
  : "Missing Supabase configuration. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in your environment.";

if (authUnavailableReason) {
  console.warn(`[supabase] ${authUnavailableReason}`);
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = isSupabaseConfigured
  ? createClient<Database>(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;
