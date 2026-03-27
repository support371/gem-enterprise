import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "manager" | "analyst" | "viewer";

const VALID_ROLES: Role[] = ["admin", "manager", "analyst", "viewer"];

interface UserRoleResult {
  role: Role | null;
  loading: boolean;
  error: Error | null;
  hasRole: (r: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
}

export function useUserRole(): UserRoleResult {
  const { user, isLoading: authLoading } = useAuth();

  const {
    data: role = null,
    isLoading: roleLoading,
    error,
  } = useQuery<Role | null, Error>({
    queryKey: ["userRole", user?.id],
    queryFn: async (): Promise<Role | null> => {
      if (!user) return null;

      if (!supabase) throw new Error("Supabase is not configured.");

      const { data, error: queryError } = await supabase
        .from("user_roles" as never)
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (queryError) {
        // Fail closed: treat any lookup error as no role
        throw new Error(queryError.message);
      }

      const fetched = (data as { role: string } | null)?.role;
      if (typeof fetched === "string" && VALID_ROLES.includes(fetched as Role)) {
        return fetched as Role;
      }
      return null;
    },
    enabled: !!user && !authLoading,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  const hasRole = useCallback((r: Role) => role === r, [role]);

  const hasAnyRole = useCallback(
    (roles: Role[]) => role !== null && roles.includes(role),
    [role]
  );

  return {
    role,
    loading: authLoading || (!!user && roleLoading),
    error: error ?? null,
    hasRole,
    hasAnyRole,
  };
}
